import {ROOMS} from './bundle-data.ts';
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
