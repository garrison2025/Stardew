export type Cell = {x:number;y:number;kind:'crop'|'sprinkler'|'path'|'building';buildingId?:string};
export function integer(n:number,min:number,max:number){if(!Number.isSafeInteger(n)||n<min||n>max)throw new Error('Enter a whole number between '+min+' and '+max);return n;}
export const key=(x:number,y:number)=>x+','+y;
export function coverage(w:number,h:number,cells:Cell[],radius:number){
 const occupied=new Set(cells.filter(c=>c.kind!=='crop').map(c=>key(c.x,c.y))), covered=new Set<string>();
 for(const c of cells.filter(c=>c.kind==='sprinkler'))for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
 const x=c.x+dx,y=c.y+dy,k=key(x,y);if(x>=0&&y>=0&&x<w&&y<h&&!occupied.has(k))covered.add(k);
 }return covered;
}
export function suggest(w:number,h:number,cells:Cell[],radius:number,limit:number){
 integer(w,1,40);integer(h,1,40);integer(radius,1,4);integer(limit,0,40);
 const result=cells.slice(); for(let n=0;n<limit;n++){const base=coverage(w,h,result,radius);let best:Cell|undefined,gain=0;
 const occupied=new Set(result.map(c=>key(c.x,c.y)));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(occupied.has(key(x,y)))continue;
 let score=0;for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){const xx=x+dx,yy=y+dy,k=key(xx,yy);
 if((dx||dy)&&xx>=0&&yy>=0&&xx<w&&yy<h&&!base.has(k)&&!result.some(c=>c.x===xx&&c.y===yy&&c.kind!=='crop'))score++;}
 if(base.has(key(x,y)))score--;if(score>gain){gain=score;best={x,y,kind:'sprinkler'};}
 }if(!best)break;result.push(best);
 }return result;
}
export type Crop={name:string;seed:number;price:number;growth:number;regrow:number;yield:number};
export function cropProfit(c:Crop,days:number,plots:number){
 integer(days,0,112);integer(plots,0,10000);integer(c.seed,0,100000);integer(c.price,0,100000);integer(c.growth,1,112);integer(c.regrow,0,112);integer(c.yield,1,100);
 const harvests=days<c.growth?0:1+(c.regrow?Math.floor((days-c.growth)/c.regrow):0);
 const revenue=harvests*c.price*c.yield*plots,cost=c.seed*plots;
 return {harvests,revenue,cost,profit:revenue-cost};
}
export function optimizeCrops(crops:Crop[],days:number,plots:number,budget:number){
 integer(plots,0,100);integer(budget,0,10000);integer(crops.length,1,12);
 const values=crops.map(c=>cropProfit(c,days,1).profit);
 // Exact bounded DP for a single planting, no processing or reinvestment.
 const stride=budget+1,dp=new Float64Array((plots+1)*stride),choice=new Int16Array(dp.length).fill(-1);
 for(let p=1;p<=plots;p++)for(let b=0;b<=budget;b++){const idx=p*stride+b;dp[idx]=dp[(p-1)*stride+b];
 for(let i=0;i<crops.length;i++){const c=crops[i];if(c.seed<=b){const v=dp[(p-1)*stride+b-c.seed]+values[i];if(v>dp[idx]){dp[idx]=v;choice[idx]=i;}}}}
 const quantities=crops.map(()=>0);let b=budget;for(let p=plots;p>0;p--){const i=choice[p*stride+b];if(i>=0){quantities[i]++;b-=crops[i].seed;}}
 return {quantities,profit:dp[plots*stride+budget],spent:budget-b};
}
export function summarizeWeights(rows:{weight:number;done:boolean}[]){const total=rows.reduce((s,r)=>s+r.weight,0);const done=rows.reduce((s,r)=>s+(r.done?r.weight:0),0);return {done,total,percent:total?done/total*100:null};}
export function aggregateIngredients(lines:string[]){const out=new Map<string,number>();for(const line of lines){const m=line.trim().match(/^(.+?)\s*:\s*(\d+)$/);if(!m)throw new Error('Use ingredient: quantity on each line');const name=m[1].trim(),n=integer(Number(m[2]),1,100000);out.set(name,(out.get(name)||0)+n);}return [...out.entries()];}
export function verifySaveText(xml:string){if(xml.length>10*1024*1024)throw new Error('Preview limit: 10 MiB');if(/<!\s*(DOCTYPE|ENTITY)/i.test(xml))throw new Error('DTD and entity declarations are not supported');}
