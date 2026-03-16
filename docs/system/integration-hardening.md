# Integration Hardening

## Goal

This note records the hardening pass that aligned the system after blocks 1-12.

## What Was Tightened

### Runtime source of truth

- The runtime business now comes from `src/data/business-records/` instead of a parallel hand-maintained `theDosaSpot.ts` runtime file.
- `src/data/businesses/index.ts` now delegates to the business-record registry.
- This reduces drift between:
  - normalized JSON outputs
  - runtime `BusinessBrief`
  - sector, visual, copy, and assembly profiles

### Shared business-niche vocabulary

- `BusinessNiche` now covers the broader set of local-business categories that later engines already knew about.
- Parsing and master-record validation now read from the same supported niche list.
- JSON-LD schema mapping now handles those niches more explicitly.

### Site identity and release alignment

- `astro.config.mjs` and `src/lib/seo/site.ts` now resolve `siteUrl` through the same env-first logic.
- Release commands can accept `--site-url` and also derive a reasonable default from the Firebase project id.
- That keeps canonical, sitemap, QA, and deploy intent better aligned.

### Low-risk UI coupling cleanup

- A few section labels and fallback strings were made less restaurant-hardcoded where the old wording created unnecessary coupling.
- This was intentionally kept small to avoid reopening UI work.

### Residue cleanup

- Prompting docs were updated to local-business language instead of barber-only wording.
- Legacy presentation docs were marked as archive material.
- Current The Dosa Spot asset notes were aligned with the real runtime asset folder.

## What This Did Not Try To Do

- It did not redesign the web.
- It did not rebuild the engines.
- It did not turn the system into a fully generalized multi-business platform overnight.
- It did not remove all sample-era files from the repo.

## Why These Changes Matter

They mainly reduce four kinds of fragility:

1. runtime drift between normalized data and rendered business data
2. silent invalid slug lookups
3. canonical/deploy mismatch during release work
4. docs that tell an older story than the code
