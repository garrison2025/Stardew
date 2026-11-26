import type {Cell} from './engine.ts';
export type Brush=Cell['kind']|'erase';
export type Layout={schema:1;w:number;h:number;radius:number;cells:Cell[]};
export function emptyLayout():Layout{return {schema:1,w:16,h:12,radius:1,cells:[]}}
export function decodeLayout(input:unknown):Layout{
 const legacy=Array.isArray(input);const v=(legacy?{...emptyLayout(),w:32,h:32,cells:input}:input) as Partial<Layout>|null;
 if(!v||v.schema!==1||!Number.isInteger(v.w)||!Number.isInteger(v.h)||v.w!<4||v.h!<4||v.w!>32||v.h!>32||!Array.isArray(v.cells)||v.cells.length>1024)throw Error('Invalid layout format');
 const radius=v.radius??1;if(!Number.isInteger(radius)||radius<1||radius>4)throw Error('Invalid coverage radius');
 const seen=new Set<string>();const cells:Cell[]=[];
 for(const c of v.cells){if(!c||!Number.isInteger(c.x)||!Number.isInteger(c.y)||c.x<0||c.y<0||c.x>=v.w!||c.y>=v.h!||!['crop','sprinkler','path','building'].includes(c.kind)||seen.has(c.x+','+c.y))throw Error('Invalid or duplicate cell');seen.add(c.x+','+c.y);cells.push({x:c.x,y:c.y,kind:c.kind})}
 return {schema:1,w:legacy?Math.max(16,...cells.map(c=>c.x+1)):v.w!,h:legacy?Math.max(12,...cells.map(c=>c.y+1)):v.h!,radius,cells};
}
export function paintLine(cells:Cell[],x0:number,y0:number,x1:number,y1:number,brush:Brush):Cell[]{
 const next=new Map(cells.map(c=>[c.x+','+c.y,c]));let x=x0,y=y0;
 const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
 while(true){const k=x+','+y;if(brush==='erase')next.delete(k);else next.set(k,{x,y,kind:brush});if(x===x1&&y===y1)break;const e=2*err;if(e>=dy){err+=dy;x+=sx}if(e<=dx){err+=dx;y+=sy}}
 return [...next.values()]
}
