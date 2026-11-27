import {test} from 'node:test';
import assert from 'node:assert/strict';
import {qualityProbabilities,expectedHarvestPrice} from '../src/lib/crop-scenarios.ts';
function near(a:number,b:number){assert.ok(Math.abs(a-b)<1e-9,a+' != '+b)}
test('level ten without fertilizer follows conditional quality rolls',()=>{const q=qualityProbabilities(10,0);near(q.normal,.4582);near(q.silver,.3318);near(q.gold,.21);near(q.iridium,0)});
test('deluxe fertilizer never produces normal quality, including boosted level',()=>{const q=qualityProbabilities(10,3);near(q.iridium,.405);near(q.gold,.48195);near(q.silver,.11305);near(q.normal,0);const boosted=qualityProbabilities(14,3);near(boosted.iridium,.545);near(boosted.gold,.455)});
test('quality probabilities sum to one; additional berries are normal quality',()=>{for(let level=0;level<=14;level++)for(const f of [0,1,2,3] as const){const q=qualityProbabilities(level,f);near(Object.values(q).reduce((a,b)=>a+b,0),1);assert.ok(Object.values(q).every(p=>p>=0&&p<=1))}near(expectedHarvestPrice(50,3,10,0)-expectedHarvestPrice(50,1,10,0),100);assert.throws(()=>qualityProbabilities(15,0));});
