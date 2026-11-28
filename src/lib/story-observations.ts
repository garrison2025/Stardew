import type {SaveElement} from './save-xml.ts';
// Numeric identifiers and heart levels only, from pinned MIT reference dataset; no dialogue or artwork.
// https://github.com/chiefpansancolt/stardew-valley-data/tree/028b2966fee9111df26af96fd655d129e1cc0510
export const HEART_EVENT_ROWS=[
 {
  "villager": "Abigail",
  "hearts": 2,
  "id": "1"
 },
 {
  "villager": "Abigail",
  "hearts": 4,
  "id": "2"
 },
 {
  "villager": "Abigail",
  "hearts": 6,
  "id": "4"
 },
 {
  "villager": "Abigail",
  "hearts": 8,
  "id": "3"
 },
 {
  "villager": "Abigail",
  "hearts": 10,
  "id": "901756"
 },
 {
  "villager": "Abigail",
  "hearts": 14,
  "id": "6963327"
 },
 {
  "villager": "Alex",
  "hearts": 2,
  "id": "20"
 },
 {
  "villager": "Alex",
  "hearts": 4,
  "id": "2481135"
 },
 {
  "villager": "Alex",
  "hearts": 5,
  "id": "21"
 },
 {
  "villager": "Alex",
  "hearts": 6,
  "id": "2119820"
 },
 {
  "villager": "Alex",
  "hearts": 8,
  "id": "288847"
 },
 {
  "villager": "Alex",
  "hearts": 10,
  "id": "911526"
 },
 {
  "villager": "Alex",
  "hearts": 14.1,
  "id": "3917587"
 },
 {
  "villager": "Alex",
  "hearts": 14.2,
  "id": "3917589"
 },
 {
  "villager": "Alex",
  "hearts": 14.3,
  "id": "3917590"
 },
 {
  "villager": "Caroline",
  "hearts": 2,
  "id": "719926"
 },
 {
  "villager": "Caroline",
  "hearts": 6,
  "id": "17"
 },
 {
  "villager": "Clint",
  "hearts": 3,
  "id": "97"
 },
 {
  "villager": "Clint",
  "hearts": 6,
  "id": "101"
 },
 {
  "villager": "Demetrius",
  "hearts": 6,
  "id": "25"
 },
 {
  "villager": "Dwarf",
  "hearts": 0.2,
  "id": "691039"
 },
 {
  "villager": "Elliott",
  "hearts": 2,
  "id": "39"
 },
 {
  "villager": "Elliott",
  "hearts": 4,
  "id": "40"
 },
 {
  "villager": "Elliott",
  "hearts": 6,
  "id": "423502"
 },
 {
  "villager": "Elliott",
  "hearts": 8,
  "id": "1848481"
 },
 {
  "villager": "Elliott",
  "hearts": 10,
  "id": "43"
 },
 {
  "villager": "Elliott",
  "hearts": 14.1,
  "id": "3912125"
 },
 {
  "villager": "Elliott",
  "hearts": 14.2,
  "id": "3912132"
 },
 {
  "villager": "Emily",
  "hearts": 2,
  "id": "471942"
 },
 {
  "villager": "Emily",
  "hearts": 4,
  "id": "463391"
 },
 {
  "villager": "Emily",
  "hearts": 6,
  "id": "917409"
 },
 {
  "villager": "Emily",
  "hearts": 8,
  "id": "2123243"
 },
 {
  "villager": "Emily",
  "hearts": 10,
  "id": "2123343"
 },
 {
  "villager": "Emily",
  "hearts": 14.1,
  "id": "3917600"
 },
 {
  "villager": "Emily",
  "hearts": 14.2,
  "id": "3917601"
 },
 {
  "villager": "Evelyn",
  "hearts": 4,
  "id": "19"
 },
 {
  "villager": "George",
  "hearts": 6,
  "id": "18"
 },
 {
  "villager": "Gus",
  "hearts": 4,
  "id": "96"
 },
 {
  "villager": "Gus",
  "hearts": 5,
  "id": "980558"
 },
 {
  "villager": "Haley",
  "hearts": 2,
  "id": "11"
 },
 {
  "villager": "Haley",
  "hearts": 4,
  "id": "12"
 },
 {
  "villager": "Haley",
  "hearts": 6,
  "id": "13"
 },
 {
  "villager": "Haley",
  "hearts": 8,
  "id": "14"
 },
 {
  "villager": "Haley",
  "hearts": 10,
  "id": "15"
 },
 {
  "villager": "Haley",
  "hearts": 14.1,
  "id": "6184643"
 },
 {
  "villager": "Haley",
  "hearts": 14.2,
  "id": "8675611"
 },
 {
  "villager": "Haley",
  "hearts": 14.3,
  "id": "6184644"
 },
 {
  "villager": "Harvey",
  "hearts": 2,
  "id": "56"
 },
 {
  "villager": "Harvey",
  "hearts": 4,
  "id": "57"
 },
 {
  "villager": "Harvey",
  "hearts": 6,
  "id": "58"
 },
 {
  "villager": "Harvey",
  "hearts": 8,
  "id": "571102"
 },
 {
  "villager": "Harvey",
  "hearts": 10,
  "id": "528052"
 },
 {
  "villager": "Harvey",
  "hearts": 14,
  "id": "3917626"
 },
 {
  "villager": "Jas",
  "hearts": 8,
  "id": "3910979"
 },
 {
  "villager": "Jodi",
  "hearts": 4,
  "id": "94"
 },
 {
  "villager": "Jodi",
  "hearts": 4,
  "id": "95"
 },
 {
  "villager": "Kent",
  "hearts": 3,
  "id": "100"
 },
 {
  "villager": "Krobus",
  "hearts": 14,
  "id": "7771191"
 },
 {
  "villager": "Leah",
  "hearts": 2,
  "id": "50"
 },
 {
  "villager": "Leah",
  "hearts": 4,
  "id": "51"
 },
 {
  "villager": "Leah",
  "hearts": 6,
  "id": "992253"
 },
 {
  "villager": "Leah",
  "hearts": 6,
  "id": "52"
 },
 {
  "villager": "Leah",
  "hearts": 8,
  "id": "53"
 },
 {
  "villager": "Leah",
  "hearts": 8,
  "id": "584059"
 },
 {
  "villager": "Leah",
  "hearts": 10,
  "id": "54"
 },
 {
  "villager": "Leah",
  "hearts": 14.1,
  "id": "3911124"
 },
 {
  "villager": "Leah",
  "hearts": 14.2,
  "id": "3091462"
 },
 {
  "villager": "Leo",
  "hearts": 2,
  "id": "6497423"
 },
 {
  "villager": "Leo",
  "hearts": 4,
  "id": "6497421"
 },
 {
  "villager": "Leo",
  "hearts": 6,
  "id": "6497428"
 },
 {
  "villager": "Leo",
  "hearts": 9,
  "id": "8959199"
 },
 {
  "villager": "Lewis",
  "hearts": 6,
  "id": "639373"
 },
 {
  "villager": "Linus",
  "hearts": 0.2,
  "id": "502969"
 },
 {
  "villager": "Linus",
  "hearts": 4,
  "id": "26"
 },
 {
  "villager": "Linus",
  "hearts": 8,
  "id": "371652"
 },
 {
  "villager": "Marnie",
  "hearts": 3,
  "id": "91"
 },
 {
  "villager": "Marnie",
  "hearts": 6,
  "id": "639373"
 },
 {
  "villager": "Maru",
  "hearts": 2,
  "id": "6"
 },
 {
  "villager": "Maru",
  "hearts": 4,
  "id": "7"
 },
 {
  "villager": "Maru",
  "hearts": 6,
  "id": "8"
 },
 {
  "villager": "Maru",
  "hearts": 8,
  "id": "9"
 },
 {
  "villager": "Maru",
  "hearts": 10,
  "id": "10"
 },
 {
  "villager": "Maru",
  "hearts": 14.1,
  "id": "3917666"
 },
 {
  "villager": "Maru",
  "hearts": 14.2,
  "id": "5183338"
 },
 {
  "villager": "Pam",
  "hearts": 9,
  "id": "503180"
 },
 {
  "villager": "Penny",
  "hearts": 2,
  "id": "34"
 },
 {
  "villager": "Penny",
  "hearts": 4,
  "id": "35"
 },
 {
  "villager": "Penny",
  "hearts": 6,
  "id": "36"
 },
 {
  "villager": "Penny",
  "hearts": 8,
  "id": "181928"
 },
 {
  "villager": "Penny",
  "hearts": 10,
  "id": "38"
 },
 {
  "villager": "Penny",
  "hearts": 14.1,
  "id": "4325434"
 },
 {
  "villager": "Penny",
  "hearts": 14.2,
  "id": "4324303"
 },
 {
  "villager": "Pierre",
  "hearts": 6,
  "id": "16"
 },
 {
  "villager": "Robin",
  "hearts": 6,
  "id": "33"
 },
 {
  "villager": "Sam",
  "hearts": 2,
  "id": "44"
 },
 {
  "villager": "Sam",
  "hearts": 3,
  "id": "733330"
 },
 {
  "villager": "Sam",
  "hearts": 4,
  "id": "46"
 },
 {
  "villager": "Sam",
  "hearts": 6,
  "id": "45"
 },
 {
  "villager": "Sam",
  "hearts": 8,
  "id": "4081148"
 },
 {
  "villager": "Sam",
  "hearts": 10,
  "id": "233104"
 },
 {
  "villager": "Sam",
  "hearts": 14.1,
  "id": "3918600"
 },
 {
  "villager": "Sam",
  "hearts": 14.2,
  "id": "3918601"
 },
 {
  "villager": "Sam",
  "hearts": 14.3,
  "id": "3918602"
 },
 {
  "villager": "Sam",
  "hearts": 14.4,
  "id": "3918603"
 },
 {
  "villager": "Sebastian",
  "hearts": 2,
  "id": "2794460"
 },
 {
  "villager": "Sebastian",
  "hearts": 4,
  "id": "384883"
 },
 {
  "villager": "Sebastian",
  "hearts": 6,
  "id": "27"
 },
 {
  "villager": "Sebastian",
  "hearts": 8,
  "id": "29"
 },
 {
  "villager": "Sebastian",
  "hearts": 10,
  "id": "384882"
 },
 {
  "villager": "Sebastian",
  "hearts": 14.1,
  "id": "9333219"
 },
 {
  "villager": "Sebastian",
  "hearts": 14.2,
  "id": "9333220"
 },
 {
  "villager": "Shane",
  "hearts": 2,
  "id": "611944"
 },
 {
  "villager": "Shane",
  "hearts": 4,
  "id": "3910674"
 },
 {
  "villager": "Shane",
  "hearts": 6,
  "id": "3910975"
 },
 {
  "villager": "Shane",
  "hearts": 6.8,
  "id": "3910974"
 },
 {
  "villager": "Shane",
  "hearts": 7,
  "id": "831125"
 },
 {
  "villager": "Shane",
  "hearts": 8,
  "id": "3900074"
 },
 {
  "villager": "Shane",
  "hearts": 10,
  "id": "9581348"
 },
 {
  "villager": "Shane",
  "hearts": 14.1,
  "id": "3917584"
 },
 {
  "villager": "Shane",
  "hearts": 14.2,
  "id": "3917585"
 },
 {
  "villager": "Shane",
  "hearts": 14.3,
  "id": "3917586"
 },
 {
  "villager": "Vincent",
  "hearts": 8,
  "id": "3910979"
 },
 {
  "villager": "Willy",
  "hearts": 6,
  "id": "711130"
 }
] as const;
export const NOTE_IDS=Array.from({length:27},(_,i)=>String(i+1));
export const JOURNAL_IDS=Array.from({length:11},(_,i)=>String(1001+i));
export const NOTE_REWARD_FLAGS={junimoPlush:'13',gotPearl:'15',SecretNote16_done:'16',SecretNote17_done:'17',SecretNote18_done:'18',SecretNote19_done:'19',SecretNote20_done:'20',secretNote21_done:'21',TH_Tunnel:'22',carolinesNecklace:'25',Island_W_BuriedTreasure:'1004',Island_W_BuriedTreasure2:'1006',Island_N_BuriedTreasure:'1010'} as const;
const eventKeys=[...new Set(HEART_EVENT_ROWS.map(e=>e.id as string)),'520702','2120303','191393'];
const rewardKeys=[...Object.values(NOTE_REWARD_FLAGS),'23'];
export type StoryObservation={notes?:string[];events?:string[];rewardMarkers?:string[];magnifier?:boolean;unknownNotes?:number;unknownEvents?:number};
const nil=(n:SaveElement)=>['true','1'].includes(n.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')??'');
function list(player:SaveElement|undefined,name:string,tags:string[]){
 const rows=player?.children.filter(c=>c.localName===name)??[];if(rows.length!==1||nil(rows[0])||rows[0].children.length>20000)return undefined;
 if(rows[0].children.some(c=>!tags.includes(c.localName)||c.children.length||!c.textContent.trim()||c.textContent.trim().length>160))return undefined;
 return new Set(rows[0].children.map(c=>c.textContent.trim()));
}
function checked(raw:unknown,keys:string[]){if(!Array.isArray(raw)||raw.length>keys.length||new Set(raw).size!==raw.length||raw.some(k=>typeof k!=='string'||!keys.includes(k)))throw Error('Invalid story ID list');return keys.filter(k=>raw.includes(k))}
export function decodeStory(raw:unknown):StoryObservation{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid story observations');const v=raw as StoryObservation,out:StoryObservation={};
 for(const [key,keys] of [['notes',[...NOTE_IDS,...JOURNAL_IDS]],['events',eventKeys],['rewardMarkers',rewardKeys]] as const)if(v[key]!==undefined)out[key]=checked(v[key],[...keys]);
 if(v.magnifier!==undefined){if(typeof v.magnifier!=='boolean')throw Error('Invalid magnifier');out.magnifier=v.magnifier}
 for(const k of ['unknownNotes','unknownEvents'] as const){const n=v[k];if(n!==undefined){if(!Number.isSafeInteger(n)||n<0||n>20000)throw Error('Invalid unknown count');out[k]=n}}
 return out;
}
export function readStory(player:SaveElement|undefined):StoryObservation|undefined{
 const notes=list(player,'secretNotesSeen',['int']),events=list(player,'eventsSeen',['int','string']),mail=list(player,'mailReceived',['string']);const out:StoryObservation={};
 if(notes){const keys=[...NOTE_IDS,...JOURNAL_IDS];out.notes=keys.filter(k=>notes.has(k));out.unknownNotes=[...notes].filter(k=>!keys.includes(k)).length}
 if(events){out.events=eventKeys.filter(k=>events.has(k));out.unknownEvents=[...events].filter(k=>!eventKeys.includes(k)).length}
 if(mail||events){out.rewardMarkers=Object.entries(NOTE_REWARD_FLAGS).filter(([key])=>mail?.has(key)).map(([,id])=>id);if(events?.has('2120303'))out.rewardMarkers.push('23');}
 if(mail)out.magnifier=mail.has('HasMagnifyingGlass');
 return Object.keys(out).length?decodeStory(out):undefined;
}
