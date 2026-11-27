import {SAVE_COLLECTION_IDS} from './save-collection-ids.ts';
import {ITEM_MAP} from './museum-data.ts';
import type {SaveElement} from './save-xml.ts';
import {FAIR_SAMPLES} from './fair-samples.ts';
import type {FairCandidate} from './fair-optimize.ts';
export type BackpackStack={id:string;quality:0|1|2|4;quantity:number};
export type Backpack={scope:'player-backpack';stacks:BackpackStack[];unmapped:number};
const known=new Map<string,string>();
for(const kind of ['shipping','fishing','cooking'] as const)for(const [id,name] of Object.entries(SAVE_COLLECTION_IDS[kind]))known.set(id,name);
for(const [id,key] of Object.entries(SAVE_COLLECTION_IDS.museum)){const item=ITEM_MAP.get(key);if(item)known.set(id,item.name)}
// Additional recipe inputs, independent factual object ID/name pairs; not collection achievements.
export const RECIPE_STOCK_IDS:Readonly<Record<string,string>>={"93":"Torch","245":"Sugar","246":"Wheat Flour","247":"Oil","292":"Mahogany Seed","309":"Acorn","310":"Maple Seed","311":"Pine Cone","395":"Coffee","419":"Vinegar","423":"Rice","427":"Tulip Bulb","429":"Jazz Seeds","453":"Poppy Seeds","455":"Spangle Seeds","685":"Bait","770":"Mixed Seeds","852":"Dragon Tooth"};
for(const [id,name] of Object.entries(RECIPE_STOCK_IDS)){if(known.has(id)&&known.get(id)!==name)throw Error('Conflicting inventory reference '+id);known.set(id,name)}
export function backpackName(id:string){return known.get(id)}
const integer=(n:unknown,min:number,max:number):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=min&&n<=max;
const quality=(n:unknown):n is BackpackStack['quality']=>n===0||n===1||n===2||n===4;
export function decodeBackpack(raw:unknown):Backpack{
 const v=raw as Backpack;
 if(!v||v.scope!=='player-backpack'||!Array.isArray(v.stacks)||v.stacks.length>96||!integer(v.unmapped,0,96))throw Error('Invalid backpack observation');
 const seen=new Set<string>();
 const stacks=v.stacks.map(s=>{if(!s||typeof s.id!=='string'||!known.has(s.id)||!quality(s.quality)||!integer(s.quantity,1,1000000))throw Error('Invalid backpack stack');const k=s.id+':'+s.quality;if(seen.has(k))throw Error('Duplicate backpack stack');seen.add(k);return {id:s.id,quality:s.quality,quantity:s.quantity}});
 return {scope:'player-backpack',stacks,unmapped:v.unmapped};
}
const child=(el:SaveElement|undefined,name:string)=>el?.children.find(e=>e.localName===name);
const text=(el:SaveElement|undefined,name:string)=>child(el,name)?.textContent.trim()??'';
const xsi=(el:SaveElement,key:string)=>el.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance',key)??el.getAttribute('xsi:'+key);
const num=(v:string)=>/^\d+$/.test(v)?Number(v):NaN;
export function readBackpack(player:SaveElement|undefined):Backpack|undefined{
 const root=child(player,'items');
 if(!root||xsi(root,'nil')==='true'||root.children.length>96)return undefined;
 const records=new Map<string,BackpackStack>();let unmapped=0;
 for(const el of root.children){
  if(el.localName!=='Item')return undefined;
  if(xsi(el,'nil')==='true')continue;
  const rawId=text(el,'itemId'),id=rawId.replace(/^\(O\)/,'');
  const low=text(el,'stack'),high=text(el,'Stack'),count=num(low||high),q=num(text(el,'quality'));
  // Exclude tools, big craftables, mod/unknown IDs, special and recipe objects, malformed stacks.
  if(xsi(el,'type')!=='Object'||!known.has(id)||!rawId||text(el,'bigCraftable')==='true'||text(el,'isRecipe')==='true'||text(el,'specialItem')==='true'||!integer(count,1,999999)||!quality(q)||(low&&high&&low!==high)){unmapped++;continue}
  const k=id+':'+q,next=(records.get(k)?.quantity??0)+count;
  if(!integer(next,1,1000000)){unmapped++;continue}
  records.set(k,{id,quality:q,quantity:next});
 }
 return decodeBackpack({scope:'player-backpack',stacks:[...records.values()],unmapped});
}
export function backpackMaterials(backpack:Backpack,names:readonly string[]){
 const recognized=decodeBackpack(backpack),out:Record<string,number>=Object.create(null),wanted=new Set(names);
 for(const s of recognized.stacks){const name=known.get(s.id)!;if(wanted.has(name))out[name]=(out[name]??0)+s.quantity}
 return out;
}
export function backpackFairCandidates(backpack:Backpack):FairCandidate[]{
 const recognized=decodeBackpack(backpack),rows:FairCandidate[]=[];
 for(const stack of recognized.stacks){const name=known.get(stack.id),sample=FAIR_SAMPLES.find(s=>s.name===name);if(!sample)continue;
 // Do not guess the actual sale price of the player's quality/profession/margin scenario.
 rows.push({name:sample.name,category:sample.category,quality:stack.quality===4?3:stack.quality,quantity:Math.min(stack.quantity,9999),price:0});
 }
 return rows;
}
