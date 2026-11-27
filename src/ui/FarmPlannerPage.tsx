import {ChangeNotice} from './WorkspaceFrame';
import React,{lazy,Suspense,useState} from 'react';
import MapStudio from './MapStudio';
import FarmProfileControls from './FarmProfileControls';
import WorkspaceControls from './WorkspaceControls';

const ClassicPlanner = lazy(() => import('./ClassicPlanner'));
const IndoorStudio = lazy(() => import('./IndoorStudio'));

export default function FarmPlannerPage({workspace}: {workspace: boolean}) {
 const [tab,setTab] = useState<'scene'|'classic'|'indoor'>('scene');
 const [indoorMounted,setIndoorMounted] = useState(false);
 return <>
  {workspace && <FarmProfileControls/>}
  <div className="planner-switch">
   <button aria-pressed={tab==='scene'} onClick={()=>setTab('scene')}>Scene designer</button>
   <button aria-pressed={tab==='indoor'} onClick={()=>{setIndoorMounted(true);setTab('indoor')}}>Indoor designer</button>
   <button aria-pressed={tab==='classic'} onClick={()=>setTab('classic')}>Classic grid editor</button>
  </div>
  {tab==='classic' && <Suspense fallback={<p role="status">Loading editor…</p>}><ClassicPlanner workspace={workspace}/></Suspense>}
  <div hidden={tab!=='scene'}><MapStudio workspace={workspace}/></div>
  {indoorMounted && <div hidden={tab!=='indoor'}><Suspense fallback={<p role="status">Loading editor…</p>}><IndoorStudio workspace={workspace}/></Suspense></div>}
  {workspace && <><ChangeNotice/><WorkspaceControls/></>}
 </>;
}
