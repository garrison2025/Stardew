import {decodeTileRestrictions,importDataLayers,importRestrictionMask,restrictionError,type TileRestrictions} from './data-layers.ts';
// Independently authored terrain and object model. None of these maps or footprints are official game data.
import {GAME_CROPS} from './crop-data.ts';
import {decodeInterior,type Interior,type RoomId} from './indoor-model.ts';
export const TERRAIN=['grass','soil','water','cliff','forest','road'] as const;
export type Terrain=typeof TERRAIN[number];
export const SEASONS=['spring','summer','autumn','winter'] as const;
export type Season=typeof SEASONS[number];
export type FarmMap={id:string;name:string;w:number;h:number;tiles:Terrain[];source:'original'|'local';restrictions?:TileRestrictions};
export type Item={id:string;name:string;category:string;w:number;h:number;art:string;color:string;radius?:number;pattern?:'cross'|'square';fixedOrientation?:boolean;documented?:boolean};
export const ITEMS:Item[]=[
{"id":"machine-keg","name":"Keg","category":"Equipment","w":1,"h":1,"art":"machine","color":"#b78652","fixedOrientation":true,"documented":true},
{"id":"machine-jar","name":"Preserves Jar","category":"Equipment","w":1,"h":1,"art":"machine","color":"#ae685b","fixedOrientation":true,"documented":true},
{"id":"machine-furnace","name":"Furnace","category":"Equipment","w":1,"h":1,"art":"machine","color":"#747d85","fixedOrientation":true,"documented":true},
{"id":"machine-cheese","name":"Cheese Press","category":"Equipment","w":1,"h":1,"art":"machine","color":"#d6b85b","fixedOrientation":true,"documented":true},
{"id":"machine-mayonnaise","name":"Mayonnaise Machine","category":"Equipment","w":1,"h":1,"art":"machine","color":"#d4d9c6","fixedOrientation":true,"documented":true},
{"id":"machine-loom","name":"Loom","category":"Equipment","w":1,"h":1,"art":"machine","color":"#9f806a","fixedOrientation":true,"documented":true},
{"id":"machine-oil","name":"Oil Maker","category":"Equipment","w":1,"h":1,"art":"machine","color":"#8fa65f","fixedOrientation":true,"documented":true},
{"id":"machine-dehydrator","name":"Dehydrator","category":"Equipment","w":1,"h":1,"art":"machine","color":"#bc8371","fixedOrientation":true,"documented":true},
{"id":"flower-tulip","name":"Tulip","category":"Crops","w":1,"h":1,"art":"flower","color":"#dc859d","fixedOrientation":true,"documented":true},
{"id":"flower-blue-jazz","name":"Blue Jazz","category":"Crops","w":1,"h":1,"art":"flower","color":"#728ad0","fixedOrientation":true,"documented":true},
{"id":"flower-poppy","name":"Poppy","category":"Crops","w":1,"h":1,"art":"flower","color":"#e56e5a","fixedOrientation":true,"documented":true},
{"id":"flower-summer-spangle","name":"Summer Spangle","category":"Crops","w":1,"h":1,"art":"flower","color":"#dfb75f","fixedOrientation":true,"documented":true},
{"id":"flower-fairy-rose","name":"Fairy Rose","category":"Crops","w":1,"h":1,"art":"flower","color":"#c77cb1","fixedOrientation":true,"documented":true},
{"id":"bee-house","name":"Bee House","category":"Equipment","w":1,"h":1,"art":"bee-house","color":"#d1a365","fixedOrientation":true,"documented":true},
{"id":"fruit-sapling","name":"Fruit tree sapling","category":"Nature","w":1,"h":1,"art":"fruit-sapling","color":"#8aaa65","fixedOrientation":true,"documented":true},
{id:'seedling',name:'Seedling',category:'Crops',w:1,h:1,art:'crop',color:'#9cc85a'},
{id:'berry',name:'Berry bush',category:'Crops',w:1,h:1,art:'crop',color:'#ca5375'},
{id:'sunflower',name:'Sunflower',category:'Crops',w:1,h:1,art:'flower',color:'#f5cc58'},
{id:'pumpkin',name:'Pumpkin',category:'Crops',w:1,h:1,art:'crop',color:'#ef9b42'},
{id:'trellis',name:'Trellis',category:'Crops',w:1,h:1,art:'trellis',color:'#91ba62'},
{id:'sprinkler',name:'Small sprinkler',category:'Equipment',w:1,h:1,art:'sprinkler',color:'#9ddce2',radius:1},
{id:'wide-sprinkler',name:'Wide sprinkler',category:'Equipment',w:1,h:1,art:'sprinkler',color:'#d6b76b',radius:2},
{id:'basic-sprinkler',name:'Basic sprinkler',category:'Equipment',w:1,h:1,art:'sprinkler',color:'#b9c9d0',radius:1,pattern:'cross',documented:true},
{id:'quality-sprinkler',name:'Quality sprinkler',category:'Equipment',w:1,h:1,art:'sprinkler',color:'#e5c267',radius:1,pattern:'square',documented:true},
{id:'iridium-sprinkler',name:'Iridium sprinkler',category:'Equipment',w:1,h:1,art:'sprinkler',color:'#be9fe0',radius:2,pattern:'square',documented:true},
{id:'nozzle-basic',name:'Basic sprinkler + nozzle',category:'Equipment',w:1,h:1,art:'sprinkler',color:'#9fd8cb',radius:1,pattern:'square',documented:true},
{id:'nozzle-quality',name:'Quality sprinkler + nozzle',category:'Equipment',w:1,h:1,art:'sprinkler',color:'#f1ce7d',radius:2,pattern:'square',documented:true},
{id:'nozzle-iridium',name:'Iridium sprinkler + nozzle',category:'Equipment',w:1,h:1,art:'sprinkler',color:'#d7b9ee',radius:3,pattern:'square',documented:true},
{id:'scarecrow',name:'Scarecrow',category:'Equipment',w:1,h:1,art:'post',color:'#bca064'},
{id:'deluxe-scarecrow',name:'Deluxe Scarecrow',category:'Equipment',w:1,h:1,art:'post',color:'#e1ba70',documented:true},
{id:'barrel',name:'Barrel',category:'Equipment',w:1,h:1,art:'barrel',color:'#b98955'},
{id:'chest',name:'Storage chest',category:'Equipment',w:1,h:1,art:'chest',color:'#c39860'},
{id:'cottage',name:'Cottage',category:'Buildings',w:4,h:3,art:'house',color:'#a45d46'},
{id:'barn',name:'Barn',category:'Buildings',w:5,h:3,art:'house',color:'#935040'},
{id:'coop',name:'Coop',category:'Buildings',w:3,h:2,art:'house',color:'#d5a75f'},
{id:'shed',name:'Workshop',category:'Buildings',w:3,h:2,art:'house',color:'#607f79'},
{id:'greenhouse',name:'Greenhouse',category:'Buildings',w:4,h:3,art:'glass',color:'#a9d1ac'},
{id:'pond',name:'Garden pond',category:'Buildings',w:3,h:3,art:'pond',color:'#6fadb8'},
{id:'game-barn',name:'Barn (game footprint)',category:'Buildings',w:7,h:4,art:'house',color:'#935040',fixedOrientation:true,documented:true},
{id:'game-coop',name:'Coop (game footprint)',category:'Buildings',w:6,h:3,art:'house',color:'#d5a75f',fixedOrientation:true,documented:true},
{id:'game-shed',name:'Shed (game footprint)',category:'Buildings',w:7,h:3,art:'house',color:'#607f79',fixedOrientation:true,documented:true},
{id:'game-silo',name:'Silo (game footprint)',category:'Buildings',w:3,h:3,art:'house',color:'#af785b',fixedOrientation:true,documented:true},
{"id":"game-fish-pond","name":"Fish Pond (game footprint)","category":"Buildings","w":5,"h":5,"art":"pond","color":"#6d9caa","fixedOrientation":true,"documented":true},
{"id":"game-mill","name":"Mill (game footprint)","category":"Buildings","w":4,"h":2,"art":"house","color":"#ad9668","fixedOrientation":true,"documented":true},
{"id":"game-slime-hutch","name":"Slime Hutch (game footprint)","category":"Buildings","w":7,"h":4,"art":"house","color":"#78879a","fixedOrientation":true,"documented":true},
{"id":"game-stable","name":"Stable (game footprint)","category":"Buildings","w":4,"h":2,"art":"house","color":"#a47751","fixedOrientation":true,"documented":true},
{"id":"game-well","name":"Well (game footprint)","category":"Buildings","w":3,"h":3,"art":"pond","color":"#809dac","fixedOrientation":true,"documented":true},
{"id":"game-cabin","name":"Cabin (game footprint)","category":"Buildings","w":5,"h":3,"art":"house","color":"#ae8669","fixedOrientation":true,"documented":true},
{"id":"game-shipping-bin","name":"Shipping Bin (game footprint)","category":"Buildings","w":2,"h":1,"art":"chest","color":"#b58d59","fixedOrientation":true,"documented":true},
{"id":"game-pet-bowl","name":"Pet Bowl (game footprint)","category":"Buildings","w":2,"h":2,"art":"pond","color":"#aebba0","fixedOrientation":true,"documented":true},
{id:'stone-path',name:'Stone path',category:'Paths & fences',w:1,h:1,art:'path',color:'#a8aaa0'},
{id:'wood-path',name:'Wood path',category:'Paths & fences',w:1,h:1,art:'path',color:'#c2a06d'},
{id:'brick-path',name:'Brick path',category:'Paths & fences',w:1,h:1,art:'path',color:'#b97a62'},
{id:'fence',name:'Wood fence',category:'Paths & fences',w:1,h:1,art:'fence',color:'#a37c4e'},
{id:'gate',name:'Gate (reference)',category:'Paths & fences',w:1,h:1,art:'fence',color:'#d2b276',documented:true},
{id:'oak',name:'Shade tree',category:'Nature',w:2,h:2,art:'tree',color:'#699b4e'},
{id:'pine',name:'Pine tree',category:'Nature',w:2,h:2,art:'pine',color:'#427e61'},
{id:'flowerbed',name:'Flower bed',category:'Nature',w:1,h:1,art:'flower',color:'#e6a3c8'},
{id:'rock',name:'Decorative rock',category:'Nature',w:1,h:1,art:'rock',color:'#8f9992'}
];
ITEMS.push(...GAME_CROPS.map(c=>({id:'crop-'+c.id,name:c.name+' (crop)',category:'Crops',w:1,h:1,art:c.trellis?'trellis':'crop',color:c.color,documented:true})));
// Save-observed footprints are editable planning markers, not game sprites or collision geometry.
ITEMS.push(
 {id:'game-farmhouse',name:'Farmhouse (saved footprint)',category:'Buildings',w:9,h:5,art:'house',color:'#a45d46',fixedOrientation:true,documented:true},
 {id:'game-greenhouse',name:'Greenhouse (saved footprint)',category:'Buildings',w:7,h:6,art:'glass',color:'#a9d1ac',fixedOrientation:true,documented:true},
{"id":"game-earth-obelisk","name":"Earth Obelisk (game footprint)","category":"Buildings","w":3,"h":2,"art":"magical","color":"#7c9a71","fixedOrientation":true,"documented":true},
{"id":"game-water-obelisk","name":"Water Obelisk (game footprint)","category":"Buildings","w":3,"h":2,"art":"magical","color":"#5e9aae","fixedOrientation":true,"documented":true},
{"id":"game-desert-obelisk","name":"Desert Obelisk (game footprint)","category":"Buildings","w":3,"h":2,"art":"magical","color":"#c3a36c","fixedOrientation":true,"documented":true},
{"id":"game-island-obelisk","name":"Island Obelisk (game footprint)","category":"Buildings","w":3,"h":2,"art":"magical","color":"#b17b60","fixedOrientation":true,"documented":true},
{"id":"game-gold-clock","name":"Gold Clock (game footprint)","category":"Buildings","w":3,"h":2,"art":"magical","color":"#d6b54e","fixedOrientation":true,"documented":true},
{"id":"game-junimo-hut","name":"Junimo Hut (game footprint)","category":"Buildings","w":3,"h":2,"art":"magical","color":"#7e9e55","fixedOrientation":true,"documented":true},
 {id:'observed-weeds',name:'Weeds (clearable marker)',category:'Nature',w:1,h:1,art:'crop',color:'#6e9c55'},
 {id:'observed-twig',name:'Twig (clearable marker)',category:'Nature',w:1,h:1,art:'rock',color:'#9a7655'},
 {id:'observed-stone',name:'Stone / ore rock (clearable marker)',category:'Nature',w:1,h:1,art:'rock',color:'#969a99'},
 {id:'observed-artifact',name:'Artifact spot (marker)',category:'Nature',w:1,h:1,art:'flower',color:'#bba27c'},
 {id:'observed-tree',name:'Tree trunk (saved tile)',category:'Nature',w:1,h:1,art:'tree',color:'#699b4e'},
 {id:'observed-grass',name:'Grass (clearable marker)',category:'Nature',w:1,h:1,art:'crop',color:'#88af58'}
);
ITEMS.push(
 {id:'observed-bush-small',name:'Small bush (saved tile)',category:'Nature',w:1,h:1,art:'tree',color:'#649a59',fixedOrientation:true},
 {id:'observed-bush-medium',name:'Medium bush (saved footprint)',category:'Nature',w:2,h:1,art:'tree',color:'#649a59',fixedOrientation:true},
 {id:'observed-bush-large',name:'Large bush (saved footprint)',category:'Nature',w:3,h:1,art:'tree',color:'#649a59',fixedOrientation:true},
 {id:'observed-stump',name:'Large stump (saved footprint)',category:'Nature',w:2,h:2,art:'rock',color:'#956d48',fixedOrientation:true},
 {id:'observed-log',name:'Large log (saved footprint)',category:'Nature',w:2,h:2,art:'rock',color:'#866445',fixedOrientation:true},
 {id:'observed-boulder',name:'Boulder (saved footprint)',category:'Nature',w:2,h:2,art:'rock',color:'#848b91',fixedOrientation:true},
 {id:'observed-meteorite',name:'Meteorite (saved footprint)',category:'Nature',w:2,h:2,art:'rock',color:'#79688a',fixedOrientation:true}
);
export const itemById=new Map(ITEMS.map(i=>[i.id,i]));
export const MAPS=[{id:'orchard',name:'Orchard valley',w:64,h:42},{id:'riverbend',name:'River bend',w:64,h:44},{id:'woodland',name:'Woodland clearing',w:60,h:44},{id:'hilltop',name:'Terraced hills',w:64,h:44},{id:'four-gardens',name:'Four gardens',w:64,h:64},{id:'coastal',name:'Coastal meadow',w:72,h:48},{id:'wild-grove',name:'Wild grove',w:64,h:48},{id:'pasture',name:'Pasture estate',w:68,h:48}] as const;
export function originalMap(id:string):FarmMap{
 const m=MAPS.find(v=>v.id===id);if(!m)throw Error('Unknown original map');
 const tiles:Terrain[]=[];
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){
  let t:Terrain='grass';const border=x<2||y<2||x>=m.w-2||y>=m.h-2;
  if(border)t='forest';
  else if(y<5+Math.floor(2*Math.sin(x*.27))||x<4+Math.floor(2*Math.sin(y*.3)))t='forest';
  else if((x>m.w-7&&y<13)||(y>m.h-5&&x>m.w-16))t='cliff';
  else if(id==='riverbend'&&Math.abs(x-(m.w*.53+7*Math.sin(y*.14)))<2.6)t='water';
  else if(id==='woodland'&&((x-13)**2+(y-14)**2<45||(x-47)**2+(y-30)**2<58))t='forest';
  else if(id==='hilltop'&&((y>15&&y<19&&x>23&&x<51)||(y>29&&y<32&&x>8&&x<36)))t='cliff';
  else if(id==='four-gardens'&&((Math.abs(x-32)<=1&&Math.abs(y-32)>4)||(Math.abs(y-32)<=1&&Math.abs(x-32)>4)))t='cliff';
  else if(id==='coastal'&&(x<10+3*Math.sin(y*.15)||y>m.h-6-2*Math.cos(x*.2)))t='water';
  else if(id==='wild-grove'&&(((x-15)/5)**2+((y-26)/9)**2<1||((x-46)/6)**2+((y-35)/4)**2<1))t='forest';
  else if(id==='pasture'&&((x-43)/10)**2+((y-13)/5)**2<1)t='soil';
  else if(((x-12)/7)**2+((y-(m.h-11))/5)**2<1)t='water';
  else if((y===7&&x>6&&x<m.w-6)||(x===m.w-9&&y>=7&&y<m.h-5))t='road';
  else if(x>=18&&x<=30&&y>=12&&y<=21)t='soil';
  tiles.push(t)
 }return {...m,tiles,source:'original'}
}
export type Placed={id:string;itemId:string;x:number;y:number;rotation:0|1;interior?:Interior};
export function roomForItem(itemId:string):RoomId|null{switch(itemId){case 'shed':case 'game-shed':return 'shed';case 'barn':case 'game-barn':return 'barn';case 'coop':case 'game-coop':return 'coop';case 'greenhouse':case 'game-greenhouse':return 'greenhouse';default:return null}}
export function attachInterior(plan:Plan,buildingId:string,input:Interior):Plan{const b=plan.objects.find(o=>o.id===buildingId),room=decodeInterior(input);if(!b||roomForItem(b.itemId)!==room.room)throw Error('Room does not match this building');return {...plan,objects:plan.objects.map(o=>o.id===buildingId?{...o,interior:room}:o)}}
export type Plan={schema:2;map:FarmMap;season:Season;objects:Placed[]};
export type Point={x:number;y:number};
export function dimensions(o:Pick<Placed,'itemId'|'rotation'>){const i=itemById.get(o.itemId);if(!i)throw Error('Unknown item');return o.rotation?{w:i.h,h:i.w}:{w:i.w,h:i.h}}
export function footprint(o:Placed):Point[]{const d=dimensions(o),out:Point[]=[];for(let y=o.y;y<o.y+d.h;y++)for(let x=o.x;x<o.x+d.w;x++)out.push({x,y});return out}
export const posKey=(x:number,y:number)=>x+','+y;
export function occupancy(objects:Placed[]){const out=new Map<string,Placed>();for(const o of objects)for(const p of footprint(o))out.set(posKey(p.x,p.y),o);return out}
export function terrainAt(map:FarmMap,x:number,y:number):Terrain|undefined{return x>=0&&y>=0&&x<map.w&&y<map.h?map.tiles[y*map.w+x]:undefined}
// Confirmed external placement geometry from Starplan's game-derived reference.
// This is construction clearance, NOT the complete original CollisionMap.
function referenceClearance(o:Placed):{x:number;y:number;passableOnly:boolean}[]{
 if(o.itemId==='game-farmhouse')return [{x:o.x+9,y:o.y+4,passableOnly:false},{x:o.x+5,y:o.y+5,passableOnly:true}];
 if(o.itemId==='game-greenhouse')return Array.from({length:6},(_,i)=>({x:o.x+2+i%3,y:o.y+6+Math.floor(i/3),passableOnly:true}));
 return [];
}
function referencePath(o:Placed){return ['stone-path','wood-path','brick-path'].includes(o.itemId)}
function referenceClearanceError(map:FarmMap,objects:Placed[],o:Placed,occupied:Map<string,Placed>){
 // Only the identified compact reference maps opt into the new rules. Older saved plans remain unchanged.
 if(map.restrictions?.source!=='local-restriction-mask'||!/^local-starplan-[0-7]$/.test(map.id))return null;
 for(const p of referenceClearance(o)){
  const t=terrainAt(map,p.x,p.y);if(!t)return 'Building clearance extends outside map boundary';
  if(['water','cliff','forest'].includes(t))return 'Building clearance is blocked';
  const index=p.y*map.w+p.x,r=map.restrictions;
  if(r.access[index]!=='C'||(!p.passableOnly&&r.build[index]!=='B'))return 'Building clearance is blocked by reference terrain';
  const other=occupied.get(posKey(p.x,p.y));if(other&&(!p.passableOnly||!referencePath(other)))return 'Building clearance overlaps an existing object';
 }
 const own=footprint(o);
 for(const b of objects)for(const p of referenceClearance(b)){
  if(own.some(t=>t.x===p.x&&t.y===p.y)&&(!p.passableOnly||!referencePath(o)))return 'Tile reserved for building clearance';
  if(referenceClearance(o).some(t=>t.x===p.x&&t.y===p.y&&(!t.passableOnly||!p.passableOnly)))return 'Building clearance areas conflict';
 }
 return null;
}
export function placementError(map:FarmMap,objects:Placed[],o:Placed):string|null{
 if(o.rotation&&itemById.get(o.itemId)?.fixedOrientation)return 'This game footprint has a fixed orientation';const occupied=occupancy(objects);for(const p of footprint(o)){const t=terrainAt(map,p.x,p.y);if(!t)return 'Outside map boundary';if(map.restrictions){const e=restrictionError(map.restrictions,p.y*map.w+p.x,itemById.get(o.itemId)?.category??'');if(e&&!(map.id==='local-starplan-6'&&map.restrictions.source==='local-restriction-mask'&&o.itemId==='game-farmhouse'&&o.x===59&&o.y===12&&p.x===64&&p.y===16&&map.restrictions.access[p.y*map.w+p.x]==='C'&&map.restrictions.build[p.y*map.w+p.x]==='N'&&map.restrictions.till[p.y*map.w+p.x]==='N'))return e}if(t==='water'||t==='cliff'||t==='forest')return 'Blocked terrain: '+t;if(t==='road'&&itemById.get(o.itemId)?.category!=='Paths & fences')return 'Road reserved for paths and fences';if(occupied.has(posKey(p.x,p.y)))return 'Overlaps an existing object'}return referenceClearanceError(map,objects,o,occupied);
}
// Pinned Starplan greenhouse-dirt property transition. Only known base cells are changed.
const greenhouseGround:Record<string,{x:number;y:number;base:string;fourCorners?:boolean}>={
 'local-starplan-0':{x:25,y:10,base:'004444444004444446004444446004444446000444444000044444'},
 'local-starplan-3':{x:25,y:10,base:'000444466004444444004444444004444444000444444000044444'},
 'local-starplan-4':{x:25,y:10,base:'004444466004444444004444444004444444000444444000044444'},
 'local-starplan-5':{x:36,y:29,base:'444444444000044444004444444004444444004444444000444444',fourCorners:true},
};
/** The first successful departure from the original greenhouse location changes its base ground.
 * The new immutable map is part of the scene snapshot, so save/undo/redo retain the transition.
 * Never apply to imported, replaced or manually modified reference areas that differ from the pinned mask.
 */
