import React,{useEffect,useState} from 'react';
import {CART_SEASONS,forecastCart,type CartStart,type CartSeason} from '../lib/cart-forecast';
import {readCartSave} from '../lib/save-parser';

const example: CartStart = {gameId: '123456789', year: 1, season: 'autumn', day: 1, legacy: false};

export default function CartForecast({workspace}: {workspace: boolean}) {
 const [input,setInput] = useState({...example,gameId:workspace?'':example.gameId});
 const [forecast,setForecast] = useState<ReturnType<typeof forecastCart>>([]);
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
  try { setForecast(forecastCart(input));setError(''); }
  catch(err) { setForecast([]);setError(String(err)); }
 }
 return <section className="panel rule-tool" aria-label="Traveling Cart forecast">
  <h2>Traveling Cart · selected offers</h2>
  <p>Preview four seeded offers at the Friday and Sunday Forest Cart over the next 28 days for an unmodded PC 1.6.15 reference. Compares with the upstream algorithm. Daily random stock, furniture, festival shops and other special offers require separate validation. <a href="/licenses/mouseypounds.txt">Reference license</a></p>
  {workspace?<label>Prefill cart dates from local save<input type="file" disabled={!ready||busy} onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void load(f)}}/></label>:<p>Using an example game ID. Open the private workspace to enter your own save details.</p>}
  <fieldset className="formgrid" disabled={busy} aria-label="Cart inputs">
   {workspace&&<label>Cart game ID<input inputMode="numeric" maxLength={16} value={input.gameId} onChange={e=>change({gameId:e.target.value})}/></label>}
   <label>Cart year<input type="number" min={1} max={100} value={input.year} onChange={e=>change({year:Number(e.target.value)})}/></label>
   <label>Cart season<select value={input.season} onChange={e=>change({season:e.target.value as CartSeason})}>{CART_SEASONS.map(s=><option key={s}>{s}</option>)}</select></label>
   <label>Cart starting day<input type="number" min={1} max={28} value={input.day} onChange={e=>change({day:Number(e.target.value)})}/></label>
   <label><input type="checkbox" checked={input.legacy} onChange={e=>change({legacy:e.target.checked})}/> Cart legacy randomization</label>
  </fieldset>
  <button className="primary" disabled={!ready||busy} onClick={calculate}>Forecast selected cart offers</button>
  {error&&<p role="alert" className="error">{error}</p>}
  {status&&<p role="status">{status}</p>}
  {forecast.length>0&&<div className="tablewrap"><table><thead><tr><th scope="col">Visit</th><th scope="col">Predicted offers in this model</th></tr></thead>
   <tbody>{forecast.map(visit=><tr key={visit.absoluteDay}><th scope="row">{visit.weekday} · {visit.season} {visit.day}, Y{visit.year}</th>
    <td>{visit.offers.length?visit.offers.map(offer=>offer.label+' · '+offer.price.toLocaleString('en-US')+'g').join('; '):'None of the four tracked offers predicted'}</td></tr>)}</tbody>
  </table></div>}
 </section>;
}
