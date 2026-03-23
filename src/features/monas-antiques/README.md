# Mona's Antiques Scope

This folder is the isolated seed for the Mona's Antiques demo.

Current purpose:

- reserve a safe slug and route
- keep Mona-specific configuration out of the active home and preset flow
- document where future Mona assets and business data should live
- hold the Mona-only implementation layer for the live demo build

Current files:

- `scope.ts`: slug, route, noindex policy, future paths, and guardrails
- `images.ts`: centralized remote-image placeholder mapping for Mona's only
- `content.ts`: Mona-only copy source of truth, tone guide, CTA labels, and graceful fallback wording
- `profile.ts`: Mona-only practical business data, verified contact/address cues, and CTA resolution helpers
- `theme.ts`: Mona-only visual direction, tokens, audit notes, and implementation rules
- `theme.css`: scoped Mona-only design-system classes and preview styles
- `architecture.ts`: Mona-only route map, navigation, page definitions, and exact block order per page
- `BlueprintPage.astro`: reusable scaffold kept as architecture reference
- `DemoPage.astro`: live Mona-only multipage implementation consumed by `/demo/monas-antiques/*`
- `MonasPageShell.astro`, `MonasCtaButtons.astro`, `MonasMediaCard.astro`: Mona-only UI helpers for shell, CTA rendering, and image cards

Isolation rules:

- do not wire Mona into `src/data/preset-definitions.ts` yet
- do not add `business-input/monas-antiques/` until the onboarding pipeline is ready to produce a full normalized package
- keep future Mona-only code inside this feature folder unless a shared abstraction is proven safe first
- keep Mona on plain `<img>` remote URLs unless a later block explicitly needs Astro image optimization
- keep Mona styling inside the `theme-monas` wrapper and `monas-*` classes instead of editing root tokens or shared components

Planned future paths:

- `business-input/monas-antiques/`
- `public/businesses/monas-antiques/`

Current remote-image strategy:

- URLs stay centralized in `images.ts`
- `images.ts` now stores the selected remote URLs plus source pages, confidence, and notes per slot
- placeholder tokens remain in the mapping for traceability only; the live `src` values are now resolved
- no Astro remote domain config is needed yet because the current shared render layer uses plain `<img src=\"...\">`
- if Mona later adopts `astro:assets`, add only the final remote host allowlist at that point

Current visual strategy:

- `theme.ts` is the source of truth for Mona's palette, typography, spacing, component direction, and anti-regression audit
- `theme.css` exposes Mona-only classes under the `theme-monas` wrapper so the demo can ship without touching global styles
- the Mona demo routes now render a real, presentable multipage demo without changing any active business page

Current architecture strategy:

- `architecture.ts` is the source of truth for the four-page Mona demo: Home, Collection, About the Shop, and Visit & Enquiries
- each page lives under `/demo/monas-antiques/` and its child routes, keeping Mona outside the active preset and homepage flow
- the old scaffold remains available as a reference, but the live routes now use `DemoPage.astro`

Current content strategy:

- `content.ts` holds the Mona-only tone guide and the exact copy scaffold for every page and block
- CTA labels, block titles, support copy, card labels, and placeholder language for unverified data all stay in Mona-only content objects
- `profile.ts` resolves which practical CTAs can render truthfully today and which must stay absent
- Mona-only components consume this content instead of hardcoding Mona copy into shared project UI
