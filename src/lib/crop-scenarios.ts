import {rawCropPrice} from './season-crops.ts';
export type QualityFertilizer=0|1|2|3;
export function qualityProbabilities(level:number,fertilizer:QualityFertilizer){
 if(!Number.isInteger(level)||level<0||level>14||![0,1,2,3].includes(fertilizer))throw Error('Invalid farming level or fertilizer.');
 const goldRoll=.02*level+.2*fertilizer*(level+2)/12+.01;
 const iridium=fertilizer===3?goldRoll/2:0;
 const gold=(1-iridium)*Math.min(1,goldRoll);
 const silver=(1-iridium-gold)*(fertilizer===3?1:Math.min(.75,2*goldRoll));
 return {normal:Math.max(0,1-iridium-gold-silver),silver,gold,iridium};
}
export function expectedHarvestPrice(base:number,quantity:number,level:number,fertilizer:QualityFertilizer,tiller=false){
 if(!Number.isSafeInteger(base)||base<0||!Number.isSafeInteger(quantity)||quantity<1)throw Error('Invalid harvest.');
 const q=qualityProbabilities(level,fertilizer);
 return q.normal*rawCropPrice(base,0,tiller)+q.silver*rawCropPrice(base,1,tiller)+q.gold*rawCropPrice(base,2,tiller)+q.iridium*rawCropPrice(base,3,tiller)+(quantity-1)*rawCropPrice(base,0,tiller);
}

// 1.6.15 crop data: repeat chance, not a one-time Bernoulli bonus.
// Keep deterministic planting and inventory models independent of statistical expectations.
export const EXTRA_HARVEST_CHANCE:Readonly<Record<string,number>>=Object.freeze({potato:.2,strawberry:.02,blueberry:.02,tomato:.05,'hot-pepper':.03,cranberries:.1,eggplant:.002,'unmilled-rice':.1,'coffee-bean':.02});
const scytheCrops=new Set(['kale','wheat','unmilled-rice','amaranth']);
export function expectedCropHarvest(crop:import('./crop-data.ts').GameCrop,level:number,fertilizer:QualityFertilizer,tiller=false,options:{includeExtra:boolean;handHarvest?:boolean;dailyLuck?:number;luckLevel?:number}={includeExtra:true}){
 const guaranteed=crop.yield;
 const qualityValue=expectedHarvestPrice(crop.price,guaranteed,level,fertilizer,tiller);
 const dailyLuck=options.dailyLuck??0,luckLevel=options.luckLevel??0;
 if(!Number.isFinite(dailyLuck)||dailyLuck<-.1||dailyLuck>.125||!Number.isInteger(luckLevel)||luckLevel<0||luckLevel>20)throw Error('Invalid harvest luck scenario.');
 const p=EXTRA_HARVEST_CHANCE[crop.id]??0;
 // Game 1.6's inclusive uniform stack range: rice max grows by floor(level * 0.1).
 const variableBase=crop.id==='unmilled-rice'?Math.floor(Math.fround(level*Math.fround(.1)))/2:0;
 const geometric=p/(1-p);
 const preDouble=guaranteed+variableBase+geometric;
 // Optional hand-harvest roll. Scythe crops and forced scythe harvest do not use it.
 const doubleChance=options.handHarvest&&!scytheCrops.has(crop.id)?Math.max(0,Math.min(1,luckLevel/1500+dailyLuck/1200+.0001)):0;
 const expectedUnits=options.includeExtra?preDouble*(1+doubleChance):guaranteed;
 const extraUnits=expectedUnits-guaranteed;
 const revenue=qualityValue+extraUnits*rawCropPrice(crop.price,0,tiller);
 return {guaranteed,expectedUnits,extraUnits,repeatChance:p,doubleChance:options.includeExtra?doubleChance:0,revenue};
}
