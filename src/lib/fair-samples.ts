import type {FairCandidate} from './fair-optimize.ts';
// Standard base sale values; actual value may differ under professions and margin settings.
// References: https://stardewvalleywiki.com/Stardew_Valley_Fair and individual item pages.
export const FAIR_SAMPLES=[
 {name:'Milk',category:'Animal Products',price:125},
 {name:'Cheese',category:'Artisan Goods',price:230},
 {name:'Fried Egg',category:'Cooking',price:35},
 {name:'Largemouth Bass',category:'Fish',price:100},
 {name:'Chanterelle',category:'Foraging',price:160},
 {name:'Melon',category:'Fruits',price:250},
 {name:'Diamond',category:'Minerals',price:750},
 {name:'Pumpkin',category:'Vegetables',price:320}
] as const;
export function fairReferenceCandidate(index:number):FairCandidate{const s=FAIR_SAMPLES[index];if(!s)throw Error('Unknown reference item');return {...s,quality:0,quantity:0}}
