import {SAVE_BINDING_KEY,decodeSaveBinding} from './save-binding.ts';
import {decodeSaveObservations,SAVE_OBSERVATIONS_KEY} from './save-observations.ts';
import {decodeRemixed,REMIXED_KEY} from './remixed-bundles.ts';
import {decodeLayout,decodeLibrary} from './layout.ts';
import {decodePlan} from './map-model.ts';
import {decodeBook,latestPlan} from './scene-projects.ts';
import {decodeInterior} from './indoor-model.ts';
import {decodeBundleState} from './bundle-progress.ts';
import {decodeMuseum} from './museum-progress.ts';
import {decodeWalnuts} from './walnut-progress.ts';
import {decodeCollection,type CatalogKind} from './game-collections.ts';
import {levelAt,MASTERY,perfection,PERFECTION} from './game-rules.ts';
const checklists=new Set(['bundles','museum','fishing','perfection','crafting','shipping','cooking','golden-walnuts','skills','tracker'].map(x=>'checklist:'+x));
function object(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Expected object');return v as Record<string,unknown>}
function legacy(v:unknown){if(!Array.isArray(v)||v.length>1000)throw Error('Invalid legacy checklist');const ids=new Set<string>();return v.map(r=>{if(!r||typeof r.id!=='string'||r.id.length>100||ids.has(r.id)||typeof r.name!=='string'||r.name.length>120||typeof r.tag!=='string'||r.tag.length>120||typeof r.detail!=='string'||r.detail.length>3000||typeof r.done!=='boolean'||!Number.isFinite(r.weight)||r.weight<0||r.weight>10000)throw Error('Invalid legacy checklist row');ids.add(r.id);return {id:r.id,name:r.name,tag:r.tag,detail:r.detail,done:r.done,weight:r.weight}})}
export function decodeBackup(raw:unknown){const v=object(raw);if(v.schema!==1||typeof v.createdAt!=='string'||!Number.isFinite(Date.parse(v.createdAt)))throw Error('Invalid backup header');const records=object(v.records),out:Record<string,unknown>=Object.create(null);if(Object.keys(records).length>32)throw Error('Too many backup records');
 for(const [k,r] of Object.entries(records)){try{if(k==='layout')out[k]=decodeLayout(r);else if(k==='layout-library')out[k]=decodeLibrary(r);else if(k==='scene-plan-v2')out[k]=decodePlan(r);else if(k==='scene-book-v1')out[k]=decodeBook(r);else if(k==='indoor-layouts-v1'){const rooms=object(r),clean:Record<string,unknown>=Object.create(null);for(const [id,room] of Object.entries(rooms)){const d=decodeInterior(room);if(d.room!==id)throw Error('Room ID mismatch');clean[id]=d}out[k]=clean}
 else if(k===REMIXED_KEY)out[k]=decodeRemixed(r);
 else if(k==='standard-bundles-v1')out[k]=decodeBundleState(r);else if(k==='museum-progress-v1')out[k]=decodeMuseum(r);else if(k==='walnut-progress-v1')out[k]=decodeWalnuts(r);
 else if(['cooking','crafting','shipping','fishing'].some(kind=>k==='collection-v1:'+kind))out[k]=decodeCollection(k.slice(14) as CatalogKind,r);
 else if(k===SAVE_BINDING_KEY)out[k]=decodeSaveBinding(r);
 else if(k===SAVE_OBSERVATIONS_KEY)out[k]=decodeSaveObservations(r);
 else if(k==='skills-v1'){const a=object(r);if(!Array.isArray(a.xp)||a.xp.length!==5||typeof a.mastery!=='number')throw Error('Invalid skills');a.xp.forEach(n=>levelAt(n));levelAt(a.mastery,MASTERY);out[k]={xp:a.xp,mastery:a.mastery}}
 else if(k==='perfection-v1'){const a=object(r),values=object(a.values);if(typeof a.waivers!=='number'||Object.keys(values).some(id=>!PERFECTION.some(p=>p.id===id)))throw Error('Invalid perfection');perfection(values as Record<string,number>,a.waivers);out[k]={values,waivers:a.waivers}}
 else if(checklists.has(k))out[k]=legacy(r);else throw Error('Unknown backup record')}catch(e){throw Error(k+': '+String(e))}}
 if(out['scene-book-v1'])out['scene-plan-v2']=latestPlan(decodeBook(out['scene-book-v1']));return {schema:1 as const,createdAt:v.createdAt,records:out}
}
