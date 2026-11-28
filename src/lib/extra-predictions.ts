// Adapted from MIT Stardew Predictor stardew-predictor.js blob f84c2b30a32a04c3485ddabfba2be57cb0cde596.
// See /licenses/mouseypounds.txt. Reference outputs, not a full game simulation.
import {hashWords,random,identifier,type GeodeInput} from './geode-prediction.ts';
const MAX=2147483647;
function gamePart(id:string){return Number(identifier(id)%BigInt(MAX*2))/2}
function seed(legacy:boolean,...v:[number,number,number,number?,number?]){const a=v.map(n=>(n??0)%MAX);return legacy?Math.floor(a.reduce((s,n)=>s+n,0)%MAX):hashWords(a[0],a[1],a[2],a[3]??0,a[4]??0)}
function opener(input:GeodeInput,opening:number){const rng=random(seed(input.legacy,opening,gamePart(input.gameId),Number(BigInt.asIntN(32,identifier(input.playerId,true)))/2));for(let i=0;i<2;i++){const n=1+Math.floor(rng()*9);for(let j=0;j<n;j++)rng()}return rng}
function countCheck(opened:number,count:number){if(!Number.isSafeInteger(opened)||opened<0||opened>1000000||!Number.isSafeInteger(count)||count<1||count>100)throw Error('Choose a count between 1 and 100 and a valid previous opening count.')}
export function predictCoconuts(input:GeodeInput,count:number,first:boolean,helmet:boolean){
 countCheck(input.opened,count);let firstPending=first,helmetOwned=helmet;
 const items=['Banana Sapling','Mango Sapling','Pineapple Seeds','Taro Tuber','Fossilized Skull','Mahogany Seed','Iridium Ore'];
 return Array.from({length:count},(_,i)=>{const opening=input.opened+i+1,rng=opener(input,opening),qi=rng()<.1,hat=rng()<.05,roll=Math.floor(rng()*items.length);
 const result=(name:string,quantity=1)=>({opening,name,quantity});
 if(firstPending){firstPending=false;return result('Golden Walnut')}
 if(qi&&input.qiBeans)return result('Qi Bean');
 if(hat&&!helmetOwned){helmetOwned=true;return result('Golden Helmet')}
 return result(items[roll],[2,3,6].includes(roll)?5:1);
 });
}
const N:Record<string,string>={"74":"Prismatic Shard","166":"Treasure Chest","194":"Fried Egg","195":"Omelet","196":"Salad","197":"Cheese Cauliflower","198":"Baked Fish","199":"Parsnip Soup","200":"Vegetable Medley","201":"Complete Breakfast","202":"Fried Calamari","203":"Strange Bun","204":"Lucky Lunch","205":"Fried Mushroom","206":"Pizza","207":"Bean Hotpot","208":"Glazed Yams","209":"Carp Surprise","210":"Hashbrowns","211":"Pancakes","212":"Salmon Dinner","213":"Fish Taco","214":"Crispy Bass","215":"Pepper Poppers","216":"Bread","218":"Tom Kha Soup","219":"Trout Soup","220":"Chocolate Cake","221":"Pink Cake","222":"Rhubarb Pie","223":"Cookie","224":"Spaghetti","225":"Fried Eel","226":"Spicy Eel","227":"Sashimi","228":"Maki Roll","229":"Tortilla","230":"Red Plate","231":"Eggplant Parmesan","232":"Rice Pudding","233":"Ice Cream","234":"Blueberry Tart","235":"Autumn's Bounty","236":"Pumpkin Soup","237":"Super Meal","238":"Cranberry Sauce","239":"Stuffing","242":"Dish O' The Sea","253":"Triple Shot Espresso","279":"Magic Rock Candy","287":"Bomb","288":"Mega Bomb","369":"Quality Fertilizer","373":"Golden Pumpkin","382":"Coal","395":"Coffee","466":"Deluxe Speed-Gro","525":"Sturdy Ring","529":"Amethyst Ring","531":"Aquamarine Ring","532":"Jade Ring","533":"Emerald Ring","534":"Ruby Ring","621":"Quality Sprinkler","628":"Cherry Sapling","629":"Apricot Sapling","630":"Orange Sapling","631":"Peach Sapling","632":"Pomegranate Sapling","633":"Apple Sapling","687":"Dressed Spinner","688":"Warp Totem: Farm","689":"Warp Totem: Mountains","690":"Warp Totem: Beach","695":"Cork Bobber","709":"Hardwood","727":"Chowder","728":"Fish Stew","729":"Escargot","730":"Lobster Bisque","731":"Maple Bar","732":"Crab Cakes","733":"Shrimp Cocktail","770":"Mixed Seeds","773":"Life Elixir","797":"Pearl","888":"Glowstone Ring","Book_Mystery":"Book of Mysteries","PurpleBook":"Book Of Stars","SkillBook_0":"Stardew Valley Almanac","SkillBook_1":"Bait And Bobber","SkillBook_2":"Woodcutter's Weekly","SkillBook_3":"Mining Monthly","SkillBook_4":"Combat Quarterly"};
export function predictMystery(input:GeodeInput,opened:number,count:number,mode:0|1|2,book:boolean){
 countCheck(opened,count);if(![0,1,2].includes(mode))throw Error('Invalid box type');
 return Array.from({length:count},(_,i)=>{
 const opening=opened+i+1,rng=opener(input,opening),n=(max:number)=>Math.floor(rng()*max),pick=(a:(string|number)[])=>a[n(a.length)],r=(id:string|number,quantity=1,conditional=false)=>({opening,name:N[id]??String(id),quantity,conditional});
 const rare=mode===0?1:2;
 if(opening>10||mode>0){
  if(mode===2&&rng()<.005)return r('Golden Animal Cracker');
  if(mode>0&&rng()<.005)return r('Auto-Petter');
  if(rng()<.002*rare)return r(279);
  if(rng()<.004*rare)return r(74);
  if(rng()<.008*rare)return r(166);
  if(rng()<.01*rare+(book?0:.0004*opening))return r(book?pick(['PurpleBook','Book_Mystery']):'Book_Mystery');
  if(rng()<.01*rare)return r(pick([797,373]));
  if(rng()<.01*rare)return r('Mystery Hat');
  if(rng()<.01*rare)return r('Mystery Shirt');
  if(rng()<.01*rare)return r('Mystery Wallpaper');
  if(rng()<.1||mode>0){switch(n(15)){
   case 0:return r(288,5);case 1:return r(253,3);
   case 2:return rng()<.5?r(pick([687,695]),1,true):r(242,2);
   case 3:return r(204,2);case 4:return r(369,20);case 5:return r(466,20);case 6:return r(773,2);case 7:return r(688,3);
   case 8:return r(628+n(6));case 9:return r('Seasonal Seeds',20);case 10:return rng()<.5?r('Ossified Blade'):r(pick([533,534]));
   case 11:return r(621);case 12:return r('Mystery Box',3+n(2));case 13:return r('SkillBook_'+n(5));case 14:return r('Raccoon Seeds',8);
  }}
 }
 switch(n(14)){case 0:return r(395,3);case 1:return r(287,5);case 2:return r('Seasonal Seeds',8);case 3:return r(727+n(7));case 4:{let roll=217;while(roll===217)roll=194+n(46);return r(roll)}
 case 5:return r(709,10);case 6:return r(369,10);case 7:return r(466,10);case 8:return r(688);case 9:return r(689);case 10:return r(770,10);case 11:return r('Mixed Flower Seeds',10);
 case 12:if(rng()<.4){switch(n(4)){case 0:return r(525);case 1:return r(529);case 2:return r(888);default:return r(531+n(2))}}return r('Mystery Box',2);
 case 13:return r(690);default:return r(382)}
 });
}
export function predictMineDays(gameId:string,legacy:boolean,day:number,count:number,quarry:boolean,hardmode:boolean,adjust=0){
 if(!Number.isSafeInteger(day)||day<1||day>1000000||!Number.isSafeInteger(count)||count<1||count>28||!Number.isSafeInteger(adjust)||Math.abs(adjust)>365)throw Error('Invalid calendar range or day adjustment');
 const game=gamePart(gameId);
 return Array.from({length:count},(_,i)=>{const d=day+i,k=d+adjust,mushroom:number[]=[],monster:number[]=[],slime:number[]=[],quarryFloors:number[]=[],dinosaur:number[]=[];
 for(let floor=1;floor<120;floor++){if(floor%5===0)continue;let rng=random(seed(legacy,k,game,floor*100));
 if(rng()<.044&&floor%40>5&&floor%40<30&&floor%40!==19){(rng()<.5?monster:slime).push(floor);continue}
 if(rng()<.044&&quarry&&floor%40>1){quarryFloors.push(floor);continue}
 rng=random(seed(legacy,k,game,k,floor,4*floor));if(!hardmode&&rng()<.3&&floor>2)rng();rng();if(rng()<.035&&floor>80)mushroom.push(floor);
 }
 for(let floor=127;floor<621;floor++){const rng=random(seed(legacy,k,game,floor*100));if(rng()<.044){rng();if(rng()<.5)dinosaur.push(floor-120)}}
 return {day:d,mushroom,monster,slime,quarry:quarryFloors,dinosaur};
 });
}
