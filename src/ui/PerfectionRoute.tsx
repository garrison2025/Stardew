import {lazy,Suspense} from 'react';
const PlayerObservations=lazy(()=>import('./PlayerObservations'));
import WorkspaceFrame from './WorkspaceFrame';
import {PerfectionTool} from './RuleTools';
import {Checklist} from './Tool';
export default function PerfectionRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><PerfectionTool workspace={workspace}/>{workspace&&<Suspense fallback={<p>Loading player observations…</p>}><PlayerObservations/></Suspense>}<details><summary>Legacy custom perfection checklist</summary><Checklist slug="perfection" workspace={workspace}/></details></WorkspaceFrame>}
