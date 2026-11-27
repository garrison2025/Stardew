import WorkspaceFrame from './WorkspaceFrame';
import {SkillsTool} from './RuleTools';
import {Checklist} from './Tool';
export default function SkillsRoute({workspace}:{workspace:boolean}){return <WorkspaceFrame workspace={workspace}><SkillsTool workspace={workspace}/><details><summary>Legacy custom skill checklist</summary><Checklist slug="skills" workspace={workspace}/></details></WorkspaceFrame>}
