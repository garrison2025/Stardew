import WorkspaceFrame from './WorkspaceFrame';
import PredictorTool from './PredictorTool';
export default function PredictorRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><PredictorTool workspace={workspace}/></WorkspaceFrame>}
