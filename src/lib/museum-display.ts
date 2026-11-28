import {ITEM_MAP,MUSEUM_ITEMS} from './museum-data.ts';
import {SAVE_COLLECTION_IDS} from './save-collection-ids.ts';
import {parseSaveXml,type SaveElement} from './save-xml.ts';
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
export type MuseumPosition={id:string;x:number;y:number};
const child=(el:SaveElement|undefined,name:string)=>el?.children.find(c=>c.localName===name);
const txt=(el:SaveElement|undefined,name:string)=>child(el,name)?.textContent.trim()??'';
const coordinate=(s:string)=>/^\d{1,3}$/.test(s)&&Number(s)<=159?Number(s):null;
export function readMuseumPositions(xml:string){
 const {root}=parseSaveXml(xml);const version=txt(root,'gameVersion')||txt(child(root,'player'),'gameVersion');if(!/^1\.6\.\d+(?:\.\d+)?$/.test(version))throw Error('Use a supported 1.6.x main save.');
 const rooms=child(root,'locations')?.children.filter(c=>c.localName==='GameLocation'&&txt(c,'name')==='ArchaeologyHouse')??[];
 const pieces=rooms.length===1?child(rooms[0],'museumPieces'):undefined;
 if(!pieces||pieces.children.length>2000||['true','1'].includes(pieces.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')??''))throw Error('Museum position dictionary absent or unsupported.');
 const byTile=new Map<string,MuseumPosition|null>(),seenIds=new Set<string>(),badIds=new Set<string>();let skipped=0;
 for(const row of pieces.children){
  const key=child(child(row,'key'),'Vector2'),value=child(row,'value');const x=coordinate(txt(key,'X')),y=coordinate(txt(key,'Y')),raw=(txt(value,'string')||txt(value,'int')).replace(/^\(O\)/,'');
  const id=(SAVE_COLLECTION_IDS.museum as Record<string,string>)[raw];if(row.localName!=='item'||x===null||y===null||!id||!ITEM_MAP.has(id)){skipped++;continue}
  const k=x+','+y;if(byTile.has(k)){byTile.set(k,null);skipped++;}else byTile.set(k,{id,x,y});
  if(seenIds.has(id))badIds.add(id);seenIds.add(id);
 }
 const positions=[...byTile.values()].filter((p):p is MuseumPosition=>p!==null&&!badIds.has(p.id));
 return {version,positions,unmapped:pieces.children.length-positions.length};
}
