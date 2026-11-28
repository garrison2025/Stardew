# Local fixed-building collision diagnostic

Sources: Stardew Wiki Modding:Buildings https://stardewvalleywiki.com/Modding:Buildings ; pinned 1.6.8 reference BuildingData.IsTilePassable and Building.isTileOccupiedForPlacement in https://github.com/Dannode36/StardewValleyDecompiled/tree/5225ef409e42a6159a82cf81200bf6eb315c9961 ; Starplan generated rules in https://github.com/StephenFluin/starplan/tree/7ee52554a2e48f47a9d99e256830d7b1b2e5954f . Independent inspection code, not copied.

Read the owner's unpacked Data/Buildings.json locally, only Farmhouse and Greenhouse exact IDs. Preserve explicit X/O, default solid, missing cells, radius, extra construction areas, human door and flooring independently. Diagnostic only: does not reproduce full game placement state, subclasses, dynamic construction or terrain conditions; a passable tile is not a general object placement authorization. No raw game data bundled, no personal data sent, no reference pack rule changes. Synthetic test vectors are not game captures.

In private workspace, inspect save, preview import, expand Inspect building collision from local game data and select the matching game file. Existing 697/698 fixture gate remains. Exact original collision matrix still not obtained.

The import preview now lists actual rectangular footprint intersections with earlier accepted records, even before local geometry is selected. Multi-tile candidates are checked across their entire footprint; rejected or later records are not reported as blockers. Raw fixed-building geometry observations are restricted to those intersections and matching saved dimensions. These are editor-model intersections, not verified game placement permission. Synthetic 9×5 test geometry is deliberately not a game capture.
