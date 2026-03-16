# Normalization Flow

## Goal

Block 4 turns an intake package into a reliable business brief without hiding uncertainty.

The flow now separates:

- raw intake inputs
- structured manual confirmations
- support docs
- reconciled field states
- render-ready outputs

## Current Flow

```text
business-input/<slug>/intake.json
+ raw/maps/*
+ raw/docs/*
+ raw/notes/*
+ normalized/input-manifest.json
+ normalized/image-map.json
    ->
loadBusinessInputContext()
    ->
normalizeBusinessInput()
    ->
business-raw.json
business-brief.json
missing-data.json
content-plan.json
reconciliation-report.json
    ->
existing business adapter
    ->
Astro render + SEO + deploy
```

## Required Runtime Steps

1. Build or refresh the manifest:

```bash
npm run ingest:manifest -- <slug>
```

2. Generate normalized outputs:

```bash
npm run normalize:business -- <slug>
```

## What Each Source Contributes

- `intake.json`: slug, niche, category, maps link, tone and CTA direction.
- `raw/notes/manual-profile.json`: strongest manual source for facts and prepared content.
- `raw/maps/maps-link.txt`: verified location action.
- `raw/docs/menu-summary.md`: support structure for categories and featured offer cues.
- `raw/docs/reviews-selected.md`: support structure for rating and recurring trust themes.
- `raw/notes/intake-notes.md`: caveats, gaps, and truthfulness notes.
- `normalized/image-map.json`: approved runtime asset reference.
- `normalized/input-manifest.json`: package health, missing source types, and intake warnings.

## Output Meaning

- `business-raw.json`: reconciled factual record plus field state map and source register.
- `business-brief.json`: render-facing brief for the current Astro app.
- `missing-data.json`: actionable gaps, inferred fields, and pending items that matter.
- `content-plan.json`: CTA choice, section priorities, and messaging focus.
- `reconciliation-report.json`: full field-by-field resolution log with source priority and states.

## Current Limitation

The normalizer already works without HTML exports, but when `raw/html/` is empty it relies more heavily on:

- `manual-profile.json`
- support docs
- explicit missing markers

That is intentional. The system prefers visible uncertainty over fabricated certainty.
