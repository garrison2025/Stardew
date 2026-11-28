import test from 'node:test';import assert from 'node:assert/strict';import {parseBuildingGeometry,readFixedBuildingGeometry,geometryTile,diagnoseBuildingOverlaps,observedOverlapCells} from '../src/lib/building-geometry-diagnostic.ts';
import {buildFarmImport,type SaveSnapshot} from '../src/lib/save-model.ts';
const synthetic={Size:{X:3,Y:2},CollisionMap:'XXX'+String.fromCharCode(10)+'XOX' +String.fromCharCode(10)+'OOOX',AdditionalTilePropertyRadius:1,HumanDoor:{X:1,Y:1},AdditionalPlacementTiles:[{TileArea:{X:1,Y:2,Width:1,Height:1},OnlyNeedsToBePassable:true}],AllowsFlooringUnderneath:false};
test('independent footprint, explicit player collision, extra cells and entrance reservation',()=>{const g=parseBuildingGeometry('Farmhouse',synthetic);assert.equal(g.flooring,false);assert.equal(geometryTile(g,1,1).collision,'passable');assert.equal(geometryTile(g,1,1).door,true);assert.equal(geometryTile(g,3,2).inside,false);assert.equal(geometryTile(g,3,2).collision,'blocked');assert.deepEqual(geometryTile(g,1,2).placement,['passable-only']);assert.equal(geometryTile(g,9,9).collision,'not-explicit');assert.equal(geometryTile(parseBuildingGeometry('default',{Size:{X:3,Y:2}}),0,0).collision,'default-blocked');});
test('reject malformed data and do not collapse ambiguous building variants',()=>{assert.throws(()=>parseBuildingGeometry('bad',{...synthetic,CollisionMap:'X?'}));assert.throws(()=>parseBuildingGeometry('bad',{Size:{X:0,Y:2}}));assert.throws(()=>readFixedBuildingGeometry({Barn:synthetic}));});
const farmhouse={Size:{X:9,Y:5},CollisionMap:['XXXXXXXXX','XXXXXXXXX','XXXXXXXXX','XOXXXXXXX','XXXXXXXXX'].join('\n')};
const snapshot:SaveSnapshot={version:'1.6.15',farmType:0,year:1,day:1,season:'spring',fields:0,farmFound:true,records:[
 {kind:'building',itemId:'game-farmhouse',x:10,y:10,width:9,height:5},
 {kind:'object',itemId:'chest',x:11,y:13},
 {kind:'building',itemId:'game-silo',x:8,y:11,width:3,height:3},
 {kind:'object',itemId:'chest',x:8,y:11}
]};
test('diagnose actual accepted blocker with building-relative tile; no placement override',()=>{
 const result=buildFarmImport(snapshot,32,32),geometry=readFixedBuildingGeometry({Farmhouse:farmhouse});
 assert.equal(result.imported,2);assert.equal(result.issues.length,2);
 const rows=diagnoseBuildingOverlaps(snapshot,result.issues,geometry,result.plan);
 assert.equal(rows.length,4);assert.equal(rows[0].issueIndex,1);assert.equal(rows[0].blockerIndex,0);assert.deepEqual(rows[0].relative,{x:1,y:3});assert.equal(rows[0].state.collision,'passable');
 assert.deepEqual(rows.filter(r=>r.issueIndex===2).map(r=>r.relative),[{x:0,y:1},{x:0,y:2},{x:0,y:3}]);
 assert.ok(rows.every(r=>r.blockerIndex===0));
 assert.deepEqual(diagnoseBuildingOverlaps(snapshot,result.issues,readFixedBuildingGeometry({Farmhouse:synthetic}),result.plan),[]);
 assert.equal(result.issues.length,2);
});
test('a rejected or later accepted record cannot be reported as the earlier blocker',()=>{
 const result=buildFarmImport(snapshot,32,32),rows=observedOverlapCells(snapshot,result.issues,result.plan);
 assert.equal(rows.length,4);assert.ok(rows.every(r=>r.blockerIndex<r.issueIndex));
 assert.deepEqual(observedOverlapCells(snapshot,result.issues,{...result.plan,objects:result.plan.objects.filter(o=>o.id!=='save-0')}),[]);
});
