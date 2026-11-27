import {SEASON_CROPS,OWNED_CROPS,type CropSeason} from './crop-data.ts';
import {growthProfile,validateGrowth,type GrowthSettings} from './crop-growth.ts';
import type {CashCrop} from './protected-cashflow.ts';
export const OUTDOOR_CROPS=[...SEASON_CROPS,...OWNED_CROPS];
export type OutdoorRow=CashCrop&{availableFrom:number};
export type OutdoorScenario={start:number;end:number;plots:number;cash:number;machines:number;growth:GrowthSettings;crops:OutdoorRow[]};
const seasons:CropSeason[]=['spring','summer','autumn','winter'];
export const outdoorDate=(d:number)=>seasons[Math.floor((d-1)/28)]+' '+((d-1)%28+1);
const season=(d:number)=>seasons[Math.floor((d-1)/28)];
const int=(v:number,min:number,max:number)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
type Policy='row order'|'net per tile-day'|'low seed cost'|'total crop margin';
const policies:Policy[]=['row order','net per tile-day','low seed cost','total crop margin'];
function validate(s:OutdoorScenario){
 if(!int(s.start,1,112)||!int(s.end,s.start,112)||!int(s.plots,0,10000)||!int(s.cash,0,100000000)||!int(s.machines,0,10000)||!Array.isArray(s.crops)||s.crops.length<1||s.crops.length>8||new Set(s.crops.map(r=>r.id)).size!==s.crops.length)throw Error('Invalid outdoor scenario.');
 validateGrowth(s.growth);
 for(const r of s.crops)if(!OUTDOOR_CROPS.some(c=>c.id===r.id)||!int(r.plots,0,s.plots)||!int(r.availableFrom,1,112)||!int(r.seedStock,0,1000000)||!int(r.seedCost,0,1000000)||!int(r.rawPrice,0,1000000)||!int(r.processPrice,0,1000000)||!int(r.processDays,1,28)||!int(r.batchSize,1,20))throw Error('Invalid crop row.');
}
function run(s:OutdoorScenario,policy:Policy,machines:number){
 const rows=s.crops.map(r=>({r,c:OUTDOOR_CROPS.find(c=>c.id===r.id)!,stock:r.seedStock,harvested:0,seeds:0,rawSold:0,processed:0,processedInputs:0,inventory:0,active:new Map<number,number>()})).map(a=>({...a,growth:growthProfile(a.c,s.growth).days}));
 const jobs:{row:number;units:number;due:number}[]=[],ledger:{day:number;received:number;plantingCost:number;harvested:number;rawSold:number;processed:number;sales:number;cash:number;active:number;machinesBusy:number;plantings:{id:string;tiles:number;firstHarvest:number}[]}[]=[];
 let cash=s.cash,receivable=0,spent=0,salesTotal=0,free=machines;
 const used=(a:typeof rows[number])=>[...a.active.values()].reduce((n,v)=>n+v,0);
 const limit=(a:typeof rows[number],day:number)=>{let last=day;while(last<s.end&&a.c.seasons.includes(season(last+1)))last++;return last};
 for(let day=s.start;day<=s.end;day++){
  const received=receivable;cash+=received;receivable=0;
  let plantingCost=0,harvested=0,rawSold=0,processed=0,sales=0;
  const plantings:typeof ledger[number]['plantings']=[];
  for(let j=jobs.length-1;j>=0;j--){const job=jobs[j];if(job.due!==day)continue;const a=rows[job.row];free+=job.units;processed+=job.units;a.processed+=job.units;a.processedInputs+=job.units*a.r.batchSize;sales+=job.units*a.r.processPrice;jobs.splice(j,1)}
  for(const a of rows){
   if(!a.c.seasons.includes(season(day))){if(a.active.size)throw Error('Crop survived an invalid season');continue}
   const n=a.active.get(day)??0;if(!n)continue;a.active.delete(day);
   const qty=n*a.c.yield;a.inventory+=qty;a.harvested+=qty;harvested+=qty;
   // Release the tile once no further eligible regrowth harvest fits the season/horizon.
   const next=day+a.c.regrow;if(a.c.regrow&&next<=limit(a,day))a.active.set(next,(a.active.get(next)??0)+n);
  }
  const fertilizer=s.growth.fertilizer==='none'?0:s.growth.cost;
  const candidates=rows.map((a,i)=>{
   const last=limit(a,day),first=day+a.growth,harvests=first>last?0:1+(a.c.regrow?Math.floor((last-first)/a.c.regrow):0),duration=a.growth+Math.max(0,harvests-1)*a.c.regrow;
   const margin=harvests*a.c.yield*a.r.rawPrice-a.r.seedCost-fertilizer;
   const potential=harvests*a.c.yield*(machines?Math.max(a.r.rawPrice,a.r.processPrice/a.r.batchSize):a.r.rawPrice)-a.r.seedCost-fertilizer;
   return {a,i,first,margin,potential,duration};
  }).filter(({a,first,potential})=>a.c.seasons.includes(season(day))&&day>=a.r.availableFrom&&first<=limit(a,day)&&a.stock>0&&potential>0)
  .sort((x,y)=>policy==='row order'?x.i-y.i:policy==='low seed cost'?x.a.r.seedCost-y.a.r.seedCost||y.margin-x.margin||x.i-y.i:policy==='total crop margin'?y.potential-x.potential||x.i-y.i:y.potential/y.duration-x.potential/x.duration||x.i-y.i);
  let vacant=s.plots-rows.reduce((n,a)=>n+used(a),0);
  for(const {a,first} of candidates){const cost=a.r.seedCost+fertilizer,n=Math.min(vacant,a.r.plots-used(a),a.stock,cost?Math.floor(cash/cost):vacant);if(n<=0)continue;
   cash-=cost*n;plantingCost+=cost*n;spent+=cost*n;vacant-=n;a.stock-=n;a.seeds+=n;a.active.set(first,(a.active.get(first)??0)+n);plantings.push({id:a.r.id,tiles:n,firstHarvest:first});
  }
  const order=rows.map((a,i)=>({a,i,gain:(a.r.processPrice-a.r.rawPrice*a.r.batchSize)/a.r.processDays})).filter(x=>x.gain>0).sort((a,b)=>b.gain-a.gain||a.i-b.i);
  for(const {a,i} of order){if(day+a.r.processDays>s.end)continue;const units=Math.min(free,Math.floor(a.inventory/a.r.batchSize));if(units<=0)continue;free-=units;a.inventory-=units*a.r.batchSize;jobs.push({row:i,units,due:day+a.r.processDays})}
  for(const a of rows){a.rawSold+=a.inventory;rawSold+=a.inventory;sales+=a.inventory*a.r.rawPrice;a.inventory=0}
  receivable=sales;salesTotal+=sales;const active=rows.reduce((n,a)=>n+used(a),0);
  if(active>s.plots||cash<0||free<0||free+jobs.reduce((n,j)=>n+j.units,0)!==machines)throw Error('Outdoor daily constraint failed');
  ledger.push({day,received,plantingCost,harvested,rawSold,processed,sales,cash,active,machinesBusy:machines-free,plantings});
 }
 if(jobs.length||rows.some(a=>a.stock+a.seeds!==a.r.seedStock||a.harvested!==a.rawSold+a.processedInputs||a.active.size!==0)||cash+receivable!==s.cash+salesTotal-spent)throw Error('Outdoor conservation check failed');
 return {policy,machines,ledger,spent,sales:salesTotal,net:salesTotal-spent,settledCash:cash+receivable,receivable,crops:rows.map(a=>({id:a.r.id,seeds:a.seeds,remainingSeedStock:a.stock,harvested:a.harvested,rawSold:a.rawSold,processed:a.processed,processedInputs:a.processedInputs}))};
}
export function outdoorCashflow(s:OutdoorScenario){
 validate(s);
 const raw=policies.map(p=>run(s,p,0)),processed=s.machines?policies.map(p=>run(s,p,s.machines)):[];
 const rank=(a:ReturnType<typeof run>,b:ReturnType<typeof run>)=>b.net-a.net;
 const baseline=[...raw].sort(rank)[0],result=[...raw,...processed].sort(rank)[0];
 return {result,baseline,comparisons:[...raw,...processed].map(({policy,machines,net,spent,settledCash})=>({policy,machines,net,spent,settledCash})).sort((a,b)=>b.net-a.net)};
}
