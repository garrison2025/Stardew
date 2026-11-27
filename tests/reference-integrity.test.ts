import test from 'node:test';import assert from 'node:assert/strict';
import {BUNDLES,ROOMS,SLOT_MAP} from '../src/lib/bundle-data.ts';
import {CATALOGS,TARGETS} from '../src/lib/game-collections.ts';
import {SAVE_COLLECTION_IDS} from '../src/lib/save-collection-ids.ts';
import {MUSEUM_ITEMS,ITEM_MAP} from '../src/lib/museum-data.ts';
import {FARM_TEMPLATE_LINKS} from '../src/lib/farm-templates.ts';
import {MAPS,ITEMS,TERRAIN,originalMap,blankLocalMap,paintTerrainRect,type Plan} from '../src/lib/map-model.ts';
import {TASKS,TASK_MAP} from '../src/lib/walnut-data.ts';
import {FULL_WALNUT_KEYS,LIMITED_WALNUT_KEYS} from '../src/lib/walnut-observations.ts';
import {PERFECTION} from '../src/lib/game-rules.ts';
import {SEASON_CROPS,OWNED_CROPS} from '../src/lib/crop-data.ts';
const unique=(xs:readonly string[])=>assert.equal(new Set(xs).size,xs.length);
test('reference integrity across modules',()=>{
 for(const [k,rows] of Object.entries(CATALOGS)){unique(rows.map(x=>x.name));assert.equal(rows.length,TARGETS[k as keyof typeof TARGETS]);for(const r of rows)for(const i of r.ingredients??[])assert.ok(i.name&&Number.isInteger(i.quantity)&&i.quantity>0)}
 unique(MUSEUM_ITEMS.map(x=>x.id));assert.equal(ITEM_MAP.size,95);for(const name of Object.values(SAVE_COLLECTION_IDS.museum))assert.ok(ITEM_MAP.has(name),name);
 for(const k of ['shipping','cooking','fishing'] as const){const names=new Set(CATALOGS[k].map(x=>x.name));for(const name of Object.values(SAVE_COLLECTION_IDS[k]))assert.ok(names.has(name),k+': '+name)}
 unique(BUNDLES.map(x=>x.id));const slots=BUNDLES.flatMap(x=>x.slots);unique(slots.map(x=>x.id));assert.equal(SLOT_MAP.size,slots.length);for(const b of BUNDLES){assert.ok(ROOMS.some(r=>r.id===b.room));assert.ok(b.needed>0&&b.needed<=b.slots.length);for(const s of b.slots)assert.ok(s.quantity>0&&[0,1,2].includes(s.quality))}
 unique(MAPS.map(x=>x.id));unique(ITEMS.map(x=>x.id));assert.equal(FARM_TEMPLATE_LINKS.length,8);for(const f of FARM_TEMPLATE_LINKS){const m=originalMap(f.id);assert.equal(m.tiles.length,m.w*m.h);assert.ok(m.tiles.every(t=>TERRAIN.includes(t)));assert.equal(m.source,'original')}
 unique(TASKS.map(x=>x.id));assert.equal(TASKS.reduce((n,t)=>n+t.count,0),130);for(const k of [...Object.keys(FULL_WALNUT_KEYS),...Object.keys(LIMITED_WALNUT_KEYS)])assert.ok(TASK_MAP.has(k));unique([...Object.values(FULL_WALNUT_KEYS),...Object.values(LIMITED_WALNUT_KEYS)]);assert.equal(new Set([...Object.keys(FULL_WALNUT_KEYS),...Object.keys(LIMITED_WALNUT_KEYS),'coconut']).size,TASKS.length);
 assert.equal(PERFECTION.reduce((n,p)=>n+p.weight,0),100);unique(PERFECTION.map(p=>p.id));unique([...SEASON_CROPS,...OWNED_CROPS].map(c=>c.id));for(const c of [...SEASON_CROPS,...OWNED_CROPS])assert.ok(c.growth>0&&c.price>=0&&c.yield>0&&c.seed>=0)
});
test('private terrain rectangle is atomic and bounded',()=>{const p:Plan={schema:2,map:blankLocalMap(16,16),season:'spring',objects:[{id:'one',itemId:'seedling',x:5,y:5,rotation:0}]};const next=paintTerrainRect(p,{x:0,y:0,w:4,h:4},'water');assert.equal(next.map.tiles.filter(t=>t==='water').length,16);assert.equal(p.map.tiles.filter(t=>t==='water').length,0);assert.throws(()=>paintTerrainRect(p,{x:4,y:4,w:3,h:3},'water'));assert.throws(()=>paintTerrainRect(p,{x:15,y:15,w:2,h:2},'water'))});
