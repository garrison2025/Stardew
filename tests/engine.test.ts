import test from 'node:test';import assert from 'node:assert/strict';import {coverage,suggest,cropProfit,optimizeCrops,aggregateIngredients,summarizeWeights,verifySaveText} from '../src/lib/engine.ts';
test('coverage clips boundaries and excludes devices',()=>{assert.equal(coverage(3,3,[{x:0,y:0,kind:'sprinkler'}],1).size,3)});
test('optimizer preserves locked cells and unique coordinates',()=>{const fixed={x:1,y:1,kind:'building'} as const;const cells=suggest(4,4,[fixed],1,3);assert.deepEqual(cells[0],fixed);assert.equal(new Set(cells.map(c=>c.x+','+c.y)).size,cells.length);assert.ok(cells.length<=4)});
const crop={name:'A',seed:10,price:20,growth:5,regrow:3,yield:1};
test('harvest boundary and regrowth',()=>{assert.equal(cropProfit(crop,4,1).profit,-10);assert.equal(cropProfit(crop,5,1).profit,10);assert.equal(cropProfit(crop,8,1).profit,30)});
test('exact budget solution versus small brute force',()=>{const other={...crop,name:'B',seed:15,price:42,regrow:0};let best=0;for(let a=0;a<=5;a++)for(let b=0;b<=5-a;b++)if(a*10+b*15<=35)best=Math.max(best,a*30+b*27);assert.equal(optimizeCrops([crop,other],8,5,35).profit,best)});
test('negative profit may leave land empty',()=>{assert.equal(optimizeCrops([crop],0,10,100).profit,0)});
test('reject malformed values',()=>{assert.throws(()=>cropProfit(crop,-1,1));assert.throws(()=>verifySaveText('<!DOCTYPE x [<!ENTITY e SYSTEM "file:///etc/passwd">]>'));});
test('aggregate and weighted empty state',()=>{assert.deepEqual(aggregateIngredients(['Wood: 2','Wood: 3']),[['Wood',5]]);assert.equal(summarizeWeights([]).percent,null)});
