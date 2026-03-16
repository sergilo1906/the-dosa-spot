# Visual Engine

## Goal

Block 6 adds a reusable visual decision layer on top of the sector engine.

It does not redraw the current site. It decides which visual family fits a business best and records that choice in a structured profile.

## Runtime Flow

```text
business-brief.json
+ image-map.json
+ missing-data.json
+ sector-profile.json
    ->
analyzeBusinessVisual()
    ->
visual-profile.json
```

## Command

```bash
npm run visual:analyze -- <slug>
```

For the current business this writes:

- `business-input/the-dosa-spot/normalized/visual-profile.json`

## What The Engine Produces

- selected visual family
- confidence level
- candidate scores
- palette tokens
- typography direction
- spacing rhythm
- hero recommendation
- CTA system recommendation
- card system recommendation
- gallery system recommendation
- trust block recommendation
- motion hints
- applied visual fallbacks

## Why This Layer Exists

Before this block, the app had a strong handcrafted look but no reusable way to say:

- why this brand should feel warm vs calm
- when to use a richer editorial direction
- when to stay restrained
- how to degrade cleanly when assets are weak

This layer makes those choices explicit without forcing a UI rewrite yet.

## Current Example

The Dosa Spot resolves to:

- visual family: `food-warm-editorial`
- confidence: `high`
- hero direction: food-first
- card direction: editorial-frame + luxe-panel
- gallery direction: frames-mosaic
- trust direction: rating-panel

Current fallbacks triggered:

- no exterior image, so storefront-led gallery framing is suppressed
