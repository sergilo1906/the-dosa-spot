# Copy Fallbacks

## Goal

Fallback rules stop the system from sounding better informed than it really is.

When a field is missing, the engine should simplify and stay truthful rather than fill gaps with generic copy.

## Current Degradation Sources

Fallbacks come from two places:

- sector copy degradation rules
- visual fallback rules that affect supporting copy

Both are merged into `copy-profile.json`.

## Restaurant Examples

### No order URL

If `contact.orderUrl` is missing:

- do not use `Order Online`
- keep hero and close visit-led or menu-led
- avoid delivery-first promises

### No menu URL

If `contact.menuUrl` is missing:

- talk about on-page highlights
- do not imply a complete verified external menu

### No hours

If `location.openingHours` is missing:

- do not write `open now`
- do not suggest late-night or daily availability
- keep contact copy focused on directions and phone

### No testimonials

If `trust.testimonials` is missing:

- summarize review themes
- do not fake quoted customer voices

### Visual fallback

If exterior imagery is missing:

- keep gallery support text dish-led or ambience-led
- let location/contact carry more of the local reassurance

## Why This Matters

These rules are what keep the system honest when the intake package is partial.

They also reduce the chance of shipping copy that sounds polished but is not actually supported by the data.
