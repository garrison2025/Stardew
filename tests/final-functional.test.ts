import test from 'node:test';import assert from 'node:assert/strict';
import {extraProcessing,wineAging} from '../src/lib/extra-processing.ts';
import {observedFairCandidates} from '../src/lib/fair-stock.ts';
test('dehydrator whole batches, mill output, and separate cellar alternatives',()=>{
 const input={crop:'blueberry',stock:12,quality:0 as const,days:1,dehydrators:1,mill:true,tiller:false,artisan:false};
 const r=extraProcessing(input).alternatives.find(x=>x.label==='Dried Fruit')!;assert.equal(r.used,5);assert.equal(r.remaining,7);assert.equal(r.output,1);assert.equal(r.revenue,750);
 const m=extraProcessing({...input,crop:'beet'}).alternatives.find(x=>x.label==='Sugar')!;assert.equal(m.output,36);assert.equal(m.revenue,1800);
 const a=wineAging(750,10,2,28,false).find(x=>x.quality==='Gold')!;assert.equal(a.aged,2);assert.equal(a.revenue,8250);
 assert.equal(wineAging(750,10,2,0,false).every(x=>x.gain===0),true);
});
test('Fair stock merges recognized qualities only when requested',()=>{
 const b={scope:'player-backpack' as const,stacks:[{id:'72',quality:0 as const,quantity:2}],unmapped:0},s={scope:'recognized-location-storage' as const,containers:1,skippedContainers:0,unmapped:0,stacks:[{id:'72',quality:0 as const,quantity:3}]};
 assert.equal(observedFairCandidates(b,s,false).rows[0].quantity,2);assert.equal(observedFairCandidates(b,s,true).rows[0].quantity,5);assert.equal(observedFairCandidates(b,s,true).rows[0].price,0);assert.equal(observedFairCandidates(b,s,true,'nonmatching').rows.length,0);
});
