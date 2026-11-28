import {decodePlan,originalMap,SEASONS,applyGreenhouseGroundTransition,type FarmMap,type Plan,type Season} from './map-model.ts';
import {BUILTIN_FARMS,builtinFarmPlan} from './builtin-farm-preview.ts';
const LEGACY='ff2.',REFERENCE='ff3.',ROOMS='ff4.',LIMIT=8000,OBJECTS=300;
const REFERENCE_REVISION='starplan-7ee5255-r14';
function sameTerrain(a:FarmMap,b:FarmMap){
 return a.id===b.id&&a.source===b.source&&a.w===b.w&&a.h===b.h&&a.tiles.length===b.tiles.length&&a.tiles.every((v,i)=>v===b.tiles[i])&&a.restrictions?.schema===b.restrictions?.schema&&a.restrictions?.source===b.restrictions?.source&&a.restrictions?.access===b.restrictions?.access&&a.restrictions?.build===b.restrictions?.build&&a.restrictions?.till===b.restrictions?.till;
}
function referenceTerrain(id:string,season:Season,moved:boolean){
 const base=builtinFarmPlan(id,season,moved);
 if(!moved)return base.map;
 const after=applyGreenhouseGroundTransition(base,{...base,objects:base.objects.filter(o=>o.itemId!=='game-greenhouse')});
 if(after.map===base.map)throw Error('No greenhouse ground transition for this farm reference.');
 return after.map;
}
function encodePayload(prefix:string,payload:unknown){
 const code=prefix+btoa(JSON.stringify(payload)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
 if(code.length>LIMIT)throw Error('Share code exceeds 8,000 characters; use JSON.');return code;
}
export function encodeShare(plan:Plan,includeRooms=false):string{
 if(plan.objects.length>OBJECTS)throw Error('Share codes support up to 300 objects; use JSON for larger plans.');
 const validated=decodePlan(plan);
 const withRooms=includeRooms&&validated.objects.some(o=>o.interior!==undefined);
 const o=validated.objects.map(o=>[o.itemId,o.x,o.y,o.rotation,...(withRooms?[o.interior??null]:[])]);
 if(plan.map.source==='original'){
  if(!sameTerrain(plan.map,validated.map))throw Error('Modified terrain cannot be shared by code. Export local JSON instead.');
  return withRooms?encodePayload(ROOMS,{r:'original-v1',m:plan.map.id,s:plan.season,g:false,o}):encodePayload(LEGACY,{m:plan.map.id,s:plan.season,o});
 }
 if(!BUILTIN_FARMS.some(f=>f.id===plan.map.id))throw Error('Private terrain cannot be shared by code. Export local JSON instead.');
 const base=referenceTerrain(plan.map.id,plan.season,false);
 let moved=false;
 if(!sameTerrain(plan.map,base)){
  let changed:FarmMap;
  try{changed=referenceTerrain(plan.map.id,plan.season,true)}catch{throw Error('Modified or private terrain cannot be shared by code. Export local JSON instead.')}
  if(!sameTerrain(plan.map,changed))throw Error('Modified or private terrain cannot be shared by code. Export local JSON instead.');
  moved=true;
 }
 // Validate all objects against exactly the terrain the recipient will reconstruct.
 decodePlan({schema:2,map:plan.map,season:plan.season,objects:plan.objects});
 return encodePayload(withRooms?ROOMS:REFERENCE,{r:REFERENCE_REVISION,m:plan.map.id,s:plan.season,g:moved,o});
}
export function decodeShare(input:string):Plan{
 const code=input.trim();if(code.length>LIMIT||!/^ff[234]\.[A-Za-z0-9_-]+$/.test(code))throw Error('Invalid or oversized layout code.');
 const rooms=code.startsWith(ROOMS);
 let v:any;try{v=JSON.parse(atob(code.slice(LEGACY.length).replaceAll('-','+').replaceAll('_','/')))}catch{throw Error('Invalid layout code encoding.')}
 if(!v||typeof v.m!=='string'||!SEASONS.includes(v.s)||!Array.isArray(v.o)||v.o.length>OBJECTS||v.o.some((a:unknown)=>!Array.isArray(a)||a.length!==(rooms?5:4)))throw Error('Invalid shared layout.');
 const reference=code.startsWith(REFERENCE)||(rooms&&v.r===REFERENCE_REVISION);
 if(reference&&(v.r!==REFERENCE_REVISION||typeof v.g!=='boolean'||!BUILTIN_FARMS.some(f=>f.id===v.m)))throw Error('Unsupported terrain reference version.');
 if(rooms&&!reference&&(v.r!=='original-v1'||v.g!==false))throw Error('Unsupported room share terrain version.');
 const map=reference?referenceTerrain(v.m,v.s,v.g):originalMap(v.m);
 return decodePlan({schema:2,map,season:v.s,objects:v.o.map((a:any[],i:number)=>({id:'shared-'+i,itemId:a[0],x:a[1],y:a[2],rotation:a[3],...(rooms&&a[4]!==null?{interior:a[4]}:{})}))});
}
