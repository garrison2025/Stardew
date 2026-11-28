import {useMemo,useState} from 'react';
import {FARM_DETAILS} from '../lib/farm-details';
import {FARM_TEMPLATE_LINKS} from '../lib/farm-templates';
import {BUILTIN_FARMS,builtinFarmMap} from '../lib/builtin-farm-preview';
import {restrictionCounts} from '../lib/data-layers';
import {FARMS} from '../lib/game-rules';
import {Stat} from './RuleControls';
const farmReference=(name:string)=>BUILTIN_FARMS.find(v=>v.name===name);
function referencePreview(name:string){
 const ref=farmReference(name);if(!ref)throw Error('Unknown farm reference');
 const m=builtinFarmMap(ref.id),r=m.restrictions!,paths:Record<string,string>={};
 const kind=(i:number)=>r.access[i]!=='C'?'blocked':r.till[i]==='T'?'tillable':r.build[i]==='B'?'buildable':'access';
 for(let y=0;y<m.h;y++){let x=0;while(x<m.w){const k=kind(y*m.w+x);let end=x+1;while(end<m.w&&kind(y*m.w+end)===k)end++;paths[k]=(paths[k]??'')+'M'+x+' '+y+'h'+(end-x)+'v1h-'+(end-x)+'z';x=end}}
 return {w:m.w,h:m.h,paths,id:ref.id,counts:restrictionCounts(r)};
}
const palette={tillable:'#ba945f',buildable:'#84a66b',access:'#c6d1b7',blocked:'#414d50'};
function FarmDetailCard({name}:{name:string}){
 const d=FARM_DETAILS.find(v=>v.name===name)!,m=useMemo(()=>referencePreview(name),[name]),practice=FARM_TEMPLATE_LINKS.find(v=>v.farm===name)!;
 return <article className="rule-card"><h3>{name} Farm</h3>
 <svg role="img" aria-label={name+' terrain restriction reference, not official artwork'} viewBox={'0 0 '+m.w+' '+m.h} width="100%" style={{maxHeight:190,borderRadius:8}}>{Object.entries(m.paths).map(([key,path])=><path key={key} d={path} fill={palette[key as keyof typeof palette]}/>)}</svg>
 <small>{m.w} × {m.h} tiles · {m.counts.tillable.toLocaleString()} base tillable · {m.counts.buildable.toLocaleString()} base buildable</small>
 <p><strong>Best for:</strong> {d.best}</p><p><strong>Advantage:</strong> {d.advantage}</p><p><strong>Trade-off:</strong> {d.limitation}</p><p><strong>Layout idea:</strong> {d.idea}</p>
 <p><a href={'/?landscape='+m.id}>Open {name} farm planner</a> · <a href={'/?landscape='+practice.id}>Practice layout</a></p></article>
}
export function FarmCompareTool(){const [a,setA]=useState(0),[b,setB]=useState(7);const x=FARMS[a],y=FARMS[b];return <section className="panel rule-tool"><h2>Eight farm types compared</h2><div className="formgrid"><label>Farm A<select value={a} onChange={e=>setA(Number(e.target.value))}>{FARMS.map((f,i)=><option value={i} key={f.name}>{f.name}</option>)}</select></label><label>Farm B<select value={b} onChange={e=>setB(Number(e.target.value))}>{FARMS.map((f,i)=><option value={i} key={f.name}>{f.name}</option>)}</select></label></div><div className="metrics"><Stat name="A tillable (Wiki)" value={x.tillable}/><Stat name="B tillable (Wiki)" value={y.tillable}/><Stat name="A minus B" value={x.tillable-y.tillable}/></div>
 <p className="muted">Reference map legend: {Object.entries(palette).map(([name,color])=><span key={name} style={{display:'inline-flex',alignItems:'center',gap:4,marginRight:12}}><span aria-hidden="true" style={{width:12,height:12,background:color,border:'1px solid #5c695e',borderRadius:2}}/>{name}</span>)}</p>
 <div className="rules-grid"><FarmDetailCard name={x.name}/><FarmDetailCard name={y.name}/></div><div className="tablewrap"><table><thead><tr><th>Farm</th><th>Tillable (Wiki)</th><th>Additional buildable (Wiki)</th><th>Characteristics</th></tr></thead><tbody>{FARMS.map(f=><tr key={f.name}><td><strong>{f.name}</strong><div><a className="template-link" href={'/?landscape='+farmReference(f.name)?.id}>Open farm planner</a> · <a href={'/?landscape='+FARM_TEMPLATE_LINKS.find(x=>x.farm===f.name)?.id}>Practice</a></div><div className="progress-track"><span style={{width:f.tillable/3427*100+'%'}}/></div></td><td>{f.tillable}</td><td>{f.buildable}</td><td>{f.note}</td></tr>)}</tbody></table></div><p className="muted">Table: <a href="https://stardewvalleywiki.com/Farm_Maps">Farm Maps</a> reference estimates. Preview cards: pinned <a href="https://github.com/StephenFluin/starplan/tree/7ee52554a2e48f47a9d99e256830d7b1b2e5954f">Starplan</a> base restriction flags, which include different terrain categories and do not subtract buildings or dynamic obstacles. Counts are not interchangeable or exact planting capacity. Diagrams are independent schematic graphics, not original game artwork; game patch and commercial data permission remain unverified.</p><details><summary>All eight farm types: advantages and layout ideas</summary><div className="rules-grid">{FARM_DETAILS.map(f=><FarmDetailCard key={f.name} name={f.name}/>)}</div></details><a href="/">Open farm designer</a></section>}
