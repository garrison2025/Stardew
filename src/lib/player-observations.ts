import {observationsOf,decodeSaveObservations,type SaveObservations} from './save-observations.ts';
import {CATALOGS,type CatalogKind} from './game-collections.ts';
import {monsterGoalSummary} from './monster-goals.ts';
import {skillTotal,type SaveProgress} from './save-progress.ts';
export const PLAYER_ROSTER_KEY='player-observations-v1';
export type PlayerRecord={role:'host'|'farmhand';observed:SaveObservations;completed:Partial<Record<CatalogKind,string[]>>;knownCrafting?:string[]};
export type PlayerRoster={schema:1;version:string;players:PlayerRecord[]};
const kinds=['shipping','fishing','cooking','crafting'] as const;
function record(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Invalid player record');return v as Record<string,unknown>}
function playerOnly(raw:unknown):SaveObservations{
 const v=decodeSaveObservations(raw);
 // Never use farm-wide observations to calculate a particular player's progress.
 const {storage,bundles,walnutTasks,quests,...rest}=v;
 return {...rest,...(quests&&(quests.achievements||quests.story)?{quests:{...(quests.achievements?{achievements:quests.achievements}:{}),...(quests.story?{story:quests.story}:{})}}:{}),walnutsFound:null,walnutsBalance:null,...(v.milestones?{milestones:{...v.milestones,obelisks:null,clock:null}}:{})};
}
function names(kind:CatalogKind,raw:unknown):string[]{
 const valid=new Set(CATALOGS[kind].map(x=>x.name));
 if(!Array.isArray(raw)||raw.length>valid.size||new Set(raw).size!==raw.length||raw.some(n=>typeof n!=='string'||!valid.has(n)))throw Error('Invalid player collection');
 return [...raw];
}
export function decodePlayerRoster(raw:unknown):PlayerRoster{
 const v=record(raw);
 if(v.schema!==1||typeof v.version!=='string'||!/^1\.6\.\d+(?:\.\d+)?$/.test(v.version)||!Array.isArray(v.players)||v.players.length<1||v.players.length>33)throw Error('Invalid player observations');
 return {schema:1,version:v.version,players:v.players.map((raw,i)=>{
  const r=record(raw),role=i===0?'host':'farmhand';if(r.role!==role)throw Error('Invalid player role order');
  const input=record(r.completed),completed:PlayerRecord['completed']={};
  for(const key of Object.keys(input)){if(!kinds.includes(key as CatalogKind))throw Error('Invalid player collection kind');const k=key as CatalogKind;completed[k]=names(k,input[k])}
  const knownCrafting=r.knownCrafting===undefined?undefined:names('crafting',r.knownCrafting);
  if(knownCrafting&&completed.crafting?.some(n=>!knownCrafting.includes(n)))throw Error('Crafted recipe is not known');
  return {role,observed:playerOnly(r.observed),completed,...(knownCrafting!==undefined?{knownCrafting}:{})};
 })};
}
export function makePlayerRoster(version:string,host:SaveProgress,farmhands:SaveProgress[]):PlayerRoster{
 return decodePlayerRoster({schema:1,version,players:[host,...farmhands].map((p,i)=>{
  const completed:PlayerRecord['completed']={};
  for(const k of ['shipping','fishing','cooking'] as const)if(p.collections?.[k])completed[k]=p.collections[k]!.done;
  if(p.crafting)completed.crafting=p.crafting.done;
  return {role:i===0?'host':'farmhand',observed:observationsOf(p),completed,knownCrafting:p.crafting?.known};
 })});
}
export function playerCounts(p:PlayerRecord){
 const o=p.observed,total=skillTotal(o.xp);
 return {skillLevels:total,masteryXp:o.masteryXp??null,earnings:o.lifetimeEarnings,steps:o.stepsTaken??null,monsters:o.monsterKills?monsterGoalSummary(o.monsterKills).complete:null,friends:o.milestones?.friends??null,stardrops:o.milestones?.stardrops??null,shipping:p.completed.shipping?.length??null,fishing:p.completed.fishing?.length??null,cooking:p.completed.cooking?.length??null,crafting:p.completed.crafting?.length??null};
}
