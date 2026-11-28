import {itemById,posKey,occupancy,type Plan,type Placed} from './map-model.ts';
const flowerIds=new Set(['sunflower','flower-tulip','flower-blue-jazz','flower-poppy','flower-summer-spangle','flower-fairy-rose']);
export function beeFlowerRange(map:Plan['map'],bee:Placed){
 const out=new Set<string>();if(bee.itemId!=='bee-house')return out;
 for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const x=bee.x+dx,y=bee.y+dy,d=Math.abs(dx)+Math.abs(dy);if(d>0&&d<=5&&x>=0&&y>=0&&x<map.w&&y<map.h)out.add(posKey(x,y));}return out;
}
export function gardenDiagnostics(plan:Plan){
 const flowers=plan.objects.filter(o=>flowerIds.has(o.itemId)),bees=plan.objects.filter(o=>o.itemId==='bee-house'),trees=plan.objects.filter(o=>o.itemId==='fruit-sapling'),occupied=occupancy(plan.objects);
 const beeTiles=new Set<string>(),treeTiles=new Set<string>(),conflictTiles=new Set<string>();
 const beeRows=bees.map(b=>{const range=beeFlowerRange(plan.map,b);for(const k of range)beeTiles.add(k);return {id:b.id,x:b.x,y:b.y,flowers:flowers.filter(f=>range.has(posKey(f.x,f.y))).length};});
 const treeRows=trees.map(t=>{
  const conflicts=new Set<string>();
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(dx===0&&dy===0)continue;const x=t.x+dx,y=t.y+dy;if(x<0||y<0||x>=plan.map.w||y>=plan.map.h)continue;const k=posKey(x,y);treeTiles.add(k);const other=occupied.get(k);
   // The game permits some permanent structures and artifact spots next to saplings.
   if(other&&!['game-farmhouse','game-greenhouse','observed-artifact'].includes(other.itemId))conflicts.add(k);
  }
  for(const other of trees)if(other.id!==t.id&&Math.abs(other.x-t.x)<=2&&Math.abs(other.y-t.y)<=2){conflicts.add(posKey(other.x,other.y));}
  for(const k of conflicts)conflictTiles.add(k);
  return {id:t.id,x:t.x,y:t.y,conflicts:conflicts.size};
 });
 return {beeTiles,treeTiles,conflictTiles,beeRows,treeRows,flowers:flowers.length};
}
