import {cropById} from './crop-data.ts';
import {cycles,eligible,plantingHorizon,rawCropPrice,type Allocation,type SeasonInput} from './season-crops.ts';
import {estimateProcessing,PROCESS_CROPS,availableMachines} from './processing.ts';
import type {Plan} from './map-model.ts';
export type EconomySettings={initialCash:number;kegs:number;jars:number;minutesPerDay:number;tailDays:number;artisan:boolean;tiller:boolean;strategy:'raw'|'process'};
type Machine='Keg'|'Preserves jar';
type Batch={machine:Machine;crop:string;units:number;due:number;price:number};
export type DayLedger={day:number;openingCash:number;received:number;seedCost:number;harvested:number;loaded:number;completed:number;rawSold:number;processedSold:number;sales:number;inventory:number;inFlight:number;closingCash:number};
export function farmMachines(plan:Plan){let kegs=0,jars=0,blockedKegs=0,blockedJars=0,rooms=0;for(const o of plan.objects){if(!o.interior)continue;rooms++;const v=availableMachines(o.interior);kegs+=v.kegs;jars+=v.jars;blockedKegs+=v.blockedKegs;blockedJars+=v.blockedJars}return {kegs,jars,blockedKegs,blockedJars,rooms}}
export function simulateEconomy(input:SeasonInput,allocation:Allocation[],s:EconomySettings){
 const whole=(n:number,min:number,max:number)=>Number.isInteger(n)&&n>=min&&n<=max;
 if(!whole(input.start,1,28)||!whole(input.plots,0,100)||!whole(input.budget,0,20000)||!['spring','summer','autumn','winter'].includes(input.season)||!whole(s.initialCash,0,100000000)||!whole(s.kegs,0,10000)||!whole(s.jars,0,10000)||!whole(s.minutesPerDay,1,2000)||!whole(s.tailDays,0,28)||!['raw','process'].includes(s.strategy))throw Error('Invalid economy settings.');
 const harvests=new Map<number,Map<string,number>>(),costs=new Map<number,number>(),rawPrices=new Map<string,number>();
 const allowed=new Set(eligible(input).map(c=>c.id));let plannedCost=0,tiles=0,rawBaseline=0,totalHarvest=0;
 for(const a of allocation){const crop=cropById.get(a.cycle.crop.id);if(!crop||!allowed.has(crop.id)||!whole(a.tiles,1,100))throw Error('Invalid planting allocation');const canonical=cycles(crop,input.start,input.replant,input).find(c=>c.days.length===a.cycle.days.length&&c.days.every((d,i)=>d===a.cycle.days[i]));if(!canonical)throw Error('Unsupported harvest schedule');tiles+=a.tiles;plannedCost+=canonical.cost*a.tiles;const raw=rawCropPrice(crop.price,input.quality,s.tiller);rawPrices.set(crop.id,raw);for(const day of canonical.days){const n=a.tiles*crop.yield,arr=harvests.get(day)??new Map<string,number>();arr.set(crop.id,(arr.get(crop.id)||0)+n);harvests.set(day,arr);rawBaseline+=raw*n;totalHarvest+=n}const purchaseDays=crop.regrow?[input.start]:[input.start,...canonical.days.slice(0,-1)];for(const day of purchaseDays)costs.set(day,(costs.get(day)||0)+a.tiles*crop.seed);costs.set(input.start,(costs.get(input.start)||0)+canonical.fertilizerCost*a.tiles)}
 if(tiles>input.plots||plannedCost>input.budget||plannedCost>s.initialCash)throw Error('Initial cash must cover the complete planned seed cost; the simulator does not borrow or change the planting plan.');
 const stock=new Map<string,number>(),pending:Batch[]=[],ledger:DayLedger[]=[],free:Record<Machine,number>={'Keg':s.kegs,'Preserves jar':s.jars};
 const horizon=plantingHorizon(input)+s.tailDays;let cash=s.initialCash,receivable=0,totalSales=0,seedSpend=0,totalProcessed=0,totalRawSold=0;
 const recipes=[...rawPrices].flatMap(([crop,raw])=>PROCESS_CROPS.some(c=>c.id===crop)?estimateProcessing({crop,stock:0,minutes:0,quality:input.quality??0,artisan:s.artisan,tiller:s.tiller,kegs:0,jars:0}).rows.map(r=>({crop,machine:r.machine as Machine,price:r.price,gain:r.price-raw,duration:Math.ceil(r.minutes/s.minutesPerDay)})):[]).filter(r=>r.gain>0).sort((a,b)=>b.gain-a.gain||a.duration-b.duration||a.crop.localeCompare(b.crop)||a.machine.localeCompare(b.machine));
 for(let day=1;day<=horizon;day++){const openingCash=cash,received=receivable;cash+=received;receivable=0;const seedCost=costs.get(day)||0;cash-=seedCost;seedSpend+=seedCost;let harvested=0,loaded=0,completed=0,rawSold=0,processedSold=0,sales=0;
 // Morning collection: completed batches release devices before new loading.
 for(let i=pending.length-1;i>=0;i--){const b=pending[i];if(b.due>day)continue;free[b.machine]+=b.units;completed+=b.units;processedSold+=b.units;sales+=b.units*b.price;pending.splice(i,1)}
 for(const [crop,n] of harvests.get(day)??[]){stock.set(crop,(stock.get(crop)||0)+n);harvested+=n}
 if(s.strategy==='process')for(const r of recipes){if(day+r.duration>horizon)continue;const units=Math.min(free[r.machine],stock.get(r.crop)||0);if(!units)continue;free[r.machine]-=units;stock.set(r.crop,(stock.get(r.crop)||0)-units);pending.push({machine:r.machine,crop:r.crop,units,due:day+r.duration,price:r.price});loaded+=units}
 // Raw-only sells on harvest day; processing holds viable stock, otherwise sells now.
 for(const [crop,n] of stock){if(!n)continue;const future=s.strategy==='process'&&day<horizon&&recipes.some(r=>r.crop===crop&&((r.machine==='Keg'?s.kegs:s.jars)>0)&&day+r.duration<=horizon);if(future)continue;rawSold+=n;sales+=n*rawPrices.get(crop)!;stock.set(crop,0)}
 receivable=sales;totalSales+=sales;totalProcessed+=processedSold;totalRawSold+=rawSold;
 ledger.push({day,openingCash,received,seedCost,harvested,loaded,completed,rawSold,processedSold,sales,inventory:[...stock.values()].reduce((a,b)=>a+b,0),inFlight:pending.reduce((a,b)=>a+b.units,0),closingCash:cash})
 }
 if(pending.length||[...stock.values()].some(n=>n!==0)||totalHarvest!==totalProcessed+totalRawSold||seedSpend!==plannedCost)throw Error('Economy conservation check failed');
 return {ledger,totalHarvest,totalProcessed,totalRawSold,seedSpend,totalSales,rawBaseline,additionalValue:totalSales-rawBaseline,net:totalSales-seedSpend,closingCash:cash,finalReceivable:receivable,settledCash:cash+receivable,horizon};
}

