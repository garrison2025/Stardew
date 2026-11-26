import test from 'node:test';import assert from 'node:assert/strict';import {decodeLayout,emptyLayout,paintLine} from '../src/lib/layout.ts';
test('continuous drawing fills gaps and erases cells',()=>{const row=paintLine([],0,0,4,0,'crop');assert.equal(row.length,5);assert.equal(paintLine(row,1,0,3,0,'erase').length,2)});
test('full settings survive roundtrip',()=>{const p={...emptyLayout(),w:24,radius:3,cells:paintLine([],0,0,2,2,'crop')};assert.deepEqual(decodeLayout(JSON.parse(JSON.stringify(p))),p)});
test('old arrays migrate without clipping',()=>{const p=decodeLayout([{x:24,y:20,kind:'path'}]);assert.equal(p.w,25);assert.equal(p.h,21)});
test('reject bad coordinates and duplicate entries',()=>{assert.throws(()=>decodeLayout({...emptyLayout(),cells:[{x:99,y:0,kind:'crop'}]}));assert.throws(()=>decodeLayout({...emptyLayout(),cells:[{x:0,y:0,kind:'crop'},{x:0,y:0,kind:'path'}]}))});
