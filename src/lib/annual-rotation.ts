import {SEASON_CROPS,OWNED_CROPS,type CropSeason,type GameCrop} from './crop-data.ts';
import {cropReceivesTiller} from './crop-growth.ts';
import {rawCropPrice} from './season-crops.ts';
const seasons:CropSeason[]=['spring','summer','autumn','winter'];
export const annualDay=(day:number)=>seasons[Math.floor((day-1)/28)]+' '+((day-1)%28+1);
export type AnnualInput={start:number;plots:number;budget:number;winterSeeds:number;quality:0|1|2|3;tiller:boolean;year2:boolean;oasis:boolean;trellis:boolean;strawberryStock:boolean};
type Step={crop:string;plant:number;harvests:number[];cost:number;revenue:number};
type Plan={cost:number;profit:number;steps:Step[]};
const int=(x:number,min:number,max:number)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
const empty:Plan={cost:0,profit:0,steps:[]};
const seasonAt=(day:number)=>seasons[Math.floor((day-1)/28)];
function available(c:GameCrop,s:AnnualInput,day:number){return c.seasons.includes(seasonAt(day))&&(!c.trellis||s.trellis)&&(!c.special||c.special==='year2'&&s.year2||c.special==='oasis'&&s.oasis||c.special==='festival'&&s.strawberryStock)}
/** Every candidate is a non-overlapping schedule for one outdoor tile, with all seed costs reserved. */
function frontier(s:AnnualInput){
 const dp:Plan[][]=Array.from({length:86},()=>[empty]);
 for(let day=84;day>=s.start;day--){
  const byCost=new Map<number,Plan>(dp[day+1].map(p=>[p.cost,p]));
  for(const c of SEASON_CROPS){
   if(!available(c,s,day))continue;
   let last=day;while(last<84&&c.seasons.includes(seasonAt(last+1)))last++;
   const first=day+c.growth;if(first>last)continue;
   const price=rawCropPrice(c.price,s.quality,s.tiller&&cropReceivesTiller(c));
   const dates:number[]=[];
   for(let end=first;end<=last;end+=c.regrow||85){
    dates.push(end);const revenue=dates.length*c.yield*price,profit=revenue-c.seed;
    if(profit<=0)continue;
    for(const tail of dp[end]){
     const cost=c.seed+tail.cost;if(cost>s.budget)continue;
     const value=profit+tail.profit;
     if(value>(byCost.get(cost)?.profit??-1))byCost.set(cost,{cost,profit:value,steps:[{crop:c.id,plant:day,harvests:[...dates],cost:c.seed,revenue},...tail.steps]});
    }
   }
  }
  let best=-1;dp[day]=[...byCost.values()].sort((a,b)=>a.cost-b.cost).filter(p=>{if(p.profit<=best)return false;best=p.profit;return true});
 }
 return s.start>84?[empty]:dp[s.start];
}
export function annualRotation(s:AnnualInput){
 if(!int(s.start,1,112)||!int(s.plots,0,10000)||!int(s.budget,0,100000000)||!int(s.winterSeeds,0,1000000)||![0,1,2,3].includes(s.quality)||[s.tiller,s.year2,s.oasis,s.trellis,s.strawberryStock].some(v=>typeof v!=='boolean'))throw Error('Invalid annual rotation inputs.');
 const plans=frontier(s),best=plans.at(-1)!;
 const budget=Math.min(Math.floor(s.budget/10),Math.floor(best.cost*s.plots/10));
 let exact=true;let counts=new Map<number,number>();
 const add=(map:Map<number,number>,i:number,n=1)=>{if(n&&i>0)map.set(i,(map.get(i)??0)+n)};
 if(s.plots&&best.cost*s.plots<=s.budget)add(counts,plans.length-1,s.plots);
 else if(s.plots&&s.plots*(budget+1)*plans.length<=8000000){
  const stride=budget+1,choices=new Int32Array((s.plots+1)*stride);let prev=new Float64Array(stride);
  for(let p=1;p<=s.plots;p++){const next=new Float64Array(stride);for(let b=0;b<=budget;b++){let v=prev[b],idx=0;for(let i=1;i<plans.length;i++){const k=plans[i].cost/10;if(k>b)break;const n=prev[b-k]+plans[i].profit;if(n>v){v=n;idx=i}}next[b]=v;choices[p*stride+b]=idx}prev=next}
  let b=budget;for(let p=s.plots;p>0;p--){const i=choices[p*stride+b];add(counts,i);b-=plans[i].cost/10}
 }else if(s.plots&&best.cost){
  exact=false;
  const greedy=(ratio:boolean)=>{const m=new Map<number,number>();let cash=s.budget,tiles=s.plots;
   while(tiles&&cash){let i=0,score=0;const cap=ratio?cash:Math.floor(cash/tiles);for(let j=1;j<plans.length;j++){const p=plans[j];if(p.cost>cap)break;const v=ratio?p.profit/p.cost:p.profit;if(v>score){score=v;i=j}}if(!i){tiles--;continue}const n=ratio?Math.min(tiles,Math.floor(cash/plans[i].cost)):1;add(m,i,n);cash-=n*plans[i].cost;tiles-=n}
   return m};
  const value=(m:Map<number,number>)=>[...m].reduce((n,[i,t])=>n+plans[i].profit*t,0);
  const a=greedy(true),b=greedy(false);counts=value(a)>value(b)?a:b;
 }
 const allocation=[...counts].map(([i,tiles])=>({tiles,...plans[i]})).sort((a,b)=>b.tiles-a.tiles||b.profit-a.profit);
 const spent=allocation.reduce((n,p)=>n+p.tiles*p.cost,0),warm=allocation.reduce((n,p)=>n+p.tiles*p.profit,0);
 const powder=OWNED_CROPS.find(c=>c.id==='powdermelon')!,winter:Step[]=[];
 let left=s.winterSeeds,winterProfit=0;
 for(let day=Math.max(85,s.start);day+powder.growth<=112&&left;day+=powder.growth){const tiles=Math.min(left,s.plots);if(!tiles)break;const revenue=tiles*rawCropPrice(powder.price,s.quality,s.tiller&&cropReceivesTiller(powder));winter.push({crop:powder.id,plant:day,harvests:[day+powder.growth],cost:0,revenue});left-=tiles;winterProfit+=revenue}
 const used=s.winterSeeds-left;
 const upper=exact?warm:Math.min(best.profit*s.plots,Math.ceil(s.budget*Math.max(0,...plans.slice(1).map(p=>p.profit/p.cost))));
 if(spent>s.budget||allocation.reduce((n,p)=>n+p.tiles,0)>s.plots||used>s.winterSeeds||warm>upper)throw Error('Annual constraint check failed');
 // Independent feasibility check over returned calendar. A new planting can follow a same-day harvest.
 for(const p of allocation){let end=s.start;let cost=0,revenue=0;for(const step of p.steps){const c=SEASON_CROPS.find(x=>x.id===step.crop)!;if(!c||step.plant<end||!available(c,s,step.plant)||step.harvests[0]!==step.plant+c.growth)throw Error('Invalid annual planting');end=step.harvests.at(-1)!;for(let d=step.plant;d<=end;d++)if(!c.seasons.includes(seasonAt(d)))throw Error('Invalid seasonal overlap');if(step.harvests.some((d,i)=>i>0&&(!c.regrow||d!==step.harvests[i-1]+c.regrow)))throw Error('Invalid harvest interval');cost+=step.cost;revenue+=step.revenue}if(cost!==p.cost||revenue-cost!==p.profit)throw Error('Invalid annual profit')}
 return {exact,allocation,winter,winterSeedsUsed:used,spent,revenue:warm+spent+winterProfit,profit:warm+winterProfit,upperBound:upper+winterProfit,unusedTiles:s.plots-allocation.reduce((n,p)=>n+p.tiles,0)};
}
