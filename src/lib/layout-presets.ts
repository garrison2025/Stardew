import {builtinFarmPlan} from './builtin-farm-preview.ts';
import {newPlan,placementError,itemById,irrigation,scarecrowCoverage,posKey,type Plan,type Placed,type Season} from './map-model.ts';
export const LAYOUT_PRESETS=[
 {id:'crop-blocks',name:'Irrigated crop blocks',landscape:'orchard',note:'Four iridium-sprinkler crop blocks, central scarecrow and storage.'},
 {id:'ranch',name:'Animal ranch',landscape:'pasture',note:'Barn, coop, silo and separated crop area; leave open grazing space.'},
 {id:'river-workshop',name:'Riverland workshop',landscape:'riverbend',note:'Fishing pond, mill, shed and small crop area on schematic river terrain.'},
 {id:'woodland-retreat',name:'Woodland retreat',landscape:'woodland',note:'Cottage, paths, trees and a small kitchen-garden-style crop plot.'}
] as const;
export type PresetId=typeof LAYOUT_PRESETS[number]['id'];
export function layoutPreset(id:PresetId,season:Season='spring'):Plan{
 const preset=LAYOUT_PRESETS.find(p=>p.id===id);if(!preset)throw Error('Unknown layout preset');
 const plan={...newPlan(preset.landscape),season};let counter=0;
 function add(itemId:string,x:number,y:number){const p:Placed={id:'preset-'+(++counter),itemId,x,y,rotation:0};if(placementError(plan.map,plan.objects,p))return false;plan.objects.push(p);return true}
 function building(itemId:string,ax:number,ay:number){for(let r=0;r<=18;r++)for(let y=ay-r;y<=ay+r;y++)for(let x=ax-r;x<=ax+r;x++){if(Math.max(Math.abs(x-ax),Math.abs(y-ay))!==r)continue;if(add(itemId,x,y))return true}return false}
 function block(cx:number,cy:number,crop:string){if(!add('iridium-sprinkler',cx,cy))return;for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)if(x!==cx||y!==cy)add(crop,x,y)}
 if(id==='crop-blocks'){for(const [x,y] of [[20,14],[26,14],[20,20],[26,20]])block(x,y,'seedling');building('deluxe-scarecrow',23,17);building('game-shed',38,12);building('chest',31,12)}
 if(id==='ranch'){building('game-barn',38,10);building('game-coop',38,18);building('game-silo',46,18);building('game-stable',30,10);building('game-well',31,26);block(22,15,'seedling');building('scarecrow',25,15)}
 if(id==='river-workshop'){building('game-fish-pond',12,11);building('game-mill',17,22);building('game-shed',45,15);building('game-shipping-bin',47,22);block(19,15,'crop-blueberry');building('scarecrow',23,16)}
 if(id==='woodland-retreat'){building('cottage',23,9);building('game-well',30,10);block(23,16,'crop-parsnip');building('scarecrow',27,16);for(let x=18;x<36;x++)add('wood-path',x,22);for(const [x,y] of [[17,24],[24,25],[32,24]])building('flowerbed',x,y)}
 return plan;
}
const costs:Record<string,{gold:number;materials:Record<string,number>}>={"game-earth-obelisk":{"gold":500000,"materials":{"Iridium Bar":10,"Earth Crystal":10}},"game-water-obelisk":{"gold":500000,"materials":{"Iridium Bar":5,"Clam":10,"Coral":10}},"game-desert-obelisk":{"gold":1000000,"materials":{"Iridium Bar":20,"Coconut":10,"Cactus Fruit":10}},"game-island-obelisk":{"gold":1000000,"materials":{"Iridium Bar":10,"Dragon Tooth":10,"Banana":10}},"game-gold-clock":{"gold":10000000,"materials":{}},"game-junimo-hut":{"gold":20000,"materials":{"Stone":200,"Starfruit":9,"Fiber":100}},"game-barn":{"gold":6000,"materials":{"Wood":350,"Stone":150}},"game-coop":{"gold":4000,"materials":{"Wood":300,"Stone":100}},"game-shed":{"gold":15000,"materials":{"Wood":300}},"game-silo":{"gold":100,"materials":{"Stone":100,"Clay":10,"Copper Bar":5}},"game-fish-pond":{"gold":5000,"materials":{"Stone":200,"Seaweed":5,"Green Algae":5}},"game-mill":{"gold":2500,"materials":{"Stone":50,"Wood":150,"Cloth":4}},"game-slime-hutch":{"gold":10000,"materials":{"Stone":500,"Refined Quartz":10,"Iridium Bar":1}},"game-stable":{"gold":10000,"materials":{"Hardwood":100,"Iron Bar":5}},"game-well":{"gold":1000,"materials":{"Stone":75}},"game-cabin":{"gold":100,"materials":{}},"game-shipping-bin":{"gold":250,"materials":{"Wood":150}},"game-pet-bowl":{"gold":5000,"materials":{"Hardwood":25}}};
export function layoutReferenceSummary(plan:Plan){
 const water=irrigation(plan),protectedTiles=scarecrowCoverage(plan),crops=plan.objects.filter(o=>itemById.get(o.itemId)?.category==='Crops');
 const materials:Record<string,number>={};let gold=0,priced=0,unpriced=0;
 for(const o of plan.objects){if(itemById.get(o.itemId)?.category!=='Buildings')continue;const c=costs[o.itemId];if(!c){unpriced++;continue}priced++;gold+=c.gold;for(const [name,n] of Object.entries(c.materials))materials[name]=(materials[name]??0)+n}
 return {crops:crops.length,watered:crops.filter(o=>water.has(posKey(o.x,o.y))).length,protected:crops.filter(o=>protectedTiles.has(posKey(o.x,o.y))).length,gold,materials,priced,unpriced};
}

