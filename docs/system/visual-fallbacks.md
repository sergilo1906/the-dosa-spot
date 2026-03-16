# Visual Fallbacks

## Why Visual Fallbacks Matter

A reusable visual system fails if it only works when the business has:

- great photography
- strong brand colors
- a polished logo
- complete business info

This block makes fallback behavior explicit instead of letting the UI improvise.

## Signals Used

The visual engine looks at:

- sector and sector confidence
- tone recommendations from the sector engine
- desired luxury level
- visual intensity
- confirmed brand colors
- approved image count
- strong image count
- image signals such as `image:dish` or `image:exterior`
- missing paths from the normalized dataset

## Current Fallback Logic

### If Brand Colors Are Missing

- stay on family defaults
- avoid invented multi-accent color stories
- keep surfaces and chips simpler

### If Images Are Weak

- reduce hero complexity
- limit gallery count
- let trust and contact cards carry more weight
- avoid dramatic poster or mosaic ambitions

### If Exterior Images Are Missing

- avoid storefront-led framing
- promote directions, address, and contact trust instead

### If The Brief Is Visually Incomplete

- prefer neutral or restrained families
- reduce decorative layers
- keep CTA and trust hierarchy clearer than atmosphere

## Current Example: The Dosa Spot

The Dosa Spot still wins `food-warm-editorial` because:

- sector fit is strong
- tone fit is strong
- color temperature is warm
- image abundance is high
- dish imagery is strong

But one visual fallback still triggers:

- no exterior image, so the family keeps the gallery dish-led and shifts location trust to contact/address panels

## What This Enables Later

Later blocks can use these fallbacks to:

- pick better presets automatically
- avoid hero layouts that overpromise visual richness
- reduce gallery ambition when the source set is weak
- keep theme selection honest even before the business is fully complete
