import test from 'node:test';import assert from 'node:assert/strict';import {simulateEconomy,farmMachines,compareFarmEconomy,type EconomySettings} from '../src/lib/farm-economy.ts';import {cycles,optimizeSeason,type SeasonInput} from '../src/lib/season-crops.ts';import {cropById} from '../src/lib/crop-data.ts';import {demoPlan,attachInterior} from '../src/lib/map-model.ts';import {emptyInterior} from '../src/lib/indoor-model.ts';
const input:SeasonInput={season:'summer',start:1,plots:1,budget:80,replant:false,strawberry:false,trellis:false};
const a=[{cycle:cycles(cropById.get('blueberry')!,1,false)[0],tiles:1}];
const settings:EconomySettings={initialCash:80,kegs:0,jars:1,minutesPerDay:1440,tailDays:7,artisan:false,tiller:false,strategy:'process'};
test('daily harvest, whole-day collection and next morning receipts',()=>{const r=simulateEconomy(input,a,settings);assert.equal(r.ledger[0].seedCost,80);assert.equal(r.ledger[13].harvested,3);assert.equal(r.ledger[13].loaded,1);assert.equal(r.ledger[15].completed,0);assert.equal(r.ledger[16].completed,1);assert.equal(r.ledger[16].sales,150);assert.equal(r.ledger[17].received,150);assert.equal(r.totalHarvest,12);assert.equal(r.totalProcessed,7);assert.equal(r.totalRawSold,5);assert.equal(r.net,7*150+5*50-80);assert.equal(r.settledCash,settings.initialCash+r.net)});
test('raw baseline and no duplicate inventory',()=>{const r=simulateEconomy(input,a,{...settings,strategy:'raw',tailDays:0});assert.equal(r.totalSales,600);assert.equal(r.net,520);assert.equal(r.totalProcessed,0);assert.equal(r.ledger[13].sales,150);assert.equal(r.ledger[14].received,150);assert.equal(r.additionalValue,0);const n=simulateEconomy(input,a,{...settings,tailDays:0,kegs:0,jars:0});assert.equal(n.totalSales,r.totalSales);assert.equal(n.totalHarvest,n.totalProcessed+n.totalRawSold)});
test('replant seed purchases and budget conservation',()=>{const i:SeasonInput={...input,season:'spring',plots:1,budget:120,replant:true};const alloc=[{cycle:cycles(cropById.get('parsnip')!,1,true).at(-1)!,tiles:1}];const r=simulateEconomy(i,alloc,{...settings,initialCash:120,strategy:'raw'});assert.deepEqual(r.ledger.filter(d=>d.seedCost).map(d=>d.day),[1,5,9,13,17,21]);assert.equal(r.seedSpend,120);assert.equal(r.totalHarvest,6);assert.throws(()=>simulateEconomy(i,alloc,{...settings,initialCash:119}));assert.throws(()=>simulateEconomy(i,[{...alloc[0],cycle:{...alloc[0].cycle,days:[2]}}],{...settings,initialCash:120}))});
test('mixed plan and zero inventory conservation, artisan affects output only',()=>{const i={...input,plots:20,budget:1000,replant:true};const a=optimizeSeason(i).allocation;const raw=simulateEconomy(i,a,{...settings,initialCash:1000,strategy:'raw'}),r=simulateEconomy(i,a,{...settings,initialCash:1000,kegs:4,jars:6,artisan:true});assert.equal(r.rawBaseline,raw.totalSales);assert.equal(r.totalHarvest,r.totalProcessed+r.totalRawSold);assert.ok(r.net>=raw.net);assert.equal(r.ledger.at(-1)!.inventory,0);assert.equal(r.ledger.at(-1)!.inFlight,0);assert.equal(simulateEconomy(input,[],settings).net,0)});
test('farm equipment counts exclude blocked machines',()=>{const p=demoPlan(),b=p.objects.find(o=>o.itemId==='barn')!;const next=attachInterior(p,b.id,{...emptyInterior('barn'),cells:{'12':'keg','13':'jar','24':'chest'}});const v=farmMachines(next);assert.equal(v.rooms,1);assert.equal(v.kegs+v.blockedKegs,1);assert.equal(v.jars+v.blockedJars,1);assert.equal(farmMachines(p).rooms,0)});

test('fertilizer costs, fixed quality and next-season harvests reach the economic ledger',()=>{
 const i:SeasonInput={...input,start:25,plots:1,budget:157,crossSeason:true,quality:2,tiller:true,
  fertilizer:{cropId:'corn',growthDays:12,cost:7}};
 const crop=cropById.get('corn')!;
 const cycle=cycles(crop,i.start,false,i)[0];
 const r=simulateEconomy(i,[{cycle,tiles:1}],{...settings,initialCash:157,strategy:'raw',tiller:true,tailDays:0});
 assert.equal(r.horizon,56);
 assert.equal(r.seedSpend,157);
 assert.equal(r.ledger[24].seedCost,157);
 assert.equal(r.ledger[36].harvested,1);
 assert.equal(r.totalSales,cycle.revenue);
 assert.equal(r.net,cycle.profit);
});

test('capacity comparison reports actual receipt days and never drops the baseline', () => {
 const result=compareFarmEconomy(input,a,settings);
 assert.equal(result.raw.net,520);
 assert.equal(result.raw.firstReceipt,15);
 assert.ok(result.current.net>=result.raw.net);
 assert.ok(result.alternative.net>=result.current.net);
 assert.ok(result.current.processed>0);
 const without=compareFarmEconomy(input,a,{...settings,jars:0});
 assert.equal(without.recommendation,null);
 assert.equal(without.current.net,without.raw.net);
});
