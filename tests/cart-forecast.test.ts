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
