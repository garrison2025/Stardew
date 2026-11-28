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

## Open release checks

| Item | Evidence to record |
| --- | --- |
| Real 1.6.15 save | A main save with the XML version confirmed, positive museum and Community Center observations, and an independently observed in-game Perfection reading. A public support thread supplied a candidate attachment, but browser download was unavailable. Use the local fixture comparator to cross-check supported observations. |
| Physical mobile devices | One iPhone Safari and one Android Chrome session. On each, place an object, pan/pinch, undo, open a shared layout, and import a test save in the workspace. Record actual device, browser and deployed revision. |
| Production search and domains | Confirm the initial source/data scope, localized US results, main and workspace origins, indexable routes, and observable canonical/sitemap/redirect behavior. |
| Operational recovery | Record matching last-known-good deployments and the result of any paired Cloudflare rollback or restore rehearsal. Keep preview and workspace noindex and ads disabled until the applicable release approvals. |

## Production cutover

Use `npm run build:production` and deploy `dist-production` on the public Pages project after choosing the domain and recording the existing release approvals. Build the workspace with `npm run build:workspace`, output `dist-workspace`, and bind it to the separate `app` subdomain. Configure the public build with both HTTPS origins. Before redirecting the old workspace origin, export local project and progress backups and verify restore on the new origin. IndexedDB is origin-specific.

Verify the exact commit on both hosts. On the public host check all 16 status codes, matching canonical and sitemap URLs, crawlability, no noindex header, and the 404 response. On the workspace confirm noindex and local save import. On separate iPhone Safari and Android Chrome devices, verify placement, pan, undo, opening and canceling a shared link, and a local save import. Record the commit and the device/browser for each run. Run the local fixture audit with the claimed 1.6.15 observations before expanding support. A pinned 1.6.8 structural sample does not establish the 1.6.15 game results or a perfection score.

Once both custom hosts pass, set up a path-preserving 301 from the old public Pages host, verify a deep tool route and a shared-layout link, then submit the custom-domain sitemap in Search Console. Keep workspace backups available through the migration.
