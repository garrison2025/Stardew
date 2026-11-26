export type Camera={x:number;y:number;scale:number};
export type ScreenPoint={x:number;y:number};
export function midpoint(a:ScreenPoint,b:ScreenPoint):ScreenPoint{return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
export function distance(a:ScreenPoint,b:ScreenPoint){return Math.hypot(a.x-b.x,a.y-b.y)}
export function pinchCamera(start:Camera,fromA:ScreenPoint,fromB:ScreenPoint,toA:ScreenPoint,toB:ScreenPoint):Camera{
 const a=midpoint(fromA,fromB),b=midpoint(toA,toB),d=distance(fromA,fromB);if(d<4)return start;
 const scale=Math.max(.08,Math.min(5,start.scale*distance(toA,toB)/d));
 return {scale,x:b.x-(a.x-start.x)*scale/start.scale,y:b.y-(a.y-start.y)*scale/start.scale}
}
export function screenTile(p:ScreenPoint,camera:Camera,tileSize:number){return {x:Math.floor((p.x-camera.x)/(camera.scale*tileSize)),y:Math.floor((p.y-camera.y)/(camera.scale*tileSize))}}
