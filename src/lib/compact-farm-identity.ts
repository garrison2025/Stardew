// Fixed public reference fingerprints and dimensions, not bundled game maps.
import {restrictionMaskMap,type FarmMap} from './map-model.ts';
export const STARPLAN_REFERENCE_DIR='https://github.com/StephenFluin/starplan/tree/7ee52554a2e48f47a9d99e256830d7b1b2e5954f/public/assets/restrictions';
export const COMPACT_FARM_REFERENCES=[["regular","Standard",80,65,"e73d941298abd3ac72f2baacf2c76db49224fcf7"],["fishing","Riverland",80,65,"6500d18d237a629fb3541a1a2322552509072334"],["foraging","Forest",80,65,"9d8dbb75a2a85816770aa04b501c7916bf8d88f2"],["mining","Hill-top",80,65,"428916ab79af8ccf3417b4078166dad6aee2d572"],["combat","Wilderness",80,65,"73012427e785fe7898446711bd4d754ae903f57c"],["fourcorners","Four Corners",80,80,"535e668bec5b1841145fb64fc6f1fedcffc5c01e"],["beach","Beach",110,110,"c0c2ce701c6a431e844f17fb2e4db153baf525bd"],["ranching","Meadowlands",100,75,"30fbd8f5d094f47a0b3e5e9a99f81dc974b62f99"]] as const;
export async function identifyCompactFarm(bytes:Uint8Array){
 if(bytes.length===0||bytes.length>200000)throw Error('Invalid compact reference file size');
 const header=new TextEncoder().encode('blob '+bytes.length+String.fromCharCode(0)),payload=new Uint8Array(header.length+bytes.length);payload.set(header);payload.set(bytes,header.length);
 const digest=await crypto.subtle.digest('SHA-1',payload.buffer);
 const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 const id=COMPACT_FARM_REFERENCES.findIndex(row=>row[4]===hash);
 return id<0?undefined:{id,slug:COMPACT_FARM_REFERENCES[id][0],name:COMPACT_FARM_REFERENCES[id][1],w:COMPACT_FARM_REFERENCES[id][2],h:COMPACT_FARM_REFERENCES[id][3]};
}
export async function loadCompactFarm(bytes:Uint8Array,w:number,h:number){
 const reference=await identifyCompactFarm(bytes),raw=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
 const map=restrictionMaskMap(raw,reference?.w??w,reference?.h??h);
 return {map:reference?{...map,id:'local-starplan-'+reference.id,name:reference.name+' — pinned terrain reference'}:map,reference};
}
/** Saved labels are advisory provenance; a matching label cannot authenticate an edited backup. */
export function referenceFarmId(map:FarmMap):number|undefined{
 if(map.source!=='local'||map.restrictions?.source!=='local-restriction-mask')return undefined;
 const m=/^local-starplan-([0-7])$/.exec(map.id);if(!m)return undefined;
 const id=Number(m[1]),row=COMPACT_FARM_REFERENCES[id];
 return row[2]===map.w&&row[3]===map.h?id:undefined;
}
export function referenceFarmMismatch(map:FarmMap,saveFarmType:number|null){
 const id=referenceFarmId(map);return id!==undefined&&saveFarmType!==null&&id!==saveFarmType;
}
