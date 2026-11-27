import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const pages=JSON.parse(await readFile('src/config/pages.json','utf8'));
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return}if((await stat(file)).isDirectory())file=join(file,'index.html');const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data)}catch{res.writeHead(404).end('Not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port,rows=[];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const profile of [{name:'desktop',width:1440,height:900,cpu:1,latency:0,down:0,up:0},{name:'mobile-lab',width:390,height:844,cpu:4,latency:80,down:200000,up:93750}]){
  for(const entry of pages){
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:1,isMobile:profile.name==='mobile-lab',hasTouch:profile.name==='mobile-lab'});
   try{
    const page=await context.newPage(),errors=[],foreign=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('request',r=>{const u=new URL(r.url());if(['http:','https:'].includes(u.protocol)&&u.origin!==origin)foreign.push(r.url())});
    await context.route('**/*',r=>{const u=new URL(r.request().url());return ['http:','https:'].includes(u.protocol)&&u.origin!==origin?r.abort():r.continue()});
    const cdp=await context.newCDPSession(page);
    await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
    if(profile.cpu>1){await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.cpu});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:profile.latency,downloadThroughput:profile.down,uploadThroughput:profile.up})}
    await page.addInitScript(()=>{
     const lab={lcp:null,cls:0,longTasks:0,totalBlocking:0};
     window.__fieldFarmLab=lab;
     const observe=(type,fn)=>{try{new PerformanceObserver(list=>{for(const e of list.getEntries())fn(e)}).observe({type,buffered:true})}catch{}};
     observe('largest-contentful-paint',e=>{lab.lcp=e.startTime});
     let first=0,last=0,session=0;
     observe('layout-shift',e=>{if(e.hadRecentInput)return;if(e.startTime-last>1000||e.startTime-first>5000){first=e.startTime;session=0}session+=e.value;last=e.startTime;lab.cls=Math.max(lab.cls,session)});
     observe('longtask',e=>{lab.longTasks++;lab.totalBlocking+=Math.max(0,e.duration-50)});
    });
    const response=await page.goto(origin+entry.path,{waitUntil:'load',timeout:60000});assert.equal(response.status(),200);
    await page.waitForFunction(()=>!document.querySelector('astro-island[ssr]'),null,{timeout:60000});
    const hydrated=await page.evaluate(()=>performance.now());
    // Short observation window, not a field metric or Lighthouse score.
    await page.waitForTimeout(1000);
    const data=await page.evaluate(()=>{const nav=performance.getEntriesByType('navigation')[0],resources=performance.getEntriesByType('resource'),paint=performance.getEntriesByName('first-contentful-paint')[0];return {...window.__fieldFarmLab,fcp:paint?.startTime??null,load:nav.loadEventEnd,resourceCount:resources.length,transferBytes:nav.transferSize+resources.reduce((n,e)=>n+e.transferSize,0)}});
    assert.deepEqual(errors,[],entry.path+' runtime errors');assert.deepEqual(foreign,[],entry.path+' foreign requests');
    const result={profile:profile.name,path:entry.path,hydratedMs:Math.round(hydrated),...data};
    rows.push(result);console.log(JSON.stringify(result));
   }finally{await context.close()}
  }
 }
 assert.equal(rows.length,pages.length*2);
 const summary=rows.filter(r=>r.profile==='mobile-lab').sort((a,b)=>b.hydratedMs-a.hydratedMs).slice(0,5).map(({path,hydratedMs,lcp,cls})=>({path,hydratedMs,lcp,cls}));
 await mkdir('test-artifacts',{recursive:true});
 await writeFile('test-artifacts/performance-lab.json',JSON.stringify({schema:1,revision:process.env.GITHUB_SHA||null,method:'Chromium cold local build, one run per route/profile; 4x CPU and 1.6Mbps down/0.75Mbps up/80ms latency mobile; 1s observation after hydration. LCP/CLS/long tasks are diagnostic, no field CWV or INP claim.',rows,slowestMobileHydration:summary},null,2));
 console.log('Performance report recorded; time thresholds are informational, not release approvals.');
}finally{await browser?.close();server.close()}
