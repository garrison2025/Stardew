import WorkspaceFrame from './WorkspaceFrame';
import {FarmCompareTool} from './RuleTools';
export default function FarmCompareRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><FarmCompareTool/></WorkspaceFrame>}
