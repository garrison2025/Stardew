// Independently designed semantic pixel symbols. These are not Stardew sprites.
import {CATALOGS} from './game-collections.ts';
import {MUSEUM_ITEMS} from './museum-data.ts';
import {GAME_CROPS} from './crop-data.ts';
export type IconKind='fish'|'shell'|'jelly'|'dish'|'drink'|'machine'|'fence'|'path'|'bomb'|'ring'|'seed'|'root'|'fruit'|'flower'|'leaf'|'ore'|'bar'|'gem'|'artifact'|'bone'|'scroll'|'egg'|'milk'|'wood'|'jar'|'coin'|'walnut'|'tool'|'bundle'|'doll';
const groups:Record<IconKind,string[]>={
 fish:['#79adbf','#87ab7a','#c38c63','#9e91bb','#7e9ac2'],shell:['#c5ab8c','#b2c2ba','#be9ba0'],jelly:['#84b6bd','#ab9dcc','#91bc83'],dish:['#d6a965','#c47f66','#85a56d','#e5c493'],drink:['#ad7659','#bfa26e','#88a66c'],machine:['#9e927c','#719087','#b28d64'],fence:['#aa8860','#a8aba4','#87959c'],path:['#b69c78','#8faaa8','#c3a08f'],bomb:['#8b8f91','#a85f50','#b5a463'],ring:['#d1b76d','#9fbdc4','#ba9fc0'],seed:['#bba67c','#8aa36c','#c8b16a'],root:['#d6a267','#b77d91','#dcd0a5'],fruit:['#bd6f64','#d5a45b','#8ba669','#8f83b9'],flower:['#dfb55c','#bb83a7','#94b5bd'],leaf:['#7c9d60','#92b584','#699b71'],ore:['#9d8e86','#b9876c','#8f9fa7'],bar:['#bc916c','#b4c5c5','#d9b56b'],gem:['#82afb7','#b18bb7','#8cb47d','#c28f80'],artifact:['#bc9871','#a6a294','#c2aa87'],bone:['#e2d4ae','#cbbfa4','#eee3cc'],scroll:['#d6c390','#b99c73'],egg:['#eee2c4','#c69268','#a99cb7'],milk:['#e5e5d4','#b1c9cb','#c5afa0'],wood:['#b18a60','#a1795a'],jar:['#bc8b68','#8caa72','#b889ac'],coin:['#e2bd62'],walnut:['#d6ae55'],tool:['#95a7a9','#b0a08a','#7d9a91'],bundle:['#a8ba8e','#d6b57c','#ad97b6'],doll:['#91b77b','#d8bb6c']};
export function iconHash(name:string){let h=2166136261;for(const ch of name.toLowerCase().trim())h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0}
const fish=new Set(CATALOGS.fishing.map(x=>x.name.toLowerCase())),dishes=new Set(CATALOGS.cooking.map(x=>x.name.toLowerCase())),crafts=new Set(CATALOGS.crafting.map(x=>x.name.toLowerCase())),museum=new Map(MUSEUM_ITEMS.map(x=>[x.name.toLowerCase(),x.kind])),crops=new Map(GAME_CROPS.map(x=>[x.name.toLowerCase(),x.color]));
export function iconSpec(name:string,context?:string){const n=name.toLowerCase().trim(),h=iconHash(n);let kind:IconKind='bundle';
 if(n==='gold'||n==='gold coins')kind='coin';else if(n==='golden walnut')kind='walnut';
 else if(/strange doll/.test(n))kind='doll';else if(/scroll/.test(n))kind='scroll';else if(/fossil|skeletal|prehistoric (scapula|tibia|skull|rib|vertebra)|bone fragment/.test(n))kind='bone';
 else if(context==='artifact'||museum.get(n)==='artifact')kind='artifact';
 else if(context==='gem'||context==='geode'||context==='foraged'||museum.has(n))kind='gem';
 else if(/river jelly|sea jelly|cave jelly/.test(n))kind='jelly';
 else if(/^(clam|oyster|cockle|mussel|snail|periwinkle|crab|lobster|shrimp|crayfish)$/.test(n))kind='shell';
 else if(/seaweed|algae/.test(n))kind='leaf';
 else if(fish.has(n)||n==='any fish'||n==='smoked fish'||context==='fishing')kind='fish';
 else if(/wine|beer|pale ale|mead|coffee|espresso|green tea|juice|ginger ale/.test(n))kind='drink';
 else if(dishes.has(n)||context==='cooking')kind='dish';
 else if(/egg/.test(n)&&!crafts.has(n))kind='egg';
 else if(/milk|cheese/.test(n)&&!crafts.has(n))kind='milk';
 else if(/mayonnaise|pickles|^jelly$|honey|roe|syrup|resin|pine tar|oil|caviar/.test(n)&&!crafts.has(n))kind='jar';
 else if(/bar$|refined quartz/.test(n)&&!crafts.has(n))kind='bar';
 else if(/ore$|stone$|coal$|clay$|cinder shard/.test(n)&&!crafts.has(n))kind='ore';
 else if(/^(wood|hardwood)$/.test(n))kind='wood';
 else if(/fence|^gate$/.test(n))kind='fence';else if(/floor$|path$/.test(n))kind='path';else if(/bomb|ammo/.test(n))kind='bomb';else if(/ring$/.test(n))kind='ring';
 else if(/seed|sapling|bulb|starter|fertilizer|retaining soil|speed-gro/.test(n))kind='seed';
 else if(/keg|jar|chest|furnace|kiln|smoker|sprinkler|press|maker|incubator|tapper|loom|crusher|dehydrator|crystalarium|hopper|recycling|anvil|forge|worm bin|solar panel/.test(n))kind='machine';
 else if(crafts.has(n)||context==='crafting')kind='tool';
 else if(/parsnip|carrot|radish|beet|yam|ginger|taro|potato|root|garlic/.test(n))kind='root';
 else if(/rose|tulip|flower|spangle|jazz|poppy|crocus|sweet pea|daffodil/.test(n))kind='flower';
 else if(/berry|berries|fruit|melon|pumpkin|apple|orange|peach|cherry|grape|banana|mango|pineapple|plum|apricot|coconut|pomegranate/.test(n))kind='fruit';
 else if(crops.has(n)||/leaf|leaves|fiber|moss|kale|fern|onion|wheat|corn|bean|cabbage|broccoli|vegetable|leek/.test(n))kind='leaf';
 const colors=groups[kind],color=crops.get(n)??(n.includes('doll (green)')?'#91b77b':n.includes('doll (yellow)')?'#d8bb6c':colors[h%colors.length]);return {kind,color,variant:(h>>>8)%4,detail:(h>>>16)%8};
}
