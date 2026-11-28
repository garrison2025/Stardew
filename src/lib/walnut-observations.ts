import {TASK_MAP} from './walnut-data.ts';
import {decodeWalnuts,setFound,type WalnutState} from './walnut-progress.ts';
import type {SaveElement} from './save-xml.ts';
// Factual keys cross-referenced against MouseyPounds/stardew-checkup parseWalnuts (MIT,
// existing license in public/licenses/stardew-checkup.txt). Four remaining coordinate matches cross-checked against stardew.app and HundoDex.
export const FULL_WALNUT_KEYS:Readonly<Record<string,string>>={
  "leo-path": "Bush_IslandEast_17_37",
  "banana": "BananaShrine",
  "leo-tree": "TreeNut",
  "shrine-bush": "Bush_IslandShrine_23_34",
  "gem-birds": "IslandShrinePuzzle",
  "frog-melon": "IslandGourmand1",
  "frog-wheat": "IslandGourmand2",
  "frog-garlic": "IslandGourmand3",
  "shipwreck": "Bush_CaptainRoom_2_4",
  "mole": "SandDuggy",
  "blue-starfish": "Buried_IslandWest_62_76",
  "starfish-diamond": "Buried_IslandWest_43_74",
  "sand-x": "Buried_IslandWest_30_75",
  "sand-indent": "Buried_IslandWest_21_81",
  "pond-palm": "Bush_IslandWest_38_56",
  "qi-south": "Bush_IslandWest_25_30",
  "qi-north": "Bush_IslandWest_15_3",
  "mahogany": "Bush_IslandWest_31_24",
  "grass-ring": "Buried_IslandWest_39_24",
  "bridge": "Bush_IslandWest_64_30",
  "grove-cliff": "Bush_IslandWest_54_18",
  "forge-in": "Bush_Caldera_28_36",
  "forge-out": "Bush_Caldera_9_34",
  "simon": "IslandWestCavePuzzle",
  "pebbles": "Buried_IslandWest_88_14",
  "express-hidden": "Bush_IslandWest_104_3",
  "farm-overlook": "Bush_IslandWest_75_29",
  "stairs-stones": "Buried_IslandNorth_26_81",
  "stairs-bush": "Bush_IslandNorth_9_84",
  "flower-ring": "Buried_IslandNorth_42_77",
  "east-ring": "Buried_IslandNorth_57_79",
  "office-sand": "Buried_IslandNorth_62_54",
  "digsite-ring": "Buried_IslandNorth_19_39",
  "digsite-west": "Bush_IslandNorth_4_42",
  "digsite-east-a": "Bush_IslandNorth_45_38",
  "digsite-east-b": "Bush_IslandNorth_47_40",
  "fossil-large": "IslandCenterSkeletonRestored",
  "fossil-snake": "IslandSnakeRestored",
  "fossil-frog": "IslandFrogRestored",
  "fossil-bat": "IslandBatRestored",
  "survey-flowers": "IslandLeftPlantRestored",
  "survey-starfish": "IslandRightPlantRestored",
  "volcano-tree": "Bush_IslandNorth_56_27",
  "volcano-sand": "Buried_IslandNorth_54_21",
  "volcano-slingshot": "TreeNutShot",
  "northwest-ring": "Buried_IslandNorth_19_13",
  "northwest-path": "Bush_IslandNorth_20_26",
  "lava-a": "Bush_IslandNorth_13_33",
  "lava-b": "Bush_IslandNorth_5_30",
  "south-cliff": "Bush_IslandSouth_31_5",
  "star-pool": "StardropPool",
  "yellow-starfish": "Buried_IslandSouthEast_25_17",
  "mermaid": "Mermaid",
  "pirate-sand": "Buried_IslandSouthEastCave_36_26"
};
export const LIMITED_WALNUT_KEYS:Readonly<Record<string,string>>={
  "fishing": "IslandFishing",
  "farm-drops": "IslandFarming",
  "journal6": "Island_W_BuriedTreasureNut2",
  "mussels": "MusselStone",
  "pirate-wife": "Birdie",
  "journal4": "Island_W_BuriedTreasureNut",
  "tiger-drop": "TigerSlimeNut",
  "journal10": "Island_N_BuriedTreasureNut",
  "volcano-rocks": "VolcanoMining",
  "volcano-monsters": "VolcanoMonsterDrop",
  "volcano-crates": "VolcanoBarrel",
  "volcano-common": "VolcanoNormalChest",
  "volcano-rare": "VolcanoRareChest",
  "darts": "Darts"
};
export type WalnutObservation={found:Record<string,number>;goldenParrot?:boolean};
const child=(e:SaveElement|undefined,n:string)=>e?.children.find(c=>c.localName===n);
const text=(e:SaveElement|undefined,n:string)=>child(e,n)?.textContent.trim()??'';
const nil=(e:SaveElement|undefined)=>e?.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')==='true';
export function decodeWalnutObservation(raw:unknown):WalnutObservation{
 const v=raw as WalnutObservation;if(!v||!v.found||typeof v.found!=='object'||Array.isArray(v.found)||Object.keys(v.found).length>69)throw Error('Invalid walnut observation');
 const found:Record<string,number>={};
 for(const [id,n] of Object.entries(v.found)){const t=TASK_MAP.get(id);if(!t||!Number.isSafeInteger(n)||n<=0||n>t.count||!t.partial&&n!==t.count)throw Error('Invalid observed walnut task');found[id]=n}
 if(v.goldenParrot!==undefined&&typeof v.goldenParrot!=='boolean')throw Error('Invalid golden parrot marker');
 return {found,...(v.goldenParrot!==undefined?{goldenParrot:v.goldenParrot}:{})};
}
export function readWalnutObservation(root:SaveElement):WalnutObservation|undefined{
 const flags=child(root,'collectedNutTracker'),limited=child(root,'limitedNutDrops'),coconut=text(root,'goldenCoconutCracked');
 const found:Record<string,number>={};let readable=false;
 const parrot=text(root,'activatedGoldenParrot');const goldenParrot=parrot==='true'?true:parrot==='false'?false:undefined;if(goldenParrot!==undefined)readable=true;
 if(flags&&!nil(flags)&&flags.children.length<=500&&flags.children.every(e=>e.localName==='string'&&e.textContent.length<=160)){
  readable=true;const keys=new Set(flags.children.map(e=>e.textContent.trim()));
  for(const [id,k] of Object.entries(FULL_WALNUT_KEYS))if(keys.has(k))found[id]=TASK_MAP.get(id)!.count;
 }
 if(limited&&!nil(limited)&&limited.children.length<=500){
  const values=new Map<string,number|null>();let valid=true;
  for(const e of limited.children){const k=text(child(e,'key'),'string'),v=text(child(e,'value'),'int');
   if(e.localName!=='item'||!k||k.length>160||!/^\d+$/.test(v)||!Number.isSafeInteger(Number(v))){valid=false;break}
   values.set(k,values.has(k)?null:Number(v));
  }
  if(valid){readable=true;for(const [id,k] of Object.entries(LIMITED_WALNUT_KEYS)){const n=values.get(k)??0,t=TASK_MAP.get(id)!;if(n>0&&(t.partial||n>=t.count))found[id]=Math.min(n,t.count)}}
 }
 if(coconut==='true'||coconut==='false'){readable=true;if(coconut==='true')found.coconut=1}
 return readable?decodeWalnutObservation({found,...(goldenParrot!==undefined?{goldenParrot}:{})}):undefined;
}
export function mergeWalnutObservation(current:WalnutState,observation:WalnutObservation){
 let state=decodeWalnuts(current);for(const [id,n] of Object.entries(decodeWalnutObservation(observation).found))state=setFound(state,id,Math.max(state.found[id]??0,n));return state;
}
export function walnutMarker(id:string){const key=FULL_WALNUT_KEYS[id];const match=key?.match(/^(Bush|Buried)_(.+)_(\d+)_(\d+)$/);return match?{location:match[2],x:Number(match[3]),y:Number(match[4])}:undefined}
