# Degradation Rules

## Goal

Degradation is now centralized in the assembly output instead of being spread across multiple sections.

The combined degradation list lives in:

- `assembly-profile.json > degradations`

## Sources

The assembly merges degradations from:

- sector rules
- visual rules
- copy rules
- assembly-specific render rules

## Current active degradations for The Dosa Spot

- no verified `orderUrl`
- no verified external `menuUrl`
- no verified opening hours
- no verified testimonial quotes
- no exterior image

## Resulting render behavior

- primary CTA degrades to `Get Directions`
- menu language stays on-page and points to `#menu`
- no “open now” or hours-based wording appears
- trust uses rating + review themes instead of quote cards
- gallery stays food-first instead of pretending there is storefront photography

## Assembly-only additions

Block 9 also adds render-specific degradations that were not owned by earlier engines:

- `assembly-on-page-menu`
- `assembly-theme-trust-only`
- `assembly-hours-hidden`

These rules make the final landing behavior explicit and prevent silent fallback logic from hiding inside section templates.
