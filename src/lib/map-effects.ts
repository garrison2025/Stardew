import {TILE,hash} from './pixel-art.ts';
import type {FarmMap,Season} from './map-model.ts';
import type {Camera} from './map-gestures.ts';
export type Weather='clear'|'rain'|'snow';
export type Ripple={x:number;y:number;phase:number};
export function waterSamples(map:FarmMap):Ripple[]{
 const result:Ripples= [];for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++)if(map.tiles[y*map.w+x]==='water'&&hash(x,y,53)<.3)result.push({x:x*TILE+3,y:y*TILE+5,phase:hash(x,y,54)});
 if(result.length<=160)return result;return Array.from({length:160},(_,i)=>result[Math.floor(i*result.length/160)])
}
type Ripples=Ripple[];
export function particleCount(w:number,h:number){return Math.min(96,Math.max(12,Math.floor(w*h/8500)))}
export function paintEnvironment(c:CanvasRenderingContext2D,view:Camera,size:{w:number;h:number},map:FarmMap,season:Season,weather:Weather,ripples:Ripples,seconds:number,animateWater:boolean){
 const w=map.w*TILE,h=map.h*TILE;
 const left=Math.max(0,view.x),top=Math.max(0,view.y),right=Math.min(size.w,view.x+w*view.scale),bottom=Math.min(size.h,view.y+h*view.scale);
 if(right<=left||bottom<=top)return;
 c.save();c.beginPath();c.rect(left,top,right-left,bottom-top);c.clip();
 if(animateWater){c.fillStyle='#d8f4e76b';for(const p of ripples){const phase=(seconds*.45+p.phase)%1,x=view.x+p.x*view.scale,y=view.y+(p.y+phase*5)*view.scale;if(x<left-12||x>right||y<top-4||y>bottom)continue;c.globalAlpha=.3+.5*Math.sin(phase*Math.PI);c.fillRect(Math.round(x),Math.round(y),Math.max(2,Math.round((3+phase*5)*view.scale)),Math.max(1,Math.round(view.scale)))}c.globalAlpha=1;}
 if(weather!=='clear'){
 const rain=weather==='rain',count=particleCount(size.w,size.h);c.strokeStyle=rain?'#bddde9aa':'#f6fbf8b8';c.fillStyle='#f2fbf5d0';c.lineWidth=1;
 c.beginPath();for(let i=0;i<count;i++){const x=((hash(i,7)*size.w-seconds*(rain?35:12))%size.w+size.w)%size.w,y=(hash(i,9)*size.h+seconds*(rain?190:30+hash(i,10)*15))%size.h;if(rain){c.moveTo(x,y);c.lineTo(x-4,y+11)}else{const radius=1+Math.floor(hash(i,11)*2);c.fillRect(Math.round(x+Math.sin(seconds+i)*5),Math.round(y),radius,radius)}}if(rain)c.stroke();
 }else if(animateWater&&season!=='winter'){
 c.fillStyle=season==='autumn'?'#ebc46aab':'#dce99d99';for(let i=0;i<12;i++){const x=(hash(i,21)*size.w+seconds*12)%size.w,y=(hash(i,23)*size.h+Math.sin(seconds*.7+i)*13+size.h)%size.h;c.fillRect(Math.round(x),Math.round(y),2,1)}
 }
 c.restore()
}
