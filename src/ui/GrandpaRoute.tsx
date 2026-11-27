import WorkspaceFrame from './WorkspaceFrame';
import {GrandpaTool} from './RuleTools';
export default function GrandpaRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><GrandpaTool workspace={workspace}/></WorkspaceFrame>}
