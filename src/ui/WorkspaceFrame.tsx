import {useEffect,useState,type ReactNode} from 'react';
import {subscribeFarmChanges} from '../lib/local';
import FarmProfileControls from './FarmProfileControls';
import WorkspaceControls from './WorkspaceControls';
function ChangeNotice(){const [changed,setChanged]=useState(false);useEffect(()=>subscribeFarmChanges(()=>{setChanged(true);window.dispatchEvent(new Event('field-farm-progress-updated'))}),[]);return changed?<aside className="panel" role="status"><strong>Saved data changed in another tab.</strong><p>Read-only summaries refresh automatically. Editing forms retain unsaved values and reject stale writes where guarded. Export unsaved edits before reloading.</p><button onClick={()=>setChanged(false)}>Dismiss update notice</button></aside>:null}
export default function WorkspaceFrame({workspace,children}:{workspace:boolean;children:ReactNode}){return <>{workspace&&<><FarmProfileControls/><ChangeNotice/></>}{children}{workspace&&<WorkspaceControls/>}</>}
