import {backpackName,readBackpack,type BackpackStack} from './backpack-observations.ts';
import type {SaveElement} from './save-xml.ts';
export type StorageObservation={scope:'recognized-location-storage';containers:number;skippedContainers:number;unmapped:number;stacks:BackpackStack[]};
const int=(v:unknown,min:number,max:number):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
const child=(e:SaveElement|undefined,n:string)=>e?.children.find(c=>c.localName===n);
const text=(e:SaveElement|undefined,n:string)=>child(e,n)?.textContent.trim()??'';
const xsi=(e:SaveElement,k:string)=>e.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance',k)??e.getAttribute('xsi:'+k);
export function decodeStorage(raw:unknown):StorageObservation{
 const v=raw as StorageObservation;
 if(!v||v.scope!=='recognized-location-storage'||!int(v.containers,0,10000)||!int(v.skippedContainers,0,10000)||!int(v.unmapped,0,1000000)||!Array.isArray(v.stacks)||v.stacks.length>4096)throw Error('Invalid storage observation');
 const seen=new Set<string>();const stacks=v.stacks.map(s=>{if(!s||typeof s.id!=='string'||!backpackName(s.id)||![0,1,2,4].includes(s.quality)||!int(s.quantity,1,1000000))throw Error('Invalid storage stack');const key=s.id+':'+s.quality;if(seen.has(key))throw Error('Duplicate storage stack');seen.add(key);return {id:s.id,quality:s.quality,quantity:s.quantity}});
 return {scope:'recognized-location-storage',containers:v.containers,skippedContainers:v.skippedContainers,unmapped:v.unmapped,stacks};
}
export function readStorage(root:SaveElement):StorageObservation|undefined{
 const locations=child(root,'locations');if(!locations||xsi(locations,'nil')==='true')return undefined;
 const records=new Map<string,BackpackStack>();let containers=0,skippedContainers=0,unmapped=0;
 const seen=new Set<SaveElement>(),seenLocations=new Set<SaveElement>();
 function take(e:SaveElement,fridge=false){
  if(seen.has(e))return;seen.add(e);if(seen.size>10000)throw Error('Storage observation limit');
  if(xsi(e,'nil')==='true')return;
  const special=text(e,'SpecialChestType')||text(e,'specialChestType');
  if((!fridge&&xsi(e,'type')!=='Chest')||text(e,'playerChest')!=='true'||(special&&special!=='None'&&special!=='0')||text(e,'isGlobalInventory')==='true'||text(e,'globalInventoryId')){skippedContainers++;return}
  const b=readBackpack(e);if(!b){skippedContainers++;return}
  containers++;unmapped+=b.unmapped;
  for(const s of b.stacks){const k=s.id+':'+s.quality,n=(records.get(k)?.quantity??0)+s.quantity;if(n>1000000||(!records.has(k)&&records.size>=4096)){unmapped++;continue}records.set(k,{...s,quantity:n})}
 }
 function scan(loc:SaveElement,depth=0){
  if(depth>16||seenLocations.has(loc)||xsi(loc,'nil')==='true')return;seenLocations.add(loc);
  for(const e of child(loc,'objects')?.children??[]){if(e.localName!=='item')continue;const obj=child(child(e,'value'),'Object');if(obj&&xsi(obj,'type')==='Chest')take(obj)}
  const f=child(loc,'fridge');if(f)take(f,true);
  for(const b of child(loc,'buildings')?.children??[]){const indoors=child(b,'indoors');if(indoors){const nested=child(indoors,'GameLocation');scan(nested??indoors,depth+1)}}
 }
 try{for(const loc of locations.children)if(loc.localName==='GameLocation')scan(loc);return containers||skippedContainers?decodeStorage({scope:'recognized-location-storage',containers,skippedContainers,unmapped,stacks:[...records.values()]}):undefined}catch{return undefined}
}
export function storageMaterials(storage:StorageObservation,names:readonly string[]){const wanted=new Set(names),out:Record<string,number>=Object.create(null);for(const s of decodeStorage(storage).stacks){const name=backpackName(s.id)!;if(wanted.has(name))out[name]=(out[name]??0)+s.quantity}return out}
