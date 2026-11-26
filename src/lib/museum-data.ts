// Factual names, acquisition routes and donation thresholds; independently encoded, no game assets.
export const SOURCES=['Artifact spot','Artifact Trove','Monster drop','Mine digging','Fishing chest','Bone node','Secret note','Gem node','Mine forage','Geode','Frozen Geode','Magma Geode','Omni Geode','Prehistoric floor'] as const;
export type Source=typeof SOURCES[number];
export type Kind='artifact'|'gem'|'foraged'|'geode';
export type MuseumItem={id:string;name:string;kind:Kind;sources:Source[];hint:string};
const id=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
const a=(name:string,sources:Source[],hint:string):MuseumItem=>({id:id(name),name,kind:'artifact',sources,hint});
const spot='Artifact spot',trove='Artifact Trove',drop='Monster drop',dig='Mine digging',fish='Fishing chest',bone='Bone node',note='Secret note';
export const ARTIFACTS=[
a('Dwarf Scroll I',[dig,drop],'Mine soil; monster drops'),
a('Dwarf Scroll II',[dig,drop],'Mine soil 1–39; Dust Sprites, frost bats, blue slimes, ghosts'),
a('Dwarf Scroll III',[drop],'Blue slimes and other monsters'),
a('Dwarf Scroll IV',[dig,drop],'Mine soil 80+; eligible monsters'),
a('Chipped Amphora',[spot,trove],'Town'),
a('Arrowhead',[spot,trove],'Mountain, forest, bus stop'),
a('Ancient Doll',[spot,trove,fish],'Mountain, forest, bus stop, town'),
a('Elvish Jewelry',[spot,trove,fish],'Forest'),
a('Chewing Stick',[spot,trove,fish,drop],'Mountain, forest, town; Duggies'),
a('Ornamental Fan',[spot,trove,fish],'Beach, forest, town'),
a('Dinosaur Egg',[spot,fish,drop,'Prehistoric floor'],'Mountain; Pepper Rex; Skull Cavern prehistoric floors'),
a('Rare Disc',[fish,drop,trove],'Shadow monsters and eligible bats'),
a('Ancient Sword',[spot,trove,fish],'Forest, mountain'),
a('Rusty Spoon',[spot,trove,fish,dig],'Town; mine soil'),
a('Rusty Spur',[spot,trove,fish],'Farm'),
a('Rusty Cog',[spot,trove,fish,dig],'Mountain; mine soil'),
a('Chicken Statue',[spot,trove,fish],'Farm'),
a('Ancient Seed',[spot,trove,fish,drop],'Forest, mountain; bugs, grubs and flies'),
a('Prehistoric Tool',[spot,trove,fish],'Bus stop, forest, mountain'),
a('Dried Starfish',[spot,trove,fish],'Beach'),
a('Anchor',[spot,trove,fish],'Beach'),
a('Glass Shards',[spot,trove,fish],'Beach'),
a('Bone Flute',[spot,trove,fish],'Forest, mountain, town'),
a('Prehistoric Handaxe',[spot,trove],'Bus stop, mountain, forest'),
a('Dwarvish Helm',[dig,'Geode','Omni Geode',trove],'Mine soil 1–39'),
a('Dwarf Gadget',[dig,'Magma Geode','Omni Geode',trove],'Mine soil 40–79'),
a('Ancient Drum',[spot,'Frozen Geode','Omni Geode',trove],'Bus stop, forest, town'),
a('Golden Mask',[spot,trove],'Desert'),
a('Golden Relic',[spot,trove],'Desert'),
a('Strange Doll (green)',[spot,dig,fish,note],'Secret Note #17; rare digging finds'),
a('Strange Doll (yellow)',[spot,dig,fish,note],'Secret Note #18; rare digging finds'),
a('Prehistoric Scapula',[spot,drop,bone],'Forest, town; Skeletons'),
a('Prehistoric Tibia',[spot,drop,bone],'Railroad, forest; Pepper Rex'),
a('Prehistoric Skull',[spot,drop,bone],'Mountain; Haunted Skulls'),
a('Skeletal Hand',[spot,drop,bone],'Backwoods, beach; Haunted Skulls'),
a('Prehistoric Rib',[spot,drop,bone],'Town, farm; Pepper Rex'),
a('Prehistoric Vertebra',[spot,drop,bone],'Bus stop; Pepper Rex'),
a('Skeletal Tail',[dig,fish,bone],'Mine and Skull Cavern soil'),
a('Nautilus Fossil',[spot,fish,bone],'Beach'),
a('Amphibian Fossil',[spot,fish,bone],'Forest, mountain'),
a('Palm Fossil',[spot,bone],'Desert, forest, beach'),
a('Trilobite',[spot,bone],'Beach, forest, mountain')
];
const gems=['Emerald','Aquamarine','Ruby','Amethyst','Topaz','Jade','Diamond'].map(name=>({id:id(name),name,kind:'gem' as const,sources:['Gem node' as Source],hint:'Break matching gem nodes; additional routes vary.'}));
const shard:MuseumItem={id:'prismatic-shard',name:'Prismatic Shard',kind:'gem',sources:['Omni Geode','Monster drop','Fishing chest'],hint:'Mystic stones and iridium nodes are also possible sources.'};
const forage:MuseumItem[]=[['Quartz','Mines'],['Fire Quartz','Mine floors 81–119'],['Frozen Tear','Mine floors 41–79'],['Earth Crystal','Mine floors 1–39']].map(([name,hint])=>({id:id(name),name,kind:'foraged',sources:['Mine forage'],hint}));
const groups:[Source,string[]][]=[
['Geode',['Alamite','Calcite','Jamborite','Jagoite','Malachite','Nekoite','Orpiment','Petrified Slime','Thunder Egg','Celestine','Sandstone','Granite','Limestone','Mudstone','Slate']],
['Frozen Geode',['Aerinite','Esperite','Fluorapatite','Geminite','Kyanite','Lunarite','Pyrite','Ocean Stone','Ghost Crystal','Opal','Marble','Soapstone','Hematite','Fairy Stone']],
['Magma Geode',['Bixite','Baryte','Dolomite','Helvite','Neptunite','Lemon Stone','Tigerseye','Jasper','Fire Opal','Basalt','Obsidian','Star Shards']]
];
export const MINERALS:MuseumItem[]=[...gems,shard,...forage,...groups.flatMap(([source,names])=>names.map(name=>({id:id(name),name,kind:'geode' as const,sources:[source,'Omni Geode' as Source],hint:'Crack the indicated geode type or an Omni Geode.'})))];
export const MUSEUM_ITEMS=[...ARTIFACTS,...MINERALS];
export const ITEM_MAP=new Map(MUSEUM_ITEMS.map(i=>[i.id,i]));
export type Reward={id:string;name:string;group:'total'|'mineral'|'artifact';threshold:number;requires:string[];note?:string};
const rewards=(group:Reward['group'],entries:[number,string][]):Reward[]=>entries.map(([threshold,name])=>({id:group+'-'+threshold,name,group,threshold,requires:[]}));
export const REWARDS:Reward[]=[
...rewards('total',[[5,'9 Cauliflower Seeds'],[10,'9 Melon Seeds'],[15,'Starfruit Seeds'],[20,'A Night On Eco-Hill'],[25,'Jade Hills'],[30,'Lg. Futan Bear'],[35,'9 Pumpkin Seeds'],[40,'Rarecrow #8'],[50,'Bear Statue'],[60,'Rusty Key'],[70,'3 Triple Shot Espresso'],[80,'5 Farm Warp Totems'],[90,'Magic Rock Candy'],[95,'Stardrop']]),
...rewards('mineral',[[11,'Standing Geode'],[21,'Singing Stone'],[31,'Obsidian Vase'],[41,'Crystal Chair'],[50,'Crystalarium']]),
...rewards('artifact',[[15,'Skeleton Statue'],[20,'Rarecrow #7']]),
{id:'burnt',name:'Burnt Offering',group:'artifact',threshold:11,requires:['rare-disc','dwarf-gadget']},
{id:'drum',name:'Drum Block',group:'artifact',threshold:3,requires:['ancient-drum']},
{id:'seed',name:'Ancient Seeds + recipe',group:'artifact',threshold:1,requires:['ancient-seed']},
{id:'flute',name:'Flute Block',group:'artifact',threshold:3,requires:['bone-flute']},
{id:'chicken',name:'Chicken Statue furniture',group:'artifact',threshold:5,requires:['chicken-statue']},
{id:'translation',name:'Dwarvish Translation Guide',group:'artifact',threshold:4,requires:['dwarf-scroll-i','dwarf-scroll-ii','dwarf-scroll-iii','dwarf-scroll-iv']},
{id:'sloth-l',name:'Sloth Skeleton L',group:'artifact',threshold:3,requires:['prehistoric-skull','skeletal-hand','prehistoric-scapula']},
{id:'sloth-m',name:'Sloth Skeleton M',group:'artifact',threshold:2,requires:['prehistoric-rib','prehistoric-vertebra']},
{id:'sloth-r',name:'Sloth Skeleton R',group:'artifact',threshold:2,requires:['prehistoric-tibia','skeletal-tail']}
];
