// Independent count aggregation against the MIT-licensed Stardew Checkup,
// stardew-checkup.js blob 62cb82ebc2f51c2592bc79ff8b449b29be7777ce, and the
// standard 1.6 Adventurer's Guild reference. See /licenses/stardew-checkup.txt.
import type {SaveElement} from './save-xml.ts';
export const MONSTER_GOALS=[
 {id:'slimes',name:'Slimes',target:1000,reward:'Slime Charmer Ring',where:'Mines, Skull Cavern and other slime habitats',keys:['Green Slime','Frost Jelly','Sludge','Tiger Slime']},
 {id:'shadows',name:'Void Spirits',target:150,reward:'Savage Ring',where:'Deep Mines',keys:['Shadow Brute','Shadow Shaman','Shadow Sniper','Shadow Guy','Shadow Girl']},
 {id:'bats',name:'Bats',target:200,reward:'Vampire Ring',where:'Mines and Skull Cavern',keys:['Bat','Frost Bat','Lava Bat','Iridium Bat']},
 {id:'skeletons',name:'Skeletons',target:50,reward:'Skeleton Mask',where:'Mines floors 71–79',keys:['Skeleton','Skeleton Mage']},
 {id:'insects',name:'Cave Insects',target:80,reward:'Insect Head',where:'Early Mines',keys:['Bug','Fly','Grub']},
 {id:'duggies',name:'Duggies',target:30,reward:'Hard Hat',where:'Early Mines and Volcano Dungeon',keys:['Duggy','Magma Duggy']},
 {id:'dust',name:'Dust Sprites',target:500,reward:"Burglar's Ring",where:'Mines floors 41–79',keys:['Dust Spirit']},
 {id:'crabs',name:'Rock Crabs',target:60,reward:'Crabshell Ring',where:'Mines and Skull Cavern',keys:['Rock Crab','Lava Crab','Iridium Crab']},
 {id:'mummies',name:'Mummies',target:100,reward:'Arcane Hat',where:'Skull Cavern',keys:['Mummy']},
 {id:'rex',name:'Pepper Rex',target:50,reward:"Knight's Helmet",where:'Prehistoric floors of Skull Cavern',keys:['Pepper Rex']},
 {id:'serpents',name:'Serpents',target:250,reward:'Napalm Ring',where:'Skull Cavern',keys:['Serpent','Royal Serpent']},
 {id:'magma',name:'Magma Sprites',target:150,reward:"Marlon's Phone Number",where:'Volcano Dungeon',keys:['Magma Sprite','Magma Sparker']},
] as const;
export type MonsterId=typeof MONSTER_GOALS[number]['id'];
export type MonsterCounts=Record<MonsterId,number>;
const map=new Map<string,MonsterId>(MONSTER_GOALS.flatMap(g=>g.keys.map(k=>[k,g.id] as const)));
export function emptyMonsterCounts():MonsterCounts{return Object.fromEntries(MONSTER_GOALS.map(g=>[g.id,0])) as MonsterCounts}
export function decodeMonsterCounts(value:unknown):MonsterCounts{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==MONSTER_GOALS.length)throw Error('Invalid monster goal counts');
 const source=value as Record<string,unknown>,out=emptyMonsterCounts();
 for(const g of MONSTER_GOALS){const n=source[g.id];if(!Object.hasOwn(source,g.id)||typeof n!=='number'||!Number.isSafeInteger(n)||n<0||n>1e9)throw Error('Invalid monster count: '+g.id);out[g.id]=n}
 return out;
}
export function monsterGoalSummary(counts:MonsterCounts){const v=decodeMonsterCounts(counts);const rows=MONSTER_GOALS.map(g=>({...g,killed:v[g.id],remaining:Math.max(0,g.target-v[g.id]),complete:v[g.id]>=g.target}));return {rows,complete:rows.filter(g=>g.complete).length,remaining:rows.reduce((n,g)=>n+g.remaining,0)}}
const child=(node:SaveElement|undefined,name:string)=>node?.children.find(c=>c.localName===name);
const txt=(node:SaveElement|undefined,name:string)=>child(node,name)?.textContent.trim()??'';
export function readMonsterCounts(player:SaveElement|undefined):MonsterCounts|undefined{
 const node=child(child(player,'stats'),'specificMonstersKilled');
 if(!node||node.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')==='true'||node.children.length>2000)return undefined;
 const out=emptyMonsterCounts(),seen=new Set<string>();
 for(const row of node.children){
  if(row.localName!=='item')return undefined;
  const key=txt(child(row,'key'),'string'),raw=txt(child(row,'value'),'int');
  if(!key||key.length>160||seen.has(key)||!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))||Number(raw)>1e9)return undefined;
  seen.add(key);
  const id=map.get(key);if(id){out[id]+=Number(raw);if(out[id]>1e9)return undefined}
 }
 return out;
}
