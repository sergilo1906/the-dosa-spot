# Data Lifecycle

## Current Lifecycle

```text
business-input/<slug>/intake.json
-> business-input/<slug>/raw/*
-> input-manifest.json
-> business-raw.json
-> business-brief.json
-> missing-data.json
-> content-plan.json
-> image-map.json
-> master-record loader + validator
-> BusinessBriefInput adapter
-> normalizeBusinessBrief()
-> Astro routes and sections
-> build
-> deploy
```

## Step 1: Raw Capture

The raw intake layer now starts in `business-input/<slug>/`.

Examples:

- `intake.json`
- `raw/maps/*`
- `raw/html/*`
- `raw/images/*`
- `raw/docs/*`
- `raw/notes/*`

This is the staging zone for imperfect real-world input.

## Step 2: Input Manifest

The input manifest scans the intake package and makes the package legible before normalization.

It records:

- what files exist
- what kind of files they appear to be
- what folders are populated
- what expected inputs are still missing
- what needs cleanup

## Step 3: Cleaning Into Brief

The brief file converts the raw input into the stable business view that the app can actually use.

This is where we choose:

- accepted business name and category
- clean contact fields
- usable offer structure
- approved brand copy
- approved SEO copy

## Step 4: Explicit Gap Tracking

The missing-data file prevents silent ambiguity.

Instead of losing context when a value is null, the system keeps:

- why it is missing
- how serious that is
- what it blocks
- what should happen next

## Step 5: Editorial Planning

The content-plan file makes conversion and section priorities explicit.

This is where we define:

- what the main CTA should be
- what the fallback CTA should be
- which sections matter most
- what message the page should push first

## Step 6: Asset Mapping

The image-map file translates a pile of image files into a usable visual inventory.

That lets the system say:

- this one is hero-ready
- this one is gallery-only
- this one is a reserve
- this one should not be used

## Step 7: Build-Time Validation

At build time the loader:

- reads the five files
- validates required structure
- checks shared slug integrity
- checks CTA feasibility
- checks image references

If the record is broken, the build fails early instead of drifting silently.

## Step 8: Render Compatibility

The current render layer still consumes `BusinessBriefInput`.

That is deliberate.

Block 2 improves the data architecture first, while keeping:

- preset mapping
- section assembly
- SEO generation
- static build
- Firebase deploy

stable and low-risk.

## What This Enables Next

Because the data lifecycle is now explicit, block 3 can focus on presentation-system cleanup without also having to untangle business truth at the same time.
