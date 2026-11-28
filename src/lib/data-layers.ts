// Independent reader for Pathoschild Data Layers JSON exports. No bundled game maps.
// Status codes retain occupied/warp/tilled instead of guessing terrain materials.
export type RestrictionLayer='access'|'build'|'till';
export type TileRestrictions={schema:1;source:'local-data-layers';access:string;build:string;till:string};
const groups={
 access:{'accessible.clear':'C','accessible.occupied':'O','accessible.impassable':'N','accessible.warp':'W'},
 build:{'buildable.buildable':'B','buildable.occupied':'O','buildable.not-buildable':'N'},
 till:{'tillable.tillable':'T','tillable.tilled':'D','tillable.occupied':'O','tillable.not-tillable':'N'}
} as const;
const keys=['access','build','till'] as const;
function dimensions(w:number,h:number){if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<8||w>160||h<8||h>160)throw Error('Expected a grid of 8–160 whole tiles per dimension.');return w*h}
function coord(raw:unknown):[number,number]{
 if(typeof raw==='string'){const m=/^(\d+)\s*,\s*(\d+)$/.exec(raw);if(m)return [Number(m[1]),Number(m[2])]}
 else if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&Object.keys(raw).length===2&&Object.hasOwn(raw,'X')&&Object.hasOwn(raw,'Y')){const v=raw as {X:number;Y:number};return [v.X,v.Y]}
 throw Error('Unknown Data Layers tile coordinate format.');
}
function parseLayer(raw:unknown,w:number,h:number){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid layer JSON.');
 const v=raw as Record<string,unknown>,fields=Object.keys(v);
 const kind=keys.find(k=>fields.length===Object.keys(groups[k]).length&&fields.every(f=>Object.hasOwn(groups[k],f)));
 if(!kind)throw Error('Expected one complete Accessible, Buildable or Tillable export.');
 const codes=groups[kind] as Record<string,string>,cells=new Array<string>(dimensions(w,h)).fill('');
 for(const name of fields){
  const row=v[name] as {Id?:unknown;Tiles?:unknown};
  if(!row||row.Id!==name||!Array.isArray(row.Tiles)||row.Tiles.length>cells.length)throw Error('Invalid layer legend or tile list.');
  for(const tile of row.Tiles){
   const [x,y]=coord(tile);
   if(!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||x<0||y<0||x>=w||y>=h)throw Error('Layer coordinate outside selected grid.');
   const i=y*w+x;if(cells[i])throw Error('Duplicate layer coordinate.');cells[i]=codes[name];
  }
 }
 if(cells.some(x=>!x))throw Error('Layer does not cover the entire selected grid.');
 return {kind,mask:cells.join('')};
}
export function importDataLayers(raw:readonly unknown[],w:number,h:number):TileRestrictions{
 if(raw.length!==3)throw Error('Choose exactly three Data Layers JSON files.');
 const masks:Partial<Record<RestrictionLayer,string>>={};
 for(const layer of raw){const {kind,mask}=parseLayer(layer,w,h);if(masks[kind])throw Error('Duplicate export type.');masks[kind]=mask}
 return decodeTileRestrictions({schema:1,source:'local-data-layers',...masks},w,h);
}
export function decodeTileRestrictions(raw:unknown,w:number,h:number):TileRestrictions{
 const n=dimensions(w,h),v=raw as TileRestrictions;
 if(!v||v.schema!==1||v.source!=='local-data-layers'||typeof v.access!=='string'||typeof v.build!=='string'||typeof v.till!=='string'||v.access.length!==n||v.build.length!==n||v.till.length!==n||!/^[CONW]+$/.test(v.access)||!/^[BON]+$/.test(v.build)||!/^[TDON]+$/.test(v.till))throw Error('Invalid saved Data Layers restrictions.');
 return {schema:1,source:'local-data-layers',access:v.access,build:v.build,till:v.till}
}
export function restrictionCounts(r:TileRestrictions){return {clear:[...r.access].filter(x=>x==='C').length,buildable:[...r.build].filter(x=>x==='B').length,tillable:[...r.till].filter(x=>x==='T'||x==='D').length,occupied:[...r.access].filter(x=>x==='O').length,warp:[...r.access].filter(x=>x==='W').length}}
/** Conservative planning from a snapshot; passability is not a verified general object-placement rule. */
export function restrictionError(r:TileRestrictions,i:number,category:string){
 if(r.access[i]==='W')return 'Data Layers: warp/door tile';
 if(r.access[i]==='O')return 'Data Layers: occupied in exported snapshot';
 if(category==='Buildings')return r.build[i]==='B'?null:'Data Layers: not freely buildable';
 if(category==='Crops')return r.access[i]==='C'&&(r.till[i]==='T'||r.till[i]==='D')?null:'Data Layers: not freely tillable';
 return r.access[i]==='C'?null:'Data Layers: not freely accessible';
}
