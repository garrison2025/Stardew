import {test} from 'node:test';
import assert from 'node:assert/strict';
import {qualityProbabilities,expectedHarvestPrice} from '../src/lib/crop-scenarios.ts';
function near(a:number,b:number){assert.ok(Math.abs(a-b)<1e-9,a+' != '+b)}
test('level ten without fertilizer follows conditional quality rolls',()=>{const q=qualityProbabilities(10,0);near(q.normal,.4582);near(q.silver,.3318);near(q.gold,.21);near(q.iridium,0)});
test('deluxe fertilizer never produces normal quality, including boosted level',()=>{const q=qualityProbabilities(10,3);near(q.iridium,.405);near(q.gold,.48195);near(q.silver,.11305);near(q.normal,0);const boosted=qualityProbabilities(14,3);near(boosted.iridium,.545);near(boosted.gold,.455)});
test('quality probabilities sum to one; additional berries are normal quality',()=>{for(let level=0;level<=14;level++)for(const f of [0,1,2,3] as const){const q=qualityProbabilities(level,f);near(Object.values(q).reduce((a,b)=>a+b,0),1);assert.ok(Object.values(q).every(p=>p>=0&&p<=1))}near(expectedHarvestPrice(50,3,10,0)-expectedHarvestPrice(50,1,10,0),100);assert.throws(()=>qualityProbabilities(15,0));});

// Rounded reference values from https://stardewvalleywiki.com/Farming#Crop_Quality_Frequency (2026-11-28).
// Wiki integer columns sometimes adjust rounding to sum to 100 (max difference 0.665 pp).
const wikiQuality=[[[97,2,1],[91,6,3],[85,10,5],[80,13,7],[75,16,9],[69,20,11],[64,23,13],[60,25,15],[55,28,17],[50,31,19],[46,33,21],[42,35,23],[38,37,25],[34,39,27],[30,41,29]],[[88,8,4],[77,15,8],[68,20,12],[59,26,15],[50,31,19],[42,35,23],[35,39,26],[28,42,30],[22,44,34],[16,47,37],[15,44,41],[14,41,45],[13,39,48],[12,36,52],[11,33,56]],[[78,14,8],[64,23,13],[52,30,18],[40,36,24],[30,41,29],[21,45,34],[15,45,40],[14,41,45],[13,37,50],[11,33,56],[10,29,61],[9,25,66],[7,21,72],[6,17,77],[4,13,82]],[[0,84,10,6],[0,75,16,9],[0,66,22,13],[0,57,27,16],[0,49,31,20],[0,42,35,23],[0,35,39,27],[0,28,42,30],[0,22,45,34],[0,16,47,37],[0,11,48,41],[0,7,49,44],[0,3,50,47],[0,0,49,51],[0,0,46,55]]];
test('all 60 published farming-level and quality-fertilizer rows agree within integer display rounding',()=>{
 for(const f of [0,1,2,3] as const)for(let level=0;level<=14;level++){
  const q=qualityProbabilities(level,f),a=[q.normal,q.silver,q.gold,q.iridium],e=wikiQuality[f][level];
  for(let i=0;i<4;i++)assert.ok(Math.abs(a[i]*100-(e[i]??0))<=.67, 'quality reference '+[f,level,i,a[i],e[i]].join('/'));
 }
});

import {expectedCropHarvest,EXTRA_HARVEST_CHANCE} from '../src/lib/crop-scenarios.ts';
import {SEASON_CROPS,OWNED_CROPS} from '../src/lib/crop-data.ts';
const findCrop=(id:string)=>[...SEASON_CROPS,...OWNED_CROPS].find(c=>c.id===id)!;
test('nine repeating extra harvest chances match the independent 1.6.15 crop data',()=>{
 const rows=[['potato',1.25],['strawberry',1.0204081632653061],['blueberry',3.020408163265306],['tomato',1.0526315789473684],['hot-pepper',1.0309278350515463],['cranberries',2.111111111111111],['eggplant',1.002004008016032],['coffee-bean',4.020408163265306],['unmilled-rice',1.1111111111111112]] as const;
 assert.equal(Object.keys(EXTRA_HARVEST_CHANCE).length,9);
 for(const [id,want] of rows)near(expectedCropHarvest(findCrop(id),0,0).expectedUnits,want);
 near(expectedCropHarvest(findCrop('unmilled-rice'),9,0).expectedUnits,1.1111111111111112);
 near(expectedCropHarvest(findCrop('unmilled-rice'),10,0).expectedUnits,1.6111111111111112);
 near(expectedCropHarvest(findCrop('potato'),10,3).revenue-expectedCropHarvest(findCrop('potato'),10,3,false,{includeExtra:false}).revenue,20);
});
test('all 43 crops preserve guaranteed yield and quality-only estimate when extra yield disabled',()=>{
 for(const c of [...SEASON_CROPS,...OWNED_CROPS])for(let level=0;level<=14;level++)for(const f of [0,1,2,3] as const){
  const a=expectedCropHarvest(c,level,f,false,{includeExtra:false}),b=expectedCropHarvest(c,level,f);
  near(a.expectedUnits,c.yield);near(a.revenue,expectedHarvestPrice(c.price,c.yield,level,f));assert.ok(b.expectedUnits>=a.expectedUnits&&b.revenue>=a.revenue);
 }
});
test('optional rare hand-harvest doubling does not apply to scythe crops or guaranteed mode',()=>{
 const opts={includeExtra:true,handHarvest:true,dailyLuck:.1,luckLevel:5};
 const potato=expectedCropHarvest(findCrop('potato'),10,0,false,opts);near(potato.expectedUnits,1.25*(1+5/1500+.1/1200+.0001));
 assert.equal(expectedCropHarvest(findCrop('unmilled-rice'),10,0,false,opts).doubleChance,0);
 assert.equal(expectedCropHarvest(findCrop('potato'),10,0,false,{...opts,includeExtra:false}).doubleChance,0);
});
