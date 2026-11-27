import {SEASON_CROPS,OWNED_CROPS} from './crop-data.ts';
import {rawCropPrice} from './season-crops.ts';
import {cropReceivesTiller} from './crop-growth.ts';
const crops=[...SEASON_CROPS,...OWNED_CROPS];
const fruitIds=new Set(['strawberry','blueberry','melon','hot-pepper','cranberries','grape','starfruit','ancient-fruit','pineapple','powdermelon']);
const mill:Record<string,{label:string;quantity:number;price:number}>={wheat:{label:'Wheat Flour',quantity:1,price:50},beet:{label:'Sugar',quantity:3,price:50},'unmilled-rice':{label:'Rice',quantity:1,price:100}};
export const EXTRA_PROCESS_CROPS=crops.filter(c=>fruitIds.has(c.id)||Object.hasOwn(mill,c.id));
const whole=(x:number,max:number)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
export type ExtraProcessInput={crop:string;stock:number;quality:0|1|2|3;days:number;dehydrators:number;mill:boolean;tiller:boolean;artisan:boolean};
export function extraProcessing(input:ExtraProcessInput){
 const c=EXTRA_PROCESS_CROPS.find(c=>c.id===input.crop);
 if(!c||!whole(input.stock,1000000)||!whole(input.days,112)||!whole(input.dehydrators,10000)||![0,1,2,3].includes(input.quality))throw Error('Invalid processing scenario');
 const raw=rawCropPrice(c.price,input.quality,input.tiller&&cropReceivesTiller(c)),baseline=raw*input.stock;
 const alternatives=[{label:'Sell raw',used:0,remaining:input.stock,output:0,unitPrice:raw,revenue:baseline,gain:0}];
 function add(label:string,batches:number,units:number,output:number,unitPrice:number){const used=batches*units,remaining=input.stock-used,revenue=batches*output*unitPrice+remaining*raw;alternatives.push({label,used,remaining,output:batches*output,unitPrice,revenue,gain:revenue-baseline})}
 if(fruitIds.has(c.id)){
  const price=c.id==='grape'?600:Math.floor(7.5*c.price+25);
  add(c.id==='grape'?'Raisins':'Dried Fruit',Math.min(Math.floor(input.stock/5),input.days*input.dehydrators),5,1,Math.floor(price*(input.artisan?140:100)/100));
 }
 const m=mill[c.id];if(m&&input.mill&&input.days>=1)add(m.label,input.stock,1,m.quantity,m.price);
 return {raw,baseline,alternatives:alternatives.sort((a,b)=>b.revenue-a.revenue)};
}
export function wineAging(basePrice:number,stock:number,casks:number,days:number,artisan:boolean){
 if(!whole(basePrice,1000000)||!whole(stock,1000000)||!whole(casks,10000)||!whole(days,112))throw Error('Invalid cellar scenario');
 const raw=Math.floor(basePrice*(artisan?140:100)/100);
 return [{quality:'Normal',days:0,mult:1},{quality:'Silver',days:14,mult:1.25},{quality:'Gold',days:28,mult:1.5},{quality:'Iridium',days:56,mult:2}].map(q=>{
 const aged=q.days?Math.min(stock,Math.floor(days/q.days)*casks):0,price=Math.floor(Math.floor(basePrice*q.mult)*(artisan?140:100)/100),revenue=aged*price+(stock-aged)*raw;
 return {...q,aged,price,revenue,gain:revenue-stock*raw};
 }).sort((a,b)=>b.revenue-a.revenue)
}
