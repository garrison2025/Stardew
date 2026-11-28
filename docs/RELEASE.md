# V2.0 release acceptance — development preview (2026-11-28)

The functional scope is the existing 16 tools. Use established competitor workflows as the practical reference. The farm planner uses schematic terrain and documented rule flags. Record unresolved results for the specific map, save field, or game version that was tested.

## Verified baseline

- The [public preview](https://stardew-67b.pages.dev/) and [local workspace](https://stardew-local-workspace.pages.dev/tracker/) served [`4568534`](https://github.com/garrison2025/Stardew/commit/45685347d53bdff2e75486266b151a08d9013a18) after [PR #95](https://github.com/garrison2025/Stardew/pull/95). Both emitted `noindex,nofollow`. The Standard Farm default and public share-link round trip were verified on the deployed build. Save file controls were present on the separate workspace.
- [Candidate CI](https://github.com/garrison2025/Stardew/actions/runs/46121470510) at `98ef8c4` passed 324 tests, both builds, Chromium/Firefox/WebKit at five viewport widths, browser smoke tests, and asset, reference and dependency audits. Mobile lab LCP ranged from 760 to 1160 ms across 16 pages, with CLS 0. These are lab results for that candidate.
- The [pinned real-save audit](https://github.com/garrison2025/Stardew/actions/runs/46121467227) passed for the public 1.6.8 fixture. Three items count toward Full Shipment and three known fish appear outside that checklist. The sample contains zero museum donations and no positive Community Center donation flags. Earlier coordinate evidence plotted 698 farm records, of which 697 became editable placements.
- [Keyword coverage](../src/config/keyword-coverage.json) reviews 182 historical US candidates. The current counts are 174 covered by reference functionality, three partial, two mixed-intent and three excluded. These are functional classifications.

## Search intent spot check

Public English search results reviewed on 2026-11-28. These representative results support page intent. The US-localized result set, current US demand and ranking positions still need their own evidence.

| Exact query | Site route | Intent and representative result |
| --- | --- | --- |
| stardew valley planner | `/` | Interactive farm layout planning, [Stardew Planner V3](https://stardew.info/) |
| stardew crop calculator | `/crop-calculator/` | Crop profit and planting scenarios, [Stardew Profit](https://www.stardewprofit.com/calculator) |
| stardew valley perfection checklist | `/perfection/` | Checklist and requirements, [official community wiki](https://stardewvalleywiki.com/Perfection) |
| stardew valley seed predictor | `/predictor/` | Inputs and event prediction, [Stardew Predictor](https://oshawk.github.io/stardew-predictor/) |
| stardew valley tracker | `/tracker/` | Overall progression and collections, [stardew.app](https://stardew.app/) |
| stardew bundles | `/bundles/` | Requirements plus tracking, [stardew.app bundles](https://stardew.app/bundles) |
| stardew valley museum | `/museum/` | Donation requirements and tracker, [wiki](https://stardewvalleywiki.com/Museum) and [stardew.app museum](https://stardew.app/museum) |

## Real 1.6.15 save comparison

The [original public Forest Farm archive](https://forums.stardewvalley.net/threads/fall-y1-forest-farm-save.49145/) contains a 1.6.15 main file and backup. The main file's 71 museum donations matched the XML and Stardew Checkup. Field & Farm counted 59 shipping targets, and Checkup counted 60, including Clam. Direct analysis of the bundle arrays counted 23 completed Community Center bundles in the main file and 22 in the backup. These represent three and two completed rooms respectively. The abandoned store's Missing Bundle is tracked separately.

Fully set padded flags indicate a completed bundle but do not identify the gifts selected from optional slots. The tracker stores that signal separately and leaves individual donations unknown. The save-backed dashboard uses the number of recognized definitions from the six Community Center rooms. Browser testing on `75be348` also merged the main file into a separate local farm profile and verified that Collection overview retained 23/30 Community Center bundles, 71/95 museum donations and 59/154 shipping targets.

### Perfection calculation comparison

| Contribution | Field & Farm | Stardew Checkup |
| --- | ---: | ---: |
| Produce and forage shipped | 59/154 · 5.75 points | 60/155 · 5.81 points |
| Great Friends | 3/34 · 0.97 points | 3/31 · 1.06 points |
| Farmer level | 22/25 · 4.40 points | 22/25 · 4.40 points |
| Crafting | 21/149 · 1.41 points | 1.41 points |
| Fishing | 52/72 · 7.22 points | 7.22 points |
| Total base estimate | 19.75% | 19.9% |

The other contributing categories were zero in both tools. Both calculations round down to 19%. Checkup includes Clam in this shipping checklist and counts only recognized friendship rows present in this file. Field & Farm uses the [1.6 reference targets](https://stardewvalleywiki.com/Perfection) of 154 shipping items and 34 villagers. The two denominator differences account for about 0.15 percentage points. The sample has zero golden walnuts. [Qi's Walnut Room](https://stardewvalleywiki.com/Qi%27s_Walnut_Room) requires 100, so this sample cannot provide an in-game reading. A qualifying sample and a matching in-game screenshot remain open. Only aggregate observations are recorded here.

## Mobile and production rehearsal

[PR #97](https://github.com/garrison2025/Stardew/pull/97) and its [passing CI run](https://github.com/garrison2025/Stardew/actions/runs/46129559458) verified all 326 tests and the three-engine, five-width suite. iPhone 13 WebKit and Pixel 7 Chromium device profiles both passed touch placement, undo, zoom control, opening a shared layout, and local file import. Android Chromium also passed emulated pinch and drag. Physical iPhone and Android devices remain untested.

The normal production build rejected the current preview config. The same build then passed in an isolated copy on reserved `example.org` origins with test approval values. It validated all 16 pages, HTML canonical URLs, JSON-LD, the sitemap, robots and workspace link separation. No rehearsal files were deployed. The live preview and workspace continue to use their existing noindex configuration.

The additional [public co-op sample](https://forums.stardewvalley.net/threads/stardew-valley-1-6-co-op-game-crash-issue.37528/) has a 1.6.15 main save and backup from year 2. Both show zero golden walnuts, so they cannot supply a game-screen Perfection reading.

## Workspace and link migration rehearsal

[PR #98](https://github.com/garrison2025/Stardew/pull/98) and its [passing CI run](https://github.com/garrison2025/Stardew/actions/runs/46131961008) exercised two migrations in Chromium. The workspace downloaded a backup JSON from one test origin, restored it into a dedicated farm profile on a second origin, and exported it again. The active layout, project book and cooking record matched after accounting for the new project revision. The source and target's default farm retained their original data.

A test HTTP 301 preserved an old crop calculator path and its percent-encoded query. The browser also retained the fragment in an old shared layout URL and opened the layout at the destination. Production-domain checks and a paired Cloudflare rollback remain open.

## Open release checks

| Item | Evidence to record |
| --- | --- |
| Real 1.6.15 save | Museum, shipping and Community Center progress were checked on public 1.6.15 saves. The browser cross-check matched at 19% after rounding down. A separate 1.6.15 save with Qi’s Walnut Room unlocked and a matching game reading is needed for direct game parity. |
| Physical mobile devices | One iPhone Safari and one Android Chrome session. On each, place an object, pan/pinch, undo, open a shared layout, and import a test save in the workspace. Record actual device, browser and deployed revision. |
| Production search and domains | Confirm the initial source/data scope, localized US results, main and workspace origins, indexable routes, and observable canonical/sitemap/redirect behavior. |
| Operational recovery | Record matching last-known-good deployments and the result of any paired Cloudflare rollback or restore rehearsal. Keep preview and workspace noindex and ads disabled until the applicable release approvals. |

## Production cutover

Use `npm run build:production` and deploy `dist-production` on the public Pages project after choosing the domain and recording the existing release approvals. Build the workspace with `npm run build:workspace`, output `dist-workspace`, and bind it to the separate `app` subdomain. Configure the public build with both HTTPS origins. Before redirecting the old workspace origin, export local project and progress backups and verify restore on the new origin. IndexedDB is origin-specific.

Verify the exact commit on both hosts. On the public host check all 16 status codes, matching canonical and sitemap URLs, crawlability, no noindex header, and the 404 response. On the workspace confirm noindex and local save import. On separate iPhone Safari and Android Chrome devices, verify placement, pan, undo, opening and canceling a shared link, and a local save import. Record the commit and the device/browser for each run. Run the local fixture audit with the claimed 1.6.15 observations before expanding support. A pinned 1.6.8 structural sample does not establish the 1.6.15 game results or a perfection score.

Once both custom hosts pass, configure the old public Pages host using [Cloudflare Bulk Redirects](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/). Match the old production hostname and enable subpath matching, preserve path suffix, and preserve query string. Use a 301 target without a replacement fragment so the browser can retain an existing layout fragment. Test a deep tool URL with its query, a shared layout URL with its fragment, and the unchanged separation of the workspace. Submit the custom-domain sitemap in Search Console once available. Keep workspace backups available through the migration.
