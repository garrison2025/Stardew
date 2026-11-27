import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.argv[2]||'public';
const manifest=JSON.parse(fs.readFileSync(path.join(root,'art/manifest.json'),'utf8'));
const expected={
 'kenney-outdoor':{file:'/art/kenney-outdoor.png',sha:'79b13326ceb8557a98b2b78aa5e8e7b9269f6693',size:94579,w:968,h:526,source:'https://kenney.nl/assets/roguelike-rpg-pack'},
 'kenney-indoor':{file:'/art/kenney-indoor.png',sha:'ca6347a204e84dac0727a9914041a6e53b1577b9',size:62232,w:1832,h:1220,source:'https://kenney.nl/assets/roguelike-indoors'}
};
assert.equal(manifest.schema,1);
assert.equal(manifest.officialAssets.enabled,false,'Official art is not approved');
assert.equal(manifest.officialAssets.permission,null);
assert.equal(manifest.packs.length,Object.keys(expected).length);
assert.equal(new Set(manifest.packs.map(p=>p.id)).size,2);
for(const p of manifest.packs){
 const e=expected[p.id];assert.ok(e,'Unknown artwork pack');
 assert.equal(p.license,'CC0-1.0');assert.equal(p.author,'Kenney');assert.equal(p.source,e.source);assert.equal(p.path,e.file);assert.equal(p.gitBlob,e.sha);
 const b=fs.readFileSync(path.join(root,p.path));assert.equal(b.length,e.size);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),e.w);assert.equal(b.readUInt32BE(20),e.h);assert.equal(p.width,e.w);assert.equal(p.height,e.h);
 const hash=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');assert.equal(hash,e.sha,p.id+' blob mismatch');
}
const credits=fs.readFileSync(path.join(root,'art/credits.html'),'utf8');
for(const p of manifest.packs){assert.ok(credits.includes(p.source)&&credits.includes(p.path),'Missing artwork credit '+p.id)}
const licenses=['mouseypounds.txt','stardew-checkup.txt'];
for(const name of licenses){const content=fs.readFileSync(path.join(root,'licenses',name),'utf8');assert.ok(content.includes('MIT License')&&content.includes('Copyright (c) 2017 MouseyPounds')&&content.includes('The above copyright notice and this permission notice')&&content.includes('THE SOFTWARE IS PROVIDED "AS IS"'),'Missing MIT notice '+name)}
assert.deepEqual(fs.readdirSync(path.join(root,'art')).sort(),['credits.html','kenney-indoor.png','kenney-outdoor.png','manifest.json']);
console.log('Verified two recorded CC0 image blobs, dimensions, credits and upstream MIT notices in '+root+'. This is a provenance integrity check, not commercial rights approval.');
