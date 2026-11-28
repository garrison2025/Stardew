import assert from 'node:assert/strict';
import {cp, mkdtemp, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {assertProductionPage} from './production-seo.mjs';

const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const root=await mkdtemp(join(tmpdir(),'field-farm-production-check-'));
try{
  for(const entry of ['src','public','data','scripts','package.json','astro.config.mjs','tsconfig.json']){
    await cp(resolve(entry),join(root,entry),{recursive:true});
  }
  await symlink(resolve('node_modules'),join(root,'node_modules'),process.platform==='win32'?'junction':'dir');

  const release=await readJson(join(root,'src/config/release.json'));
  const pages=await readJson(join(root,'src/config/pages.json'));
  const publicOrigin='https://fieldandfarm.example.org';
  const workspaceOrigin='https://app.fieldandfarm.example.org';
  const execute=(...args)=>spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',env:{
    ...process.env,PUBLIC_SITE_ORIGIN:publicOrigin,PUBLIC_WORKSPACE_ORIGIN:workspaceOrigin,
  }});
  const blocked=execute('scripts/build-production.mjs');
  assert.notEqual(blocked.status,0);
  assert.match(blocked.stderr,/Production approval gates remain closed/);

  // Exercise the indexable output in the disposable copy with reserved example hosts.
  Object.assign(release,{status:'production-approved',rightsApproved:true,dataApproved:true,fixturesApproved:true,serpApproved:true,gameVersions:['1.6.15']});
  for(const page of pages)Object.assign(page,{indexable:true,releaseStatus:'approved',adsEnabled:false});
  await writeFile(join(root,'src/config/release.json'),JSON.stringify(release));
  await writeFile(join(root,'src/config/pages.json'),JSON.stringify(pages));

  const build=execute('scripts/build-production.mjs');
  assert.equal(build.status,0,build.error?.message||build.stderr||build.stdout);
  const output=join(root,'dist-production');
  const sitemap=await readFile(join(output,'sitemap.xml'),'utf8');
  assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(row=>row[1]),pages.map(page=>publicOrigin+page.path));
  const robots=await readFile(join(output,'robots.txt'),'utf8');
  assert.ok(robots.includes('Sitemap: '+publicOrigin+'/sitemap.xml'));
  for(const page of pages){
    const html=await readFile(join(output,page.slug,'index.html'),'utf8');
    assertProductionPage(html,page,publicOrigin);
    assert.ok(html.includes(workspaceOrigin+page.path),page.path+' workspace link');
    assert.doesNotMatch(html,/type="file"/i);
  }
  console.log('Production rehearsal: unapproved build rejected; all 16 built pages, sitemap, robots and workspace separation verified on example origins.');
}finally{
  await rm(root,{recursive:true,force:true});
}
