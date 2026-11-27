import WorkspaceFrame from './WorkspaceFrame';
import WalnutTracker from './WalnutTracker';
import {Checklist} from './Tool';
export default function WalnutRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><WalnutTracker workspace={workspace}/><details><summary>Legacy custom walnut checklist</summary><Checklist slug="golden-walnuts" workspace={workspace}/></details></WorkspaceFrame>}
