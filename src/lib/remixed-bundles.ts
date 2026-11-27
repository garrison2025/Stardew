import {ROOMS} from './bundle-data.ts';
import {SAVE_COLLECTION_IDS} from './save-collection-ids.ts';
export const REMIXED_KEY='remixed-bundles-v1';
export type CustomSlot={name:string;quantity:number;quality:0|1|2|3;donated:number};
export type CustomBundle={id:string;name:string;room:string;needed:number;slots:CustomSlot[]};
export type RemixedState={schema:1;bundles:CustomBundle[]};
const integer=(n:unknown,min:number,max:number)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=min&&n<=max;
const name=(v:unknown)=>typeof v==='string'&&v.trim().length>0&&v.length<=100;
export const emptyRemixed=():RemixedState=>({schema:1,bundles:[]});
export function decodeRemixed(raw:unknown):RemixedState{
 const v=raw as RemixedState;if(!v||v.schema!==1||!Array.isArray(v.bundles)||v.bundles.length>40)throw Error('Invalid custom bundle list');const ids=new Set<string>();
 const bundles=v.bundles.map(b=>{if(!b||!name(b.id)||ids.has(b.id)||!name(b.name)||!ROOMS.some(r=>r.id===b.room)||!Array.isArray(b.slots)||b.slots.length>12||!integer(b.needed,1,b.slots.length))throw Error('Invalid custom bundle');ids.add(b.id);
 const slots=b.slots.map(s=>{if(!s||!name(s.name)||!integer(s.quantity,1,1000000)||!integer(s.quality,0,3)||!integer(s.donated,0,s.quantity))throw Error('Invalid custom bundle slot');return {name:s.name.trim(),quantity:s.quantity,quality:s.quality,donated:s.donated}});
 return {id:b.id,name:b.name.trim(),room:b.room,needed:b.needed,slots}});
 return {schema:1,bundles};
}
export function remixedProgress(b:CustomBundle){const filled=b.slots.filter(s=>s.donated===s.quantity).length;return {filled,remaining:Math.max(0,b.needed-filled),done:filled>=b.needed}}

export type SavedBundleLayout={state:RemixedState;excluded:number};

export function parseSavedBundles(rows:{key:string;value:string}[]):SavedBundleLayout{
 if(rows.length>40)throw Error('Save contains more than 40 bundle definitions.');
 const bundles:CustomBundle[]=[];
 const ids=new Set<string>();
 const itemCatalogues:Record<string,string>[]=[SAVE_COLLECTION_IDS.shipping,SAVE_COLLECTION_IDS.fishing,SAVE_COLLECTION_IDS.cooking];
 let excluded=0;
 for(const {key,value} of rows){
  try{
   const parts=/^([^/]+)\/(\d{1,4})$/.exec(key);
   const [title,,requirements,,neededField]=value.split('/');
   const neededText=neededField?.trim();
   const room=parts&&ROOMS.find(r=>r.name.replaceAll(' ','')===parts[1].trim().replaceAll(' ',''));
   if(!parts||!room||value.length>2500||!requirements)throw Error('Unknown bundle definition');
   const id='save-'+parts[2];
   if(ids.has(id))throw Error('Duplicate bundle identifier');
   ids.add(id);
   const encoded=requirements.trim().split(/\s+/);
   if(encoded.length%3||encoded.length>36)throw Error('Invalid slot list');
   const slots:CustomSlot[]=[];
   for(let i=0;i<encoded.length;i+=3){
    const [key,quantityText,qualityText]=encoded.slice(i,i+3);
    if(!/^\d{1,7}$/.test(quantityText)||!/^\d{1,7}$/.test(qualityText))throw Error('Invalid slot metadata');
    const quantity=Number(quantityText),quality=Number(qualityText);
    if(key==='-1'&&room.id==='vault'){
     if(quality!==0&&quality!==quantity)throw Error('Invalid vault amount');
     slots.push({name:'Gold',quantity,quality:0,donated:0});continue;
    }
    if(!/^(?:\(O\))?[A-Za-z0-9_.-]{1,60}$/.test(key)||key.startsWith('-')||![0,1,2,4].includes(quality))throw Error('Unsupported item or quality');
    const objectId=key.replace(/^\(O\)/,'');
    const label=itemCatalogues.find(catalogue=>Object.hasOwn(catalogue,objectId))?.[objectId];
    slots.push({name:label??'Item '+objectId,quantity,quality:(quality===4?3:quality) as CustomSlot['quality'],donated:0});
   }
   if(neededText&&!/^\d{1,2}$/.test(neededText))throw Error('Invalid required slot count');
   const needed=neededText?Number(neededText):slots.length;
   const [validated]=decodeRemixed({schema:1,bundles:[{id,room:room.id,name:title,needed,slots}]}).bundles;
   bundles.push(validated);
  }catch{excluded++}
 }
 return {state:{schema:1,bundles},excluded};
}

export function addSavedBundles(current:RemixedState,incoming:RemixedState):RemixedState{
 const existing=new Set(current.bundles.map(b=>b.id));
 return decodeRemixed({schema:1,bundles:[...current.bundles,...incoming.bundles.filter(b=>!existing.has(b.id))]});
}
