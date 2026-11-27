import WorkspaceFrame from './WorkspaceFrame';
import BundleTracker from './BundleTracker';
import {Checklist} from './Tool';
export default function BundleRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><BundleTracker workspace={workspace}/><details><summary>Legacy custom checklist</summary><Checklist slug="bundles" workspace={workspace}/></details></WorkspaceFrame>}
