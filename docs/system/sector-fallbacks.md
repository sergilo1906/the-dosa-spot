# Sector Fallbacks

## Why Fallbacks Exist

Sector logic is only useful if it stays truthful.

The engine should not recommend:

- booking when no booking route exists
- ordering when no verified order path exists
- heavy team trust when no team material exists
- credential-led language when credentials are missing
- storefront-led galleries when no exterior image exists

## Selection Strategy

The engine scores every supported sector from:

- niche
- category text
- service modes
- offer text
- image signals
- trust signals
- CTA feasibility

If evidence is strong, it chooses the specific sector with `high` or `medium` confidence.

If evidence is weak, it keeps the winning sector at `low` confidence or falls back to `local-service` when the signal floor is too weak.

## CTA Truthfulness

The engine distinguishes between:

- `available`: the app can support the CTA directly and truthfully now
- `degraded`: the ideal CTA is not fully supported, but a safe fallback exists
- `unavailable`: no truthful route exists yet

Example:

- `book-appointment` may degrade to `call`
- `browse-products` may degrade to `visit-website`
- `request-consultation` may degrade to `email`, `whatsapp`, or `call`
- `order-online` may degrade to `view-menu` or `get-directions`

Primary CTA selection prefers `available` actions over `degraded` ones.

That is why The Dosa Spot resolves to `Get Directions` instead of `Order Online` right now.

## Current Example: The Dosa Spot

The engine classifies The Dosa Spot as `restaurant` because the brief includes:

- `restaurant` niche
- restaurant and takeaway category signals
- dine-in, delivery, and pickup modes
- food-led offer language
- dish-heavy imagery
- strong rating and review proof

But the engine also triggers degradation because:

- `contact.orderUrl` is missing
- `contact.menuUrl` is missing
- `location.openingHours` is missing
- `image:exterior` is missing

So the current safe recommendation becomes:

- primary CTA: `Get Directions`
- secondary CTAs: `View Menu`, `Call`

## What This Prepares

Later blocks can use these fallbacks to:

- choose components per sector
- suppress weak content automatically
- avoid dishonest CTA choices
- steer copy tone by business type
- align schema hints with real business behavior
