# Data Model

## Purpose

Block 2 introduces a master business record layer so the app no longer depends on a single hand-authored TypeScript object as its practical source of truth.

The new design keeps the current render pipeline intact while splitting the business dataset into clearer concerns:

- raw source data
- cleaned brief data
- missing or uncertain data
- content and CTA planning
- image role mapping

## Design Rules

- Keep the current Astro render contract working.
- Separate factual business data from presentation planning.
- Make files readable by humans, code, and future AI operators.
- Prefer simple runtime validation over heavy external schema tooling.
- Stay generic enough for restaurants, barber shops, and similar local businesses.

## Core Types

Main types live in [business-record.ts](C:/Users/Sergi/OneDrive/Escritorio/Webs/src/types/business-record.ts).

The model introduces:

- `BusinessRawFile`
- `BusinessBriefFile`
- `MissingDataFile`
- `ContentPlanFile`
- `ImageMapFile`
- `BusinessMasterRecord`
- `ValidationIssue`

## Layer Boundaries

### `business-raw.json`

This is the closest layer to research and intake.

It can contain:

- factual identity and contact data
- raw offer and trust notes
- source references
- field state notes
- asset inventory references

This file is allowed to be incomplete and messy as long as the uncertainty is explicit.

### `business-brief.json`

This is the cleaned, app-ready business definition.

It contains:

- normalized identity and location
- verified or accepted contact fields
- offer blocks
- trust summary
- brand copy and tone
- SEO-ready local metadata

This is the file that most closely maps to the current render layer.

### `missing-data.json`

This tracks what is absent, inferred, pending, or in conflict.

It exists so the system does not hide uncertainty inside nulls with no explanation.

### `content-plan.json`

This contains presentation strategy without becoming the full render layer.

It decides:

- primary CTA
- secondary CTAs
- conversion goal
- recommended sections
- messaging focus

This keeps CTA logic and editorial priorities explicit instead of buried in component assumptions.

### `image-map.json`

This assigns purpose to image assets.

It defines:

- asset roles
- quality
- approval/discard status
- hero candidacy
- alt text
- future crop intent

This file prepares the image pipeline without forcing that pipeline to be built yet.

## Why This Shape

The block 1 audit showed two main problems:

- business data and presentation hints were mixed in one large object
- image and CTA decisions were implicit rather than modeled

This structure resolves that by keeping the current `BusinessBriefInput` adapter, but feeding it from a richer master record instead of a single improvised source file.

From block 3 onward, those normalized JSON files live under `business-input/<slug>/normalized/`, so the business input package and the master record stay side by side.

## Required Vs Optional

High-value required fields today:

- slug
- business name
- niche
- city
- country
- primary copy needed to render the landing
- at least one CTA path that resolves truthfully

Optional but modeled explicitly:

- website
- email
- WhatsApp
- coordinates
- opening hours
- testimonials
- external platforms
- discard/reserve image states

## Validation Strategy

Runtime validation lives in [master-record.ts](C:/Users/Sergi/OneDrive/Escritorio/Webs/src/lib/business/master-record.ts).

The loader currently validates:

- file kind and schema metadata
- required nested fields
- matching slugs across all five files
- image asset uniqueness
- featured item image references
- CTA availability from the brief layer
- missing-data summary consistency

This is intentionally lightweight but strict enough to fail fast during build-time if the record drifts.

## Adapter Strategy

The current app still renders from `BusinessBriefInput`.

Instead of rewriting the render layer, the new adapter:

1. loads the master record
2. validates it
3. resolves image references
4. converts the brief back into `BusinessBriefInput`
5. lets the existing `normalizeBusinessBrief()` continue to do its job

That is why this block improves the center of truth without forcing a full app refactor.
