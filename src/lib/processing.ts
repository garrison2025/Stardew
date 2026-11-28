import {SEASON_CROPS,OWNED_CROPS} from './crop-data.ts';
import {analyze,type Interior} from './indoor-model.ts';
import {dailyRecipes} from './economy-recipes.ts';
import {rawCropPrice} from './season-crops.ts';
import {cropReceivesTiller} from './crop-growth.ts';
const roomRecipes=(crop:typeof SEASON_CROPS[number],artisan:boolean)=>dailyRecipes(crop,1,artisan).filter(r=>r.machine==='Keg'||r.machine==='Preserves jar');
export const PROCESS_CROPS=[...SEASON_CROPS,...OWNED_CROPS].filter(c=>roomRecipes(c,false).length>0);
// A game day has 1200 effective minutes from 06:00 to 02:00, plus 400 overnight.
export const GAME_DAY_PROCESSING_MINUTES=1600;
export type PickupSchedule='instant'|'morning'|'four-times';
export function scheduledBatches(minutes:number,duration:number,pickup:PickupSchedule='instant'){
 if(!Number.isSafeInteger(minutes)||minutes<0||minutes>1600000||!Number.isSafeInteger(duration)||duration<1||!['instant','morning','four-times'].includes(pickup))throw Error('Invalid processing schedule');
 if(pickup==='instant')return Math.floor(minutes/duration);
 const offsets=pickup==='morning'?[0]:[0,360,720,1080];
 let loadedAt=0,batches=0;
 for(let day=0;day<=Math.floor(minutes/GAME_DAY_PROCESSING_MINUTES);day++){
  for(const offset of offsets){
   const at=day*GAME_DAY_PROCESSING_MINUTES+offset;
   if(at>minutes)return batches;
   if(at-loadedAt>=duration){batches++;loadedAt=at}
  }
 }
 return batches;
}
export type ProcessInput={crop:string;stock:number;minutes:number;quality:0|1|2|3;artisan:boolean;tiller:boolean;kegs:number;jars:number;pickup?:PickupSchedule};
export function availableMachines(layout:Interior){const blocked=new Set(analyze(layout).inaccessible);let kegs=0,jars=0,blockedKegs=0,blockedJars=0;for(const [k,d] of Object.entries(layout.cells)){if(d==='keg'){if(blocked.has(Number(k)))blockedKegs++;else kegs++}if(d==='jar'){if(blocked.has(Number(k)))blockedJars++;else jars++}}return {kegs,jars,blockedKegs,blockedJars}}
export function estimateProcessing(input:ProcessInput){
 const c=PROCESS_CROPS.find(v=>v.id===input.crop);if(!c)throw Error('Unsupported processing crop');
 if(!Number.isInteger(input.stock)||input.stock<0||input.stock>1000000||!Number.isInteger(input.minutes)||input.minutes<0||input.minutes>1600000||![0,1,2,3].includes(input.quality)||![input.kegs,input.jars].every(n=>Number.isInteger(n)&&n>=0&&n<=10000))throw Error('Invalid inventory, time, quality or device count');
 const raw=rawCropPrice(c.price,input.quality,input.tiller&&cropReceivesTiller(c));
 // A one-minute effective day preserves the primary recipes' exact minute durations.
 const recipes=roomRecipes(c,input.artisan).map(r=>{
  const devices=r.machine==='Keg'?input.kegs:input.jars;
  const batchCapacity=scheduledBatches(input.minutes,r.duration,input.pickup)*devices;
  return {machine:r.machine,product:r.product,minutes:r.duration,price:r.price,devices,inputs:r.inputs,outputs:r.outputs,batchCapacity,capacity:batchCapacity*r.inputs,gain:r.price*r.outputs-raw*r.inputs};
 });
 let remaining=input.stock;
 const rows=recipes.sort((a,b)=>b.gain/b.inputs-a.gain/a.inputs||a.minutes-b.minutes).map(r=>{
  const batches=r.gain>0?Math.min(Math.floor(remaining/r.inputs),r.batchCapacity):0;
  const units=batches*r.inputs,outputUnits=batches*r.outputs;
  remaining-=units;
  return {...r,batches,units,outputUnits,revenue:outputUnits*r.price,increment:batches*r.gain};
 });
 const processed=input.stock-remaining,processedRevenue=rows.reduce((s,r)=>s+r.revenue,0),totalRevenue=processedRevenue+remaining*raw,rawRevenue=input.stock*raw;
 return {raw,rows,processed,remaining,processedRevenue,totalRevenue,rawRevenue,increment:totalRevenue-rawRevenue};
}
