import {REFERENCE_PACK_ID,decodeReferenceBinding} from './reference-pack.ts';
import {decodePlan,type Plan} from './map-model.ts';
export const BOOK_KEY='scene-book-v1';
export const MAX_PROJECTS=10,MAX_VERSIONS=5;
export type Version={at:string;plan:Plan;referencePack?:string};
export type Project={id:string;name:string;versions:Version[]};
export type SceneBook={schema:1;revision:number;active:string;projects:Project[]};
function nameOf(s:string){const n=s.trim();if(!n||n.length>80)throw Error('Project name must be 1–80 characters.');return n}
export function makeBook(plan:Plan,at:string):SceneBook{return {schema:1,revision:0,active:'first',projects:[{id:'first',name:'My farm',versions:[{at,plan,referencePack:REFERENCE_PACK_ID}]}]}}
export function activeProject(book:SceneBook){const p=book.projects.find(p=>p.id===book.active);if(!p)throw Error('Missing active project');return p}
export function latestPlan(book:SceneBook){return activeProject(book).versions[0].plan}
export function decodeBook(value:unknown):SceneBook{
 const v=value as SceneBook;if(!v||v.schema!==1||!Number.isSafeInteger(v.revision)||v.revision<0||typeof v.active!=='string'||!Array.isArray(v.projects)||!v.projects.length||v.projects.length>MAX_PROJECTS)throw Error('Invalid scene project library');
 const ids=new Set<string>();const projects=v.projects.map(p=>{if(!p||typeof p.id!=='string'||!p.id||p.id.length>80||ids.has(p.id)||typeof p.name!=='string'||!Array.isArray(p.versions)||!p.versions.length||p.versions.length>MAX_VERSIONS)throw Error('Invalid project record');ids.add(p.id);return {id:p.id,name:nameOf(p.name),versions:p.versions.map(r=>{if(!r||typeof r.at!=='string'||!Number.isFinite(Date.parse(r.at)))throw Error('Invalid version date');const binding=decodeReferenceBinding(r.referencePack);return {at:r.at,plan:decodePlan(r.plan),...(binding?{referencePack:binding}:{})}})}});
 if(!ids.has(v.active))throw Error('Invalid active project');return {schema:1,revision:v.revision,active:v.active,projects}
}
export function checkpoint(book:SceneBook,plan:Plan,at:string):SceneBook{
 const p=activeProject(book);if(JSON.stringify(p.versions[0].plan)===JSON.stringify(plan))return book;
 return {...book,projects:book.projects.map(v=>v.id===p.id?{...v,versions:[{at,plan,referencePack:REFERENCE_PACK_ID},...v.versions].slice(0,MAX_VERSIONS)}:v)}
}
export function addProject(book:SceneBook,id:string,name:string,plan:Plan,at:string):SceneBook{
 if(book.projects.length>=MAX_PROJECTS)throw Error('Project limit: 10.');if(!id||id.length>80||book.projects.some(p=>p.id===id))throw Error('Duplicate or invalid project ID');
 return {...book,active:id,projects:[...book.projects,{id,name:nameOf(name),versions:[{at,plan,referencePack:REFERENCE_PACK_ID}]}]}
}
export function switchProject(book:SceneBook,id:string):SceneBook{if(!book.projects.some(p=>p.id===id))throw Error('Project not found');return {...book,active:id}}
export function removeProject(book:SceneBook,id:string):SceneBook{if(id===book.active)throw Error('Switch projects before deleting the active project.');return {...book,projects:book.projects.filter(p=>p.id!==id)}}
export function renameProject(book:SceneBook,name:string):SceneBook{return {...book,projects:book.projects.map(p=>p.id===book.active?{...p,name:nameOf(name)}:p)}}
