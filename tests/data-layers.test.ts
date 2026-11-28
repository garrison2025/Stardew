import test from 'node:test';import assert from 'node:assert/strict';
import {importDataLayers,restrictionCounts,decodeTileRestrictions} from '../src/lib/data-layers.ts';
import {dataLayersMap,placementError,decodeMap,decodePlan,irrigation,type Plan} from '../src/lib/map-model.ts';
const coords=Array.from({length:64},(_,i)=>i%8+', '+Math.floor(i/8));
function layer(pairs:Record<string,string[]>){return Object.fromEntries(Object.entries(pairs).map(([Id,Tiles])=>[Id,{Id,Tiles}]))}
function fixture(){return [
 layer({'accessible.clear':coords.slice(3),'accessible.occupied':[coords[1]],'accessible.impassable':[coords[0]],'accessible.warp':[coords[2]]}),
 layer({'buildable.buildable':coords.slice(4),'buildable.occupied':[coords[1]],'buildable.not-buildable':[coords[0],coords[2],coords[3]]}),
 layer({'tillable.tilled':[coords[4]],'tillable.tillable':coords.slice(5),'tillable.occupied':[coords[1]],'tillable.not-tillable':[coords[0],coords[2],coords[3]]})
]}
test('three independent complete layers roundtrip and keep occupied / warp distinct',()=>{
 const r=importDataLayers(fixture().reverse(),8,8);assert.equal(r.access.slice(0,5),'NOWCC');assert.equal(r.build.slice(0,5),'NONNB');assert.equal(r.till.slice(0,5),'NONND');assert.deepEqual(restrictionCounts(r),{clear:61,buildable:60,tillable:60,occupied:1,warp:1});assert.deepEqual(decodeTileRestrictions(r,8,8),r);
 const map=dataLayersMap(fixture(),8,8);assert.deepEqual(decodeMap(JSON.parse(JSON.stringify(map))),map);assert.equal(map.tiles[0],'grass');assert.equal(map.tiles[4],'soil');
 const plan:Plan={schema:2,map,season:'spring',objects:[]};assert.deepEqual(decodePlan(JSON.parse(JSON.stringify(plan))),plan);
});
test('rejects missing, duplicate, overlapping, out-of-grid or unexpected legend records',()=>{
 const f=fixture();assert.throws(()=>importDataLayers(f.slice(1),8,8));assert.throws(()=>importDataLayers([f[0],f[0],f[2]],8,8));
 const dup=fixture();dup[0]['accessible.clear'].Tiles.push(coords[0]);assert.throws(()=>importDataLayers(dup,8,8));
 const gap=fixture();gap[0]['accessible.clear'].Tiles.pop();assert.throws(()=>importDataLayers(gap,8,8));
 const outside=fixture();outside[0]['accessible.clear'].Tiles[0]='8, 0';assert.throws(()=>importDataLayers(outside,8,8));
 assert.throws(()=>decodeTileRestrictions({...importDataLayers(f,8,8),access:'C'},8,8));
});
test('crop, building, generic object and watering check separate predicates',()=>{
 const map=dataLayersMap(fixture(),8,8);
 const obj=(itemId:string,x:number,y:number)=>({id:itemId,itemId,x,y,rotation:0 as const});
 assert.match(placementError(map,[],obj('seedling',3,0))!,/tillable/);assert.equal(placementError(map,[],obj('seedling',4,0)),null);
 assert.match(placementError(map,[],obj('chest',1,0))!,/occupied/);assert.match(placementError(map,[],obj('chest',2,0))!,/warp/);assert.equal(placementError(map,[],obj('chest',3,0)),null);
 assert.match(placementError(map,[],obj('game-shipping-bin',3,0))!,/buildable/);assert.equal(placementError(map,[],obj('game-shipping-bin',4,0)),null);
 const plan:Plan={schema:2,map,season:'spring',objects:[obj('quality-sprinkler',4,1)]};assert.ok(!irrigation(plan).has('3,0'));assert.ok(irrigation(plan).has('4,0'));
});

test('legacy exports can omit empty groups without omitting any coordinate',()=>{
 const f=fixture();delete f[2]['tillable.tilled'];f[2]['tillable.tillable'].Tiles.push(coords[4]);assert.equal(importDataLayers(f,8,8).till[4],'T');
 const g=fixture();g[0]['accessible.clear'].Tiles[0]=coords[3];delete g[0]['accessible.warp'];assert.throws(()=>importDataLayers(g,8,8));
});
