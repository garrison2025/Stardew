import {BUILTIN_FARMS,builtinFarmMap} from './builtin-farm-preview.ts';
import type {TileRestrictions} from './data-layers.ts';
export const REFERENCE_LAYERS=['combined','access','build','till'] as const;
export type ReferenceLayer=typeof REFERENCE_LAYERS[number];
export function compareReferenceFlags(r:TileRestrictions,w:number,h:number){
 const total=w*h;let clear=0,buildable=0,tillable=0,clearTillable=0,clearBuildable=0;
 for(let i=0;i<total;i++){
  const c=r.access[i]==='C',b=r.build[i]==='B',t=r.till[i]==='T'||r.till[i]==='D';
  clear+=Number(c);buildable+=Number(b);tillable+=Number(t);clearTillable+=Number(c&&t);clearBuildable+=Number(c&&b);
 }
 return {total,clear,buildable,tillable,clearTillable,clearBuildable};
}
export function referenceCellKind(r:TileRestrictions,i:number,layer:ReferenceLayer){
 const c=r.access[i]==='C',b=r.build[i]==='B',t=r.till[i]==='T'||r.till[i]==='D';
 if(layer==='access')return c?'access':'blocked';
 if(layer==='build')return b?'buildable':'blocked';
 if(layer==='till')return t?'tillable':'blocked';
 return !c?'blocked':t?'tillable':b?'buildable':'access';
}
export function farmReferenceSummary(name:string){
 const ref=BUILTIN_FARMS.find(v=>v.name===name);if(!ref)throw Error('Unknown farm reference');
 const map=builtinFarmMap(ref.id),r=map.restrictions!;
 return {id:ref.id,w:map.w,h:map.h,counts:compareReferenceFlags(r,map.w,map.h)};
}
export function referenceLayerPaths(name:string,layer:ReferenceLayer){
 const ref=BUILTIN_FARMS.find(v=>v.name===name);if(!ref)throw Error('Unknown farm reference');
 const m=builtinFarmMap(ref.id),r=m.restrictions!,paths:Record<string,string>={};
 for(let y=0;y<m.h;y++){let x=0;while(x<m.w){const k=referenceCellKind(r,y*m.w+x,layer);let end=x+1;while(end<m.w&&referenceCellKind(r,y*m.w+end,layer)===k)end++;paths[k]=(paths[k]??'')+'M'+x+' '+y+'h'+(end-x)+'v1h-'+(end-x)+'z';x=end}}
 return {w:m.w,h:m.h,paths,id:ref.id,counts:compareReferenceFlags(r,m.w,m.h)};
}
