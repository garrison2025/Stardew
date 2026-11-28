# Independent real-game fixture acceptance (local only)
This runner supplies a repeatable comparison method, not actual in-game evidence. Do not generate expected values from Field & Farm or from another implementation of the same algorithm and call them independent. Obtain unmodded PC 1.6.15 observations directly from the game, with a copy of the corresponding main save before opening geodes. Keep files outside the repository and never publish raw saves, player names, IDs or screenshots that identify players.
1. Use the repo on Node 22.23.4 or later; install dependencies with npm ci.
2. In a separate private folder create observations.json and place the saved main game file next to it. Fill in this **illustrative format only**, replacing all placeholder observations with manually verified values. No example here counts as a real fixture.
```json
{"schema":1,"cases":[{"kind":"save","version":"1.6.15","save":"local-main-save","observationSource":"Manually read from in-game character and collection menus","checks":{"version":"1.6.15","year":1,"day":5,"progress.money":500,"progress.xp":[0,0,0,0,0]}},{"kind":"geode","version":"1.6.15","save":"local-main-save","observationSource":"Observed Clint opening in order, no reload","container":"Geode","observed":[{"id":390,"quantity":3}]}]}
```
3. Run npm run audit:game-fixtures -- "C:/private/observations.json" (or the appropriate absolute path). Output is comparison counts and numbered mismatches only, with no raw values or IDs. Missing values cannot match expected null. A failure remains a failure until independently resolved.
4. Save cases can compare version/year/day/season, farm type, recognized farm records, progress (collection records, known/crafted recipes, XP, walnuts, backpack, storage, bundles) and farmhands. Only claim the observed fields; choose explicit fields and avoid personal identifiers. Geode cases support the five implemented container types. Enter the actual ordered item IDs and quantities from Clint; use separate before-opening snapshots for different container sequences. Do not infer exact farm geometry or all stock from partial observations.
5. For final data acceptance, separately record actual cart visit dates, venues, item/quantity/price, special offer unlock conditions, walnut task and collection completion evidence. Cart cases now support positive ordinary, furniture, seasonal, guarantee, special and confirmed skill-book slots from the saved starting day over the 28-day forecast. They do not prove complete stock or absence, exclude infinite-quantity Tea Set, and do not evaluate calendar events. Uncertain titles are not accepted. Synthetic tests only validate runner behavior. Do not turn on fixturesApproved until independently reviewed evidence covers the intended supported scope.

Cart observation format (illustrative only):
```json
{"kind":"cart","version":"1.6.15","save":"local-main-save","observationSource":"Manually observed the matching in-game vendor","flags":{"includeNightMarket":true,"desertFestivalUnlocked":false,"communityCenterComplete":false,"jojaComplete":false},"originalGuarantee":null,"observed":[{"absoluteDay":99,"venue":"Night Market","kind":"ordinary","label":"Example item","price":500,"quantity":1}]}
```
Use exact in-game displayed labels and quantities; the example above is not real data. Absolute day = (year - 1) × 112 + season index × 28 + day, with spring index 0. Record actual unlock flags; no route or festival unlock is inferred from a save. Report uncertain/missing results rather than treating them as validated.

CI also runs the actual command on a temporary synthetic main save, with pinned reference expectations for geodes and cart stock, and checks mismatches, path containment and private-output suppression. This tests the runner, not game accuracy.

## Machine-state observations
The local runner accepts a `machine` case with 1–100 independently observed machines. Use zero-based tile coordinates, stable editor item IDs, and for indoor entries the exterior building origin and item ID. A timer is optional: record exact game minutes only when independently known. Unknown state is not positive evidence. Duplicate locations, missing devices, ambiguous matches and different states fail; records are matched by position, not XML order. This is not a test of full inventory or current usable capacity.

Illustrative format only:
```json
{"kind":"machine","version":"1.6.15","save":"local-main-save","observationSource":"Independently observed matching saved machine states","observed":[{"scope":"outdoor","itemId":"machine-keg","x":3,"y":4,"state":"processing"},{"scope":"indoor","buildingItemId":"game-shed","buildingX":10,"buildingY":20,"itemId":"machine-jar","x":2,"y":3,"state":"ready"}]}
```
These are synthetic examples, not actual game evidence. No original save or personal data is committed.

## Story and order structural comparison
The existing pinned public 1.6.8 test save is now read by Python's independent standard-library XML parser as well as the project parser. The audit compares recognized note, event, achievement and completed-order ID sets and unsupported counts. Only aggregate evidence is printed; absent fields and empty sets do not certify positive completion. It does not verify event mapping, active orders or in-game displays. The local 1.6.15 fixture runner accepts explicit `progress.quests` and `progress.milestones` paths for actual game observations, for example positive observed `progress.quests.story.notes`, `progress.quests.active.0.objectives.0.current`, or `progress.milestones.friendshipPoints.0`. These are field paths, not independent observations or expected values. Do not set fixturesApproved until real matched-version gameplay evidence is available.
