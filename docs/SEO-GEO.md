# Stardew SEO and GEO release evidence

Engineering baseline: [Website Starter Standard at `9719565`](https://github.com/chenmu2024/Website-Starter-Standard/tree/9719565a7db0a1bf77b421dbc8c83514b929fb45). The two Python scanners in `tools/` are copied from this revision.

## Search architecture

- US English first. `src/config/pages.json` assigns one primary intent to each of 16 canonical paths. `src/config/keyword-coverage.json` retains the approved historical keyword research. Keep alternative queries on the existing destination.
- Each tool renders a unique title, description, H1, explanation, reproducible example, limitations and source links in initial HTML. Related tools and next tasks are crawlable anchors. The tool stays above the longer guide.
- `src/config/reference-manifest.json` tracks source rights and support scope. `src/config/tool-evidence.json` selects visitor-facing references and limits for each example. Review the guide, underlying logic and evidence when a supported mechanic, patch or source changes. Reference links do not establish a license or complete game parity.
- Production generates a self-canonical, social URL and linked WebSite, WebPage, WebApplication and applicable BreadcrumbList entities for each approved tool. Only the 16 approved public tools belong in the production sitemap. The preview and workspace block crawlers and carry noindex. Support, art-credit and error pages are outside the approved indexable tool set. There are no alternate-language routes currently.

## Proof assets

| Player task | Canonical page and evidence |
| --- | --- |
| Check planting coverage | Farm planner · `/` · 24 reachable tiles around a centered iridium sprinkler on an unobstructed practice patch |
| Estimate a crop’s return | Crop calculator · `/crop-calculator/` · one spring Parsnip with a 20g seed, 35g sale and 15g net |
| Check a Perfection category | Perfection checklist · `/perfection/` · half of Full Shipment earns 7.5 of its 15 percentage points |
| Verify how a counter behaves | Seed predictor · `/predictor/` · distinguish geode opening number and the Mystery Box counter |
| Use a supported local save | Progress tracker · `/tracker/` · positive cooking record, local merge and missing-field behavior |

The 16 pages provide a reproducible example at `#worked-example`. Use the references beside the examples. Avoid publishing personal save inputs as evidence.

## Distribution

After verifying the public custom domain, publish the production sitemap to Google Search Console and Bing Webmaster Tools. For relevant community resource lists, first confirm submission rules and whether the tool fills a specific gap. Useful prospects are curated Stardew resource lists and discussions about crop profit, layouts or collection tracking. Use the canonical tool URL with one reproduced example. The repository and the site provide direct links to the methodology. No community submission or placement is recorded.

## Search and AI measurement

Collect a first production-week baseline, then compare like-for-like samples at 30, 60 and 90 days. Use US English and separate branded searches from unbranded prompt runs. Start with “How do I lay out crops around an iridium sprinkler in Stardew Valley?”, “How much profit does a normal parsnip make after seed cost?”, “What percent does half of Full Shipment add to Perfection?” and “How can I track Stardew Valley collections from a save without uploading it?” These are prompts to test.

Record date, engine, market, exact prompt, brand mention, direct canonical citation, competitor citation and any incorrect statements. Report mentions and direct citations separately with sample sizes. Record Search Console and Bing clicks by landing page, separately from tagged or identifiable AI referrals. Crawler requests and brand mentions do not count as visits. Current status: external search index, AI citation, referral and community-placement measurements pending public production.

## Verification

The Preview verification workflow runs both original preview builds and an isolated production rehearsal at `example.org`. It attaches two preview SEO scans and production SEO and GEO reports. The production rehearsal uses local test flags in a disposable copy. The actual approval configuration stays authoritative for deployment.

Review live canonical and robots behavior, sitemap and deployment revision after choosing the domain. Review Cloudflare crawler/WAF controls and inspect public URLs through the search engines before reporting crawlability from their perspectives.
