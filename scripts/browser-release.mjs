import {chromium, devices, firefox, webkit} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import assert from 'node:assert/strict';

const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const pages=JSON.parse(await readFile('src/config/pages.json','utf8'));
async function serve(dir){
  const root=resolve(dir);
  const headerFile=await readFile(join(root,'_headers'),'utf8');
  const headers=Object.fromEntries(headerFile.split(/\r?\n/).filter(line=>/^\s+[^:]+:/.test(line)).map(line=>{const i=line.indexOf(':');return [line.slice(0,i).trim(),line.slice(i+1).trim()]}));
  assert.match(headers['X-Robots-Tag'],/noindex/i);
  assert.match(headers['Content-Security-Policy'],/connect-src 'self'/);
  const server=createServer(async(req,res)=>{
    try{
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      let file=resolve(root,'.'+pathname);
      if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403,headers).end();return;}
      if((await stat(file)).isDirectory())file=join(file,'index.html');
      const data=await readFile(file);
      res.writeHead(200,{...headers,'Content-Type':types[extname(file)]||'application/octet-stream'}).end(data);
    }catch{res.writeHead(404,{...headers,'Content-Type':'text/html; charset=utf-8'}).end(await readFile(join(root,'404.html')).catch(()=>Buffer.from('Not found')));}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  return {server,origin:'http://127.0.0.1:'+server.address().port};
}
await import('./audit-production-rehearsal.mjs');
const publicSite=await serve('dist');
const privateSite=await serve('dist-workspace');


async function verifyWorkspaceMigration(browser){
  const destination=await serve('dist-workspace');
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  try{
    const source=await context.newPage();
    await source.goto(privateSite.origin+'/');
    await source.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
    await source.getByLabel('Quick season',{exact:true}).selectOption('summer');
    const settings=source.getByRole('button',{name:'Toggle map settings',exact:true});
    if(await settings.getAttribute('aria-expanded')!=='true')await settings.click();
    await source.getByRole('button',{name:'Save scene locally',exact:true}).click();
    await source.getByText('Scene saved on this device',{exact:true}).waitFor();
    await source.goto(privateSite.origin+'/cooking/');
    await source.getByLabel('Progress Fried Egg',{exact:true}).selectOption('done');
    await source.getByRole('button',{name:'Save collection',exact:true}).click();
    await source.getByText('Collection saved locally',{exact:true}).waitFor();

    async function exportBackup(page, origin){
      await page.goto(origin+'/tracker/');
      await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
      const pending=page.waitForEvent('download');
      await page.getByRole('button',{name:'Export saved projects',exact:true}).click();
      const file=await pending;
      assert.equal(file.suggestedFilename(),'field-and-farm-backup.json');
      const path=await file.path();
      return {path,records:JSON.parse(await readFile(path,'utf8')).records};
    }

    const before=await exportBackup(source,privateSite.origin);
    const savedLayout=before.records['scene-plan-v2'];
    const savedCollection=before.records['collection-v1:cooking'];
    assert.equal(savedLayout.season,'summer');
    assert.ok(savedLayout.objects.length>0);
    assert.deepEqual(savedCollection.done,['Fried Egg']);

    const target=await context.newPage();
    await target.goto(destination.origin+'/cooking/');
    await target.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
    assert.equal(await target.getByLabel('Progress Fried Egg',{exact:true}).inputValue(),'missing');
    await target.goto(destination.origin+'/tracker/');
    await target.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
    const profile=target.locator('summary').filter({hasText:'Farm profile'});
    await profile.click();
    await target.getByLabel('New farm name',{exact:true}).fill('Migration test farm');
    await Promise.all([target.waitForEvent('load'),target.getByRole('button',{name:'Create farm profile',exact:true}).click()]);
    await target.getByText('Farm profile · Migration test farm',{exact:true}).waitFor();
    await target.getByLabel('Restore workspace backup',{exact:true}).setInputFiles(before.path);
    await target.getByText('Backup validated. Nothing has been changed.',{exact:true}).waitFor();
    target.once('dialog',dialog=>dialog.accept());
    await Promise.all([target.waitForEvent('load'),target.getByRole('button',{name:'Replace with validated backup',exact:true}).click()]);

    await target.goto(destination.origin+'/');
    await target.getByText('Local scene restored',{exact:true}).waitFor();
    assert.equal(await target.getByLabel('Quick season',{exact:true}).inputValue(),'summer');
    await target.goto(destination.origin+'/cooking/');
    await target.getByText('Collection restored',{exact:true}).waitFor();
    assert.equal(await target.getByLabel('Progress Fried Egg',{exact:true}).inputValue(),'done');
    const after=await exportBackup(target,destination.origin);
    assert.deepEqual(after.records['scene-plan-v2'],savedLayout);
    const sourceBook=before.records['scene-book-v1'];
    const restoredBook=after.records['scene-book-v1'];
    assert.ok(restoredBook.revision>sourceBook.revision);
    assert.deepEqual({...restoredBook,revision:sourceBook.revision},sourceBook);
    assert.deepEqual(after.records['collection-v1:cooking'],savedCollection);

    const profilePicker=target.getByLabel('Open farm profile',{exact:true});
    await target.getByText('Farm profile · Migration test farm',{exact:true}).waitFor();
    if(await profilePicker.isHidden())await target.getByText('Farm profile · Migration test farm',{exact:true}).click();
    await target.waitForFunction(()=>document.querySelector('.farm-profiles select option:checked')?.textContent==='Migration test farm');
    assert.notEqual(await profilePicker.inputValue(),'default');
    await Promise.all([target.waitForEvent('load'),profilePicker.selectOption('default')]);
    await target.goto(destination.origin+'/cooking/');
    await target.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
    assert.equal(await target.getByLabel('Progress Fried Egg',{exact:true}).inputValue(),'missing');
    await source.goto(privateSite.origin+'/cooking/');
    await source.getByText('Collection restored',{exact:true}).waitFor();
    assert.equal(await source.getByLabel('Progress Fried Egg',{exact:true}).inputValue(),'done');
    console.log('Workspace migration: actual backup export and restore across two isolated origins; exact layout and cooking progress, target farm isolation and original data verified.');
  }finally{
    await context.close();
    destination.server.close();
  }
}

