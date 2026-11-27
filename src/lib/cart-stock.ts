import {OBJECT_POOL,FURNITURE_POOL,type CartPoolRow} from './cart-stock-reference.ts';
import {forecastCart,type CartStart} from './cart-forecast.ts';
import {hashWords,random} from './geode-prediction.ts';
const max=2147483647;
type Eligible=readonly [number,string,number];
export type StockOffer={id:number;label:string;price:number;quantity:number;kind:'ordinary'|'furniture'|'seasonal'|'guarantee'};
function choose(pool:readonly CartPoolRow[],rand:()=>number,count:number):Eligible[]{
 const keys=new Map<number,1|Eligible>();
 for(const row of pool){const key=Math.round(rand()*max);if(row!==0)keys.set(key,row)}
 return [...keys].sort((a,b)=>a[0]-b[0]).map(x=>x[1]).filter((x):x is Eligible=>x!==1).slice(0,count);
}
const visitIndex=(day:number)=>Math.floor(day/7)+Math.floor((day+2)/7)+Number(day>=99)+Number(day>=100)+Number(day>=101);
export function forecastCartStock(input:CartStart,originalGuarantee:number|null=null){
 if(originalGuarantee!==null&&(!Number.isInteger(originalGuarantee)||originalGuarantee<2||originalGuarantee>30))throw Error('Original Year 1 guarantee roll must be 2–30 or unknown');
 return forecastCart(input).map(visit=>{
  const day=visit.absoluteDay,game=Number(input.gameId)/2%max;
  const rand=random(input.legacy?Math.floor((day%max+game)%max):hashWords(day%max,game,0));
  const next=(a:number,b:number)=>a+Math.floor(rand()*(b-a));
  const ordinary=choose(OBJECT_POOL,rand,10);
  if(ordinary.length!==10)throw Error('Reference pool incomplete');
  const price=(base:number)=>Math.max(next(1,11)*100,next(3,6)*base);
  const qty=()=>rand()<.1?5:1;
  const offers:StockOffer[]=ordinary.map(([id,label,base])=>({id,label,price:price(base),quantity:qty(),kind:'ordinary'}));
  if(originalGuarantee!==null&&visitIndex(day)===originalGuarantee&&visit.year===1){const cabbage=OBJECT_POOL.find((r):r is Eligible=>Array.isArray(r)&&r[0]===485);if(!cabbage)throw Error('Reference cabbage seed missing');offers.push({id:485,label:cabbage[1],price:price(cabbage[2]),quantity:qty(),kind:'guarantee'})}
  const furniture=choose(FURNITURE_POOL,rand,1)[0];if(!furniture)throw Error('Reference furniture pool incomplete');
  offers.push({id:furniture[0],label:furniture[1],price:next(1,11)*250,quantity:1,kind:'furniture'});
  if(['spring','summer'].includes(visit.season)&&!ordinary.some(r=>r[1]==='Rare Seed'))offers.push({id:347,label:'Rare Seed',price:1000,quantity:qty(),kind:'seasonal'});
  return {...visit,stock:offers};
 });
}
