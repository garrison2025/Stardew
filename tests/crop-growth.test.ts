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
 const grape=growthProfile(crop('grape'),{...setting,fertilizer:'hyper',agriculturist:true});assert.equal(grape.days,5);assert.deepEqual(grape.phases,[1,0,0,2,2]);assert.equal(grape.unappliedDays,0);
 assert.equal(growthProfile(crop('unmilled-rice'),{...setting,irrigated:true,fertilizer:'deluxe'}).days,4);
 for(const c of [...SEASON_CROPS,...OWNED_CROPS])for(const fertilizer of ['none','speed','deluxe','hyper'] as const)for(const agriculturist of [false,true])for(const irrigated of [false,true]){const r=growthProfile(c,{...setting,fertilizer,agriculturist,irrigated});assert.ok(r.days>=1&&r.days<=c.growth);assert.ok(r.phases.every(n=>n>=0));}
});

// Individual 1.6.15 game-data-derived pages: https://stardew.gs/crops/<id>/.
test('independent game-data phase sequences for selected crops',()=>{
 const expected:Record<string,number[]>={'green-bean':[1,1,1,3,4],hops:[1,1,2,3,4],grape:[1,1,2,3,3],'unmilled-rice':[1,2,2,3],'taro-root':[1,2,3,4],carrot:[1,1,1],'summer-squash':[1,1,1,1,2],broccoli:[1,2,2,3],powdermelon:[1,1,1,2,2],'coffee-bean':[1,2,2,3,2],pineapple:[1,3,3,4,3],cranberries:[1,2,1,1,2],blueberry:[1,3,3,4,2],starfruit:[2,3,2,3,3],strawberry:[1,1,2,2,2],potato:[1,1,1,2,1],tomato:[2,2,2,2,3],pumpkin:[1,2,3,4,3],amaranth:[1,2,2,2],corn:[2,3,3,3,3],melon:[1,2,3,3,3],'hot-pepper':[1,1,1,1,1],'blue-jazz':[1,2,2,2],'summer-spangle':[1,2,3,2],poppy:[1,2,2,2]};
 for(const [id,phases] of Object.entries(expected))assert.deepEqual(CROP_PHASES[id],phases,id);
});

// Remaining 18 phases transcribed as numerical facts from stardew.gs 1.6.15 crop pages.
test('remaining eighteen independent phase sequences',()=>{
 const expected={"parsnip":[1,1,1,1],"cauliflower":[1,2,4,4,1],"kale":[1,2,2,1],"radish":[2,1,2,1],"wheat":[1,1,1,1],"eggplant":[1,1,1,1,1],"yam":[1,3,3,3],"bok-choy":[1,1,1,1],"tulip":[1,1,2,2],"garlic":[1,1,1,1],"rhubarb":[2,2,2,3,4],"sunflower":[1,2,3,2],"red-cabbage":[2,1,2,2,2],"fairy-rose":[1,4,4,3],"artichoke":[2,2,1,2,1],"beet":[1,1,2,2],"ancient-fruit":[2,7,7,7,5],"sweet-gem-berry":[2,4,6,6,6]};
 for(const [id,phases] of Object.entries(expected))assert.deepEqual(CROP_PHASES[id],phases,id);
});
// Independently calculated elapsed days: base minus min(rounded requested reduction,
// sum of positive removable days, capped at 3 per phase and retaining first day).
// 1.6 changelog explicitly fixes negative phase durations. Reference, not gameplay.
const modernDays:Record<string,number[]>={"parsnip":[4,3,3,2,3,3,2,2],"potato":[6,5,4,4,5,4,3,3],"cauliflower":[12,10,9,8,10,9,7,6],"green-bean":[10,9,7,6,9,8,6,5],"kale":[6,5,4,4,5,4,3,3],"strawberry":[8,7,6,5,7,6,5,4],"blueberry":[13,11,9,8,11,10,8,7],"melon":[12,10,9,8,10,9,7,6],"corn":[14,12,10,9,12,11,9,7],"tomato":[11,9,8,7,9,8,7,6],"hot-pepper":[5,4,3,3,4,4,3,2],"radish":[6,5,4,4,5,4,3,3],"wheat":[4,3,3,2,3,3,2,2],"cranberries":[7,6,5,4,6,5,4,3],"pumpkin":[13,11,9,8,11,10,8,7],"eggplant":[5,4,3,3,4,4,3,2],"yam":[10,9,7,6,9,8,6,5],"bok-choy":[4,3,3,2,3,3,2,2],"grape":[10,9,7,6,9,8,6,5],"blue-jazz":[7,6,5,4,6,5,4,3],"tulip":[6,5,4,4,5,4,3,3],"garlic":[4,3,3,2,3,3,2,2],"rhubarb":[13,11,9,8,11,10,8,7],"unmilled-rice":[8,7,6,5,7,6,5,4,6,5,4,3,5,4,3,2],"hops":[11,9,8,7,9,8,7,6],"poppy":[7,6,5,4,6,5,4,3],"red-cabbage":[9,8,6,6,8,7,5,5],"starfruit":[13,11,9,8,11,10,8,7],"summer-spangle":[8,7,6,5,7,6,5,4],"sunflower":[8,7,6,5,7,6,5,4],"amaranth":[7,6,5,4,6,5,4,3],"artichoke":[8,7,6,5,7,6,5,4],"beet":[6,5,4,4,5,4,3,3],"fairy-rose":[12,10,9,8,10,9,7,6],"carrot":[3,2,2,2,2,2,1,1],"summer-squash":[6,5,4,4,5,4,3,3],"broccoli":[8,7,6,5,7,6,5,4],"powdermelon":[7,6,5,4,6,5,4,3],"ancient-fruit":[28,25,21,18,25,22,18,15],"pineapple":[14,12,10,9,12,11,9,7],"taro-root":[10,9,7,6,9,8,6,5,7,6,5,4,6,5,4,3],"coffee-bean":[10,9,7,6,9,8,6,5],"sweet-gem-berry":[24,21,18,16,21,19,15,13]};
test('360 unique 1.6 fertilizer, Agriculturist and paddy combinations',()=>{
 let total=0;
 for(const c of [...SEASON_CROPS,...OWNED_CROPS]){
  let i=0;const expected=modernDays[c.id];
  for(const irrigated of ['unmilled-rice','taro-root'].includes(c.id)?[false,true]:[false])
   for(const agriculturist of [false,true])for(const fertilizer of ['none','speed','deluxe','hyper'] as const){
    assert.equal(growthProfile(c,{...setting,irrigated,agriculturist,fertilizer}).days,expected[i++],c.id+' '+fertilizer+' '+agriculturist+' '+irrigated);total++;
   }
  assert.equal(i,expected.length);
 }
 assert.equal(total,360);
});
