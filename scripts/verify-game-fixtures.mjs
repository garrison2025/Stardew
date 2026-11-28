import {readFile,stat,realpath} from 'node:fs/promises';
import {dirname,resolve,relative,isAbsolute} from 'node:path';
import {readSave,readGeodeSave,readCartSave} from '../src/lib/save-parser-core.ts';
import {predictGeodes,GEODE_TYPES} from '../src/lib/geode-prediction.ts';
import {forecastCartStock} from '../src/lib/cart-stock.ts';
import {checkSnapshot,checkGeodeRows,checkCartRows,checkMachineRows} from './game-fixture-compare.mjs';
const fail=message=>{console.error(message);process.exitCode=1};
async function main(){
 if(process.argv.length!==3)throw Error('Usage: npm run audit:game-fixtures -- /private/path/observations.json');
 const manifestPath=resolve(process.argv[2]);if((await stat(manifestPath)).size>1024*1024)throw Error('Manifest exceeds 1 MiB');
 const manifest=JSON.parse(await readFile(manifestPath,'utf8')),base=await realpath(dirname(manifestPath));
 if(manifest.schema!==1||!Array.isArray(manifest.cases)||manifest.cases.length<1||manifest.cases.length>100)throw Error('Provide a schema 1 manifest with 1–100 independently observed cases');
 let passed=0,failed=0;
 for(const [i,c] of manifest.cases.entries()){
  try{
   if(!c||!['save','geode','cart','machine'].includes(c.kind)||c.version!=='1.6.15'||typeof c.observationSource!=='string'||c.observationSource.trim().length<1||c.observationSource.length>500||typeof c.save!=='string'||isAbsolute(c.save))throw Error('Invalid case');
   const filename=await realpath(resolve(base,c.save)),rel=relative(base,filename);
   if(!rel||rel==='..'||rel.startsWith('../')||rel.startsWith('..\\')||isAbsolute(rel))throw Error('Save must be within manifest folder');
   if((await stat(filename)).size>50*1024*1024)throw Error('Save too large');
   const file=new File([await readFile(filename)],'local-save');
   const snap=await readSave(file);
   if(snap.version!==c.version)throw Error('Observed version mismatch');
   let checks;
   if(c.kind==='save')checks=checkSnapshot(snap,c.checks);
   else if(c.kind==='machine')checks=checkMachineRows(snap,c.observed);
   else if(c.kind==='geode') {
    if(!GEODE_TYPES.includes(c.container)||!Array.isArray(c.observed)||c.observed.length<1||c.observed.length>100)throw Error('Invalid observed geode sequence');
    checks=checkGeodeRows(predictGeodes(await readGeodeSave(file),c.container,c.observed.length),c.observed);
   }
   else {
    const flags=c.flags??{};
    if(!flags||typeof flags!=='object'||Array.isArray(flags)||Object.entries(flags).some(([key,value])=>!['communityCenterComplete','jojaComplete','includeNightMarket','desertFestivalUnlocked'].includes(key)||typeof value!=='boolean')||flags.communityCenterComplete&&flags.jojaComplete)throw Error('Invalid cart flags');
    checks=checkCartRows(forecastCartStock({...await readCartSave(file),...flags},c.originalGuarantee??null),c.observed);
   }
   for(const check of checks){if(check.passed)passed++;else{failed++;console.error('Case '+(i+1)+' check '+check.check+' mismatch')}}
  }catch{failed++;console.error('Case '+(i+1)+' invalid or could not be evaluated; inspect locally.')}
 }
 console.log('Local fixture comparisons: '+passed+' passed, '+failed+' failed. No save content, IDs or paths emitted. This is not blanket game accuracy or release approval.');
 if(failed||!passed)process.exitCode=1;
}
main().catch(()=>fail('Fixture audit could not start. Provide a readable schema 1 manifest with local files.'));
