import React,{useEffect,useState} from 'react';
import {MUSEUM_ITEMS} from '../lib/museum-data';
import {decodeMuseum} from '../lib/museum-progress';
import {readLocal} from '../lib/local';
import {GEODE_TYPES,predictGeodes,type GeodeInput,type GeodeType} from '../lib/geode-prediction';
const demo:GeodeInput={gameId:'123456789',playerId:'987654321',opened:0,mineLevel:120,legacy:false,qiBeans:false};
const empty:GeodeInput={...demo,gameId:'',playerId:''};
export default function PredictorTool({workspace}:{workspace:boolean}){
 const [route,setRoute]=useState<GeodeType>('Geode'),[input,setInput]=useState(workspace?empty:demo),[result,setResult]=useState<ReturnType<typeof predictGeodes>>([]),[error,setError]=useState('');
 const [ready,setReady]=useState(false);
 const [observed,setObserved]=useState('');
 const [check,setCheck]=useState<{count:number;matched:number;mismatches:string[]}|null>(null);
 const [checkError,setCheckError]=useState('');
 function clearCheck(){setCheck(null);setCheckError('')}
 function compareOpenings(){
  clearCheck();
  const rows=observed.trim().split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  if(!rows.length||rows.length>20){setCheckError('Enter 1 to 20 observed openings.');return}
  const known=new Map(result.map(row=>[row.opening,row]));
  const seen=new Set<number>();
  const mismatches:string[]=[];
  for(const row of rows){
   const fields=/^(\d+),\s*(.+),\s*(\d+)$/.exec(row);
   const opening=fields?Number(fields[1]):NaN;
   const prediction=known.get(opening);
   const quantity=fields?Number(fields[3]):NaN;
   if(!fields||!prediction||seen.has(opening)||!Number.isSafeInteger(quantity)||quantity<1){
    setCheckError('Use unique opening numbers shown above and the format opening, item, quantity.');return;
   }
   seen.add(opening);
   if(prediction.name.toLowerCase()!==fields[2].trim().toLowerCase()||prediction.quantity!==quantity){
    mismatches.push('Opening '+opening+' predicts '+prediction.name+' × '+prediction.quantity+'.');
   }
  }
  setCheck({count:seen.size,matched:seen.size-mismatches.length,mismatches});
 }
 useEffect(()=>setReady(true),[]);
 const [donated,setDonated]=useState<string[]>([]),[status,setStatus]=useState('');
 const items=MUSEUM_ITEMS.filter(i=>i.sources.includes(route)&&!donated.includes(i.id));
 function change<K extends keyof GeodeInput>(key:K,value:GeodeInput[K]){
  setInput(current=>({...current,[key]:value}));setResult([]);setError('');clearCheck();
 }
 function calculate(){
  clearCheck();
  try{setResult(predictGeodes(input,route));setError('')}
  catch(e){setResult([]);setError((e as Error).message)}
 }
 async function load(){
  try{const v=await readLocal<unknown>('museum-progress-v1');if(v===undefined)throw Error('Save museum progress first');setDonated(decodeMuseum(v).donated);setStatus('Saved museum donations loaded')}
  catch(e){setStatus(String(e))}
 }
 return <section className="panel rule-tool">
 <h2>Geode opener · PC 1.6.15 reference</h2>
 <p className="muted">Experimental results for unmodded Clint openings. Compared against the upstream reference algorithm. Independent in-game fixtures are pending. Geode Crushers and other containers are outside this model. <a href="/licenses/mouseypounds.txt">Reference attribution and license</a></p>
 <p>{workspace?'Keep IDs local. In the main save, use uniqueIDForThisGame and the selected farmer’s UniqueMultiplayerID. Enter that farmer’s geodesCracked total and deepest Mines floor.':'This preview uses example IDs. Use the separate private workspace for your own save identifiers.'}</p>
 <div className="formgrid">
 {workspace&&<><label>Game ID<input inputMode="numeric" maxLength={21} autoComplete="off" value={input.gameId} onChange={e=>change('gameId',e.target.value)}/></label>
 <label>Farmer multiplayer ID<input inputMode="numeric" maxLength={21} autoComplete="off" value={input.playerId} onChange={e=>change('playerId',e.target.value)}/></label></>}
 <label>Geodes previously opened<input type="number" min={0} max={1000000} value={input.opened} onChange={e=>change('opened',e.target.valueAsNumber)}/></label>
 <label>Deepest Mines floor<input type="number" min={0} max={120} value={input.mineLevel} onChange={e=>change('mineLevel',e.target.valueAsNumber)}/></label>
 <label>Container type<select aria-label="Geode container type" value={route} onChange={e=>{setRoute(e.target.value as GeodeType);setResult([]);setError('');clearCheck()}}>{GEODE_TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
 </div>
 <div className="crop-checks"><label><input type="checkbox" checked={input.legacy} onChange={e=>change('legacy',e.target.checked)}/> Legacy randomization enabled</label><label><input type="checkbox" checked={input.qiBeans} onChange={e=>change('qiBeans',e.target.checked)}/> Qi’s Crop quest active</label></div>
 <button className="primary" disabled={!ready} onClick={calculate}>{ready?'Calculate next 20 openings':'Loading calculator…'}</button>
 {error&&<p role="alert" className="error">{error}</p>}
 {result.length>0&&<div className="tablewrap"><table><caption>Alternate outcomes for opening the selected container at each index</caption><thead><tr><th>Opening</th><th>Item</th><th>Quantity</th></tr></thead><tbody>{result.map(r=><tr key={r.opening}><td>{r.opening}</td><td>{r.name}</td><td>{r.quantity}</td></tr>)}</tbody></table></div>}
 {workspace&&result.length>0&&<details className="reference-grid-guide">
  <summary>Compare with your in-game openings</summary>
  <p>Use the actual opening numbers for the current container and game settings. Enter one result per line, for example <code>21, Copper Ore, 3</code>. Comparison runs locally in this tab.</p>
  <label>Observed openings<textarea rows={4} maxLength={4000} value={observed} onChange={event=>{setObserved(event.target.value);clearCheck()}}/></label>
  <button onClick={compareOpenings}>Compare observed openings</button>
  {checkError&&<p role="alert">{checkError}</p>}
  {check&&<div role="status"><p>{check.matched} / {check.count} observed openings matched.</p>{check.mismatches.length>0&&<ul>{check.mismatches.map(row=><li key={row}>{row}</li>)}</ul>}</div>}
 </details>}
 <h3>Geode collection planning</h3><p>Find which undonated museum entries have a recorded source in a selected geode or trove. These are possible sources, not probabilities, opening order or guaranteed outcomes.</p>{workspace&&<button onClick={()=>void load()}>Load saved museum donations</button>}<p role="status">{status}</p><div className="metrics"><div className="metric"><small>Undonated matching entries</small><b>{items.length}</b></div></div><div className="rules-grid">{items.map(i=><article className="rule-card" key={i.id}><strong>{i.name}</strong><small>{i.hint}</small></article>)}</div><a href="/museum/">Open museum collection tracker</a></section>}
