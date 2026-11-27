import {SEASON_CROPS,OWNED_CROPS} from './crop-data.ts';
import {analyze,type Interior} from './indoor-model.ts';
import {dailyRecipes} from './economy-recipes.ts';
import {rawCropPrice} from './season-crops.ts';
import {cropReceivesTiller} from './crop-growth.ts';
const roomRecipes=(crop:typeof SEASON_CROPS[number],artisan:boolean)=>dailyRecipes(crop,1,artisan).filter(r=>r.machine==='Keg'||r.machine==='Preserves jar');
export const PROCESS_CROPS=[...SEASON_CROPS,...OWNED_CROPS].filter(c=>roomRecipes(c,false).length>0);
export type ProcessInput={crop:string;stock:number;minutes:number;quality:0|1|2|3;artisan:boolean;tiller:boolean;kegs:number;jars:number};
export function availableMachines(layout:Interior){const blocked=new Set(analyze(layout).inaccessible);let kegs=0,jars=0,blockedKegs=0,blockedJars=0;for(const [k,d] of Object.entries(layout.cells)){if(d==='keg'){if(blocked.has(Number(k)))blockedKegs++;else kegs++}if(d==='jar'){if(blocked.has(Number(k)))blockedJars++;else jars++}}return {kegs,jars,blockedKegs,blockedJars}}
export function estimateProcessing(input:ProcessInput){
 const c=PROCESS_CROPS.find(v=>v.id===input.crop);if(!c)throw Error('Unsupported processing crop');
 if(!Number.isInteger(input.stock)||input.stock<0||input.stock>1000000||!Number.isInteger(input.minutes)||input.minutes<0||input.minutes>1600000||![0,1,2,3].includes(input.quality)||![input.kegs,input.jars].every(n=>Number.isInteger(n)&&n>=0&&n<=10000))throw Error('Invalid inventory, time, quality or device count');
 const raw=rawCropPrice(c.price,input.quality,input.tiller&&cropReceivesTiller(c));
 // A one-minute effective day preserves the primary recipes' exact minute durations.
 const recipes=roomRecipes(c,input.artisan).map(r=>{
  const devices=r.machine==='Keg'?input.kegs:input.jars;
  const batchCapacity=Math.floor(input.minutes/r.duration)*devices;
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
