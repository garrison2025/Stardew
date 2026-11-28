import {CATALOGS,decodeCollection,type CatalogKind} from './game-collections.ts';
import {perfection} from './game-rules.ts';
export const CHECKLIST_KINDS=['shipping','fishing','cooking','crafting'] as const;
export function collectionChecklist(kind:CatalogKind,raw:unknown){
 const state=raw===undefined?null:decodeCollection(kind,raw),done=new Set(state?.done??[]),known=new Set(state?.known??[]);
 const rows=CATALOGS[kind].map(item=>({name:item.name,hint:item.hint??'',status:done.has(item.name)?'recorded-complete' as const:known.has(item.name)?'known-not-completed' as const:'not-confirmed' as const}));
 return {loaded:state!==null,total:rows.length,confirmed:done.size,rows};
}
export function perfectionActions(observed:Record<string,number>,manual:Record<string,number>){
 const low=perfection({...observed,...manual},0);
 return low.parts.map(p=>{
  const source=Object.hasOwn(manual,p.id)?'manual' as const:Object.hasOwn(observed,p.id)?'recorded-minimum' as const:'unknown' as const;
  return {...p,source,remaining:p.max-p.n,gap:p.weight-p.score,complete:p.n===p.max};
 }).sort((a,b)=>Number(a.complete)-Number(b.complete)||b.gap-a.gap||a.name.localeCompare(b.name));
}
