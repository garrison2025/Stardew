import test from 'node:test';
import assert from 'node:assert/strict';
import {farmDatabaseName,parseFarmProfiles} from '../src/lib/farm-profiles.ts';
import {saveFingerprint,keepSaveBinding} from '../src/lib/save-binding.ts';

test('legacy database stays the default and two profiles resolve to distinct databases', () => {
 const id = '42ccaf7f-f188-4cf7-8bb4-c2c48856c61b';
 const profiles = parseFarmProfiles(JSON.stringify([{id,name:'River farm'}]));
 assert.equal(profiles[0].id,'default');
 assert.equal(farmDatabaseName(profiles[0].id), 'field-and-farm-preview');
 assert.notEqual(farmDatabaseName(profiles[0].id), farmDatabaseName(profiles[1].id));
 assert.throws(()=>parseFarmProfiles(JSON.stringify([{id,name:'Default Farm'}])));
 assert.throws(()=>farmDatabaseName('../default'));
});

test('saved profile binding survives reimports but rejects other farms or ambiguous files', async () => {
 const first = await saveFingerprint('100','-1');
 assert.equal(first,await saveFingerprint('0100','18446744073709551615'));
 const second = await saveFingerprint('100','42');
 assert.notEqual(first,second);
 assert.equal(await saveFingerprint('100','0'),null);
 assert.equal(keepSaveBinding(undefined,first,false),first);
 assert.equal(keepSaveBinding(first,first,false),first);
 assert.throws(()=>keepSaveBinding(first,second,false),/linked to another farm/);
 assert.throws(()=>keepSaveBinding(first,null,true),/linked to another farm/);
 assert.throws(()=>keepSaveBinding(undefined,null,false),/readable game and host identity/);
 assert.equal(keepSaveBinding(undefined,null,true),undefined);
});
