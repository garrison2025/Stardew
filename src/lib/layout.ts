import type {Cell} from './engine.ts';
export type Brush=Cell['kind']|'erase';
export const scenes=['meadow','autumn','winter','evening'] as const;
export type Scene=typeof scenes[number];
export type Layout={schema:1;w:number;h:number;radius:number;scene:Scene;cells:Cell[]};
export type Building={id:string;x:number;y:number;w:number;h:number};
export type NamedLayout={id:string;name:string;updatedAt:string;layout:Layout};
export function emptyLayout():Layout{return {schema:1,w:16,h:12,radius:1,scene:'meadow',cells:[]}}
export function buildings(cells:Cell[]):Building[]{
 const groups=new Map<string,Cell[]>();for(const c of cells){if(c.buildingId){const list=groups.get(c.buildingId)||[];list.push(c);groups.set(c.buildingId,list)}}
 return [...groups].map(([id,list])=>{const x=Math.min(...list.map(c=>c.x)),y=Math.min(...list.map(c=>c.y));return {id,x,y,w:Math.max(...list.map(c=>c.x))-x+1,h:Math.max(...list.map(c=>c.y))-y+1}});
}
export function decodeLayout(input:unknown):Layout{
 const legacy=Array.isArray(input);const v=(legacy?{...emptyLayout(),w:32,h:32,cells:input}:input) as Partial<Layout>|null;
 if(!v||v.schema!==1||!Number.isInteger(v.w)||!Number.isInteger(v.h)||v.w!<4||v.h!<4||v.w!>32||v.h!>32||!Array.isArray(v.cells)||v.cells.length>1024)throw Error('Invalid layout format');
 const radius=v.radius??1;if(!Number.isInteger(radius)||radius<1||radius>4)throw Error('Invalid coverage radius');
 const scene=v.scene??'meadow';if(!scenes.includes(scene))throw Error('Invalid scene');
 const seen=new Set<string>();const cells:Cell[]=[];
 for(const c of v.cells){if(!c||!Number.isInteger(c.x)||!Number.isInteger(c.y)||c.x<0||c.y<0||c.x>=v.w!||c.y>=v.h!||!['crop','sprinkler','path','building'].includes(c.kind)||seen.has(c.x+','+c.y))throw Error('Invalid or duplicate cell');seen.add(c.x+','+c.y);const id=c.buildingId;if(id!==undefined&&(c.kind!=='building'||typeof id!=='string'||!/^b-\d+-\d+-\d+-\d+$/.test(id)))throw Error('Invalid building identifier');cells.push({x:c.x,y:c.y,kind:c.kind,...(id?{buildingId:id}:{})})}
 for(const b of buildings(cells)){if(b.w>3||b.h>3||cells.filter(c=>c.buildingId===b.id).length!==b.w*b.h||b.id!=='b-'+[b.x,b.y,b.w,b.h].join('-'))throw Error('Invalid building footprint')}
 return {schema:1,w:legacy?Math.max(16,...cells.map(c=>c.x+1)):v.w!,h:legacy?Math.max(12,...cells.map(c=>c.y+1)):v.h!,radius,scene,cells};
}
export function placeBuilding(layout:Layout,x:number,y:number,w:number,h:number):Layout{
 if(![x,y,w,h].every(Number.isInteger)||w<1||h<1||w>3||h>3||x<0||y<0||x+w>layout.w||y+h>layout.h)throw Error('Building extends beyond the canvas.');
 if(layout.cells.some(c=>c.x>=x&&c.x<x+w&&c.y>=y&&c.y<y+h))throw Error('Building overlaps a placed object. Clear the footprint first.');
 const id='b-'+[x,y,w,h].join('-'),added:Cell[]=[];
 for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)added.push({x:i,y:j,kind:'building',buildingId:id});
 return {...layout,cells:[...layout.cells,...added]};
}
export function resizeLayout(layout:Layout,w:number,h:number):Layout{
 const clipped=new Set(layout.cells.filter(c=>c.buildingId&&(c.x>=w||c.y>=h)).map(c=>c.buildingId));
 return {...layout,w,h,cells:layout.cells.filter(c=>c.x<w&&c.y<h&&(!c.buildingId||!clipped.has(c.buildingId)))};
}
export function paintLine(cells:Cell[],x0:number,y0:number,x1:number,y1:number,brush:Brush):Cell[]{
 const next=new Map(cells.map(c=>[c.x+','+c.y,c]));let x=x0,y=y0;
 const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
 while(true){const k=x+','+y,old=next.get(k);if(brush==='erase'){if(old?.buildingId){for(const [pos,c] of next)if(c.buildingId===old.buildingId)next.delete(pos)}else next.delete(k)}else if(!old?.buildingId)next.set(k,{x,y,kind:brush});if(x===x1&&y===y1)break;const e=2*err;if(e>=dy){err+=dy;x+=sx}if(e<=dx){err+=dx;y+=sy}}
 return [...next.values()]
}
export function decodeLibrary(input:unknown):NamedLayout[]{if(input===undefined)return [];if(!Array.isArray(input)||input.length>30)throw Error('Invalid project library');const ids=new Set<string>();return input.map(v=>{if(!v||typeof v.id!=='string'||ids.has(v.id)||typeof v.name!=='string'||!v.name.trim()||v.name.length>80||typeof v.updatedAt!=='string')throw Error('Invalid saved project');ids.add(v.id);return {id:v.id,name:v.name,updatedAt:v.updatedAt,layout:decodeLayout(v.layout)}})}
