import {FAIR_CATEGORIES,fairScore,itemPoints,type FairItem} from './game-rules.ts';
export type FairCandidate={name:string;category:string;price:number;quality:number;quantity:number};
type State={points:number;indices:number[]};
export function optimizeFair(candidates:FairCandidate[]){
 if(candidates.length>60)throw Error('At most 60 candidate rows');
 const groups=FAIR_CATEGORIES.map(()=>[] as {index:number;points:number}[]);
 for(const [index,c] of candidates.entries()){
  if(!c.name.trim()||c.name.length>100||!Number.isSafeInteger(c.quantity)||c.quantity<0||c.quantity>9999)throw Error('Invalid candidate');
  const category=FAIR_CATEGORIES.findIndex(v=>v===c.category);if(category<0)throw Error('Invalid Fair category');
  const points=itemPoints(c.price,c.quality);for(let j=0;j<Math.min(9,c.quantity);j++)groups[category].push({index,points});
 }
 let states=new Map<string,State>([['0:0',{points:0,indices:[]}]]);
 for(const [category,group] of groups.entries()){
  group.sort((a,b)=>b.points-a.points||a.index-b.index);const next=new Map<string,State>();
  for(const [key,state] of states){const [slots,diversity]=key.split(':').map(Number);let score=state.points;
   for(let k=0;k<=Math.min(9-slots,group.length);k++){if(k)score+=group[k-1].points;
    const d=Math.min(6,diversity+(k>0&&FAIR_CATEGORIES[category]!=='Uncategorized'?1:0)),newKey=(slots+k)+':'+d;
    const old=next.get(newKey);if(!old||score>old.points)next.set(newKey,{points:score,indices:[...state.indices,...group.slice(0,k).map(g=>g.index)]});
   }
  }states=next;
 }
 let best:FairItem[]=[],indices:number[]=[],score=fairScore([]).score;
 for(const v of states.values()){const items=v.indices.map(i=>({category:candidates[i].category,price:candidates[i].price,quality:candidates[i].quality,active:true}));const s=fairScore(items).score;if(s>score){score=s;best=items;indices=v.indices}}
 return {items:best,names:indices.map(i=>candidates[i].name),indices,...fairScore(best)};
}
