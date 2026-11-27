import WorkspaceFrame from './WorkspaceFrame';
import {FairTool} from './RuleTools';
export default function FairRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><FairTool workspace={workspace}/></WorkspaceFrame>}
