import React,{useEffect,useState} from 'react';
import type {SaveProgress} from '../lib/save-progress';
import {skillTotal} from '../lib/save-progress';
import {SKILLS,levelAt} from '../lib/game-rules';
import {download,mergeLocalRecords,readLocal} from '../lib/local';
import {decodeFarmBinding,SAVE_FARM_BINDING_KEY} from '../lib/save-farm-binding';
import {guardedSaveMergeUpdates,saveMergeUpdates} from '../lib/save-merge';
export default function SaveProgressPanel({progress,version,fingerprint}:{progress:SaveProgress;version:string;fingerprint:string|null}){
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false),[merged,setMerged]=useState(false);
 const groups=Object.keys(saveMergeUpdates(progress)).length;
 const [binding,setBinding]=useState<'loading'|'new'|'same'|'different'|'missing'|'error'>('loading');
 useEffect(()=>{
  if(!fingerprint){setBinding('missing');return}
  let active=true;
  setBinding('loading');
  void readLocal(SAVE_FARM_BINDING_KEY).then(raw=>{
   if(!active)return;
   setBinding(raw===undefined?'new':decodeFarmBinding(raw).fingerprint===fingerprint?'same':'different');
  }).catch(()=>{if(active)setBinding('error')});
  return()=>{active=false};
 },[fingerprint]);
 const bindingMessage={
  loading:'Checking the workspace’s farm…',
  new:'First identified save in this workspace. Confirm that existing progress belongs to this farm.',
  same:'This save matches the farm linked to this workspace.',
  different:'This save belongs to a different farm. Use a separate browser profile for its progress.',
  missing:'This file has no recognized farm identity. You can inspect its fields and update checklists manually.',
  error:'The local farm binding could not be read.'
 }[binding];
 const canMerge=!!fingerprint&&(binding==='new'||binding==='same')&&groups>0;
 const collections=progress.collections??{};
 const recognized=Object.values(collections).reduce((total,row)=>total+row.done.length,0)+(progress.crafting?.done.length??0);
 const excluded=Object.values(collections).reduce((total,row)=>total+row.unmapped,0)+(progress.crafting?.unmapped??0);
 async function merge(){
  if(!canMerge||!fingerprint||busy||!window.confirm('Merge recognized observations? Existing checklist completions are retained. Continue only if this workspace’s records belong to the selected farm.'))return;
  setBusy(true);setMerged(false);
  try{
   await mergeLocalRecords(guardedSaveMergeUpdates(progress,fingerprint));
   setStatus('Recognized progress merged locally.');setMerged(true);setBinding('same');
   window.dispatchEvent(new Event('field-farm-progress-updated'));
  }catch(error){setStatus('Merge failed; no records changed. '+String(error))}
  finally{setBusy(false)}
 }
 return <section className="panel rule-tool" aria-label="Observed save progress"><h3>Review save import</h3><p><strong>Reported game version {version}</strong> · {recognized} recognized completions · {excluded} unmapped records</p><ul><li><strong>Save observed</strong> · Positive entries recognized in this file.</li><li><strong>Manual checklist</strong> · Previously recorded items are retained.</li><li><strong>Needs review</strong> · Absent or unrecognized fields remain unknown.</li></ul><p className="muted">Structural preview for the reported 1.6.x version. Main player only; absent fields remain unknown. No raw XML or player names stored. These observations are not independently verified game fixtures.</p><div className="metrics">{[['Lifetime earnings',progress.lifetimeEarnings],['Recorded money',progress.money],['Steps taken',progress.stepsTaken?.toLocaleString('en-US')??null],['Lifetime walnuts',progress.walnutsFound],['Wallet walnuts',progress.walnutsBalance],['Total skill level',skillTotal(progress.xp)],['Known cooking keys',progress.learnedCooking],['Recognized crafting recipes',progress.crafting?.known.length],['Recognized crafted items',progress.crafting?.done.length]].map(([name,n])=><div key={String(name)} className="metric"><small>{name}</small><b>{n??'Unknown'}</b></div>)}</div>{progress.xp&&<div className="rules-grid">{SKILLS.map((name,i)=><div className="rule-card" key={name}><strong>{name} · Level {levelAt(progress.xp![i])}</strong><small>{progress.xp![i].toLocaleString()} XP</small></div>)}</div>}{progress.crafting&&<><p>{progress.crafting.unmapped} unrecognized crafting keys excluded. Learned recipe keys do not prove the item was crafted. Save count must be positive.</p> </>}{progress.collections&&<><h3>Recognized collection observations</h3><div className="rules-grid">{Object.entries(progress.collections).map(([kind,obs])=><div className="rule-card" key={kind}><strong>{kind} · {obs.done.length} completed</strong><small>{obs.unmapped} unknown IDs excluded</small><small>{obs.done.join(', ')||'No positive observations'}</small></div>)}</div> </>}<div className="material-planner"><h3>Update your trackers</h3><p>{groups?groups+' local records can be updated in one operation. Known XP and earnings can be loaded into calculators separately; unknown observations remain unknown. Existing completed entries are kept. Use the same farm.':'No recognized collection entries to merge.'}</p><p role="status">{bindingMessage}</p><button className="primary" disabled={busy||!canMerge} onClick={()=>void merge()}>{busy?'Merging…':'Merge all recognized progress'}</button></div>{progress.warnings.map(w=><p className="muted" key={w}>{w}</p>)}<button onClick={()=>download('observed-save-progress.json',JSON.stringify({schema:1,progress},null,2))}>Export observed fields</button><p role="status">{status}</p>{merged&&<a className="tracker-review" href="#collection-overview">Review next collection tasks</a>}</section>
}
