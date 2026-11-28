import test from 'node:test';import assert from 'node:assert/strict';
import {BUILTIN_FARMS,builtinFarmMap} from '../src/lib/builtin-farm-preview.ts';
import {restrictionCounts,type TileRestrictions} from '../src/lib/data-layers.ts';
import {compareReferenceFlags,referenceCellKind,farmReferenceSummary,referenceLayerPaths,REFERENCE_LAYERS} from '../src/lib/farm-reference-comparison.ts';
test('reference flags and intersections remain independent even on a blocked cell',()=>{
 const r:TileRestrictions={schema:1,source:'local-restriction-mask',access:'NCCC',build:'BBNN',till:'TTNT'};
 assert.deepEqual(compareReferenceFlags(r,4,1),{total:4,clear:3,buildable:2,tillable:3,clearTillable:2,clearBuildable:1});
 assert.equal(referenceCellKind(r,0,'combined'),'blocked');assert.equal(referenceCellKind(r,0,'till'),'tillable');assert.equal(referenceCellKind(r,0,'build'),'buildable');assert.equal(referenceCellKind(r,0,'access'),'blocked');
});
test('all eight comparisons reproduce pinned reference counts and layer coverage',()=>{
 assert.equal(BUILTIN_FARMS.length,8);
 for(const f of BUILTIN_FARMS){const m=builtinFarmMap(f.id),r=m.restrictions!,s=farmReferenceSummary(f.name),c=restrictionCounts(r);assert.equal(s.counts.total,m.w*m.h);assert.equal(s.counts.tillable,c.tillable);assert.equal(s.counts.buildable,c.buildable);assert.equal(s.counts.clear,c.clear);assert.ok(s.counts.clearTillable<=Math.min(c.clear,c.tillable));assert.ok(s.counts.clearBuildable<=Math.min(c.clear,c.buildable));for(const layer of REFERENCE_LAYERS){const p=referenceLayerPaths(f.name,layer);let sum=0;for(const path of Object.values(p.paths))for(const match of path.matchAll(/h(\d+)v1h-\d+z/g))sum+=Number(match[1]);assert.equal(sum,m.w*m.h);}}
});
