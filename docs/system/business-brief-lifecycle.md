# Business Brief Lifecycle

## Lifecycle Summary

The business brief is no longer treated as a hand-edited singleton.

It now sits inside a lifecycle:

```text
intake package
-> manifest
-> structured manual profile
-> reconciliation
-> business-raw
-> business-brief
-> sector-profile
-> visual-profile
-> copy-profile
-> Astro business adapter
-> render
```

## Stage Meaning

### 1. Intake

Files live in:

- [business-input](/C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input)

This is allowed to be imperfect.

### 2. Manifest

The manifest answers:

- what files exist
- what type they appear to be
- what is missing
- whether the package is usable enough to continue

### 3. Manual Profile

`manual-profile.json` is the structured checkpoint between messy intake and reusable data.

It is where we explicitly store:

- confirmed facts
- prepared content
- explicit missing markers
- inferred or pending field states

### 4. Reconciliation

The reconciler merges:

- manual structured data
- seed data
- support docs
- notes
- maps link
- image map

Then it creates:

- `business-raw.json`
- `business-brief.json`
- `missing-data.json`
- `content-plan.json`
- `reconciliation-report.json`

### 5. Sector

Before render, the system can run sector analysis to produce:

- `sector-profile.json`

This file does not replace the brief. It adds:

- sector classification
- CTA hierarchy hints
- structure hints
- fallback rules

### 6. Visual

After sector analysis, the system can run visual analysis to produce:

- `visual-profile.json`

This file adds:

- visual family selection
- palette and typography direction
- hero and card recommendations
- visual fallback rules

### 7. Copy

After visual analysis, the system can run copy analysis to produce:

- `copy-profile.json`

This file adds:

- tone selection
- block-level copy rules
- allowed and forbidden claims
- degradation guidance
- validation checks for current copy samples

### 8. Render

The Astro app now reads the business through the runtime registry layers:

- [business-records index](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/data/business-records/index.ts)
- [businesses index](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/data/businesses/index.ts)

That means the data system keeps improving reliability without forcing a UI refactor yet.

## What Is Stable Now

- the app still renders from normalized JSON
- the master-record validation still guards CTA/image consistency
- deploy remains static and unchanged

## What This Prepares For Next

This lifecycle now makes the next blocks safer because:

- copy generation can read a trustworthy `content-plan`
- sector logic can build on a cleaner `business-raw`
- CTA and section decisions no longer need to start from zero every time
- visual family and tokens can now come from a reusable profile instead of one-off aesthetic calls
- copy rules, block constraints, and honesty checks can now come from a reusable profile instead of ad hoc prompts
- image workflow can use clearer field states and asset intent
- future businesses can follow the same package shape
