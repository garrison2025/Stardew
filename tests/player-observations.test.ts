import test from 'node:test';import assert from 'node:assert/strict';
import {parseSave} from '../src/lib/save-parser-core.ts';
import {decodePlayerRoster,makePlayerRoster,playerCounts,PLAYER_ROSTER_KEY} from '../src/lib/player-observations.ts';
import {decodeBackup} from '../src/lib/workspace-backup.ts';
test('separate player observations preserve missing vs empty, exclude farm-wide fields and validate backup',()=>{
 const xml='<SaveGame><gameVersion>1.6.15</gameVersion><goldenWalnutsFound>10</goldenWalnutsFound><player><UniqueMultiplayerID>1</UniqueMultiplayerID><name>SECRET_HOST</name><experiencePoints><int>100</int><int>0</int><int>0</int><int>0</int><int>0</int></experiencePoints><professions><int>1</int></professions><fishCaught/></player><farmhands><Farmer><UniqueMultiplayerID>2</UniqueMultiplayerID><name>SECRET_OTHER</name><professions><int>6</int></professions></Farmer></farmhands></SaveGame>';
 const s=parseSave(xml),r=makePlayerRoster(s.version,s.progress!,s.farmhands!);
 assert.equal(r.players.length,2);assert.equal(r.players[0].role,'host');assert.equal(r.players[1].role,'farmhand');assert.deepEqual(r.players[0].observed.professions?.ids,[1]);assert.deepEqual(r.players[1].observed.professions?.ids,[6]);
 assert.equal(r.players[0].observed.walnutsFound,null);assert.equal(r.players[1].observed.walnutsFound,null);assert.equal(playerCounts(r.players[0]).fishing,0);assert.equal(playerCounts(r.players[1]).fishing,null);
 assert.equal(JSON.stringify(r).includes('SECRET_'),false);assert.deepEqual(decodeBackup({schema:1,createdAt:'2026-11-28T00:00:00Z',records:{[PLAYER_ROSTER_KEY]:r}}).records[PLAYER_ROSTER_KEY],r);
 assert.throws(()=>decodePlayerRoster({...r,players:[r.players[1],r.players[0]]}));assert.throws(()=>decodePlayerRoster({...r,players:[{...r.players[0],completed:{fishing:['Unknown item']}}]}));
});
