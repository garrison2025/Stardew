import type {SaveElement} from './save-xml.ts';
// Only numerical observations of standard NPCs and known flags are retained.
// References: stardewvalleywiki.com/Perfection, MouseyPounds/stardew-checkup
// and stardewvalleywiki.com/Modding:Mail_data. Independent implementation.
const datable=['Abigail','Alex','Elliott','Emily','Haley','Harvey','Leah','Maru','Penny','Sam','Sebastian','Shane'];
const other=['Caroline','Clint','Demetrius','Dwarf','Evelyn','George','Gus','Jas','Jodi','Kent','Krobus','Leo','Lewis','Linus','Marnie','Pam','Pierre','Robin','Sandy','Vincent','Willy','Wizard'];
export const STARDROP_FLAGS={'CF_Fair':'Stardew Valley Fair','CF_Mines':'Mines level 100','CF_Spouse':'Spouse or roommate','CF_Sewer':'Krobus','CF_Fish':'Master Angler','CF_Statue':'Secret Woods statue','museumComplete':'Museum collection'} as const;
const obelisks=['Earth Obelisk','Water Obelisk','Desert Obelisk','Island Obelisk'];
export type SaveMilestones={friends:number|null;eightHeartFriends:number|null;stardrops:number|null;obelisks:number|null;clock:number|null};
export const MILESTONE_MAX={friends:34,eightHeartFriends:34,stardrops:7,obelisks:4,clock:1} as const;
const child=(node:SaveElement|undefined,name:string)=>node?.children.find(c=>c.localName===name);
const txt=(node:SaveElement|undefined,name:string)=>child(node,name)?.textContent.trim()??'';
const valid=(node:SaveElement|undefined,max:number)=>!!node&&node.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')!=='true'&&node.children.length<=max;
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
  out.friends=[...points].filter(([name,p])=>p>=(datable.includes(name)?2000:2500)).length;
  out.eightHeartFriends=[...points.values()].filter(p=>p>=2000).length;
 }
 const mail=child(player,'mailReceived');
 if(valid(mail,10000)&&mail!.children.every(e=>e.localName==='string')){
  const flags=new Set(mail!.children.map(e=>e.textContent.trim()));
  out.stardrops=Object.keys(STARDROP_FLAGS).filter(key=>flags.has(key)).length;
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
 for(const key of Object.keys(MILESTONE_MAX) as (keyof SaveMilestones)[]){
  const n=v[key];if(n!==null&&(typeof n!=='number'||!Number.isInteger(n)||n<0||n>MILESTONE_MAX[key]))throw Error('Invalid observed '+key);
  out[key]=n as number|null;
 }
 return out;
}
