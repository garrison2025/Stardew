import {decodeMonsterCounts,type MonsterCounts} from './monster-goals.ts';
import {decodeMilestones,type SaveMilestones} from './save-milestones.ts';
import {safeCount,type SaveProgress} from './save-progress.ts';
export const SAVE_OBSERVATIONS_KEY='save-observations-v1';
export type SaveObservations={schema:1;monsterKills?:MonsterCounts;milestones?:SaveMilestones;xp:number[]|null;lifetimeEarnings:number|null;walnutsFound:number|null;walnutsBalance:number|null};
export function decodeSaveObservations(raw:unknown):SaveObservations{
 const v=raw as SaveObservations;if(!v||v.schema!==1)throw Error('No valid observed save record');
 if(v.xp!==null&&(!Array.isArray(v.xp)||v.xp.length!==5||v.xp.some(n=>safeCount(n)===null)))throw Error('Invalid observed skill XP');
 for(const key of ['lifetimeEarnings','walnutsFound','walnutsBalance'] as const){if(v[key]!==null&&safeCount(v[key],key==='lifetimeEarnings'?1e9:130)===null)throw Error('Invalid observed '+key)}
 return {schema:1,...(v.monsterKills!==undefined?{monsterKills:decodeMonsterCounts(v.monsterKills)}:{}),...(v.milestones!==undefined?{milestones:decodeMilestones(v.milestones)}:{}),xp:v.xp===null?null:[...v.xp],lifetimeEarnings:v.lifetimeEarnings,walnutsFound:v.walnutsFound,walnutsBalance:v.walnutsBalance};
}
export function observationsOf(p:SaveProgress):SaveObservations{return decodeSaveObservations({schema:1,...(p.monsterKills?{monsterKills:p.monsterKills}:{}),...(p.milestones?{milestones:p.milestones}:{}),xp:p.xp,lifetimeEarnings:p.lifetimeEarnings,walnutsFound:p.walnutsFound,walnutsBalance:p.walnutsBalance})}
