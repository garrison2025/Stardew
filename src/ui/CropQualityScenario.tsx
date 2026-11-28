import {cropReceivesTiller} from '../lib/crop-growth';
import React,{useState} from 'react';
import {cycles,eligible,rawCropPrice,type SeasonInput} from '../lib/season-crops';
import {expectedCropHarvest,qualityProbabilities,type QualityFertilizer} from '../lib/crop-scenarios';
const money=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+'g';
export default function CropQualityScenario({input}:{input:SeasonInput}){
 const [id,setId]=useState(''),[level,setLevel]=useState(10),[tier,setTier]=useState<QualityFertilizer>(0),[cost,setCost]=useState(0),[includeExtra,setIncludeExtra]=useState(true);
 const crops=eligible(input),crop=crops.find(c=>c.id===id)??crops[0];
 const q=qualityProbabilities(level,tier);
 let result:{harvests:number;normal:number;expected:number;profit:number;units:number}|null=null;
 if(crop&&Number.isInteger(cost)&&cost>=0&&cost<=20000){
  try{
   const cycle=cycles(crop,input.start,input.replant,{...input,quality:0,fertilizer:undefined,growth:input.growth?{...input.growth,fertilizer:'none',cost:0}:undefined}).at(-1);
   if(cycle){const harvests=cycle.days.length,normal=harvests*crop.yield*rawCropPrice(crop.price,0,!!input.tiller&&cropReceivesTiller(crop)),estimate=expectedCropHarvest(crop,level,tier,!!input.tiller&&cropReceivesTiller(crop),{includeExtra}),expected=harvests*estimate.revenue;result={harvests,normal,expected,units:harvests*estimate.expectedUnits,profit:expected-cycle.seeds*crop.seed-cost};}
  }catch{}
 }
 const ranking=crops.flatMap(c=>{try{const cycle=cycles(c,input.start,input.replant,{...input,quality:0,fertilizer:undefined,growth:input.growth?{...input.growth,fertilizer:'none',cost:0}:undefined}).at(-1);if(!cycle||!Number.isInteger(cost)||cost<0||cost>20000)return [];const revenue=cycle.days.length*expectedCropHarvest(c,level,tier,!!input.tiller&&cropReceivesTiller(c),{includeExtra}).revenue;return [{crop:c.name,harvests:cycle.days.length,revenue,profit:revenue-cycle.seeds*c.seed-cost}]}catch{return []}}).sort((a,b)=>b.profit-a.profit);return <details className="panel"><summary>Expected crop quality and fertilizer return</summary><p className="muted">Compare expected raw sale value per tile using farming skill and quality fertilizer. This is a statistical estimate, separate from the guaranteed-yield planner and cash-flow simulation. Growth fertilizer is excluded from this quality-fertilizer scenario; Agriculturist and paddy irrigation still apply if selected.</p>
 <div className="formgrid"><label>Quality comparison crop<select value={crop?.id??''} onChange={e=>setId(e.target.value)}>{crops.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label>Farming level<select value={level} onChange={e=>setLevel(Number(e.target.value))}>{Array.from({length:15},(_,i)=><option key={i}>{i}</option>)}</select></label>
 <label>Quality fertilizer<select value={tier} onChange={e=>setTier(Number(e.target.value) as QualityFertilizer)}><option value={0}>None</option><option value={1}>Basic Fertilizer</option><option value={2}>Quality Fertilizer</option><option value={3}>Deluxe Fertilizer</option></select></label>
 <label>Total fertilizer cost per tile (g)<input type="number" min={0} max={20000} step={1} value={cost} onChange={e=>setCost(Number(e.target.value))}/></label></div>
 <label><input type="checkbox" checked={includeExtra} onChange={e=>setIncludeExtra(e.target.checked)}/> Include expected random extra harvests (not guaranteed)</label>
 <div className="metrics">{Object.entries(q).map(([name,p])=><div className="metric" key={name}><small>{name}</small><b>{(p*100).toFixed(2)}%</b></div>)}</div>
 {result?<div className="metrics"><div className="metric"><small>Harvests</small><b>{result.harvests}</b></div><div className="metric"><small>Guaranteed normal sale revenue</small><b>{money(result.normal)}</b></div><div className="metric"><small>Expected revenue</small><b>{money(result.expected)}</b></div><div className="metric"><small>Expected units / tile</small><b>{result.units.toFixed(2)}</b></div><div className="metric"><small>Expected net / tile</small><b>{money(result.profit)}</b></div></div>:<p>No eligible harvest or invalid fertilizer cost.</p>}
 <h3>Expected profit ranking · all available crops</h3><div className="tablewrap"><table><thead><tr><th>Crop</th><th>Harvests</th><th>Expected revenue / tile</th><th>Expected net / tile</th></tr></thead><tbody>{ranking.map(r=><tr key={r.crop}><th scope="row">{r.crop}</th><td>{r.harvests}</td><td>{money(r.revenue)}</td><td>{money(r.profit)}</td></tr>)}</tbody></table></div><p className="muted">Only the first guaranteed item per harvest receives the quality roll; additional items use normal quality. Optional expected yield includes repeat extra-crop rolls and rice farming-level stack variation. Rare luck doubling, sunflower seeds, wheat hay, giant crops, processing and save-specific RNG are excluded. Fractional units are long-run averages, not actual inventory. Enter the total fertilizer spending yourself. <a href="https://stardewvalleywiki.com/Crops#Crop_Quality" target="_blank" rel="noreferrer">Crop quality reference</a>.</p></details>
}
