import {GAME_CROPS,type GameCrop,type CropSeason} from './crop-data.ts';
export type SeasonInput={season:CropSeason;start:number;plots:number;budget:number;replant:boolean;strawberry:boolean;trellis:boolean};
export type Cycle={crop:GameCrop;days:number[];seeds:number;cost:number;revenue:number;profit:number};
export type Allocation={cycle:Cycle;tiles:number};
function checkDay(day:number){if(!Number.isInteger(day)||day<1||day>28)throw Error('Planting day must be 1–28.')}
export function cycles(crop:GameCrop,start:number,replant:boolean):Cycle[]{
 checkDay(start);const first=start+crop.growth;if(first>28)return [];
 const interval=crop.regrow||crop.growth,days:number[]=[];
 for(let d=first;d<=28;d+=interval){days.push(d);if(!crop.regrow&&!replant)break}
 const make=(dates:number[]):Cycle=>{const seeds=crop.regrow?1:dates.length,cost=seeds*crop.seed,revenue=dates.length*crop.yield*crop.price;return {crop,days:dates,seeds,cost,revenue,profit:revenue-cost}};
 // For single-harvest crops allow shorter repeated schedules under limited budgets.
 return crop.regrow?[make(days)]:days.map((_,i)=>make(days.slice(0,i+1)));
}
export function eligible(input:SeasonInput){return GAME_CROPS.filter(c=>c.seasons.includes(input.season)&&(!c.special||input.strawberry)&&(!c.trellis||input.trellis))}
export function optimizeSeason(input:SeasonInput){
 checkDay(input.start);if(!Number.isInteger(input.plots)||input.plots<0||input.plots>100||!Number.isInteger(input.budget)||input.budget<0||input.budget>20000)throw Error('Optimizer supports 0–100 tiles and 0–20,000g total seed budget.');
 if(!['spring','summer','autumn','winter'].includes(input.season))throw Error('Unknown season');
 // Every catalog seed price is a multiple of ten. Floor budget to that lattice.
 const budget=Math.floor(input.budget/10),stride=budget+1;
 const options=eligible(input).flatMap(c=>cycles(c,input.start,input.replant)).filter(c=>c.profit>0&&c.cost<=input.budget);
 if(options.some(c=>c.cost%10!==0))throw Error('Unsupported seed cost precision');
 const choices=new Int16Array((input.plots+1)*stride).fill(-1);
 let prev=new Int32Array(stride),next=new Int32Array(stride);
 for(let p=1;p<=input.plots;p++){for(let b=0;b<=budget;b++){let best=prev[b],idx=-1;for(let i=0;i<options.length;i++){const cost=options[i].cost/10;if(cost>b)continue;const value=prev[b-cost]+options[i].profit;if(value>best){best=value;idx=i}}next[b]=best;choices[p*stride+b]=idx}const swap=prev;prev=next;next=swap}
 const counts=new Map<number,number>();let b=budget;for(let p=input.plots;p>0;p--){const idx=choices[p*stride+b];if(idx>=0){counts.set(idx,(counts.get(idx)||0)+1);b-=options[idx].cost/10}}
 const allocation:Allocation[]=[...counts].map(([i,tiles])=>({cycle:options[i],tiles})).sort((a,b)=>b.tiles-a.tiles||a.cycle.crop.id.localeCompare(b.cycle.crop.id));
 const spent=allocation.reduce((n,a)=>n+a.cycle.cost*a.tiles,0),revenue=allocation.reduce((n,a)=>n+a.cycle.revenue*a.tiles,0),planted=allocation.reduce((n,a)=>n+a.tiles,0);
 return {allocation,spent,revenue,profit:revenue-spent,planted,unused:input.plots-planted};
}
