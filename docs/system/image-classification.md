# Image Classification

## Goal

The classifier should be useful, not overconfident.

If a file clearly maps to a known role, it gets a strong category.
If not, the pipeline keeps it broader and more honest.

## Current Categories

- `hero-candidate`
- `food-close-up`
- `product-close-up`
- `signature-dish`
- `dessert`
- `drinks`
- `gallery`
- `ambience`
- `interior`
- `exterior`
- `counter-service`
- `staff`
- `logo`
- `fallback`
- `weak`
- `discard`
- `duplicate`
- `near-duplicate`
- `unknown`

## Inputs Used For Classification

The current classifier uses:

- filename tokens
- file extension
- overlap with known featured item names from `business-brief.json`
- business niche context

This means it can safely promote a file to a more specific category when the filename really supports it, but it will not invent a dish name from the pixels alone.

## Example Decisions

For The Dosa Spot:

- `hero-main.jpg` -> `hero-candidate`
- `dish-dosa.jpg` -> `food-close-up` with featured-item match
- `dish-vegetable-noodles.jpg` -> promoted to `signature-dish`
- `fallback-noodle-bowl.jpg` -> `fallback`

## Confidence

Each asset also carries a confidence level:

- `high` when filename or featured-item match is strong
- `medium` when the signal is plausible but not exact
- `low` when the file stays broad or generic
