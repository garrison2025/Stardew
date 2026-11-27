import type {GameCrop} from './crop-data.ts';
export type PrimaryMachine='Keg'|'Preserves jar'|'Dehydrator'|'Mill';
export type DailyRecipe={machine:PrimaryMachine;product:string;inputs:number;outputs:number;basePrice:number;price:number;duration:number;wine:boolean};
// Explicit supported crop categories; do not treat flowers or unknown crops as vegetables.
const fruits=new Set(['strawberry','blueberry','melon','hot-pepper','cranberries','grape','rhubarb','starfruit','ancient-fruit','pineapple','powdermelon']);
const vegetables=new Set(['parsnip','potato','cauliflower','green-bean','kale','corn','tomato','radish','pumpkin','eggplant','yam','bok-choy','garlic','unmilled-rice','hops','wheat','red-cabbage','amaranth','artichoke','beet','carrot','summer-squash','broccoli','taro-root']);
const mill:Record<string,[string,number,number]>={wheat:['Wheat Flour',1,50],beet:['Sugar',3,50],'unmilled-rice':['Rice',1,100]};
export function dailyRecipes(c:GameCrop,minutesPerDay:number,artisan:boolean):DailyRecipe[]{
 if(!Number.isInteger(minutesPerDay)||minutesPerDay<1||minutesPerDay>2000)throw Error('Invalid effective day length');
 const list:DailyRecipe[]=[];
 const add=(machine:PrimaryMachine,product:string,inputs:number,outputs:number,basePrice:number,duration:number,bonus=true,wine=false)=>list.push({machine,product,inputs,outputs,basePrice,price:Math.floor(basePrice*(artisan&&bonus?140:100)/100),duration,wine});
 const days=(m:number)=>Math.ceil(m/minutesPerDay);
 if(fruits.has(c.id)){
  add('Keg','Wine',1,1,c.price*3,days(10000),true,true);
  add('Preserves jar','Jelly',1,1,c.price*2+50,days(4000));
  add('Dehydrator',c.id==='grape'?'Raisins':'Dried Fruit',5,1,c.id==='grape'?600:Math.floor(c.price*7.5+25),1);
 }else if(vegetables.has(c.id)){
  if(c.id==='wheat')add('Keg','Beer',1,1,200,days(1750));
  else if(c.id==='hops')add('Keg','Pale Ale',1,1,300,days(2250));
  else add('Keg','Juice',1,1,Math.floor(c.price*2.25),days(6000));
  add('Preserves jar','Pickles',1,1,c.price*2+50,days(4000));
 }
 if(c.id==='coffee-bean')add('Keg','Coffee',5,1,150,days(120),false);
 const m=mill[c.id];if(m)add('Mill',m[0],1,m[1],m[2],1,false);
 return list;
}
export function agedWinePrice(base:number,days:14|28|56,artisan:boolean){return Math.floor(Math.floor(base*(days===14?125:days===28?150:200)/100)*(artisan?140:100)/100)}
