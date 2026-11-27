import React,{useState} from 'react';
import {emptyMonsterCounts,monsterGoalSummary,type MonsterCounts,type MonsterId} from '../lib/monster-goals';
import {readObservedSave} from '../lib/read-observed-save';
import {download} from '../lib/local';
export default function MonsterGoals({workspace,apply}:{workspace:boolean;apply:(n:number)=>void}){
 const [counts,setCounts]=useState<MonsterCounts>(emptyMonsterCounts),[note,setNote]=useState(''),[missing,setMissing]=useState(false),[busy,setBusy]=useState(false);
 const result=monsterGoalSummary(counts);
 async function load(){setBusy(true);try{const obs=await readObservedSave();if(!obs.monsterKills)throw Error('Import and merge a save with recognized monster kill counts first.');setCounts(obs.monsterKills);setNote('Recorded main-player counts loaded; verify with the Guild board.')}catch(e){setNote(String(e))}finally{setBusy(false)}}
 function change(id:MonsterId,value:number){if(Number.isSafeInteger(value)&&value>=0&&value<=1e9){setCounts(old=>({...old,[id]:value}));setNote('Manual scenario; not automatically saved.')}}
 return <details className="panel"><summary>Monster eradication goals · 12 categories</summary><p>Use the Adventurer’s Guild board or load recognized kill counters from your local save. All 12 goals are required for the monster component of perfection.</p>
 {workspace&&<button disabled={busy} onClick={()=>void load()}>Load observed monster kills</button>}
 <div className="metrics"><div className="metric"><small>Complete goals</small><b>{result.complete} / 12</b></div><div className="metric"><small>Remaining kills in reference groups</small><b>{result.remaining.toLocaleString()}</b></div></div>
 <label><input type="checkbox" checked={missing} onChange={e=>setMissing(e.target.checked)}/> Show incomplete goals only</label>
 <div className="rules-grid">{result.rows.filter(g=>!missing||!g.complete).map(g=><article className="rule-card" key={g.id}><h3>{g.name}</h3><label>Recorded kills · {g.name}<input type="number" min={0} max={1e9} step={1} value={g.killed} onChange={e=>change(g.id,Number(e.target.value))}/></label><div className="progress-track" role="progressbar" aria-label={g.name+' goal'} aria-valuemin={0} aria-valuemax={g.target} aria-valuenow={Math.min(g.target,g.killed)}><span style={{width:Math.min(100,g.killed/g.target*100)+'%'}}/></div><strong>{g.complete?'Goal complete':g.remaining+' remaining'}</strong><small>{g.where}</small><small>Reward: {g.reward}</small></article>)}</div>
 <button onClick={()=>{apply(result.complete);setNote('Applied goal count to manual perfection estimate. Save perfection separately if needed.')}}>Apply completed goals to perfection</button>
 <button onClick={()=>download('monster-goals.json',JSON.stringify({schema:1,counts},null,2))}>Export goal counts</button>
 <p role="status">{note}</p><p className="muted">Standard 1.6 reference, not a mod-aware or multiplayer shared total. The raw saved names are matched conservatively; unsupported variants may not be counted. Reference: <a href="https://stardewvalleywiki.com/Adventurer%27s_Guild">Adventurer’s Guild</a> · <a href="/licenses/stardew-checkup.txt">Stardew Checkup attribution</a>. Individual manual kill inputs are session-only; the applied completion count can be saved with perfection.</p></details>
}
