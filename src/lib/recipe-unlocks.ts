// Selected factual unlocks transcribed as original summaries. See the per-item references.
export const UNLOCK_GROUPS=['Starter','Skill level','Friendship','TV','Shop','Upgrade'] as const;
type UnlockGroup=typeof UNLOCK_GROUPS[number];
type Unlock={group:UnlockGroup;detail:string};
const starter:Unlock={group:'Starter',detail:'Known on a new save.'};
const level=(skill:string,rank:number):Unlock=>({group:'Skill level',detail:skill+' level '+rank+'.'});
const mail=(person:string,hearts:number):Unlock=>({group:'Friendship',detail:person+' sends the recipe by mail at '+hearts+' hearts.'});
const tv=(date:string):Unlock=>({group:'TV',detail:'The Queen of Sauce · '+date+'. The Queen of Sauce Cookbook also teaches this recipe.'});
const shop=(location:string,price:string):Unlock=>({group:'Shop',detail:location+' sells the recipe for '+price+'g.'});

const cooking:Record<string,Unlock> = {
 'Fried Egg':starter,
 'Salad':mail('Emily',3),
 'Cheese Cauliflower':mail('Pam',3),
 'Baked Fish':tv('Summer 7, Year 1'),
 'Parsnip Soup':mail('Caroline',3),
 'Vegetable Medley':mail('Caroline',7),
 'Complete Breakfast':tv('Spring 21, Year 2'),
 'Fried Calamari':mail('Jodi',3),
 'Strange Bun':mail('Shane',7),
 'Lucky Lunch':tv('Spring 28, Year 2'),
 'Sashimi':mail('Linus',3),
 'Dish O\' The Sea':level('Fishing',3),
 "Miner's Treat":level('Mining',3),
 'Roots Platter':level('Combat',3),
 'Triple Shot Espresso':shop('The Stardrop Saloon','5,000'),
 'Seafoam Pudding':level('Fishing',9)
};

const crafting:Record<string,Unlock> = {
 'Chest':starter,
 'Gate':starter,
 'Wood Fence':starter,
 'Stone Fence':level('Farming',2),
 'Iron Fence':level('Farming',4),
 'Hardwood Fence':level('Farming',6),
 'Sprinkler':level('Farming',2),
 'Quality Sprinkler':level('Farming',6),
 'Iridium Sprinkler':level('Farming',9),
 'Mayonnaise Machine':level('Farming',2),
 'Bee House':level('Farming',3),
 'Preserves Jar':level('Farming',4),
 'Cheese Press':level('Farming',6),
 'Loom':level('Farming',7),
 'Keg':level('Farming',8),
 'Oil Maker':level('Farming',8),
 'Cask':{group:'Upgrade',detail:'Unlocks with the farmhouse cellar upgrade.'},
 'Fish Smoker':shop('The Fish Shop','10,000'),
 'Dehydrator':shop('Pierre’s General Store','10,000')
};

export function recipeUnlock(kind:string,name:string):Unlock|undefined{
 const lookup=kind==='cooking'?cooking:kind==='crafting'?crafting:null;
 return lookup&&Object.hasOwn(lookup,name)?lookup[name]:undefined;
}
