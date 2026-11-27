import type {SaveElement} from './save-xml.ts';
// Standard profession IDs, see https://stardewvalleywiki.com/Modding:Console_commands
export const PROFESSION_NAMES=['Rancher','Tiller','Coopmaster','Shepherd','Artisan','Agriculturist','Fisher','Trapper','Angler','Pirate','Mariner','Luremaster','Forester','Gatherer','Lumberjack','Tapper','Botanist','Tracker','Miner','Geologist','Blacksmith','Prospector','Excavator','Gemologist','Fighter','Scout','Brute','Defender','Acrobat','Desperado'] as const;
export type ProfessionObservation={ids:number[];unmapped:number};
export function decodeProfessions(raw:unknown):ProfessionObservation{
 const v=raw as ProfessionObservation;
 if(!v||!Array.isArray(v.ids)||v.ids.length>30||v.ids.some(n=>!Number.isInteger(n)||n<0||n>29)||new Set(v.ids).size!==v.ids.length||!Number.isInteger(v.unmapped)||v.unmapped<0||v.unmapped>100)throw Error('Invalid profession observations');
 return {ids:[...v.ids].sort((a,b)=>a-b),unmapped:v.unmapped};
}
export function readProfessions(player:SaveElement|undefined):ProfessionObservation|undefined{
 const el=player?.children.find(c=>c.localName==='professions');
 if(!el||el.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')==='true'||el.children.length>100)return undefined;
 const ids=new Set<number>();let unmapped=0;
 for(const n of el.children){const raw=n.textContent.trim();if(n.localName!=='int'||!/^\d+$/.test(raw)||Number(raw)>29||ids.has(Number(raw))){unmapped++;continue}ids.add(Number(raw))}
 return decodeProfessions({ids:[...ids],unmapped});
}
export const professionNames=(v:ProfessionObservation)=>decodeProfessions(v).ids.map(id=>PROFESSION_NAMES[id]);
