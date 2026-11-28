import {restrictionError} from './data-layers.ts';
import {itemById,occupancy,terrainAt,irrigation,posKey,placementError,type Plan,type Placed} from './map-model.ts';
export const sprinklerIds=['basic-sprinkler','quality-sprinkler','iridium-sprinkler','nozzle-basic','nozzle-quality','nozzle-iridium'] as const;
export type SprinklerId=typeof sprinklerIds[number];
export type IrrigationOptions={budget?:number;unitCost?:number;stock?:number;region?:{left:number;top:number;right:number;bottom:number};selectedIds?:string[]};
export type IrrigationProposal={objects:Placed[];before:number;after:number;total:number;added:number;cost:number;limit:number;algorithm:'exact'|'greedy'|'time-limited';candidates:number;remaining:number};
const integer=(n:number,min:number,max:number)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
type Candidate={x:number;y:number;targets:Set<string>};
/** Existing crops only; all objects fixed. One selected sprinkler type, user-supplied opportunity cost and craftable stock. */
export function proposeIrrigation(plan:Plan,itemId:SprinklerId,limit:number,options:IrrigationOptions={}):IrrigationProposal{
 if(!sprinklerIds.includes(itemId)||!integer(limit,1,30))throw Error('Choose a supported sprinkler and a limit of 1–30.');
 const cost=options.unitCost??0,budget=options.budget??100000000,stock=options.stock??30,region=options.region;
 if(!integer(cost,0,100000000)||!integer(budget,0,100000000)||!integer(stock,0,30))throw Error('Invalid device cost, budget or stock.');
 if(region&&(!integer(region.left,0,plan.map.w-1)||!integer(region.right,region.left,plan.map.w-1)||!integer(region.top,0,plan.map.h-1)||!integer(region.bottom,region.top,plan.map.h-1)))throw Error('Invalid inclusive optimization region.');
 const inside=(x:number,y:number)=>!region||x>=region.left&&x<=region.right&&y>=region.top&&y<=region.bottom;
 const selected=options.selectedIds?new Set(options.selectedIds):null;
 const item=itemById.get(itemId)!;const radius=item.radius!,occupied=occupancy(plan.objects),water=irrigation(plan);
 const crops=plan.objects.filter(o=>itemById.get(o.itemId)?.category==='Crops'&&inside(o.x,o.y)&&(!selected||selected.has(o.id)));
 const missing=new Set(crops.filter(o=>!water.has(posKey(o.x,o.y))).map(o=>posKey(o.x,o.y))),before=crops.length-missing.size;
 const cap=Math.max(0,Math.min(limit,stock,cost?Math.floor(budget/cost):limit,4096-plan.objects.length));
 const byCell=new Map<string,Candidate>(),deadline=performance.now()+1800;
 for(const crop of crops){const target=posKey(crop.x,crop.y);if(!missing.has(target))continue;
 for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){if(dx===0&&dy===0||item.pattern==='cross'&&Math.abs(dx)+Math.abs(dy)!==1)continue;
 const x=crop.x+dx,y=crop.y+dy,k=posKey(x,y),t=terrainAt(plan.map,x,y);if(!inside(x,y)||(t!=='grass'&&t!=='soil')||occupied.has(k)||(plan.map.restrictions&&restrictionError(plan.map.restrictions,y*plan.map.w+x,'Equipment')))continue;
 let c=byCell.get(k);if(!c){c={x,y,targets:new Set()};byCell.set(k,c)}c.targets.add(target);
 }}
 const candidates=[...byCell.values()].sort((a,b)=>a.y-b.y||a.x-b.x);
 let best:Candidate[]=[],bestCount=0,algorithm:IrrigationProposal['algorithm']='greedy',timedOut=false;
 const covers=new Set<string>(),chosen=new Set<Candidate>();
 for(let n=0;n<cap&&covers.size<missing.size;n++){
 let winner:Candidate|undefined,gain=0;
 for(const c of candidates){if(chosen.has(c))continue;let score=0;for(const target of c.targets)if(!covers.has(target))score++;if(score>gain){gain=score;winner=c}if(performance.now()>deadline){timedOut=true;break}}
 if(!winner||!gain)break;chosen.add(winner);best.push(winner);for(const target of winner.targets)covers.add(target);if(timedOut)break;
 }
 bestCount=covers.size;
 // Enumerate only small candidate sets; greedy incumbent always remains feasible.
 if(!timedOut&&candidates.length<=18){
 const counts=new Map<string,number>(),path:Candidate[]=[];
 function dfs(index:number){
  if(performance.now()>deadline){timedOut=true;return}
  if(counts.size>bestCount||counts.size===bestCount&&path.length<best.length){best=path.slice();bestCount=counts.size}
  if(index>=candidates.length||path.length>=cap||counts.size===missing.size)return;
  for(let i=index;i<candidates.length&&!timedOut;i++){const c=candidates[i];path.push(c);for(const k of c.targets)counts.set(k,(counts.get(k)??0)+1);dfs(i+1);for(const k of c.targets){const n=counts.get(k)!-1;if(n)counts.set(k,n);else counts.delete(k)}path.pop()}
 }
 dfs(0);if(!timedOut)algorithm='exact';
 }
 if(timedOut)algorithm='time-limited';
 const result=plan.objects.slice(),ids=new Set(result.map(o=>o.id));
 for(const c of best){let id='auto-'+c.x+'-'+c.y;while(ids.has(id))id+='-x';ids.add(id);const o:Placed={id,itemId,x:c.x,y:c.y,rotation:0};const error=placementError(plan.map,result,o);if(error)throw Error('Invalid proposed placement: '+error);result.push(o)}
 const final=irrigation({...plan,objects:result}),after=crops.filter(o=>final.has(posKey(o.x,o.y))).length;
 if(after!==before+bestCount||best.length>cap)throw Error('Proposal failed independent coverage or budget check.');
 return {objects:result,before,after,total:crops.length,added:best.length,cost:best.length*cost,limit:cap,algorithm,candidates:candidates.length,remaining:crops.length-after};
}
