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
// SaveGame stores additional farm IDs as strings; 7 is the runtime custom-farm slot, not a unique saved ID.
export function parseVanillaFarmType(raw:string):number|null{
 if(raw==='MeadowlandsFarm')return 7;
 return /^[0-6]$/.test(raw)?Number(raw):null;
}
export function vanillaFarmGrid(farmType:number|null){return VANILLA_FARM_GRIDS.find(g=>g.id===farmType)}
/** Prefer the documented vanilla frame; never silently truncate larger observed footprints. */
export function suggestedFarmGrid(snapshot:SaveSnapshot){
 const bounds=observedFarmBounds(snapshot),reference=supportedVersion(snapshot.version)&&snapshot.farmFound?vanillaFarmGrid(snapshot.farmType):undefined;
 if(!reference)return {w:bounds.w,h:bounds.h,reference:undefined,exceedsReference:false};
 return {w:Math.max(reference.w,bounds.w),h:Math.max(reference.h,bounds.h),reference,exceedsReference:bounds.w>reference.w||bounds.h>reference.h||bounds.outsideLimit>0};
}
export function buildingItem(type:string){const names:Record<string,string>={'Barn':'game-barn','Big Barn':'game-barn','Deluxe Barn':'game-barn','Coop':'game-coop','Big Coop':'game-coop','Deluxe Coop':'game-coop','Shed':'game-shed','Big Shed':'game-shed','Silo':'game-silo',"Fish Pond":"game-fish-pond","Mill":"game-mill","Slime Hutch":"game-slime-hutch","Stable":"game-stable","Well":"game-well","Cabin":"game-cabin","Shipping Bin":"game-shipping-bin","Pet Bowl":"game-pet-bowl","Farmhouse":"game-farmhouse","Farm House":"game-farmhouse","Greenhouse":"game-greenhouse","Earth Obelisk":"game-earth-obelisk","Water Obelisk":"game-water-obelisk","Desert Obelisk":"game-desert-obelisk","Island Obelisk":"game-island-obelisk","Gold Clock":"game-gold-clock","Junimo Hut":"game-junimo-hut"};return Object.hasOwn(names,type)?names[type]:null}
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

/** Known saved object classes and stable IDs only. Do not use localized display names. */
const placedBigCraftables:Readonly<Record<string,string>>={"8":"scarecrow","10":"bee-house","12":"machine-keg","13":"machine-furnace","15":"machine-jar","16":"machine-cheese","17":"machine-loom","19":"machine-oil","24":"machine-mayonnaise","167":"deluxe-scarecrow","Dehydrator":"machine-dehydrator"};
export function observedObjectItem(id:string,big:string,kind:string){
 const raw=id.replace(/^\(O\)|^\(BC\)/,'');
 if(kind==='Chest'&&(big==='true'||id.startsWith('(BC)'))&&['130','BigChest','BigStoneChest','232'].includes(raw))return 'chest';
 if(kind&&kind!=='Object')return null;
 if(id.startsWith('(O)')&&big==='true'||id.startsWith('(BC)')&&big==='false')return null;
 if(big==='true'||id.startsWith('(BC)'))return Object.hasOwn(placedBigCraftables,raw)?placedBigCraftables[raw]:null;
 if(big!=='false'&&!id.startsWith('(O)'))return null;
 if(['674','675','784'].includes(raw))return 'observed-weeds';
 if(['294','295'].includes(raw))return 'observed-twig';
 if(['75','343','450','668','670','751'].includes(raw))return 'observed-stone';
 if(raw==='590')return 'observed-artifact';
 return sprinklerItem(id,false);
}

/** Factual bush collision widths from game 1.6.8; resource clumps require exact saved dimensions. */
export function observedBushItem(size:number|null){return size===0||size===3?'observed-bush-small':size===1||size===4?'observed-bush-medium':size===2?'observed-bush-large':null}
export function observedClumpItem(id:number|null,w:number|null,h:number|null){if(w!==2||h!==2)return null;return id===600?'observed-stump':id===602?'observed-log':id===672?'observed-boulder':id===622?'observed-meteorite':null}