async function verifyLegacyRedirect(browser){
  const requests=[];
  const redirector=createServer((req,res)=>{
    const url=new URL(req.url??'/','http://127.0.0.1');
    requests.push(url.pathname+url.search);
    res.writeHead(301,{Location:publicSite.origin+url.pathname+url.search}).end();
  });
  await new Promise(resolve=>redirector.listen(0,'127.0.0.1',resolve));
  const oldOrigin='http://127.0.0.1:'+redirector.address().port;
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  try{
    const page=await context.newPage();
    const deep='/crop-calculator/?source=old-bookmark&filter=a%2Bb';
    let response=await page.goto(oldOrigin+deep);
    assert.equal(response.status(),200);
    assert.equal(page.url(),publicSite.origin+deep);
    assert.equal(await (await response.request().redirectedFrom().response()).status(),301);
    assert.equal(await page.locator('h1').textContent(),pages.find(entry=>entry.slug==='crop-calculator').h1);

    await page.goto(publicSite.origin+'/?landscape=orchard');
    await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
    await page.locator('.map-project-menu summary').click();
    await page.getByRole('button',{name:'Share layout',exact:true}).click();
    await page.getByRole('button',{name:'Copy share link',exact:true}).click();
    const link=new URL(await page.getByLabel('Public share link').inputValue());
    const count=await page.locator('[data-scene-count]').getAttribute('data-scene-count');
    const oldShare='/?source=old-share'+link.hash;
    response=await page.goto(oldOrigin+oldShare);
    assert.equal(await (await response.request().redirectedFrom().response()).status(),301);
    assert.equal(page.url(),publicSite.origin+oldShare);
    await page.getByRole('img',{name:/Shared farm map/}).waitFor();
    await page.getByRole('button',{name:'Open shared layout',exact:true}).click();
    await page.getByText('Shared layout opened',{exact:true}).waitFor();
    await page.locator('[data-scene-count="'+count+'"]').waitFor();
    assert.deepEqual(requests,[deep,'/?source=old-share']);
    console.log('Local 301 rehearsal: the browser preserved a deep path and encoded query, inherited the layout fragment and reopened the shared farm.');
  }finally{
    await context.close();
    redirector.close();
  }
}