type EconomyResult = ReturnType<typeof simulateEconomy>;

function comparisonRow(label: string, result: EconomyResult) {
 const firstReceipt = result.ledger.find(day => day.received > 0)?.day
  ?? (result.finalReceivable > 0 ? result.horizon + 1 : null);
 return {
  label,
  net: result.net,
  firstReceipt,
  peakBacklog: Math.max(0, ...result.ledger.map(day => day.inventory)),
  finalDayRawSales: result.ledger.at(-1)?.rawSold ?? 0,
  processed: result.totalProcessed,
 };
}

/** Compare the current mixed plan and feasible single-crop alternatives under the same rules. */
export function compareFarmEconomy(input: SeasonInput, allocation: Allocation[], settings: EconomySettings) {
 const raw = simulateEconomy(input, allocation, {...settings, strategy: 'raw'});
 const processing = {...settings, strategy: 'process'} as const;
 const baseline = simulateEconomy(input, allocation, processing);
 let best = baseline;
 let recommendation: Allocation | null = null;
 const budget = Math.min(input.budget, settings.initialCash);
 if (settings.kegs > 0 || settings.jars > 0) {
  for (const crop of eligible(input)) {
   for (const cycle of cycles(crop, input.start, input.replant, input)) {
    const tiles = Math.min(input.plots, cycle.cost ? Math.floor(budget / cycle.cost) : input.plots);
    if (!tiles) continue;
    const candidate = {cycle, tiles};
    const result = simulateEconomy(input, [candidate], processing);
    if (result.net <= best.net) continue;
    best = result;
    recommendation = candidate;
   }
  }
 }
 return {
  raw: comparisonRow('Current plan · sell raw', raw),
  current: comparisonRow('Current plan · process', baseline),
  alternative: comparisonRow(recommendation ? recommendation.tiles + ' × ' + recommendation.cycle.crop.name : 'Keep the current planting', best),
  recommendation,
 };
}
