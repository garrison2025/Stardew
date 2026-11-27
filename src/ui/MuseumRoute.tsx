import WorkspaceFrame from './WorkspaceFrame';
import MuseumTracker from './MuseumTracker';
import {Checklist} from './Tool';
export default function MuseumRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><MuseumTracker workspace={workspace}/><details><summary>Legacy custom museum checklist</summary><Checklist slug="museum" workspace={workspace}/></details></WorkspaceFrame>}
