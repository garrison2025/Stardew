import {useEffect,useState} from 'react';
import MonsterGoals from './MonsterGoals';
import {PERFECTION,perfection,perfectionRange,perfectionDisplay,perfectionDisplayRange} from '../lib/game-rules';
import {download} from '../lib/local';
import {Num,Stat,useSaved} from './RuleControls';
export function PerfectionTool({workspace}:{workspace:boolean}){const p=useSaved('perfection-v1',{values:{} as Record<string,number>,waivers:0},workspace,v=>{const x=v as {values:Record<string,number>;waivers:number};if(!x?.values||typeof x.values!=='object')throw Error('Invalid perfection progress');perfection(x.values,x.waivers);return x}),[info,setInfo]=useState(''),[collectionCounts,setCollectionCounts]=useState<Record<string,number>>({});
 async function sync(){
  const {out,notes}=await (await import('../lib/private-saved-counts')).savedCounts();
  setCollectionCounts(Object.fromEntries(PERFECTION.filter(x=>out[x.id]!==undefined).map(x=>[x.id,Math.min(x.max,out[x.id])])));
  setInfo(notes.length?'Some collection records could not be loaded. '+notes.join(' · '):'Local collection counts update this estimate automatically.');
 }
 useEffect(()=>{
  if(!workspace)return;
  const update=()=>void sync();
  update();
  window.addEventListener('field-farm-progress-updated',update);
  return()=>window.removeEventListener('field-farm-progress-updated',update);
 },[workspace]);
 const values={...collectionCounts,...p.value.values};
 const exact={...Object.fromEntries(PERFECTION.filter(x=>collectionCounts[x.id]===x.max).map(x=>[x.id,x.max])),...p.value.values};
 const r=perfection(values,p.value.waivers);
 const upper=perfectionRange(exact,p.value.waivers).upper;
 const displayLower=perfectionDisplay(values,p.value.waivers),displayUpper=perfectionDisplayRange(exact,p.value.waivers).upper;
 const unknown=PERFECTION.filter(x=>values[x.id]===undefined).map(x=>x.id);
 return <section className="panel rule-tool"><h2>Perfection progress calculator</h2><div className="metrics"><Stat name="Estimated perfection" value={r.score===upper?r.score.toFixed(2)+'%':r.score.toFixed(2)+'–'+upper.toFixed(2)+'%'}/><Stat name="Game-style whole percent" value={displayLower===displayUpper?displayLower+'%':displayLower+'–'+displayUpper+'%'}/><Stat name="Base completion" value={r.base.toFixed(2)+'%'}/><Stat name="Waiver cost" value={r.waiverCost.toLocaleString()+'g'}/></div><div className="progress-track"><span style={{width:r.score+'%'}}/></div>{workspace&&<button disabled={!p.ready||p.busy} onClick={()=>void sync()}>Load saved collection counts</button>}<p className="muted">{info}</p><div className="rules-grid">{r.parts.map(x=><article className="rule-card" key={x.id}><h3>{x.name}</h3><small>{unknown.includes(x.id)?'Unknown · enter an observed count':Object.hasOwn(p.value.values,x.id)?'Manual count':'Local tracker · minimum confirmed count'}</small><Num name={x.name+' completed'} value={x.n} max={x.max} set={n=>p.setValue(v=>({...v,values:{...v.values,[x.id]:n}}))}/><small>{unknown.includes(x.id)?'Unknown':x.score.toFixed(2)} / {x.weight}% · {x.all?'All or nothing':'Proportional'} · target {x.max}</small><button disabled={!Object.hasOwn(p.value.values,x.id)} onClick={()=>p.setValue(v=>({...v,values:Object.fromEntries(Object.entries(v.values).filter(([id])=>id!==x.id))}))}>Clear manual {x.name} count</button></article>)}</div><MonsterGoals workspace={workspace} apply={n=>p.setValue(v=>({...v,values:{...v.values,monsters:n}}))}/><Num name="Perfection waivers" value={p.value.waivers} max={100} set={n=>p.setValue(v=>({...v,waivers:n}))}/><p className="muted">Range includes untracked progress. Imported and local tracker counts are minimums, unless a category is complete. Manual counts override them for this estimate. The whole-percent reference display rounds down, while the decimal estimate remains available. Actual game float arithmetic, save completeness and version-specific exceptions are not independently verified. See the separate multiplayer calculator for highest-player estimates. Skill field uses half of total skill levels, rounded down. Imported partial crafting counts can be adjusted manually. Source: <a href="https://stardewvalleywiki.com/Perfection">Perfection</a>.</p><button onClick={()=>download('perfection.json',JSON.stringify(p.value))}>Export perfection</button>{workspace&&<button disabled={!p.ready||p.busy||p.failed} onClick={()=>void p.save()}>Save perfection</button>}<p role="status">{p.message}</p></section>}