async function verifyMobile(browser, device, testAndroidPinch){
  const context=await browser.newContext(devices[device]);
  try{
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    await page.goto(publicSite.origin+'/?landscape=orchard');
    await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
    await page.getByRole('heading',{name:'Farm designer',exact:true}).waitFor();
    await page.getByRole('button',{name:'Toggle object library'}).tap();
    await page.getByLabel('Search objects').fill('Seedling');
    await page.getByRole('button',{name:'Place Seedling',exact:true}).tap();
    const closeCatalog=page.getByRole('button',{name:'Toggle object library'});
    if(await closeCatalog.getAttribute('aria-expanded')==='true')await closeCatalog.tap();
    await page.getByRole('button',{name:'Fit',exact:true}).tap();
    const viewport=page.locator('.map-viewport');
    const counter=page.locator('[data-scene-count]');
    const initial=Number(await counter.getAttribute('data-scene-count'));
    await viewport.scrollIntoViewIfNeeded();
    const box=await viewport.boundingBox();
    assert.ok(box,'map viewport missing');
    const scale=Number(await viewport.getAttribute('data-camera-scale'));
    const x=box.x+Number(await viewport.getAttribute('data-camera-x'))+10.5*16*scale;
    const y=box.y+Number(await viewport.getAttribute('data-camera-y'))+19.5*16*scale;
    await page.touchscreen.tap(x,y);
    await counter.and(page.locator('[data-scene-count="'+(initial+1)+'"]')).waitFor();
    await page.getByRole('button',{name:'Undo',exact:true}).tap();
    await counter.and(page.locator('[data-scene-count="'+initial+'"]')).waitFor();
    const beforeZoom=Number(await viewport.getAttribute('data-camera-scale'));
    await page.getByRole('button',{name:'Zoom in map',exact:true}).tap();
    await page.waitForFunction(before=>Number(document.querySelector('.map-viewport').dataset.cameraScale)>before,beforeZoom);

    await page.locator('.map-project-menu summary').tap();
    await page.locator('.map-project-menu[open]').waitFor({timeout:8000});
    await page.getByRole('button',{name:'Share layout',exact:true}).tap();
    await page.getByRole('button',{name:'Copy share link',exact:true}).tap();
    const shareUrl=await page.getByLabel('Public share link').inputValue();
    assert.match(new URL(shareUrl).hash,/^#layout=ff[234]\./);
    const receiver=await context.newPage();
    await receiver.goto(shareUrl);
    await receiver.getByRole('img',{name:/Shared farm map/}).waitFor();
    await receiver.getByRole('button',{name:'Open shared layout',exact:true}).tap();
    await receiver.locator('[data-scene-count="'+initial+'"]').waitFor();
    await receiver.close();

    if(testAndroidPinch){
      await viewport.scrollIntoViewIfNeeded();
      const rect=await viewport.boundingBox();
      const cx=rect.x+rect.width/2,cy=rect.y+rect.height/2;
      const cdp=await context.newCDPSession(page);
      try{
        await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
        const before=Number(await viewport.getAttribute('data-camera-scale'));
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-20,y:cy,id:1},{x:cx+20,y:cy,id:2}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-50,y:cy,id:1},{x:cx+50,y:cy,id:2}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await page.waitForFunction(old=>Number(document.querySelector('.map-viewport').dataset.cameraScale)>old,before);
        const oldX=Number(await viewport.getAttribute('data-camera-x'));
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy,id:1}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+35,y:cy,id:1}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await page.waitForFunction(old=>Number(document.querySelector('.map-viewport').dataset.cameraX)>old,oldX);
        assert.equal(Number(await counter.getAttribute('data-scene-count')),initial);
      }finally{await cdp.detach();}
    }

    await page.goto(privateSite.origin+'/tracker/');
    await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
    await page.getByLabel('Choose main save file',{exact:true}).setInputFiles({
      name:'mobile-validation.xml',mimeType:'text/xml',
      buffer:Buffer.from('<SaveGame><gameVersion>1.6.15</gameVersion><currentSeason>spring</currentSeason><player/></SaveGame>'),
    });
    await page.getByText('1.6.15',{exact:true}).first().waitFor();
    assert.deepEqual(errors,[],device+' browser runtime errors');
    console.log(device+' emulation: touch placement, undo, zoom, shared layout and local file import passed'+(testAndroidPinch?' (pinch and drag also passed)':''));
  }finally{await context.close();}
}

