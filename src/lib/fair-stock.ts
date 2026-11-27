import {decodeBackpack,backpackName,type Backpack} from './backpack-observations.ts';
import {decodeStorage,type StorageObservation} from './storage-observations.ts';
import {FAIR_SAMPLES} from './fair-samples.ts';
import {FISH_REFERENCE} from './fish-reference.ts';
import {MUSEUM_ITEMS} from './museum-data.ts';
import {COOKING} from './game-collections.ts';
import type {FairCandidate} from './fair-optimize.ts';
const categories=new Map<string,string>();
for(const item of MUSEUM_ITEMS)if(item.kind!=='artifact')categories.set(item.name,'Minerals');
for(const [name,r] of Object.entries(FISH_REFERENCE))if(r.method==='rod'||r.method==='pot')categories.set(name,'Fish');
for(const item of COOKING)categories.set(item.name,'Cooking');
// Conservative factual category subset; editable, not inferred from the price.
for(const [category,names] of Object.entries({
 'Vegetables':['Parsnip','Potato','Cauliflower','Green Bean','Kale','Corn','Tomato','Radish','Pumpkin','Eggplant','Yam','Bok Choy','Garlic','Red Cabbage','Artichoke','Beet','Carrot','Broccoli','Summer Squash','Unmilled Rice','Taro Root','Fiddlehead Fern'],
 'Fruits':['Strawberry','Blueberry','Melon','Hot Pepper','Cranberries','Grape','Starfruit','Ancient Fruit','Pineapple','Powdermelon','Apple','Apricot','Cherry','Orange','Peach','Pomegranate','Banana','Mango','Coconut','Cactus Fruit','Blackberry','Salmonberry','Wild Plum','Spice Berry','Crystal Fruit'],
 'Animal Products':['Egg','Large Egg','Brown Egg','Large Brown Egg','Milk','Large Milk','Goat Milk','Large Goat Milk','Duck Egg','Void Egg','Wool','Duck Feather','Rabbit\'s Foot'],
 'Artisan Goods':['Cheese','Goat Cheese','Mayonnaise','Duck Mayonnaise','Void Mayonnaise','Cloth','Honey','Wine','Jelly','Pickles','Juice','Beer','Pale Ale','Mead','Truffle Oil'],
 'Foraging':['Chanterelle','Common Mushroom','Morel','Purple Mushroom','Red Mushroom','Daffodil','Dandelion','Leek','Wild Horseradish','Hazelnut','Winter Root','Snow Yam','Crocus','Sweet Pea']
}))for(const name of names)categories.set(name,category);
for(const sample of FAIR_SAMPLES)categories.set(sample.name,sample.category);
export function observedFairCandidates(backpack:Backpack|undefined,storage:StorageObservation|undefined,includeStorage:boolean,query=''){
 const rows=new Map<string,FairCandidate>();let excluded=0;
 for(const stack of [...(backpack?decodeBackpack(backpack).stacks:[]),...(includeStorage&&storage?decodeStorage(storage).stacks:[])]){
  const name=backpackName(stack.id),category=name?categories.get(name):undefined;if(!name||!category){excluded++;continue}
  if(!name.toLowerCase().includes(query.trim().toLowerCase()))continue;
  const key=stack.id+':'+stack.quality,old=rows.get(key);
  rows.set(key,{name,category,price:0,quality:stack.quality===4?3:stack.quality,quantity:Math.min(9999,(old?.quantity??0)+stack.quantity)});
 }
 const all=[...rows.values()].sort((a,b)=>a.name.localeCompare(b.name)||b.quality-a.quality);
 return {rows:all.slice(0,60),matched:all.length,excluded};
}
