import {PROTECTED_CROPS} from './protected-crops.ts';
import {growthProfile,type GrowthSettings} from './crop-growth.ts';
export type CashCrop={id:string;plots:number;seedCost:number;seedStock:number;rawPrice:number;processPrice:number;processDays:number;batchSize:number};
export type CashScenario={site:'greenhouse'|'island';days:number;cash:number;machines:number;growth:GrowthSettings;crops:CashCrop[];reinvest:boolean};
const int=(n:number,min:number,max:number)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
/** Fixed crop allocations, daily cash settlement and finite seed supply. No borrowing. */
export function simulateProtectedCash(s:CashScenario){
 if(!['greenhouse','island'].includes(s.site)||!int(s.days,1,112)||!int(s.cash,0,100000000)||!int(s.machines,0,10000)||typeof s.reinvest!=='boolean'||!Array.isArray(s.crops)||s.crops.length<1||s.crops.length>3||new Set(s.crops.map(r=>r.id)).size!==s.crops.length)throw Error('Invalid annual scenario');
 if(s.crops.reduce((n,r)=>n+r.plots,0)>(s.site==='greenhouse'?120:10000))throw Error('Crop allocations exceed area limit');
 const rows=s.crops.map(r=>{
  const crop=PROTECTED_CROPS.find(c=>c.id===r.id);
  if(!crop||!int(r.plots,0,10000)||!int(r.seedCost,0,1000000)||!int(r.seedStock,0,1000000)||!int(r.rawPrice,0,1000000)||!int(r.processPrice,0,1000000)||!int(r.processDays,1,28)||!int(r.batchSize,1,20))throw Error('Invalid crop allocation or processing inputs');
  const growth=growthProfile(crop,{...s.growth,irrigated:s.site==='island'&&s.growth.irrigated}).days;
  return {r,crop,growth,stock:r.seedStock,active:new Map<number,number>(),fertilized:0,inventory:0,harvested:0,seeds:0,rawSold:0,processed:0,processedInputs:0};
 });
 type Pending={row:number;units:number;due:number};
 const jobs:Pending[]=[],ledger:{day:number;received:number;plantingCost:number;harvested:number;rawSold:number;processed:number;sales:number;cash:number;queued:number;active:number}[]=[];
 let cash=s.cash,receivable=0,free=s.machines,spend=0,salesTotal=0;
 for(let day=1;day<=s.days;day++){
  const received=receivable;cash+=received;receivable=0;
  let harvested=0,rawSold=0,processed=0,sales=0,plantingCost=0;
  for(let j=jobs.length-1;j>=0;j--){const job=jobs[j];if(job.due!==day)continue;const a=rows[job.row];free+=job.units;processed+=job.units;a.processed+=job.units;a.processedInputs+=job.units*a.r.batchSize;sales+=job.units*a.r.processPrice;jobs.splice(j,1)}
  for(const a of rows){
   const mature=a.active.get(day)??0;
   if(mature){a.active.delete(day);const n=mature*a.crop.yield;a.inventory+=n;a.harvested+=n;harvested+=n;if(a.crop.regrow)a.active.set(day+a.crop.regrow,(a.active.get(day+a.crop.regrow)??0)+mature)}
  }
  // Row order is explicit priority. Replanting uses prior-day receipts, not same-day shipments.
  for(const a of rows){
   if(!s.reinvest&&day!==1||day+a.growth>s.days)continue;
   const used=[...a.active.values()].reduce((n,v)=>n+v,0),empty=a.r.plots-used;
   const fertilizer=s.growth.fertilizer==='none'?0:s.growth.cost;
   const oldSlots=Math.max(0,a.fertilized-used);
   const first=Math.min(empty,oldSlots,a.stock,a.r.seedCost?Math.floor(cash/a.r.seedCost):empty);
   const firstCost=first*a.r.seedCost;cash-=firstCost;
   const unitCost=a.r.seedCost+fertilizer;
   const fresh=Math.min(empty-first,a.r.plots-a.fertilized,a.stock-first,unitCost?Math.floor(cash/unitCost):empty-first);
   const cost=firstCost+fresh*unitCost,n=first+fresh;cash-=fresh*unitCost;plantingCost+=cost;spend+=cost;a.fertilized+=fresh;a.stock-=n;a.seeds+=n;
   if(n)a.active.set(day+a.growth,(a.active.get(day+a.growth)??0)+n);
  }
  // Shared machine pool; greedily prefer higher incremental value per machine-day.
  const priority=rows.map((a,i)=>({a,i,gain:(a.r.processPrice-a.r.rawPrice*a.r.batchSize)/a.r.processDays})).filter(v=>v.gain>0).sort((a,b)=>b.gain-a.gain||a.i-b.i);
  for(const {a,i} of priority){if(day+a.r.processDays>s.days)continue;const units=Math.min(free,Math.floor(a.inventory/a.r.batchSize));if(!units)continue;free-=units;a.inventory-=units*a.r.batchSize;jobs.push({row:i,units,due:day+a.r.processDays})}
  // Only hold stock already assigned to an immediately available machine. Sell the rest raw.
  for(const a of rows){rawSold+=a.inventory;a.rawSold+=a.inventory;sales+=a.inventory*a.r.rawPrice;a.inventory=0}
  receivable=sales;salesTotal+=sales;
  ledger.push({day,received,plantingCost,harvested,rawSold,processed,sales,cash,queued:jobs.reduce((n,j)=>n+j.units,0),active:rows.reduce((n,a)=>n+[...a.active.values()].reduce((x,y)=>x+y,0),0)});
 }
 if(jobs.length||cash<0||rows.some(a=>a.harvested!==a.rawSold+a.processedInputs)||cash+receivable!==s.cash+salesTotal-spend)throw Error('Cash or harvest conservation check failed');
 return {ledger,spent:spend,sales:salesTotal,net:salesTotal-spend,settledCash:cash+receivable,receivable,crops:rows.map(a=>({id:a.r.id,seeds:a.seeds,remainingSeedStock:a.stock,harvested:a.harvested,rawSold:a.rawSold,processed:a.processed,processedInputs:a.processedInputs}))};
}
