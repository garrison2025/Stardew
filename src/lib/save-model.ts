import {blankLocalMap,placementError,dimensions,itemById,SEASONS,type FarmMap,type Plan,type Placed,type Season} from './map-model.ts';
import type {SaveProgress} from './save-progress.ts';
export type RecordKind='building'|'object'|'terrain';
export type FarmRecord={kind:RecordKind;itemId:string|null;x:number|null;y:number|null;width?:number;height?:number;reason?:string};
export type SaveSnapshot={version:string;farmType:number|null;year:number|null;day:number|null;season:Season|null;fields:number;records:FarmRecord[];farmFound:boolean;fingerprint?:string|null;progress?:SaveProgress;farmhands?:SaveProgress[]};
export const supportedVersion=(v:string)=>/^1\.6\.\d+(?:\.\d+)?$/.test(v);
// Vanilla tilemap dimensions only, independently checked against the 1.6.15 data tables.
// No claim about passability, buildability, tillability, map variants or modded terrain.
export const VANILLA_FARM_GRIDS=[
 {id:0,name:'Standard',w:80,h:65}, {id:1,name:'Riverland',w:80,h:65},
 {id:2,name:'Forest',w:80,h:65}, {id:3,name:'Hill-top',w:80,h:65},
 {id:4,name:'Wilderness',w:80,h:65}, {id:5,name:'Four Corners',w:80,h:80},
 {id:6,name:'Beach',w:110,h:110}, {id:7,name:'Meadowlands',w:100,h:75}
] as const;
export function vanillaFarmGrid(farmType:number|null){return VANILLA_FARM_GRIDS.find(g=>g.id===farmType)}
/** Prefer the documented vanilla frame; never silently truncate larger observed footprints. */
export function suggestedFarmGrid(snapshot:SaveSnapshot){
 const bounds=observedFarmBounds(snapshot),reference=supportedVersion(snapshot.version)&&snapshot.farmFound?vanillaFarmGrid(snapshot.farmType):undefined;
 if(!reference)return {w:bounds.w,h:bounds.h,reference:undefined,exceedsReference:false};
 return {w:Math.max(reference.w,bounds.w),h:Math.max(reference.h,bounds.h),reference,exceedsReference:bounds.w>reference.w||bounds.h>reference.h||bounds.outsideLimit>0};
}
export function buildingItem(type:string){const names:Record<string,string>={'Barn':'game-barn','Big Barn':'game-barn','Deluxe Barn':'game-barn','Coop':'game-coop','Big Coop':'game-coop','Deluxe Coop':'game-coop','Shed':'game-shed','Big Shed':'game-shed','Silo':'game-silo',"Fish Pond":"game-fish-pond","Mill":"game-mill","Slime Hutch":"game-slime-hutch","Stable":"game-stable","Well":"game-well","Cabin":"game-cabin","Shipping Bin":"game-shipping-bin","Pet Bowl":"game-pet-bowl"};return Object.hasOwn(names,type)?names[type]:null}
export function sprinklerItem(id:string,big:boolean){if(big||!/^\(O\)\d+$|^\d+$/.test(id))return null;const ids:Record<string,string>={'599':'basic-sprinkler','621':'quality-sprinkler','645':'iridium-sprinkler'};const k=id.replace(/^\(O\)/,'');return Object.hasOwn(ids,k)?ids[k]:null}
/** Lower bound for recognized object footprints, never a claim about the actual game map. */
export function observedFarmBounds(snapshot:SaveSnapshot){
 let w=8,h=8,eligible=0,outsideLimit=0;
 if(!supportedVersion(snapshot.version)||!snapshot.farmFound)return {w,h,eligible,outsideLimit};
 for(const r of snapshot.records){
  if(r.reason||!r.itemId||!itemById.has(r.itemId)||r.x===null||r.y===null||!Number.isSafeInteger(r.x)||!Number.isSafeInteger(r.y)||r.x<0||r.y<0)continue;
  const size=dimensions({itemId:r.itemId,rotation:0});
  if(r.kind==='building'&&(r.width!==size.w||r.height!==size.h))continue;
  if(r.x+size.w>160||r.y+size.h>160){outsideLimit++;continue}
  w=Math.max(w,r.x+size.w);h=Math.max(h,r.y+size.h);eligible++;
 }
 return {w,h,eligible,outsideLimit};
}
export type ImportIssue={index:number;kind:RecordKind;x:number|null;y:number|null;reason:string};
export function buildFarmImport(snapshot:SaveSnapshot,w:number,h:number,terrain?:FarmMap){
 if(!supportedVersion(snapshot.version)||!snapshot.farmFound)throw Error('Only recognized 1.6.x main Farm save structure can be imported in this preview.');
 if(terrain&&(terrain.source!=='local'||terrain.w!==w||terrain.h!==h))throw Error('Use a private terrain grid that matches the import dimensions.');
 const plan:Plan={schema:2,map:terrain??blankLocalMap(w,h,'Imported save — unverified terrain'),season:snapshot.season??'spring',objects:[]};
 const issues:ImportIssue[]=[];
 for(const [index,r] of snapshot.records.entries()){
 let reason=r.reason||'';
 if(!r.itemId)reason=reason||'Unsupported record';
 if(r.x===null||r.y===null||!Number.isInteger(r.x)||!Number.isInteger(r.y))reason='Missing or invalid tile coordinates';
 if(plan.objects.length>=4096)reason='Object capacity exceeded';
 if(!reason&&r.itemId&&r.x!==null&&r.y!==null){
 const o:Placed={id:'save-'+index,itemId:r.itemId,x:r.x,y:r.y,rotation:0};const d=dimensions(o);
 if(r.kind==='building'&&(r.width!==d.w||r.height!==d.h))reason='Missing or mismatched saved footprint';
 else reason=placementError(plan.map,plan.objects,o)||'';
 if(!reason){plan.objects.push(o);continue}
 }
 issues.push({index,kind:r.kind,x:r.x,y:r.y,reason});
 }
 return {plan,issues,imported:plan.objects.length,total:snapshot.records.length};
}
