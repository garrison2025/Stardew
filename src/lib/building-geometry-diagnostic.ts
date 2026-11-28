// Local geometry inspection only. Never treats player passability as proof of item placement.
import type {SaveSnapshot,ImportIssue} from './save-model.ts';
type XY={x:number;y:number};
type Area=XY&{w:number;h:number;passableOnly:boolean};
export type BuildingGeometry={id:string;w:number;h:number;collision:string[]|null;radius:number;door:XY|null;placement:Area[];flooring:boolean};
const record=(v:unknown):Record<string,unknown>=>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Expected building data object');return v as Record<string,unknown>};
function integer(v:unknown,min:number,max:number){if(typeof v!=='number'||!Number.isSafeInteger(v)||v<min||v>max)throw Error('Invalid building geometry integer');return v;}
function point(raw:unknown,min:number,max:number):XY{const v=record(raw);return {x:integer(v.X,min,max),y:integer(v.Y,min,max)}}
export function parseBuildingGeometry(id:string,raw:unknown):BuildingGeometry{
 const v=record(raw),size=point(v.Size,1,80),radius=integer(v.AdditionalTilePropertyRadius??0,0,80);
 let collision:string[]|null=null;
 if(v.CollisionMap!=null){if(typeof v.CollisionMap!=='string'||v.CollisionMap.length>20000)throw Error('Invalid collision map');collision=v.CollisionMap.trim().split(String.fromCharCode(10)).map(row=>row.trim());if(collision.length>160||collision.some(row=>row.length>160||!/^[XO]+$/.test(row)))throw Error('Unsupported collision symbols or empty row');}
 let door:XY|null=null;if(v.HumanDoor!=null){const p=point(v.HumanDoor,-80,160);if(p.x>=0&&p.y>=0)door=p;}
 const placement:Area[]=[];if(v.AdditionalPlacementTiles!=null){if(!Array.isArray(v.AdditionalPlacementTiles)||v.AdditionalPlacementTiles.length>128)throw Error('Invalid extra placement areas');for(const row of v.AdditionalPlacementTiles){const a=record(row),rect=record(a.TileArea);if(a.OnlyNeedsToBePassable!==undefined&&typeof a.OnlyNeedsToBePassable!=='boolean')throw Error('Invalid placement rule');placement.push({...point(rect,-160,160),w:integer(rect.Width,1,160),h:integer(rect.Height,1,160),passableOnly:a.OnlyNeedsToBePassable===true});}}
 if(v.AllowsFlooringUnderneath!==undefined&&typeof v.AllowsFlooringUnderneath!=='boolean')throw Error('Invalid flooring rule');
 return {id,w:size.x,h:size.y,collision,radius,door,placement,flooring:v.AllowsFlooringUnderneath!==false};
}
// Exact raw IDs for the two fixed buildings; variants of other buildings are intentionally not collapsed.
export function readFixedBuildingGeometry(raw:unknown){const v=record(raw);const out:Record<string,BuildingGeometry>={};for(const [itemId,id] of [['game-farmhouse','Farmhouse'],['game-greenhouse','Greenhouse']]){if(Object.hasOwn(v,id))out[itemId]=parseBuildingGeometry(id,v[id]);}if(!Object.keys(out).length)throw Error('Expected Farmhouse or Greenhouse in unpacked Data/Buildings.json');return out;}
export function geometryTile(g:BuildingGeometry,x:number,y:number){
 const inside=x>=0&&y>=0&&x<g.w&&y<g.h;const symbol=g.collision?.[y]?.[x]??null;
 const inRadius=x>=-g.radius&&y>=-g.radius&&x<g.w+g.radius&&y<g.h+g.radius;
 const collision=symbol==='X'?'blocked':symbol==='O'?'passable':g.collision===null&&inside?'default-blocked':'not-explicit';
 const placement=g.placement.filter(a=>x>=a.x&&y>=a.y&&x<a.x+a.w&&y<a.y+a.h).map(a=>a.passableOnly?'passable-only':'buildable');
 return {inside,inRadius,collision,placement,door:g.door?.x===x&&g.door?.y===y};
}
export function diagnoseBuildingOverlaps(snapshot:SaveSnapshot,issues:readonly ImportIssue[],geometry:Record<string,BuildingGeometry>){
 const out:{issueIndex:number;building:string;relative:XY;state:ReturnType<typeof geometryTile>}[]=[];
 for(const issue of issues){if(issue.reason!=='Overlaps an existing object'||issue.x===null||issue.y===null)continue;
  for(const b of snapshot.records){if(b.kind!=='building'||!b.itemId||b.x===null||b.y===null)continue;const g=geometry[b.itemId];if(!g||b.width!==g.w||b.height!==g.h)continue;const x=issue.x-b.x,y=issue.y-b.y,state=geometryTile(g,x,y);if(state.inside||state.inRadius||state.placement.length||state.collision==='blocked')out.push({issueIndex:issue.index,building:g.id,relative:{x,y},state});}}
 return out;
}
