import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {spawnSync} from 'node:child_process';
import {VANILLA_FARM_GRIDS} from '../src/lib/save-model.ts';import {decodeMap} from '../src/lib/map-model.ts';
const slugs=['standard','riverland','forest','hill-top','wilderness','four-corners','beach','meadowlands'];
test('batch compiler validates all eight declared farm grids before writing local maps',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'farm-layers-')),input=join(temp,'input'),output=join(temp,'output');
 try{
  for(const g of VANILLA_FARM_GRIDS){const dir=join(input,slugs[g.id]);await mkdir(dir,{recursive:true});const Tiles=Array.from({length:g.w*g.h},(_,i)=>(i%g.w)+', '+Math.floor(i/g.w));for(const [file,Id] of [['accessible','accessible.clear'],['buildable','buildable.buildable'],['tillable','tillable.tillable']])await writeFile(join(dir,file+'.json'),JSON.stringify({[Id]:{Id,Tiles}}));}
  const run=()=>spawnSync(process.execPath,['--experimental-strip-types','scripts/compile-farm-data-layers.mjs',input,output,'1.6.15'],{encoding:'utf8'});
  const missing=join(input,'meadowlands','tillable.json'),saved=await readFile(missing);await rm(missing);assert.notEqual(run().status,0);await assert.rejects(readdir(output));await writeFile(missing,saved);
  const r=run();assert.equal(r.status,0,r.stderr);const manifest=JSON.parse(await readFile(join(output,'manifest.json'),'utf8'));assert.equal(manifest.maps.length,8);assert.equal(manifest.gridPositions,52000);assert.equal(manifest.versionVerified,false);assert.equal(manifest.rightsApproved,false);assert.equal(manifest.releaseApproved,false);
  for(const m of manifest.maps){const map=decodeMap(JSON.parse(await readFile(join(output,m.file),'utf8')));assert.equal(map.w,m.w);assert.equal(map.h,m.h);assert.equal(map.restrictions.access.length,m.w*m.h);assert.equal(m.sources.length,3);}
  assert.notEqual(run().status,0);
 }finally{await rm(temp,{recursive:true,force:true})}
});
