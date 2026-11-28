import {useEffect,useRef,useMemo} from 'react';
import {loadLayoutExample,layoutReferenceSummary,type AnyPresetId} from '../lib/layout-presets';
import {TILE,drawTerrain,drawObjects} from '../lib/map-renderer';
import type {Season} from '../lib/map-model';
export default function LayoutExamplePreview({id,season}:{id:AnyPresetId;season:Season}){
 const ref=useRef<HTMLCanvasElement>(null);
 const example=useMemo(()=>{try{const plan=loadLayoutExample(id,season);const summary=layoutReferenceSummary(plan);const additions=layoutReferenceSummary({...plan,objects:plan.objects.filter(o=>!o.id.startsWith('starter-'))});return {plan,summary,additions}}catch{return null}},[id,season]);
 useEffect(()=>{const canvas=ref.current,c=canvas?.getContext('2d');if(!canvas||!c||!example)return;
  const p=example.plan,scale=Math.min(320/(p.map.w*TILE),224/(p.map.h*TILE));canvas.width=Math.max(1,Math.floor(p.map.w*TILE*scale));canvas.height=Math.max(1,Math.floor(p.map.h*TILE*scale));
  c.setTransform(canvas.width/(p.map.w*TILE),0,0,canvas.height/(p.map.h*TILE),0,0);c.imageSmoothingEnabled=false;drawTerrain(c,p.map,p.season);drawObjects(c,p,new Set(),false,false,null,true);
 },[example]);
 if(!example)return <p role="status">This reference example could not be generated. Your current scene is unchanged.</p>;
 const {plan,summary,additions}=example;
 return <div className="rule-card"><canvas ref={ref} role="img" aria-label="Selected editable layout preview" style={{width:'100%',height:'auto',maxWidth:320,display:'block',margin:'auto',imageRendering:'pixelated',borderRadius:6}}/><p className="map-note">{plan.map.w} × {plan.map.h} tiles · {plan.objects.length} markers</p><p className="map-note">{summary.watered} / {summary.crops} watered crop markers · {summary.protected} / {summary.crops} protected</p><p className="map-note">Added priced buildings: {additions.priced} · {additions.gold.toLocaleString()}g · {additions.unpriced} unpriced. Starter markers excluded; equipment, seeds, upgrades and ownership are not priced.</p><p className="map-note">{Object.entries(additions.materials).map(([name,n])=>n+' '+name).join(' · ')||'No priced building materials'}</p></div>;
}
