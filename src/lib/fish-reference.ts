// Numerical reference data independently extracted from the Fish table and matched to
// all 72 existing collection IDs, 2026-11-27. https://stardewvalleywiki.com/Fish
// Retain listed tiers instead of recomputing rounded profession/quality multipliers.
// No source descriptions, artwork, or unrelated collection rows included.
export type FishReference={prices:number[][];method:'rod'|'pot'|'other';difficulty?:number;behavior?:string};
export const FISH_REFERENCE:Readonly<Record<string,FishReference>>={
  "Pufferfish": {
    "prices": [
      [
        200,
        250,
        300,
        400
      ],
      [
        250,
        312,
        375,
        500
      ],
      [
        300,
        375,
        450,
        600
      ]
    ],
    "method": "rod",
    "difficulty": 80,
    "behavior": "floater"
  },
  "Anchovy": {
    "prices": [
      [
        30,
        37,
        45,
        60
      ],
      [
        37,
        46,
        56,
        75
      ],
      [
        45,
        55,
        67,
        90
      ]
    ],
    "method": "rod",
    "difficulty": 30,
    "behavior": "dart"
  },
  "Tuna": {
    "prices": [
      [
        100,
        125,
        150,
        200
      ],
      [
        125,
        156,
        187,
        250
      ],
      [
        150,
        187,
        225,
        300
      ]
    ],
    "method": "rod",
    "difficulty": 70,
    "behavior": "smooth"
  },
  "Sardine": {
    "prices": [
      [
        40,
        50,
        60,
        80
      ],
      [
        50,
        62,
        75,
        100
      ],
      [
        60,
        75,
        90,
        120
      ]
    ],
    "method": "rod",
    "difficulty": 30,
    "behavior": "dart"
  },
  "Bream": {
    "prices": [
      [
        45,
        56,
        67,
        90
      ],
      [
        56,
        70,
        83,
        112
      ],
      [
        67,
        84,
        100,
        135
      ]
    ],
    "method": "rod",
    "difficulty": 35,
    "behavior": "smooth"
  },
  "Largemouth Bass": {
    "prices": [
      [
        100,
        125,
        150,
        200
      ],
      [
        125,
        156,
        187,
        250
      ],
      [
        150,
        187,
        225,
        300
      ]
    ],
    "method": "rod",
    "difficulty": 50,
    "behavior": "mixed"
  },
  "Smallmouth Bass": {
    "prices": [
      [
        50,
        62,
        75,
        100
      ],
      [
        62,
        77,
        93,
        125
      ],
      [
        75,
        93,
        112,
        150
      ]
    ],
    "method": "rod",
    "difficulty": 28,
    "behavior": "mixed"
  },
  "Rainbow Trout": {
    "prices": [
      [
        65,
        81,
        97,
        130
      ],
      [
        81,
        101,
        121,
        162
      ],
      [
        97,
        121,
        145,
        195
      ]
    ],
    "method": "rod",
    "difficulty": 45,
    "behavior": "mixed"
  },
  "Salmon": {
    "prices": [
      [
        75,
        93,
        112,
        150
      ],
      [
        93,
        116,
        140,
        187
      ],
      [
        112,
        139,
        168,
        225
      ]
    ],
    "method": "rod",
    "difficulty": 50,
    "behavior": "mixed"
  },
  "Walleye": {
    "prices": [
      [
        105,
        131,
        157,
        210
      ],
      [
        131,
        163,
        196,
        262
      ],
      [
        157,
        196,
        235,
        315
      ]
    ],
    "method": "rod",
    "difficulty": 45,
    "behavior": "smooth"
  },
  "Perch": {
    "prices": [
      [
        55,
        68,
        82,
        110
      ],
      [
        68,
        85,
        102,
        137
      ],
      [
        82,
        102,
        123,
        165
      ]
    ],
    "method": "rod",
    "difficulty": 35,
    "behavior": "dart"
  },
  "Carp": {
    "prices": [
      [
        30,
        37,
        45,
        60
      ],
      [
        37,
        46,
        56,
        75
      ],
      [
        45,
        55,
        67,
        90
      ]
    ],
    "method": "rod",
    "difficulty": 15,
    "behavior": "mixed"
  },
  "Catfish": {
    "prices": [
      [
        200,
        250,
        300,
        400
      ],
      [
        250,
        312,
        375,
        500
      ],
      [
        300,
        375,
        450,
        600
      ]
    ],
    "method": "rod",
    "difficulty": 75,
    "behavior": "mixed"
  },
  "Pike": {
    "prices": [
      [
        100,
        125,
        150,
        200
      ],
      [
        125,
        156,
        187,
        250
      ],
      [
        150,
        187,
        225,
        300
      ]
    ],
    "method": "rod",
    "difficulty": 60,
    "behavior": "dart"
  },
  "Sunfish": {
    "prices": [
      [
        30,
        37,
        45,
        60
      ],
      [
        37,
        46,
        56,
        75
      ],
      [
        45,
        55,
        67,
        90
      ]
    ],
    "method": "rod",
    "difficulty": 30,
    "behavior": "mixed"
  },
  "Red Mullet": {
    "prices": [
      [
        75,
        93,
        112,
        150
      ],
      [
        93,
        116,
        140,
        187
      ],
      [
        112,
        139,
        168,
        225
      ]
    ],
    "method": "rod",
    "difficulty": 55,
    "behavior": "smooth"
  },
  "Herring": {
    "prices": [
      [
        30,
        37,
        45,
        60
      ],
      [
        37,
        46,
        56,
        75
      ],
      [
        45,
        55,
        67,
        90
      ]
    ],
    "method": "rod",
    "difficulty": 25,
    "behavior": "dart"
  },
  "Eel": {
    "prices": [
      [
        85,
        106,
        127,
        170
      ],
      [
        106,
        132,
        158,
        212
      ],
      [
        127,
        159,
        190,
        255
      ]
    ],
    "method": "rod",
    "difficulty": 70,
    "behavior": "smooth"
  },
  "Octopus": {
    "prices": [
      [
        150,
        187,
        225,
        300
      ],
      [
        187,
        233,
        281,
        375
      ],
      [
        225,
        280,
        337,
        450
      ]
    ],
    "method": "rod",
    "difficulty": 95,
    "behavior": "sinker"
  },
  "Red Snapper": {
    "prices": [
      [
        50,
        62,
        75,
        100
      ],
      [
        62,
        77,
        93,
        125
      ],
      [
        75,
        93,
        112,
        150
      ]
    ],
    "method": "rod",
    "difficulty": 40,
    "behavior": "mixed"
  },
  "Squid": {
    "prices": [
      [
        80,
        100,
        120,
        160
      ],
      [
        100,
        125,
        150,
        200
      ],
      [
        120,
        150,
        180,
        240
      ]
    ],
    "method": "rod",
    "difficulty": 75,
    "behavior": "sinker"
  },
  "Seaweed": {
    "prices": [
      [
        20,
        25,
        30,
        40
      ]
    ],
    "method": "other"
  },
  "Green Algae": {
    "prices": [
      [
        15
      ]
    ],
    "method": "other"
  },
  "Sea Cucumber": {
    "prices": [
      [
        75,
        93,
        112,
        150
      ],
      [
        93,
        116,
        140,
        187
      ],
      [
        112,
        139,
        168,
        225
      ]
    ],
    "method": "rod",
    "difficulty": 40,
    "behavior": "sinker"
  },
  "Super Cucumber": {
    "prices": [
      [
        250,
        312,
        375,
        500
      ],
      [
        312,
        390,
        468,
        625
      ],
      [
        375,
        468,
        562,
        750
      ]
    ],
    "method": "rod",
    "difficulty": 80,
    "behavior": "sinker"
  },
  "Ghostfish": {
    "prices": [
      [
        45,
        56,
        67,
        90
      ],
      [
        56,
        70,
        83,
        112
      ],
      [
        67,
        84,
        100,
        135
      ]
    ],
    "method": "rod",
    "difficulty": 50,
    "behavior": "mixed"
  },
  "White Algae": {
    "prices": [
      [
        25
      ]
    ],
    "method": "other"
  },
  "Stonefish": {
    "prices": [
      [
        300,
        375,
        450,
        600
      ],
      [
        375,
        468,
        562,
        750
      ],
      [
        450,
        562,
        675,
        900
      ]
    ],
    "method": "rod",
    "difficulty": 65,
    "behavior": "sinker"
  },
  "Crimsonfish": {
    "prices": [
      [
        1500,
        1875,
        2250,
        3000
      ],
      [
        1875,
        2343,
        2812,
        3750
      ],
      [
        2250,
        2812,
        3375,
        4500
      ]
    ],
    "method": "rod",
    "difficulty": 95,
    "behavior": "mixed"
  },
  "Angler": {
    "prices": [
      [
        900,
        1125,
        1350,
        1800
      ],
      [
        1125,
        1406,
        1687,
        2250
      ],
      [
        1350,
        1687,
        2025,
        2700
      ]
    ],
    "method": "rod",
    "difficulty": 85,
    "behavior": "smooth"
  },
  "Ice Pip": {
    "prices": [
      [
        500,
        625,
        750,
        1000
      ],
      [
        625,
        781,
        937,
        1250
      ],
      [
        750,
        937,
        1125,
        1500
      ]
    ],
    "method": "rod",
    "difficulty": 85,
    "behavior": "dart"
  },
  "Lava Eel": {
    "prices": [
      [
        700,
        875,
        1050,
        1400
      ],
      [
        875,
        1093,
        1312,
        1750
      ],
      [
        1050,
        1312,
        1575,
        2100
      ]
    ],
    "method": "rod",
    "difficulty": 90,
    "behavior": "mixed"
  },
  "Legend": {
    "prices": [
      [
        5000,
        6250,
        7500,
        10000
      ],
      [
        6250,
        7812,
        9375,
        12500
      ],
      [
        7500,
        9375,
        11250,
        15000
      ]
    ],
    "method": "rod",
    "difficulty": 110,
    "behavior": "mixed"
  },
  "Sandfish": {
    "prices": [
      [
        75,
        93,
        112,
        150
      ],
      [
        93,
        116,
        140,
        187
      ],
      [
        112,
        139,
        168,
        225
      ]
    ],
    "method": "rod",
    "difficulty": 65,
    "behavior": "mixed"
  },
  "Scorpion Carp": {
    "prices": [
      [
        150,
        187,
        225,
        300
      ],
      [
        187,
        233,
        281,
        375
      ],
      [
        225,
        280,
        337,
        450
      ]
    ],
    "method": "rod",
    "difficulty": 90,
    "behavior": "dart"
  },
  "Flounder": {
    "prices": [
      [
        100,
        125,
        150,
        200
      ],
      [
        125,
        156,
        187,
        250
      ],
      [
        150,
        187,
        225,
        300
      ]
    ],
    "method": "rod",
    "difficulty": 50,
    "behavior": "sinker"
  },
  "Midnight Carp": {
    "prices": [
      [
        150,
        187,
        225,
        300
      ],
      [
        187,
        233,
        281,
        375
      ],
      [
        225,
        280,
        337,
        450
      ]
    ],
    "method": "rod",
    "difficulty": 55,
    "behavior": "mixed"
  },
  "Clam": {
    "prices": [
      [
        50,
        62,
        75,
        100
      ],
      [
        62,
        77,
        93,
        125
      ],
      [
        75,
        93,
        112,
        150
      ]
    ],
    "method": "pot"
  },
  "Mutant Carp": {
    "prices": [
      [
        1000,
        1250,
        1500,
        2000
      ],
      [
        1250,
        1562,
        1875,
        2500
      ],
      [
        1500,
        1875,
        2250,
        3000
      ]
    ],
    "method": "rod",
    "difficulty": 80,
    "behavior": "dart"
  },
  "Sturgeon": {
    "prices": [
      [
        200,
        250,
        300,
        400
      ],
      [
        250,
        312,
        375,
        500
      ],
      [
        300,
        375,
        450,
        600
      ]
    ],
    "method": "rod",
    "difficulty": 78,
    "behavior": "mixed"
  },
  "Tiger Trout": {
    "prices": [
      [
        150,
        187,
        225,
        300
      ],
      [
        187,
        233,
        281,
        375
      ],
      [
        225,
        280,
        337,
        450
      ]
    ],
    "method": "rod",
    "difficulty": 60,
    "behavior": "dart"
  },
  "Bullhead": {
    "prices": [
      [
        75,
        93,
        112,
        150
      ],
      [
        93,
        116,
        140,
        187
      ],
      [
        112,
        139,
        168,
        225
      ]
    ],
    "method": "rod",
    "difficulty": 46,
    "behavior": "smooth"
  },
  "Tilapia": {
    "prices": [
      [
        75,
        93,
        112,
        150
      ],
      [
        93,
        116,
        140,
        187
      ],
      [
        112,
        139,
        168,
        225
      ]
    ],
    "method": "rod",
    "difficulty": 50,
    "behavior": "mixed"
  },
  "Chub": {
    "prices": [
      [
        50,
        62,
        75,
        100
      ],
      [
        62,
        77,
        93,
        125
      ],
      [
        75,
        93,
        112,
        150
      ]
    ],
    "method": "rod",
    "difficulty": 35,
    "behavior": "dart"
  },
  "Dorado": {
    "prices": [
      [
        100,
        125,
        150,
        200
      ],
      [
        125,
        156,
        187,
        250
      ],
      [
        150,
        187,
        225,
        300
      ]
    ],
    "method": "rod",
    "difficulty": 78,
    "behavior": "mixed"
  },
  "Albacore": {
    "prices": [
      [
        75,
        93,
        112,
        150
      ],
      [
        93,
        116,
        140,
        187
      ],
      [
        112,
        139,
        168,
        225
      ]
    ],
    "method": "rod",
    "difficulty": 60,
    "behavior": "mixed"
  },
  "Shad": {
    "prices": [
      [
        60,
        75,
        90,
        120
      ],
      [
        75,
        93,
        112,
        150
      ],
      [
        90,
        112,
        135,
        180
      ]
    ],
    "method": "rod",
    "difficulty": 45,
    "behavior": "smooth"
  },
  "Lingcod": {
    "prices": [
      [
        120,
        150,
        180,
        240
      ],
      [
        150,
        187,
        225,
        300
      ],
      [
        180,
        225,
        270,
        360
      ]
    ],
    "method": "rod",
    "difficulty": 85,
    "behavior": "mixed"
  },
  "Halibut": {
    "prices": [
      [
        80,
        100,
        120,
        160
      ],
      [
        100,
        125,
        150,
        200
      ],
      [
        120,
        150,
        180,
        240
      ]
    ],
    "method": "rod",
    "difficulty": 50,
    "behavior": "sinker"
  },
  "Lobster": {
    "prices": [
      [
        120,
        150
      ],
      [
        150,
        187
      ],
      [
        180,
        225
      ]
    ],
    "method": "pot"
  },
  "Crayfish": {
    "prices": [
      [
        75,
        93
      ],
      [
        93,
        116
      ],
      [
        112,
        139
      ]
    ],
    "method": "pot"
  },
  "Crab": {
    "prices": [
      [
        100,
        125
      ],
      [
        125,
        156
      ],
      [
        150,
        187
      ]
    ],
    "method": "pot"
  },
  "Cockle": {
    "prices": [
      [
        50,
        62,
        75,
        100
      ],
      [
        62,
        77,
        93,
        125
      ],
      [
        75,
        93,
        112,
        150
      ]
    ],
    "method": "pot"
  },
  "Mussel": {
    "prices": [
      [
        30,
        37,
        45,
        60
      ],
      [
        37,
        46,
        56,
        75
      ],
      [
        45,
        55,
        67,
        90
      ]
    ],
    "method": "pot"
  },
  "Shrimp": {
    "prices": [
      [
        60,
        75
      ],
      [
        75,
        93
      ],
      [
        90,
        112
      ]
    ],
    "method": "pot"
  },
  "Snail": {
    "prices": [
      [
        65,
        81
      ],
      [
        81,
        101
      ],
      [
        97,
        121
      ]
    ],
    "method": "pot"
  },
  "Periwinkle": {
    "prices": [
      [
        20,
        25
      ],
      [
        25,
        31
      ],
      [
        30,
        37
      ]
    ],
    "method": "pot"
  },
  "Oyster": {
    "prices": [
      [
        40,
        50,
        60,
        80
      ],
      [
        50,
        62,
        75,
        100
      ],
      [
        60,
        75,
        90,
        120
      ]
    ],
    "method": "pot"
  },
  "Woodskip": {
    "prices": [
      [
        75,
        93,
        112,
        150
      ],
      [
        93,
        116,
        140,
        187
      ],
      [
        112,
        139,
        168,
        225
      ]
    ],
    "method": "rod",
    "difficulty": 50,
    "behavior": "mixed"
  },
  "Glacierfish": {
    "prices": [
      [
        1000,
        1250,
        1500,
        2000
      ],
      [
        1250,
        1562,
        1875,
        2500
      ],
      [
        1500,
        1875,
        2250,
        3000
      ]
    ],
    "method": "rod",
    "difficulty": 100,
    "behavior": "mixed"
  },
  "Void Salmon": {
    "prices": [
      [
        150,
        187,
        225,
        300
      ],
      [
        187,
        233,
        281,
        375
      ],
      [
        225,
        280,
        337,
        450
      ]
    ],
    "method": "rod",
    "difficulty": 80,
    "behavior": "mixed"
  },
  "Slimejack": {
    "prices": [
      [
        100,
        125,
        150,
        200
      ],
      [
        125,
        156,
        187,
        250
      ],
      [
        150,
        187,
        225,
        300
      ]
    ],
    "method": "rod",
    "difficulty": 55,
    "behavior": "dart"
  },
  "Midnight Squid": {
    "prices": [
      [
        100,
        125,
        150,
        200
      ],
      [
        125,
        156,
        187,
        250
      ],
      [
        150,
        187,
        225,
        300
      ]
    ],
    "method": "rod",
    "difficulty": 55,
    "behavior": "sinker"
  },
  "Spook Fish": {
    "prices": [
      [
        220,
        275,
        330,
        440
      ],
      [
        275,
        343,
        412,
        550
      ],
      [
        330,
        412,
        495,
        660
      ]
    ],
    "method": "rod",
    "difficulty": 60,
    "behavior": "dart"
  },
  "Blobfish": {
    "prices": [
      [
        500,
        625,
        750,
        1000
      ],
      [
        625,
        781,
        937,
        1250
      ],
      [
        750,
        937,
        1125,
        1500
      ]
    ],
    "method": "rod",
    "difficulty": 75,
    "behavior": "floater"
  },
  "Stingray": {
    "prices": [
      [
        180,
        225,
        270,
        360
      ],
      [
        225,
        281,
        337,
        450
      ],
      [
        270,
        337,
        405,
        540
      ]
    ],
    "method": "rod",
    "difficulty": 80,
    "behavior": "sinker"
  },
  "Lionfish": {
    "prices": [
      [
        100,
        125,
        150,
        200
      ],
      [
        125,
        156,
        187,
        250
      ],
      [
        150,
        187,
        225,
        300
      ]
    ],
    "method": "rod",
    "difficulty": 50,
    "behavior": "smooth"
  },
  "Blue Discus": {
    "prices": [
      [
        120,
        150,
        180,
        240
      ],
      [
        150,
        187,
        225,
        300
      ],
      [
        180,
        225,
        270,
        360
      ]
    ],
    "method": "rod",
    "difficulty": 60,
    "behavior": "dart"
  },
  "River Jelly": {
    "prices": [
      [
        125
      ]
    ],
    "method": "other"
  },
  "Cave Jelly": {
    "prices": [
      [
        180
      ]
    ],
    "method": "other"
  },
  "Sea Jelly": {
    "prices": [
      [
        200
      ]
    ],
    "method": "other"
  },
  "Goby": {
    "prices": [
      [
        150,
        187,
        225,
        300
      ],
      [
        187,
        233,
        281,
        375
      ],
      [
        225,
        280,
        337,
        450
      ]
    ],
    "method": "rod",
    "difficulty": 55,
    "behavior": "dart"
  }
};
export function fishReference(name:string){return Object.hasOwn(FISH_REFERENCE,name)?FISH_REFERENCE[name]:undefined}
export function fishPrice(name:string,profession:number,quality:number){
 const ref=fishReference(name);
 if(!ref||!Number.isInteger(profession)||!Number.isInteger(quality)||profession<0||quality<0)return undefined;
 return ref.prices[profession]?.[quality];
}
