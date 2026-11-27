# Independent comparison, 2026-11-28
Geode source: pinned Stardew Compass fixture above. Its README reports direct unmodified 1.6.15.24356 assembly calls, not a full game session. 200/200 IDs and quantities matched in a direct execution of the current predictor with types stripped, five supported containers, two RNG modes, openings 468–487. Depth 145 normalized to 120 as the save reader does. 40 Golden Coconut cases not supported. Correct object 82 label to Fire Quartz (https://stardewvalleywiki.com/Fire_Quartz). CI must rerun. MIT notice retained. This is limited third-party game-assembly evidence, not firsthand game validation or approval.

Map source: https://github.com/hpeinar/stardewplanner/tree/f6c8dd5fba513d78b95d491a8aa77d6532c55ee6/public/planner/js/data/layer-information ; compared with https://stardewvalleywiki.com/Farm_Maps and https://stardew.gs/maps/farm/tables/ . All eight current FARMS aggregate tillable and additional buildable counts agree with Wiki; these are not tile masks.

| Farm | Old grid | Old tillable | Current reference |
|---|---|---:|---:|
| Standard | 80x65 | 3426 | 3427 |
| Riverland | 80x65 | 1620 | 1578 |
| Forest | 80x65 | 1406 | 1413 |
| Hill-top | 80x65 | 1659 | 1648 |
| Wilderness | 80x65 | 2151 | 2131 |
| Four Corners | 80x80 | 2954 | 2952 |
| Beach | 110x110 | 2700 | 2700 |
| Meadowlands | unavailable | — | 2066 |
All seven old masks cover the whole grid with unique coordinates; six differ in counts and matching totals do not prove coordinate parity. V3 closed source; V2 and Designer source licenses do not establish game art/map permission. No mask or game artwork copied. Next compare legitimate 1.6.15 local map predicates tile-by-tile; do not declare official accuracy based on this old reference. No release approval changed.

## Multiplayer perfection
Pinned Checkup 8e48aa1806ad2c856d35e1a68f08128b4673f2c5, parsePerfectionTracker uses the maximum individual percentage for six proportional player goals and any single complete player for the two boolean goals; farm buildings and walnuts are shared. Independent implementation uses existing reference denominators and weights, no union of players' collections. Manual scenarios treat entered counts as asserted; observed roster counts are minima and waivers not imported. Checkup's 155 shipping items include Clam; official 1.6 changelog classifies Clam as fish, current Wiki shipping list excludes it. Keep 154 pending further actual-game evidence. Sources: https://www.stardewvalley.net/stardew-valley-1-6-update-full-changelog/ ; https://stardewvalleywiki.com/Shipping ; https://stardewvalleywiki.com/Perfection . No full game accuracy approval.

## Independent catalogue, walnut and cart parity
Compared exact Checkup 8e48aa1806ad2c856d35e1a68f08128b4673f2c5 and Predictor b9e7c717b94924ae8bdb10c59f96eebc8fa7ab08 sources. All 551 reference catalogue items agree (cooking/fishing/shipping by ID and case-folded name, museum by ID and normalized name, crafting by normalized recipe name); Checkup's extra shipping Clam is excluded per 1.6 classification. All 69 walnut keys and reward counts agree (130). Executed upstream object/furniture selection, CSRandom and xxHash for 240 visits using four seeds, two RNG modes and year 2 spring/winter and year 25 autumn; ordered stock IDs, prices, quantities, independent offers and book title all match. Stored expected outputs in tests/fixtures/competitor-parity.json; existing public/licenses notices apply. Not actual gameplay, no year-1 guarantee or day-adjust parity, no precise farm coordinate approval, no real device or release approval. No raw game maps or art copied.
