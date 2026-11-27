// Numerical and unlock-condition facts matched against the existing recipe names.
// References: https://stardewvalleywiki.com/Crafting and https://stardewvalleywiki.com/Cooking
// Checked 2026-11-27. No recipe descriptions or game assets copied.
export const UNLOCK_GROUPS=['Starter','Skill level','Mastery','Friendship','TV','Shop','Quest / milestone','Upgrade','Other'] as const;
export type UnlockGroup=typeof UNLOCK_GROUPS[number];
export type Unlock={groups:UnlockGroup[];detail:string};
const reference:Record<'cooking'|'crafting',Record<string,Unlock>>={
  "crafting": {
    "Cherry Bomb": {
      "groups": [
        "Skill level"
      ],
      "detail": "Mining Level 1"
    },
    "Bomb": {
      "groups": [
        "Skill level"
      ],
      "detail": "Mining Level 6"
    },
    "Mega Bomb": {
      "groups": [
        "Skill level"
      ],
      "detail": "Mining Level 8"
    },
    "Gate": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Wood Fence": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Stone Fence": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 2"
    },
    "Iron Fence": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 4"
    },
    "Hardwood Fence": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 6"
    },
    "Sprinkler": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 2"
    },
    "Quality Sprinkler": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 6"
    },
    "Iridium Sprinkler": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 9"
    },
    "Mayonnaise Machine": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 2"
    },
    "Bee House": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 3"
    },
    "Preserves Jar": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 4"
    },
    "Cheese Press": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 6"
    },
    "Loom": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 7"
    },
    "Keg": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 8"
    },
    "Oil Maker": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 8"
    },
    "Cask": {
      "groups": [
        "Upgrade"
      ],
      "detail": "Farmhouse cellar upgrade"
    },
    "Fish Smoker": {
      "groups": [
        "Shop"
      ],
      "detail": "Fish Shop — 10,000g"
    },
    "Dehydrator": {
      "groups": [
        "Shop"
      ],
      "detail": "Pierre's — 10,000g"
    },
    "Basic Fertilizer": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 1"
    },
    "Quality Fertilizer": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 9"
    },
    "Deluxe Fertilizer": {
      "groups": [
        "Shop"
      ],
      "detail": "Shop: Mr Qi — 20 Qi Gems"
    },
    "Speed-Gro": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 3"
    },
    "Deluxe Speed-Gro": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 8"
    },
    "Hyper Speed-Gro": {
      "groups": [
        "Shop"
      ],
      "detail": "Shop: Mr Qi — 30 Qi Gems"
    },
    "Basic Retaining Soil": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 4"
    },
    "Quality Retaining Soil": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 7"
    },
    "Deluxe Retaining Soil": {
      "groups": [
        "Shop"
      ],
      "detail": "Shop: Island Trader for Cinder Shard (50)"
    },
    "Tree Fertilizer": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 7"
    },
    "Wild Seeds (Sp)": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 1"
    },
    "Wild Seeds (Su)": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 4"
    },
    "Wild Seeds (Fa)": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 6"
    },
    "Wild Seeds (Wi)": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 7"
    },
    "Ancient Seeds": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Donating Ancient Seed to museum"
    },
    "Grass Starter": {
      "groups": [
        "Shop"
      ],
      "detail": "Shop: Pierre's — 1,000g"
    },
    "Blue Grass Starter": {
      "groups": [
        "Shop"
      ],
      "detail": "Qi's Walnut Room — 40 Qi Gems"
    },
    "Tea Sapling": {
      "groups": [
        "Friendship"
      ],
      "detail": "Mail the day after Caroline's 2-heart event"
    },
    "Fiber Seeds": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Linus (Special Order)"
    },
    "Mystic Tree Seed": {
      "groups": [
        "Mastery"
      ],
      "detail": "Foraging Mastery"
    },
    "Wood Floor": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 100g"
    },
    "Rustic Plank Floor": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 200g"
    },
    "Straw Floor": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 200g"
    },
    "Weathered Floor": {
      "groups": [
        "Shop"
      ],
      "detail": "Dwarf (500g)"
    },
    "Crystal Floor": {
      "groups": [
        "Shop"
      ],
      "detail": "Krobus (500g)"
    },
    "Stone Floor": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 100g"
    },
    "Stone Walkway Floor": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 200g"
    },
    "Brick Floor": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 500g"
    },
    "Wood Path": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Gravel Path": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Cobblestone Path": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Stepping Stone Path": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 100g"
    },
    "Crystal Path": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 200g"
    },
    "Spinner": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 6"
    },
    "Trap Bobber": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 6"
    },
    "Sonar Bobber": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 6"
    },
    "Cork Bobber": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 7"
    },
    "Quality Bobber": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Willy (Special Order)"
    },
    "Treasure Hunter": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 7"
    },
    "Dressed Spinner": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 8"
    },
    "Barbed Hook": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 8"
    },
    "Magnet": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 9"
    },
    "Bait": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 2"
    },
    "Deluxe Bait": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 4"
    },
    "Wild Bait": {
      "groups": [
        "Friendship"
      ],
      "detail": "Linus 4-heart event"
    },
    "Magic Bait": {
      "groups": [
        "Shop"
      ],
      "detail": "Shop: Mr Qi — 20 Qi Gems"
    },
    "Challenge Bait": {
      "groups": [
        "Mastery"
      ],
      "detail": "Fishing Mastery"
    },
    "Crab Pot": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 3"
    },
    "Sturdy Ring": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 1"
    },
    "Warrior Ring": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 4"
    },
    "Ring of Yoba": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 7"
    },
    "Thorns Ring": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 7"
    },
    "Glowstone Ring": {
      "groups": [
        "Skill level"
      ],
      "detail": "Mining Level 4"
    },
    "Iridium Band": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 9"
    },
    "Field Snack": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 1"
    },
    "Bug Steak": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 1"
    },
    "Life Elixir": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 2"
    },
    "Oil Of Garlic": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 6"
    },
    "Monster Musk": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Wizard (Special Order)"
    },
    "Fairy Dust": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "The Pirate's Wife Quest"
    },
    "Warp Totem: Beach": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 6"
    },
    "Warp Totem: Mountains": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 7"
    },
    "Warp Totem: Farm": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 8"
    },
    "Warp Totem: Desert": {
      "groups": [
        "Shop"
      ],
      "detail": "Desert Trader for Iridium Bar (10)"
    },
    "Warp Totem: Island": {
      "groups": [
        "Shop"
      ],
      "detail": "Volcano Dwarf shop — 10,000g"
    },
    "Rain Totem": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 9"
    },
    "Treasure Totem": {
      "groups": [
        "Mastery"
      ],
      "detail": "Foraging Mastery"
    },
    "Torch": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Campfire": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Wooden Brazier": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 250g"
    },
    "Stone Brazier": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 400g"
    },
    "Gold Brazier": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 1,000g"
    },
    "Carved Brazier": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 2,000g"
    },
    "Stump Brazier": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 800g"
    },
    "Barrel Brazier": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 800g"
    },
    "Skull Brazier": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 3,000g"
    },
    "Marble Brazier": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 5,000g"
    },
    "Wood Lamp-post": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 500g"
    },
    "Iron Lamp-post": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 1,000g"
    },
    "Jack-O-Lantern": {
      "groups": [
        "Shop"
      ],
      "detail": "Pierre's stand at Spirit's Eve festival (2,000g)"
    },
    "Charcoal Kiln": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 2"
    },
    "Crystalarium": {
      "groups": [
        "Skill level"
      ],
      "detail": "Mining Level 9"
    },
    "Furnace": {
      "groups": [
        "Other"
      ],
      "detail": "Clint (Morning after collecting 1+ Copper Ore)"
    },
    "Heavy Furnace": {
      "groups": [
        "Mastery"
      ],
      "detail": "Mining Mastery"
    },
    "Lightning Rod": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 6"
    },
    "Solar Panel": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Caroline (Special Order)"
    },
    "Recycling Machine": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 4"
    },
    "Seed Maker": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 9"
    },
    "Slime Incubator": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 8"
    },
    "Ostrich Incubator": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Complete the Island Field Office Collection"
    },
    "Slime Egg-Press": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 6"
    },
    "Tapper": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 4"
    },
    "Heavy Tapper": {
      "groups": [
        "Shop"
      ],
      "detail": "Shop: Mr Qi — 20 Qi Gems"
    },
    "Worm Bin": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 4"
    },
    "Deluxe Worm Bin": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 8"
    },
    "Bone Mill": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Gunther (Special Order)"
    },
    "Geode Crusher": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Clint (Special Order)"
    },
    "Mushroom Log": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 4"
    },
    "Bait Maker": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 6"
    },
    "Tub o' Flowers": {
      "groups": [
        "Shop"
      ],
      "detail": "Pierre's stand at Flower Dance (1,000g)"
    },
    "Wicked Statue": {
      "groups": [
        "Shop"
      ],
      "detail": "Krobus' Shop (1,000g)"
    },
    "Flute Block": {
      "groups": [
        "Friendship"
      ],
      "detail": "Robin 6-heart event"
    },
    "Drum Block": {
      "groups": [
        "Friendship"
      ],
      "detail": "Robin 6-heart event"
    },
    "Chest": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Stone Chest": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Robin special order"
    },
    "Big Chest": {
      "groups": [
        "Shop"
      ],
      "detail": "Carpenter's Shop — 5,000g"
    },
    "Big Stone Chest": {
      "groups": [
        "Shop"
      ],
      "detail": "Dwarf (5,000g)"
    },
    "Wood Sign": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Stone Sign": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Dark Sign": {
      "groups": [
        "Friendship"
      ],
      "detail": "Krobus: 3 hearts, mail"
    },
    "Text Sign": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Garden Pot": {
      "groups": [
        "Quest / milestone",
        "Upgrade"
      ],
      "detail": "Evelyn cutscene after completing the Greenhouse"
    },
    "Scarecrow": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 1"
    },
    "Deluxe Scarecrow": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Mail the day after collecting all rarecrows"
    },
    "Staircase": {
      "groups": [
        "Skill level"
      ],
      "detail": "Mining Level 2"
    },
    "Explosive Ammo": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 8"
    },
    "Transmute (Fe)": {
      "groups": [
        "Skill level"
      ],
      "detail": "Mining Level 4"
    },
    "Transmute (Au)": {
      "groups": [
        "Skill level"
      ],
      "detail": "Mining Level 7"
    },
    "Mini-Jukebox": {
      "groups": [
        "Friendship"
      ],
      "detail": "Gus 5-Heart Event"
    },
    "Mini-Obelisk": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Wizard special order"
    },
    "Farm Computer": {
      "groups": [
        "Quest / milestone"
      ],
      "detail": "Demetrius special order"
    },
    "Hopper": {
      "groups": [
        "Shop"
      ],
      "detail": "Shop: Mr Qi — 50 Qi Gems"
    },
    "Cookout Kit": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 3"
    },
    "Tent Kit": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 8"
    },
    "Statue Of The Dwarf King": {
      "groups": [
        "Mastery"
      ],
      "detail": "Mining Mastery"
    },
    "Statue Of Blessings": {
      "groups": [
        "Mastery"
      ],
      "detail": "Farming Mastery"
    },
    "Anvil": {
      "groups": [
        "Mastery"
      ],
      "detail": "Combat Mastery"
    },
    "Mini-Forge": {
      "groups": [
        "Mastery"
      ],
      "detail": "Combat Mastery"
    }
  },
  "cooking": {
    "Fried Egg": {
      "groups": [
        "Starter"
      ],
      "detail": "Starter"
    },
    "Omelet": {
      "groups": [
        "TV",
        "Shop"
      ],
      "detail": "Queen of Sauce 28 Spring, Year 1; Stardrop Saloon — 100g"
    },
    "Salad": {
      "groups": [
        "Friendship"
      ],
      "detail": "Emily: 3 hearts, mail"
    },
    "Cheese Cauliflower": {
      "groups": [
        "Friendship"
      ],
      "detail": "Pam: 3 hearts, mail"
    },
    "Baked Fish": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 7 Summer, Year 1"
    },
    "Parsnip Soup": {
      "groups": [
        "Friendship"
      ],
      "detail": "Caroline: 3 hearts, mail"
    },
    "Vegetable Medley": {
      "groups": [
        "Friendship"
      ],
      "detail": "Caroline: 7 hearts, mail"
    },
    "Complete Breakfast": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 21 Spring, Year 2"
    },
    "Fried Calamari": {
      "groups": [
        "Friendship"
      ],
      "detail": "Jodi: 3 hearts, mail"
    },
    "Strange Bun": {
      "groups": [
        "Friendship"
      ],
      "detail": "Shane: 7 hearts, mail"
    },
    "Lucky Lunch": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 28 Spring, Year 2"
    },
    "Fried Mushroom": {
      "groups": [
        "Friendship"
      ],
      "detail": "Demetrius: 3 hearts, mail"
    },
    "Pizza": {
      "groups": [
        "TV",
        "Shop"
      ],
      "detail": "Queen of Sauce 7 Spring, Year 2; Stardrop Saloon — 150g"
    },
    "Bean Hotpot": {
      "groups": [
        "Friendship"
      ],
      "detail": "Clint: 7 hearts, mail"
    },
    "Glazed Yams": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 21 Fall, Year 1"
    },
    "Carp Surprise": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 7 Summer, Year 2"
    },
    "Hashbrowns": {
      "groups": [
        "TV",
        "Shop"
      ],
      "detail": "Queen of Sauce 14 Spring, Year 2; Stardrop Saloon — 50g"
    },
    "Pancakes": {
      "groups": [
        "TV",
        "Shop"
      ],
      "detail": "Queen of Sauce 14 Summer, Year 1; Stardrop Saloon — 100g"
    },
    "Salmon Dinner": {
      "groups": [
        "Friendship"
      ],
      "detail": "Gus: 3 hearts, mail"
    },
    "Fish Taco": {
      "groups": [
        "Friendship"
      ],
      "detail": "Linus: 7 hearts, mail"
    },
    "Crispy Bass": {
      "groups": [
        "Friendship"
      ],
      "detail": "Kent: 3 hearts, mail"
    },
    "Pepper Poppers": {
      "groups": [
        "Friendship"
      ],
      "detail": "Shane: 3 hearts, mail"
    },
    "Bread": {
      "groups": [
        "TV",
        "Shop"
      ],
      "detail": "Queen of Sauce 28 Summer, Year 1; Stardrop Saloon — 100g"
    },
    "Tom Kha Soup": {
      "groups": [
        "Friendship"
      ],
      "detail": "Sandy: 7 hearts, mail"
    },
    "Trout Soup": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 14 Fall, Year 1"
    },
    "Chocolate Cake": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 14 Winter, Year 1"
    },
    "Pink Cake": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 21 Summer, Year 2"
    },
    "Rhubarb Pie": {
      "groups": [
        "Friendship"
      ],
      "detail": "Marnie: 7 hearts, mail"
    },
    "Cookie": {
      "groups": [
        "Friendship"
      ],
      "detail": "Evelyn (4-heart event)"
    },
    "Spaghetti": {
      "groups": [
        "Friendship"
      ],
      "detail": "Lewis: 3 hearts, mail"
    },
    "Fried Eel": {
      "groups": [
        "Friendship"
      ],
      "detail": "George: 3 hearts, mail"
    },
    "Spicy Eel": {
      "groups": [
        "Friendship"
      ],
      "detail": "George: 7 hearts, mail"
    },
    "Sashimi": {
      "groups": [
        "Friendship"
      ],
      "detail": "Linus: 3 hearts, mail"
    },
    "Maki Roll": {
      "groups": [
        "TV",
        "Shop"
      ],
      "detail": "Queen of Sauce 21 Summer, Year 1; Stardrop Saloon — 300g"
    },
    "Tortilla": {
      "groups": [
        "TV",
        "Shop"
      ],
      "detail": "Queen of Sauce 7 Fall, Year 1; Stardrop Saloon — 100g"
    },
    "Red Plate": {
      "groups": [
        "Friendship"
      ],
      "detail": "Emily: 7 hearts, mail"
    },
    "Eggplant Parmesan": {
      "groups": [
        "Friendship"
      ],
      "detail": "Lewis: 7 hearts, mail"
    },
    "Rice Pudding": {
      "groups": [
        "Friendship"
      ],
      "detail": "Evelyn: 7 hearts, mail"
    },
    "Ice Cream": {
      "groups": [
        "Friendship"
      ],
      "detail": "Jodi: 7 hearts, mail"
    },
    "Blueberry Tart": {
      "groups": [
        "Friendship"
      ],
      "detail": "Pierre: 3 hearts, mail"
    },
    "Autumn's Bounty": {
      "groups": [
        "Friendship"
      ],
      "detail": "Demetrius: 7 hearts, mail"
    },
    "Pumpkin Soup": {
      "groups": [
        "Friendship"
      ],
      "detail": "Robin: 7 hearts, mail"
    },
    "Super Meal": {
      "groups": [
        "Friendship"
      ],
      "detail": "Kent: 7 hearts, mail"
    },
    "Cranberry Sauce": {
      "groups": [
        "Friendship"
      ],
      "detail": "Gus: 7 hearts, mail"
    },
    "Stuffing": {
      "groups": [
        "Friendship"
      ],
      "detail": "Pam: 7 hearts, mail"
    },
    "Farmer's Lunch": {
      "groups": [
        "Skill level"
      ],
      "detail": "Farming Level 3"
    },
    "Survival Burger": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 8"
    },
    "Dish O' The Sea": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 3"
    },
    "Miner's Treat": {
      "groups": [
        "Skill level"
      ],
      "detail": "Mining Level 3"
    },
    "Roots Platter": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 3"
    },
    "Triple Shot Espresso": {
      "groups": [
        "Shop"
      ],
      "detail": "Stardrop Saloon — 5,000g"
    },
    "Seafoam Pudding": {
      "groups": [
        "Skill level"
      ],
      "detail": "Fishing Level 9"
    },
    "Algae Soup": {
      "groups": [
        "Friendship"
      ],
      "detail": "Clint: 3 hearts, mail"
    },
    "Pale Broth": {
      "groups": [
        "Friendship"
      ],
      "detail": "Marnie: 3 hearts, mail"
    },
    "Plum Pudding": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 7 Winter, Year 1"
    },
    "Artichoke Dip": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 28 Fall, Year 1"
    },
    "Stir Fry": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 7 Spring, Year 1"
    },
    "Roasted Hazelnuts": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 28 Summer, Year 2"
    },
    "Pumpkin Pie": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 21 Winter, Year 1"
    },
    "Radish Salad": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 21 Spring, Year 1"
    },
    "Fruit Salad": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 7 Fall, Year 2"
    },
    "Blackberry Cobbler": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 14 Fall, Year 2"
    },
    "Cranberry Candy": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 28 Winter, Year 1"
    },
    "Bruschetta": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 21 Winter, Year 2"
    },
    "Coleslaw": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 14 Spring, Year 1"
    },
    "Fiddlehead Risotto": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 28 Fall, Year 2"
    },
    "Poppyseed Muffin": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 7 Winter, Year 2"
    },
    "Chowder": {
      "groups": [
        "Friendship"
      ],
      "detail": "Willy: 3 hearts, mail"
    },
    "Fish Stew": {
      "groups": [
        "Friendship"
      ],
      "detail": "Willy: 7 hearts, mail"
    },
    "Escargot": {
      "groups": [
        "Friendship"
      ],
      "detail": "Willy: 5 hearts, mail"
    },
    "Lobster Bisque": {
      "groups": [
        "Friendship",
        "TV"
      ],
      "detail": "Queen of Sauce 14 Winter, Year 2; Willy: 9 hearts, mail"
    },
    "Maple Bar": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 14 Summer, Year 2"
    },
    "Crab Cakes": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 21 Fall, Year 2"
    },
    "Shrimp Cocktail": {
      "groups": [
        "TV"
      ],
      "detail": "Queen of Sauce 28 Winter, Year 2"
    },
    "Ginger Ale": {
      "groups": [
        "Shop"
      ],
      "detail": "Dwarf Shop in Volcano Dungeon — 1,000g"
    },
    "Banana Pudding": {
      "groups": [
        "Shop"
      ],
      "detail": "Island Trader for Bone Fragment (30)"
    },
    "Mango Sticky Rice": {
      "groups": [
        "Friendship"
      ],
      "detail": "Leo: 7 hearts, mail"
    },
    "Poi": {
      "groups": [
        "Friendship"
      ],
      "detail": "Leo: 3 hearts, mail"
    },
    "Tropical Curry": {
      "groups": [
        "Shop"
      ],
      "detail": "Ginger Island Resort — 2,000g"
    },
    "Squid Ink Ravioli": {
      "groups": [
        "Skill level"
      ],
      "detail": "Combat Level 9"
    },
    "Moss Soup": {
      "groups": [
        "Skill level"
      ],
      "detail": "Foraging Level 3"
    }
  }
};
export const COOKING_REFERENCE_PRICES:Readonly<Record<string,number>>={
  "Fried Egg": 35,
  "Omelet": 125,
  "Salad": 110,
  "Cheese Cauliflower": 300,
  "Baked Fish": 100,
  "Parsnip Soup": 120,
  "Vegetable Medley": 120,
  "Complete Breakfast": 350,
  "Fried Calamari": 150,
  "Strange Bun": 225,
  "Lucky Lunch": 250,
  "Fried Mushroom": 200,
  "Pizza": 300,
  "Bean Hotpot": 100,
  "Glazed Yams": 200,
  "Carp Surprise": 150,
  "Hashbrowns": 120,
  "Pancakes": 80,
  "Salmon Dinner": 300,
  "Fish Taco": 500,
  "Crispy Bass": 150,
  "Pepper Poppers": 200,
  "Bread": 60,
  "Tom Kha Soup": 250,
  "Trout Soup": 100,
  "Chocolate Cake": 200,
  "Pink Cake": 480,
  "Rhubarb Pie": 400,
  "Cookie": 140,
  "Spaghetti": 120,
  "Fried Eel": 120,
  "Spicy Eel": 175,
  "Sashimi": 75,
  "Maki Roll": 220,
  "Tortilla": 50,
  "Red Plate": 400,
  "Eggplant Parmesan": 200,
  "Rice Pudding": 260,
  "Ice Cream": 120,
  "Blueberry Tart": 150,
  "Autumn's Bounty": 350,
  "Pumpkin Soup": 300,
  "Super Meal": 220,
  "Cranberry Sauce": 120,
  "Stuffing": 165,
  "Farmer's Lunch": 150,
  "Survival Burger": 180,
  "Dish O' The Sea": 220,
  "Miner's Treat": 200,
  "Roots Platter": 100,
  "Triple Shot Espresso": 450,
  "Seafoam Pudding": 300,
  "Algae Soup": 100,
  "Pale Broth": 150,
  "Plum Pudding": 260,
  "Artichoke Dip": 210,
  "Stir Fry": 335,
  "Roasted Hazelnuts": 270,
  "Pumpkin Pie": 385,
  "Radish Salad": 300,
  "Fruit Salad": 450,
  "Blackberry Cobbler": 260,
  "Cranberry Candy": 175,
  "Bruschetta": 210,
  "Coleslaw": 345,
  "Fiddlehead Risotto": 350,
  "Poppyseed Muffin": 250,
  "Chowder": 135,
  "Fish Stew": 175,
  "Escargot": 125,
  "Lobster Bisque": 205,
  "Maple Bar": 300,
  "Crab Cakes": 275,
  "Shrimp Cocktail": 160,
  "Ginger Ale": 200,
  "Banana Pudding": 260,
  "Mango Sticky Rice": 250,
  "Poi": 400,
  "Tropical Curry": 500,
  "Squid Ink Ravioli": 150,
  "Moss Soup": 80
};
export function recipeUnlock(kind:string,name:string):Unlock|undefined{
 const lookup=kind==='cooking'?reference.cooking:kind==='crafting'?reference.crafting:null;
 return lookup&&Object.hasOwn(lookup,name)?lookup[name]:undefined;
}
export function matchesUnlock(kind:string,name:string,group:string){return group==='all'||!!recipeUnlock(kind,name)?.groups.some(g=>g===group)}
