import test from 'node:test';
import assert from 'node:assert/strict';
import {PERFECTION,perfection,perfectionDisplay,perfectionDisplayRange} from '../src/lib/game-rules.ts';
import {teamPerfection,PLAYER_GOALS} from '../src/lib/team-perfection.ts';
const full=Object.fromEntries(PERFECTION.map(p=>[p.id,p.max]));
test('whole-percent reference rounds down, not nearest; complete and waiver boundaries',()=>{
 assert.equal(perfectionDisplay({},0),0);
 assert.equal(perfectionDisplay({skills:3},0),0);
 assert.equal(perfectionDisplay({skills:5},0),1);
 assert.equal(perfectionDisplay({...full,skills:24},0),99);
 assert.equal(perfectionDisplay(full,0),100);
 assert.equal(perfectionDisplay({...full,skills:24},1),100);
 assert.equal(perfectionDisplay({stardrops:6,monsters:11,clock:0},0),0);
 assert.equal(perfectionDisplay({fishing:36,obelisks:2},0),7);
 assert.throws(()=>perfectionDisplay({fishing:73},0));
 assert.throws(()=>perfectionDisplay({},-1));
});
test('exact integer boundaries across every category and range never round up',()=>{
 for(const p of PERFECTION)for(let n=0;n<=p.max;n++){
  const v={[p.id]:n},expected=p.all?(n===p.max?p.weight:0):Math.floor(n*p.weight/p.max);
  assert.equal(perfectionDisplay(v,0),expected,p.id+':'+n);
 }
 assert.deepEqual(perfectionDisplayRange({skills:3},0),{lower:0,upper:95});
 assert.deepEqual(perfectionDisplayRange(full,0),{lower:100,upper:100});
 assert.ok(perfection({...full,skills:24},0).score>99);
});
test('multiplayer reference displays highest category separately from fractional score',()=>{
 const empty=Object.fromEntries(PLAYER_GOALS.map(p=>[p.id,0]));
 const result=teamPerfection({shared:{clock:0,obelisks:0,walnuts:0},players:[{...empty,fishing:58},{...empty,cooking:81}],waivers:0});
 assert.equal(result.displayLower,18);assert.equal(result.displayUpper,18);
 const unknown=teamPerfection({shared:{},players:[{}],waivers:0},true);
 assert.equal(unknown.displayLower,0);assert.equal(unknown.displayUpper,100);
});
