# Module Contracts

## Why This File Exists

Use this file when you need to know which module writes which artifact, and which module is allowed to consume it.

## Core Data Contracts

### `intake.json`

- Written by: operator
- Read by: ingestion manifest
- Role: seed for slug, business name, niche, Maps link, and early manual preferences

### `input-manifest.json`

- Written by: `ingest:manifest`
- Read by: normalization
- Role: inventory of raw files, intake gaps, naming issues, and package health

### `business-raw.json`

- Written by: normalization
- Read by: master-record loader
- Role: reconciled fact layer with sources and field states

### `business-brief.json`

- Written by: normalization
- Read by: master-record loader, runtime business derivation
- Role: render-safe business truth

### `missing-data.json`

- Written by: normalization
- Read by: QA, docs, operator review
- Role: explicit gaps, conflicts, and pending confirmations

### `content-plan.json`

- Written by: normalization
- Read by: sector, copy, and assembly
- Role: CTA intent, section priorities, and content focus

### `image-map.json`

- Written by: image pipeline
- Read by: master record, visual engine, assembly, and QA
- Role: approved assets, roles, quality, and runtime public paths

## Decision Engine Contracts

### `sector-profile.json`

- Written by: sector engine
- Read by: visual engine, copy engine, assembly
- Role: sector choice, CTA priority, trust/gallery systems, and degradation rules

### `visual-profile.json`

- Written by: visual engine
- Read by: assembly, docs, operator review
- Role: visual family, tokens, gallery/trust/hero direction, and visual fallbacks

### `copy-profile.json`

- Written by: copy engine
- Read by: assembly, QA, editorial review
- Role: tone, block rules, forbidden claims, CTA labels, and copy QA hints

### `assembly-profile.json`

- Written by: assembly engine
- Read by: Astro sections and QA
- Role: section visibility, CTA map, image slots, render-ready support copy, and degradations

### `qa-report.json`

- Written by: QA engine
- Read by: release workflow and operator review
- Role: pass/warning/error/polish report over built HTML and resolved system outputs

## Runtime Contract

The current runtime source of truth is:

- `src/data/business-records/<slug>/index.ts`

That layer imports the normalized JSON files, validates the master record, derives the runtime `BusinessBrief`, and exposes aligned profiles for sector, visual, copy, and assembly.

`src/data/businesses/index.ts` is now a thin compatibility layer over that runtime registry instead of a separate manually maintained business map.

## Critical Hand-Offs

These boundaries matter most:

1. `input-manifest.json` must exist before normalization.
2. `business-brief.json` and `image-map.json` must agree on asset ids.
3. `sector-profile`, `visual-profile`, and `copy-profile` must all point to the same `businessSlug`.
4. `assembly-profile.json` is the only layer that should decide visible sections and final CTA placement.
5. QA should validate the built HTML plus `assembly-profile`, not raw business data directly.
6. Release should gate deploys using QA and build output, not assumptions.

## What Not To Mix

- Do not treat `business-raw.json` as render-ready.
- Do not let UI components invent CTA fallbacks on their own.
- Do not skip `assembly-profile.json` and read decision-engine outputs directly inside sections unless the assembly layer is intentionally extended.
- Do not change asset filenames in `public/businesses/<slug>/images/` without regenerating `image-map.json`.
