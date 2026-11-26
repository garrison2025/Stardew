// Independent schematic interiors. Only specified dimensions and sprinkler patterns are documented game facts.
export const ROOMS=[
{id:'shed',name:'Shed',w:11,h:9,note:'Documented floor dimensions; entry position is schematic.'},
{id:'big-shed',name:'Big Shed',w:17,h:12,note:'Documented floor dimensions; entry position is schematic.'},
{id:'greenhouse',name:'Greenhouse',w:14,h:12,note:'12 × 10 documented crop bed, one-tile schematic border and entry.'},
{id:'barn',name:'Barn',w:12,h:9,note:'Illustrative interior dimensions, feeding area and entry.'},
{id:'coop',name:'Coop',w:10,h:8,note:'Illustrative interior dimensions, feeding area and entry.'}
] as const;
export type RoomId=typeof ROOMS[number]['id'];
export type Tile='floor'|'soil'|'entry'|'fixture';
export type Device='keg'|'jar'|'furnace'|'chest'|'cheese'|'mayonnaise'|'loom'|'oil'|'dehydrator'|'crop'|'trellis'|'basic'|'quality'|'iridium'|'nozzle'|'path';
export const DEVICES:{id:Device;name:string;color:string;kind:'machine'|'crop'|'sprinkler'|'path';radius?:number;cross?:boolean}[]=[
{id:'keg',name:'Keg',color:'#bb8954',kind:'machine'},{id:'jar',name:'Preserves jar',color:'#b76950',kind:'machine'},{id:'furnace',name:'Furnace',color:'#787c85',kind:'machine'},{id:'chest',name:'Chest',color:'#bf965c',kind:'machine'},
{id:'cheese',name:'Cheese press',color:'#e5c36b',kind:'machine'},{id:'mayonnaise',name:'Mayonnaise machine',color:'#d9e3cb',kind:'machine'},{id:'loom',name:'Loom',color:'#9e8b77',kind:'machine'},{id:'oil',name:'Oil maker',color:'#91a45f',kind:'machine'},{id:'dehydrator',name:'Dehydrator',color:'#bc8371',kind:'machine'},
{id:'crop',name:'Crop marker',color:'#87b654',kind:'crop'},{id:'trellis',name:'Trellis marker',color:'#6b944b',kind:'crop'},{id:'basic',name:'Basic sprinkler',color:'#92bec8',kind:'sprinkler',radius:1,cross:true},{id:'quality',name:'Quality sprinkler',color:'#d9be72',kind:'sprinkler',radius:1},{id:'iridium',name:'Iridium sprinkler',color:'#b69bd8',kind:'sprinkler',radius:2},{id:'nozzle',name:'Iridium + nozzle',color:'#ddb9df',kind:'sprinkler',radius:3},{id:'path',name:'Walkway',color:'#d6b686',kind:'path'}];
export const deviceById=new Map(DEVICES.map(d=>[d.id,d]));
export type Room={id:RoomId;w:number;h:number;tiles:Tile[];entry:number};
export type Interior={schema:1;room:RoomId;cells:Record<string,Device>};
export function roomOf(id:RoomId):Room{const r=ROOMS.find(r=>r.id===id);if(!r)throw Error('Unknown room');const tiles:Tile[]=Array(r.w*r.h).fill('floor'),entry=(r.h-1)*r.w+Math.floor(r.w/2);if(id==='greenhouse')for(let y=1;y<=10;y++)for(let x=1;x<=12;x++)tiles[y*r.w+x]='soil';if(id==='barn'||id==='coop')for(let x=1;x<r.w-1;x++)tiles[x]='fixture';tiles[entry]='entry';return {id,w:r.w,h:r.h,tiles,entry}}
export function emptyInterior(room:RoomId):Interior{return {schema:1,room,cells:{}}}
export function allowed(room:Room,index:number,device:Device){const tile=room.tiles[index],d=deviceById.get(device);if(!tile||!d||tile==='entry'||tile==='fixture')return false;if(room.id==='greenhouse')return d.kind==='crop'?tile==='soil':d.kind==='sprinkler'||d.kind==='path';return d.kind==='machine'||d.kind==='path'}
export function decodeInterior(value:unknown):Interior{const v=value as Interior;if(!v||v.schema!==1||!ROOMS.some(r=>r.id===v.room)||!v.cells||typeof v.cells!=='object'||Array.isArray(v.cells))throw Error('Invalid room layout');const room=roomOf(v.room),cells:Record<string,Device>={};for(const [k,d] of Object.entries(v.cells)){if(!/^(0|[1-9]\d*)$/.test(k)||!allowed(room,Number(k),d))throw Error('Invalid room tile or object');cells[k]=d}return {schema:1,room:v.room,cells}}
export function neighbors(room:Room,i:number){const x=i%room.w,y=Math.floor(i/room.w),out:number[]=[];if(x>0)out.push(i-1);if(x<room.w-1)out.push(i+1);if(y>0)out.push(i-room.w);if(y<room.h-1)out.push(i+room.w);return out}
export function analyze(layout:Interior){
 const room=roomOf(layout.room),walkable=(i:number)=>room.tiles[i]!=='fixture'&&(!layout.cells[i]||layout.cells[i]==='path'||layout.cells[i]==='crop');
 const reachable=new Set<number>([room.entry]),queue=[room.entry];for(let j=0;j<queue.length;j++)for(const i of neighbors(room,queue[j]))if(walkable(i)&&!reachable.has(i)){reachable.add(i);queue.push(i)}
 const machines:number[]=[],inaccessible:number[]=[],covered=new Set<number>();let crops=0,watered=0,sprinklers=0;
 for(const [k,id] of Object.entries(layout.cells)){const i=Number(k),d=deviceById.get(id)!;if(d.kind==='machine'){machines.push(i);if(!neighbors(room,i).some(n=>reachable.has(n)))inaccessible.push(i)}
 if(d.kind==='crop')crops++;if(d.kind==='sprinkler'){sprinklers++;const x=i%room.w,y=Math.floor(i/room.w),r=d.radius!;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(dx===0&&dy===0||d.cross&&Math.abs(dx)+Math.abs(dy)!==1)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=room.w||ny>=room.h)continue;const n=ny*room.w+nx;if(room.tiles[n]==='soil'&&(!layout.cells[n]||deviceById.get(layout.cells[n])?.kind==='crop'))covered.add(n)}}}
 for(const n of covered)if(deviceById.get(layout.cells[n])?.kind==='crop')watered++;
 const blockedFixtures=room.tiles.flatMap((t,i)=>t==='fixture'&&!neighbors(room,i).some(n=>reachable.has(n))?[i]:[]);
 return {reachable,machines:machines.length,accessible:machines.length-inaccessible.length,inaccessible,blockedFixtures,covered,crops,watered,sprinklers,freeSoil:room.tiles.filter((t,i)=>t==='soil'&&!layout.cells[i]).length}
}
export function proposeMachines(layout:Interior,device:Device){const room=roomOf(layout.room);if(deviceById.get(device)?.kind!=='machine'||room.id==='greenhouse')throw Error('Choose a processing or storage device in a non-greenhouse room.');const base=analyze(layout);if(base.inaccessible.length||base.blockedFixtures.length)throw Error('Clear inaccessible devices or feeding areas before optimizing.');let next={...layout,cells:{...layout.cells}},added=0;const candidates=room.tiles.map((_,i)=>i).filter(i=>allowed(room,i,device)&&!next.cells[i]).sort((a,b)=>Math.floor(a/room.w)-Math.floor(b/room.w)||a-b);
 for(const i of candidates){next.cells[i]=device;const result=analyze(next);if(result.inaccessible.length||result.blockedFixtures.length)delete next.cells[i];else added++}return {layout:next,added}
}
