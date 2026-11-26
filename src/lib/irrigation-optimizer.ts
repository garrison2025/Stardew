import {itemById,occupancy,terrainAt,irrigation,posKey,type Plan,type Placed} from './map-model.ts';
export const sprinklerIds=['basic-sprinkler','quality-sprinkler','iridium-sprinkler','nozzle-basic','nozzle-quality','nozzle-iridium'] as const;
export type SprinklerId=typeof sprinklerIds[number];
export type IrrigationProposal={objects:Placed[];before:number;after:number;total:number;added:number};
/** Greedy maximum uncovered existing crop count. Never replaces any object. */
export function proposeIrrigation(plan:Plan,itemId:SprinklerId,limit:number):IrrigationProposal{
 if(!sprinklerIds.includes(itemId)||!Number.isInteger(limit)||limit<1||limit>30)throw Error('Choose a supported sprinkler and a limit of 1–30.');
 const item=itemById.get(itemId)!;const r=item.radius!, occupied=occupancy(plan.objects),water=irrigation(plan);
 const crops=plan.objects.filter(o=>itemById.get(o.itemId)?.category==='Crops'),missing=new Set(crops.filter(o=>!water.has(posKey(o.x,o.y))).map(o=>posKey(o.x,o.y)));
 const before=crops.length-missing.size,added:Placed[]=[],ids=new Set(plan.objects.map(o=>o.id));
 const candidates=new Map<string,{x:number;y:number;targets:Set<string>}>();
 for(const crop of crops){const target=posKey(crop.x,crop.y);if(!missing.has(target))continue;
 for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(dx===0&&dy===0||item.pattern==='cross'&&Math.abs(dx)+Math.abs(dy)!==1)continue;
 const x=crop.x+dx,y=crop.y+dy,k=posKey(x,y),t=terrainAt(plan.map,x,y);if((t!=='grass'&&t!=='soil')||occupied.has(k))continue;
 let c=candidates.get(k);if(!c){c={x,y,targets:new Set()};candidates.set(k,c)}c.targets.add(target);
 }}
 for(let n=0;n<Math.min(limit,4096-plan.objects.length)&&missing.size;n++){
 let best:{x:number;y:number;targets:Set<string>}|undefined,gain=0;
 for(const c of candidates.values()){let score=0;for(const target of c.targets)if(missing.has(target))score++;if(score>gain||score===gain&&score>0&&best&&(c.y<best.y||c.y===best.y&&c.x<best.x)){gain=score;best=c}}
 if(!best||!gain)break;
 let id='auto-'+best.x+'-'+best.y;while(ids.has(id))id+='-x';ids.add(id);added.push({id,itemId,x:best.x,y:best.y,rotation:0});candidates.delete(posKey(best.x,best.y));for(const target of best.targets)missing.delete(target);
 }
 return {objects:[...plan.objects,...added],before,after:crops.length-missing.size,total:crops.length,added:added.length};
}
