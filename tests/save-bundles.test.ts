import test from 'node:test';
import assert from 'node:assert/strict';
import {readBundleDefinition} from '../src/lib/save-bundles.ts';

test('saved custom definitions preserve the order, duplicate items and optional slots', () => {
 const record = readBundleDefinition('Crafts Room/17', 'Example//388 99 0 388 99 0 24 5 2/4/2//short name', [true, false, false, false]);
 assert.equal(record?.needed, 2);
 assert.deepEqual(record?.slots, [
  {item: '388', quantity: 99, quality: 0, donated: true},
  {item: '388', quantity: 99, quality: 0, donated: false},
  {item: '24', quantity: 5, quality: 2, donated: false},
 ]);
});

test('invalid requirements are refused and ambiguous donations remain unknown', () => {
 assert.equal(readBundleDefinition('Vault/23', 'Example//-1 2500 2000/4', [true]), null);
 assert.equal(readBundleDefinition('Vault/23', 'Example//-1 2500 2500/4', [true])?.slots[0].quantity, 2500);
 assert.equal(readBundleDefinition('Pantry/3', 'Example//24 1 0/4/2', undefined), null);
 assert.equal(readBundleDefinition('Pantry/3', 'Example//24 1 0/4', [false, true])?.slots[0].donated, null);
 assert.equal(readBundleDefinition('Pantry/3', 'Example//24 1 0 25 1 0/4', [true])?.slots[0].donated, null);
});
