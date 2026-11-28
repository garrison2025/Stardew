# Local TMX base restriction extraction

Independent offline Python 3 standard-library compiler, informed by the game map property documentation and the Starplan reference pipeline. Input: your own unpacked Content/Maps TMX files (using StardewXnbHack), not a downloaded art bundle. No rendering, game images or network.

Windows example, from repository root:

    python scripts/extract-local-farm-masks.py "C:\Games\Stardew Valley\Content (unpacked)" "C:\Temp\stardew-masks" 1.6.15

It validates all eight known map filenames and exact dimensions before writing the eight compact restriction files and a provenance manifest. Import one matching TXT via the private Map Studio compact reference importer (PR #57). If the game files use unsupported external TSX, compressed data or nonstandard layers, extraction fails explicitly. No claim of exact runtime rules, dynamic occupancy, version verification or commercial rights.

Reference: https://stardewvalleywiki.com/Modding:Maps ; https://github.com/StephenFluin/starplan/blob/7ee52554a2e48f47a9d99e256830d7b1b2e5954f/scripts/import-farms.mts ; https://github.com/Pathoschild/StardewXnbHack . Synthetic tests cover all eight dimensions, property overrides and malformed files. Original 1.6.15 files are not present in this project. Compare generated masks to the pinned competitor audit, then validate in game.
