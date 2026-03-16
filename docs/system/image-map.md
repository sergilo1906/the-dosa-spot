# Image Map

## Role

`image-map.json` is now both:

- the app-facing image registry
- and the pipeline output summary for image decisions

The Astro app still relies on the app-facing fields such as:

- `id`
- `publicPath`
- `kind`
- `ratio`
- `roles`
- `quality`
- `reviewStatus`
- `suggestedAlt`

The pipeline now adds extra metadata inside each asset under `pipeline`, plus top-level `summary` and `selection`.

## Top-Level Fields

- `summary`: counts of selected, reserved, discarded, duplicates, weak assets, and hero candidates
- `selection`: chosen hero, alternates, dishes, gallery, ambience, exterior, and fallback ids
- `assets`: all mapped assets, with selection and score metadata

## Per-Asset Pipeline Metadata

Each asset now includes:

- `sourceRelativePath`
- `exportFilename`
- `exportStatus`
- `selectionRole`
- `selectionRank`
- `duplicateOf`
- `duplicateKind`
- `metrics`
- `score`
- `classification`

## Why This Matters

This keeps the public web simple while preserving the reasoning needed for later blocks.

The render can stay lightweight, but later orchestration layers can still inspect:

- why an image was chosen
- why one was only a backup
- why an image was not considered hero-safe
- whether the current gallery lacks exterior or ambience coverage
