import {PERFECTION,perfection,perfectionDisplay} from './game-rules.ts';
import {decodePlayerRoster,playerCounts} from './player-observations.ts';
import {decodeSaveObservations} from './save-observations.ts';
export const SHARED_GOALS=['obelisks','clock','walnuts'] as const;
export const PLAYER_GOALS=PERFECTION.filter(p=>!SHARED_GOALS.some(k=>k===p.id));
type Counts=Record<string,number>;
export type TeamScenario={shared:Counts;players:Counts[];waivers:number};
function valid(counts:Counts,ids:readonly string[]){if(!counts||typeof counts!=='object'||Array.isArray(counts))throw Error('Invalid goal record');for(const [id,n] of Object.entries(counts)){const goal=PERFECTION.find(p=>p.id===id);if(!ids.includes(id)||!goal||!Number.isSafeInteger(n)||n<0||n>goal.max)throw Error('Invalid count for '+id)}}
export function teamPerfection(s:TeamScenario,minimumOnly=false){
 if(!Array.isArray(s.players)||s.players.length<1||s.players.length>33)throw Error('One to 33 observed players required');
 valid(s.shared,SHARED_GOALS);for(const p of s.players)valid(p,PLAYER_GOALS.map(g=>g.id));
 const low:Counts={},high:Counts={},winners:Record<string,number[]>= {};
 for(const goal of PERFECTION){
  const shared=SHARED_GOALS.some(id=>id===goal.id),rows=shared?[s.shared]:s.players;
  const known=rows.flatMap((row,i)=>Object.hasOwn(row,goal.id)?[{i,n:row[goal.id]}]:[]);
  const best=Math.max(0,...known.map(x=>x.n));
  low[goal.id]=best;high[goal.id]=best===goal.max||(!minimumOnly&&known.length===rows.length)?best:goal.max;
  winners[goal.id]=shared?[]:known.filter(x=>x.n===best).map(x=>x.i);
 }
 const lower=perfection(low,s.waivers),upper=perfection(high,s.waivers);
 return {lower:lower.score,upper:upper.score,displayLower:perfectionDisplay(low,s.waivers),displayUpper:perfectionDisplay(high,s.waivers),baseLower:lower.base,baseUpper:upper.base,parts:lower.parts.map((p,i)=>({...p,upperCount:high[p.id],upperScore:upper.parts[i].score,players:winners[p.id],shared:SHARED_GOALS.some(id=>id===p.id)}))};
}
export function observedTeamScenario(roster:unknown,sharedObservation:unknown):TeamScenario{
 const r=decodePlayerRoster(roster),o=decodeSaveObservations(sharedObservation);
 // A roster and shared observations are read from the same IndexedDB snapshot. Positive recognized counts remain minima.
 const shared:Counts={};for(const k of ['obelisks','clock'] as const){const n=o.milestones?.[k];if(n!=null)shared[k]=n}
 if(o.walnutsFound!=null)shared.walnuts=o.walnutsFound;
 const players=r.players.map(p=>{const c=playerCounts(p),out:Counts={};for(const k of ['shipping','fishing','cooking','crafting','friends','stardrops','monsters'] as const){const n=c[k];if(n!==null)out[k]=n}if(c.skillLevels!==null)out.skills=Math.floor(c.skillLevels/2);return out});
 return {shared,players,waivers:0};
}
