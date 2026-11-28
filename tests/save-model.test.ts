import test from 'node:test';import assert from 'node:assert/strict';import {buildFarmImport,observedFarmBounds,buildingItem,sprinklerItem,supportedVersion,type SaveSnapshot} from '../src/lib/save-model.ts';
const base:SaveSnapshot={version:'1.6.15',farmType:0,year:2,day:12,season:'autumn',fields:100,farmFound:true,records:[{kind:'building',itemId:'game-barn',x:4,y:4,width:7,height:4},{kind:'object',itemId:'quality-sprinkler',x:2,y:2},{kind:'terrain',itemId:'seedling',x:3,y:2},{kind:'object',itemId:null,x:0,y:0,reason:'unknown'}]};
test('maps only supported numeric IDs and building names',()=>{assert.equal(buildingItem('Deluxe Barn'),'game-barn');assert.equal(buildingItem('toString'),null);assert.equal(sprinklerItem('(O)621',false),'quality-sprinkler');assert.equal(sprinklerItem('(BC)621',false),null);assert.equal(sprinklerItem('621',true),null)});
test('partial import preserves coordinates and emits unknown records',()=>{const r=buildFarmImport(base,16,16);assert.equal(r.imported,3);assert.equal(r.issues.length,1);assert.equal(r.plan.objects[0].x,4);assert.equal(r.plan.map.source,'local');assert.equal(r.plan.season,'autumn')});
test('version and farm scope fail closed',()=>{assert.equal(supportedVersion('1.7.0'),false);assert.throws(()=>buildFarmImport({...base,version:'1.7.0'},16,16));assert.throws(()=>buildFarmImport({...base,farmFound:false},16,16))});
test('unknown or conflicting footprint never silently imported',()=>{const r=buildFarmImport({...base,records:[...base.records,{kind:'building',itemId:'game-barn',x:4,y:4,width:5,height:3},{kind:'object',itemId:'basic-sprinkler',x:4,y:4},{kind:'object',itemId:'basic-sprinkler',x:30,y:30}]},16,16);assert.equal(r.imported,3);assert.equal(r.issues.length,4)});

test('observed bounds include whole recognized building footprints without guessing map dimensions',()=>{const s={...base,records:[...base.records,{kind:'building' as const,itemId:'game-barn',x:82,y:70,width:7,height:4},{kind:'object' as const,itemId:'basic-sprinkler',x:159,y:159},{kind:'object' as const,itemId:'basic-sprinkler',x:160,y:160},{kind:'building' as const,itemId:'game-barn',x:140,y:140,width:1,height:1},{kind:'object' as const,itemId:null,x:999,y:999}]};assert.deepEqual(observedFarmBounds(s),{w:160,h:160,eligible:5,outsideLimit:1});assert.deepEqual(observedFarmBounds(base),{w:11,h:8,eligible:3,outsideLimit:0});assert.equal(observedFarmBounds({...s,version:'1.7.0'}).eligible,0);assert.equal(buildFarmImport(s,160,160).imported,5)});

import {VANILLA_FARM_GRIDS,vanillaFarmGrid,suggestedFarmGrid} from '../src/lib/save-model.ts';
test('all eight vanilla farm grid dimensions use independent 1.6.15 map layer references',()=>{
 assert.deepEqual(VANILLA_FARM_GRIDS.map(x=>[x.id,x.w,x.h]),[[0,80,65],[1,80,65],[2,80,65],[3,80,65],[4,80,65],[5,80,80],[6,110,110],[7,100,75]]);
 assert.equal(vanillaFarmGrid(8),undefined);assert.equal(vanillaFarmGrid(null),undefined);
 assert.equal(suggestedFarmGrid({...base,farmType:6}).w,110);assert.equal(suggestedFarmGrid({...base,farmType:7}).h,75);
 const larger=suggestedFarmGrid({...base,records:[...base.records,{kind:'object',itemId:'basic-sprinkler',x:100,y:80}]});assert.equal(larger.w,101);assert.equal(larger.h,81);assert.equal(larger.exceedsReference,true);
 assert.equal(suggestedFarmGrid({...base,farmType:8}).reference,undefined);assert.equal(suggestedFarmGrid({...base,version:'1.7.0'}).reference,undefined);
});

import {observedObjectItem} from '../src/lib/save-model.ts';
test('save marker IDs and saved building footprints are explicit and class-aware',()=>{
 assert.equal(buildingItem('Farmhouse'),'game-farmhouse');assert.equal(buildingItem('Greenhouse'),'game-greenhouse');
 for(const id of ['674','675','784'])assert.equal(observedObjectItem(id,'false','Object'),'observed-weeds');
 for(const id of ['294','295'])assert.equal(observedObjectItem(id,'false',''),'observed-twig');
 for(const id of ['75','343','450','668','670','751'])assert.equal(observedObjectItem(id,'false','Object'),'observed-stone');
 assert.equal(observedObjectItem('590','false','Object'),'observed-artifact');
 assert.equal(observedObjectItem('130','true','Chest'),'chest');
 assert.equal(observedObjectItem('(BC)450','true','Object'),null);
 assert.equal(observedObjectItem('450','false','Furniture'),null);
 assert.equal(observedObjectItem('UNKNOWN','false','Object'),null);
});

import {observedBushItem,observedClumpItem} from '../src/lib/save-model.ts';
test('bush sizes and clump dimensions are explicit and fixed',()=>{
 assert.deepEqual([0,1,2,3,4,5,null].map(observedBushItem),['observed-bush-small','observed-bush-medium','observed-bush-large','observed-bush-small','observed-bush-medium',null,null]);
 assert.deepEqual([600,602,672,622].map(id=>observedClumpItem(id,2,2)),['observed-stump','observed-log','observed-boulder','observed-meteorite']);
 assert.equal(observedClumpItem(600,1,2),null);assert.equal(observedClumpItem(999,2,2),null);
});
