import test from 'node:test';import assert from 'node:assert/strict';import {parseSave} from '../src/lib/save-parser-core.ts';import {decodeStorage,storageMaterials} from '../src/lib/storage-observations.ts';import {observationsOf} from '../src/lib/save-observations.ts';import {saveMergeUpdates} from '../src/lib/save-merge.ts';
const items='<items><Item xsi:type="Object"><itemId>184</itemId><quality>0</quality><stack>3</stack></Item></items>';
const chest='<Object xsi:type="Chest"><playerChest>true</playerChest>'+items+'</Object>';
const obj=(v:string)=>'<item><value>'+v+'</value></item>';
const xml='<SaveGame xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><gameVersion>1.6.15</gameVersion><player>'+items+'</player><locations><GameLocation><name>Farm</name><objects>'+obj(chest)+obj(chest.replace('<playerChest>','<specialChestType>JunimoChest</specialChestType><playerChest>'))+obj('<Object><heldObject>'+chest+'</heldObject></Object>')+'</objects><buildings><Building><indoors><objects>'+obj(chest)+'</objects></indoors></Building></buildings></GameLocation><GameLocation><name>FarmHouse</name><fridge><playerChest>true</playerChest>'+items+'</fridge></GameLocation></locations></SaveGame>';
test('ordinary chests and fridge separate from player inventory, exclude linked and machine stock',()=>{const p=parseSave(xml).progress!,s=p.storage!;assert.equal(p.backpack?.stacks[0].quantity,3);assert.equal(s.containers,3);assert.equal(s.skippedContainers,1);assert.deepEqual(s.stacks,[{id:'184',quality:0,quantity:9}]);assert.deepEqual({...storageMaterials(s,['Milk','Any milk'])},{Milk:9});assert.deepEqual(observationsOf(p).storage,s);assert.ok(Object.hasOwn(saveMergeUpdates(p),'save-observations-v1'));assert.throws(()=>decodeStorage({...s,stacks:[...s.stacks,...s.stacks]}));assert.equal(parseSave(xml.replace('1.6.15','1.7.0')).progress,undefined)});

const root=(body:string)=>'<SaveGame xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><gameVersion>1.6.15</gameVersion><player>'+items+'</player><locations>'+body+'</locations></SaveGame>';
const big='<Object xsi:type="Chest"><playerChest>true</playerChest><specialChestType>BigChest</specialChestType>'+items+'</Object>';
const auto='<Object><itemId>165</itemId><bigCraftable>true</bigCraftable><heldObject xsi:type="Chest"><playerChest>false</playerChest>'+items+'</heldObject></Object>';
const building='<Building><buildingChests><Chest>'+items+'</Chest><Chest xsi:nil="true"/></buildingChests><indoors xsi:nil="true"/></Building>';
test('explicit local big chest, auto grabber and building chest roots counted once',()=>{
 const result=parseSave(root('<GameLocation xsi:type="Farm"><name>Farm</name><objects>'+obj(big)+obj(auto)+'</objects><buildings>'+building+'</buildings></GameLocation>')).progress!;
 assert.equal(result.storage?.containers,3);assert.equal(result.storage?.skippedContainers,0);assert.equal(result.storage?.stacks[0].quantity,9);assert.equal(result.backpack?.stacks[0].quantity,3);
});
test('global, shipping, gift, wrong machine and unrelated fridge are not usable stock',()=>{
 const bad=[big.replace('BigChest','JunimoChest'),big.replace('BigChest','MiniShippingBin'),big.replace('<playerChest>','<globalInventoryId><string>test</string></globalInventoryId><playerChest>'),big.replace('<playerChest>','<giftbox>true</giftbox><playerChest>'),auto.replace('<itemId>165','<itemId>166')];
 const result=parseSave(root('<GameLocation><name>Farm</name><objects>'+bad.map(obj).join('')+'</objects><fridge><playerChest>true</playerChest>'+items+'</fridge></GameLocation>')).progress!.storage!;
 assert.equal(result.containers,0);assert.equal(result.skippedContainers,6);assert.deepEqual(result.stacks,[]);
});
test('typed island or cabin fridge recognized and unknown machine not traversed',()=>{
 const result=parseSave(root('<GameLocation xsi:type="IslandFarmHouse"><name>IslandHouse</name><fridge><playerChest>true</playerChest>'+items+'</fridge></GameLocation><GameLocation xsi:type="Cabin"><fridge><playerChest>true</playerChest>'+items+'</fridge></GameLocation>')).progress!.storage!;
 assert.equal(result.containers,2);assert.equal(result.stacks[0].quantity,6);
});

test('saved tree trunks, grass and debris map to separate editable planning markers',()=>{
 const fixture=root('<GameLocation xsi:type="Farm"><name>Farm</name><objects><item><key><Vector2><X>1</X><Y>1</Y></Vector2></key><value><Object><itemId>675</itemId><bigCraftable>false</bigCraftable></Object></value></item></objects><terrainFeatures><item><key><Vector2><X>2</X><Y>2</Y></Vector2></key><value><TerrainFeature xsi:type="Tree"/></value></item><item><key><Vector2><X>3</X><Y>3</Y></Vector2></key><value><TerrainFeature xsi:type="Grass"/></value></item></terrainFeatures></GameLocation>');
 assert.deepEqual(parseSave(fixture).records.map(r=>r.itemId),['observed-weeds','observed-tree','observed-grass']);
});

test('large bushes and resource clumps retain saved anchors; mismatched or unknown records stay unmapped',()=>{
 const fixture=root('<GameLocation xsi:type="Farm"><name>Farm</name><largeTerrainFeatures><LargeTerrainFeature xsi:type="Bush"><tilePosition><X>2</X><Y>3</Y></tilePosition><size>2</size></LargeTerrainFeature><LargeTerrainFeature xsi:type="Bush"><tilePosition><X>6</X><Y>3</Y></tilePosition><size>9</size></LargeTerrainFeature></largeTerrainFeatures><resourceClumps><ResourceClump><width>2</width><height>2</height><parentSheetIndex>600</parentSheetIndex><tile><X>8</X><Y>4</Y></tile></ResourceClump><ResourceClump><width>1</width><height>2</height><parentSheetIndex>602</parentSheetIndex><tile><X>11</X><Y>4</Y></tile></ResourceClump></resourceClumps></GameLocation>');
 const r=parseSave(fixture).records;assert.deepEqual(r.map(x=>[x.itemId,x.x,x.y]),[['observed-bush-large',2,3],[null,6,3],['observed-stump',8,4],[null,11,4]]);
});
