import ExtraProcessing from './ExtraProcessing';
import ProtectedCropPlanner from './ProtectedCropPlanner';
import OwnedSeedPlanner from './OwnedSeedPlanner';
import {growthProfile,type GrowthSettings,type GrowthFertilizer} from '../lib/crop-growth';
import CropQualityScenario from './CropQualityScenario';
import React,{useEffect,useState} from 'react';
import {farmMachines} from '../lib/farm-economy';
import {SEASON_CROPS,cropById,type CropSeason} from '../lib/crop-data';
import {cycles,eligible,harvestLabel,plantingHorizon,optimizeSeason,type SeasonInput} from '../lib/season-crops';
import {decodePlan,itemById} from '../lib/map-model';
import {readLocal,download} from '../lib/local';
import FarmEconomy from './FarmEconomy';
const initial:SeasonInput={season:'spring',start:1,plots:20,budget:1000,replant:true,strawberry:false,trellis:false};
const money=(n:number)=>n.toLocaleString('en-US')+'g';
export default function SeasonalCropTool({workspace}:{workspace:boolean}){
 const [input,setInput]=useState(initial),[result,setResult]=useState(()=>optimizeSeason(initial)),[validResult,setValidResult]=useState(true),[error,setError]=useState(''),[status,setStatus]=useState(''),[loading,setLoading]=useState(false),[layout,setLayout]=useState<{total:number;known:number;counts:{name:string;count:number}[];machines:ReturnType<typeof farmMachines>}|null>(null);
 function change<K extends keyof SeasonInput>(key:K,value:SeasonInput[K]){setInput(v=>({...v,[key]:value,...(key==='season'?{fertilizer:undefined}:{})}));setValidResult(false);setError('')}
 function calculate(){try{setResult(optimizeSeason(input));setValidResult(true);setError('')}catch(e){setError(String(e));setValidResult(false)}}
 async function loadLayout(){
  setLoading(true);
  setLayout(null);
  setStatus('');
  try {
   const stored=await readLocal<unknown>('scene-plan-v2');
   if(stored===undefined)throw Error('Save a scene in the private farm designer first.');
   const plan=decodePlan(stored);
   const markers=plan.objects.filter(object=>itemById.get(object.itemId)?.category==='Crops');
   const counts=new Map<string,number>();
   let known=0;
   for(const object of markers){
    if(!object.itemId.startsWith('crop-'))continue;
    const crop=cropById.get(object.itemId.slice(5));
    if(!crop)continue;
    counts.set(crop.name,(counts.get(crop.name)??0)+1);
    known++;
   }
   setLayout({total:markers.length,known,counts:[...counts].map(([name,count])=>({name,count})),machines:farmMachines(plan)});
   setInput(previous=>({...previous,season:plan.season,fertilizer:undefined,plots:Math.min(markers.length,100)}));
   setValidResult(false);
   setStatus(markers.length>100
    ? 'Loaded this farm. The calculator uses 100 of its '+markers.length+' marked crop tiles per scenario.'
    : 'Loaded this farm’s season, marked crop tiles and modeled indoor/outdoor machine counts. Choose the planting day and budget, then optimize.');
   setError('');
  }catch(e){setError(String(e))}finally{setLoading(false)}
 }
 useEffect(()=>{
  if(workspace&&new URLSearchParams(location.search).get('farm')==='saved')void loadLayout();
 },[workspace]);
 const growth=input.growth??{fertilizer:'none',agriculturist:false,irrigated:false,cost:0} satisfies GrowthSettings;
 function changeGrowth<K extends keyof GrowthSettings>(key:K,value:GrowthSettings[K]){change('growth',{...growth,[key]:value})}
 const fertilizedCrop=SEASON_CROPS.find(c=>c.id===input.fertilizer?.cropId);
 const horizon=plantingHorizon(input);
 let ranking:ReturnType<typeof cycles>[number][]=[];try{ranking=eligible(input).flatMap(c=>cycles(c,input.start,input.replant,input).slice(-1)).sort((a,b)=>b.profit-a.profit||a.crop.name.localeCompare(b.crop.name))}catch{}
 return <><section className="panel seasonal-crops"><div className="tool-heading"><span className="studio-symbol" aria-hidden="true">🌱</span><div><h2>Seasonal crop planner</h2><span className="muted">{SEASON_CROPS.length} shop-price reference crops · guaranteed base yield</span></div></div><p className="muted">Plan outdoor plantings with daily watering. Reserve seed and fertilizer costs up front. Harvest counts use guaranteed yield. Quality and accelerated growth are explicit scenario inputs.</p>
 {workspace&&<div className="crop-link-panel"><button disabled={loading} onClick={()=>void loadLayout()}>Load saved farm crop count</button><a href="/">Open farm designer</a>{status&&<p role="status">{status}</p>}{layout&&<><p>{layout.total} crop markers · {layout.known} named · {layout.machines.kegs} modeled kegs · {layout.machines.jars} modeled jars · {layout.machines.dehydrators} modeled dehydrators (room entry / outdoor walking reference). Existing growth stages are not known; this is a new planting scenario, not a harvest prediction.</p>{layout.counts.map(c=><span className="crop-count-tag" key={c.name}>{c.name}: {c.count}</span>)}</>}</div>}
 <div className="journal-crop-workbench"><div className="journal-crop-inputs">
 <div className="crop-season-tabs" role="group" aria-label="Season">{(['spring','summer','autumn','winter'] as CropSeason[]).map(s=><button key={s} aria-pressed={input.season===s} onClick={()=>change('season',s)}>{s}</button>)}</div>
 <div className="formgrid"><label>Planting day<input type="number" min={1} max={28} value={input.start} onChange={e=>change('start',Number(e.target.value))}/></label><label>Planting tiles<input type="number" min={0} max={100} value={input.plots} onChange={e=>change('plots',Number(e.target.value))}/></label><label>Total planting budget (g)<input type="number" min={0} max={20000} value={input.budget} onChange={e=>change('budget',Number(e.target.value))}/></label></div>
 <div className="crop-checks"><label><input type="checkbox" checked={input.replant} onChange={e=>change('replant',e.target.checked)}/> Replant single-harvest crops</label><label><input type="checkbox" checked={input.strawberry} onChange={e=>change('strawberry',e.target.checked)}/> Strawberry seeds available on planting day</label><label><input type="checkbox" checked={input.trellis} onChange={e=>change('trellis',e.target.checked)}/> Include trellis crops (access paths checked separately)</label></div>
 <div className="crop-checks"><label><input type="checkbox" checked={!!input.year2} onChange={e=>change('year2',e.target.checked)}/> Year 2 shop seeds available</label><label><input type="checkbox" checked={!!input.oasis} onChange={e=>change('oasis',e.target.checked)}/> Oasis seeds available</label></div><details><summary>Season, quality and fertilizer assumptions</summary>
 <div className="crop-checks"><label><input type="checkbox" checked={!!input.crossSeason} onChange={e=>change('crossSeason',e.target.checked)}/> Continue compatible crops into the next season</label><label><input type="checkbox" checked={!!input.tiller} onChange={e=>change('tiller',e.target.checked)}/> Apply Tiller to raw crop sales</label></div>
 <div className="formgrid"><label>Assumed harvest quality<select value={input.quality??0} onChange={e=>change('quality',Number(e.target.value) as 0|1|2|3)}><option value="0">Normal</option><option value="1">Silver</option><option value="2">Gold</option><option value="3">Iridium</option></select></label>
 <label>Growth fertilizer<select aria-label="Growth fertilizer" value={growth.fertilizer} onChange={e=>changeGrowth('fertilizer',e.target.value as GrowthFertilizer)}><option value="none">None</option><option value="speed">Speed-Gro (10%)</option><option value="deluxe">Deluxe Speed-Gro (25%)</option><option value="hyper">Hyper Speed-Gro (33%)</option></select></label>
 {growth.fertilizer!=='none'&&<label>Growth fertilizer cost per tile (g)<input type="number" min={0} max={20000} step={1} value={growth.cost} onChange={e=>changeGrowth('cost',Number(e.target.value))}/></label>}
 </div><div className="crop-checks"><label><input type="checkbox" checked={growth.agriculturist} onChange={e=>changeGrowth('agriculturist',e.target.checked)}/> Agriculturist (+10% growth)</label><label><input type="checkbox" checked={growth.irrigated} onChange={e=>changeGrowth('irrigated',e.target.checked)}/> Irrigated rice or taro (+25% growth)</label></div>
 <p className="muted">Irrigation is only applied to rice and taro; choose it only for nearby-water plots. Growth bonuses apply at planting and combine additively. Fertilizer is charged once per planted tile and remains in this same-crop scenario. Regrowth intervals are unchanged. <a href="https://stardewvalleywiki.com/Crop_Growth_Calendars" target="_blank" rel="noreferrer">Growth calendar reference</a>.</p><div className="formgrid">
 <label>Fertilizer scenario crop<select value={input.fertilizer?.cropId??''} onChange={e=>{const crop=cropById.get(e.target.value);change('fertilizer',crop?{cropId:crop.id,growthDays:crop.growth,cost:0}:undefined)}}><option value="">No manual override</option>{eligible(input).map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
 {input.fertilizer&&fertilizedCrop&&<><label>Days to first harvest after fertilizer<input type="number" min={1} max={fertilizedCrop.growth} value={input.fertilizer.growthDays} onChange={e=>input.fertilizer&&change('fertilizer',{...input.fertilizer,growthDays:Number(e.target.value)})}/></label><label>Fertilizer cost per tile (g)<input type="number" min={0} max={20000} value={input.fertilizer.cost} onChange={e=>input.fertilizer&&change('fertilizer',{...input.fertilizer,cost:Number(e.target.value)})}/></label></>}</div>
 <p className="muted">Optional: override the automatic first-harvest duration and fertilizer cost for one crop with an observed value. Other crops keep the automatic settings. Fixed quality is a what-if input applied to every guaranteed harvested unit.</p>
 </details><button className="primary" onClick={calculate}>Optimize planting</button>{error&&<p className="error" role="alert">{error}</p>}{!validResult&&<p className="muted">Settings changed. Recalculate to update the recommendation.</p>}
 </div><div className="journal-crop-results" aria-label="Planting results">
 {!validResult&&<p>Recalculate to see projected profit and harvest dates.</p>}
 {validResult&&<><div className="metrics"><div className="metric"><small>Net profit</small><b>{money(result.profit)}</b></div><div className="metric"><small>Planting cost</small><b>{money(result.spent)}</b></div><div className="metric"><small>Harvest revenue</small><b>{money(result.revenue)}</b></div><div className="metric"><small>Planted tiles</small><b>{result.planted} / {input.plots}</b></div></div><h3>Recommended allocation</h3>{!result.allocation.length&&<p>No profitable supported planting under these constraints.</p>}{result.allocation.map((a,i)=><div key={i} className="crop-allocation"><div><strong>{a.cycle.crop.name}</strong><small>{a.tiles} tiles · {a.cycle.seeds} seed purchases per tile · {money(a.cycle.profit*a.tiles)} net</small></div><div className="crop-days" aria-label={'Harvest days '+a.cycle.days.map(day=>harvestLabel(day,input.season)).join(', ')}>{Array.from({length:horizon},(_,j)=><span key={j} className={a.cycle.days.includes(j+1)?'harvest':j+1<input.start?'past':''} title={harvestLabel(j+1,input.season)}>{j%28+1}</span>)}</div></div>)}<button onClick={()=>download('season-planting-plan.json',JSON.stringify({input,result,model:'outdoor-planting-scenario-v2'}))}>Export planting plan</button></>}
 </div></div>
 <CropQualityScenario input={input}/><ExtraProcessing/>
 <OwnedSeedPlanner season={input.season} start={input.start} plots={input.plots} options={input}/>
 {validResult&&<FarmEconomy key={JSON.stringify(input)} input={input} allocation={result.allocation} workspace={workspace} devices={layout?.machines}/>}<h3 className="crop-ranking-title">Season crop comparison</h3><p className="muted">Per tile, maximum cycles within the selected planning window, before the shared budget constraint. Only selected available crop types are shown. Stock-limited seeds and winter Powdermelon use the separate owned-seed calculator.</p><div className="tablewrap"><table><thead><tr><th>Crop</th><th>Seed</th><th>Growth</th><th>Harvests</th><th>Revenue</th><th>Net / tile</th><th>Net / remaining day</th><th>Planting ROI</th></tr></thead><tbody>{ranking.map(r=><tr key={r.crop.id}><td><span className="crop-color" style={{background:r.crop.color}}/>{r.crop.name}</td><td>{money(r.crop.seed)} / seed<br/><small>{money(r.cost)} total</small></td><td>{(input.fertilizer?.cropId===r.crop.id?input.fertilizer.growthDays:growthProfile(r.crop,input.growth).days)}d{r.crop.regrow?' / '+r.crop.regrow+'d':''}</td><td>{r.days.length}</td><td>{money(r.revenue)}</td><td>{money(r.profit)}</td><td>{(r.profit/(horizon+1-input.start)).toFixed(2)}g</td><td>{r.cost?(100*r.profit/r.cost).toFixed(1)+'%':'N/A'}</td></tr>)}</tbody></table></div>{!ranking.length&&<p className="muted">No supported crops finish in the remaining days.</p>}<details><summary>Calculation assumptions and sources</summary><p>Seed costs are standard listed prices, not current shop inventory. Year 2 and Oasis seeds require explicit opt-in. Sunflower seed returns and random rice yields are excluded. Rice irrigation is an explicit growth setting. Strawberry availability must be confirmed by the user. Potato and other random extra harvests are excluded; blueberry and cranberry guaranteed multiple yields are included. The optimizer is exact for its restricted model: each tile is unused or assigned one crop type and a feasible number of cycles, with total planting spending capped. It does not optimize walking paths, mixed crop rotations, processing or cash flow.</p><p>References: <a href="https://stardewvalleywiki.com/Crops" target="_blank" rel="noreferrer">Crop mechanics</a> · <a href="https://stardewvalleywiki.com/Spring" target="_blank" rel="noreferrer">Spring</a> · <a href="https://stardewvalleywiki.com/Summer" target="_blank" rel="noreferrer">Summer</a> · <a href="https://stardewvalleywiki.com/Fall" target="_blank" rel="noreferrer">Fall</a>. Independently implemented numerical facts; no game assets.</p></details></section><ProtectedCropPlanner/></>
}
