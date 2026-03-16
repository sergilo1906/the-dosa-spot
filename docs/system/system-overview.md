# System Overview

## What This System Is

This repo is a static Astro system for turning one local business package into a publishable landing page with:

- normalized business data
- sector-aware decisions
- visual family selection
- copy rules
- image processing
- render assembly
- QA reporting
- preview/live release flows

It is not a CMS, backend, or visual editor.

## What Problem It Solves

The system reduces the amount of business-specific improvisation needed to build and publish a local-business web page.

Instead of hand-editing everything inside components, it now pushes most business decisions through:

1. business input
2. normalization
3. rules engines
4. assembly
5. QA
6. release

## Module Map

### 1. Intake

`business-input/<slug>/raw/`

This is where real-world business material enters:

- maps links
- notes
- docs
- HTML exports
- images

See [Input Structure](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/input-structure.md).

### 2. Master Record

`business-input/<slug>/normalized/`

This becomes the stable business package:

- `business-raw.json`
- `business-brief.json`
- `missing-data.json`
- `content-plan.json`
- `image-map.json`

See [Data Model](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/data-model.md).

### 3. Runtime registry

`src/data/business-records/`

This is the current runtime source of truth for registered businesses:

- imports the normalized JSON outputs
- validates the master record
- derives the runtime `BusinessBrief`
- exposes aligned sector, visual, copy, and assembly outputs

See [Module Contracts](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/module-contracts.md).

### 4. Decision Engines

These add reusable logic instead of business-by-business guessing:

- sector engine
- visual engine
- copy engine
- image pipeline

### 5. Assembly

The assembly engine converts business data and engine outputs into render-ready decisions:

- section visibility
- CTA map
- image slots
- degradations

See [Assembly Engine](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/assembly-engine.md).

### 6. Render

Astro pages and section components render the landing using the current assembly output.

### 7. QA

The QA engine checks:

- routes
- assets
- CTA truthfulness
- thin sections
- visible SEO basics
- visible accessibility basics
- some product-level regressions

See [QA Engine](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/qa-engine.md).

### 8. Release

The release layer runs preparation, validation, preview, and live deploys with safer defaults.

See [Release Flow](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/release-flow.md).

## End-To-End Flow

```text
business-input/<slug>/raw
-> input manifest
-> normalization + reconciliation
-> master record JSON files
-> business-record registry
-> sector / visual / copy / image decisions
-> assembly profile
-> Astro render
-> QA report
-> preview deploy
-> live deploy
```

## Delicate Parts

These parts should not be changed casually:

- `src/lib/business/master-record.ts`
- `src/lib/normalization/*`
- `src/lib/sector/*`
- `src/lib/visual/*`
- `src/lib/copy/*`
- `src/lib/images/*`
- `src/lib/assembly/*`
- `src/lib/qa/*`
- `src/lib/seo/*`

They form the contract between data, decisions, render, QA, and release.

## Best Next Reads

- Need the real lifecycle: [Current Flow](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/current-flow.md)
- Need to add a business: [New Business Guide](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/operations/new-business-guide.md)
- Need the real reference case: [The Dosa Spot](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/businesses/the-dosa-spot.md)
