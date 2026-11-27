import {BUNDLES,ROOMS,type Bundle} from './bundle-data.ts';
import {decodeBundleState,setDonation,type BundleState} from './bundle-progress.ts';
import {decodeBundleObservations} from './bundle-observations.ts';
import {backpackName} from './backpack-observations.ts';
import type {SaveBundle} from './save-bundles.ts';
// Explicit aliases for vanilla item and bundle naming differences, not fuzzy matching.
const extra:Readonly<Record<string,string>>={'178':'Hay','536':'Frozen Geode'};
const alias:Readonly<Record<string,string>>={'large egg (white)':'large white egg','large egg (brown)':'large brown egg'};
const norm=(s:string)=>s.trim().replace(/[’‘]/g,"'").toLowerCase();
function itemName(s:SaveBundle['slots'][number]){if(s.item==='-1')return 'gold';const id=s.item.replace(/^\(O\)/,'');const name=backpackName(id)??extra[id];return name?(alias[norm(name)]??norm(name)):undefined}
const signature=(name:string,quantity:number,quality:number)=>JSON.stringify([name,quantity,quality]);
function match(b:SaveBundle,standard:Bundle){
 const room=ROOMS.find(r=>r.id===standard.room)?.name;
 const name=norm(b.name).replace(/ bundle$/,'');
 const expected=norm(standard.name).replace(/ bundle$/,'');
 const vault=standard.room==='vault'&&name.replace(/[,g\s]/g,'')===String(standard.slots[0].quantity);
 if((norm(b.room)!==norm(room??'')&&!(standard.room==='missing'&&norm(b.room)==='abandoned jojamart bundle'))||(!vault&&name!==expected)||b.needed!==standard.needed||b.slots.length!==standard.slots.length)return null;
 const candidates=new Map<string,typeof standard.slots>();
 for(const s of standard.slots){const key=signature(norm(s.name),s.quantity,s.quality);candidates.set(key,[...(candidates.get(key)??[]),s])}
 const matched=[];
 for(const s of b.slots){const label=itemName(s);if(!label)return null;const key=signature(label,s.quantity,s.quality),slots=candidates.get(key);if(!slots?.length)return null;matched.push({slot:slots.shift()!,donated:s.donated})}
 // Repeated identical requirements are safe only as a group; use the count of positive slots.
 return matched;
}
export function mergeStandardDonations(current:BundleState,raw:unknown){
 let state=decodeBundleState(current);const observations=decodeBundleObservations(raw);
 const matches=observations.map(b=>({b,standard:BUNDLES.map(s=>({s,slots:match(b,s)})).filter(x=>x.slots!==null)}));
 const count=new Map<string,number>();for(const m of matches)if(m.standard.length===1){const id=m.standard[0].s.id;count.set(id,(count.get(id)??0)+1)}
 let matched=0,added=0,skipped=0;
 for(const m of matches){if(m.standard.length!==1||count.get(m.standard[0].s.id)!==1){skipped++;continue}
  matched++;
  const groups=new Map<string,{slots:Bundle['slots'];positive:number}>();
  for(const entry of m.standard[0].slots!){const slot=entry.slot,k=signature(norm(slot.name),slot.quantity,slot.quality);const g=groups.get(k)??{slots:[],positive:0};g.slots.push(slot);if(entry.donated===true)g.positive++;groups.set(k,g)}
  for(const g of groups.values()){const full=g.slots.filter(s=>(state.donated[s.id]??0)===s.quantity).length;let remaining=Math.max(0,g.positive-full);
   const incomplete=g.slots.filter(s=>(state.donated[s.id]??0)<s.quantity).sort((a,b)=>(state.donated[b.id]??0)-(state.donated[a.id]??0));
   for(const slot of incomplete){if(!remaining)break;state=setDonation(state,slot.id,slot.quantity);added++;remaining--}
  }
 }
 return {state,matched,added,skipped};
}
