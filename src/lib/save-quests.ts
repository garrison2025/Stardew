import {readStory,decodeStory,type StoryObservation} from './story-observations.ts';
import type {SaveElement} from './save-xml.ts';
// Independent reference ID map: pinned Stardew Checkup special-order IDs and Wiki Modding:Achievement data (1.6).
export const TOWN_ORDERS={Caroline:'Island Ingredients',Clint:'Cave Patrol',Demetrius:'Aquatic Overpopulation',Demetrius2:'Biome Balance',Emily:'Rock Rejuvenation',Evelyn:'Gifts for George',Gunther:'Fragments of the Past',Gus:"Gus' Famous Omelet",Lewis:'Crop Order',Linus:'Community Cleanup',Pam:'The Strong Stuff',Pierre:"Pierre's Prime Produce",Robin:"Robin's Project",Robin2:"Robin's Resource Rush",Willy:'Juicy Bugs Wanted!',Willy2:'Tropical Fish',Wizard:'A Curious Substance',Wizard2:'Prismatic Jelly'} as const;
export const QI_ORDERS={QiChallenge2:"Qi's Crop",QiChallenge3:"Let's Play A Game",QiChallenge4:'Four Precious Stones',QiChallenge5:"Qi's Hungry Challenge",QiChallenge6:"Qi's Cuisine",QiChallenge7:"Qi's Kindness",QiChallenge8:'Extended Family',QiChallenge9:'Danger In The Deep',QiChallenge10:'Skull Cavern Invasion',QiChallenge12:"Qi's Prismatic Grange"} as const;
export const ACHIEVEMENTS={0:'Greenhorn',1:'Cowpoke',2:'Homesteader',3:'Millionaire',4:'Legend',5:'A Complete Collection',6:'A New Friend',7:'Best Friends',9:'The Beloved Farmer',11:'Cliques',12:'Networking',13:'Popular',15:'Cook',16:'Sous Chef',17:'Gourmet Chef',18:'Moving Up',19:'Living Large',20:'D.I.Y.',21:'Artisan',22:'Craft Master',24:'Fisherman',25:"Ol' Mariner",26:'Master Angler',27:'Mother Catch',28:'Treasure Trove',29:'Gofer',30:'A Big Help',31:'Polyculture',32:'Monoculture',34:'Full Shipment',35:'Well-read',36:'Two Thumbs Up',37:'Blue Ribbon',38:'An Unforgettable Soup',39:'Good Neighbors',40:'A Distant Shore',41:'Danger In The Deep',42:'Infinite Power',44:'Perfection'} as const;
export type CompletionObservation={ids:string[];unmapped:number};
export type ActiveOrder={id:string;dueDate:number|null;objectives:{kind:string;current:number|null;target:number|null}[]};
export type QuestObservations={orders?:CompletionObservation;achievements?:CompletionObservation;story?:StoryObservation;active?:ActiveOrder[]};
const orderKeys=Object.keys({...TOWN_ORDERS,...QI_ORDERS}),achievementKeys=Object.keys(ACHIEVEMENTS);
function decodeList(raw:unknown,keys:string[]):CompletionObservation{
 const v=raw as CompletionObservation;
 if(!v||!Array.isArray(v.ids)||v.ids.length>keys.length||v.ids.some(id=>typeof id!=='string'||!keys.includes(id))||new Set(v.ids).size!==v.ids.length||!Number.isSafeInteger(v.unmapped)||v.unmapped<0||v.unmapped>20000)throw Error('Invalid quest observation');
 return {ids:keys.filter(id=>v.ids.includes(id)),unmapped:v.unmapped};
}
export function decodeQuestObservations(raw:unknown):QuestObservations{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid quest observations');
 const v=raw as QuestObservations;return {...(v.orders!==undefined?{orders:decodeList(v.orders,orderKeys)}:{}),...(v.achievements!==undefined?{achievements:decodeList(v.achievements,achievementKeys)}:{}),...(v.story!==undefined?{story:decodeStory(v.story)}:{}),...(v.active!==undefined?{active:decodeActive(v.active)}:{})};
}
function readList(nodes:SaveElement[],tag:string,keys:string[]):CompletionObservation|undefined{
 if(nodes.length!==1)return;const n=nodes[0];
 if(['true','1'].includes(n.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')??'')||n.children.length>20000||n.children.some(c=>c.localName!==tag||c.children.length>0))return;
 const raw=n.children.map(c=>c.textContent.trim());if(raw.some(s=>!s||s.length>160||(tag==='int'&&!/^\d+$/.test(s))))return;
 const set=new Set(raw);return {ids:keys.filter(k=>set.has(k)),unmapped:[...set].filter(k=>!keys.includes(k)).length};
}
export function readQuestObservations(root:SaveElement,player:SaveElement|undefined,shared:boolean):QuestObservations|undefined{
 // Only direct root/team completion lists, never nested player or active orders. Ambiguous duplicate lists stay unknown.
 const team=root.children.filter(c=>c.localName==='team');
 const orderNodes=[...root.children.filter(c=>c.localName==='completedSpecialOrders'),...(team.length===1?team[0].children.filter(c=>c.localName==='completedSpecialOrders'):[])];
 const orders=shared&&team.length<=1?readList(orderNodes,'string',orderKeys):undefined;
 const achievements=readList(player?.children.filter(c=>c.localName==='achievements')??[],'int',achievementKeys);
 const story=readStory(player),active=shared&&team.length<=1?readActive([...root.children.filter(c=>c.localName==='specialOrders'),...(team.length===1?team[0].children.filter(c=>c.localName==='specialOrders'):[])]):undefined;
 return orders!==undefined||achievements!==undefined||story!==undefined||active!==undefined?{...(orders?{orders}:{}),...(achievements?{achievements}:{}),...(story?{story}:{}),...(active!==undefined?{active}:{})}:undefined;
}

const objectiveKinds=['ShipObjective','SlayObjective','DeliverObjective','FishObjective','GiftObjective','JKScoreObjective','ReachMineFloorObjective','CollectObjective','DonateObjective','Unknown'];
const bounded=(n:unknown):n is number|null=>n===null||typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=1000000000;
function decodeActive(raw:unknown):ActiveOrder[]{
 if(!Array.isArray(raw)||raw.length>28)throw Error('Invalid active orders');const seen=new Set<string>();
 return raw.map((v:ActiveOrder)=>{if(!v||!orderKeys.includes(v.id)||seen.has(v.id)||!bounded(v.dueDate)||!Array.isArray(v.objectives)||v.objectives.length>32)throw Error('Invalid active order');seen.add(v.id);
 return {id:v.id,dueDate:v.dueDate,objectives:v.objectives.map(o=>{if(!o||!objectiveKinds.includes(o.kind)||!bounded(o.current)||!bounded(o.target))throw Error('Invalid active objective');return {kind:o.kind,current:o.current,target:o.target}})};});
}
const field=(n:SaveElement,name:string)=>{const a=n.children.filter(c=>c.localName===name);return a.length===1&&!a[0].children.length?a[0].textContent.trim():''};
const numeric=(s:string)=>/^\d{1,10}$/.test(s)&&bounded(Number(s))?Number(s):null;
function readActive(nodes:SaveElement[]):ActiveOrder[]|undefined{
 if(nodes.length!==1||nodes[0].children.length>200||['true','1'].includes(nodes[0].getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')??''))return;
 const found=new Map<string,ActiveOrder|null>();
 for(const row of nodes[0].children){if(row.localName!=='SpecialOrder'||field(row,'questState')!=='InProgress')continue;
 const id=field(row,'questKey');if(!orderKeys.includes(id))continue;if(found.has(id)){found.set(id,null);continue}
 const list=row.children.filter(c=>c.localName==='objectives');const objectives=list.length===1&&list[0].children.length<=32?list[0].children.map(o=>{
  const kind=o.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','type')??o.getAttribute('xsi:type')??o.localName;
  return {kind:objectiveKinds.includes(kind)?kind:'Unknown',current:numeric(field(o,'currentCount')),target:numeric(field(o,'maxCount'))};
 }):[];
 found.set(id,{id,dueDate:numeric(field(row,'dueDate')),objectives});
 }
 return decodeActive([...found.values()].filter((v):v is ActiveOrder=>v!==null));
}
