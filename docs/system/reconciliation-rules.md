# Reconciliation Rules

## Source Priority

The normalizer resolves fields with an explicit priority ladder.

1. `manual-profile`
2. `intake-seed`
3. `maps-link-file`
4. `support-review-summary`
5. `support-menu-summary`
6. `input-manifest`
7. `intake-notes`
8. `image-map`
9. `inference`

This order is implemented in:

- [reconcile.ts](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/lib/normalization/reconcile.ts)

## Resolution Rules

For each tracked field:

1. collect candidates from available sources
2. drop empty values
3. sort by source weight
4. compare only the highest-priority available tier
5. if top-tier values disagree, mark `conflict`
6. if no value exists, keep the field as `missing` or `pending`
7. if a manual field state exists, it overrides the default state decision

## State Semantics

- `verified`: the resolved value comes from a top-priority confirmed source, or a manual field state marks it as verified.
- `inferred`: the value is usable, but shaped from support docs, taxonomy, or editorial assembly rather than a canonical source.
- `missing`: no publishable value exists yet.
- `conflict`: top-priority sources disagree or a manual missing marker clashes with a discovered value.
- `pending`: the system has enough surrounding context to know the field matters, but it should not publish the value yet.

## What Gets Escalated To Missing Data

Not every inferred field becomes a missing-data item.

`missing-data.json` stays focused on actionable gaps and risky states such as:

- missing contact routes
- missing geo / opening hours
- inferred categories that should later be confirmed
- pending testimonials

Editorial render helpers such as tagline or hero signature can remain inferred in the reconciliation report without polluting the missing-data list.

## Current The Dosa Spot Example

Examples of explicit field-state handling in:

- [manual-profile.json](/C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/raw/notes/manual-profile.json)

Examples:

- `identity.secondaryCategories` -> `inferred`
- `contact.website` -> `missing`
- `trust.testimonials` -> `pending`
- `brand.tagline` -> `inferred`

## Important Constraint

The normalizer is designed to avoid silent overreach.

If the source set is thin, it should:

- keep the value missing
- keep the state inferred
- or keep the field pending

It should not pretend certainty just to complete the brief.
