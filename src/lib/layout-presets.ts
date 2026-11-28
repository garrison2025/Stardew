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
