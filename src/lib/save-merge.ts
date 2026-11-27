import {observationsOf,decodeSaveObservations,SAVE_OBSERVATIONS_KEY} from './save-observations.ts';
import type {SaveProgress} from './save-progress.ts';
import {emptyCollection,decodeCollection,setCollection,type CatalogKind} from './game-collections.ts';
import {emptyMuseum,decodeMuseum,setMuseumItem} from './museum-progress.ts';
/** Positive observations only. Existing completions survive partial imports; no raw save data is persisted. */
export function saveMergeUpdates(progress:SaveProgress){
 const updates:Record<string,(old:unknown)=>unknown>={};
 const observed=observationsOf(progress);
 if(observed.monsterKills!==undefined||observed.xp!==null||observed.lifetimeEarnings!==null||observed.walnutsFound!==null||observed.walnutsBalance!==null||Object.values(observed.milestones??{}).some(n=>n!==null))updates[SAVE_OBSERVATIONS_KEY]=old=>{if(old!==undefined)decodeSaveObservations(old);return observed};
 const craft=progress.crafting;
 if(craft?.known.length)updates['collection-v1:crafting']=old=>{
  let state=old===undefined?emptyCollection('crafting'):decodeCollection('crafting',old);
  for(const name of craft.known)if(!state.done.includes(name))state=setCollection(state,name,craft.done.includes(name)?'done':'known');
  return state;
 };
 for(const [kind,observation] of Object.entries(progress.collections??{})){
  if(!observation.done.length)continue;
  if(kind==='museum')updates['museum-progress-v1']=old=>{let state=old===undefined?emptyMuseum():decodeMuseum(old);for(const id of observation.done)state=setMuseumItem(state,id,'donated');return state};
  else if(kind==='shipping'||kind==='fishing'||kind==='cooking'){const k:CatalogKind=kind;updates['collection-v1:'+k]=old=>{let state=old===undefined?emptyCollection(k):decodeCollection(k,old);for(const name of observation.done)state=setCollection(state,name,'done');return state}}
 }
 return updates;
}
