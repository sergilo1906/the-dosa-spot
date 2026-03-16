# QA Engine

## Purpose

The product QA layer adds a reusable, pre-release check pass on top of the existing system outputs:

- `business-brief.json`
- `missing-data.json`
- `copy-profile.json`
- `assembly-profile.json`
- `image-map.json`
- built HTML in `dist/`

It is designed to catch real product regressions before preview or deploy, not just technical build failures.

## Entry Point

Run:

```bash
npm run qa:product -- <business-slug>
```

Current example:

```bash
npm run qa:product -- the-dosa-spot
```

## Outputs

For each business, the script writes:

- `business-input/<slug>/normalized/qa-report.json`
- `business-input/<slug>/normalized/qa-report.md`

## Data Sources

The QA engine reads:

- normalized business files from `business-input/<slug>/normalized/`
- route policy and render decisions from `assembly-profile.json`
- copy restrictions and validation hints from `copy-profile.json`
- runtime asset decisions from `image-map.json`
- built pages from `dist/`

## Scope

The engine currently checks:

- structure and required files
- built routes
- selected asset existence
- CTA validity
- section visibility sanity
- copy restrictions and repetition hints
- visible SEO basics
- visible accessibility basics
- product-level warnings and manual review cues

## Design Principle

The QA layer prefers:

- `error` when something is clearly broken
- `warning` when something is risky or incomplete
- `polish` when something is not broken but still lowers perceived finish

If a check cannot be proven with confidence automatically, it should become manual review instead of a false hard error.
