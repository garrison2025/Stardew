import {cropById} from './crop-data.ts';
import {cycles,eligible,plantingHorizon,rawCropPrice,type Allocation,type SeasonInput} from './season-crops.ts';
import {availableMachines} from './processing.ts';
import {analyzeFarmAccess,suggestedWalkOrigin} from './farm-access.ts';
import {dailyRecipes,agedWinePrice,type DailyRecipe,type PrimaryMachine} from './economy-recipes.ts';
import {cropReceivesTiller} from './crop-growth.ts';
import type {Plan} from './map-model.ts';
export type EconomySettings={initialCash:number;kegs:number;jars:number;minutesPerDay:number;tailDays:number;artisan:boolean;tiller:boolean;strategy:'raw'|'process';dehydrators?:number;millDailyLimit?:number;casks?:number;wineAgeDays?:14|28|56};
type Batch={recipe:DailyRecipe;crop:string;batches:number;due:number};
export type DayLedger={day:number;openingCash:number;received:number;seedCost:number;harvested:number;loaded:number;completed:number;rawSold:number;processedSold:number;sales:number;inventory:number;inFlight:number;wineWaiting:number;casksBusy:number;agedWineSold:number;closingCash:number};
export function farmMachines(plan:Plan){
 const indoor={kegs:0,jars:0,dehydrators:0},outdoor={kegs:0,jars:0,dehydrators:0},outdoorExcluded={kegs:0,jars:0,dehydrators:0};
 let blockedKegs=0,blockedJars=0,blockedDehydrators=0,rooms=0;
 for(const o of plan.objects){if(!o.interior)continue;rooms++;const v=availableMachines(o.interior);indoor.kegs+=v.kegs;indoor.jars+=v.jars;indoor.dehydrators+=v.dehydrators;blockedKegs+=v.blockedKegs;blockedJars+=v.blockedJars;blockedDehydrators+=v.blockedDehydrators;}
 const origin=suggestedWalkOrigin(plan),reachable=new Set(origin?analyzeFarmAccess(plan,origin).equipment.filter(e=>e.distance!==null).map(e=>e.id):[]);
 for(const o of plan.objects){const key=o.itemId==='machine-keg'?'kegs':o.itemId==='machine-jar'?'jars':o.itemId==='machine-dehydrator'?'dehydrators':null;if(key)(reachable.has(o.id)?outdoor:outdoorExcluded)[key]++;}
 return {kegs:indoor.kegs+outdoor.kegs,jars:indoor.jars+outdoor.jars,dehydrators:indoor.dehydrators+outdoor.dehydrators,blockedKegs,blockedJars,blockedDehydrators,rooms,indoor,outdoor,outdoorExcluded,origin};
}
export function simulateEconomy(input:SeasonInput,allocation:Allocation[],s:EconomySettings){
 const whole=(n:number,min:number,max:number)=>Number.isInteger(n)&&n>=min&&n<=max;
 if(!whole(input.start,1,28)||!whole(input.plots,0,100)||!whole(input.budget,0,20000)||!['spring','summer','autumn','winter'].includes(input.season)||!whole(s.initialCash,0,100000000)||!whole(s.kegs,0,10000)||!whole(s.jars,0,10000)||!whole(s.minutesPerDay,1,2000)||!whole(s.tailDays,0,112)||!whole(s.dehydrators??0,0,10000)||!whole(s.millDailyLimit??0,0,10000)||!whole(s.casks??0,0,10000)||![14,28,56].includes(s.wineAgeDays??28)||!['raw','process'].includes(s.strategy))throw Error('Invalid economy settings.');
 const harvests=new Map<number,Map<string,number>>(),costs=new Map<number,number>(),rawPrices=new Map<string,number>();
 const allowed=new Set(eligible(input).map(c=>c.id));let plannedCost=0,tiles=0,rawBaseline=0,totalHarvest=0;
 for(const a of allocation){const crop=cropById.get(a.cycle.crop.id);if(!crop||!allowed.has(crop.id)||!whole(a.tiles,1,100))throw Error('Invalid planting allocation');const canonical=cycles(crop,input.start,input.replant,input).find(c=>c.days.length===a.cycle.days.length&&c.days.every((d,i)=>d===a.cycle.days[i]));if(!canonical)throw Error('Unsupported harvest schedule');tiles+=a.tiles;plannedCost+=canonical.cost*a.tiles;const raw=rawCropPrice(crop.price,input.quality,s.tiller&&cropReceivesTiller(crop));rawPrices.set(crop.id,raw);for(const day of canonical.days){const n=a.tiles*crop.yield,arr=harvests.get(day)??new Map<string,number>();arr.set(crop.id,(arr.get(crop.id)||0)+n);harvests.set(day,arr);rawBaseline+=raw*n;totalHarvest+=n}const purchaseDays=crop.regrow?[input.start]:[input.start,...canonical.days.slice(0,-1)];for(const day of purchaseDays)costs.set(day,(costs.get(day)||0)+a.tiles*crop.seed);costs.set(input.start,(costs.get(input.start)||0)+canonical.fertilizerCost*a.tiles)}
 if(tiles>input.plots||plannedCost>input.budget||plannedCost>s.initialCash)throw Error('Initial cash must cover the complete planned seed cost; the simulator does not borrow or change the planting plan.');
 const stock=new Map<string,number>(),pending:Batch[]=[],ledger:DayLedger[]=[];
 const capacity:Record<PrimaryMachine,number>={'Keg':s.kegs,'Preserves jar':s.jars,Dehydrator:s.dehydrators??0,Mill:s.millDailyLimit??0},free={...capacity};
 const wineStock=new Map<string,number>(),aging:{crop:string;units:number;due:number;price:number}[]=[];
 const caskCount=s.strategy==='process'?(s.casks??0):0,ageDays=s.wineAgeDays??28;
 let freeCasks=caskCount,wineProduced=0,wineSold=0,agedSold=0;
 const horizon=plantingHorizon(input)+s.tailDays;let cash=s.initialCash,receivable=0,totalSales=0,seedSpend=0,totalProcessed=0,totalRawSold=0;
 const recipes=[...rawPrices].flatMap(([crop,raw])=>dailyRecipes(cropById.get(crop)!,s.minutesPerDay,s.artisan).map(recipe=>({crop,recipe,gain:recipe.price*recipe.outputs-raw*recipe.inputs}))).filter(r=>r.gain>0&&capacity[r.recipe.machine]>0).sort((a,b)=>b.gain-a.gain||a.recipe.duration-b.recipe.duration||a.crop.localeCompare(b.crop)||a.recipe.machine.localeCompare(b.recipe.machine));
 for(let day=1;day<=horizon;day++){const openingCash=cash,received=receivable;cash+=received;receivable=0;const seedCost=costs.get(day)||0;cash-=seedCost;seedSpend+=seedCost;let harvested=0,loaded=0,completed=0,rawSold=0,processedSold=0,sales=0,agedWineSold=0;
 for(let i=aging.length-1;i>=0;i--){const b=aging[i];if(b.due>day)continue;freeCasks+=b.units;wineSold+=b.units;agedSold+=b.units;agedWineSold+=b.units;processedSold+=b.units;sales+=b.units*b.price;aging.splice(i,1)}
 for(let i=pending.length-1;i>=0;i--){const b=pending[i];if(b.due>day)continue;const r=b.recipe,n=b.batches*r.outputs;free[r.machine]+=b.batches;completed+=b.batches*r.inputs;if(r.wine){wineStock.set(b.crop,(wineStock.get(b.crop)??0)+n);wineProduced+=n}else{processedSold+=n;sales+=n*r.price}pending.splice(i,1)}
 // Wine produced this morning may immediately enter a free cellar cask.
 const wineOrder=[...wineStock.keys()].sort((a,b)=>cropById.get(b)!.price-cropById.get(a)!.price||a.localeCompare(b));
 for(const crop of wineOrder){let n=wineStock.get(crop)??0;if(!n)continue;const base=cropById.get(crop)!.price*3,normal=Math.floor(base*(s.artisan?140:100)/100);
  if(caskCount&&day+ageDays<=horizon){const units=Math.min(n,freeCasks);if(units){freeCasks-=units;n-=units;aging.push({crop,units,due:day+ageDays,price:agedWinePrice(base,ageDays,s.artisan)})}}
  if(n&&(!caskCount||day+ageDays>horizon)){wineSold+=n;processedSold+=n;sales+=n*normal;n=0}
  wineStock.set(crop,n);
 }
 for(const [crop,n] of harvests.get(day)??[]){stock.set(crop,(stock.get(crop)||0)+n);harvested+=n}
 if(s.strategy==='process')for(const {crop,recipe} of recipes){if(day+recipe.duration>horizon)continue;const batches=Math.min(free[recipe.machine],Math.floor((stock.get(crop)||0)/recipe.inputs));if(!batches)continue;free[recipe.machine]-=batches;stock.set(crop,(stock.get(crop)||0)-batches*recipe.inputs);pending.push({recipe,crop,batches,due:day+recipe.duration});loaded+=batches*recipe.inputs}
 for(const [crop,n] of stock){if(!n)continue;const future=s.strategy==='process'&&day<horizon&&recipes.some(r=>r.crop===crop&&day+r.recipe.duration<=horizon);if(future)continue;rawSold+=n;sales+=n*rawPrices.get(crop)!;stock.set(crop,0)}
 receivable=sales;totalSales+=sales;totalProcessed+=completed;totalRawSold+=rawSold;
 for(const machine of Object.keys(capacity) as PrimaryMachine[])if(free[machine]<0||free[machine]+pending.filter(b=>b.recipe.machine===machine).reduce((n,b)=>n+b.batches,0)!==capacity[machine])throw Error('Device capacity check failed');
 if(freeCasks<0||freeCasks+aging.reduce((n,b)=>n+b.units,0)!==caskCount||cash<0)throw Error('Cellar or cash constraint failed');
 ledger.push({day,openingCash,received,seedCost,harvested,loaded,completed,rawSold,processedSold,sales,inventory:[...stock.values()].reduce((a,b)=>a+b,0),inFlight:pending.reduce((a,b)=>a+b.batches*b.recipe.inputs,0),wineWaiting:[...wineStock.values()].reduce((a,b)=>a+b,0),casksBusy:caskCount-freeCasks,agedWineSold,closingCash:cash})
 }
 if(pending.length||aging.length||[...stock.values(),...wineStock.values()].some(n=>n!==0)||wineProduced!==wineSold||totalHarvest!==totalProcessed+totalRawSold||seedSpend!==plannedCost||cash+receivable!==s.initialCash+totalSales-seedSpend)throw Error('Economy conservation check failed');
 return {ledger,totalHarvest,totalProcessed,totalRawSold,wineProduced,wineSold,agedSold,seedSpend,totalSales,rawBaseline,additionalValue:totalSales-rawBaseline,net:totalSales-seedSpend,closingCash:cash,finalReceivable:receivable,settledCash:cash+receivable,horizon};
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
 if (settings.kegs > 0 || settings.jars > 0 || (settings.dehydrators??0)>0 || (settings.millDailyLimit??0)>0) {
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
