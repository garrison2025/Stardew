import test from 'node:test';import assert from 'node:assert/strict';import {demoPlan,attachInterior,decodePlan,moveSelection,roomForItem} from '../src/lib/map-model.ts';import {emptyInterior} from '../src/lib/indoor-model.ts';import {copyObjects,pasteObjects} from '../src/lib/map-batch.ts';import {encodeShare,decodeShare} from '../src/lib/scene-share.ts';import {estimateProcessing,availableMachines,type ProcessInput} from '../src/lib/processing.ts';
test('linked rooms roundtrip and copy, reject mismatched room',()=>{const p=demoPlan(),b=p.objects.find(o=>o.itemId==='barn')!,room={...emptyInterior('barn'),cells:{'12':'keg' as const}};assert.ok(b);const next=attachInterior(p,b.id,room);assert.deepEqual(decodePlan(JSON.parse(JSON.stringify(next))),next);assert.equal(p.objects.find(o=>o.id===b.id)?.interior,undefined);assert.throws(()=>attachInterior(p,b.id,emptyInterior('shed')));assert.deepEqual(copyObjects(next,new Set([b.id]))[0].interior,room);assert.ok(decodeShare(encodeShare(next)).objects.every(o=>o.interior===undefined));assert.equal(roomForItem('seedling'),null)});
test('linked rooms travel with building, are retained by independent project copies',()=>{const p=demoPlan(),b=p.objects.find(o=>o.itemId==='barn')!,next=attachInterior(p,b.id,emptyInterior('barn'));const copy=copyObjects(next,new Set([b.id]));assert.deepEqual(copy[0].interior,emptyInterior('barn'));const noBuilding={...next,objects:next.objects.filter(o=>o.id!==b.id)};assert.deepEqual(pasteObjects(noBuilding,copy,{x:b.x,y:b.y}).objects.at(-1)?.interior,emptyInterior('barn'));assert.throws(()=>decodePlan({...p,objects:p.objects.map(o=>o.id===b.id?{...o,interior:emptyInterior('shed')}:o)}))});
const input:ProcessInput={crop:'blueberry',stock:10,minutes:10000,quality:0,artisan:false,tiller:false,kegs:2,jars:3};
test('shared stock is allocated once and finished batches counted',()=>{const r=estimateProcessing(input);assert.equal(r.processed,8);assert.equal(r.remaining,2);assert.equal(r.rawRevenue,500);assert.equal(r.totalRevenue,1300);assert.equal(r.increment,800);assert.equal(r.rows.reduce((n,v)=>n+v.units,0),8);const q=estimateProcessing({...input,crop:'pumpkin',stock:1,kegs:1,jars:1,minutes:6000});assert.equal(q.rows.find(v=>v.machine==='Keg')?.price,720);assert.equal(q.rows.find(v=>v.machine==='Preserves jar')?.price,690);assert.equal(q.processed,1)});
test('quality opportunity cost and zero capacity',()=>{const r=estimateProcessing({...input,crop:'pumpkin',quality:3,tiller:true,stock:10,kegs:0,jars:10});assert.equal(r.raw,704);assert.equal(r.processed,0);assert.equal(r.increment,0);assert.equal(estimateProcessing({...input,minutes:3999}).processed,0);assert.throws(()=>estimateProcessing({...input,crop:'poppy'}));assert.throws(()=>estimateProcessing({...input,stock:-1}))});
test('only accessible supported devices counted',()=>{const p={...emptyInterior('shed'),cells:{'0':'keg' as const,'1':'jar' as const,'11':'chest' as const}};assert.deepEqual(availableMachines(p),{kegs:0,jars:1,blockedKegs:1,blockedJars:0,dehydrators:0,blockedDehydrators:0})});

test('independent keg and jar price, duration and input-count examples',()=>{
 // Wiki Keg Productivity and Preserves Jar Productivity, checked 2026-11-28.
 const cases=[['wheat','Beer',1750,200,1],['hops','Pale Ale',2250,300,1],['coffee-bean','Coffee',120,150,5],['starfruit','Wine',10000,2250,1],['ancient-fruit','Wine',10000,1650,1],['amaranth','Juice',6000,337,1]] as const;
 for(const [crop,product,minutes,price,stock] of cases){
  const r=estimateProcessing({...input,crop,minutes,stock,kegs:1,jars:0});const keg=r.rows.find(v=>v.machine==='Keg')!;
  assert.equal(keg.product,product,crop);assert.equal(keg.minutes,minutes,crop);assert.equal(keg.price,price,crop);assert.equal(keg.units,stock,crop);assert.equal(keg.outputUnits,1,crop);assert.equal(r.totalRevenue,price,crop);
  assert.equal(estimateProcessing({...input,crop,minutes:minutes-1,stock,kegs:1,jars:0}).processed,0,crop);
 }
 const coffee=estimateProcessing({...input,crop:'coffee-bean',stock:7,minutes:120,kegs:1,jars:1,artisan:true,tiller:true});
 assert.equal(coffee.raw,15);assert.equal(coffee.rows.length,1);assert.equal(coffee.processed,5);assert.equal(coffee.remaining,2);assert.equal(coffee.totalRevenue,180);
 assert.equal(estimateProcessing({...input,crop:'coffee-bean',stock:4,minutes:240,kegs:1,jars:0}).processed,0);
 const jar=estimateProcessing({...input,crop:'amaranth',stock:1,minutes:4000,kegs:0,jars:1,quality:1,tiller:true,artisan:true});
 assert.equal(jar.raw,205);assert.equal(jar.totalRevenue,490);
});

