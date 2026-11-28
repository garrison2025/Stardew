import {ITEM_MAP,MUSEUM_ITEMS} from './museum-data.ts';
export const DISPLAY_WIDTH=15,DISPLAY_HEIGHT=7;
export type MuseumDisplay={schema:1;width:15;height:7;slots:(string|null)[]};
export function decodeMuseumDisplay(raw:unknown):MuseumDisplay{
 const v=raw as MuseumDisplay;if(!v||v.schema!==1||v.width!==15||v.height!==7||!Array.isArray(v.slots)||v.slots.length!==105)throw Error('Invalid display sheet');
 const seen=new Set<string>();for(const id of v.slots){if(id===null)continue;if(typeof id!=='string'||!ITEM_MAP.has(id)||seen.has(id))throw Error('Unknown or duplicate museum item');seen.add(id)}
 return {schema:1,width:15,height:7,slots:[...v.slots]};
}
export function arrangeMuseum(ids:readonly string[],grouped:boolean){
 const wanted=new Set(ids);if(wanted.size!==ids.length||ids.some(id=>!ITEM_MAP.has(id)))throw Error('Invalid museum item list');
 const slots:(string|null)[]=Array(105).fill(null);
 const list=MUSEUM_ITEMS.filter(i=>wanted.has(i.id));
 if(grouped){const artifacts=list.filter(i=>i.kind==='artifact'),minerals=list.filter(i=>i.kind!=='artifact');artifacts.forEach((i,n)=>slots[n]=i.id);minerals.forEach((i,n)=>slots[45+n]=i.id)}
 else list.forEach((i,n)=>slots[n]=i.id);
 return decodeMuseumDisplay({schema:1,width:15,height:7,slots});
}
