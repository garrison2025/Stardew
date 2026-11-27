import type {GameCrop} from './crop-data.ts';
// Independently transcribed stage lengths from the individual crop reference pages,
// https://stardewvalleywiki.com/Crops and Crop_Growth_Calendars (2026-11-27).
export const CROP_PHASES:Readonly<Record<string,readonly number[]>>={
  "parsnip": [
    1,
    1,
    1,
    1
  ],
  "potato": [
    1,
    1,
    1,
    2,
    1
  ],
  "cauliflower": [
    1,
    2,
    4,
    4,
    1
  ],
  "green-bean": [
    1,
    1,
    1,
    3,
    4
  ],
  "kale": [
    1,
    2,
    2,
    1
  ],
  "strawberry": [
    1,
    1,
    2,
    2,
    2
  ],
  "blueberry": [
    1,
    3,
    3,
    4,
    2
  ],
  "melon": [
    1,
    2,
    3,
    3,
    3
  ],
  "corn": [
    2,
    3,
    3,
    3,
    3
  ],
  "tomato": [
    2,
    2,
    2,
    2,
    3
  ],
  "hot-pepper": [
    1,
    1,
    1,
    1,
    1
  ],
  "radish": [
    2,
    1,
    2,
    1
  ],
  "wheat": [
    1,
    1,
    1,
    1
  ],
  "cranberries": [
    1,
    2,
    1,
    1,
    2
  ],
  "pumpkin": [
    1,
    2,
    3,
    4,
    3
  ],
  "eggplant": [
    1,
    1,
    1,
    1,
    1
  ],
  "yam": [
    1,
    3,
    3,
    3
  ],
  "bok-choy": [
    1,
    1,
    1,
    1
  ],
  "grape": [
    1,
    1,
    2,
    3,
    3
  ],
  "blue-jazz": [
    1,
    2,
    2,
    2
  ],
  "tulip": [
    1,
    1,
    2,
    2
  ],
  "garlic": [
    1,
    1,
    1,
    1
  ],
  "rhubarb": [
    2,
    2,
    2,
    3,
    4
  ],
  "unmilled-rice": [
    1,
    2,
    2,
    3
  ],
  "hops": [
    1,
    1,
    2,
    3,
    4
  ],
  "poppy": [
    1,
    2,
    2,
    2
  ],
  "red-cabbage": [
    2,
    1,
    2,
    2,
    2
  ],
  "starfruit": [
    2,
    3,
    2,
    3,
    3
  ],
  "summer-spangle": [
    1,
    2,
    3,
    2
  ],
  "sunflower": [
    1,
    2,
    3,
    2
  ],
  "amaranth": [
    1,
    2,
    2,
    2
  ],
  "artichoke": [
    2,
    2,
    1,
    2,
    1
  ],
  "beet": [
    1,
    1,
    2,
    2
  ],
  "fairy-rose": [
    1,
    4,
    4,
    3
  ],
  "carrot": [
    1,
    1,
    1
  ],
  "summer-squash": [
    1,
    1,
    1,
    1,
    2
  ],
  "broccoli": [
    2,
    2,
    2,
    2
  ],
  "powdermelon": [
    1,
    1,
    1,
    2,
    2
  ],
  "ancient-fruit": [
    2,
    7,
    7,
    7,
    5
  ],
  "pineapple": [
    1,
    3,
    3,
    4,
    3
  ],
  "taro-root": [
    1,
    2,
    3,
    4
  ],
  "coffee-bean": [
    1,
    2,
    2,
    3,
    2
  ],
  "sweet-gem-berry": [
    2,
    4,
    6,
    6,
    6
  ]
};
export type GrowthFertilizer='none'|'speed'|'deluxe'|'hyper';
export type GrowthSettings={fertilizer:GrowthFertilizer;agriculturist:boolean;irrigated:boolean;cost:number};
const rates:Record<GrowthFertilizer,number>={none:0,speed:10,deluxe:25,hyper:33};
export function validateGrowth(settings?:GrowthSettings){
 if(!settings)return;
 if(!Object.hasOwn(rates,settings.fertilizer)||typeof settings.agriculturist!=='boolean'||typeof settings.irrigated!=='boolean'||!Number.isInteger(settings.cost)||settings.cost<0||settings.cost>20000)throw Error('Invalid growth settings or fertilizer cost.');
}
export function growthProfile(crop:GameCrop,settings?:GrowthSettings){
 validateGrowth(settings);
 const source=CROP_PHASES[crop.id];
 if(!source||source.reduce((a,b)=>a+b,0)!==crop.growth)throw Error('Missing or mismatched growth stages: '+crop.id);
 const paddy=!!settings?.irrigated&&['unmilled-rice','taro-root'].includes(crop.id);
 const percent=settings?rates[settings.fertilizer]+(settings.agriculturist?10:0)+(paddy?25:0):0;
 const phases=[...source];
 let remaining=Math.ceil(crop.growth*percent/100);
 for(let pass=0;pass<3&&remaining>0;pass++)for(let i=0;i<phases.length&&remaining>0;i++){
   if(phases[i]>(i===0?1:0)){phases[i]--;remaining--}
 }
 return {baseDays:crop.growth,days:phases.reduce((a,b)=>a+b,0),phases,percent,paddy,unappliedDays:remaining};
}
export function cropReceivesTiller(crop:GameCrop){return !['coffee-bean','sweet-gem-berry'].includes(crop.id)}
