import type {SaveSnapshot} from './save-model';
import type {GeodeInput} from './geode-prediction';
import type {CartStart} from './cart-forecast';
import {MAX_SAVE_BYTES} from './save-xml';
export {parseSave} from './save-parser-core';
type Operation='save'|'geode'|'cart';
function inspect<T>(operation:Operation,file:File):Promise<T>{
 if(file.size>MAX_SAVE_BYTES)return Promise.reject(Error('File exceeds 50 MiB limit.'));
 return new Promise((resolve,reject)=>{
  let worker:Worker;
  try{worker=new Worker(new URL('./save-worker.ts',import.meta.url),{type:'module'})}
  catch{reject(Error('Local save worker is unavailable. Try another supported browser.'));return}
  let settled=false;
  const finish=(error?:Error,value?:T)=>{
   if(settled)return;settled=true;clearTimeout(timer);worker.terminate();
   if(error)reject(error);else resolve(value as T);
  };
  const timer=setTimeout(()=>finish(Error('Local save parsing timed out. Try a smaller save.')),20_000);
  worker.onmessage=(event:MessageEvent<{ok:boolean;value?:T;message?:string}>)=>{const data=event.data;if(data?.ok===true)finish(undefined,data.value);else finish(Error(data?.message||'Could not inspect this save.'))};
  worker.onerror=()=>finish(Error('Local save parser failed.'));
  worker.onmessageerror=()=>finish(Error('Local save result could not be read.'));
  try{worker.postMessage({operation,file})}catch{finish(Error('Could not open the local save file.'))}
 });
}
export const readSave=(file:File)=>inspect<SaveSnapshot>('save',file);
export const readGeodeSave=(file:File)=>inspect<GeodeInput>('geode',file);
export const readCartSave=(file:File)=>inspect<CartStart>('cart',file);
