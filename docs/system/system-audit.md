# System Audit

## Scope

This audit is the initial system snapshot captured on March 16, 2026 before the later integration and hardening passes.

The goal is not to redesign the system. The goal is to document how it actually works, where it is solid, where it is fragile, and what should be deferred to later blocks.

Some details below intentionally preserve the original baseline and may mention files or assumptions that were later replaced during the hardening blocks.

For the current integrated flow, use:

- [Current Flow](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/current-flow.md)
- [Module Contracts](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/module-contracts.md)
- [Open Risks](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/open-risks.md)

## ZIP Reference

Reference ZIP reviewed:

- `system_prompts_leaks-main (1).zip`

What is useful from the ZIP for this audit:

- It is useful as a methodological reference for prompt structure, operator workflow, and system-thinking around agentic automation.
- It helps explain the intent behind the broader toolchain and why the repo includes prompting and intake docs.
- It is a reasonable source of criteria for modularity and process documentation.

What does not apply to the factual audit of this app:

- It does not describe the current Astro codebase.
- It does not describe the current data model, presets, routes, assets, or deploy setup.
- It should not be used as evidence of how this app is built today.

## App At A Glance

Today this is a static Astro site for a single active restaurant business, `The Dosa Spot`, with three presentation presets built from one normalized business record.

The app uses:

- Astro for page generation
- Tailwind mainly as token plumbing rather than component-level utility composition
- A large shared stylesheet in `src/styles/global.css`
- A central business data model plus a normalizer
- Section components driven by preset variants
- JSON-LD and metadata generated from the same business object
- Firebase Hosting serving `dist/`

## Real Structure

### Top Level

```text
.
|- public/                    Runtime static assets and OG images
|- src/                       App source
|- docs/                      Prompting, presentation, and now system audit docs
|- dist/                      Build output
|- .astro/                    Astro generated types/cache
|- .firebase/                 Firebase local state
|- imagenes/                  Local raw image source folder, not part of runtime app
|- astro.config.mjs           Astro site config and sitemap integration
|- firebase.json              Hosting target config
|- package.json               Scripts and dependencies
|- tailwind.config.mjs        Tailwind token bridge
|- tsconfig.json              Astro strict TypeScript config
```

### `src/`

```text
src/
|- assets/
|  |- demo/barbers/           Mock SVG sample assets
|  |- textures/              Grain and mesh textures used by the visual system
|- components/
|  |- demo/                  Page section orchestration
|  |- head/                  Metadata head component
|  |- sections/              Hero, services, trust, about, gallery, FAQ, CTA, footer
|  |- ui/                    Small reusable UI atoms
|- data/
|  |- businesses/            Business input records
|  |- presets.ts             Visual preset registry
|- layouts/                  Base page layout
|- lib/
|  |- business/              Normalization logic
|  |- motion/                Client-side animations/interactions
|  |- seo/                   Canonical/meta/JSON-LD/site config
|- pages/                    Static routes and robots.txt
|- styles/                   Tokens plus main stylesheet
|- types/                    Core domain model
```

## Real Routes

- `/` uses the default preset and the active business
- `/demo/dosa-poster/` uses the same business with a different preset
- `/demo/dosa-monolith/` uses the same business with a different preset
- `/404/` uses the same business for brand-consistent not-found UX
- `/robots.txt` is generated from `siteConfig`

The `/demo/` routes are intentionally `noindex` and excluded from the sitemap.

## Real Modules And Responsibilities

### Data and normalization

- `src/types/business.ts` defines the main business model and preset model.
- At the original snapshot, `src/data/businesses/theDosaSpot.ts` was the active runtime business adapter.
- `src/data/businesses/index.ts` normalizes business input and exposes lookup helpers.
- `src/lib/business/normalize.ts` converts `BusinessBriefInput` into a richer `BusinessBrief` with:
  - defaults
  - contact hrefs
  - image selection
  - gallery assets
  - display labels
  - section eligibility flags
  - completeness score and missing data flags

### Presentation assembly

