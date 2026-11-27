import test from 'node:test';import assert from 'node:assert/strict';import {decodeRemixed,remixedProgress,parseSavedBundles,addSavedBundles} from '../src/lib/remixed-bundles.ts';import {matchesFishReference,referenceFishRoute} from '../src/lib/fish-conditions.ts';import {FISHING} from '../src/lib/game-collections.ts';
test('remixed requirements use full donated slots and validate quantities',()=>{const b={id:'r1',room:'crafts',name:'Example',needed:1,slots:[{name:'A',quantity:3,quality:2 as const,donated:2},{name:'B',quantity:1,quality:0 as const,donated:1}]};assert.equal(remixedProgress(decodeRemixed({schema:1,bundles:[b]}).bundles[0]).done,true);assert.throws(()=>decodeRemixed({schema:1,bundles:[{...b,needed:3}]}));assert.throws(()=>decodeRemixed({schema:1,bundles:[b,b]}));assert.throws(()=>decodeRemixed({schema:1,bundles:[{...b,slots:[{...b.slots[0],donated:4}]}]}))});
test('recorded fish time supports midnight and preserves unspecified conditions',()=>{const fish=(name:string)=>FISHING.find(f=>f.name===name)!;const base={location:'Ocean',weather:'rain',time:25*60,includeUnknown:false,method:'all'};assert.equal(matchesFishReference(fish('Eel'),base),true);assert.equal(matchesFishReference(fish('Eel'),{...base,time:12*60}),false);assert.equal(matchesFishReference(fish('Eel'),{...base,time:26*60}),false);assert.equal(matchesFishReference(fish('Anchovy'),base),false);assert.equal(matchesFishReference(fish('Anchovy'),{...base,includeUnknown:true}),true);assert.equal(referenceFishRoute(fish('Albacore')).ranges.length,2)});

test('saved bundles validate quality, quantities and necessary slots without assuming completed donations',()=>{
 const parsed=parseSavedBundles([
  {key:'Pantry/95',value:'Sample Crops//(O)24 3 2 188 1 4/0/1'},
  {key:'Vault/96',value:'Sample Gold//-1 2500 2500/0'},
  {key:'Fish Tank/97',value:'Invalid//145 1 3/0'},
  {key:'Pantry/98',value:'Invalid//24 1 0/0/2'}
 ]);
 assert.equal(parsed.excluded,2);
 const [crops,vault]=parsed.state.bundles;
 assert.equal(crops.needed,1);
 assert.deepEqual(crops.slots.map(s=>[s.name,s.quantity,s.quality,s.donated]),[['Parsnip',3,2,0],['Green Bean',1,3,0]]);
 assert.deepEqual(vault.slots,[{name:'Gold',quantity:2500,quality:0,donated:0}]);
 crops.slots[0].donated=3;
 assert.equal(addSavedBundles(parsed.state,parsed.state).bundles[0].slots[0].donated,3);
});
