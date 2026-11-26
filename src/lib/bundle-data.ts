// Independently transcribed requirements of the standard bundle set. No game art or extracted asset files.
export const ROOMS=[{id:'crafts',name:'Crafts Room',reward:'Quarry bridge',color:'#6b9160',icon:'leaf'},{id:'pantry',name:'Pantry',reward:'Greenhouse',color:'#ad8c4d',icon:'sprout'},{id:'fish',name:'Fish Tank',reward:'Panning access',color:'#548b9e',icon:'fish'},{id:'boiler',name:'Boiler Room',reward:'Minecarts',color:'#9d7159',icon:'ore'},{id:'board',name:'Bulletin Board',reward:'Villager friendship',color:'#8b779f',icon:'heart'},{id:'vault',name:'Vault',reward:'Bus repair',color:'#b39b52',icon:'coin'},{id:'missing',name:'Abandoned JojaMart',reward:'Movie Theater',color:'#7f8892',icon:'star'}] as const;
export type RoomId=typeof ROOMS[number]['id'];
export type Season='spring'|'summer'|'fall'|'winter';
export type Slot={id:string;name:string;quantity:number;quality:0|1|2;seasons:Season[];hint:string;gold:boolean};
export type Bundle={id:string;room:RoomId;name:string;needed:number;reward:string;slots:Slot[]};
type Entry=[name:string,quantity?:number,quality?:0|1|2,seasons?:Season[],hint?:string];
const S:Season[]=['spring'],U:Season[]=['summer'],F:Season[]=['fall'],W:Season[]=['winter'],UF:Season[]=['summer','fall'],SF:Season[]=['spring','fall'],SU:Season[]=['spring','summer'],SUF:Season[]=['spring','summer','fall'],UW:Season[]=['summer','winter'];
const E=(name:string,seasons:Season[]=[],hint=''):Entry=>[name,1,0,seasons,hint];
const B=(room:RoomId,id:string,name:string,needed:number,reward:string,entries:Entry[]):Bundle=>({room,id,name,needed,reward,slots:entries.map(([name,quantity=1,quality=0,seasons=[],hint=''],i)=>({id:id+':'+i,name,quantity,quality,seasons,hint,gold:room==='vault'}))});
const gold=(n:number,reward:string)=>B('vault','gold-'+n,n.toLocaleString('en-US')+'g Bundle',1,reward,[['Gold',n,0,[],'Pay in full']]);
export const BUNDLES:Bundle[]=[
 B('crafts','spring-forage','Spring Foraging',4,'30 Spring Seeds',[E('Wild Horseradish',S,'Forage'),E('Daffodil',S,'Forage'),E('Leek',S,'Forage'),E('Dandelion',S,'Forage')]),
 B('crafts','summer-forage','Summer Foraging',3,'30 Summer Seeds',[E('Grape',['summer','fall'],'Forage / crop'),E('Spice Berry',U,'Forage'),E('Sweet Pea',U,'Forage')]),
 B('crafts','fall-forage','Fall Foraging',4,'30 Fall Seeds',[E('Common Mushroom',SF,'Forage / cave'),E('Wild Plum',F,'Forage'),E('Hazelnut',F,'Forage'),E('Blackberry',F,'Forage')]),
 B('crafts','winter-forage','Winter Foraging',4,'30 Winter Seeds',[E('Winter Root',W,'Digging / mines'),E('Crystal Fruit',W,'Forage / mines'),E('Snow Yam',W,'Digging'),E('Crocus',W,'Forage')]),
 B('crafts','construction','Construction',4,'Charcoal Kiln',[['Wood',99,0,[],'Trees / carpenter'],['Wood',99,0,[],'Second separate stack'],['Stone',99,0,[],'Mining / carpenter'],['Hardwood',10,0,[],'Large stumps / logs']]),
 B('crafts','exotic','Exotic Foraging',5,"5 Autumn’s Bounty",[E('Coconut',[],'Desert'),E('Cactus Fruit',[],'Desert'),E('Cave Carrot',[],'Mines'),E('Red Mushroom',UF,'Mines / woods'),E('Purple Mushroom',F,'Mines / cave'),E('Maple Syrup',[],'Maple tapper'),E('Oak Resin',[],'Oak tapper'),E('Pine Tar',[],'Pine tapper'),E('Morel',S,'Secret Woods')]),
 B('pantry','spring-crops','Spring Crops',4,'20 Speed-Gro',[E('Parsnip',S,'Crop'),E('Green Bean',S,'Crop'),E('Cauliflower',S,'Crop'),E('Potato',S,'Crop')]),
 B('pantry','summer-crops','Summer Crops',4,'Quality Sprinkler',[E('Tomato',U,'Crop'),E('Hot Pepper',U,'Crop'),E('Blueberry',U,'Crop'),E('Melon',U,'Crop')]),
 B('pantry','fall-crops','Fall Crops',4,'Bee House',[E('Corn',UF,'Crop'),E('Eggplant',F,'Crop'),E('Pumpkin',F,'Crop'),E('Yam',F,'Crop')]),
 B('pantry','quality','Quality Crops',3,'Preserves Jar',[['Parsnip',5,2,S,'Crop'],['Melon',5,2,U,'Crop'],['Pumpkin',5,2,F,'Crop'],['Corn',5,2,UF,'Crop']]),
 B('pantry','animal','Animal',5,'Cheese Press',[E('Large Milk',[],'Cow'),E('Large Brown Egg',[],'Brown chicken'),E('Large White Egg',[],'White chicken'),E('Large Goat Milk',[],'Goat'),E('Wool',[],'Sheep / rabbit'),E('Duck Egg',[],'Duck')]),
 B('pantry','artisan','Artisan',6,'Keg',[E('Truffle Oil',[],'Oil maker'),E('Cloth',[],'Loom'),E('Goat Cheese',[],'Cheese press'),E('Cheese',[],'Cheese press'),E('Honey',[],'Bee house'),E('Jelly',[],'Preserves jar'),E('Apple',F,'Fruit tree / cave'),E('Apricot',S,'Fruit tree / cave'),E('Orange',U,'Fruit tree / cave'),E('Peach',U,'Fruit tree / cave'),E('Pomegranate',F,'Fruit tree / cave'),E('Cherry',S,'Fruit tree / cave')]),
 B('fish','river','River Fish',4,'30 Deluxe Bait',[E('Sunfish',SU,'River · 6am–7pm · sun'),E('Catfish',SF,'River · 6am–midnight · rain'),E('Shad',SUF,'River · 9am–2am · rain'),E('Tiger Trout',['fall','winter'],'River · 6am–7pm')]),
 B('fish','lake','Lake Fish',4,'Dressed Spinner',[E('Largemouth Bass',[],'Mountain lake · 6am–7pm'),E('Carp',SUF,'Mountain lake · anytime'),E('Bullhead',[],'Mountain lake · anytime'),E('Sturgeon',UW,'Mountain lake · 6am–7pm')]),
 B('fish','ocean','Ocean Fish',4,'5 Warp Totems: Beach',[E('Sardine',['spring','fall','winter'],'Ocean · 6am–7pm'),E('Tuna',UW,'Ocean · 6am–7pm'),E('Red Snapper',UF,'Ocean · 6am–7pm · rain'),E('Tilapia',UF,'Ocean · 6am–2pm')]),
 B('fish','night','Night Fishing',3,'Glow Ring',[E('Walleye',F,'River / lake / forest pond · noon–2am · rain'),E('Bream',[],'River · 6pm–2am'),E('Eel',SF,'Ocean · 4pm–2am · rain')]),
 B('fish','crab','Crab Pot',5,'3 Crab Pots',[E('Lobster',[],'Ocean pot'),E('Crayfish',[],'Freshwater pot'),E('Crab',[],'Ocean pot / mines'),E('Cockle',[],'Ocean pot / beach'),E('Mussel',[],'Ocean pot / beach'),E('Shrimp',[],'Ocean pot'),E('Snail',[],'Freshwater pot'),E('Periwinkle',[],'Freshwater pot'),E('Oyster',[],'Ocean pot / beach'),E('Clam',[],'Ocean pot / beach')]),
 B('fish','specialty','Specialty Fish',4,"5 Dish O’ The Sea",[E('Pufferfish',U,'Ocean · noon–4pm · sun'),E('Ghostfish',[],'Mines · floors 20 / 60'),E('Sandfish',[],'Desert · 6am–8pm'),E('Woodskip',[],'Secret Woods / Forest Farm')]),
 B('boiler','blacksmith','Blacksmith’s',3,'Furnace',[E('Copper Bar',[],'Smelt copper'),E('Iron Bar',[],'Smelt iron'),E('Gold Bar',[],'Smelt gold')]),
 B('boiler','geologist','Geologist’s',4,'5 Omni Geodes',[E('Quartz',[],'Mines'),E('Earth Crystal',[],'Mines · floors 1–39'),E('Frozen Tear',[],'Mines · floors 41–79'),E('Fire Quartz',[],'Mines · floors 81–119')]),
 B('boiler','adventurer','Adventurer’s',2,'Small Magnet Ring',[['Slime',99,0,[],'Slimes'],['Bat Wing',10,0,[],'Bats'],E('Solar Essence',[],'Monster drops / Krobus'),E('Void Essence',[],'Monster drops / Krobus')]),
 B('board','chef','Chef’s',6,'3 Pink Cakes',[E('Maple Syrup',[],'Maple tapper'),E('Fiddlehead Fern',U,'Secret Woods / green rain'),E('Truffle',SUF,'Pig'),E('Poppy',U,'Crop'),E('Maki Roll',[],'Cooking'),E('Fried Egg',[],'Cooking')]),
 B('board','dye','Dye',6,'Seed Maker',[E('Red Mushroom',UF,'Mines / woods'),E('Sea Urchin',[],'Beach tide pools'),E('Sunflower',UF,'Crop'),E('Duck Feather',[],'Duck'),E('Aquamarine',[],'Mining'),E('Red Cabbage',U,'Crop · standard shop year 2+')]),
 B('board','research','Field Research',4,'Recycling Machine',[E('Purple Mushroom',F,'Mines / cave'),E('Nautilus Shell',W,'Beach'),E('Chub',[],'River / mountain lake'),E('Frozen Geode',[],'Mines · floors 41–79')]),
 B('board','fodder','Fodder',3,'Heater',[['Wheat',10,0,UF,'Crop'],['Hay',10,0,[],'Grass / Marnie'],['Apple',3,0,F,'Fruit tree / cave']]),
 B('board','enchanter','Enchanter’s',4,'5 Gold Bars',[E('Oak Resin',[],'Oak tapper'),E('Wine',[],'Keg'),E("Rabbit’s Foot",[],'Rabbit / monster drop'),E('Pomegranate',F,'Fruit tree / cave')]),
 gold(2500,'3 Chocolate Cakes'),gold(5000,'30 Quality Fertilizer'),gold(10000,'Lightning Rod'),gold(25000,'Crystalarium'),
 B('missing','missing','The Missing Bundle',5,'Movie Theater',[['Wine',1,1,[],'Cask · silver or better'],E('Dinosaur Mayonnaise',[],'Mayonnaise machine'),E('Prismatic Shard',[],'Mining'),['Ancient Fruit',5,2,SUF,'Crop'],['Void Salmon',1,2,[],'Witch’s Swamp'],E('Caviar',[],'Sturgeon roe / preserves jar')])
];
export const SLOT_MAP=new Map(BUNDLES.flatMap(b=>b.slots.map(s=>[s.id,s] as const)));
