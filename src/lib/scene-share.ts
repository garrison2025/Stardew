import {decodePlan,originalMap,SEASONS,type Plan} from './map-model.ts';
const PREFIX='ff2.',LIMIT=8000,OBJECTS=300;
export function encodeShare(plan:Plan):string{
 if(plan.map.source!=='original')throw Error('Only built-in original maps can be shared by code. Export private terrain as a local JSON file instead.');
 if(plan.objects.length>OBJECTS)throw Error('Share codes support up to 300 objects; use JSON for larger plans.');
 const compact={m:plan.map.id,s:plan.season,o:plan.objects.map(o=>[o.itemId,o.x,o.y,o.rotation])};
 const code=PREFIX+btoa(JSON.stringify(compact)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
 if(code.length>LIMIT)throw Error('Share code exceeds 8,000 characters; use JSON.');return code
}
export function decodeShare(input:string):Plan{
 const code=input.trim();if(code.length>LIMIT||!/^ff2\.[A-Za-z0-9_-]+$/.test(code))throw Error('Invalid or oversized layout code.');
 let v:any;try{v=JSON.parse(atob(code.slice(PREFIX.length).replaceAll('-','+').replaceAll('_','/')))}catch{throw Error('Invalid layout code encoding.')}
 if(!v||typeof v.m!=='string'||!SEASONS.includes(v.s)||!Array.isArray(v.o)||v.o.length>OBJECTS||v.o.some((a:unknown)=>!Array.isArray(a)||a.length!==4))throw Error('Invalid shared layout.');
 return decodePlan({schema:2,map:originalMap(v.m),season:v.s,objects:v.o.map((a:any[],i:number)=>({id:'shared-'+i,itemId:a[0],x:a[1],y:a[2],rotation:a[3]}))})
}
