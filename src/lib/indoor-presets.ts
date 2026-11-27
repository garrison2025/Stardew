import {roomOf,emptyInterior,allowed,analyze,proposeMachines,decodeInterior,type RoomId,type Device,type Interior} from './indoor-model.ts';
export const INTERIOR_PRESETS=[
{id:'cozy',name:'Cozy farmhouse',rooms:['farmhouse'],note:'Bed, seating, TV, plants and a clear central aisle.'},
{id:'storage',name:'Farmhouse storage corner',rooms:['farmhouse'],note:'Storage markers around the perimeter with open access.'},
{id:'greenhouse-nozzles',name:'Four-nozzle greenhouse',rooms:['greenhouse'],note:'Four pressure-nozzle sprinkler markers; fill remaining watered soil.'},
{id:'workshop',name:'Accessible keg workshop',rooms:['shed','big-shed','barn','coop'],note:'Greedy accessible keg placement; keep entry and feeding areas open.'}
] as const satisfies readonly {id:string;name:string;rooms:readonly RoomId[];note:string}[];
export type InteriorPresetId=typeof INTERIOR_PRESETS[number]['id'];
export function interiorPresets(room:RoomId){return INTERIOR_PRESETS.filter(p=>(p.rooms as readonly RoomId[]).includes(room))}
export function interiorPreset(room:RoomId,id:InteriorPresetId):Interior{
 if(!interiorPresets(room).some(p=>p.id===id))throw Error('Preset is not available for this room');
 const layout=emptyInterior(room),r=roomOf(room);
 function add(x:number,y:number,d:Device){const i=y*r.w+x;if(x<0||x>=r.w||y<0||y>=r.h||!allowed(r,i,d)||layout.cells[i])throw Error('Invalid preset marker');layout.cells[i]=d}
 if(id==='cozy'){add(1,1,'bed');add(2,1,'chest');add(9,1,'plant');add(9,2,'tv');add(8,4,'sofa');add(3,4,'table');add(2,4,'chair');add(4,4,'chair');for(let x=5;x<=7;x++)for(let y=3;y<=5;y++)add(x,y,'rug');add(10,6,'plant')}
 if(id==='storage'){add(1,1,'bed');add(10,1,'tv');for(let x=2;x<10;x++)add(x,0,'chest');add(2,4,'table');add(3,4,'chair');add(10,5,'plant');for(let y=3;y<8;y++)add(6,y,'rug')}
 if(id==='greenhouse-nozzles'){for(const [x,y] of [[3,3],[10,3],[3,8],[10,8]])add(x,y,'nozzle');for(const i of analyze(layout).covered){if(!layout.cells[i])layout.cells[i]='crop'}}
 if(id==='workshop')return proposeMachines(layout,'keg').layout;
 return decodeInterior(layout);
}
