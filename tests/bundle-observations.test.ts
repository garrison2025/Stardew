import test from 'node:test';import assert from 'node:assert/strict';
import {decodeBundleObservations,observedCommunityCenterSummary,copyObservedBundles,observedBundleStatus} from '../src/lib/bundle-observations.ts';
import {emptyRemixed} from '../src/lib/remixed-bundles.ts';
import {decodeSaveObservations,observationsOf} from '../src/lib/save-observations.ts';
import {saveMergeUpdates} from '../src/lib/save-merge.ts';
import type {SaveBundle} from '../src/lib/save-bundles.ts';
import type {SaveProgress} from '../src/lib/save-progress.ts';
const bundle:SaveBundle={id:17,room:'Crafts Room',name:'Example',needed:2,slots:[{item:'388',quantity:99,quality:0,donated:true},{item:'388',quantity:99,quality:0,donated:null},{item:'24',quantity:5,quality:4,donated:false}]};
test('saved definitions and tri-state donations survive local observation roundtrip',()=>{const p:SaveProgress={bundles:[bundle],xp:null,money:null,lifetimeEarnings:null,walnutsFound:null,walnutsBalance:null,crafting:null,learnedCooking:null,warnings:[]};const rec=observationsOf(p);assert.deepEqual(decodeSaveObservations(JSON.parse(JSON.stringify(rec))).bundles,[bundle]);assert.deepEqual(observedBundleStatus(bundle),{positive:1,unknown:1,remaining:1,done:false});assert.deepEqual(Object.keys(saveMergeUpdates(p)),['save-observations-v1']);assert.throws(()=>decodeBundleObservations([bundle,bundle]));assert.throws(()=>decodeBundleObservations([{...bundle,slots:[{...bundle.slots[0],donated:'true'}]}]));});
test('copy exact slot definitions without erasing manual donations; conflict skipped',()=>{const a=copyObservedBundles(emptyRemixed(),[bundle]);assert.equal(a.added,1);assert.deepEqual(a.state.bundles[0].slots.map(s=>s.donated),[99,0,0]);assert.equal(a.state.bundles[0].slots[2].quality,3);a.state.bundles[0].slots[1].donated=12;const b=copyObservedBundles(a.state,[{...bundle,slots:bundle.slots.map(s=>({...s,donated:false}))}]);assert.equal(b.updated,1);assert.deepEqual(b.state.bundles[0].slots.map(s=>s.donated),[99,12,0]);const c=copyObservedBundles(b.state,[{...bundle,needed:1}]);assert.equal(c.skipped,1);assert.deepEqual(c.state,b.state);});

test('save completion survives persistence without crediting particular donations',()=>{
 const completion:SaveBundle={...bundle,completedInSave:true,slots:bundle.slots.map(slot=>({...slot,donated:null}))};
 const [decoded]=decodeBundleObservations(JSON.parse(JSON.stringify([completion])));
 assert.deepEqual(observedBundleStatus(decoded),{positive:0,unknown:3,remaining:0,done:true});
 assert.deepEqual(copyObservedBundles(emptyRemixed(),[decoded]).state.bundles[0].slots.map(slot=>slot.donated),[0,0,0]);
 assert.throws(()=>decodeBundleObservations([{...completion,slots:bundle.slots}]));
 assert.deepEqual(observedCommunityCenterSummary([decoded,{...decoded,room:'Abandoned Joja Mart'}]),{total:1,completed:1});
});
