import {cropById,GAME_CROPS} from './crop-data.ts';
import {analyze,type Interior} from './indoor-model.ts';
const fruits=new Set(['strawberry','blueberry','melon','hot-pepper','cranberries','grape']);
export const PROCESS_CROPS=GAME_CROPS.filter(c=>c.id!=='wheat');
export type ProcessInput={crop:string;stock:number;minutes:number;quality:0|1|2|3;artisan:boolean;tiller:boolean;kegs:number;jars:number};
export function availableMachines(layout:Interior){const blocked=new Set(analyze(layout).inaccessible);let kegs=0,jars=0,blockedKegs=0,blockedJars=0;for(const [k,d] of Object.entries(layout.cells)){if(d==='keg'){if(blocked.has(Number(k)))blockedKegs++;else kegs++}if(d==='jar'){if(blocked.has(Number(k)))blockedJars++;else jars++}}return {kegs,jars,blockedKegs,blockedJars}}
export function estimateProcessing(input:ProcessInput){
 const c=cropById.get(input.crop);if(!c||!PROCESS_CROPS.some(v=>v.id===c.id))throw Error('Unsupported processing crop');
 if(!Number.isInteger(input.stock)||input.stock<0||input.stock>1000000||!Number.isInteger(input.minutes)||input.minutes<0||input.minutes>1600000||![0,1,2,3].includes(input.quality)||![input.kegs,input.jars].every(n=>Number.isInteger(n)&&n>=0&&n<=10000))throw Error('Invalid inventory, time, quality or device count');
 const fruit=fruits.has(c.id),raw=Math.floor(Math.floor(c.price*[100,125,150,200][input.quality]/100)*(input.tiller?110:100)/100),artisan=input.artisan?140:100;
 const kegPrice=Math.floor(Math.floor(c.price*(fruit?300:225)/100)*artisan/100),jarPrice=Math.floor((2*c.price+50)*artisan/100);
 const recipes=[{machine:'Keg',product:fruit?'Wine':'Juice',minutes:fruit?10000:6000,price:kegPrice,devices:input.kegs},{machine:'Preserves jar',product:fruit?'Jelly':'Pickles',minutes:4000,price:jarPrice,devices:input.jars}].map(r=>({...r,capacity:Math.floor(input.minutes/r.minutes)*r.devices,gain:r.price-raw}));
 let remaining=input.stock;const rows=recipes.sort((a,b)=>b.gain-a.gain||a.minutes-b.minutes).map(r=>{const units=r.gain>0?Math.min(remaining,r.capacity):0;remaining-=units;return {...r,units,revenue:units*r.price,increment:units*r.gain}});
 const processed=input.stock-remaining,processedRevenue=rows.reduce((s,r)=>s+r.revenue,0),totalRevenue=processedRevenue+remaining*raw,rawRevenue=input.stock*raw;
 return {raw,rows,processed,remaining,processedRevenue,totalRevenue,rawRevenue,increment:totalRevenue-rawRevenue};
}
