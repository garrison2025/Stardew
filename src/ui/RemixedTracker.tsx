import React,{useEffect,useState} from 'react';
import {ROOMS} from '../lib/bundle-data';
import {decodeRemixed,emptyRemixed,remixedProgress,REMIXED_KEY,type CustomBundle,type CustomSlot,type RemixedState} from '../lib/remixed-bundles';
import {readLocal,writeLocal,download,mergeLocalRecords} from '../lib/local';
import {readSave} from '../lib/save-parser';
import {bindSaveFarm,SAVE_FARM_BINDING_KEY} from '../lib/save-farm-binding';
import {addSavedBundles,type SavedBundleLayout} from '../lib/remixed-bundles';
const slot=():CustomSlot=>({name:'',quantity:1,quality:0,donated:0});
const draft=():CustomBundle=>({id:'',room:'crafts',name:'',needed:1,slots:[slot()]});
export default function RemixedTracker({workspace}:{workspace:boolean}){
 const [state,setState]=useState(emptyRemixed),[form,setForm]=useState(draft),[ready,setReady]=useState(!workspace),[failed,setFailed]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const [savePreview,setSavePreview]=useState<(SavedBundleLayout&{fingerprint:string})|null>(null);
 const [appliedFarm,setAppliedFarm]=useState<string|null>(null);
 async function inspectSave(file:File){
  setBusy(true);setSavePreview(null);setError('');
  try{
   const snapshot=await readSave(file);
   if(!snapshot.farmFingerprint)throw Error('This file has no recognized farm identity.');
   if(!snapshot.bundleLayout?.state.bundles.length)throw Error('No supported bundle definitions found in this save.');
   const bound=await readLocal(SAVE_FARM_BINDING_KEY);
   bindSaveFarm(snapshot.farmFingerprint,bound);
   if(appliedFarm&&appliedFarm!==snapshot.farmFingerprint)throw Error('Save or reload the current bundle draft before inspecting another farm.');
   setSavePreview({...snapshot.bundleLayout,fingerprint:snapshot.farmFingerprint});
  }catch(e){setError(String(e))}
  finally{setBusy(false)}
 }
 function applySavedLayout(){
  if(!savePreview)return;
  try{
   const next=addSavedBundles(state,savePreview.state);
   setState(next);setAppliedFarm(savePreview.fingerprint);setSavePreview(null);
   const added=next.bundles.length-state.bundles.length;
   setMessage(added?added+' save bundle definitions added. Save custom bundles to retain them.':'These definitions are already in the draft. Existing donation entries were retained.');
   setError('');
  }catch(e){setError(String(e))}
 }
 useEffect(()=>{if(!workspace)return;let live=true;readLocal(REMIXED_KEY).then(v=>{if(live&&v!==undefined)setState(decodeRemixed(v))}).catch(e=>{if(live){setFailed(true);setError(String(e))}}).finally(()=>{if(live)setReady(true)});return()=>{live=false}},[workspace]);
 function edit(i:number,v:Partial<CustomSlot>){setForm(b=>({...b,slots:b.slots.map((s,j)=>j===i?{...s,...v}:s)}))}
 function add(){try{const id=form.id||crypto.randomUUID();const next=decodeRemixed({schema:1,bundles:[...state.bundles.filter(b=>b.id!==id),{...form,id}]});setState(next);setForm(draft());setError('');setMessage('Custom bundle updated')}catch(e){setError(String(e))}}
 function update(id:string,i:number,value:number){try{setState(decodeRemixed({schema:1,bundles:state.bundles.map(b=>b.id!==id?b:{...b,slots:b.slots.map((s,j)=>j===i?{...s,donated:value}:s)})}));setError('')}catch(e){setError(String(e))}}
 async function save(){setBusy(true);try{const next=decodeRemixed(state);
 if(appliedFarm)await mergeLocalRecords({[SAVE_FARM_BINDING_KEY]:existing=>bindSaveFarm(appliedFarm,existing),[REMIXED_KEY]:()=>next});
 else await writeLocal(REMIXED_KEY,next);
 setMessage('Custom bundles saved locally')}catch(e){setError(String(e))}finally{setBusy(false)}}
 async function load(file:File){try{if(file.size>256*1024)throw Error('Custom bundle file too large');const next=decodeRemixed(JSON.parse(await file.text()));if(window.confirm('Replace the custom bundle list? Standard bundles are unaffected.')){setState(next);setAppliedFarm(null);setSavePreview(null);setMessage('Custom list imported; save to retain it');setError('')}}catch(e){setError(String(e))}}
 return <details className="fair-optimize"><summary>Remixed bundles · enter your in-game requirements</summary>
 <p>Enter requirements manually or read the definitions stored in your main save in the private workspace. This imports bundle requirements only. Record fulfilled donations yourself.</p>
 {workspace&&<div className="rule-card">
  <label>Community Center save file<input aria-label="Community Center save file" type="file" disabled={!ready||busy||failed} onChange={e=>{const file=e.target.files?.[0];if(file)void inspectSave(file);e.target.value=''}}/></label>
  {savePreview&&<><p>{savePreview.state.bundles.length} bundle definitions found · {savePreview.excluded} unsupported rows skipped.</p>
   <p>{savePreview.state.bundles.slice(0,8).map(b=>b.name).join(' · ')}</p>
   <button type="button" onClick={applySavedLayout}>Add save bundle requirements</button><button type="button" onClick={()=>setSavePreview(null)}>Cancel preview</button></>}
 </div>}<p><strong>{state.bundles.filter(b=>remixedProgress(b).done).length} / {state.bundles.length}</strong> custom bundles recorded complete</p>
 {state.bundles.map(b=><article className="rule-card" key={b.id}><h3>{b.name} · {remixedProgress(b).filled} / {b.needed}</h3><p>{ROOMS.find(r=>r.id===b.room)?.name} · {remixedProgress(b).done?'Complete':remixedProgress(b).remaining+' more slots needed'}</p>{b.slots.map((s,i)=><label key={i}>{s.name} · {s.quantity} · {['Any','Silver+','Gold+','Iridium'][s.quality]}<input aria-label={'Custom donation '+b.name+' '+(i+1)} type="number" min={0} max={s.quantity} disabled={!ready||busy} value={s.donated} onChange={e=>update(b.id,i,Number(e.target.value))}/></label>)}<div className="toolbar"><button disabled={!ready||busy} onClick={()=>setForm({...b,slots:b.slots.map(s=>({...s}))})}>Edit {b.name}</button><button disabled={!ready||busy} onClick={()=>{if(window.confirm('Remove custom bundle '+b.name+'?'))setState(v=>({...v,bundles:v.bundles.filter(x=>x.id!==b.id)}))}}>Remove {b.name}</button></div></article>)}
 <div className="rule-card"><h3>{form.id?'Edit custom bundle':'Create a custom bundle'}</h3><label>Room<select value={form.room} onChange={e=>setForm(v=>({...v,room:e.target.value}))}>{ROOMS.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label>Custom bundle name<input aria-label="Custom bundle name" maxLength={100} value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label><label>Required slots<input aria-label="Custom required slots" type="number" min={1} max={form.slots.length} value={form.needed} onChange={e=>setForm(v=>({...v,needed:Number(e.target.value)}))}/></label>{form.slots.map((s,i)=><div className="formgrid" key={i}><label>Slot {i+1} name<input aria-label={'Custom slot '+(i+1)+' name'} maxLength={100} value={s.name} onChange={e=>edit(i,{name:e.target.value,donated:0})}/></label><label>Required quantity<input aria-label={'Custom slot '+(i+1)+' quantity'} type="number" min={1} max={1000000} value={s.quantity} onChange={e=>edit(i,{quantity:Number(e.target.value),donated:0})}/></label><label>Quality<select value={s.quality} onChange={e=>edit(i,{quality:Number(e.target.value) as CustomSlot['quality'],donated:0})}>{['Any','Silver+','Gold+','Iridium'].map((q,n)=><option key={q} value={n}>{q}</option>)}</select></label><button disabled={form.slots.length<=1} onClick={()=>setForm(v=>({...v,slots:v.slots.filter((_,j)=>j!==i),needed:Math.min(v.needed,v.slots.length-1)}))}>Remove slot {i+1}</button></div>)}<div className="toolbar"><button disabled={form.slots.length>=12} onClick={()=>setForm(v=>({...v,slots:[...v.slots,slot()]}))}>Add custom slot</button><button className="primary" disabled={!ready||busy} onClick={add}>Save custom bundle to list</button><button onClick={()=>setForm(draft())}>Cancel edit</button></div></div><div className="toolbar"><button onClick={()=>download('remixed-bundles.json',JSON.stringify(state))}>Export custom bundles</button>{workspace&&<><button disabled={!ready||busy||failed} onClick={()=>void save()}>Save custom bundles locally</button><label>Import custom bundles<input type="file" accept=".json" disabled={!ready||busy} onChange={e=>{const file=e.target.files?.[0];if(file)void load(file);e.target.value=''}}/></label></>}</div><p role="status">{message}</p>{error&&<p role="alert" className="error">{error}</p>}</details>
}
