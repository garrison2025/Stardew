import {builtinFarmPlan,BUILTIN_FARMS} from './builtin-farm-preview.ts';
import {footprint,type Plan} from './map-model.ts';
import {analyzeFarmAccess,suggestedWalkOrigin} from './farm-access.ts';
// Counts refer to editor geometry and pinned restriction flags, not actual game capacity.
export function referenceCapacity(plan:Plan){
 const {w,h,restrictions:r}=plan.map;if(!r)throw Error('A restriction reference is required');
 const occupied=new Uint8Array(w*h);
 for(const o of plan.objects)for(const p of footprint(o))if(p.x>=0&&p.y>=0&&p.x<w&&p.y<h)occupied[p.y*w+p.x]=1;
 let baseTill=0,baseBuild=0,freeTill=0,freeBuild=0;
 for(let i=0;i<occupied.length;i++){
  const t=r.access[i]==='C'&&(r.till[i]==='T'||r.till[i]==='D'),b=r.build[i]==='B';
  baseTill+=Number(t);baseBuild+=Number(b);
  freeTill+=Number(t&&!occupied[i]);freeBuild+=Number(b&&!occupied[i]);
 }
 const origin=suggestedWalkOrigin(plan),access=origin?analyzeFarmAccess(plan,origin):null;
 return {baseTill,baseBuild,freeTill,freeBuild,occupied:occupied.reduce((n,v)=>n+v,0),open:access?.open??0,reachable:access?.reachable??0,disconnected:access?.disconnected??0,origin};
}
export function compareFarmCapacity(){
 return BUILTIN_FARMS.map(f=>({id:f.id,name:f.name,...referenceCapacity(builtinFarmPlan(f.id,'spring',true))}));
}
