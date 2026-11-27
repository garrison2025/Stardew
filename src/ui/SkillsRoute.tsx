import {lazy,Suspense} from 'react';
const PlayerObservations=lazy(()=>import('./PlayerObservations'));
import WorkspaceFrame from './WorkspaceFrame';
import {SkillsTool} from './RuleTools';
import {Checklist} from './Tool';
export default function SkillsRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><SkillsTool workspace={workspace}/>{workspace&&<Suspense fallback={<p>Loading player observations…</p>}><PlayerObservations/></Suspense>}<details><summary>Legacy custom skill checklist</summary><Checklist slug="skills" workspace={workspace}/></details></WorkspaceFrame>}
