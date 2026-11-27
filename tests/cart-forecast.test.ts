import test from 'node:test';
import assert from 'node:assert/strict';
import {hashWords,random} from '../src/lib/geode-prediction.ts';
import {forecastCart} from '../src/lib/cart-forecast.ts';

test('independent upstream RNG reference, modern and legacy seeded slot rolls', () => {
 const input = {gameId:'123456789',year:1,season:'autumn',day:1,legacy:false} as const;
 const names = (legacy: boolean, day: number) => forecastCart({...input,legacy}).find(v=>v.absoluteDay===day)?.offers.map(v=>v.label);
 assert.deepEqual(names(false,61),['Retro Catalogue']);
 assert.deepEqual(names(false,63),['Coffee Bean']);
 assert.deepEqual(names(true,63),[]);
 assert.deepEqual(names(true,70),['Snowman Rarecrow']);
 assert.deepEqual(names(false,77),['Retro Catalogue']);
});
test('only forest visit days, with season and year rolled over correctly', () => {
 const results=forecastCart({gameId:'1',year:1,season:'winter',day:27,legacy:false});
 assert.equal(results.length,8);
 assert.deepEqual(results.map(v=>v.absoluteDay),[112,117,119,124,126,131,133,138]);
 assert.equal(results[0].season,'winter');
 assert.equal(results[1].season,'spring');
 assert.equal(results[1].year,2);
 assert.throws(()=>forecastCart({gameId:'9007199254740993',year:1,season:'spring',day:1,legacy:false}));
});

test('route completion and Year 25 gate independent Forest Cart offers', () => {
 const input = {gameId:'123456789',year:1,season:'spring',day:1,legacy:false} as const;
 const at = (routeComplete: boolean, day: number) =>
   forecastCart({...input,communityCenterComplete:routeComplete}).find(v=>v.absoluteDay===day)?.offers.map(o=>o.label);
 assert.ok(!at(false,19)?.includes('Joja Catalogue'));
 assert.ok(at(true,19)?.includes('Joja Catalogue'));
 assert.ok(at(true,26)?.includes('Junimo Catalogue'));
 assert.ok(!forecastCart({...input,jojaComplete:true}).some(v=>v.offers.some(o=>o.label==='Joja Catalogue')));
 assert.ok(forecastCart({...input,jojaComplete:true}).find(v=>v.absoluteDay===26)?.offers.some(o=>o.label==='Junimo Catalogue'));
 // Compare every Year 25 visit against the independently documented 5% threshold.
 for(const legacy of [true,false])for(const visit of forecastCart({...input,year:25,legacy})){
  const seed=legacy?(-1863931622+123456789+visit.absoluteDay)%2147483647:hashWords(-1863931622,123456789,visit.absoluteDay);
  assert.equal(visit.offers.some(o=>o.label==='Tea Set'&&o.price===1000000),random(seed)()<.05);
 }
 assert.ok(!forecastCart({...input,year:24}).some(v=>v.offers.some(o=>o.label==='Tea Set')));
});

test('optional festival visits preserve ordinary Forest dates and correct weekdays',()=>{const p={gameId:'123456789',year:1,season:'spring',day:1,legacy:true} as const;const spring=forecastCart({...p,desertFestivalUnlocked:true});assert.equal(spring.length,11);assert.deepEqual(spring.filter(v=>v.venue==='Desert Festival').map(v=>[v.day,v.weekday]),[[15,'Monday'],[16,'Tuesday'],[17,'Wednesday']]);const winter=forecastCart({...p,season:'winter',includeNightMarket:true});assert.equal(winter.length,11);assert.deepEqual(winter.filter(v=>v.venue==='Night Market').map(v=>v.absoluteDay),[99,100,101]);assert.equal(winter.filter(v=>v.venue==='Forest Cart').length,8);assert.equal(new Set(winter.map(v=>v.absoluteDay)).size,11);});
