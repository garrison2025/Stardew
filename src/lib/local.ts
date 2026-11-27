import {activeFarm,farmDatabaseName} from './farm-profiles.ts';
import {SAVE_BINDING_KEY,keepSaveBinding} from './save-binding.ts';
function openDb(name=farmDatabaseName(activeFarm().id)):Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(name,1);r.onupgradeneeded=()=>r.result.createObjectStore('projects');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function readLocal<T>(key:string):Promise<T|undefined>{const db=await openDb();try{return await new Promise((resolve,reject)=>{const r=db.transaction('projects','readonly').objectStore('projects').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}}
export async function writeLocal(key:string,value:unknown){const db=await openDb();try{await new Promise<void>((resolve,reject)=>{const t=db.transaction('projects','readwrite');t.objectStore('projects').put(value,key);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}finally{db.close();}}
export function download(name:string,content:string,type='application/json'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

export async function exportProjects():Promise<Record<string,unknown>>{const db=await openDb();try{return await new Promise((resolve,reject)=>{const out:Record<string,unknown>=Object.create(null);const cursor=db.transaction('projects','readonly').objectStore('projects').openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(!c){resolve(out);return;}out[String(c.key)]=c.value;c.continue();};cursor.onerror=()=>reject(cursor.error);});}finally{db.close();}}
export async function clearProjects(){const db=await openDb();try{await new Promise<void>((resolve,reject)=>{const t=db.transaction('projects','readwrite');t.objectStore('projects').clear();t.oncomplete=()=>resolve();t.onabort=()=>reject(t.error);t.onerror=()=>reject(t.error);});}finally{db.close();}}

// Atomically keep the active project compatible with the crop tool, with compare-and-swap for competing tabs.
export async function writeSceneBook(expected:number|null,value:{revision:number},active:unknown){
 const db=await openDb();try{await new Promise<void>((resolve,reject)=>{const t=db.transaction('projects','readwrite'),store=t.objectStore('projects');let problem:Error|null=null;
 const r=store.get('scene-book-v1');r.onsuccess=()=>{const current=r.result;const match=expected===null?current===undefined:current?.revision===expected;if(!match){problem=Error('Project library changed in another tab. Export your layout, then reload.');t.abort();return}store.put(value,'scene-book-v1');store.put(active,'scene-plan-v2')};
 t.oncomplete=()=>resolve();t.onabort=()=>reject(problem||t.error||Error('Local project write aborted'));t.onerror=()=>reject(t.error||Error('Local project write failed'));
 });}finally{db.close()}
}

// Replace only after full schema validation by caller; a single read-write transaction preserves old data on failure.
export async function restoreProjects(records:Record<string,unknown>){const db=await openDb();try{await new Promise<void>((resolve,reject)=>{const t=db.transaction('projects','readwrite'),store=t.objectStore('projects');const r=store.get('scene-book-v1');r.onsuccess=()=>{const existing=r.result?.revision;const next={...records};const book=next['scene-book-v1'] as {revision:number}|undefined;if(book){const revision=Math.max(Number.isSafeInteger(existing)?existing:0,book.revision)+1;if(!Number.isSafeInteger(revision)){t.abort();return}next['scene-book-v1']={...book,revision}}store.clear();for(const [key,value] of Object.entries(next))store.put(value,key)};t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error||Error('Restore failed'));t.onabort=()=>reject(t.error||Error('Restore aborted'))});}finally{db.close()}}

// Read/validate/merge each independent collection in one transaction; errors leave all existing records unchanged.
export async function mergeLocalRecords(updates: Record<string, (old: unknown) => unknown>, fingerprint: string | null = null) {
 const allowAnonymous = activeFarm().id === 'default';
 const db = await openDb();
 try {
  await new Promise<void>((resolve, reject) => {
   const transaction = db.transaction('projects', 'readwrite'), store = transaction.objectStore('projects');
   let problem: unknown;
   function abort(error: unknown) {
    problem = error;
    transaction.abort();
   }
   const binding = store.get(SAVE_BINDING_KEY);
   binding.onsuccess = () => {
    try {
     const next = keepSaveBinding(binding.result, fingerprint, allowAnonymous);
     if (next) store.put(next, SAVE_BINDING_KEY);
    } catch (error) {
     abort(error);
     return;
    }
    for (const [key, update] of Object.entries(updates)) {
     const record = store.get(key);
     record.onsuccess = () => {
      try { store.put(update(record.result), key); }
      catch (error) { abort(error); }
     };
    }
   };
   transaction.oncomplete = () => resolve();
   transaction.onabort = () => reject(problem || transaction.error || Error('Merge aborted'));
  });
 } finally { db.close(); }
}

// A per-editor baseline, not a shared read cache: unrelated dashboard reads cannot advance it.
export type LocalEditor<T=unknown>={value:T|undefined;save:(next:unknown)=>Promise<void>};
const CONFLICT='Local progress changed in another tab or during import. Export your unsaved changes, then reload before saving.';
function stateToken(value:unknown){return value===undefined?undefined:JSON.stringify(value)}
export async function openLocalEditor<T=unknown>(key:string):Promise<LocalEditor<T>>{
 const name=farmDatabaseName(activeFarm().id),db=await openDb(name);let value:T|undefined;
 try{value=await new Promise<T|undefined>((resolve,reject)=>{const tx=db.transaction('projects','readonly'),r=tx.objectStore('projects').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);tx.onabort=()=>reject(tx.error||Error('Local read aborted'));})}finally{db.close()}
 let expected=stateToken(value),writing=false;
 return {value,async save(next){
  if(writing)throw Error('A local save is already in progress.');
  if(farmDatabaseName(activeFarm().id)!==name)throw Error('Farm profile changed. Export your unsaved changes and reload.');
  const snapshot=structuredClone(next),token=stateToken(snapshot);writing=true;
  try{const db=await openDb(name);try{await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction('projects','readwrite'),store=tx.objectStore('projects'),read=store.get(key);let problem:unknown;
   read.onsuccess=()=>{try{if(stateToken(read.result)!==expected){problem=Error(CONFLICT);tx.abort();return}store.put(snapshot,key)}catch(e){problem=e;tx.abort()}};
   tx.oncomplete=()=>resolve();tx.onabort=()=>reject(problem||tx.error||Error('Local save aborted'));tx.onerror=()=>reject(tx.error||Error('Local save failed'));
  });expected=token;}finally{db.close()}}finally{writing=false}
 }};
}
