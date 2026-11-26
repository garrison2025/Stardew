import {dimensions,itemById,irrigation,terrainAt,posKey,type FarmMap,type Season,type Plan,type Placed,type Point} from './map-model';
export const TILE=16;
const palettes:Record<Season,{grass:string[];tree:string[];soil:string;water:string}>={spring:{grass:['#9bb86c','#a7c477','#9ebd70','#a1bf71'],tree:['#365b37','#57833f','#7ba74e'],soil:'#ae8053',water:'#4d91ac'},summer:{grass:['#90ae5d','#9bb867','#8fb15c','#a2bc67'],tree:['#2f5638','#4c7536','#709a3d'],soil:'#b38b58',water:'#438fa9'},autumn:{grass:['#b9a361','#c6af6b','#c3a36a','#bba66d'],tree:['#77503a','#aa633a','#cf9347'],soil:'#a87a50',water:'#6794a4'},winter:{grass:['#d9e3df','#e5ece5','#dfe9e3','#d4e3e3'],tree:['#4c6b65','#76968b','#c3d8cb'],soil:'#b3b8ac',water:'#719eac'}};
function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function noise(x:number,y:number){return ((x*73856093^y*19349663)>>>0)%97}
function tree(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,colors:string[],pine=false){
 rect(c,x+w*.12,y+h*.82,w*.75,h*.12,'#39503c55');rect(c,x+w*.44,y+h*.48,w*.16,h*.43,'#76513a');
 if(pine){for(let i=0;i<5;i++){const ww=w*(.25+i*.14);rect(c,x+(w-ww)/2,y+h*(.06+i*.13),ww,h*.21,colors[i%2]);rect(c,x+(w-ww)/2+2,y+h*(.06+i*.13),ww*.60,h*.08,colors[2])}}
 else{rect(c,x+w*.11,y+h*.25,w*.79,h*.43,colors[0]);rect(c,x+w*.19,y+h*.12,w*.65,h*.53,colors[1]);rect(c,x+w*.30,y+h*.04,w*.39,h*.40,colors[2]);rect(c,x+w*.12,y+h*.33,w*.35,h*.20,colors[2]);rect(c,x+w*.56,y+h*.40,w*.29,h*.22,colors[1]);}
}
export function drawTerrain(c:CanvasRenderingContext2D,map:FarmMap,season:Season){
 const p=palettes[season];for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++){
 const t=map.tiles[y*map.w+x],px=x*TILE,py=y*TILE,n=noise(x,y);
 if(t==='water'){rect(c,px,py,TILE,TILE,p.water);if(n%3===0){rect(c,px+2,py+5,8,1,'#91c9cf');rect(c,px+8,py+12,5,1,'#78b4c5')}if(terrainAt(map,x,y-1)!=='water')rect(c,px,py,TILE,2,'#d1bd83');if(terrainAt(map,x-1,y)!=='water')rect(c,px,py,2,TILE,'#d1bd83')}
 else if(t==='cliff'){rect(c,px,py,TILE,TILE,'#80796b');rect(c,px,py,TILE,4,'#b1a18b');rect(c,px+((n%3)*3),py+8,7,2,'#635f57')}
 else if(t==='road'){rect(c,px,py,TILE,TILE,'#ceb98a');rect(c,px+(n%8),py+7,3,1,'#b39b73')}
 else if(t==='soil'){rect(c,px,py,TILE,TILE,p.soil);rect(c,px+1,py+3,14,2,'#936c48');rect(c,px+1,py+10,14,1,'#d0a06b')}
 else{rect(c,px,py,TILE,TILE,t==='forest'?p.tree[0]:p.grass[n%4]);if(t==='grass'&&n%5===0){rect(c,px+3+n%7,py+5,2,3,'#698a4a');rect(c,px+5+n%7,py+7,3,1,'#d3db8c')}if(t==='grass'&&n%29===0)rect(c,px+10,py+3,2,2,'#e9d68c')}
 }
 for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++)if(terrainAt(map,x,y)==='forest'&&(x+y)%2===0)tree(c,x*TILE-3,y*TILE-6,23,24,p.tree,noise(x,y)%3===0)
}
export function drawItem(c:CanvasRenderingContext2D,o:Placed,season:Season,selected=false){
 const i=itemById.get(o.itemId);if(!i)return;const d=dimensions(o),x=o.x*TILE,y=o.y*TILE,w=d.w*TILE,h=d.h*TILE;
 if(i.art==='house'||i.art==='glass'){rect(c,x+1,y+h-5,w-1,6,'#46553c55');rect(c,x+3,y+h*.37,w-6,h*.58,'#d4b583');rect(c,x+5,y+h*.45,w-10,2,'#e9d4a3');rect(c,x+w*.43,y+h*.61,w*.17,h*.34,'#654c3a');rect(c,x+8,y+h*.50,7,8,'#557d80');rect(c,x+w-15,y+h*.50,7,8,'#557d80');rect(c,x+1,y+h*.13,w-2,h*.38,i.color);rect(c,x+w*.08,y+1,w*.84,h*.17,i.color);for(let a=0;a<3;a++)rect(c,x+3,y+h*.16+a*h*.11,w-6,1,'#f0d6ad55');rect(c,x+2,y+h*.48,w-4,3,'#624f3d');if(i.art==='glass'){for(let a=1;a<5;a++)rect(c,x+a*w/5,y+3,2,h*.43,'#e0eee3');rect(c,x+2,y+h*.26,w-4,2,'#d6e8d8')}}
 else if(i.art==='tree'||i.art==='pine')tree(c,x,y,w,h,palettes[season].tree,i.art==='pine');
 else if(i.art==='pond'){rect(c,x+1,y+1,w-2,h-2,'#c5b29a');rect(c,x+4,y+4,w-8,h-8,i.color);rect(c,x+7,y+9,w*.4,2,'#b1d7d6');rect(c,x+w*.46,y+h*.65,w*.35,2,'#9fcdd2')}
 else if(i.art==='path'){rect(c,x,y,w,h,i.color);rect(c,x+1,y+7,w-2,1,'#665a4c55');rect(c,x+7,y+1,1,6,'#f0e6cf77');rect(c,x+10,y+8,1,7,'#665a4c55')}
 else if(i.art==='fence'){rect(c,x+1,y+5,w-2,3,'#b8915d');rect(c,x+1,y+10,w-2,2,'#8a6545');rect(c,x+2,y+1,3,h-2,'#795838');rect(c,x+w-5,y+1,3,h-2,'#795838')}
 else if(i.art==='crop'||i.art==='flower'||i.art==='trellis'){rect(c,x+1,y+1,w-2,h-2,'#956b45');rect(c,x+2,y+12,w-4,1,'#684c38');rect(c,x+7,y+5,2,9,'#557d3b');rect(c,x+3,y+7,5,3,'#81ac46');rect(c,x+8,y+8,5,3,'#8cbb50');rect(c,x+5,y+3,6,5,i.color);if(i.art==='flower')rect(c,x+7,y+4,2,2,'#845631');if(i.art==='trellis')rect(c,x+13,y+1,1,14,'#c3a47a')}
 else if(i.art==='sprinkler'){rect(c,x+3,y+10,10,4,'#466d70');rect(c,x+7,y+4,3,9,'#e3e4c9');rect(c,x+3,y+4,10,3,i.color);rect(c,x+1,y+2,2,2,'#b5eff0');rect(c,x+13,y+1,2,2,'#b5eff0')}
 else if(i.art==='post'){rect(c,x+7,y+3,2,12,'#805f3a');rect(c,x+3,y+6,10,4,i.color);rect(c,x+5,y+2,6,5,'#d4b77b');rect(c,x+4,y+1,8,2,'#82623d')}
 else{rect(c,x+2,y+5,12,10,'#695744');rect(c,x+3,y+4,10,9,i.color);rect(c,x+4,y+5,3,2,'#e5d2ab');rect(c,x+3,y+9,10,2,'#5b564a')}
 if(selected){c.strokeStyle='#f8eb91';c.lineWidth=1.5;c.strokeRect(x+.75,y+.75,w-1.5,h-1.5)}
}
export function drawObjects(c:CanvasRenderingContext2D,plan:Plan,selected:Set<string>,showWater:boolean,showGrid:boolean,ghost:Placed|null,valid:boolean){
 if(showWater)for(const k of irrigation(plan)){const [x,y]=k.split(',').map(Number);rect(c,x*TILE,y*TILE,TILE,TILE,'#5cc4ec55')}
 if(showGrid){c.strokeStyle='#324a352b';c.lineWidth=.4;c.beginPath();for(let x=0;x<=plan.map.w;x++){c.moveTo(x*TILE,0);c.lineTo(x*TILE,plan.map.h*TILE)}for(let y=0;y<=plan.map.h;y++){c.moveTo(0,y*TILE);c.lineTo(plan.map.w*TILE,y*TILE)}c.stroke()}
 for(const o of [...plan.objects].sort((a,b)=>(a.y+dimensions(a).h)-(b.y+dimensions(b).h)))drawItem(c,o,plan.season,selected.has(o.id));
 if(ghost){const d=dimensions(ghost);rect(c,ghost.x*TILE,ghost.y*TILE,d.w*TILE,d.h*TILE,valid?'#cbe98d80':'#d9545480');c.strokeStyle=valid?'#f1ffd1':'#ffb5a8';c.lineWidth=1;c.strokeRect(ghost.x*TILE+.5,ghost.y*TILE+.5,d.w*TILE-1,d.h*TILE-1)}
}
