# Current Flow

## End-To-End Flow

```text
business-input/<slug>/raw
-> input-manifest.json
-> business-raw.json
-> business-brief.json + missing-data.json + content-plan.json
-> image-map.json
-> sector-profile.json
-> visual-profile.json
-> copy-profile.json
-> assembly-profile.json
-> src/data/business-records/<slug>/
-> runtime BusinessBrief
-> preset lookup
-> Astro routes
-> dist/
-> qa-report.json / qa-report.md
-> preview or live deploy
```

## 1. A business enters through `business-input/`

Real-world material starts in:

- `business-input/<slug>/intake.json`
- `business-input/<slug>/raw/maps/`
- `business-input/<slug>/raw/html/`
- `business-input/<slug>/raw/docs/`
- `business-input/<slug>/raw/images/`
- `business-input/<slug>/raw/notes/`

This is the operator-facing intake package.

## 2. Ingestion inventories what is actually there

`npm run ingest:manifest -- <slug>` scans the package and writes:

- `business-input/<slug>/normalized/input-manifest.json`

This records:

- found files
- classified source types
- missing inputs
- naming issues
- validation warnings and errors

## 3. Normalization reconciles facts into stable business files

`npm run normalize:business -- <slug>` reads the intake package and produces:

- `business-raw.json`
- `business-brief.json`
- `missing-data.json`
- `content-plan.json`

This is where the system:

- merges sources by priority
- marks verified / inferred / missing / conflict / pending
- keeps missing data visible
- creates a render-safe business brief

## 4. Decision engines add reusable rules

After normalization, the next outputs are:

- `image-map.json`
- `sector-profile.json`
- `visual-profile.json`
- `copy-profile.json`

These files answer different questions:

- which images are usable and how strong they are
- which sector rules fit the business
- which visual family fits the business
- which copy rules, restrictions, and fallbacks apply

## 5. Assembly turns decisions into render-ready output

`npm run assembly:analyze -- <slug>` produces:

- `assembly-profile.json`

This is the render contract for the landing:

- section visibility
- CTA map
- image slots
- support copy
- degradations

## 6. Runtime uses `src/data/business-records/` as the aligned registry

`src/data/business-records/<slug>/index.ts` imports the normalized files and builds:

- validated `BusinessMasterRecord`
- runtime `BusinessBrief`
- sector, visual, copy, and assembly profiles

`src/data/businesses/index.ts` now delegates to that registry instead of maintaining a separate hand-built runtime source of truth.

## 7. Presets choose presentation variants, not business truth

`src/data/preset-definitions.ts` and `src/data/presets.ts` select:

- the business slug
- hero variant
- services variant
- gallery variant
- CTA variant

For The Dosa Spot, the current presets are:

- `dosa-signature`
- `dosa-poster`
- `dosa-monolith`

## 8. Routes render from the assembled business system

`src/pages/index.astro`

- loads the default preset
- gets the runtime business and assembly profile
- builds metadata and JSON-LD
- renders the landing

`src/pages/demo/[preset].astro`

- renders non-default presets
- keeps them `noindex`

`src/pages/404.astro`

- keeps brand continuity for missing pages

## 9. SEO uses the same resolved site configuration

`astro.config.mjs` and `src/lib/seo/site.ts` resolve the site URL from:

1. `PUBLIC_SITE_URL`
2. `SITE_URL`
3. fallback default

That same value is used for:

- canonical URLs
- OG image URLs
- JSON-LD site references
- sitemap base URL
- release-time build alignment when `--site-url` is provided

## 10. Images now have a clear runtime path

Runtime assets live under:

- `public/businesses/<slug>/images/`

Selection and roles live under:

- `business-input/<slug>/normalized/image-map.json`

The current sample-era SVG assets in `src/assets/demo/barbers/` are still archive/reference material, not part of the active The Dosa Spot runtime.

## 11. QA runs against built output, not assumptions

`npm run qa:product -- <slug>` reads:

- normalized business files
- assembly profile
- copy profile
- built HTML in `dist/`

It writes:

- `business-input/<slug>/normalized/qa-report.json`
- `business-input/<slug>/normalized/qa-report.md`

## 12. Release wraps the whole flow

The current operator sequence is:

```bash
npm run release:prepare -- <slug>
npm run release:validate -- <slug>
npm run deploy:preview -- <slug> <firebase-project-id>
npm run deploy:live -- <slug> <firebase-project-id> confirm-live
```

Release can also receive `--site-url <url>` so build, QA, and deploy intent stay aligned.

## Main flow risks

The most delicate handoff points today are:

- changing `BusinessBrief` or master-record parsing contracts
- changing normalized JSON file names or locations
- changing section anchors used by CTA and footer maps
- changing image filenames under `public/businesses/<slug>/images/` without regenerating `image-map.json`
- building for a real domain without setting `SITE_URL` or `--site-url`
