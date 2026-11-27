import WorkspaceFrame from './WorkspaceFrame';
import CollectionTool from './CollectionTool';
import {Checklist} from './Tool';
import type {CatalogKind} from '../lib/game-collections';
export default function CollectionRoute({kind,workspace}:{kind:CatalogKind;workspace:boolean}){return <WorkspaceFrame workspace={workspace}><CollectionTool kind={kind} workspace={workspace}/><details><summary>Legacy custom checklist</summary><Checklist slug={kind} workspace={workspace}/></details></WorkspaceFrame>}
