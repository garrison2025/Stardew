// Calendar roll order independently implemented against the MIT-licensed
// MouseyPounds/stardew-predictor stardew-predictor.js blob f84c2b30a32a04c3485ddabfba2be57cb0cde596.
// See /licenses/mouseypounds.txt. No upstream script, asset, or network dependency.
import {hashWords,random} from './geode-prediction.ts';
import {CART_SEASONS,type CartSeason} from './cart-forecast.ts';
export type CalendarInput={gameId:string;year:number;season:CartSeason;day:number;legacy:boolean;greenhouse:boolean};
export type NightEvent='Earthquake'|'Fairy'|'Witch'|'Meteor'|'Stone Owl'|'Strange Capsule';
const modulus=2147483647;
const rainyDays=[5,6,7,14,15,16,18,23] as const;
function gameNumber(id:string){
 if(!/^\d{1,16}$/.test(id)||!Number.isSafeInteger(Number(id))||Number(id)<1)throw Error('Enter a positive numeric game ID within the safe integer range.');
 return Number(id);
}
function seeded(a:number,b:number,legacy:boolean){
 return random(legacy?Math.floor((a%modulus+b%modulus)%modulus):hashWords(a%modulus,b%modulus,0));
}
export function greenRainDay(gameId:string,year:number,legacy:boolean){
 const game=gameNumber(gameId);
 if(!Number.isInteger(year)||year<1||year>101||typeof legacy!=='boolean')throw Error('Invalid calendar year or RNG setting.');
 return rainyDays[Math.floor(seeded(year*777,game,legacy)()*rainyDays.length)];
}
export function forecastCalendar(input:CalendarInput){
 const game=gameNumber(input.gameId),seasonIndex=CART_SEASONS.indexOf(input.season);
 if(!Number.isInteger(input.year)||input.year<1||input.year>100||seasonIndex<0||!Number.isInteger(input.day)||input.day<1||input.day>28||typeof input.legacy!=='boolean'||typeof input.greenhouse!=='boolean')throw Error('Choose a valid date (year 1–100) and RNG settings.');
 const start=(input.year-1)*112+seasonIndex*28+input.day;
 return Array.from({length:28},(_,index)=>{
  const absoluteDay=start+index,month=Math.floor((absoluteDay-1)/28),season=CART_SEASONS[month%4],year=Math.floor((absoluteDay-1)/112)+1,day=(absoluteDay-1)%28+1;
  const railroadUnlocked=absoluteDay>=31;
  let trainTime:number|null=null;
  if(railroadUnlocked){
   const roll=seeded(absoluteDay,game/2,input.legacy);
   if(roll()<.2){const time=Math.floor((900+Math.floor(roll()*900))/10)*10;if(time%100<60)trainTime=time;}
  }
  let overnight:NightEvent|null=null,windstormRoll=false;
  if(absoluteDay===30)overnight='Earthquake';
  else{
   const roll=seeded(absoluteDay+1,game/2,input.legacy);
   for(let n=0;n<10;n++)roll();
   let fairyRoll=roll();
   windstormRoll=fairyRoll<.1;
   if(input.greenhouse)fairyRoll=roll();
   if(fairyRoll<.01&&month%4<3)overnight='Fairy';
   else if(roll()<.01&&absoluteDay+1>20)overnight='Witch';
   else if(roll()<.01&&absoluteDay+1>5)overnight='Meteor';
   else if(roll()<.005)overnight='Stone Owl';
   else if(roll()<.008&&year>1)overnight='Strange Capsule';
  }
  return {absoluteDay,year,season,day,railroadUnlocked,trainTime,greenRain:season==='summer'&&day===greenRainDay(input.gameId,year,input.legacy),overnight,windstormRoll};
 });
}
export function trainClock(time:number){return String(Math.floor(time/100)).padStart(2,'0')+':'+String(time%100).padStart(2,'0')}
