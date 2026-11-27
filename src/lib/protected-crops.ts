import {SEASON_CROPS,OWNED_CROPS,type GameCrop} from './crop-data.ts';
import {growthProfile,cropReceivesTiller,type GrowthSettings} from './crop-growth.ts';
import {rawCropPrice} from './season-crops.ts';
export const PROTECTED_CROPS=[...SEASON_CROPS,...OWNED_CROPS];
export type ProtectedInput={site:'greenhouse'|'island';days:number;plots:number;budget:number;stock:number;seedCost:number;quality:0|1|2|3;tiller:boolean;margin:25|50|75|100;growth:GrowthSettings;replant:boolean};
function integer(n:number,min:number,max:number){return Number.isSafeInteger(n)&&n>=min&&n<=max}
export function protectedPlan(crop:GameCrop,input:ProtectedInput){
 if(!['greenhouse','island'].includes(input.site)||!integer(input.days,1,112)||!integer(input.plots,0,input.site==='greenhouse'?120:10000)||!integer(input.budget,0,100000000)||!integer(input.stock,0,1000000)||!integer(input.seedCost,0,1000000)||![25,50,75,100].includes(input.margin)||![0,1,2,3].includes(input.quality))throw Error('Invalid protected growing scenario.');
 // Paddy bonus requires an explicitly chosen watered Island tile; greenhouse has no natural paddy-water source.
 const growth=growthProfile(crop,{...input.growth,irrigated:input.site==='island'&&input.growth.irrigated}).days;
 const fertilizer=input.growth.fertilizer==='none'?0:input.growth.cost;
 const interval=crop.regrow||growth,dates:number[]=[];
 for(let elapsed=growth;elapsed<input.days;elapsed+=interval){dates.push(elapsed+1);if(!crop.regrow&&!input.replant)break}
 const price=Math.floor(rawCropPrice(crop.price,input.quality,input.tiller&&cropReceivesTiller(crop))*input.margin/100);
 const costFor=(count:number)=>input.seedCost*(crop.regrow?1:count)+fertilizer;
 // Maximize net profit for one crop, with all seed costs reserved up front and a finite stock.
 let best={tiles:0,harvests:0,seeds:0,cost:0,revenue:0,profit:0,units:0,days:[] as number[]};
 for(let harvests=1;harvests<=dates.length;harvests++){
  if(crop.regrow&&harvests!==dates.length)continue;
  const seedsPerTile=crop.regrow?1:harvests,perTileCost=costFor(harvests);
  const tiles=Math.min(input.plots,Math.floor(input.stock/seedsPerTile),perTileCost?Math.floor(input.budget/perTileCost):input.plots);
  const seeds=tiles*seedsPerTile,cost=tiles*perTileCost,units=tiles*harvests*crop.yield,revenue=units*price,profit=revenue-cost;
  if(tiles&&profit>best.profit)best={tiles,harvests,seeds,cost,revenue,profit,units,days:dates.slice(0,harvests)};
 }
 return {...best,growth,price,netPerTileDay:best.tiles?best.profit/best.tiles/input.days:0,roi:best.cost?100*best.profit/best.cost:null};
}
export function protectedRanking(input:ProtectedInput,availability:{year2:boolean;oasis:boolean;festival:boolean;trellis:boolean}){
 return SEASON_CROPS.filter(c=>(!c.special||c.special==='year2'&&availability.year2||c.special==='oasis'&&availability.oasis||c.special==='festival'&&availability.festival)&&(!c.trellis||availability.trellis))
 .map(c=>({crop:c,plan:protectedPlan(c,{...input,seedCost:c.seed,stock:1000000})})).sort((a,b)=>b.plan.profit-a.plan.profit||a.crop.name.localeCompare(b.crop.name));
}
