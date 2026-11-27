import {chromium, firefox, webkit} from 'playwright';
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
try{
  for(const [name,engine] of Object.entries({chromium,firefox,webkit})){
    const browser=await engine.launch({headless:true});
    try{
      for(const [site,isPrivate] of [[publicSite,false],[privateSite,true]]){
        const context=await browser.newContext({viewport:{width:390,height:844}});
        const violations=[],errors=[];
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
        page.on('pageerror',err=>errors.push(String(err)));
        for(const width of [360,390,768,1024,1440]){
          await page.setViewportSize({width,height:900});
          for(const entry of pages){
            const response=await page.goto(site.origin+entry.path,{waitUntil:'load'});
            assert.equal(response.status(),200,name+' '+entry.path);
            assert.match(response.headers()['x-robots-tag'],/noindex/i);
            await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
            assert.equal(await page.locator('h1').count(),1);
            assert.equal(await page.locator('h1').textContent(),entry.h1);
            assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' '+width+' '+entry.path+' overflow');
          }
        }
        await page.goto(site.origin+'/tracker/');
        await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'));
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
        assert.deepEqual(errors,[],name+' browser runtime errors');
        console.log(name+' '+(isPrivate?'private':'public')+': 16 routes × 5 widths, origin isolation, save input and 404 passed');
        await context.close();
      }
    }finally{await browser.close();}
  }
}finally{publicSite.server.close();privateSite.server.close();}
