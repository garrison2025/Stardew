import test from 'node:test';import assert from 'node:assert/strict';import {getAdapter,validateManifest,type DataManifest} from '../src/lib/contracts.ts';
const manifest:DataManifest={gameVersion:'1.6',platform:'PC',rulesVersion:'preview',dataHash:'a'.repeat(64),fixtureHash:'b'.repeat(64),schemaVersion:1,features:['predictor'],sourceIds:['unapproved']};
test('reject ambiguous patch and unapproved provenance',()=>{assert.equal(validateManifest(manifest,[]).length,2)});
test('unknown versions and unsupported features fail closed',()=>{assert.equal(getAdapter(manifest,'predictor').status,'unsupported')});
