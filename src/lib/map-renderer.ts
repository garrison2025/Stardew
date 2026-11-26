import {dimensions,itemById,irrigation,type FarmMap,type Season,type Plan,type Placed} from './map-model';
import {TILE,rect,sprite,drawTerrainArt} from './pixel-art';
export {TILE,drawLighting} from './pixel-art';
export type {Light} from './pixel-art';
export function drawTerrain(c:CanvasRenderingContext2D,map:FarmMap,season:Season){drawTerrainArt(c,map,season)}
export function drawItem(c:CanvasRenderingContext2D,o:Placed,season:Season,selected=false){
 const image=sprite(o,season);if(!image)return;const d=dimensions(o),x=o.x*TILE,y=o.y*TILE,w=d.w*TILE,h=d.h*TILE;c.save();c.imageSmoothingEnabled=false;c.drawImage(image,x,y);
 if(selected){c.strokeStyle='#fff2a1';c.lineWidth=1.5;c.strokeRect(x+.75,y+.75,w-1.5,h-1.5)}c.restore();
}
export function drawObjects(c:CanvasRenderingContext2D,plan:Plan,selected:Set<string>,showWater:boolean,showGrid:boolean,ghost:Placed|null,valid:boolean){
 // Surfaces first, then depth-sorted objects; overlays above sprites so coverage remains legible.
 const sorted=[...plan.objects].sort((a,b)=>(a.y+dimensions(a).h)-(b.y+dimensions(b).h));
 for(const o of sorted)if(itemById.get(o.itemId)?.art==='path')drawItem(c,o,plan.season);
 for(const o of sorted)if(itemById.get(o.itemId)?.art!=='path')drawItem(c,o,plan.season);
 if(showWater)for(const k of irrigation(plan)){const [x,y]=k.split(',').map(Number);rect(c,x*TILE,y*TILE,TILE,TILE,'#61c9e94a');rect(c,x*TILE,y*TILE,TILE,1,'#b5f0ee80')}
 if(showGrid){c.strokeStyle='#324a3544';c.lineWidth=.4;c.beginPath();for(let x=0;x<=plan.map.w;x++){c.moveTo(x*TILE,0);c.lineTo(x*TILE,plan.map.h*TILE)}for(let y=0;y<=plan.map.h;y++){c.moveTo(0,y*TILE);c.lineTo(plan.map.w*TILE,y*TILE)}c.stroke()}
 for(const o of sorted)if(selected.has(o.id)){const d=dimensions(o);c.strokeStyle='#fff2a1';c.lineWidth=1.5;c.strokeRect(o.x*TILE+.75,o.y*TILE+.75,d.w*TILE-1.5,d.h*TILE-1.5)}
 if(ghost){const d=dimensions(ghost);if(valid){c.save();c.globalAlpha=.65;drawItem(c,ghost,plan.season);c.restore()}rect(c,ghost.x*TILE,ghost.y*TILE,d.w*TILE,d.h*TILE,valid?'#cbe98d45':'#d9545480');c.strokeStyle=valid?'#f1ffd1':'#ffb5a8';c.lineWidth=1;c.strokeRect(ghost.x*TILE+.5,ghost.y*TILE+.5,d.w*TILE-1,d.h*TILE-1)}
}
