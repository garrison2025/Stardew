import type {SaveElement} from './save-xml.ts';
// Only numerical observations of standard NPCs and known flags are retained.
// References: stardewvalleywiki.com/Perfection, MouseyPounds/stardew-checkup
// and stardewvalleywiki.com/Modding:Mail_data. Independent implementation.
const datable=['Abigail','Alex','Elliott','Emily','Haley','Harvey','Leah','Maru','Penny','Sam','Sebastian','Shane'];
const other=['Caroline','Clint','Demetrius','Dwarf','Evelyn','George','Gus','Jas','Jodi','Kent','Krobus','Leo','Lewis','Linus','Marnie','Pam','Pierre','Robin','Sandy','Vincent','Willy','Wizard'];
export const STARDROP_FLAGS={'CF_Fair':'Stardew Valley Fair','CF_Mines':'Mines level 100','CF_Spouse':'Spouse or roommate','CF_Sewer':'Krobus','CF_Fish':'Master Angler','CF_Statue':'Secret Woods statue','museumComplete':'Museum collection'} as const;
export const FRIENDSHIP_VILLAGERS=[...datable,...other] as readonly string[];
export const STARDROP_SOURCE_KEYS=Object.keys(STARDROP_FLAGS) as (keyof typeof STARDROP_FLAGS)[];
export function friendshipTarget(name:string){return datable.includes(name)?2000:2500}
const obelisks=['Earth Obelisk','Water Obelisk','Desert Obelisk','Island Obelisk'];
export type SaveMilestones={friends:number|null;eightHeartFriends:number|null;stardrops:number|null;obelisks:number|null;clock:number|null;friendshipPoints?:Array<number|null>;stardropSources?:boolean[];maxStaminaMarker?:boolean;mineChestMarker?:boolean};
export const MILESTONE_MAX={friends:34,eightHeartFriends:34,stardrops:7,obelisks:4,clock:1} as const;
const child=(node:SaveElement|undefined,name:string)=>node?.children.find(c=>c.localName===name);
const txt=(node:SaveElement|undefined,name:string)=>child(node,name)?.textContent.trim()??'';
const valid=(node:SaveElement|undefined,max:number)=>!!node&&!['true','1'].includes(node.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')??'')&&node.children.length<=max;
export function readSaveMilestones(root:SaveElement,player:SaveElement|undefined,shared=true):SaveMilestones{
 const out:SaveMilestones={friends:null,eightHeartFriends:null,stardrops:null,obelisks:null,clock:null};
 const friendship=child(player,'friendshipData');
 if(valid(friendship,2000)){
  const points=new Map<string,number>(),bad=new Set<string>();
  for(const row of friendship!.children){
   if(row.localName!=='item')continue;
   const name=txt(child(row,'key'),'string');
   if(!datable.includes(name)&&!other.includes(name))continue;
   const raw=txt(child(child(row,'value'),'Friendship'),'Points');
   if(points.has(name)||bad.has(name)||!/^\d+$/.test(raw)||Number(raw)>3749){bad.add(name);points.delete(name);continue}
   points.set(name,Number(raw));
  }
  out.friendshipPoints=FRIENDSHIP_VILLAGERS.map(name=>points.get(name)??null);
  out.friends=[...points].filter(([name,p])=>p>=friendshipTarget(name)).length;
  out.eightHeartFriends=[...points.values()].filter(p=>p>=1975).length;
 }
 const mail=child(player,'mailReceived');
 if(valid(mail,10000)&&mail!.children.every(e=>e.localName==='string')){
  const flags=new Set(mail!.children.map(e=>e.textContent.trim()));
  out.maxStaminaMarker=flags.has('gotMaxStamina');
  out.stardropSources=STARDROP_SOURCE_KEYS.map(key=>flags.has(key));
  out.stardrops=out.stardropSources.filter(Boolean).length;
 }
 const consumed=child(player,'chestConsumedLevels');
 if(valid(consumed,2000)){
  const matches=consumed!.children.filter(r=>r.localName==='item'&&txt(child(r,'key'),'int')==='100');
  if(matches.length===1){const value=txt(child(matches[0],'value'),'boolean');if(value==='true'||value==='false')out.mineChestMarker=value==='true';}
  if(out.mineChestMarker){out.stardropSources=out.stardropSources??STARDROP_SOURCE_KEYS.map(()=>false);out.stardropSources[STARDROP_SOURCE_KEYS.indexOf('CF_Mines')]=true;out.stardrops=out.stardropSources.filter(Boolean).length;}
 }
 if(shared){
  const farms=child(root,'locations')?.children.filter(c=>c.localName==='GameLocation'&&txt(c,'name')==='Farm')??[];
  const buildings=farms.length===1?child(farms[0],'buildings'):undefined;
  if(valid(buildings,20000)){
   const completed=new Set<string>();
   for(const b of buildings!.children){
    const name=txt(b,'buildingType');
    if((obelisks.includes(name)||name==='Gold Clock')&&txt(b,'daysOfConstructionLeft')==='0')completed.add(name);
   }
   out.obelisks=obelisks.filter(name=>completed.has(name)).length;
   out.clock=Number(completed.has('Gold Clock'));
  }
 }
 return out;
}
export function decodeMilestones(value:unknown):SaveMilestones{
 if(!value||typeof value!=='object')throw Error('Invalid save milestone record');
 const v=value as Record<string,unknown>,out={} as SaveMilestones;
 for(const key of Object.keys(MILESTONE_MAX) as (keyof typeof MILESTONE_MAX)[]){
  const n=v[key];if(n!==null&&(typeof n!=='number'||!Number.isInteger(n)||n<0||n>MILESTONE_MAX[key]))throw Error('Invalid observed '+key);
  out[key]=n as number|null;
 }
 if(v.friendshipPoints!==undefined){
  const a=v.friendshipPoints;if(!Array.isArray(a)||a.length!==FRIENDSHIP_VILLAGERS.length||a.some(n=>n!==null&&(!Number.isSafeInteger(n)||n<0||n>3749)))throw Error('Invalid observed friendship detail');
  if(out.friends!==a.filter((n,i)=>n!==null&&n>=friendshipTarget(FRIENDSHIP_VILLAGERS[i])).length||out.eightHeartFriends!==a.filter(n=>n!==null&&n>=1975).length)throw Error('Friendship detail does not match counts');
  out.friendshipPoints=[...a];
 }
 if(v.stardropSources!==undefined){
  const a=v.stardropSources;if(!Array.isArray(a)||a.length!==STARDROP_SOURCE_KEYS.length||a.some(n=>typeof n!=='boolean')||out.stardrops!==a.filter(Boolean).length)throw Error('Invalid observed Stardrop detail');
  out.stardropSources=[...a];
 }
 for(const k of ['maxStaminaMarker','mineChestMarker'] as const){if(v[k]!==undefined){if(typeof v[k]!=='boolean')throw Error('Invalid Stardrop alternate marker');out[k]=v[k];}}
 if(out.mineChestMarker&&!out.stardropSources?.[STARDROP_SOURCE_KEYS.indexOf('CF_Mines')])throw Error('Mine chest marker missing from Stardrop sources');
 return out;
}
