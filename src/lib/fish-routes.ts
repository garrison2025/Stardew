// Factual acquisition columns, normalized from https://stardewvalleywiki.com/Fish,
// 2026-11-27. Conditions can depend on the particular location; not a catchability engine.
export type FishRouteDetails={location:string;time:string;season:string;weather:string;level?:number;note?:string};
export const FISH_ROUTES:Readonly<Record<string,FishRouteDetails>>={
  "Pufferfish": {
    "location": "Ocean, Ginger Island Oceans",
    "time": "12pm – 4pm",
    "season": "Summer (All Seasons on Ginger Island)",
    "weather": "Sun"
  },
  "Anchovy": {
    "location": "Ocean",
    "time": "Anytime",
    "season": "Spring Fall",
    "weather": "Any"
  },
  "Tuna": {
    "location": "Ocean, Ginger Island Oceans",
    "time": "6am – 7pm",
    "season": "Summer Winter (All Seasons on Ginger Island)",
    "weather": "Any"
  },
  "Sardine": {
    "location": "Ocean",
    "time": "6am – 7pm",
    "season": "Spring Fall Winter",
    "weather": "Any"
  },
  "Bream": {
    "location": "Town River, Forest River",
    "time": "6pm – 2am",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Largemouth Bass": {
    "location": "Mountain Lake",
    "time": "6am – 7pm",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Smallmouth Bass": {
    "location": "Town River, Forest Pond",
    "time": "Anytime",
    "season": "Spring Fall",
    "weather": "Any"
  },
  "Rainbow Trout": {
    "location": "Town River, Forest River, Mountain Lake",
    "time": "6am – 7pm",
    "season": "Summer",
    "weather": "Sun"
  },
  "Salmon": {
    "location": "Town River, Forest River, Forest Waterfalls",
    "time": "6am – 7pm",
    "season": "Fall",
    "weather": "Any"
  },
  "Walleye": {
    "location": "Town River, Forest River, Forest Pond, Mountain Lake",
    "time": "12pm – 2am",
    "season": "Fall Winter with Rain Totem",
    "weather": "Rain"
  },
  "Perch": {
    "location": "Town River, Forest River, Forest Pond, Mountain Lake",
    "time": "Anytime",
    "season": "Winter",
    "weather": "Any"
  },
  "Carp": {
    "location": "Mountain Lake, Secret Woods, Sewers, Mutant Bug Lair",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Catfish": {
    "location": "Town River, Forest River, Secret Woods, Witch's Swamp",
    "time": "6am – 12am",
    "season": "Spring Fall ( Spring & Summer in Secret Woods Pond) Winter with Rain Totem",
    "weather": "Rain"
  },
  "Pike": {
    "location": "Town River, Forest River, Forest Pond",
    "time": "Anytime",
    "season": "Summer Winter",
    "weather": "Any"
  },
  "Sunfish": {
    "location": "Town River, Forest River",
    "time": "6am – 7pm",
    "season": "Spring Summer",
    "weather": "Sun Wind"
  },
  "Red Mullet": {
    "location": "Ocean",
    "time": "6am – 7pm",
    "season": "Summer Winter",
    "weather": "Any"
  },
  "Herring": {
    "location": "Ocean",
    "time": "Anytime",
    "season": "Spring Winter",
    "weather": "Any"
  },
  "Eel": {
    "location": "Ocean",
    "time": "4pm – 2am",
    "season": "Spring Fall",
    "weather": "Rain"
  },
  "Octopus": {
    "location": "Ocean, Ginger Island Oceans",
    "time": "6am – 1pm",
    "season": "Summer (All Seasons on Ginger Island)",
    "weather": "Any"
  },
  "Red Snapper": {
    "location": "Ocean",
    "time": "6am – 7pm",
    "season": "Summer Fall Winter with Rain Totem",
    "weather": "Rain"
  },
  "Squid": {
    "location": "Ocean",
    "time": "6pm – 2am",
    "season": "Winter",
    "weather": "Any"
  },
  "Seaweed": {
    "location": "Ocean via Fishing Beach via Foraging",
    "time": "See individual catch reference",
    "season": "See individual catch reference",
    "weather": "See individual catch reference",
    "note": "Other catchable; acquisition outside a catch may not complete collection."
  },
  "Green Algae": {
    "location": "Everywhere but the Farm Pond of the Standard Farm and the Ocean",
    "time": "See individual catch reference",
    "season": "See individual catch reference",
    "weather": "See individual catch reference",
    "note": "Other catchable; acquisition outside a catch may not complete collection."
  },
  "Sea Cucumber": {
    "location": "Ocean",
    "time": "6am – 7pm",
    "season": "Fall Winter",
    "weather": "Any"
  },
  "Super Cucumber": {
    "location": "Ocean, Ginger Island Oceans",
    "time": "6pm – 2am",
    "season": "Summer Fall (All Seasons on Ginger Island)",
    "weather": "Any"
  },
  "Ghostfish": {
    "location": "Mines (Floors 20 & 60), Ghost Drops",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "White Algae": {
    "location": "Mines • Sewers • Mutant Bug Lair • Witch's Swamp",
    "time": "See individual catch reference",
    "season": "See individual catch reference",
    "weather": "See individual catch reference",
    "note": "Other catchable; acquisition outside a catch may not complete collection."
  },
  "Stonefish": {
    "location": "Mines (Floor 20)",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Crimsonfish": {
    "location": "East Pier on The Beach. Requires level 5 fishing.",
    "time": "Any",
    "season": "Summer",
    "weather": "Any",
    "level": 5
  },
  "Angler": {
    "location": "Near the waterfall north of JojaMart. Requires level 3 fishing.",
    "time": "Any",
    "season": "Fall",
    "weather": "Any",
    "level": 3
  },
  "Ice Pip": {
    "location": "Mines (Floor 60)",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Lava Eel": {
    "location": "Mines (Floor 100), Volcano Caldera",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Legend": {
    "location": "The Mountain Lake near the log. Requires level 10 fishing.",
    "time": "Any",
    "season": "Spring",
    "weather": "Rain",
    "level": 10
  },
  "Sandfish": {
    "location": "Desert",
    "time": "6am – 8pm",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Scorpion Carp": {
    "location": "Desert, Requires fishing level 4",
    "time": "6am – 8pm",
    "season": "All Seasons",
    "weather": "Any",
    "level": 4
  },
  "Flounder": {
    "location": "Ocean, Ginger Island Oceans",
    "time": "6am – 8pm",
    "season": "Spring Summer (All Seasons on Ginger Island)",
    "weather": "Any"
  },
  "Midnight Carp": {
    "location": "Forest Pond, Mountain Lake, Ginger Island Rivers",
    "time": "10pm – 2am",
    "season": "Fall Winter (All Seasons on Ginger Island)",
    "weather": "Any"
  },
  "Clam": {
    "location": "Ocean crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Mutant Carp": {
    "location": "The Sewers",
    "time": "Any",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Sturgeon": {
    "location": "Mountain Lake",
    "time": "6am – 7pm",
    "season": "Summer Winter",
    "weather": "Any"
  },
  "Tiger Trout": {
    "location": "Town River, Forest River",
    "time": "6am – 7pm",
    "season": "Fall Winter",
    "weather": "Any"
  },
  "Bullhead": {
    "location": "Mountain Lake",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Tilapia": {
    "location": "Ocean, Ginger Island Rivers",
    "time": "6am – 2pm",
    "season": "Summer Fall (All Seasons on Ginger Island)",
    "weather": "Any"
  },
  "Chub": {
    "location": "Forest River, Mountain Lake",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Dorado": {
    "location": "Forest River",
    "time": "6am – 7pm",
    "season": "Summer",
    "weather": "Any"
  },
  "Albacore": {
    "location": "Ocean",
    "time": "6am – 11am 6pm – 2am",
    "season": "Fall Winter",
    "weather": "Any"
  },
  "Shad": {
    "location": "Town River, Forest River",
    "time": "9am – 2am",
    "season": "Spring Summer Fall",
    "weather": "Rain"
  },
  "Lingcod": {
    "location": "Town River, Forest River, Mountain Lake",
    "time": "Any time",
    "season": "Winter",
    "weather": "Any"
  },
  "Halibut": {
    "location": "Ocean",
    "time": "6am – 11am 7pm – 2am",
    "season": "Spring Summer Winter",
    "weather": "Any"
  },
  "Lobster": {
    "location": "Ocean crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Crayfish": {
    "location": "Freshwater crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Crab": {
    "location": "Ocean crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Cockle": {
    "location": "Ocean crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Mussel": {
    "location": "Ocean crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Shrimp": {
    "location": "Ocean crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Snail": {
    "location": "Freshwater crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Periwinkle": {
    "location": "Freshwater crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Oyster": {
    "location": "Ocean crab pot",
    "time": "Daily pot collection",
    "season": "All seasons",
    "weather": "Any",
    "note": "Bait required unless Luremaster. Deluxe Bait may produce silver quality."
  },
  "Woodskip": {
    "location": "Secret Woods, Forest Farm",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Glacierfish": {
    "location": "South end of Arrowhead Island in Cindersap Forest. Requires level 6 fishing.",
    "time": "Any",
    "season": "Winter",
    "weather": "Any",
    "level": 6
  },
  "Void Salmon": {
    "location": "Witch's Swamp",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Slimejack": {
    "location": "Mutant Bug Lair",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Midnight Squid": {
    "location": "Night Market submarine",
    "time": "Submarine fishing hours",
    "season": "Winter 15–17",
    "weather": "Any",
    "note": "Magic Bait can provide an alternative at the appropriate beach location."
  },
  "Spook Fish": {
    "location": "Night Market submarine",
    "time": "Submarine fishing hours",
    "season": "Winter 15–17",
    "weather": "Any",
    "note": "Magic Bait can provide an alternative at the appropriate beach location."
  },
  "Blobfish": {
    "location": "Night Market submarine",
    "time": "Submarine fishing hours",
    "season": "Winter 15–17",
    "weather": "Any",
    "note": "Magic Bait can provide an alternative at the appropriate beach location."
  },
  "Stingray": {
    "location": "Pirate Cove (Ginger Island)",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Lionfish": {
    "location": "Ginger Island Oceans",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "Blue Discus": {
    "location": "Ginger Island Rivers",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  },
  "River Jelly": {
    "location": "Freshwater locations",
    "time": "See individual catch reference",
    "season": "See individual catch reference",
    "weather": "See individual catch reference",
    "note": "Other catchable; acquisition outside a catch may not complete collection."
  },
  "Cave Jelly": {
    "location": "Levels 20, 60, and 100 of the Mines",
    "time": "See individual catch reference",
    "season": "See individual catch reference",
    "weather": "See individual catch reference",
    "note": "Other catchable; acquisition outside a catch may not complete collection."
  },
  "Sea Jelly": {
    "location": "Saltwater locations",
    "time": "See individual catch reference",
    "season": "See individual catch reference",
    "weather": "See individual catch reference",
    "note": "Other catchable; acquisition outside a catch may not complete collection."
  },
  "Goby": {
    "location": "Forest Waterfalls",
    "time": "Anytime",
    "season": "All Seasons",
    "weather": "Any"
  }
};
export function fishRoute(name:string){return Object.hasOwn(FISH_ROUTES,name)?FISH_ROUTES[name]:undefined}
