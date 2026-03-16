# Assembly Engine

## Purpose

Block 9 adds a render-ready assembly layer between the data system and the Astro sections.

The landing no longer decides core product logic inside section components. Instead, the app now consumes a precomputed `assembly-profile.json` per business and uses it to answer:

- which sections stay visible
- which CTA is primary or secondary
- which images fill hero, highlights, and gallery
- which degradations are active
- which footer links should stay live

## Inputs

The assembly engine reads:

- `business-brief.json`
- `content-plan.json`
- `sector-profile.json`
- `visual-profile.json`
- `copy-profile.json`
- `image-map.json`

These files are merged in [engine.ts](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/lib/assembly/engine.ts).

## Output

The generator writes:

- [assembly-profile.json](/C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/assembly-profile.json)

That profile contains:

- `page`
- `context`
- `visibility.sections`
- `ctaMap`
- `images`
- `content`
- `navigation`
- `degradations`
- `diagnostics`

## Runtime integration

The landing now consumes assembly directly from:

- [DemoLanding.astro](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/components/demo/DemoLanding.astro)
- [HeroSection.astro](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/components/sections/HeroSection.astro)
- [CredibilitySection.astro](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/components/sections/CredibilitySection.astro)
- [GallerySection.astro](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/components/sections/GallerySection.astro)
- [CtaSection.astro](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/components/sections/CtaSection.astro)
- [FooterSection.astro](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/components/sections/FooterSection.astro)

## Generation

Run:

```bash
npm run assembly:analyze -- the-dosa-spot
```

This script lives at [generate-assembly-profile.ts](/C:/Users/Sergi/OneDrive/Escritorio/Webs/scripts/generate-assembly-profile.ts).