export function applyGreenhouseGroundTransition(before:Plan,after:Plan):Plan{
 if(before.map!==after.map)return after;
 const map=before.map,area=greenhouseGround[map.id],r=map.restrictions;
 if(!area||!r||r.source!=='local-restriction-mask'||map.w!==80||map.h!==(area.fourCorners?80:65))return after;
 const atHome=(o:Placed)=>o.itemId==='game-greenhouse'&&o.x===area.x&&o.y===area.y;
 if(!before.objects.some(atHome)||after.objects.some(atHome))return after;
 const indices=Array.from({length:54},(_,i)=>(area.y+Math.floor(i/9))*map.w+area.x+i%9);
 const bits=indices.map(i=>String((r.access[i]==='C'?0:1)|(r.build[i]==='B'?0:2)|(r.till[i]==='T'?0:4))).join('');
 if(bits!==area.base||indices.some(i=>!['grass','soil'].includes(map.tiles[i])))return after;
 const access=[...r.access],build=[...r.build],till=[...r.till],tiles=map.tiles.slice();
 indices.forEach((i,j)=>{access[i]='C';build[i]='B';till[i]=area.fourCorners&&j<6?'N':'T';tiles[i]=till[i]==='T'?'soil':'grass'});
 return {...after,map:{...map,tiles,restrictions:{...r,access:access.join(''),build:build.join(''),till:till.join('')}}};
}
export function moveSelection(plan:Plan,ids:Set<string>,x:number,y:number):Plan{
 const selected=plan.objects.filter(o=>ids.has(o.id));if(!selected.length)throw Error('Select objects first');
 const dx=x-Math.min(...selected.map(o=>o.x)),dy=y-Math.min(...selected.map(o=>o.y));
 const result=plan.objects.filter(o=>!ids.has(o.id));for(const o of selected){const next={...o,x:o.x+dx,y:o.y+dy};const error=placementError(plan.map,result,next);if(error)throw Error(error);result.push(next)}return applyGreenhouseGroundTransition(plan,{...plan,objects:result})
}
export function irrigation(plan:Plan){const out=new Set<string>(),occupied=occupancy(plan.objects);for(const o of plan.objects){const i=itemById.get(o.itemId),r=i?.radius;if(!r)continue;for(let y=o.y-r;y<=o.y+r;y++)for(let x=o.x-r;x<=o.x+r;x++){const dx=Math.abs(x-o.x),dy=Math.abs(y-o.y);if(dx+dy===0||(i?.pattern==='cross'&&dx+dy!==1))continue;const t=terrainAt(plan.map,x,y),target=occupied.get(posKey(x,y));if((t==='grass'||t==='soil')&&(!plan.map.restrictions||!restrictionError(plan.map.restrictions,y*plan.map.w+x,'Crops'))&&(!target||itemById.get(target.itemId)?.category==='Crops'))out.add(posKey(x,y))}}return out}
export function newPlan(id='orchard'):Plan{return {schema:2,map:originalMap(id),season:'spring',objects:[]}}
export function demoPlan(id='orchard'):Plan{
 const p=newPlan(id);let count=0;
 const add=(itemId:string,x:number,y:number)=>{const o:Placed={id:'demo-'+(++count),itemId,x,y,rotation:0};if(!placementError(p.map,p.objects,o))p.objects.push(o)};
 add('cottage',p.map.w-17,10);add('barn',p.map.w-17,17);add('coop',p.map.w-10,22);add('greenhouse',p.map.w-18,p.map.h-10);
 for(let y=12;y<=20;y++)for(let x=19;x<=29;x++){if(x===24||y===16)add('wood-path',x,y);else if((x===21||x===27)&&(y===14||y===18))add('sprinkler',x,y);else add(y<16?'seedling':'berry',x,y)}
 for(let x=8;x<18;x++)add('stone-path',x,9);add('oak',8,12);add('pine',12,14);add('flowerbed',15,10);add('chest',17,12);add('barrel',17,13);return p
}
export function decodeMap(input:unknown):FarmMap{
 const v=input as Partial<FarmMap>|null;if(!v||typeof v.id!=='string'||v.id.length>80||typeof v.name!=='string'||!v.name.trim()||v.name.length>100||!Number.isInteger(v.w)||!Number.isInteger(v.h)||v.w!<8||v.h!<8||v.w!>160||v.h!>160||!Array.isArray(v.tiles)||v.tiles.length!==v.w!*v.h!||v.tiles.some(t=>!TERRAIN.includes(t)))throw Error('Invalid map package: expected 8–160 tiles per dimension and known terrain codes.');
 return {id:v.id,name:v.name,w:v.w!,h:v.h!,tiles:[...v.tiles],source:'local',...(v.restrictions!==undefined?{restrictions:decodeTileRestrictions(v.restrictions,v.w!,v.h!)}:{})}
}
export function decodePlan(input:unknown):Plan{
 const v=input as Partial<Plan>|null;if(!v||v.schema!==2||!v.map||!SEASONS.includes(v.season as Season)||!Array.isArray(v.objects)||v.objects.length>4096)throw Error('Invalid scene plan');
 if(v.map.source!=='original'&&v.map.source!=='local')throw Error('Unknown map source');const map=v.map.source==='original'?originalMap(v.map.id):decodeMap(v.map);const result:Placed[]=[],ids=new Set<string>();
 for(const o of v.objects){if(!o||typeof o.id!=='string'||o.id.length>100||ids.has(o.id)||!itemById.has(o.itemId)||!Number.isInteger(o.x)||!Number.isInteger(o.y)||(o.rotation!==0&&o.rotation!==1))throw Error('Invalid object');const clean:Placed={id:o.id,itemId:o.itemId,x:o.x,y:o.y,rotation:o.rotation};if(o.interior!==undefined){const room=decodeInterior(o.interior);if(roomForItem(o.itemId)!==room.room)throw Error('Room does not match this building');clean.interior=room}const error=placementError(map,result,clean);if(error)throw Error(error);result.push(clean);ids.add(o.id)}return {schema:2,map,season:v.season!,objects:result}
}

