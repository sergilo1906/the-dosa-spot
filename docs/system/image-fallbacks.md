# Image Fallbacks

## Purpose

Fallback rules stop the site from pretending the image set is stronger or more varied than it really is.

## Current Rules

### No strong hero file

If no explicit hero file exists, the pipeline promotes the strongest general image instead of leaving hero empty.

### No exterior

If no exterior or frontage image is detected:

- `image-map.json` records that gap
- the visual system should lean more on address, contact, and interior/food support

### Only food, no place

If the folder is almost entirely food:

- hero can still be food-led
- ambience stays lighter
- location reassurance should come from copy and contact blocks

### Weak reserve only

If the only remaining spare image is weak, the pipeline can still keep it as `fallback`, but it stays `backup` and should not silently replace stronger gallery or hero material.

### Too many similar images

The dedupe layer prefers:

- exact duplicate removal
- near-duplicate penalty
- gallery variety over repeating the same dish family too often

## Current Example

For The Dosa Spot:

- there is no strong exterior image
- fallback exists, but only as a weak reserve
- the main visual set remains food-led and honest about that limitation
