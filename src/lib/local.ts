const DB='field-and-farm-preview';
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('projects');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
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
