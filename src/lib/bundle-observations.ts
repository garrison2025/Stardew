import type {SaveBundle} from './save-bundles.ts';
import {decodeRemixed,type RemixedState,type CustomBundle,type CustomSlot} from './remixed-bundles.ts';
import {SAVE_COLLECTION_IDS} from './save-collection-ids.ts';
const int=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
const short=(v:unknown,max:number):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const roomMap:Record<string,string>={'Crafts Room':'crafts','Pantry':'pantry','Fish Tank':'fish','Boiler Room':'boiler','Bulletin Board':'board','Vault':'vault','Abandoned JojaMart':'missing','Abandoned Joja Mart':'missing','Abandoned JojaMart Bundle':'missing'};
const labels=new Map<string,string>(Object.values(SAVE_COLLECTION_IDS).flatMap(entries=>Object.entries(entries)));
export function decodeBundleObservations(raw:unknown):SaveBundle[]{
 if(!Array.isArray(raw)||raw.length>100)throw Error('Invalid saved bundle observations');
 const ids=new Set<number>();
 return raw.map(b=>{
  if(!b||!int(b.id,0,99999)||ids.has(b.id)||!short(b.room,80)||!short(b.name,100)||!Array.isArray(b.slots)||b.slots.length<1||b.slots.length>48||!int(b.needed,1,b.slots.length))throw Error('Invalid observed bundle definition');
  ids.add(b.id);
  const slots=b.slots.map((s:SaveBundle['slots'][number])=>{
   if(!s||typeof s.item!=='string'||!/^(?:-1|(?:\(O\))?[A-Za-z0-9_.-]{1,80})$/.test(s.item)||!int(s.quantity,1,9999999)||![0,1,2,4].includes(s.quality)||![true,false,null].includes(s.donated)||s.item==='-1'&&(b.slots.length!==1||s.quality!==0))throw Error('Invalid observed bundle slot');
   return {item:s.item,quantity:s.quantity,quality:s.quality,donated:s.donated};
  });
  if(b.completedInSave!==undefined&&(b.completedInSave!==true||slots.some((slot:SaveBundle['slots'][number])=>slot.donated!==null)))throw Error('Invalid saved bundle completion marker');
  return {id:b.id,room:b.room,name:b.name,needed:b.needed,slots,...(b.completedInSave?{completedInSave:true as const}:{})};
 });
}
export function observedSlotName(s:SaveBundle['slots'][number]){
 if(s.item==='-1')return 'Gold';
 const id=s.item.replace(/^\(O\)/,'');
 const label=labels.get(id);
 return label?label+' ['+s.item+']':'Game item '+s.item;
}
export function observedBundleStatus(b:SaveBundle){
 const positive=b.slots.filter(s=>s.donated===true).length,unknown=b.slots.filter(s=>s.donated===null).length;
 const done=b.completedInSave===true||positive>=b.needed;
 return {positive,unknown,remaining:done?0:b.needed-positive,done};
}
export function observedCommunityCenterSummary(bundles:readonly SaveBundle[]){
 const center=bundles.filter(b=>Object.hasOwn(roomMap,b.room)&&roomMap[b.room]!=='missing');
 return {total:center.length,completed:center.filter(b=>observedBundleStatus(b).done).length};
}
export function copyObservedBundles(current:RemixedState,raw:unknown){
 const base=decodeRemixed(current),observations=decodeBundleObservations(raw);
 const bundles=base.bundles.slice();let added=0,updated=0,skipped=0;
 for(const b of observations){
  const room=Object.hasOwn(roomMap,b.room)?roomMap[b.room]:undefined;
  if(!room||b.slots.length>12||b.slots.some(s=>s.quantity>1000000||observedSlotName(s).length>100)){skipped++;continue}
  const candidate:CustomBundle={id:'save-bundle:'+b.id,name:b.name,room,needed:b.needed,slots:b.slots.map(s=>({name:observedSlotName(s),quantity:s.quantity,quality:(s.quality===4?3:s.quality) as CustomSlot['quality'],donated:s.donated===true?s.quantity:0}))};
  const index=bundles.findIndex(x=>x.id===candidate.id);
  if(index<0){if(bundles.length>=40){skipped++;continue}bundles.push(candidate);added++;continue}
  const old=bundles[index];
  if(old.name!==candidate.name||old.room!==candidate.room||old.needed!==candidate.needed||old.slots.length!==candidate.slots.length||old.slots.some((s,i)=>s.name!==candidate.slots[i].name||s.quantity!==candidate.slots[i].quantity||s.quality!==candidate.slots[i].quality)){skipped++;continue}
  const slots=old.slots.map((s,i)=>({...s,donated:Math.max(s.donated,candidate.slots[i].donated)}));
  bundles[index]={...old,slots};updated++;
 }
 return {state:decodeRemixed({schema:1,bundles}),added,updated,skipped};
}
