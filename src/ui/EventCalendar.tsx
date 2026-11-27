import React,{useState} from 'react';
import {CART_SEASONS,type CartSeason} from '../lib/cart-forecast';
import {forecastCalendar,greenRainDay,trainClock,type CalendarInput} from '../lib/event-calendar';
import {download} from '../lib/local';
const example:CalendarInput={gameId:'123456789',year:1,season:'summer',day:1,legacy:false,greenhouse:false};
export default function EventCalendar({workspace}:{workspace:boolean}){
 const [input,setInput]=useState<CalendarInput>(workspace?{...example,gameId:''}:example);
 const [result,setResult]=useState<ReturnType<typeof forecastCalendar>|null>(workspace?null:forecastCalendar(example));
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[filter,setFilter]=useState<'all'|'events'>('all');
 function change<K extends keyof CalendarInput>(key:K,value:CalendarInput[K]){setInput(old=>({...old,[key]:value}));setResult(null);setError('');setStatus('')}
 function calculate(){try{setResult(forecastCalendar(input));setError('')}catch(e){setResult(null);setError(String(e))}}
 async function prefill(file:File){setBusy(true);setResult(null);setError('');setStatus('');try{const x=await (await import('../lib/save-parser')).readCartSave(file);setInput({...x,greenhouse:false});setStatus('Date, game ID and legacy RNG loaded from the main save. Confirm greenhouse repair manually.')}catch(e){setError(String(e))}finally{setBusy(false)}}
 const rows=result?.filter(d=>filter==='all'||d.trainTime!==null||d.greenRain||d.overnight!==null||d.windstormRoll)??[];
 return <section className="panel rule-tool" aria-label="Seeded event calendar">
 <h2>Train, green rain and overnight event calendar</h2>
 <p className="muted">PC 1.6.15 reference · 28 consecutive days. Seeded event candidates, not guaranteed farm outcomes. {workspace?'Enter your own game ID or prefill locally.':'This public preview uses a fixed example seed; use the private workspace for personal saves.'}</p>
 {workspace&&<label>Prefill calendar from main save<input type="file" disabled={busy} onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void prefill(f)}}/></label>}
 {status&&<p role="status">{status}</p>}
 <fieldset className="formgrid" aria-label="Event calendar inputs" disabled={busy}>
 {workspace&&<label>Calendar game ID<input inputMode="numeric" autoComplete="off" maxLength={16} value={input.gameId} onChange={e=>change('gameId',e.target.value)}/></label>}
 <label>Calendar year<input type="number" min={1} max={100} value={input.year} onChange={e=>change('year',Number(e.target.value))}/></label>
 <label>Calendar season<select value={input.season} onChange={e=>change('season',e.target.value as CartSeason)}>{CART_SEASONS.map(s=><option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}</select></label>
 <label>Calendar start day<input type="number" min={1} max={28} value={input.day} onChange={e=>change('day',Number(e.target.value))}/></label>
 </fieldset>
 <div className="crop-checks"><label><input type="checkbox" checked={input.legacy} disabled={busy} onChange={e=>change('legacy',e.target.checked)}/> Legacy calendar RNG</label><label><input type="checkbox" checked={input.greenhouse} disabled={busy} onChange={e=>change('greenhouse',e.target.checked)}/> Greenhouse repaired</label></div>
 <button className="primary" disabled={busy} onClick={calculate}>Calculate next 28 days</button>
 {error&&<p role="alert" className="error">{error}</p>}
 {result&&<><div className="metrics">
 <div className="metric"><small>Train candidates</small><b>{result.filter(d=>d.trainTime!==null).length}</b></div>
 <div className="metric"><small>Summer green rain · year {input.year}</small><b>Day {greenRainDay(input.gameId,input.year,input.legacy)}</b></div>
 <div className="metric"><small>Overnight event candidates</small><b>{result.filter(d=>d.overnight!==null).length}</b></div>
 </div>
 <label>Calendar rows<select value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="all">All 28 days</option><option value="events">Event candidates only</option></select></label>
 <div className="tablewrap"><table><caption>Daytime train and green rain; overnight event is for the night after the listed date</caption><thead><tr><th scope="col">Date</th><th scope="col">Railroad</th><th scope="col">Green rain</th><th scope="col">Overnight candidate</th><th scope="col">Windstorm roll</th></tr></thead><tbody>{rows.map(d=><tr key={d.absoluteDay}><th scope="row">Y{d.year} {d.season} {d.day}</th><td>{d.trainTime!==null?trainClock(d.trainTime):d.railroadUnlocked?'—':'Locked'}</td><td>{d.greenRain?'Green rain':'—'}</td><td>{d.overnight??'—'}</td><td>{d.windstormRoll?(input.greenhouse?'Possible':'If repaired'):'—'}</td></tr>)}</tbody></table></div>
 {!rows.length&&<p>No event candidates in this window.</p>}
 <button onClick={()=>download('event-calendar.json',JSON.stringify({schema:1,reference:'PC 1.6.15',year:input.year,season:input.season,day:input.day,legacy:input.legacy,greenhouse:input.greenhouse,rows:result},null,2))}>Export calendar (without game ID)</button></>}
 <details><summary>Prediction assumptions</summary><p>Train times can be suppressed on the first day after loading or reloading a save; train cargo is not predicted. The green rain date is for the selected game year, not a full weather forecast. Overnight results follow a fixed baseline and assume the greenhouse status is constant during the window. Fairy Rose effects, unsuitable placement, previous capsule or windstorm events, other scripted events, mods and multiplayer day-offset anomalies can change actual results. No claim of independently verified in-game accuracy.</p></details>
 <p className="muted">Reference: <a href="/licenses/mouseypounds.txt">upstream algorithm attribution</a> · <a href="https://stardewvalleywiki.com/Railroad">Railroad</a> · <a href="https://stardewvalleywiki.com/Weather">Weather</a> · <a href="https://stardewvalleywiki.com/Random_Events">Random events</a>.</p>
 </section>
}
