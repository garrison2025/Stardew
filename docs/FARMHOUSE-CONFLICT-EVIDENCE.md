# Last observed farm placement conflict

2026-11-28: the pinned public 1.6.8 save (colecrouter/stardew-save-editor, commit 6e97efd6c20c75b8664972c1bac7c2f9949e9102, blob 8a8e954129da768485b2bcb330442578a855d4d7) was independently inspected at the XML level. Its Farm location contains four buildings. The only exterior chest is within the rectangular 9x5 Farmhouse footprint, at building-relative (1,3), zero-based. No absolute coordinates or player identifiers are retained here. The existing import result is 697/698. Added a conditional regression assertion pinning the exact conflict if it still occurs; 698/698 remains permitted if a future genuinely verified placement fix resolves it.

An observed save proves that the record exists, not that the current vanilla construction/placement rules allow it in all versions. For 1.6.15, compare the local raw Data/Buildings.json Farmhouse CollisionMap at row index 3, column index 1, and also inspect placement rules and map terrain. Do not infer the complete matrix from this one record. See https://stardewvalleywiki.com/Modding:Buildings for the difference between collision and extra construction clearance.

No original game or save files bundled. No commercial approval or reference-version claims changed.

## Independent observed coordinate view
R30 candidate adds a separate read-only schematic coordinate plot before import. It includes known and unsupported records with in-frame valid coordinates and explicitly labels records rejected by the placement engine. Observed-only markers never become placed objects or affect occupancy, save edits, budgets, pathfinding or export of the editable scene. The private coordinate report can be exported separately. The pinned external save audit now asserts all 698 records are plotted, with 697 editable and one observed-only if the documented conflict remains. This is a regression assertion until CI passes, not a claim of exact collision data or successful editable placement.