export function blankLocalMap(w:number,h:number,name='Private screenshot map'):FarmMap{
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<8||h<8||w>160||h>160)throw Error('Map dimensions must be 8–160 whole tiles.');
 return {id:'private-screenshot',name,w,h,tiles:Array(w*h).fill('grass'),source:'local'}
}
export function paintTerrain(plan:Plan,point:Point,t:Terrain):Plan{
 if(!TERRAIN.includes(t)||!terrainAt(plan.map,point.x,point.y))return plan;
 const index=point.y*plan.map.w+point.x;if(plan.map.tiles[index]===t)return plan;
 const occupied=occupancy(plan.objects).get(posKey(point.x,point.y));
 if(occupied&&(t==='water'||t==='forest'||t==='cliff'||(t==='road'&&itemById.get(occupied.itemId)?.category!=='Paths & fences')))throw Error('Remove the object before marking this tile as blocked.');
 const tiles=plan.map.tiles.slice();tiles[index]=t;return {...plan,map:{...plan.map,source:'local',tiles}}
}
export type Calibration={x:number;y:number;tileWidth:number;tileHeight:number;opacity:number};
export function validateCalibration(c:Calibration,map:FarmMap,image:{width:number;height:number}){
 if(![c.x,c.y,c.tileWidth,c.tileHeight,c.opacity].every(Number.isFinite)||c.x<0||c.y<0||c.tileWidth<1||c.tileHeight<1||c.opacity<0||c.opacity>1||c.x+map.w*c.tileWidth>image.width+.01||c.y+map.h*c.tileHeight>image.height+.01)throw Error('Grid calibration extends outside the image or has invalid dimensions.');
 return c
}

