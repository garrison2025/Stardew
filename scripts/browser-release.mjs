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
const publicSite=await serve('dist');
const privateSite=await serve('dist-workspace');

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

    await page.locator('.map-project-menu summary').tap();
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
      if(name==='chromium')await verifyMobile(browser,'Pixel 7',true);
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

await import('./audit-production-rehearsal.mjs');
