// Independently transcribed numerical facts for a deliberately limited base-quality crop model.
export type CropSeason='spring'|'summer'|'autumn'|'winter';
export type GameCrop={id:string;name:string;seasons:CropSeason[];seed:number;price:number;growth:number;regrow:number;yield:number;color:string;special?:'festival'|'year2'|'oasis';trellis?:boolean};
export const GAME_CROPS:GameCrop[]=[
{id:'parsnip',name:'Parsnip',seasons:['spring'],seed:20,price:35,growth:4,regrow:0,yield:1,color:'#e8d9a4'},
{id:'potato',name:'Potato',seasons:['spring'],seed:50,price:80,growth:6,regrow:0,yield:1,color:'#c4a26c'},
{id:'cauliflower',name:'Cauliflower',seasons:['spring'],seed:80,price:175,growth:12,regrow:0,yield:1,color:'#e9e6cc'},
{id:'green-bean',name:'Green bean',seasons:['spring'],seed:60,price:40,growth:10,regrow:3,yield:1,color:'#8cc460',trellis:true},
{id:'kale',name:'Kale',seasons:['spring'],seed:70,price:110,growth:6,regrow:0,yield:1,color:'#548b50'},
{id:'strawberry',name:'Strawberry',seasons:['spring'],seed:100,price:120,growth:8,regrow:4,yield:1,color:'#d95b65',special:'festival'},
{id:'blueberry',name:'Blueberry',seasons:['summer'],seed:80,price:50,growth:13,regrow:4,yield:3,color:'#667ac0'},
{id:'melon',name:'Melon',seasons:['summer'],seed:80,price:250,growth:12,regrow:0,yield:1,color:'#e5a0b0'},
{id:'corn',name:'Corn',seasons:['summer','autumn'],seed:150,price:50,growth:14,regrow:4,yield:1,color:'#e5cd6b'},
{id:'tomato',name:'Tomato',seasons:['summer'],seed:50,price:60,growth:11,regrow:4,yield:1,color:'#d66a4d'},
{id:'hot-pepper',name:'Hot pepper',seasons:['summer'],seed:40,price:40,growth:5,regrow:3,yield:1,color:'#d86549'},
{id:'radish',name:'Radish',seasons:['summer'],seed:40,price:90,growth:6,regrow:0,yield:1,color:'#d78379'},
{id:'wheat',name:'Wheat',seasons:['summer','autumn'],seed:10,price:25,growth:4,regrow:0,yield:1,color:'#d9b45c'},
{id:'cranberries',name:'Cranberries',seasons:['autumn'],seed:240,price:75,growth:7,regrow:5,yield:2,color:'#bd445d'},
{id:'pumpkin',name:'Pumpkin',seasons:['autumn'],seed:100,price:320,growth:13,regrow:0,yield:1,color:'#e28e43'},
{id:'eggplant',name:'Eggplant',seasons:['autumn'],seed:20,price:60,growth:5,regrow:5,yield:1,color:'#8861a8'},
{id:'yam',name:'Yam',seasons:['autumn'],seed:60,price:160,growth:10,regrow:0,yield:1,color:'#bf7e4b'},
{id:'bok-choy',name:'Bok choy',seasons:['autumn'],seed:50,price:80,growth:4,regrow:0,yield:1,color:'#91b975'},
{id:'grape',name:'Grape',seasons:['autumn'],seed:60,price:80,growth:10,regrow:3,yield:1,color:'#976bb5',trellis:true}
];
// Separate reference extensions preserve the original map-marker IDs and original processing model.
export const SHOP_CROPS:GameCrop[]=[
{id:'blue-jazz',name:'Blue Jazz',seasons:['spring'],seed:30,price:50,growth:7,regrow:0,yield:1,color:'#728ad0'},
{id:'tulip',name:'Tulip',seasons:['spring'],seed:20,price:30,growth:6,regrow:0,yield:1,color:'#d97185'},
{id:'garlic',name:'Garlic',seasons:['spring'],seed:40,price:60,growth:4,regrow:0,yield:1,color:'#d9c8ab',special:'year2'},
{id:'rhubarb',name:'Rhubarb',seasons:['spring'],seed:100,price:220,growth:13,regrow:0,yield:1,color:'#b75c66',special:'oasis'},
{id:'unmilled-rice',name:'Unmilled Rice (dry tile)',seasons:['spring'],seed:40,price:30,growth:8,regrow:0,yield:1,color:'#d9c890'},
{id:'hops',name:'Hops',seasons:['summer'],seed:60,price:25,growth:11,regrow:1,yield:1,color:'#84a66a',trellis:true},
{id:'poppy',name:'Poppy',seasons:['summer'],seed:100,price:140,growth:7,regrow:0,yield:1,color:'#e56e5a'},
{id:'red-cabbage',name:'Red Cabbage',seasons:['summer'],seed:100,price:260,growth:9,regrow:0,yield:1,color:'#945a9c',special:'year2'},
{id:'starfruit',name:'Starfruit',seasons:['summer'],seed:400,price:750,growth:13,regrow:0,yield:1,color:'#dcca55',special:'oasis'},
{id:'summer-spangle',name:'Summer Spangle',seasons:['summer'],seed:50,price:90,growth:8,regrow:0,yield:1,color:'#dfb75f'},
{id:'sunflower',name:'Sunflower (Pierre)',seasons:['summer','autumn'],seed:200,price:80,growth:8,regrow:0,yield:1,color:'#e3c24f'},
{id:'amaranth',name:'Amaranth',seasons:['autumn'],seed:70,price:150,growth:7,regrow:0,yield:1,color:'#ad6b9a'},
{id:'artichoke',name:'Artichoke',seasons:['autumn'],seed:30,price:160,growth:8,regrow:0,yield:1,color:'#9ba960',special:'year2'},
{id:'beet',name:'Beet',seasons:['autumn'],seed:20,price:100,growth:6,regrow:0,yield:1,color:'#a44670',special:'oasis'},
{id:'fairy-rose',name:'Fairy Rose',seasons:['autumn'],seed:200,price:290,growth:12,regrow:0,yield:1,color:'#c77cb1'}
];
export const SEASON_CROPS=[...GAME_CROPS,...SHOP_CROPS];
export const cropById=new Map(SEASON_CROPS.map(c=>[c.id,c]));
// These are stock-limited seeds, not unlimited purchases. Seed cost is supplied by the user.
export const OWNED_CROPS:GameCrop[]=[
{id:'carrot',name:'Carrot',seasons:['spring'],seed:0,price:35,growth:3,regrow:0,yield:1,color:'#d88e49'},
{id:'summer-squash',name:'Summer Squash',seasons:['summer'],seed:0,price:45,growth:6,regrow:3,yield:1,color:'#d9bd57'},
{id:'broccoli',name:'Broccoli',seasons:['autumn'],seed:0,price:70,growth:8,regrow:4,yield:1,color:'#68965a'},
{id:'powdermelon',name:'Powdermelon',seasons:['winter'],seed:0,price:60,growth:7,regrow:0,yield:1,color:'#b3a7d4'},
{id:'ancient-fruit',name:'Ancient Fruit',seasons:['spring','summer','autumn'],seed:0,price:550,growth:28,regrow:7,yield:1,color:'#658cba'},
{id:'pineapple',name:'Pineapple',seasons:['summer'],seed:0,price:300,growth:14,regrow:7,yield:1,color:'#d5bd55'},
{id:'taro-root',name:'Taro Root (dry tile)',seasons:['summer'],seed:0,price:100,growth:10,regrow:0,yield:1,color:'#a791b0'},
{id:'coffee-bean',name:'Coffee Bean',seasons:['spring','summer'],seed:0,price:15,growth:10,regrow:2,yield:4,color:'#94694a'},
{id:'sweet-gem-berry',name:'Sweet Gem Berry',seasons:['autumn'],seed:0,price:3000,growth:24,regrow:0,yield:1,color:'#d0a568'}
];

