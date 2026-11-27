import test from 'node:test';import assert from 'node:assert/strict';import {normalizeSkillXp,normalizeCrafting,safeCount,skillTotal} from '../src/lib/save-progress.ts';
test('game order maps to skill UI order; missing data stays unknown',()=>{const xp=normalizeSkillXp([15000,100,380,770,1300,0]);assert.deepEqual(xp,[15000,770,380,100,1300]);assert.equal(skillTotal(xp),20);assert.equal(normalizeSkillXp([0,1]),null);assert.equal(normalizeSkillXp([0,0,0,-1,0]),null);assert.equal(safeCount(null),null);assert.equal(safeCount(0),0);assert.equal(safeCount(131,130),null)});
test('positive craft count distinct from learned, unknown names excluded',()=>{assert.deepEqual(normalizeCrafting([{name:'Keg',count:3},{name:'Chest',count:0},{name:'Unknown mod recipe',count:1}]),{known:['Keg','Chest'],done:['Keg'],unmapped:1});assert.throws(()=>normalizeCrafting([{name:'Keg',count:1},{name:'keg',count:1}]));assert.throws(()=>normalizeCrafting([{name:'Keg',count:-1}]))});

import {guardedSaveMergeUpdates,saveMergeUpdates} from '../src/lib/save-merge.ts';
import {farmFingerprint,SAVE_FARM_BINDING_KEY} from '../src/lib/save-farm-binding.ts';
import {decodeBackup} from '../src/lib/workspace-backup.ts';
import {emptyCollection,setCollection} from '../src/lib/game-collections.ts';
import type {SaveProgress} from '../src/lib/save-progress.ts';
const partial:SaveProgress={xp:null,money:null,lifetimeEarnings:null,walnutsFound:null,walnutsBalance:null,crafting:{known:['Chest','Keg'],done:['Keg'],unmapped:1},learnedCooking:null,collections:{shipping:{done:['Parsnip'],unmapped:2},fishing:{done:[],unmapped:1}},warnings:[]};
test('one save merge preserves prior completions and excludes unknown and empty groups',()=>{const u=saveMergeUpdates(partial);assert.deepEqual(Object.keys(u).sort(),['collection-v1:crafting','collection-v1:shipping']);const old=setCollection(emptyCollection('crafting'),'Chest','done');const merged=u['collection-v1:crafting'](old) as typeof old;assert.deepEqual(merged.done.sort(),['Chest','Keg']);assert.deepEqual(old.done,['Chest']);assert.deepEqual((u['collection-v1:shipping'](undefined) as {done:string[]}).done,['Parsnip']);assert.throws(()=>u['collection-v1:crafting']({schema:2}));assert.deepEqual(Object.keys(saveMergeUpdates({...partial,crafting:null,collections:{}})),[])});

import {decodeSaveObservations,SAVE_OBSERVATIONS_KEY} from '../src/lib/save-observations.ts';
test('separate observations retain unknowns, never overwrite manual skill record',()=>{const u=saveMergeUpdates({...partial,xp:[0,100,380,770,1300],lifetimeEarnings:12345,walnutsFound:0});assert.ok(!Object.hasOwn(u,'skills-v1'));const record=decodeSaveObservations(u[SAVE_OBSERVATIONS_KEY](undefined));assert.equal(record.lifetimeEarnings,12345);assert.equal(record.walnutsFound,0);assert.equal(record.walnutsBalance,null);assert.deepEqual(record.xp,[0,100,380,770,1300]);assert.throws(()=>decodeSaveObservations({...record,xp:[1,2]}));});

test('one farm stays bound across imports and validated backups',async()=>{
 const fingerprint=await farmFingerprint('9223372036854775999');
 const other=await farmFingerprint('9223372036854776000');
 assert.ok(fingerprint&&other);
 assert.notEqual(fingerprint,other);
 assert.equal(await farmFingerprint('0001'),await farmFingerprint('1'));
 assert.equal(await farmFingerprint('0'),null);
 assert.equal(await farmFingerprint('18446744073709551616'),null);
 const first=guardedSaveMergeUpdates({...partial,walnutsFound:22},fingerprint);
 const binding=first[SAVE_FARM_BINDING_KEY](undefined);
 const copy=decodeBackup({schema:1,createdAt:new Date().toISOString(),records:{[SAVE_FARM_BINDING_KEY]:binding}});
 assert.deepEqual(copy.records[SAVE_FARM_BINDING_KEY],binding);
 assert.deepEqual(first[SAVE_FARM_BINDING_KEY](binding),binding);
 assert.throws(()=>guardedSaveMergeUpdates(partial,other)[SAVE_FARM_BINDING_KEY](binding),/different farm/);
 const later=guardedSaveMergeUpdates({...partial,lifetimeEarnings:1200},fingerprint);
 const observed=decodeSaveObservations(later[SAVE_OBSERVATIONS_KEY](first[SAVE_OBSERVATIONS_KEY](undefined)));
 assert.equal(observed.walnutsFound,22);
 assert.equal(observed.lifetimeEarnings,1200);
});
