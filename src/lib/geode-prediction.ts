// Geode roll order and compatibility reference adapted from MouseyPounds/stardew-predictor
// stardew-predictor.js blob f84c2b30a32a04c3485ddabfba2be57cb0cde596.
// See public/licenses/mouseypounds.txt. No upstream scripts, art or network requests.
export const GEODE_TYPES=['Geode','Frozen Geode','Magma Geode','Omni Geode','Artifact Trove'] as const;
export type GeodeType=typeof GEODE_TYPES[number];
export type GeodeInput={gameId:string;playerId:string;opened:number;mineLevel:number;legacy:boolean;qiBeans:boolean};
const contents:Record<GeodeType,readonly (number|string)[]>={
 "Geode":[538,542,548,549,552,555,556,557,558,566,568,569,571,574,576,121],
 "Frozen Geode":[541,544,545,546,550,551,559,560,561,564,567,572,573,577,123],
 "Magma Geode":[539,540,543,547,553,554,562,563,565,570,575,578,122],
 "Omni Geode":[538,542,548,549,552,555,556,557,558,566,568,569,571,574,576,541,544,545,546,550,551,559,560,561,564,567,572,573,577,539,540,543,547,553,554,562,563,565,570,575,578,121,122,123],
 "Artifact Trove":[100,101,103,104,105,106,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,166,373,797,'Book_Artifact']
};
const names:Record<string,string>={
 74:"Prismatic Shard",
 82:"Groovy Chair",
 84:"Frozen Tear",
 86:"Earth Crystal",
 100:"Chipped Amphora",
 101:"Arrowhead",
 103:"Ancient Doll",
 104:"Elvish Jewelry",
 105:"Chewing Stick",
 106:"Ornamental Fan",
 108:"Rare Disc",
 109:"Ancient Sword",
 110:"Rusty Spoon",
 111:"Rusty Spur",
 112:"Rusty Cog",
 113:"Chicken Statue",
 114:"Ancient Seed",
 115:"Prehistoric Tool",
 116:"Dried Starfish",
 117:"Anchor",
 118:"Glass Shards",
 119:"Bone Flute",
 120:"Prehistoric Handaxe",
 121:"Dwarvish Helm",
 122:"Dwarf Gadget",
 123:"Ancient Drum",
 124:"Golden Mask",
 125:"Golden Relic",
 166:"Treasure Chest",
 330:"Clay",
 373:"Golden Pumpkin",
 378:"Copper Ore",
 380:"Iron Ore",
 382:"Coal",
 384:"Gold Ore",
 386:"Iridium Ore",
 390:"Stone",
 538:"Alamite",
 539:"Bixite",
 540:"Baryte",
 541:"Aerinite",
 542:"Calcite",
 543:"Dolomite",
 544:"Esperite",
 545:"Fluorapatite",
 546:"Geminite",
 547:"Helvite",
 548:"Jamborite",
 549:"Jagoite",
 550:"Kyanite",
 551:"Lunarite",
 552:"Malachite",
 553:"Neptunite",
 554:"Lemon Stone",
 555:"Nekoite",
 556:"Orpiment",
 557:"Petrified Slime",
 558:"Thunder Egg",
 559:"Pyrite",
 560:"Ocean Stone",
 561:"Ghost Crystal",
 562:"Tigerseye",
 563:"Jasper",
 564:"Opal",
 565:"Fire Opal",
 566:"Celestine",
 567:"Marble",
 568:"Sandstone",
 569:"Granite",
 570:"Basalt",
 571:"Limestone",
 572:"Soapstone",
 573:"Hematite",
 574:"Mudstone",
 575:"Obsidian",
 576:"Slate",
 577:"Fairy Stone",
 578:"Star Shards",
 797:"Pearl",
 890:"Qi Bean",
 Book_Artifact:'Treasure Appraisal Guide'
};
const max=2147483647;
const prime1=0x9e3779b1, prime2=0x85ebca77, prime3=0xc2b2ae3d, prime4=0x27d4eb2f;
const rotate=(word:number,count:number)=>(word<<count)|(word>>>(32-count));
function combine(seed:number,value:number){return Math.imul(rotate(seed+Math.imul(value,prime2),13),prime1)}
// xxHash32 of exactly five little-endian signed 32-bit words, with zero hash seed.
function hashWords(a:number,b:number,c:number){
 const lanes=[combine(prime1+prime2,a),combine(prime2,b),combine(0,c),combine(-prime1,0)];
 let hash=(rotate(lanes[0],1)+rotate(lanes[1],7)+rotate(lanes[2],12)+rotate(lanes[3],18)+20)|0;
 hash=Math.imul(rotate(hash,17),prime4);
 hash=Math.imul(hash^(hash>>>15),prime2);
 hash=Math.imul(hash^(hash>>>13),prime3);
 return hash^(hash>>>16);
}
function random(seed:number){
 const state=new Int32Array(56);
 let previous=161803398-(seed===-2147483648?max:Math.abs(seed)),next=1;
 state[55]=previous;
 for(let i=1;i<55;i++){
  const index=21*i%55;
  state[index]=next;
  next=(previous-next)|0;
  if(next<0)next+=max;
  previous=state[index];
 }
 for(let pass=0;pass<4;pass++)for(let i=1;i<56;i++){
  const value=(state[i]-state[1+(i+30)%55])|0;
  state[i]=value<0?value+max:value;
 }
 let index=0,other=21;
 return ()=>{
  if(++index===56)index=1;
  if(++other===56)other=1;
  let value=state[index]-state[other];
  if(value===max)value--;
  if(value<0)value+=max;
  state[index]=value;
  return value*(1/max);
 };
}
function identifier(raw:string,signed=false){
 const value=raw.trim();
 if(!/^-?\d{1,20}$/.test(value))throw Error('Enter both complete numeric IDs from the main save.');
 const id=BigInt(value);
 if(signed?(id<-(1n<<63n)||id>=(1n<<64n)):(id<0n||id>=(1n<<64n)))throw Error('ID is out of range.');
 return id;
}
export function predictGeodes(input:GeodeInput,type:GeodeType,count=20){
 if(!GEODE_TYPES.includes(type)||!Number.isInteger(input.opened)||input.opened<0||input.opened>1000000||!Number.isInteger(input.mineLevel)||input.mineLevel<0||input.mineLevel>120||!Number.isInteger(count)||count<1||count>100)throw Error('Enter a valid container, opened count (0–1,000,000) and mine level (0–120).');
 const game=Number(identifier(input.gameId)%BigInt(max*2))/2;
 const player=(Number(BigInt.asIntN(32,identifier(input.playerId,true)))/2)%max;
 return Array.from({length:count},(_,index)=>{
  const opening=input.opened+index+1;
  const rand=random(input.legacy?Math.floor((opening+game+player)%max):hashWords(opening,game,player));
  for(let i=0;i<2;i++){
   const warm=1+Math.floor(rand()*9);
   for(let j=0;j<warm;j++)rand();
  }
  const qi=rand()<.1;
  const result=(id:number|string,quantity=1)=>({opening,id,name:names[id],quantity});
  if(qi&&input.qiBeans)return result(890);
  const table=contents[type];
  if(type==='Artifact Trove')return result(table[Math.floor(rand()*table.length)]);
  if(rand()<.5){
   const roll=rand();
   if(type==='Omni Geode'&&roll<.008&&opening>15)return result(74);
   return result(table[Math.floor((type==='Omni Geode'?rand():roll)*table.length)]);
  }
  let quantity=Math.floor(rand()*3)*2+1;
  if(rand()<.1)quantity=10;
  if(rand()<.01)quantity=20;
  if(rand()<.5){
   const roll=Math.floor(rand()*4);
   if(roll<2)return result(390,quantity);
   if(roll===2)return result(330);
   return result(type==='Omni Geode'?82+2*Math.floor(rand()*3):type==='Magma Geode'?82:type==='Frozen Geode'?84:86);
  }
  const ores=type==='Geode'?[378,input.mineLevel>25?380:378,382]:type==='Frozen Geode'?[378,380,382,input.mineLevel>75?384:380]:[378,380,382,384,386];
  const ore=ores[Math.floor(rand()*ores.length)];
  return result(ore,ore===386?Math.floor(quantity/2+1):quantity);
 });
}