/** Regular scarecrow radius: 248 surrounding tiles on an open map. */
export function scarecrowCoverage(plan:Plan){
 const protectedTiles=new Set<string>();
 for(const o of plan.objects){
  const radius=o.itemId==='scarecrow'?9:o.itemId==='deluxe-scarecrow'?17:0;
  if(!radius)continue;
  for(let dy=1-radius;dy<radius;dy++)for(let dx=1-radius;dx<radius;dx++){
   const distance=dx*dx+dy*dy;
   if(distance===0||distance>=radius*radius)continue;
   const x=o.x+dx,y=o.y+dy;
   if(x>=0&&x<plan.map.w&&y>=0&&y<plan.map.h)protectedTiles.add(posKey(x,y));
  }
 }
 return protectedTiles;
}

/** Atomic rectangle editing for privately defined terrain. No official map is inferred. */
export function paintTerrainRect(plan:Plan,rect:{x:number;y:number;w:number;h:number},tile:Terrain):Plan{
 if(plan.map.source!=='local'||!TERRAIN.includes(tile)||![rect.x,rect.y,rect.w,rect.h].every(Number.isSafeInteger)||rect.x<0||rect.y<0||rect.w<1||rect.h<1||rect.x+rect.w>plan.map.w||rect.y+rect.h>plan.map.h)throw Error('Rectangle must be inside the private terrain grid.');
 const tiles=[...plan.map.tiles];for(let y=rect.y;y<rect.y+rect.h;y++)for(let x=rect.x;x<rect.x+rect.w;x++)tiles[y*plan.map.w+x]=tile;
 const next={...plan.map,tiles};for(const o of plan.objects){const error=placementError(next,[],o);if(error)throw Error('Terrain change would invalidate an existing object: '+error)}
 return {...plan,map:next};
}

/** Symbolic local preview. A blocked tile is not assumed to be water or a cliff. */
export function dataLayersMap(raw:readonly unknown[],w:number,h:number):FarmMap{
 const restrictions=importDataLayers(raw,w,h),map=blankLocalMap(w,h,'Data Layers snapshot');
 return {...map,id:'local-data-layers',tiles:[...restrictions.till].map(t=>t==='T'||t==='D'?'soil':'grass'),restrictions};
}

/** Local factual restriction reference, not a rendered map or live-game occupancy. */
export function restrictionMaskMap(raw:string,w:number,h:number):FarmMap{
 const restrictions=importRestrictionMask(raw,w,h),map=blankLocalMap(w,h,'Local restriction reference — version unverified');
 return {...map,id:'local-restriction-mask',tiles:[...restrictions.till].map(t=>t==='T'?'soil':'grass'),restrictions};
}
