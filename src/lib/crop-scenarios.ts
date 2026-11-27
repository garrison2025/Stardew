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
