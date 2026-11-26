// Independently authored terrain and object model. None of these maps or footprints are official game data.
import {GAME_CROPS} from './crop-data.ts';
export const TERRAIN=['grass','soil','water','cliff','forest','road'] as const;
export type Terrain=typeof TERRAIN[number];
export const SEASONS=['spring','summer','autumn','winter'] as const;
export type Season=typeof SEASONS[number];
export type FarmMap={id:string;name:string;w:number;h:number;tiles:Terrain[];source:'original'|'local'};
export type Item={id:string;name:string;category:string;w:number;h:number;art:string;color:string;radius?:number;pattern?:'cross'|'square';fixedOrientation?:boolean;documented?:boolean};
export const ITEMS:Item[]=[
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
{id:'stone-path',name:'Stone path',category:'Paths & fences',w:1,h:1,art:'path',color:'#a8aaa0'},
{id:'wood-path',name:'Wood path',category:'Paths & fences',w:1,h:1,art:'path',color:'#c2a06d'},
{id:'brick-path',name:'Brick path',category:'Paths & fences',w:1,h:1,art:'path',color:'#b97a62'},
{id:'fence',name:'Wood fence',category:'Paths & fences',w:1,h:1,art:'fence',color:'#a37c4e'},
{id:'oak',name:'Shade tree',category:'Nature',w:2,h:2,art:'tree',color:'#699b4e'},
{id:'pine',name:'Pine tree',category:'Nature',w:2,h:2,art:'pine',color:'#427e61'},
{id:'flowerbed',name:'Flower bed',category:'Nature',w:1,h:1,art:'flower',color:'#e6a3c8'},
{id:'rock',name:'Decorative rock',category:'Nature',w:1,h:1,art:'rock',color:'#8f9992'}
];
ITEMS.push(...GAME_CROPS.map(c=>({id:'crop-'+c.id,name:c.name+' (crop)',category:'Crops',w:1,h:1,art:c.trellis?'trellis':'crop',color:c.color,documented:true})));
export const itemById=new Map(ITEMS.map(i=>[i.id,i]));
export const MAPS=[{id:'orchard',name:'Orchard valley',w:64,h:42},{id:'riverbend',name:'River bend',w:64,h:44},{id:'woodland',name:'Woodland clearing',w:60,h:44},{id:'hilltop',name:'Terraced hills',w:64,h:44}] as const;
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
  else if(((x-12)/7)**2+((y-(m.h-11))/5)**2<1)t='water';
  else if((y===7&&x>6&&x<m.w-6)||(x===m.w-9&&y>=7&&y<m.h-5))t='road';
  else if(x>=18&&x<=30&&y>=12&&y<=21)t='soil';
  tiles.push(t)
 }return {...m,tiles,source:'original'}
}
export type Placed={id:string;itemId:string;x:number;y:number;rotation:0|1};
export type Plan={schema:2;map:FarmMap;season:Season;objects:Placed[]};
export type Point={x:number;y:number};
export function dimensions(o:Pick<Placed,'itemId'|'rotation'>){const i=itemById.get(o.itemId);if(!i)throw Error('Unknown item');return o.rotation?{w:i.h,h:i.w}:{w:i.w,h:i.h}}
export function footprint(o:Placed):Point[]{const d=dimensions(o),out:Point[]=[];for(let y=o.y;y<o.y+d.h;y++)for(let x=o.x;x<o.x+d.w;x++)out.push({x,y});return out}
export const posKey=(x:number,y:number)=>x+','+y;
export function occupancy(objects:Placed[]){const out=new Map<string,Placed>();for(const o of objects)for(const p of footprint(o))out.set(posKey(p.x,p.y),o);return out}
export function terrainAt(map:FarmMap,x:number,y:number):Terrain|undefined{return x>=0&&y>=0&&x<map.w&&y<map.h?map.tiles[y*map.w+x]:undefined}
export function placementError(map:FarmMap,objects:Placed[],o:Placed):string|null{
 if(o.rotation&&itemById.get(o.itemId)?.fixedOrientation)return 'This game footprint has a fixed orientation';const occupied=occupancy(objects);for(const p of footprint(o)){const t=terrainAt(map,p.x,p.y);if(!t)return 'Outside map boundary';if(t==='water'||t==='cliff'||t==='forest')return 'Blocked terrain: '+t;if(t==='road'&&itemById.get(o.itemId)?.category!=='Paths & fences')return 'Road reserved for paths and fences';if(occupied.has(posKey(p.x,p.y)))return 'Overlaps an existing object'}return null;
}
export function moveSelection(plan:Plan,ids:Set<string>,x:number,y:number):Plan{
 const selected=plan.objects.filter(o=>ids.has(o.id));if(!selected.length)throw Error('Select objects first');
 const dx=x-Math.min(...selected.map(o=>o.x)),dy=y-Math.min(...selected.map(o=>o.y));
 const result=plan.objects.filter(o=>!ids.has(o.id));for(const o of selected){const next={...o,x:o.x+dx,y:o.y+dy};const error=placementError(plan.map,result,next);if(error)throw Error(error);result.push(next)}return {...plan,objects:result}
}
export function irrigation(plan:Plan){const out=new Set<string>(),occupied=occupancy(plan.objects);for(const o of plan.objects){const i=itemById.get(o.itemId),r=i?.radius;if(!r)continue;for(let y=o.y-r;y<=o.y+r;y++)for(let x=o.x-r;x<=o.x+r;x++){const dx=Math.abs(x-o.x),dy=Math.abs(y-o.y);if(dx+dy===0||(i?.pattern==='cross'&&dx+dy!==1))continue;const t=terrainAt(plan.map,x,y),target=occupied.get(posKey(x,y));if((t==='grass'||t==='soil')&&(!target||itemById.get(target.itemId)?.category==='Crops'))out.add(posKey(x,y))}}return out}
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
 return {id:v.id,name:v.name,w:v.w!,h:v.h!,tiles:[...v.tiles],source:'local'}
}
export function decodePlan(input:unknown):Plan{
 const v=input as Partial<Plan>|null;if(!v||v.schema!==2||!v.map||!SEASONS.includes(v.season as Season)||!Array.isArray(v.objects)||v.objects.length>4096)throw Error('Invalid scene plan');
 if(v.map.source!=='original'&&v.map.source!=='local')throw Error('Unknown map source');const map=v.map.source==='original'?originalMap(v.map.id):decodeMap(v.map);const result:Placed[]=[],ids=new Set<string>();
 for(const o of v.objects){if(!o||typeof o.id!=='string'||o.id.length>100||ids.has(o.id)||!itemById.has(o.itemId)||!Number.isInteger(o.x)||!Number.isInteger(o.y)||(o.rotation!==0&&o.rotation!==1))throw Error('Invalid object');const clean:Placed={id:o.id,itemId:o.itemId,x:o.x,y:o.y,rotation:o.rotation};const error=placementError(map,result,clean);if(error)throw Error(error);result.push(clean);ids.add(o.id)}return {schema:2,map,season:v.season!,objects:result}
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
