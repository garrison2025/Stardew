import {SAVE_COLLECTION_IDS} from './save-collection-ids.ts';
import {CATALOGS,CRAFTING} from './game-collections.ts';
import {levelAt} from './game-rules.ts';
export type NamedCount={name:string;count:number};
export type ObservedCollection={done:string[];unmapped:number};
export type SaveProgress={collections?:Partial<Record<'shipping'|'fishing'|'cooking'|'museum',ObservedCollection>>;xp:number[]|null;money:number|null;lifetimeEarnings:number|null;walnutsFound:number|null;walnutsBalance:number|null;crafting:{known:string[];done:string[];unmapped:number}|null;learnedCooking:number|null;warnings:string[]};
export function normalizeSkillXp(values:unknown[]):number[]|null{
 if((values.length!==5&&values.length!==6)||values.some(n=>typeof n!=='number'||!Number.isSafeInteger(n)||n<0||n>1000000000))return null;
 // Game slots: farming, fishing, foraging, mining, combat; slot 5 is unused luck.
 const v=values as number[];return [v[0],v[3],v[2],v[1],v[4]]
}
export function normalizeCrafting(rows:NamedCount[]):NonNullable<SaveProgress['crafting']>{
 const items=new Map(CRAFTING.map(r=>[r.name.toLowerCase(),r.name])),seen=new Set<string>(),known:string[]=[],done:string[]=[];let unmapped=0;
 for(const row of rows){if(typeof row.name!=='string'||row.name.length>160||!Number.isSafeInteger(row.count)||row.count<0)throw Error('Invalid crafting record');const name=items.get(row.name.toLowerCase());if(!name){unmapped++;continue}if(seen.has(name))throw Error('Duplicate crafting record');seen.add(name);known.push(name);if(row.count>0)done.push(name)}
 return {known,done,unmapped}
}
export function safeCount(value:number|null,max=1000000000){return value!==null&&Number.isSafeInteger(value)&&value>=0&&value<=max?value:null}
export function skillTotal(xp:number[]|null){return xp===null?null:xp.reduce((n,v)=>n+levelAt(v),0)}

export function normalizeObjectCollection(kind:keyof typeof SAVE_COLLECTION_IDS,rows:NamedCount[]):ObservedCollection{
 const map:Record<string,string>=SAVE_COLLECTION_IDS[kind],done=new Set<string>(),unmapped=new Set<string>();
 const validNames=kind==='museum'?null:new Set(CATALOGS[kind].map(i=>i.name));
 for(const {name,count} of rows){if(!Number.isSafeInteger(count)||count<0||typeof name!=='string'||name.length>160)throw Error('Invalid object observation');if(count===0)continue;const key=name.startsWith('(O)')?name.slice(3):name;if(!Object.hasOwn(map,key)){unmapped.add(key);continue}const value=map[key];if(validNames&&!validNames.has(value)){unmapped.add(key);continue}done.add(value)}
 return {done:[...done],unmapped:unmapped.size}
}
