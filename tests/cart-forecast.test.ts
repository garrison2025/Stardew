import test from 'node:test';
import assert from 'node:assert/strict';
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
   forecastCart({...input,routeComplete}).find(v=>v.absoluteDay===day)?.offers.map(o=>o.label);
 assert.ok(!at(false,19)?.includes('Joja Catalogue'));
 assert.ok(at(true,19)?.includes('Joja Catalogue'));
 assert.ok(at(true,26)?.includes('Junimo Catalogue'));
 const year25 = forecastCart({...input,year:25}).find(v=>v.absoluteDay===2714);
 assert.ok(year25?.offers.some(o=>o.label==='Tea Set'&&o.price===1000000));
 assert.ok(!forecastCart({...input,year:24}).some(v=>v.offers.some(o=>o.label==='Tea Set')));
});
