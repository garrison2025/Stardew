import {SEASON_CROPS,OWNED_CROPS,type GameCrop,type CropSeason} from './crop-data.ts';
export type SeasonInput={season:CropSeason;start:number;plots:number;budget:number;replant:boolean;strawberry:boolean;trellis:boolean;year2?:boolean;oasis?:boolean;crossSeason?:boolean;quality?:0|1|2|3;tiller?:boolean;fertilizer?:{cropId:string;growthDays:number;cost:number}};
export type Cycle={crop:GameCrop;days:number[];seeds:number;fertilizerCost:number;cost:number;revenue:number;profit:number};
export type Allocation={cycle:Cycle;tiles:number};
function checkDay(day:number){if(!Number.isInteger(day)||day<1||day>28)throw Error('Planting day must be 1–28.')}
const calendar:CropSeason[]=['spring','summer','autumn','winter'];
type ScheduleOptions=Pick<SeasonInput,'season'|'crossSeason'|'quality'|'tiller'|'fertilizer'>;
export function plantingHorizon(input:Pick<SeasonInput,'crossSeason'>){return input.crossSeason?56:28}
export function harvestLabel(day:number,season:CropSeason){const offset=Math.floor((day-1)/28);return calendar[(calendar.indexOf(season)+offset)%4]+' '+((day-1)%28+1)}
export function rawCropPrice(price:number,quality:0|1|2|3=0,tiller=false){
 const factor=[100,125,150,200][quality];
 if(!factor)throw Error('Unknown crop quality');
 return Math.floor(Math.floor(price*factor/100)*(tiller?110:100)/100);
}
export function validateFertilizer(fertilizer:SeasonInput['fertilizer']){
 if(!fertilizer)return;
 const crop=SEASON_CROPS.find(c=>c.id===fertilizer.cropId);
 if(!crop||!Number.isInteger(fertilizer.growthDays)||fertilizer.growthDays<1||fertilizer.growthDays>crop.growth||!Number.isInteger(fertilizer.cost)||fertilizer.cost<0||fertilizer.cost>20000)throw Error('Use 1 through the base growth days and a fertilizer cost from 0–20,000g.');
}
export function cycles(crop:GameCrop,start:number,replant:boolean,options?:ScheduleOptions):Cycle[]{
 checkDay(start);
 const fertilizer=options?.fertilizer?.cropId===crop.id?options.fertilizer:undefined;
 validateFertilizer(fertilizer);
 const nextSeason=options&&calendar[(calendar.indexOf(options.season)+1)%4];
 const end=options?.crossSeason&&nextSeason&&crop.seasons.includes(nextSeason)?56:28;
 const growth=fertilizer?.growthDays??crop.growth;
 const first=start+growth;
 if(first>end)return [];
 const interval=crop.regrow||growth,days:number[]=[];
 for(let day=first;day<=end;day+=interval){
  days.push(day);
  if(!crop.regrow&&!replant)break;
 }
 const fertilizerCost=fertilizer?.cost??0;
 const price=rawCropPrice(crop.price,options?.quality,options?.tiller);
 const make=(dates:number[]):Cycle=>{
  const seeds=crop.regrow?1:dates.length;
  const cost=seeds*crop.seed+fertilizerCost,revenue=dates.length*crop.yield*price;
  return {crop,days:dates,seeds,fertilizerCost,cost,revenue,profit:revenue-cost};
 };
 return crop.regrow?[make(days)]:days.map((_,i)=>make(days.slice(0,i+1)));
}
export function eligible(input:SeasonInput){return SEASON_CROPS.filter(c=>c.seasons.includes(input.season)&&(!c.special||c.special==='festival'&&input.strawberry||c.special==='year2'&&input.year2||c.special==='oasis'&&input.oasis)&&(!c.trellis||input.trellis))}
export function optimizeSeason(input:SeasonInput){
 checkDay(input.start);if(!Number.isInteger(input.plots)||input.plots<0||input.plots>100||!Number.isInteger(input.budget)||input.budget<0||input.budget>20000)throw Error('Optimizer supports 0–100 tiles and 0–20,000g total seed budget.');
 if(!['spring','summer','autumn','winter'].includes(input.season))throw Error('Unknown season');
 validateFertilizer(input.fertilizer);
 // Seed prices use a 10g lattice; include the fertilizer price in the common divisor.
 const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);
 const unit=gcd(10,input.fertilizer?.cost??0);
 const budget=Math.floor(input.budget/unit),stride=budget+1;
 const candidates=eligible(input).flatMap(c=>cycles(c,input.start,input.replant,input))
  .filter(c=>c.profit>0&&c.cost<=input.budget).sort((a,b)=>a.cost-b.cost||b.profit-a.profit);
 const options:Cycle[]=[];
 for(const option of candidates)if(!options.length||option.profit>options[options.length-1].profit)options.push(option);
 const choices=new Int16Array((input.plots+1)*stride).fill(-1);
 let prev=new Int32Array(stride),next=new Int32Array(stride);
 for(let p=1;p<=input.plots;p++){for(let b=0;b<=budget;b++){let best=prev[b],idx=-1;for(let i=0;i<options.length;i++){const cost=options[i].cost/unit;if(cost>b)continue;const value=prev[b-cost]+options[i].profit;if(value>best){best=value;idx=i}}next[b]=best;choices[p*stride+b]=idx}const swap=prev;prev=next;next=swap}
 const counts=new Map<number,number>();let b=budget;for(let p=input.plots;p>0;p--){const idx=choices[p*stride+b];if(idx>=0){counts.set(idx,(counts.get(idx)||0)+1);b-=options[idx].cost/unit}}
 const allocation:Allocation[]=[...counts].map(([i,tiles])=>({cycle:options[i],tiles})).sort((a,b)=>b.tiles-a.tiles||a.cycle.crop.id.localeCompare(b.cycle.crop.id));
 const spent=allocation.reduce((n,a)=>n+a.cycle.cost*a.tiles,0),revenue=allocation.reduce((n,a)=>n+a.cycle.revenue*a.tiles,0),planted=allocation.reduce((n,a)=>n+a.tiles,0);
 return {allocation,spent,revenue,profit:revenue-spent,planted,unused:input.plots-planted};
}

export function ownedSeedPlan(id:string,season:CropSeason,start:number,stock:number,plots:number,seedCost:number){checkDay(start);const crop=OWNED_CROPS.find(c=>c.id===id);if(!crop||!crop.seasons.includes(season)||![stock,plots,seedCost].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000))throw Error('Invalid owned seed scenario');const cycle=cycles({...crop,seed:seedCost},start,false)[0];const planted=cycle?Math.min(stock,plots):0;return {planted,days:cycle?.days??[],cost:(cycle?.cost??0)*planted,revenue:(cycle?.revenue??0)*planted,profit:(cycle?.profit??0)*planted}}
