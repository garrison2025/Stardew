import {decodeBackpack,backpackName,type Backpack} from './backpack-observations.ts';
import type {SaveBundle} from './save-bundles.ts';
export function matchingBackpackQuantity(backpack:Backpack|undefined,slot:SaveBundle['slots'][number]):number|null{
 if(!backpack||slot.item==='-1')return null;
 const id=slot.item.replace(/^\(O\)/,'');if(!backpackName(id))return null;
 const b=decodeBackpack(backpack);return b.stacks.filter(s=>s.id===id&&s.quality>=slot.quality).reduce((n,s)=>n+s.quantity,0);
}
