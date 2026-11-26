import {blankLocalMap,placementError,dimensions,SEASONS,type Plan,type Placed,type Season} from './map-model.ts';
import type {SaveProgress} from './save-progress.ts';
export type RecordKind='building'|'object'|'terrain';
export type FarmRecord={kind:RecordKind;itemId:string|null;x:number|null;y:number|null;width?:number;height?:number;reason?:string};
export type SaveSnapshot={version:string;farmType:number|null;year:number|null;day:number|null;season:Season|null;fields:number;records:FarmRecord[];farmFound:boolean;progress?:SaveProgress};
export const supportedVersion=(v:string)=>/^1\.6\.\d+(?:\.\d+)?$/.test(v);
export function buildingItem(type:string){const names:Record<string,string>={'Barn':'game-barn','Big Barn':'game-barn','Deluxe Barn':'game-barn','Coop':'game-coop','Big Coop':'game-coop','Deluxe Coop':'game-coop','Shed':'game-shed','Big Shed':'game-shed','Silo':'game-silo'};return Object.hasOwn(names,type)?names[type]:null}
export function sprinklerItem(id:string,big:boolean){if(big||!/^\(O\)\d+$|^\d+$/.test(id))return null;const ids:Record<string,string>={'599':'basic-sprinkler','621':'quality-sprinkler','645':'iridium-sprinkler'};const k=id.replace(/^\(O\)/,'');return Object.hasOwn(ids,k)?ids[k]:null}
export type ImportIssue={index:number;kind:RecordKind;x:number|null;y:number|null;reason:string};
export function buildFarmImport(snapshot:SaveSnapshot,w:number,h:number){
 if(!supportedVersion(snapshot.version)||!snapshot.farmFound)throw Error('Only recognized 1.6.x main Farm save structure can be imported in this preview.');
 const plan:Plan={schema:2,map:blankLocalMap(w,h,'Imported save — unverified terrain'),season:snapshot.season??'spring',objects:[]};
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
