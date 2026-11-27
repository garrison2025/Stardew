import test from 'node:test';import assert from 'node:assert/strict';
import {parseSave} from '../src/lib/save-parser-core.ts';
import {professionNames,decodeProfessions} from '../src/lib/save-professions.ts';
import {saveMergeUpdates} from '../src/lib/save-merge.ts';
test('read standard profession IDs separately for host and farmhand; missing is unknown',()=>{
 const s=parseSave('<SaveGame><gameVersion>1.6.15</gameVersion><player><UniqueMultiplayerID>1</UniqueMultiplayerID><professions><int>1</int><int>4</int><int>999</int></professions></player><farmhands><Farmer><UniqueMultiplayerID>2</UniqueMultiplayerID><name>test</name><professions><int>6</int><int>8</int></professions></Farmer></farmhands></SaveGame>');
 assert.deepEqual(professionNames(s.progress!.professions!),['Tiller','Artisan']);assert.equal(s.progress!.professions!.unmapped,1);assert.deepEqual(professionNames(s.farmhands![0].professions!),['Fisher','Angler']);assert.deepEqual((saveMergeUpdates(s.progress!)['save-observations-v1'](undefined) as any).professions,{ids:[1,4],unmapped:1});assert.throws(()=>decodeProfessions({ids:[1,1],unmapped:0}));assert.equal(parseSave('<SaveGame><gameVersion>1.6.15</gameVersion><player/></SaveGame>').progress!.professions,undefined);
});
