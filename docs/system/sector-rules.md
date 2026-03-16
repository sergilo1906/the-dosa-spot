# Sector Rules

## Supported Sectors

### Restaurant / Food Business

- Primary focus: appetite, menu clarity, visit/order truthfulness.
- Typical primary CTA: `Order Online`, then `Get Directions`, then `View Menu`.
- Best hero: `food-first`.
- Best trust: ratings, review volume, signature dishes, local proof.

### Cafe / Bakery / Takeaway

- Primary focus: quick visit intent, easy menu scan, lightweight ordering.
- Typical primary CTA: `Get Directions` or `View Menu`.
- Best hero: `food-first`.
- Best trust: repeat-visit feel, product quality, local proof.

### Personal Care

- Covers: barber, salon, beauty, grooming, service-personal businesses.
- Primary focus: booking or contact clarity.
- Typical primary CTA: `Book Appointment`, then `Call`.
- Best hero: `service-first`.
- Best trust: reviews, service results, years in business.

### Retail / Shop

- Primary focus: browsing products and then visiting the store.
- Typical primary CTA: `Browse Products`, then `Get Directions`.
- Best hero: `product-first`.
- Best trust: product quality, store presence, reviews.

### Fitness / Wellness

- Primary focus: consultation, class interest, or first visit.
- Typical primary CTA: `Request Consultation` or `Book Appointment`.
- Best hero: `transformation-first`.
- Best trust: outcomes, staff credentials, review proof.

### Clinic / Health

- Primary focus: clear service understanding and safe contact routing.
- Typical primary CTA: `Request Consultation`, `Book Appointment`, or `Call`.
- Best hero: `trust-first`.
- Best trust: credentials, certifications, reviews, locality.

### Local Service

- Fallback for broad or ambiguous local businesses.
- Primary focus: practical contact and local clarity.
- Typical primary CTA: `Call`, then `Request Consultation` or `Get Directions`.
- Best hero: `local-presence-first`.
- Best trust: local proof, reviews, years in business.

## Rule Shape

Each sector rule set defines:

- category keywords
- service-mode keywords
- offer keywords
- visual signals
- CTA priority
- section priority
- trust system
- gallery system
- tone rules
- degradation rules
- schema hints

## Current System Mapping

The sector engine can recommend sections that do not yet exist visually in the current site, such as:

- `team`
- `booking`
- `products`
- `results`

When possible it also records the nearest current system section, for example:

- `signature-items` -> `popular-items`
- `trust` -> `credibility`
- `location-contact` -> `cta`

That keeps the engine useful now without pretending the current UI already has every sector-specific component.