export const REFERENCE_LAYOUT_PRESETS=[
 {id:'ref-standard',name:'Standard · expandable crop blocks',farm:0,stage:'Expansion',buildings:['game-shed'],machines:['machine-keg','machine-jar'],blocks:2,note:'Two quality-sprinkler blocks with space for a shed and outdoor processing.'},
 {id:'ref-riverland',name:'Riverland · fish and crops',farm:1,stage:'Early expansion',buildings:['game-fish-pond'],machines:[],blocks:1,note:'Fish pond and a compact irrigated crop block on the base terrain reference.'},
 {id:'ref-forest',name:'Forest · mixed workshop',farm:2,stage:'Expansion',buildings:['game-shed'],machines:['machine-jar'],blocks:1,note:'Small planting area and preserves workshop. Preserve space for natural resources in game.'},
 {id:'ref-hilltop',name:'Hill-top · ore processing',farm:3,stage:'Early expansion',buildings:['game-shed'],machines:['machine-furnace','machine-furnace'],blocks:1,note:'Furnace markers, shed and a compact crop block; actual quarry access requires checking.'},
 {id:'ref-wilderness',name:'Wilderness · compact homestead',farm:4,stage:'Early expansion',buildings:['game-silo'],machines:['chest'],blocks:1,note:'Small irrigated plot, silo and storage marker. Night monsters are not modeled.'},
 {id:'ref-four-corners',name:'Four Corners · production zones',farm:5,stage:'Expansion',buildings:['game-shed','game-silo'],machines:['machine-keg','machine-jar'],blocks:2,note:'Two planting blocks and separate production building markers; not an exact zoning optimizer.'},
 {id:'ref-beach',name:'Beach · non-sand crop patch',farm:6,stage:'Early expansion',buildings:['game-fish-pond'],machines:[],blocks:1,note:'Use reference-approved irrigable soil for one block and reserve other land for buildings.'},
 {id:'ref-meadowlands',name:'Meadowlands · livestock expansion',farm:7,stage:'Early expansion',buildings:['game-barn','game-silo'],machines:['machine-cheese','machine-mayonnaise'],blocks:1,note:'Retain the starter coop and fences, add barn, silo and small irrigated field.'}
] as const;
export type ReferencePresetId=typeof REFERENCE_LAYOUT_PRESETS[number]['id'];
export type AnyPresetId=PresetId|ReferencePresetId;
/** Deterministic editable example, not optimal or exact gameplay. Every addition uses the existing placement validator. */
export function referenceLayoutPreset(id:ReferencePresetId,season:Season='spring'):Plan{
 const p=REFERENCE_LAYOUT_PRESETS.find(r=>r.id===id);if(!p)throw Error('Unknown reference preset');
 const plan=builtinFarmPlan('local-starplan-'+p.farm,season,true);
 const {w,h}=plan.map;
 const cells=Array.from({length:w*h},(_,i)=>({x:i%w,y:Math.floor(i/w)}));
 const cx=Math.floor(w/2),cy=Math.floor(h/2);
 cells.sort((a,b)=>(Math.abs(a.x-cx)+Math.abs(a.y-cy))-(Math.abs(b.x-cx)+Math.abs(b.y-cy))||a.y-b.y||a.x-b.x);
 let counter=0;
 const marker=(itemId:string,x:number,y:number):Placed=>({id:'ref-example-'+counter++,itemId,x,y,rotation:0});
 function addNear(itemId:string,ax:number,ay:number){
  const ordered=[...cells].sort((a,b)=>(Math.abs(a.x-ax)+Math.abs(a.y-ay))-(Math.abs(b.x-ax)+Math.abs(b.y-ay))||a.y-b.y||a.x-b.x);
  for(const c of ordered){const o=marker(itemId,c.x,c.y);if(!placementError(plan.map,plan.objects,o)){plan.objects.push(o);return o}}
  throw Error('Reference example could not place '+itemId);
 }
 for(let block=0;block<p.blocks;block++){
  let placed=false;
  for(const c of cells){
   if(c.x<1||c.y<1||c.x>=w-1||c.y>=h-1)continue;
   const additions:Placed[]=[marker('quality-sprinkler',c.x,c.y)];
   for(let y=c.y-1;y<=c.y+1;y++)for(let x=c.x-1;x<=c.x+1;x++)if(x!==c.x||y!==c.y)additions.push(marker('seedling',x,y));
   const trial=[...plan.objects];let ok=true;
   for(const o of additions){if(placementError(plan.map,trial,o)){ok=false;break}trial.push(o)}
   if(!ok)continue;
   const wet=irrigation({...plan,objects:trial});if(!additions.slice(1).every(o=>wet.has(posKey(o.x,o.y))))continue;
   // A scarecrow must actually cover all new crop markers before the block is committed.
   const nearby=cells.filter(q=>Math.abs(q.x-c.x)<=4&&Math.abs(q.y-c.y)<=4);
   for(const q of nearby){const guard=marker('scarecrow',q.x,q.y);if(placementError(plan.map,trial,guard))continue;
    const complete=[...trial,guard],protectedTiles=scarecrowCoverage({...plan,objects:complete});
    if(!additions.slice(1).every(o=>protectedTiles.has(posKey(o.x,o.y))))continue;
    plan.objects=complete;placed=true;break;
   }
   if(placed)break;
  }
  if(!placed)throw Error('Reference example has no verified irrigated crop block');
 }
 let i=0;for(const building of p.buildings){addNear(building,Math.floor(w*0.7),Math.floor(h*0.55)+i*5);i++}
 for(const machine of p.machines)addNear(machine,Math.floor(w*0.7),Math.floor(h*0.45));
 return plan;
}
export function loadLayoutExample(id:AnyPresetId,season:Season='spring'){
 return REFERENCE_LAYOUT_PRESETS.some(p=>p.id===id)?referenceLayoutPreset(id as ReferencePresetId,season):layoutPreset(id as PresetId,season);
}