try{
  for(const [name,engine] of Object.entries({chromium,firefox,webkit})){
    const browser=await engine.launch({headless:true});
    try{
      if(name==='chromium'){
        await verifyWorkspaceMigration(browser);
        await verifyLegacyRedirect(browser);
        await verifyMobile(browser,'Pixel 7',true);
      }
      if(name==='webkit')await verifyMobile(browser,'iPhone 13',false);
      for(const [site,isPrivate] of [[publicSite,false],[privateSite,true]]){
        const context=await browser.newContext({viewport:{width:390,height:844}});
        const violations=[],errors=[],failedRequests=[];
        context.on('request',request=>{
          const url=new URL(request.url());
          if(['http:','https:','ws:','wss:'].includes(url.protocol)&&url.origin!==site.origin)violations.push(request.url());
          if(request.url().includes('LOCAL_ONLY_RELEASE_MARKER')||request.postData()?.includes('LOCAL_ONLY_RELEASE_MARKER'))violations.push('Private fixture marker in network request');
        });
        await context.route('**/*',async route=>{
          const url=new URL(route.request().url());
          if(['http:','https:'].includes(url.protocol)&&url.origin!==site.origin)return route.abort();
          return route.continue();
        });
        const page=await context.newPage();
        page.on('pageerror',err=>errors.push(page.url()+' · '+String(err)));
        page.on('requestfailed',req=>{if(req.resourceType()==='script')failedRequests.push(req.url()+' · '+req.failure()?.errorText)});
        for(const width of [360,390,768,1024,1440]){
          await page.setViewportSize({width,height:900});
          for(const entry of pages){
            const response=await page.goto(site.origin+entry.path,{waitUntil:'load'});
            assert.equal(response.status(),200,name+' '+entry.path);
            assert.match(response.headers()['x-robots-tag'],/noindex/i);
            await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
            if(isPrivate&&entry.slug==='tracker')await page.waitForFunction(()=>![...document.querySelectorAll('[role=status]')].some(el=>el.textContent==='Loading local progress…'));
            if(isPrivate&&entry.slug==='perfection')await page.getByText(/Local collection counts update this estimate automatically|Some collection records could not be loaded/).waitFor();
            assert.equal(await page.locator('h1').count(),1);
            assert.equal(await page.locator('h1').textContent(),entry.h1);
            assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' '+width+' '+entry.path+' overflow');
          }
        }
        await page.goto(site.origin+'/tracker/');
        await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
        if(isPrivate)await page.waitForFunction(()=>![...document.querySelectorAll('[role=status]')].some(el=>el.textContent==='Loading local progress…'));
        const unknown=page.getByRole('progressbar',{name:/progress unknown/});
        assert.ok(await unknown.count()>0,name+' unknown progress semantics');
        assert.equal(await unknown.first().getAttribute('aria-valuenow'),null);
        const contrast=await page.locator('.metric small').first().evaluate(el=>{
          function rgb(value){return value.match(/[\d.]+/g).slice(0,3).map(Number)}
          function lum(c){return c.map(v=>{const x=v/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
          const a=lum(rgb(getComputedStyle(el).color)),b=lum(rgb(getComputedStyle(el.closest('.metric')).backgroundColor));
          return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
        });
        assert.ok(contrast>=4.5,name+' metric contrast '+contrast);
        const input=page.getByLabel('Choose main save file',{exact:true});
        assert.equal(await input.count(),isPrivate?1:0,name+' save input separation');
        if(isPrivate){
          await input.setInputFiles({name:'synthetic.xml',mimeType:'text/xml',buffer:Buffer.from('<SaveGame><gameVersion>synthetic</gameVersion><privateMarker>LOCAL_ONLY_RELEASE_MARKER</privateMarker></SaveGame>')});
          await page.getByText('synthetic',{exact:true}).waitFor();
          await input.setInputFiles({name:'unsafe.xml',mimeType:'text/xml',buffer:Buffer.from('<!DOCTYPE SaveGame><SaveGame/>')});
          await page.getByText(/DTD and entity declarations/).waitFor();
          if(name==='chromium'){
            await input.setInputFiles({name:'large.xml',mimeType:'text/xml',buffer:Buffer.from('<SaveGame><!--'+'x'.repeat(11*1024*1024)+'--><gameVersion>large-synthetic</gameVersion></SaveGame>')});
            await page.getByText('large-synthetic',{exact:true}).waitFor();
          }
        }
        const missing=await page.goto(site.origin+'/nonexistent-release-acceptance-check/');
        assert.equal(missing.status(),404);
        assert.deepEqual(violations,[],name+' origin isolation');
        if(errors.length)console.error('Failed script requests:',JSON.stringify(failedRequests));
        assert.deepEqual(errors,[],name+' browser runtime errors');
        console.log(name+' '+(isPrivate?'private':'public')+': 16 routes × 5 widths, origin isolation, save input and 404 passed');
        await context.close();
      }
    }finally{await browser.close();}
  }
}finally{publicSite.server.close();privateSite.server.close();}
