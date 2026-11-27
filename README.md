# Field & Farm — Stardew fan-tool development preview

Independent fan-tool platform based on the V2.0 plan. Astro, React, TypeScript; no backend, no paid API, no original game assets. **Not a production-ready game tool.** The 16 routes are noindex development previews, and no ads are loaded. Manual data and synthetic examples are labeled. See [release acceptance](docs/RELEASE.md).

## Run
Node 22.23.4 (see .nvmrc); npm ci; npm run dev. npm run check, npm test, npm run build. To build the workspace separately: npm run build:workspace. The public build outputs to dist and the workspace build to dist-workspace; deploy each to its own distinct origin, never the same origin. Set PUBLIC_WORKSPACE_ORIGIN to the real HTTPS private origin when available. Preview Cloudflare Pages build command: npm run build; output dist. For private workspace: npm run build:workspace; output dist-workspace. No indexing or commercial deployment until rights, real game data, independent fixtures and release acceptance pass.

The initial public preview does not accept save files. The workspace accepts local XML inspection only and optionally stores manually saved entries in IndexedDB. The source is not a license to use game data or assets.

## Verification and release evidence
`npm run audit:performance` records Chromium lab performance for the 16 public routes at desktop and throttled mobile profiles after `npm run build` and `npx playwright install chromium`. The CI screenshot artifact also includes the JSON report; it does not certify field CWV or physical devices. Run the **Live preview verification** workflow against the expected full Git commit and both deployed preview origins, or run `npm run audit:live -- https://PUBLIC_ORIGIN https://PRIVATE_ORIGIN --revision FULL_SHA`. Leave private origin blank only for explicitly public-only evidence. No automatic deployment or rollback occurs.
