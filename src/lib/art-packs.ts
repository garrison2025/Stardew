import manifest from '../config/art-packs.json';
export type ArtMode='hybrid'|'original';
export type ArtPack=typeof manifest.packs[number];
export type TileSpec={col:number;row:number;columns?:number;rows?:number};
export const OUTDOOR=manifest.packs[0],INDOOR=manifest.packs[1];
// Curated decorations only; no replacement of game-specific buildings or mechanics.
export const OUTDOOR_TILES:Record<string,TileSpec>={'wood-path':{col:0,row:25},'stone-path':{col:3,row:25},'brick-path':{col:12,row:25},'chest':{col:22,row:0},'oak':{col:13,row:10,rows:2},'pine':{col:16,row:10,rows:2},'flowerbed':{col:0,row:6}};
export const INDOOR_TILES:Record<string,TileSpec>={'chest':{col:4,row:5}};
export function tileRect(pack:ArtPack,t:TileSpec){const cols=t.columns??1,rows=t.rows??1,x=t.col*pack.stride,y=t.row*pack.stride,w=(cols-1)*pack.stride+pack.tile,h=(rows-1)*pack.stride+pack.tile;if(![t.col,t.row,cols,rows].every(Number.isInteger)||x<0||y<0||cols<1||rows<1||x+w>pack.width||y+h>pack.height)throw Error('Tile outside atlas');return {x,y,w,h}}
export function drawPackTile(c:CanvasRenderingContext2D,image:HTMLImageElement,pack:ArtPack,t:TileSpec,x:number,y:number,w:number,h:number){if(image.naturalWidth!==pack.width||image.naturalHeight!==pack.height)return false;const r=tileRect(pack,t),scale=Math.min(w/r.w,h/r.h),dw=r.w*scale,dh=r.h*scale;c.save();c.imageSmoothingEnabled=false;c.drawImage(image,r.x,r.y,r.w,r.h,x+(w-dw)/2,y+h-dh,dw,dh);c.restore();return true}
