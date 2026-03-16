# Copy Rules

## Layering

The copy system is built from three layers:

1. Sector rules
2. Block rules
3. Business-specific constraints

This keeps the system reusable without letting it drift into freeform generation.

## Supported Tone System

Defined in:

- [copy-engine.ts](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/types/copy-engine.ts)

Current tone ids:

- `warm-food-led`
- `premium-casual`
- `local-trust`
- `modern-clean`
- `calm-clinical`
- `boutique-service`
- `direct-conversion`

## Sector Rule Sets

Defined in:

- [rules.ts](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/lib/copy/rules.ts)

Supported sectors:

- `restaurant`
- `cafe-bakery-takeaway`
- `personal-care`
- `retail-shop`
- `fitness-wellness`
- `clinic-health`
- `local-service`

Each sector rule set defines:

- tone priority
- hero focus
- closing style
- trust priority
- allowed claims
- forbidden claims
- block rules
- degradation rules

## Block Coverage

The current engine defines explicit rules for:

- `hero-title`
- `hero-subheadline`
- `hero-support`
- `cta-primary`
- `cta-secondary`
- `highlights`
- `trust-summary`
- `review-signals`
- `gallery-support`
- `location-contact`
- `faq`
- `final-cta`
- `footer`

Every block rule includes:

- what the block is for
- what the user wants at that point
- which inputs to prefer
- which proof types are safe
- which lengths to respect
- what to avoid
- which claims are off-limits

## Example: Restaurant

For food businesses the system prefers:

- warm, concrete, appetite-led language
- one clear next step
- trust based on rating, review themes, and known highlights
- local practical copy over vague premium language

That is why The Dosa Spot is mapped to:

- `warm-food-led` as the primary tone
- `Get Directions` as the clearest primary CTA
- short dish-led highlight summaries
- review themes instead of invented quote testimonials
