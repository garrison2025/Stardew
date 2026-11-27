// Compare declared independent observations; never derive the expected results from the tool.
import {isDeepStrictEqual} from 'node:util';
const roots=new Set(['version','farmType','year','day','season','farmFound','records','progress','farmhands']);
const blocked=new Set(['__proto__','constructor','prototype','fingerprint','gameId','playerId','uniqueIDForThisGame']);
export function observedPath(value,path){
 const parts=typeof path==='string'?path.split('.'):[];
 if(!parts.length||!roots.has(parts[0])||parts.length>12||parts.some(p=>blocked.has(p)||!/^([A-Za-z][A-Za-z0-9_]*|0|[1-9][0-9]{0,5})$/.test(p)))throw Error('Unsupported check path');
 for(const p of parts){if(value==null||typeof value!=='object'||!Object.hasOwn(value,p))return {present:false};value=value[p]}
 return {present:true,value};
}
export function checkSnapshot(snapshot,checks){
 if(!checks||typeof checks!=='object'||Array.isArray(checks)||Object.keys(checks).length<1||Object.keys(checks).length>100)throw Error('Provide 1–100 independently observed save checks');
 return Object.entries(checks).map(([path,expected],i)=>{const found=observedPath(snapshot,path);return {check:i+1,passed:found.present&&isDeepStrictEqual(found.value,expected)}});
}
export function checkGeodeRows(rows,observed){
 if(!Array.isArray(observed)||observed.length<1||observed.length>100||observed.some(o=>!o||!((typeof o.id==='number'&&Number.isSafeInteger(o.id)&&o.id>=0)||(typeof o.id==='string'&&/^[A-Za-z0-9_]{1,80}$/.test(o.id)))||!Number.isSafeInteger(o.quantity)||o.quantity<1))throw Error('Provide 1–100 observed geode ID and quantity pairs');
 return observed.map((o,i)=>({check:i+1,passed:rows[i]?.id===o.id&&rows[i]?.quantity===o.quantity}));
}

export function checkCartRows(rows,observed){
 if(!Array.isArray(observed)||observed.length<1||observed.length>100)throw Error('Provide 1–100 independent observed cart slots');
 return observed.map((o,i)=>{
  if(!o||!Number.isSafeInteger(o.absoluteDay)||o.absoluteDay<1||!['Forest Cart','Night Market','Desert Festival'].includes(o.venue)||!['ordinary','furniture','seasonal','guarantee','special','skill-book'].includes(o.kind)||typeof o.label!=='string'||!o.label.trim()||o.label.length>120||!Number.isSafeInteger(o.price)||o.price<1||!Number.isSafeInteger(o.quantity)||o.quantity<1)throw Error('Invalid cart observation');
  const visit=rows.find(v=>v.absoluteDay===o.absoluteDay&&v.venue===o.venue);
  const candidates=o.kind==='special'?(visit?.offers??[]).filter(x=>x.label!=='Tea Set').map(x=>({...x,quantity:1})):o.kind==='skill-book'?(visit?.skillBook&&!visit.skillBook.identityUncertain?[visit.skillBook]:[]):(visit?.stock??[]).filter(x=>x.kind===o.kind);
  // Positive individual slots only, not a proof of absence or complete inventory. Tea Set has infinite quantity.
  return {check:i+1,passed:candidates.some(x=>x.label===o.label&&x.price===o.price&&x.quantity===o.quantity)};
 });
}
