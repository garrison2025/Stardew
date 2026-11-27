import React,{useEffect,useState} from 'react';
import {CART_SEASONS,forecastCart,type CartStart,type CartSeason} from '../lib/cart-forecast';
import {forecastCartStock} from '../lib/cart-stock';
import {download} from '../lib/local';
import {readCartSave} from '../lib/save-parser';

const example: CartStart = {gameId: '123456789', year: 1, season: 'autumn', day: 1, legacy: false};

export default function CartForecast({workspace}: {workspace: boolean}) {
 const [input,setInput] = useState({...example,gameId:workspace?'':example.gameId});
 const [forecast,setForecast] = useState<ReturnType<typeof forecastCartStock>>([]);
 const [guarantee,setGuarantee]=useState(''),[stockQuery,setStockQuery]=useState('');
 const [error,setError] = useState('');
 const [status,setStatus] = useState('');
 const [busy,setBusy] = useState(false);
 const [ready,setReady] = useState(false);
 useEffect(()=>setReady(true),[]);
 function change(next: Partial<CartStart>) {
  setInput(value=>({...value,...next}));
  setForecast([]);
  setError('');
 }
 async function load(file: File) {
  setBusy(true);setError('');setStatus('');setForecast([]);setInput({...example,gameId:''});
  try {
   setInput(await readCartSave(file));
   setStatus('Save fields loaded for this session. Confirm unmodded PC 1.6.15 before calculating.');
  } catch(err) { setError(String(err)); }
  finally { setBusy(false); }
 }
 function calculate() {
  try { setForecast(forecastCartStock(input,guarantee===''?null:Number(guarantee)));setError(''); }
  catch(err) { setForecast([]);setError(String(err)); }
 }
 return <section className="panel rule-tool" aria-label="Traveling Cart forecast">
  <h2>Traveling Cart · selected offers</h2>
  <p>Preview ten ordinary slots, a furniture slot, seasonal Rare Seed and seven separately seeded offers at Friday and Sunday Forest Cart visits over 28 days. Numerical reference derived from the upstream 1.6 implementation; festival shops, fixed items, skill books, exact save-day offsets and independent game fixtures remain outside this model. <a href="/licenses/mouseypounds.txt">Reference license</a></p>
  {workspace?<label>Prefill cart dates from local save<input type="file" disabled={!ready||busy} onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void load(f)}}/></label>:<p>Using an example game ID. Open the private workspace to enter your own save details.</p>}
  <fieldset className="formgrid" disabled={busy} aria-label="Cart inputs">
   {workspace&&<label>Cart game ID<input inputMode="numeric" maxLength={16} value={input.gameId} onChange={e=>change({gameId:e.target.value})}/></label>}
   <label>Cart year<input type="number" min={1} max={100} value={input.year} onChange={e=>change({year:Number(e.target.value)})}/></label>
   <label>Cart season<select value={input.season} onChange={e=>change({season:e.target.value as CartSeason})}>{CART_SEASONS.map(s=><option key={s}>{s}</option>)}</select></label>
   <label>Cart starting day<input type="number" min={1} max={28} value={input.day} onChange={e=>change({day:Number(e.target.value)})}/></label>
   <label><input type="checkbox" checked={!!input.routeComplete} onChange={e=>change({routeComplete:e.target.checked})}/> Completed the Community Center or Joja development route</label>
   <label><input type="checkbox" checked={input.legacy} onChange={e=>change({legacy:e.target.checked})}/> Cart legacy randomization</label>
   <label>Original Year 1 cabbage guarantee roll (optional, 2–30)<input aria-label="Original cart guarantee roll" type="number" min={2} max={30} value={guarantee} placeholder="Unknown / not active" onChange={e=>{setGuarantee(e.target.value);setForecast([])}}/></label>
  </fieldset>
  <button className="primary" disabled={!ready||busy} onClick={calculate}>Forecast selected cart offers</button>
  {error&&<p role="alert" className="error">{error}</p>}
  {status&&<p role="status">{status}</p>}
  {forecast.length>0&&<div className="tablewrap"><table><thead><tr><th scope="col">Visit</th><th scope="col">Predicted offers in this model</th></tr></thead>
   <tbody>{forecast.map(visit=><tr key={visit.absoluteDay}><th scope="row">{visit.weekday} · {visit.season} {visit.day}, Y{visit.year}</th>
    <td>{visit.offers.length?visit.offers.map(offer=>offer.label+' · '+offer.price.toLocaleString('en-US')+'g').join('; '):'None of the tracked offers predicted'}</td></tr>)}</tbody>
  </table></div>}
 {forecast.length>0&&<details><summary>Ordinary randomized cart stock · 10 slots per visit</summary><p className="muted">Each row is a reference prediction, not verified in-game stock. Unknown guarantee state means furniture and seasonal quantity may differ if an extra cabbage slot consumes RNG. Seven independent offers remain in the table above. Skill books and fixed inventory are excluded.</p><label>Search predicted cart stock<input aria-label="Search predicted cart stock" value={stockQuery} onChange={e=>setStockQuery(e.target.value)} placeholder="e.g. Red Cabbage"/></label><div className="tablewrap"><table aria-label="Ordinary cart stock reference"><thead><tr><th scope="col">Visit</th><th scope="col">Item</th><th scope="col">Slot</th><th scope="col">Qty</th><th scope="col">Unit price</th></tr></thead><tbody>{forecast.flatMap(v=>v.stock.filter(s=>s.label.toLowerCase().includes(stockQuery.trim().toLowerCase())).map((s,i)=><tr key={v.absoluteDay+':'+s.kind+':'+s.id+':'+i}><td>{v.weekday} · {v.season} {v.day}, Y{v.year}</td><th scope="row">{s.label}</th><td>{s.kind}</td><td>{s.quantity}</td><td>{s.price.toLocaleString('en-US')}g</td></tr>))}</tbody></table></div><button onClick={()=>download('cart-reference-stock.json',JSON.stringify({schema:1,guarantee:guarantee===''?'unknown':Number(guarantee),rows:forecast},null,2))}>Export predicted stock</button></details>}
 </section>;
}
