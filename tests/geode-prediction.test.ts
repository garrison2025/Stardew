import test from 'node:test';
import assert from 'node:assert/strict';
import {GEODE_TYPES,predictGeodes,type GeodeInput} from '../src/lib/geode-prediction.ts';

// Expected values are from the pinned upstream reference algorithm, not captures from the game.
const scenarios:GeodeInput[]=[
  {
    "gameId": "123456789",
    "playerId": "987654321",
    "opened": 0,
    "mineLevel": 120,
    "legacy": false,
    "qiBeans": false
  },
  {
    "gameId": "388920109",
    "playerId": "-5786932043985637609",
    "opened": 25,
    "mineLevel": 17,
    "legacy": false,
    "qiBeans": true
  },
  {
    "gameId": "123456789",
    "playerId": "-987654321",
    "opened": 100,
    "mineLevel": 71,
    "legacy": true,
    "qiBeans": false
  }
];
const expected=[[[[552,1],[576,1],[552,1]],[[550,1],[577,1],[546,1]],[[547,1],[578,1],[547,1]],[[541,1],[556,1],[544,1]],[[106,1],[113,1],[110,1]]],[[[890,1],[571,1],[890,1]],[[890,1],[572,1],[890,1]],[[890,1],[575,1],[890,1]],[[890,1],[566,1],[890,1]],[[890,1],[104,1],[890,1]]],[[[390,3],[549,1],[552,1]],[[390,3],[545,1],[550,1]],[[390,3],[543,1],[547,1]],[[390,3],[547,1],[546,1]],[[166,1],[105,1],[101,1]]]];
test('example, legacy, signed player and Qi quest inputs match the reference openings',()=>{
 scenarios.forEach((input,i)=>GEODE_TYPES.forEach((type,j)=>{
  const actual=predictGeodes(input,type,3);
  assert.deepEqual(actual.map(r=>[r.id,r.quantity]),expected[i][j]);
  assert.deepEqual(actual.map(r=>r.opening),[input.opened+1,input.opened+2,input.opened+3]);
  assert.ok(actual.every(r=>r.name));
 }));
});
test('invalid IDs and numeric inputs fail instead of inventing results',()=>{
 const sample=scenarios[0];
 assert.throws(()=>predictGeodes({...sample,gameId:''},'Geode'));
 assert.throws(()=>predictGeodes({...sample,playerId:'18446744073709551616'},'Geode'));
 assert.throws(()=>predictGeodes({...sample,opened:-1},'Geode'));
 assert.throws(()=>predictGeodes({...sample,mineLevel:121},'Geode'));
});
