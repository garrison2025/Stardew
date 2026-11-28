import {GEODE_TYPES,predictGeodes,type GeodeInput,type GeodeType} from './geode-prediction.ts';
import {SAVE_COLLECTION_IDS} from './save-collection-ids.ts';
import {ITEM_MAP} from './museum-data.ts';
export function geodeTargetRows(input:GeodeInput,count:number,undonated?:readonly string[],target?:string){
 if(undonated&&undonated.some(id=>!ITEM_MAP.has(id)))throw Error('Unknown museum target');if(target&&!ITEM_MAP.has(target))throw Error('Unknown museum target');
 const allowed=undonated?new Set(undonated):null;
 const rows=GEODE_TYPES.flatMap(type=>predictGeodes(input,type,count).map(r=>({...r,type,museumId:(SAVE_COLLECTION_IDS.museum as Record<string,string>)[String(r.id)]??null})));
 return rows.filter(r=>r.museumId&&(!allowed||allowed.has(r.museumId))&&(!target||r.museumId===target)).sort((a,b)=>a.opening-b.opening||GEODE_TYPES.indexOf(a.type)-GEODE_TYPES.indexOf(b.type));
}
// Each row is an alternative for the same opening index, not a simultaneous reward.
export function planGeodeTargets(input:GeodeInput,count:number,stock:Record<GeodeType,number>,missing:readonly string[]){
 for(const t of GEODE_TYPES)if(!Number.isSafeInteger(stock[t])||stock[t]<0||stock[t]>100)throw Error('Container stock must be 0–100');
 const remain={...stock},want=new Set(missing),matrix=GEODE_TYPES.map(t=>predictGeodes(input,t,count));
 const steps:{opening:number;type:GeodeType;name:string;quantity:number;museumId:string|null;newTarget:boolean}[]=[];
 for(let i=0;i<count;i++){
  const available=GEODE_TYPES.flatMap((type,j)=>remain[type]>0?[{type,r:matrix[j][i]}]:[]);
  if(!available.length)break;
  const choices=available.map(({type,r})=>({...r,type,museumId:(SAVE_COLLECTION_IDS.museum as Record<string,string>)[String(r.id)]??null}));
  const selected=choices.find(r=>r.museumId&&want.has(r.museumId))??choices[0];
  const newTarget=!!selected.museumId&&want.delete(selected.museumId);remain[selected.type]--;
  steps.push({...selected,newTarget});
 }
 return {steps,remaining:remain,matched:missing.length-want.size,unmatched:[...want]};
}