- `src/data/presets.ts` maps preset slugs to section variants.
- `src/pages/index.astro` selects the default preset.
- `src/pages/demo/[preset].astro` renders non-default presets.
- `src/components/demo/DemoLanding.astro` composes the full page from sections.

### Section system

Each section takes the normalized business object and usually a variant enum:

- `HeroSection`
- `ServicesSection`
- `CredibilitySection`
- `AboutSection`
- `GallerySection`
- `FaqSection`
- `CtaSection`
- `FooterSection`

This is a real modular structure, but most copy and display assumptions still lean restaurant-first.

### SEO and metadata

- `src/lib/seo/site.ts` defines global site values
- `src/lib/seo/meta.ts` builds title, description, canonical, robots, and OG image
- `src/lib/seo/jsonld.ts` builds `WebSite`, `Organization`, and local business schema
- `src/components/head/BaseHead.astro` emits meta tags and JSON-LD

### Motion and interactions

- `src/lib/motion/boot.ts` initializes:
  - Lenis smooth scroll
  - Anime.js reveal sequences
  - hover lift interactions
  - Embla carousel
  - FAQ accordion behavior

This is a single global enhancement script attached from `BaseLayout`.

## What Is Solid

- The app has a real central domain model instead of section-by-section ad hoc props.
- The normalizer is the clearest architectural seam in the project.
- Page generation is deterministic and static.
- Presets are real, not fake: the same business record can drive multiple visual variants.
- SEO is centralized rather than duplicated across pages.
- Assets are explicit and easy to inspect.
- Routing is simple and low-risk.
- Deploy is straightforward because Firebase only serves the built `dist/`.

## What Is Fragile

- The visual system is concentrated in one large `global.css` file of roughly 1,588 lines.
- Business data mixes factual content with presentation direction, visual mood, and section copy inputs.
- The repo still contains sample businesses and sample docs from an earlier barber-oriented phase, but only one business is actually registered.
- The live site identity still points at `barber-pro-6fdf6.web.app`, which is technically functional but semantically wrong for the product.
- Motion is bootstrapped globally through DOM queries rather than bounded per component.
- The image system is manual and path-driven rather than generated through a responsive asset pipeline.

## Evolution Residue

These are the clearest signs of the app evolving through several phases:

- `northsideSocialStudio.ts` and `blackQuayAtelier.ts` still exist as sample inputs but are not registered in `src/data/businesses/index.ts`.
- `PresetDock.astro` exists but is not mounted in the current page assembly.
- At the original snapshot, `docs/presentation/owner-demo-playbook.md` still referenced older preset names and routes.
- At the original snapshot, `docs/prompting/manual-intake.md` was still barber-specific.
- The business model still contains fields such as `completenessScore`, `missingDataFlags`, `ownerNarrative`, and `featuredNote` that are only partially used or not surfaced at all.

## Dangerous Couplings

- The app looks generic at the type level, but the active render flow is effectively single-business.
- Section IDs such as `#menu`, `#reviews`, `#gallery`, and `#location` are depended on by CTAs and footer links.
- `normalizeBusinessBrief` quietly defines many fallback behaviors that the rest of the app assumes are always available.
- `siteConfig.siteUrl` and `astro.config.mjs` both influence the canonical/deploy identity and must stay aligned.
- At the original snapshot, asset filenames in `public/demo/restaurants/the-dosa-spot-real/` were directly referenced by business data.

## Things Not To Touch Casually

- `src/lib/business/normalize.ts`
- `src/types/business.ts`
- `src/data/presets.ts`
- `src/components/demo/DemoLanding.astro`
- `src/lib/seo/meta.ts`
- `src/lib/seo/jsonld.ts`
- `src/lib/seo/site.ts`
- At the original snapshot: `public/demo/restaurants/the-dosa-spot-real/*`
- `astro.config.mjs`
- `firebase.json`

These files define the current contract between data, rendering, SEO, and deploy.

## Audit Summary

This app is stronger than a one-off landing page and weaker than a fully generalized multi-business system.

The best way to describe it today is:

- a solid single-business static site
- with a real normalization seam
- with reusable preset logic
- with good deploy simplicity
- but with styling, content modeling, and business abstraction still carrying the residue of rapid evolution
