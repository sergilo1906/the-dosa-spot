# Sector Engine

## Goal

Block 5 adds an explicit sector layer so the app stops treating every local business as if the same CTA, section order, trust cues, and tone always apply.

This layer does not rewrite the current UI. It produces a sector recommendation file that later blocks can consume safely.

## Runtime Flow

```text
business-brief.json
+ missing-data.json
+ content-plan.json
+ image-map.json
    ->
analyzeBusinessSector()
    ->
sector-profile.json
```

## Command

```bash
npm run sector:analyze -- <slug>
```

For the current business this writes:

- `business-input/the-dosa-spot/normalized/sector-profile.json`

## What The Engine Decides

The engine produces:

- sector type
- sector confidence
- candidate scores for each supported sector
- recommended primary and secondary CTAs
- recommended hero type
- recommended section structure
- recommended trust system
- recommended gallery system
- recommended tone
- degradation rules triggered by missing data
- schema and local SEO hints

## Why It Sits Outside The Render

The current Astro app still renders from the normalized brief and content plan.

That is intentional.

The sector engine is a decision layer, not a visual rewrite. This keeps the current website stable while giving future blocks a reusable system for:

- CTA choice
- section selection
- tone strategy
- SEO heuristics
- graceful fallback behavior

## Inputs Used

The engine looks at:

- `identity.niche`
- primary and secondary categories
- service modes
- featured offer and service text
- available contact routes
- missing data paths
- approved image roles and subjects
- trust signals like reviews and proof points

## Current Example

For The Dosa Spot, the engine resolves:

- sector: `restaurant`
- confidence: `high`
- primary CTA: `Get Directions`
- secondary CTAs: `View Menu`, `Call`

It also records why order-led messaging should degrade right now:

- no verified `orderUrl`
- no verified external `menuUrl`
- no verified opening hours
- no exterior image
