import React,{useEffect,useState} from 'react';
import {MUSEUM_ITEMS} from '../lib/museum-data';
import {decodeMuseum} from '../lib/museum-progress';
import {readLocal} from '../lib/local';
import CartForecast from './CartForecast';
import {readGeodeSave} from '../lib/save-parser';
import {GEODE_TYPES,predictGeodes,type GeodeInput,type GeodeType} from '../lib/geode-prediction';
const demo:GeodeInput={gameId:'123456789',playerId:'987654321',opened:0,mineLevel:120,legacy:false,qiBeans:false};
const empty:GeodeInput={...demo,gameId:'',playerId:''};
export default function PredictorTool({workspace}:{workspace:boolean}){
 const [route,setRoute]=useState<GeodeType>('Geode'),[input,setInput]=useState(workspace?empty:demo),[result,setResult]=useState<ReturnType<typeof predictGeodes>>([]),[error,setError]=useState('');
 const [ready,setReady]=useState(false), [importing,setImporting]=useState(false), [importStatus,setImportStatus]=useState('');
 async function prefill(file: File) {
  setImporting(true);
  setImportStatus('');
  setResult([]);
  setError('');
  setInput(empty);
  try {
   setInput(await readGeodeSave(file));
   setImportStatus('Main-player fields loaded for this session. Confirm an unmodded PC 1.6.15 save and review the switches before calculating.');
  } catch (e) {
   setError((e as Error).message);
  } finally {
   setImporting(false);
  }
 }
 useEffect(()=>setReady(true),[]);
 const [donated,setDonated]=useState<string[]>([]),[status,setStatus]=useState('');
 const items=MUSEUM_ITEMS.filter(i=>i.sources.includes(route)&&!donated.includes(i.id));
 function change<K extends keyof GeodeInput>(key:K,value:GeodeInput[K]){
  setInput(current=>({...current,[key]:value}));setResult([]);setError('');
 }
 function calculate(){
  try{setResult(predictGeodes(input,route));setError('')}
  catch(e){setResult([]);setError((e as Error).message)}
 }
 async function load(){
  try{const v=await readLocal<unknown>('museum-progress-v1');if(v===undefined)throw Error('Save museum progress first');setDonated(decodeMuseum(v).donated);setStatus('Saved museum donations loaded')}
  catch(e){setStatus(String(e))}
 }
 return <><section className="panel rule-tool">
 <h2>Geode opener · PC 1.6.15 reference</h2>
 <p className="muted">Experimental results for unmodded Clint openings. Compared against the upstream reference algorithm. Independent in-game fixtures are pending. Geode Crushers and other containers are outside this model. <a href="/licenses/mouseypounds.txt">Reference attribution and license</a></p>
 <p>{workspace?'Keep IDs local. In the main save, use uniqueIDForThisGame and the selected farmer’s UniqueMultiplayerID. Enter that farmer’s geodesCracked total and deepest Mines floor.':'This preview uses example IDs. Use the separate private workspace for your own save identifiers.'}</p>
 {workspace&&<label>Prefill from main save (local)<input type="file" disabled={!ready||importing} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void prefill(file)}}/></label>}
 {importStatus&&<p role="status">{importStatus}</p>}
 <fieldset className="formgrid" disabled={importing} aria-label="Geode inputs">
 {workspace&&<><label>Game ID<input inputMode="numeric" maxLength={21} autoComplete="off" value={input.gameId} onChange={e=>change('gameId',e.target.value)}/></label>
 <label>Farmer multiplayer ID<input inputMode="numeric" maxLength={21} autoComplete="off" value={input.playerId} onChange={e=>change('playerId',e.target.value)}/></label></>}
 <label>Geodes previously opened<input type="number" min={0} max={1000000} value={input.opened} onChange={e=>change('opened',e.target.valueAsNumber)}/></label>
 <label>Deepest Mines floor<input type="number" min={0} max={120} value={input.mineLevel} onChange={e=>change('mineLevel',e.target.valueAsNumber)}/></label>
 <label>Container type<select aria-label="Geode container type" value={route} onChange={e=>{setRoute(e.target.value as GeodeType);setResult([]);setError('')}}>{GEODE_TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
 </fieldset>
 <div className="crop-checks"><label><input type="checkbox" checked={input.legacy} onChange={e=>change('legacy',e.target.checked)}/> Legacy randomization enabled</label><label><input type="checkbox" checked={input.qiBeans} onChange={e=>change('qiBeans',e.target.checked)}/> Qi’s Crop quest active</label></div>
 <button className="primary" disabled={!ready||importing} onClick={calculate}>{ready?'Calculate next 20 openings':'Loading calculator…'}</button>
 {error&&<p role="alert" className="error">{error}</p>}
 {result.length>0&&<div className="tablewrap"><table><caption>Alternate outcomes for opening the selected container at each index</caption><thead><tr><th>Opening</th><th>Item</th><th>Quantity</th></tr></thead><tbody>{result.map(r=><tr key={r.opening}><td>{r.opening}</td><td>{r.name}</td><td>{r.quantity}</td></tr>)}</tbody></table></div>}
 <h3>Geode collection planning</h3><p>Find which undonated museum entries have a recorded source in a selected geode or trove. These are possible sources, not probabilities, opening order or guaranteed outcomes.</p>{workspace&&<button onClick={()=>void load()}>Load saved museum donations</button>}<p role="status">{status}</p><div className="metrics"><div className="metric"><small>Undonated matching entries</small><b>{items.length}</b></div></div><div className="rules-grid">{items.map(i=><article className="rule-card" key={i.id}><strong>{i.name}</strong><small>{i.hint}</small></article>)}</div><a href="/museum/">Open museum collection tracker</a></section><CartForecast workspace={workspace}/></>}
