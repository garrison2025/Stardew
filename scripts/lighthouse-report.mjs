import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const origin='https://stardew-67b.pages.dev';
const pages=JSON.parse(fs.readFileSync('src/config/pages.json','utf8'));
const shard=Number(process.argv[2]??0),total=Number(process.argv[3]??1);
assert.ok(Number.isInteger(shard)&&Number.isInteger(total)&&shard>=0&&shard<total&&total<=16);
const selected=pages.filter((_,i)=>i%total===shard),out='lighthouse-reports';
fs.mkdirSync(out,{recursive:true});
const median=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
const rows=[];let shardRevision;
let errors=0;
for(const page of selected){
 const runs=[],url=origin+page.path,slug=page.slug||'home';
 for(let i=0;i<3;i++){
  const output=out+'/'+slug+'-'+(i+1)+'.json';
  // Validate the deployed revision before each run to avoid mixed-version reports.
  const res=await fetch(url,{signal:AbortSignal.timeout(15000)});assert.equal(res.status,200);
  const revision=(await res.text()).match(/<meta\s+name="build-revision"\s+content="([0-9a-f]{40})"/i)?.[1];
  assert.ok(revision,'Missing deployed revision');
  if(process.env.EXPECTED_REVISION)assert.equal(revision,process.env.EXPECTED_REVISION);
  if(shardRevision)assert.equal(revision,shardRevision,'Deployment changed across shard');else shardRevision=revision;
  const p=spawnSync('lighthouse',[url,'--quiet','--no-enable-error-reporting','--only-categories=performance,accessibility,seo,best-practices','--chrome-flags=--headless --no-sandbox','--output=json','--output-path='+output],{stdio:'inherit',timeout:180000});
  if(p.status!==0||!fs.existsSync(output)){errors++;continue}
  const report=JSON.parse(fs.readFileSync(output,'utf8'));
  const after=await fetch(url,{signal:AbortSignal.timeout(15000)});assert.equal(after.status,200);assert.ok((await after.text()).includes(revision),'Deployment changed during audit');
  if(report.runtimeError){errors++;continue}
  const c=report.categories,a=report.audits;
  runs.push({revision,performance:c.performance.score*100,accessibility:c.accessibility.score*100,seo:c.seo.score*100,bestPractices:c['best-practices'].score*100,lcp:a['largest-contentful-paint']?.numericValue??null,cls:a['cumulative-layout-shift']?.numericValue??null,tbt:a['total-blocking-time']?.numericValue??null,noindex:a['is-crawlable']?.score===0});
 }
 if(runs.length!==3){rows.push({path:page.path,runs,error:'Fewer than three successful runs'});continue}
 assert.equal(new Set(runs.map(r=>r.revision)).size,1,'Mixed revisions');
 const m=Object.fromEntries(['performance','accessibility','seo','bestPractices','lcp','cls','tbt'].map(k=>[k,runs.every(r=>typeof r[k]==='number')?median(runs.map(r=>r[k])):null]));
 rows.push({path:page.path,revision:runs[0].revision,median:m,previewNoindex:runs.every(r=>r.noindex),performanceTargetMet:m.performance>=90,accessibilityTargetMet:m.accessibility>=95,productionSeoTargetMet:m.seo>=95&&!runs.some(r=>r.noindex),runs});
 console.log(JSON.stringify(rows.at(-1)));
}
fs.writeFileSync(out+'/summary-'+shard+'.json',JSON.stringify({origin,shard,total,rows,notes:'Mobile lab scores; raw SEO includes deliberate noindex. TBT is not field INP. No field p75 or production approval implied.'},null,2));
if(errors||rows.some(r=>r.error))process.exitCode=1;
