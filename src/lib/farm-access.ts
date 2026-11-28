import {dimensions,footprint,itemById,type Plan,type Point} from './map-model.ts';
// Conservative four-neighbor editor diagnostic, not the game's NPC/player pathfinder.
const walkThrough=new Set(['wood-path','stone-path','brick-path','gate']);
export function walkableGrid(plan:Plan){
 const {w,h,tiles,restrictions}=plan.map,open=new Uint8Array(w*h);
 for(let i=0;i<open.length;i++)if(!['water','cliff','forest'].includes(tiles[i])&&(!restrictions||restrictions.access[i]==='C'))open[i]=1;
 for(const o of plan.objects){if(walkThrough.has(o.itemId))continue;for(const p of footprint(o))if(p.x>=0&&p.y>=0&&p.x<w&&p.y<h)open[p.y*w+p.x]=0;}
 return open;
}
export function suggestedWalkOrigin(plan:Plan):Point|null{
 const {w,h}=plan.map,open=walkableGrid(plan),home=plan.objects.find(o=>o.itemId==='game-farmhouse');
 if(home){const p={x:home.x+5,y:home.y+5};if(p.x>=0&&p.y>=0&&p.x<w&&p.y<h&&open[p.y*w+p.x])return p;}
 const i=open.indexOf(1);return i<0?null:{x:i%w,y:Math.floor(i/w)};
}
export function analyzeFarmAccess(plan:Plan,origin:Point,goal?:Point){
 const {w,h}=plan.map,open=walkableGrid(plan),distance=new Int32Array(w*h).fill(-1),parent=new Int32Array(w*h).fill(-1),queue=new Int32Array(w*h);
 const index=(p:Point)=>Number.isSafeInteger(p.x)&&Number.isSafeInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<w&&p.y<h?p.y*w+p.x:-1;
 const start=index(origin);if(start<0||!open[start])throw Error('Origin is outside the grid or blocked in the reference model.');
 let head=0,tail=0;queue[tail++]=start;distance[start]=0;
 while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w);
  for(const j of [x>0?i-1:-1,x+1<w?i+1:-1,y>0?i-w:-1,y+1<h?i+w:-1])if(j>=0&&open[j]&&distance[j]<0){distance[j]=distance[i]+1;parent[j]=i;queue[tail++]=j;}
 }
 const buildings=plan.objects.filter(o=>itemById.get(o.itemId)?.category==='Buildings').map(o=>{
  const d=dimensions(o),targets:Point[]=[];
  // Only these documented entrance approach cells are known; all other buildings use perimeter adjacency.
  if(o.itemId==='game-farmhouse')targets.push({x:o.x+5,y:o.y+5});
  else if(o.itemId==='game-greenhouse')targets.push({x:o.x+3,y:o.y+6});
  else{for(let x=o.x;x<o.x+d.w;x++){targets.push({x,y:o.y-1},{x,y:o.y+d.h});}for(let y=o.y;y<o.y+d.h;y++){targets.push({x:o.x-1,y},{x:o.x+d.w,y});}}
  const distances=targets.map(index).filter(i=>i>=0&&distance[i]>=0).map(i=>distance[i]);
  return {id:o.id,name:itemById.get(o.itemId)!.name,x:o.x,y:o.y,approach:o.itemId==='game-farmhouse'||o.itemId==='game-greenhouse'?'entrance approach':'perimeter',distance:distances.length?Math.min(...distances):null};
 });
 const path:Point[]=[];let goalStatus:'none'|'blocked'|'unreachable'|'reachable'='none';
 if(goal){const end=index(goal);goalStatus=end<0||!open[end]?'blocked':distance[end]<0?'unreachable':'reachable';
 if(goalStatus==='reachable'){for(let i=end;i>=0;i=parent[i])path.push({x:i%w,y:Math.floor(i/w)});path.reverse();}}
 const total=open.reduce((n,v)=>n+v,0);
 return {reachable:tail,open:total,disconnected:total-tail,buildings,goalStatus,path};
}
