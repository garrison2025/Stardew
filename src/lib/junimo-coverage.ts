import {itemById,posKey,type Plan,type Placed} from './map-model.ts';
// Geometry only: vanilla 3x2 hut, center at relative (1,1), inclusive radius 8.
export function junimoRange(map:Plan['map'],hut:Placed){
 const tiles=new Set<string>();if(hut.itemId!=='game-junimo-hut')return tiles;
 const cx=hut.x+1,cy=hut.y+1;
 for(let y=Math.max(0,cy-8);y<=Math.min(map.h-1,cy+8);y++)
  for(let x=Math.max(0,cx-8);x<=Math.min(map.w-1,cx+8);x++)tiles.add(posKey(x,y));
 return tiles;
}
export function junimoCoverage(plan:Plan){
 const tiles=new Set<string>();let huts=0;
 for(const hut of plan.objects){if(hut.itemId!=='game-junimo-hut')continue;huts++;for(const key of junimoRange(plan.map,hut))tiles.add(key);}
 const crops=plan.objects.filter(o=>itemById.get(o.itemId)?.category==='Crops');
 return {tiles,huts,crops:crops.length,inRange:crops.filter(o=>tiles.has(posKey(o.x,o.y))).length};
}
