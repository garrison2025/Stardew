import test from 'node:test';import assert from 'node:assert/strict';
import {checkSnapshot,checkGeodeRows,observedPath,checkCartRows} from '../scripts/game-fixture-compare.mjs';
test('fixture checks distinguish missing, unknown and incorrect values',()=>{const sample={version:'1.6.15',progress:{xp:[10,20,30,40,50],money:null}};assert.deepEqual(checkSnapshot(sample,{'version':'1.6.15','progress.xp.1':20,'progress.money':null,'progress.walnutsFound':null,'progress.xp.0':0}).map(x=>x.passed),[true,true,true,false,false]);assert.throws(()=>checkSnapshot(sample,{}));assert.throws(()=>observedPath(sample,'progress.constructor'));assert.throws(()=>observedPath(sample,'fingerprint'))});
test('observed geode sequence checks both identity and quantity without generating expected values',()=>{const rows=[{id:390,quantity:3},{id:74,quantity:1}];assert.deepEqual(checkGeodeRows(rows,[{id:390,quantity:3},{id:74,quantity:2},{id:330,quantity:1}]).map(x=>x.passed),[true,false,false]);assert.throws(()=>checkGeodeRows(rows,[]));assert.throws(()=>checkGeodeRows(rows,[{id:390,quantity:0}]))});

test('cart comparisons include venue, slot, label, quantity and price and do not confirm uncertain books',()=>{const rows=[{absoluteDay:99,venue:'Night Market',stock:[{kind:'ordinary',label:'Example',price:500,quantity:1}],offers:[{label:'Tea Set',price:1000000}],skillBook:{label:'Example Book',price:6000,quantity:1,identityUncertain:true}}];const o={absoluteDay:99,venue:'Night Market',kind:'ordinary',label:'Example',price:500,quantity:1};assert.deepEqual(checkCartRows(rows,[o,{...o,venue:'Forest Cart'},{...o,price:600},{...o,quantity:5},{...o,kind:'skill-book',label:'Example Book',price:6000},{...o,kind:'special',label:'Tea Set',price:1000000}]).map(x=>x.passed),[true,false,false,false,false,false]);assert.throws(()=>checkCartRows(rows,[]))});

// Synthetic end-to-end harness regression; not independent game evidence.
import {mkdtempSync,writeFileSync,rmSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
test('actual local fixture command evaluates save, geode and cart and rejects mismatches and escaping paths',()=>{
 const root=mkdtempSync(join(tmpdir(),'stardew-fixture-'));try{
  const dir=join(root,'private');mkdirSync(dir);
  const xml='<SaveGame><gameVersion>1.6.15</gameVersion><uniqueIDForThisGame>123456789</uniqueIDForThisGame><useLegacyRandom>true</useLegacyRandom><year>1</year><dayOfMonth>5</dayOfMonth><currentSeason>spring</currentSeason><whichFarm>0</whichFarm><specialOrders/><player><UniqueMultiplayerID>-987654321</UniqueMultiplayerID><name>LOCAL_PRIVATE_MARKER</name><deepestMineLevel>71</deepestMineLevel><money>500</money><stats><Values><item><key><string>geodesCracked</string></key><value><unsignedInt>100</unsignedInt></value></item></Values></stats></player></SaveGame>';
  writeFileSync(join(dir,'private-save'),xml);writeFileSync(join(root,'outside-save'),xml);
  const manifest=join(dir,'observations.json'),common={version:'1.6.15',save:'private-save',observationSource:'Synthetic CLI regression, not game capture'};
  const save={...common,kind:'save',checks:{version:'1.6.15',year:1,day:5,'progress.money':500}};
  const geode={...common,kind:'geode',container:'Geode',observed:[{id:390,quantity:3},{id:549,quantity:1}]};
  const cart={...common,kind:'cart',observed:[{absoluteDay:5,venue:'Forest Cart',kind:'ordinary',label:'Battery Pack',price:2500,quantity:1}]};
  const run=cases=>{writeFileSync(manifest,JSON.stringify({schema:1,cases}));const r=spawnSync(process.execPath,['--experimental-strip-types',fileURLToPath(new URL('../scripts/verify-game-fixtures.mjs',import.meta.url)),manifest],{encoding:'utf8',timeout:30000});assert.ifError(r.error);const output=r.stdout+r.stderr;for(const privateValue of ['123456789','987654321','LOCAL_PRIVATE_MARKER','private-save','outside-save',root])assert.ok(!output.includes(privateValue),'Private fixture value leaked');return {status:r.status,output}};
  const ok=run([save,geode,cart]);assert.equal(ok.status,0,ok.output);assert.match(ok.output,/7 passed, 0 failed/);
  const bad=run([{...save,checks:{'progress.money':501}},{...cart,save:'../outside-save'}]);assert.equal(bad.status,1,bad.output);assert.match(bad.output,/0 passed, 2 failed/);
 }finally{rmSync(root,{recursive:true,force:true})}
});
