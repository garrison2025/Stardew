import test from 'node:test';
import assert from 'node:assert/strict';
import {CROP_PHASES,growthProfile,type GrowthSettings} from '../src/lib/crop-growth.ts';
import {SEASON_CROPS,OWNED_CROPS,cropById} from '../src/lib/crop-data.ts';
import {cycles,optimizeSeason,ownedSeedPlan,type SeasonInput} from '../src/lib/season-crops.ts';
const setting:GrowthSettings={fertilizer:'none',agriculturist:false,irrigated:false,cost:0};
const crop=(id:string)=>[...SEASON_CROPS,...OWNED_CROPS].find(c=>c.id===id)!;
test('all 43 source phase arrays sum to recorded base days',()=>{assert.equal(Object.keys(CROP_PHASES).length,43);for(const c of [...SEASON_CROPS,...OWNED_CROPS])assert.equal(growthProfile(c).days,c.growth)});
test('reference crop calendars and short growth stage rounding',()=>{
 const examples=[['parsnip',4,3,3,2,2],['cauliflower',12,10,9,8,6],['blueberry',13,11,9,8,7],['starfruit',13,11,9,8,7],['ancient-fruit',28,25,21,18,15]] as const;
 for(const [id,base,speed,deluxe,hyper,ag] of examples){
  for(const [fertilizer,want] of [['none',base],['speed',speed],['deluxe',deluxe],['hyper',hyper]] as const)assert.equal(growthProfile(crop(id),{...setting,fertilizer}).days,want,id+' '+fertilizer);
  assert.equal(growthProfile(crop(id),{...setting,fertilizer:'hyper',agriculturist:true}).days,ag);
 }
});
test('paddy growth only affects rice/taro; regrow is constant',()=>{
 assert.equal(growthProfile(crop('unmilled-rice'),{...setting,irrigated:true}).days,6);
 assert.equal(growthProfile(crop('taro-root'),{...setting,irrigated:true}).days,7);
 assert.equal(growthProfile(crop('parsnip'),{...setting,irrigated:true}).days,4);
 assert.deepEqual(cycles(crop('blueberry'),1,true,{season:'summer',growth:{...setting,fertilizer:'hyper'}})[0].days,[9,13,17,21,25]);
});
test('growth costs and manual overrides respect optimizer budget',()=>{
 const input:SeasonInput={season:'spring',start:25,plots:1,budget:27,replant:true,strawberry:false,trellis:false,growth:{...setting,fertilizer:'speed',cost:7}};
 const result=optimizeSeason(input);assert.equal(result.spent,27);assert.deepEqual(result.allocation[0].cycle.days,[28]);
 assert.equal(optimizeSeason({...input,budget:26}).planted,0);
 assert.equal(cycles(crop('parsnip'),25,true,{...input,fertilizer:{cropId:'parsnip',growthDays:4,cost:0}}).length,0);
});
test('owned ancient fruit crosses seasons; coffee and sweet gem berry exclude Tiller',()=>{
 const ancient=ownedSeedPlan('ancient-fruit','spring',1,1,1,0,{season:'spring',crossSeason:true,growth:{...setting,fertilizer:'hyper'}});
 assert.deepEqual(ancient.days,[19,26,33,40,47,54]);
 assert.deepEqual(ownedSeedPlan('coffee-bean','spring',1,1,1,0,{season:'spring',tiller:true}),ownedSeedPlan('coffee-bean','spring',1,1,1,0,{season:'spring'}));
 assert.equal(ownedSeedPlan('sweet-gem-berry','autumn',1,1,1,0,{season:'autumn',tiller:true}).revenue,3000);
});

test('documented stage reduction edge cases do not overpromise harvest dates',()=>{
 const grape=growthProfile(crop('grape'),{...setting,fertilizer:'hyper',agriculturist:true});assert.equal(grape.days,6);assert.deepEqual(grape.phases,[1,0,1,2,2]);assert.equal(grape.unappliedDays,1);
 assert.equal(growthProfile(crop('unmilled-rice'),{...setting,irrigated:true,fertilizer:'deluxe'}).days,4);
 for(const c of [...SEASON_CROPS,...OWNED_CROPS])for(const fertilizer of ['none','speed','deluxe','hyper'] as const)for(const agriculturist of [false,true])for(const irrigated of [false,true]){const r=growthProfile(c,{...setting,fertilizer,agriculturist,irrigated});assert.ok(r.days>=1&&r.days<=c.growth);assert.ok(r.phases.every(n=>n>=0));}
});
