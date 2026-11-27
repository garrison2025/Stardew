import PlayerObservations from './PlayerObservations';
import {professionNames} from '../lib/save-professions';
import React,{useState} from 'react';
import SaveProgressPanel from './SaveProgressPanel';
import SaveNextActions from './SaveNextActions';
import {supportedVersion,type SaveSnapshot} from '../lib/save-model';
import {ProgressDashboard} from './RuleTools';
import {Checklist} from './Tool';
import WorkspaceFrame from './WorkspaceFrame';
function Metric({name,value}:{name:string;value:React.ReactNode}){return <div className="metric"><small>{name}</small><b>{value}</b></div>}
function SaveInspector(){const [summary,setSummary]=useState<SaveSnapshot|null>(null),[err,setErr]=useState(''),[busy,setBusy]=useState(false);async function parse(file:File){setSummary(null);setBusy(true);try{const {readSave}=await import('../lib/save-parser');setSummary(await readSave(file));setErr('')}catch(e){setErr(String(e))}finally{setBusy(false)}}return <section className="panel"><h2>Local save inspector</h2><p>Read selected calendar, main-farm structure and main-player progress fields. No raw XML is stored or uploaded. Complete collection and perfection status are not inferred.</p><label className="field">Choose main save file<input type="file" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void parse(f);e.target.value=''}}/></label><details><summary>Where to find the save</summary><p>On Windows, open <code>%AppData%\StardewValley\Saves\</code>. On macOS and Linux, open <code>~/.config/StardewValley/Saves/</code>. Choose the main file named like your save folder, with the farmer or farm name followed by a number.</p></details>{busy&&<p role="status">Reading the save on this device…</p>}{err&&<p role="alert" className="error">{err}</p>}{summary&&<><div className="metrics"><Metric name="Reported version" value={summary.version}/><Metric name="XML elements" value={summary.fields}/><Metric name="Game year" value={summary.year??'Unknown'}/><Metric name="Season / day" value={(summary.season??'Unknown')+' / '+(summary.day??'Unknown')}/></div>{summary.progress&&<SaveProgressPanel progress={summary.progress} season={summary.season} fingerprint={summary.fingerprint??null} version={summary.version} farmhands={summary.farmhands}/>}
{summary.farmhands?.map((member,index)=><details className="panel" key={index}>
 <summary>Farmhand {index+1} · observed progress</summary>
 <p className="muted">Player observations from this save. Shared farm counters are shown in the host view.</p>
 <dl className="rules-grid">
  <div><dt>Recognized professions</dt><dd>{member.professions?(professionNames(member.professions).join(', ')||'None recognized'):'Unknown'}</dd></div><div><dt>Recognized fish</dt><dd>{member.collections?.fishing?.done.length??'Unknown'}</dd></div>
  <div><dt>Recognized cooked dishes</dt><dd>{member.collections?.cooking?.done.length??'Unknown'}</dd></div>
  <div><dt>Recognized crafted recipes</dt><dd>{member.crafting?.done.length??'Unknown'}</dd></div>
  <div><dt>Recognized shipped items</dt><dd>{member.collections?.shipping?.done.length??'Unknown'}</dd></div>
 </dl><SaveNextActions progress={member} season={summary.season}/>
 </details>)} {supportedVersion(summary.version)&&summary.farmFound?<><div className="metrics"><Metric name="Farm type ID" value={summary.farmType??'Unknown'}/><Metric name="Farm records" value={summary.records.length}/><Metric name="Recognized object types" value={summary.records.filter(r=>r.itemId).length}/></div><p>Recognition is preliminary; coordinates and footprints are checked separately in the planner.</p><a href="/">Open farm designer and import the same file</a></>:<p>Farm import not supported for this version or structure.</p>}</>}</section>}
export default function TrackerRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><ProgressDashboard workspace={workspace}/>{workspace?<><SaveInspector/><PlayerObservations/></>:<section className="panel"><h2>Save files stay private</h2><p>File inspection is available only on the separate workspace origin when configured. The public preview never accepts game saves.</p></section>}<Checklist slug="tracker" workspace={workspace}/></WorkspaceFrame>}
