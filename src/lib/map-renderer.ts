import type {RestrictionLayer} from './data-layers';
import {dimensions,itemById,irrigation,type FarmMap,type Season,type Plan,type Placed} from './map-model';
import {TILE,rect,sprite,drawTerrainArt} from './pixel-art';
import {OUTDOOR,OUTDOOR_TILES,drawPackTile} from './art-packs';
export {TILE,drawLighting} from './pixel-art';
export type {Light} from './pixel-art';
export function drawTerrain(c:CanvasRenderingContext2D,map:FarmMap,season:Season){drawTerrainArt(c,map,season);if(map.restrictions?.source==='local-restriction-mask'&&/^local-starplan-[0-7]$/.test(map.id)){c.save();c.fillStyle='#3b4649';for(let i=0;i<map.restrictions.access.length;i++)if(map.restrictions.access[i]==='N')c.fillRect((i%map.w)*TILE,Math.floor(i/map.w)*TILE,TILE,TILE);c.restore()}}
export function drawItem(c:CanvasRenderingContext2D,o:Placed,season:Season,selected=false,atlas:HTMLImageElement|null=null){
 const image=sprite(o,season);if(!image)return;const d=dimensions(o),x=o.x*TILE,y=o.y*TILE,w=d.w*TILE,h=d.h*TILE;c.save();c.imageSmoothingEnabled=false;const tile=OUTDOOR_TILES[o.itemId];if(!atlas||!tile||((o.itemId==='oak'||o.itemId==='pine'||o.itemId==='flowerbed')&&(season==='autumn'||season==='winter'))||!drawPackTile(c,atlas,OUTDOOR,tile,x,y,w,h))c.drawImage(image,x,y);
 if(selected){c.strokeStyle='#fff2a1';c.lineWidth=1.5;c.strokeRect(x+.75,y+.75,w-1.5,h-1.5)}c.restore();
}
export function drawObjects(c:CanvasRenderingContext2D,plan:Plan,selected:Set<string>,showWater:boolean,showGrid:boolean,ghost:Placed|null,valid:boolean,atlas:HTMLImageElement|null=null,protectedTiles:ReadonlySet<string>|null=null){
 // Surfaces first, then depth-sorted objects; overlays above sprites so coverage remains legible.
 const sorted=[...plan.objects].sort((a,b)=>(a.y+dimensions(a).h)-(b.y+dimensions(b).h));
 for(const o of sorted)if(itemById.get(o.itemId)?.art==='path')drawItem(c,o,plan.season,false,atlas);
 for(const o of sorted)if(itemById.get(o.itemId)?.art!=='path')drawItem(c,o,plan.season,false,atlas);
 if(showWater)for(const k of irrigation(plan)){const [x,y]=k.split(',').map(Number);rect(c,x*TILE,y*TILE,TILE,TILE,'#61c9e94a');rect(c,x*TILE,y*TILE,TILE,1,'#b5f0ee80')}
 if(protectedTiles)for(const key of protectedTiles){const [x,y]=key.split(',').map(Number);rect(c,x*TILE,y*TILE,TILE,TILE,'#efbb4640');rect(c,x*TILE,y*TILE,1,TILE,'#f6d68190')}
 if(showGrid){c.strokeStyle='#324a3544';c.lineWidth=.4;c.beginPath();for(let x=0;x<=plan.map.w;x++){c.moveTo(x*TILE,0);c.lineTo(x*TILE,plan.map.h*TILE)}for(let y=0;y<=plan.map.h;y++){c.moveTo(0,y*TILE);c.lineTo(plan.map.w*TILE,y*TILE)}c.stroke()}
 for(const o of sorted)if(selected.has(o.id)){const d=dimensions(o);c.strokeStyle='#fff2a1';c.lineWidth=1.5;c.strokeRect(o.x*TILE+.75,o.y*TILE+.75,d.w*TILE-1.5,d.h*TILE-1.5)}
 if(ghost){const d=dimensions(ghost);if(valid){c.save();c.globalAlpha=.65;drawItem(c,ghost,plan.season,false,atlas);c.restore()}rect(c,ghost.x*TILE,ghost.y*TILE,d.w*TILE,d.h*TILE,valid?'#cbe98d45':'#d9545480');c.strokeStyle=valid?'#f1ffd1':'#ffb5a8';c.lineWidth=1;c.strokeRect(ghost.x*TILE+.5,ghost.y*TILE+.5,d.w*TILE-1,d.h*TILE-1)}
}

export function drawRestrictionLayer(c:CanvasRenderingContext2D,map:FarmMap,layer:RestrictionLayer){
 if(!map.restrictions)return;
 const mask=map.restrictions[layer],colors:Record<string,string>={C:'#69ad7650',B:'#69ad7650',T:'#69ad7650',D:'#a880c980',O:'#e6a34d99',N:'#41495199',W:'#527ebcaa'};
 c.save();for(let i=0;i<mask.length;i++){c.fillStyle=colors[mask[i]];c.fillRect(i%map.w*TILE,Math.floor(i/map.w)*TILE,TILE,TILE)}c.restore();
}
