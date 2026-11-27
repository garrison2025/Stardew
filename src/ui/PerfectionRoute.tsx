import MultiplayerPerfection from './MultiplayerPerfection';
import PlayerObservations from './PlayerObservations';
import WorkspaceFrame from './WorkspaceFrame';
import {PerfectionTool} from './RuleTools';
import {Checklist} from './Tool';
export default function PerfectionRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><PerfectionTool workspace={workspace}/><MultiplayerPerfection workspace={workspace}/>{workspace&&<PlayerObservations/>}<details><summary>Legacy custom perfection checklist</summary><Checklist slug="perfection" workspace={workspace}/></details></WorkspaceFrame>}
