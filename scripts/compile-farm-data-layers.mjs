// Local-only maintainer pipeline. Never downloads a game map or uploads results.
import {readFile,writeFile,mkdir,realpath,readdir,stat} from 'node:fs/promises';
import {resolve,join,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {VANILLA_FARM_GRIDS} from '../src/lib/save-model.ts';
import {dataLayersMap} from '../src/lib/map-model.ts';
import {restrictionCounts} from '../src/lib/data-layers.ts';
const slugs=['standard','riverland','forest','hill-top','wilderness','four-corners','beach','meadowlands'];
const layerNames=['accessible','buildable','tillable'];
const sha=b=>createHash('sha256').update(b).digest('hex');
async function main(){
 if(process.argv.length!==5||!/^1\.6\.\d+(?:\.\d+)?$/.test(process.argv[4]))throw Error('Usage: node --experimental-strip-types scripts/compile-farm-data-layers.mjs INPUT_DIR OUTPUT_DIR DECLARED_GAME_VERSION');
 const input=await realpath(resolve(process.argv[2])),output=resolve(process.argv[3]),version=process.argv[4];
 // The caller supplies the version and farm identity. Full rectangles alone cannot prove either.
 const prepared=[];
 for(const g of VANILLA_FARM_GRIDS){
  const slug=slugs[g.id],raw=[],sources=[];
  for(const name of layerNames){
   const expected=slug+'/'+name+'.json',file=await realpath(join(input,expected)),rel=relative(input,file);
   if(!rel||rel==='..'||rel.startsWith('../')||rel.startsWith('..\\')||isAbsolute(rel)||(await stat(file)).size>4*1024*1024)throw Error('Invalid source path or size: '+expected);
   const bytes=await readFile(file);raw.push(JSON.parse(bytes.toString('utf8')));sources.push({layer:name,sha256:sha(bytes)});
  }
  const map={...dataLayersMap(raw,g.w,g.h),id:'local-'+slug,name:g.name+' — local '+version+' snapshot'};
  const serialized=JSON.stringify(map)+'\n',counts=restrictionCounts(map.restrictions);
  prepared.push({id:g.id,slug,w:g.w,h:g.h,file:slug+'.json',sha256:sha(serialized),sources,counts,serialized});
 }
 // Validate all 24 files before writing a single output. Refuse to overwrite a populated folder.
 await mkdir(output,{recursive:true});if((await readdir(output)).length)throw Error('Choose an empty output directory.');
 const manifest={schema:1,source:'user-supplied-data-layers',declaredGameVersion:version,versionVerified:false,baseTerrainVerified:false,rightsApproved:false,releaseApproved:false,gridPositions:prepared.reduce((n,r)=>n+r.w*r.h,0),maps:prepared.map(({serialized,...meta})=>meta)};
 for(const r of prepared)await writeFile(join(output,r.file),r.serialized,{flag:'wx'});
 await writeFile(join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
 console.log('Compiled '+prepared.length+' local maps, '+manifest.gridPositions+' positions and '+manifest.gridPositions*3+' layer coordinates. Import individual map JSON files in private workspace. Game version and rights are not independently verified.');
}
main().catch(e=>{console.error('Local map compilation failed: '+String(e.message));process.exitCode=1});
