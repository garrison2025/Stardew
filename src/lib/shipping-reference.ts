// Original concise acquisition planning hints; common routes, not exhaustive conditions.
// References: https://stardewvalleywiki.com/Shipping and item pages; seasonal groups are outdoor planning hints, not exclusive availability.
export const SHIPPING_CATEGORIES=["Seasonal crops","Fruit trees","Forage","Animal products","Processed goods","Mining & resources","Tree & pond goods","Monster drops"] as const;
export const SHIPPING_REFERENCE:Record<string,{category:typeof SHIPPING_CATEGORIES[number];seasons:string[];hint:string}>={
  "Parsnip": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Green Bean": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Cauliflower": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Potato": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Garlic": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Kale": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Rhubarb": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Unmilled Rice": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Strawberry": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Tulip": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Blue Jazz": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Carrot": {
    "category": "Seasonal crops",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature spring crop outdoors"
  },
  "Melon": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Tomato": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Blueberry": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Hot Pepper": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Radish": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Red Cabbage": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Starfruit": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Poppy": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Hops": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Summer Spangle": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Summer Squash": {
    "category": "Seasonal crops",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature summer crop outdoors"
  },
  "Eggplant": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Artichoke": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Pumpkin": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Bok Choy": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Yam": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Cranberries": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Beet": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Amaranth": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Fairy Rose": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Broccoli": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Sweet Gem Berry": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fall crop outdoors"
  },
  "Powdermelon": {
    "category": "Seasonal crops",
    "seasons": [
      "winter"
    ],
    "hint": "Harvest a mature winter crop outdoors"
  },
  "Wheat": {
    "category": "Seasonal crops",
    "seasons": [
      "summer",
      "fall"
    ],
    "hint": "Grow in summer or fall"
  },
  "Corn": {
    "category": "Seasonal crops",
    "seasons": [
      "summer",
      "fall"
    ],
    "hint": "Grow in summer or fall"
  },
  "Sunflower": {
    "category": "Seasonal crops",
    "seasons": [
      "summer",
      "fall"
    ],
    "hint": "Grow in summer or fall"
  },
  "Coffee Bean": {
    "category": "Seasonal crops",
    "seasons": [
      "spring",
      "summer"
    ],
    "hint": "Grow in spring or summer"
  },
  "Ancient Fruit": {
    "category": "Seasonal crops",
    "seasons": [
      "spring",
      "summer",
      "fall"
    ],
    "hint": "Grow from Ancient Seeds"
  },
  "Grape": {
    "category": "Seasonal crops",
    "seasons": [
      "fall"
    ],
    "hint": "Grow on a trellis in fall; also available as summer forage"
  },
  "Taro Root": {
    "category": "Seasonal crops",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Grow on Ginger Island or in the greenhouse; island seed sources vary"
  },
  "Pineapple": {
    "category": "Seasonal crops",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Grow on Ginger Island or in the greenhouse; island seed sources vary"
  },
  "Cactus Fruit": {
    "category": "Seasonal crops",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Grow indoors or on Ginger Island; Oasis seed source"
  },
  "Apricot": {
    "category": "Fruit trees",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature fruit tree in its outdoor fruiting season"
  },
  "Cherry": {
    "category": "Fruit trees",
    "seasons": [
      "spring"
    ],
    "hint": "Harvest a mature fruit tree in its outdoor fruiting season"
  },
  "Orange": {
    "category": "Fruit trees",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature fruit tree in its outdoor fruiting season"
  },
  "Peach": {
    "category": "Fruit trees",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature fruit tree in its outdoor fruiting season"
  },
  "Apple": {
    "category": "Fruit trees",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fruit tree in its outdoor fruiting season"
  },
  "Pomegranate": {
    "category": "Fruit trees",
    "seasons": [
      "fall"
    ],
    "hint": "Harvest a mature fruit tree in its outdoor fruiting season"
  },
  "Banana": {
    "category": "Fruit trees",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature tropical tree; fruit also grows year-round on Ginger Island or in the greenhouse"
  },
  "Mango": {
    "category": "Fruit trees",
    "seasons": [
      "summer"
    ],
    "hint": "Harvest a mature tropical tree; fruit also grows year-round on Ginger Island or in the greenhouse"
  },
  "Wild Horseradish": {
    "category": "Forage",
    "seasons": [
      "spring"
    ],
    "hint": "Search spring forage locations"
  },
  "Daffodil": {
    "category": "Forage",
    "seasons": [
      "spring"
    ],
    "hint": "Search spring forage locations"
  },
  "Leek": {
    "category": "Forage",
    "seasons": [
      "spring"
    ],
    "hint": "Search spring forage locations"
  },
  "Dandelion": {
    "category": "Forage",
    "seasons": [
      "spring"
    ],
    "hint": "Search spring forage locations"
  },
  "Spring Onion": {
    "category": "Forage",
    "seasons": [
      "spring"
    ],
    "hint": "Search spring forage locations"
  },
  "Salmonberry": {
    "category": "Forage",
    "seasons": [
      "spring"
    ],
    "hint": "Search spring forage locations"
  },
  "Morel": {
    "category": "Forage",
    "seasons": [
      "spring"
    ],
    "hint": "Search spring forage locations"
  },
  "Spice Berry": {
    "category": "Forage",
    "seasons": [
      "summer"
    ],
    "hint": "Search summer forage locations"
  },
  "Sweet Pea": {
    "category": "Forage",
    "seasons": [
      "summer"
    ],
    "hint": "Search summer forage locations"
  },
  "Rainbow Shell": {
    "category": "Forage",
    "seasons": [
      "summer"
    ],
    "hint": "Search summer forage locations"
  },
  "Fiddlehead Fern": {
    "category": "Forage",
    "seasons": [
      "summer"
    ],
    "hint": "Search summer forage locations"
  },
  "Wild Plum": {
    "category": "Forage",
    "seasons": [
      "fall"
    ],
    "hint": "Search fall forage locations"
  },
  "Hazelnut": {
    "category": "Forage",
    "seasons": [
      "fall"
    ],
    "hint": "Search fall forage locations"
  },
  "Blackberry": {
    "category": "Forage",
    "seasons": [
      "fall"
    ],
    "hint": "Search fall forage locations"
  },
  "Chanterelle": {
    "category": "Forage",
    "seasons": [
      "fall"
    ],
    "hint": "Search fall forage locations"
  },
  "Winter Root": {
    "category": "Forage",
    "seasons": [
      "winter"
    ],
    "hint": "Search winter forage and dig spots where applicable"
  },
  "Crystal Fruit": {
    "category": "Forage",
    "seasons": [
      "winter"
    ],
    "hint": "Search winter forage and dig spots where applicable"
  },
  "Snow Yam": {
    "category": "Forage",
    "seasons": [
      "winter"
    ],
    "hint": "Search winter forage and dig spots where applicable"
  },
  "Crocus": {
    "category": "Forage",
    "seasons": [
      "winter"
    ],
    "hint": "Search winter forage and dig spots where applicable"
  },
  "Holly": {
    "category": "Forage",
    "seasons": [
      "winter"
    ],
    "hint": "Search winter forage and dig spots where applicable"
  },
  "Nautilus Shell": {
    "category": "Forage",
    "seasons": [
      "winter"
    ],
    "hint": "Search winter forage and dig spots where applicable"
  },
  "Common Mushroom": {
    "category": "Forage",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Check mushroom caves, mines or seasonal woodland sources; availability varies"
  },
  "Red Mushroom": {
    "category": "Forage",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Check mushroom caves, mines or seasonal woodland sources; availability varies"
  },
  "Purple Mushroom": {
    "category": "Forage",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Check mushroom caves, mines or seasonal woodland sources; availability varies"
  },
  "Coral": {
    "category": "Forage",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Search the beach"
  },
  "Sea Urchin": {
    "category": "Forage",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Search the beach"
  },
  "Coconut": {
    "category": "Forage",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Search desert forage"
  },
  "Ginger": {
    "category": "Forage",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Search Ginger Island forage"
  },
  "Large Egg (white)": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Egg (white)": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Egg (brown)": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Large Egg (brown)": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Milk": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Large Milk": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Ostrich Egg": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Void Egg": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Goat Milk": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Large Goat Milk": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Wool": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Duck Egg": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Duck Feather": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Rabbit's Foot": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from the corresponding farm animal once available"
  },
  "Truffle": {
    "category": "Animal products",
    "seasons": [
      "spring",
      "summer",
      "fall"
    ],
    "hint": "Let a mature pig outside on a suitable non-rainy day"
  },
  "Mayonnaise": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Process eggs with a Mayonnaise Machine"
  },
  "Duck Mayonnaise": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Process eggs with a Mayonnaise Machine"
  },
  "Void Mayonnaise": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Process eggs with a Mayonnaise Machine"
  },
  "Dinosaur Mayonnaise": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Process eggs with a Mayonnaise Machine"
  },
  "Pale Ale": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Keg with a compatible ingredient"
  },
  "Beer": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Keg with a compatible ingredient"
  },
  "Wine": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Keg with a compatible ingredient"
  },
  "Juice": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Keg with a compatible ingredient"
  },
  "Mead": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Keg with a compatible ingredient"
  },
  "Green Tea": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Keg with a compatible ingredient"
  },
  "Pickles": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Preserves Jar with a compatible ingredient"
  },
  "Jelly": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Preserves Jar with a compatible ingredient"
  },
  "Caviar": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Preserves Jar with a compatible ingredient"
  },
  "Aged Roe": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Preserves Jar with a compatible ingredient"
  },
  "Honey": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from a Bee House in a supported season or location"
  },
  "Cheese": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Cheese Press with the corresponding milk"
  },
  "Goat Cheese": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Cheese Press with the corresponding milk"
  },
  "Cloth": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Loom with Wool"
  },
  "Truffle Oil": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Process a Truffle with an Oil Maker"
  },
  "Smoked Fish": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Fish Smoker with fish and coal"
  },
  "Raisins": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Dehydrator with five compatible ingredients"
  },
  "Dried Fruit": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Dehydrator with five compatible ingredients"
  },
  "Dried Mushrooms": {
    "category": "Processed goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Use a Dehydrator with five compatible ingredients"
  },
  "Copper Ore": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from mining, resource nodes or other available sources"
  },
  "Iron Ore": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from mining, resource nodes or other available sources"
  },
  "Coal": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from mining, resource nodes or other available sources"
  },
  "Gold Ore": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from mining, resource nodes or other available sources"
  },
  "Iridium Ore": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from mining, resource nodes or other available sources"
  },
  "Stone": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from mining, resource nodes or other available sources"
  },
  "Cinder Shard": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from mining, resource nodes or other available sources"
  },
  "Radioactive Ore": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from mining, resource nodes or other available sources"
  },
  "Copper Bar": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Smelt the appropriate inputs in a Furnace"
  },
  "Iron Bar": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Smelt the appropriate inputs in a Furnace"
  },
  "Gold Bar": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Smelt the appropriate inputs in a Furnace"
  },
  "Iridium Bar": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Smelt the appropriate inputs in a Furnace"
  },
  "Refined Quartz": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Smelt the appropriate inputs in a Furnace"
  },
  "Radioactive Bar": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Smelt the appropriate inputs in a Furnace"
  },
  "Clay": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Dig suitable soil or artifact spots; other sources exist"
  },
  "Sap": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Harvest from trees, logs or other resource sources"
  },
  "Wood": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Harvest from trees, logs or other resource sources"
  },
  "Hardwood": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Harvest from trees, logs or other resource sources"
  },
  "Moss": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Harvest from trees, logs or other resource sources"
  },
  "Fiber": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Harvest from weeds"
  },
  "Battery Pack": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from a charged Lightning Rod or Solar Panel"
  },
  "Bone Fragment": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect from bone nodes or suitable enemies"
  },
  "Cave Carrot": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Explore mine soil or boxes"
  },
  "Magma Cap": {
    "category": "Mining & resources",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Search the Volcano Dungeon"
  },
  "Maple Syrup": {
    "category": "Tree & pond goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect with a Tapper on the appropriate tree"
  },
  "Oak Resin": {
    "category": "Tree & pond goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect with a Tapper on the appropriate tree"
  },
  "Pine Tar": {
    "category": "Tree & pond goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect with a Tapper on the appropriate tree"
  },
  "Mystic Syrup": {
    "category": "Tree & pond goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect with a Tapper on the appropriate tree"
  },
  "Tea Leaves": {
    "category": "Tree & pond goods",
    "seasons": [
      "spring",
      "summer",
      "fall"
    ],
    "hint": "Harvest a mature Tea Bush during the last week of its active month; indoor conditions differ"
  },
  "Roe": {
    "category": "Tree & pond goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Collect Roe from a populated Fish Pond"
  },
  "Bug Meat": {
    "category": "Monster drops",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Defeat appropriate monsters or check alternate sources"
  },
  "Slime": {
    "category": "Monster drops",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Defeat appropriate monsters or check alternate sources"
  },
  "Bat Wing": {
    "category": "Monster drops",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Defeat appropriate monsters or check alternate sources"
  },
  "Solar Essence": {
    "category": "Monster drops",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Defeat appropriate monsters or check alternate sources"
  },
  "Void Essence": {
    "category": "Monster drops",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Defeat appropriate monsters or check alternate sources"
  },
  "Squid Ink": {
    "category": "Tree & pond goods",
    "seasons": [
      "spring",
      "summer",
      "fall",
      "winter"
    ],
    "hint": "Catch suitable squid or collect from a squid pond; monster drops also possible"
  }
};
export function shippingReference(name:string){return Object.hasOwn(SHIPPING_REFERENCE,name)?SHIPPING_REFERENCE[name]:undefined}
