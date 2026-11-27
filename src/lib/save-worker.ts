import {readSave,readGeodeSave,readCartSave} from './save-parser-core';
type Request={operation:'save'|'geode'|'cart';file:File};
const worker=self as unknown as {onmessage:((event:MessageEvent<Request>)=>void)|null;postMessage:(data:unknown)=>void};
worker.onmessage=async({data})=>{
 try{
  const {operation,file}=data;
  if(!(file instanceof File))throw Error('Choose a local save file.');
  const fn=operation==='save'?readSave:operation==='geode'?readGeodeSave:operation==='cart'?readCartSave:null;
  if(!fn)throw Error('Unsupported save operation.');
  worker.postMessage({ok:true,value:await fn(file)});
 }catch(error){
  const message=error instanceof Error?error.message:'Could not inspect this save.';
  const safe=/^(Expected |Choose |DTD |Too many |XML nesting |Save exceeds |File exceeds |Automatic prefill |The required |Cart save |The save does not |Unsupported save operation)/.test(message)?message:'Could not inspect this save.';
  worker.postMessage({ok:false,message:safe});
 }
};