import {extraProcessing,wineAging} from '../src/lib/extra-processing.ts';
import {dailyRecipes} from '../src/lib/economy-recipes.ts';
import {SEASON_CROPS,OWNED_CROPS} from '../src/lib/crop-data.ts';
test('all supported crop recipes share prices and input/output units across calculators',()=>{
 for(const crop of [...SEASON_CROPS,...OWNED_CROPS])for(const artisan of [false,true]){
  const rs=dailyRecipes(crop,1600,artisan);
  for(const recipe of rs){
   if(recipe.machine==='Keg'||recipe.machine==='Preserves jar'){
    const row=estimateProcessing({...input,crop:crop.id,stock:recipe.inputs,minutes:20000,kegs:recipe.machine==='Keg'?1:0,jars:recipe.machine==='Preserves jar'?1:0,artisan}).rows.find(r=>r.machine===recipe.machine)!;
    assert.equal(row.price,recipe.price,crop.id);assert.equal(row.inputs,recipe.inputs);assert.equal(row.outputs,recipe.outputs);
   }else{
    const row=extraProcessing({crop:crop.id,stock:recipe.inputs,days:1,dehydrators:1,mill:true,quality:0,tiller:false,artisan}).alternatives.find(r=>r.label===recipe.product)!;
    assert.equal(row.unitPrice,recipe.price,crop.id);assert.equal(row.used,recipe.inputs);assert.equal(row.output,recipe.outputs);
   }
  }
 }
});
test('published artisan prices, mill yields and cask targets are preserved',()=>{
 const juice=estimateProcessing({...input,crop:'amaranth',stock:1,minutes:6000,kegs:1,jars:0,artisan:true,tiller:true,quality:1});
 assert.equal(juice.raw,205);assert.equal(juice.totalRevenue,471);
 const extra=(crop:string,stock:number,artisan:boolean)=>extraProcessing({crop,stock,days:1,dehydrators:1,mill:true,quality:0,tiller:false,artisan}).alternatives[0];
 assert.equal(extra('grape',5,true).revenue,840);assert.equal(extra('blueberry',5,true).revenue,560);
 assert.equal(extra('beet',1,true).revenue,150);assert.equal(extra('wheat',1,true).revenue,50);assert.equal(extra('unmilled-rice',1,true).revenue,100);
 assert.equal(wineAging(2250,1,1,56,true).find(r=>r.quality==='Iridium')!.revenue,6300);
});

import {scheduledBatches} from '../src/lib/processing.ts';
test('processing collection schedules respect overnight clock and horizon',()=>{
 assert.equal(scheduledBatches(1600,120,'instant'),13);
 assert.equal(scheduledBatches(1600,120,'morning'),1);
 assert.equal(scheduledBatches(1600,120,'four-times'),4);
 assert.equal(scheduledBatches(10000,10000,'morning'),0);
 assert.equal(scheduledBatches(11200,10000,'morning'),1);
 assert.equal(scheduledBatches(8000,4000,'instant'),2);
 assert.equal(scheduledBatches(8000,4000,'morning'),1);
 assert.equal(scheduledBatches(4280,4000,'four-times'),1);
 assert.equal(scheduledBatches(4279,4000,'four-times'),0);
 for(const d of [120,1750,2250,4000,6000,10000])for(const h of [0,1,1600,4280,8000,16000])assert.ok(scheduledBatches(h,d,'morning')<=scheduledBatches(h,d,'four-times')&&scheduledBatches(h,d,'four-times')<=scheduledBatches(h,d,'instant'));
 const r=estimateProcessing({...input,crop:'coffee-bean',stock:20,minutes:1600,kegs:1,jars:0,pickup:'four-times'});
 assert.equal(r.processed,20);assert.equal(r.totalRevenue,600);
});
