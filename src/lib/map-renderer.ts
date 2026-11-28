import type {RestrictionLayer} from './data-layers';
import {dimensions,itemById,irrigation,type FarmMap,type Season,type Plan,type Placed} from './map-model';
import {TILE,rect,sprite,drawTerrainArt} from './pixel-art';
import {OUTDOOR,OUTDOOR_TILES,drawPackTile} from './art-packs';
export {TILE,drawLighting} from './pixel-art';
export type {Light} from './pixel-art';
export function drawTerrain(c:CanvasRenderingContext2D,map:FarmMap,season:Season){
 drawTerrainArt(c,map,season);
 const r=map.restrictions;if(r?.source!=='local-restriction-mask'||!/^local-starplan-[0-7]$/.test(map.id))return;
 // Restriction classes, not inferred lakes, rocks or game artwork. Draw readable boundaries at all zooms.
 const blocked=(x:number,y:number)=>x>=0&&y>=0&&x<map.w&&y<map.h&&r.access[y*map.w+x]==='N';
 const dark=season==='winter'?'#697a7e':'#3e5351',edge=season==='winter'?'#a0b0ad':'#82958a';
 c.save();
 for(let i=0;i<r.access.length;i++){
  const x=i%map.w,y=Math.floor(i/map.w),px=x*TILE,py=y*TILE;
  if(r.access[i]==='N'){
   rect(c,px,py,TILE,TILE,dark);
   if((x+y)%3===0){rect(c,px+4,py+5,3,1,'#ffffff12');rect(c,px+9,py+11,4,1,'#00000018')}
   if(!blocked(x-1,y))rect(c,px,py,2,TILE,edge);if(!blocked(x+1,y))rect(c,px+14,py,2,TILE,edge);
   if(!blocked(x,y-1))rect(c,px,py,TILE,2,edge);if(!blocked(x,y+1))rect(c,px,py+14,TILE,2,edge);
  }else if(r.build[i]!=='B'&&r.till[i]!=='T'){
   rect(c,px,py,TILE,TILE,'#b4c1b14a');rect(c,px+3,py+11,4,1,'#4d625554');
  }
 }
 c.restore();
}
export function drawItem(c:CanvasRenderingContext2D,o:Placed,season:Season,selected=false,atlas:HTMLImageElement|null=null){
 const image=sprite(o,season);if(!image)return;const d=dimensions(o),x=o.x*TILE,y=o.y*TILE,w=d.w*TILE,h=d.h*TILE;c.save();c.imageSmoothingEnabled=false;const tile=OUTDOOR_TILES[o.itemId];if(!atlas||!tile||((o.itemId==='oak'||o.itemId==='pine'||o.itemId==='flowerbed')&&(season==='autumn'||season==='winter'))||!drawPackTile(c,atlas,OUTDOOR,tile,x,y,w,h))c.drawImage(image,x,y);
 if(selected){c.strokeStyle='#fff2a1';c.lineWidth=1.5;c.strokeRect(x+.75,y+.75,w-1.5,h-1.5)}c.restore();
}
export function drawObjects(c:CanvasRenderingContext2D,plan:Plan,selected:Set<string>,showWater:boolean,showGrid:boolean,ghost:Placed|null,valid:boolean,atlas:HTMLImageElement|null=null,protectedTiles:ReadonlySet<string>|null=null,junimoTiles?:ReadonlySet<string>,garden?:{beeTiles:ReadonlySet<string>;treeTiles:ReadonlySet<string>;conflictTiles:ReadonlySet<string>}|null){
 // Surfaces first, then depth-sorted objects; overlays above sprites so coverage remains legible.
 const sorted=[...plan.objects].sort((a,b)=>(a.y+dimensions(a).h)-(b.y+dimensions(b).h));
 for(const o of sorted)if(itemById.get(o.itemId)?.art==='path')drawItem(c,o,plan.season,false,atlas);
 for(const o of sorted)if(itemById.get(o.itemId)?.art!=='path')drawItem(c,o,plan.season,false,atlas);
 if(showWater)for(const k of irrigation(plan)){const [x,y]=k.split(',').map(Number);rect(c,x*TILE,y*TILE,TILE,TILE,'#61c9e94a');rect(c,x*TILE,y*TILE,TILE,1,'#b5f0ee80')}
 if(protectedTiles)for(const key of protectedTiles){const [x,y]=key.split(',').map(Number);rect(c,x*TILE,y*TILE,TILE,TILE,'#efbb4640');rect(c,x*TILE,y*TILE,1,TILE,'#f6d68190')}
 if(junimoTiles)for(const key of junimoTiles){const [x,y]=key.split(',').map(Number);rect(c,x*TILE,y*TILE,TILE,TILE,'#ad87ed38');rect(c,x*TILE,y*TILE,TILE,1,'#e3c6ff70')}
 if(garden){for(const [tiles,color] of [[garden.beeTiles,'#e9b74845'],[garden.treeTiles,'#7bd67b55'],[garden.conflictTiles,'#e66c6caa']] as const)for(const k of tiles){const [x,y]=k.split(',').map(Number);rect(c,x*TILE,y*TILE,TILE,TILE,color)}}
 if(showGrid){c.strokeStyle='#324a3544';c.lineWidth=.4;c.beginPath();for(let x=0;x<=plan.map.w;x++){c.moveTo(x*TILE,0);c.lineTo(x*TILE,plan.map.h*TILE)}for(let y=0;y<=plan.map.h;y++){c.moveTo(0,y*TILE);c.lineTo(plan.map.w*TILE,y*TILE)}c.stroke()}
 for(const o of sorted)if(selected.has(o.id)){const d=dimensions(o);c.strokeStyle='#fff2a1';c.lineWidth=1.5;c.strokeRect(o.x*TILE+.75,o.y*TILE+.75,d.w*TILE-1.5,d.h*TILE-1.5)}
 if(ghost){const d=dimensions(ghost);if(valid){c.save();c.globalAlpha=.65;drawItem(c,ghost,plan.season,false,atlas);c.restore()}rect(c,ghost.x*TILE,ghost.y*TILE,d.w*TILE,d.h*TILE,valid?'#cbe98d45':'#d9545480');c.strokeStyle=valid?'#f1ffd1':'#ffb5a8';c.lineWidth=1;c.strokeRect(ghost.x*TILE+.5,ghost.y*TILE+.5,d.w*TILE-1,d.h*TILE-1)}
}

export function drawRestrictionLayer(c:CanvasRenderingContext2D,map:FarmMap,layer:RestrictionLayer){
 if(!map.restrictions)return;
 const mask=map.restrictions[layer],colors:Record<string,string>={C:'#69ad7650',B:'#69ad7650',T:'#69ad7650',D:'#a880c980',O:'#e6a34d99',N:'#41495199',W:'#527ebcaa'};
 c.save();for(let i=0;i<mask.length;i++){c.fillStyle=colors[mask[i]];c.fillRect(i%map.w*TILE,Math.floor(i/map.w)*TILE,TILE,TILE)}c.restore();
}
