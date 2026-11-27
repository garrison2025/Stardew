import React,{useState} from 'react';
import {cycles,eligible,rawCropPrice,type SeasonInput} from '../lib/season-crops';
import {expectedHarvestPrice,qualityProbabilities,type QualityFertilizer} from '../lib/crop-scenarios';
const money=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+'g';
export default function CropQualityScenario({input}:{input:SeasonInput}){
 const [id,setId]=useState(''),[level,setLevel]=useState(10),[tier,setTier]=useState<QualityFertilizer>(0),[cost,setCost]=useState(0);
 const crops=eligible(input),crop=crops.find(c=>c.id===id)??crops[0];
 const q=qualityProbabilities(level,tier);
 let result:{harvests:number;normal:number;expected:number;profit:number}|null=null;
 if(crop&&Number.isInteger(cost)&&cost>=0&&cost<=20000){
  try{
   const cycle=cycles(crop,input.start,input.replant,{...input,quality:0,fertilizer:undefined}).at(-1);
   if(cycle){const harvests=cycle.days.length,normal=harvests*crop.yield*rawCropPrice(crop.price,0,input.tiller),expected=harvests*expectedHarvestPrice(crop.price,crop.yield,level,tier,input.tiller);result={harvests,normal,expected,profit:expected-cycle.seeds*crop.seed-cost};}
  }catch{}
 }
 return <details className="panel"><summary>Expected crop quality and fertilizer return</summary><p className="muted">Compare expected raw sale value per tile using farming skill and quality fertilizer. This is a statistical estimate, separate from the guaranteed-yield planner and cash-flow simulation. Growth speed is unchanged.</p>
 <div className="formgrid"><label>Quality comparison crop<select value={crop?.id??''} onChange={e=>setId(e.target.value)}>{crops.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label>Farming level<select value={level} onChange={e=>setLevel(Number(e.target.value))}>{Array.from({length:15},(_,i)=><option key={i}>{i}</option>)}</select></label>
 <label>Quality fertilizer<select value={tier} onChange={e=>setTier(Number(e.target.value) as QualityFertilizer)}><option value={0}>None</option><option value={1}>Basic Fertilizer</option><option value={2}>Quality Fertilizer</option><option value={3}>Deluxe Fertilizer</option></select></label>
 <label>Total fertilizer cost per tile (g)<input type="number" min={0} max={20000} step={1} value={cost} onChange={e=>setCost(Number(e.target.value))}/></label></div>
 <div className="metrics">{Object.entries(q).map(([name,p])=><div className="metric" key={name}><small>{name}</small><b>{(p*100).toFixed(2)}%</b></div>)}</div>
 {result?<div className="metrics"><div className="metric"><small>Harvests</small><b>{result.harvests}</b></div><div className="metric"><small>Normal sale revenue</small><b>{money(result.normal)}</b></div><div className="metric"><small>Expected revenue</small><b>{money(result.expected)}</b></div><div className="metric"><small>Expected net / tile</small><b>{money(result.profit)}</b></div></div>:<p>No eligible harvest or invalid fertilizer cost.</p>}
 <p className="muted">Only the first guaranteed item per harvest receives the quality roll; additional items use normal quality. Random extra yields, processing, fertilizer replacement, and game-save-specific effects are excluded. Enter the total fertilizer spending yourself. <a href="https://stardewvalleywiki.com/Crops#Crop_Quality" target="_blank" rel="noreferrer">Crop quality reference</a>.</p></details>
}
