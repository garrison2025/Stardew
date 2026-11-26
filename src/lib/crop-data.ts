// Independently transcribed numerical facts for a deliberately limited base-quality crop model.
export type CropSeason='spring'|'summer'|'autumn'|'winter';
export type GameCrop={id:string;name:string;seasons:CropSeason[];seed:number;price:number;growth:number;regrow:number;yield:number;color:string;special?:'festival';trellis?:boolean};
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
export const cropById=new Map(GAME_CROPS.map(c=>[c.id,c]));
