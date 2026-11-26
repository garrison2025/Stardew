# V2.0 acceptance status — development only

The requested V2.0 specifies 16 full game tools, original UI, separate public/private origins, US SEO research, verified versioned game data and independent fixtures. This commit does **not** fulfill production acceptance. It implements a testable preview on all 16 URLs. No ads, public indexing, game art, copied game data, fake official rules, or invented precision.

| Area | Implemented | Blocking gap |
|---|---|---|
| Farm planner | Schematic grid, paint, erase, undo/redo, coverage, greedy suggestions, PNG/JSON export | Real maps, masks, footprint, rotation, region support, full persistence, touch drawing, worker |
| Crop calculator | User-entered prices, growth, regrowth, budget/plots DP | Verified game calendars, processing, cashflow, quality, profession |
| Tracker | Local XML structure inspector in workspace | Worker, versioned normalization, multiplayer, shared progress, real fixtures |
| Collections | Editable manual lists, search, filter, JSON, recipe aggregation | Verified complete catalogue, requirements, save synchronization |
| Fair / Grandpa | Manual points worksheet | Verified score rules and recommendation |
| Predictor | Explicit unsupported-state guard | RNG adapters and independent fixtures |
| Farm comparison | Manual tile area comparison | Real verified farm maps and integration |
| Skills / perfection | Manual weighted checklist | Verified XP and completion rules |
| SEO | 16 static routes, unique titles, H1, descriptions, primary keyword research | Full historical mapping, SERP verification, canonical origin, approved indexing, sitemap, locales |
| Privacy | Separate build mode, no ads/analytics, local storage opt-in, headers | Actual second origin deployment, stricter script CSP, browser network tests, full state model |
| CI | Node unit and static route audit workflows | Browser E2E, Lighthouse, lockfile, independent game fixtures |

No production deployment or domain has been created. Preview builds must retain noindex. The release gate is deliberately failing. Do not flip approval flags without evidence. Do not deploy private and public builds to the same origin. The original keyword research belongs in the owner's project records, not a publicly accessible frontend. Current SEO configuration uses the V2.0 page-level primary keywords and US volume/KD. 
