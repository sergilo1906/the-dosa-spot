# Section Visibility

## Visibility map

Section visibility is stored in:

- `assembly-profile.json > visibility.sections`

Each entry includes:

- `id`
- `anchor`
- `show`
- `mode`
- `priority`
- `reason`
- `triggeredBy`

## Why this exists

Before block 9, visibility lived in scattered component conditionals such as:

- `business.sectionEligibility.services`
- `business.sectionEligibility.gallery`
- hardcoded always-on blocks

That approach was workable for one business but weak for reuse because it did not explain why a section appeared, disappeared, or degraded.

## Current behavior

For The Dosa Spot:

- all major sections remain visible
- gallery stays `full`
- no footer link points to a hidden section
- FAQ stays visible because it has three practical answers

## Future extension

If a business has:

- no highlight set
- no gallery assets
- no truthful CTA
- weak FAQ utility

the assembly engine can suppress those blocks without touching every section component.
