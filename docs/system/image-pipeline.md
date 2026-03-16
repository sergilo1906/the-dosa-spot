# Image Pipeline

## Purpose

The image pipeline turns a raw image folder into a cleaner, web-ready asset set.

It is built to handle:

- mixed photo quality
- uneven naming
- too many similar food shots
- missing hero or exterior coverage
- the need to export predictable public assets

## Entry Point

Run:

```bash
npm run images:process -- the-dosa-spot
```

The script reads:

- `business-input/<slug>/raw/images/`
- `business-input/<slug>/normalized/business-brief.json`
- `business-input/<slug>/normalized/business-raw.json`
- existing `image-map.json` if present, to preserve stable ids when possible

## What It Produces

The pipeline writes:

- `business-input/<slug>/normalized/image-map.json`
- exported runtime images under `public/businesses/<slug>/images/`

It also updates the `assets` block inside `business-raw.json` so the source of truth points at the generated runtime folder.

## How It Works

1. Read raw files and normalize ids
2. Extract dimensions and lightweight visual metrics
3. Classify images using filename signals plus featured-item overlap
4. Score them for utility, hero potential, and basic visual quality
5. Reduce redundancy with exact and near-duplicate checks
6. Select hero, dishes, gallery, ambience, exterior, and fallback
7. Export the selected set to stable public paths
8. Write a richer `image-map.json` with selection and score metadata

## Current Output Example

For The Dosa Spot, the current pipeline output is:

- hero main: `hero-main`
- hero alternates: `dish-vegetable-noodles`, `dish-chole-bhature`
- dishes: `dish-dosa`, `dish-chole-bhature`, `dish-gulab-jamun`, `dish-vegetable-noodles`
- gallery: `gallery-spicy-noodles`, `gallery-curry-naan`, `gallery-starter-bowl`
- fallback: `fallback-noodle-bowl`
