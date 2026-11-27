import type {ReactNode} from 'react';
import FarmProfileControls from './FarmProfileControls';
import WorkspaceControls from './WorkspaceControls';
export default function WorkspaceFrame({workspace,children}:{workspace:boolean;children:ReactNode}){return <>{workspace&&<FarmProfileControls/>}{children}{workspace&&<WorkspaceControls/>}</>}
