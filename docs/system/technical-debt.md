# Technical Debt

## High Priority

### 1. Presentation and content are mixed inside the business model

Symptoms:

- `BusinessBriefInput` contains factual business fields and also presentation-facing fields like `heroSignature`, `photographyStyle`, `materialFinish`, and `imageTreatment`.
- Some section copy still depends on authored narrative fields rather than stricter content rules.

Why it matters:

- It makes the data layer harder to reuse across niches.
- It blurs the line between business truth and design direction.
- It raises the cost of future automation and intake tooling.

Recommended later move:

- Split factual business data, editorial content, and presentation hints into clearer subdomains.

### 2. The visual system is centralized in one large stylesheet

Symptoms:

- `src/styles/global.css` holds most component, layout, responsive, and interaction styles.
- The file is roughly 1,588 lines long.

Why it matters:

- It increases regression risk during visual changes.
- It hides component boundaries.
- It slows confident refactoring because many sections share the same surface area.

Recommended later move:

- Break the stylesheet into section or concern-based files while preserving the current token layer.

### 3. Final canonical identity is still undecided

Symptoms:

- `astro.config.mjs` and `src/lib/seo/site.ts` are now env-aware, but the default fallback still points to the old Firebase hostname.
- Release can derive `SITE_URL` from project id, but that is only a safe fallback, not a final brand/domain decision.

Why it matters:

- It keeps canonical identity partly operational instead of fully product-defined.
- It can leave a warning in QA until the real production domain or final Firebase target is decided.

Recommended later move:

- Decide the canonical production domain and make it the normal default instead of a fallback override.

## Medium Priority

### 4. The repo still carries sample-era artifacts and archive docs

Symptoms:

- `northsideSocialStudio.ts` and `blackQuayAtelier.ts` exist but are not registered.
- `PresetDock.astro` exists but is not mounted.
- `docs/presentation/owner-demo-playbook.md` is archive material from the sample phase.
- Some demo SVG assets remain in `src/assets/demo/barbers/`.

Why it matters:

- It makes the codebase look more generalized than it is.
- It increases onboarding confusion.

Recommended later move:

- Either formalize the sample layer or archive/remove the inactive pieces.

### 5. Image handling is explicit but manual

Symptoms:

- Runtime images are referenced by hardcoded public paths.
- Width and height are manually attached in data.
- No responsive image generation pipeline exists.

Why it matters:

- It works today, but it will be tedious across multiple businesses.
- It increases operator effort and risk of inconsistent image metadata.

Recommended later move:

- Introduce a lightweight image manifest or Astro image pipeline without changing the public visual output first.

### 6. The motion layer is globally bootstrapped

Symptoms:

- `boot.ts` queries the whole document and attaches interactions from one entry point.

Why it matters:

- It is fine at the current size, but future changes can create hidden interaction coupling.
- It makes per-section reasoning harder.

Recommended later move:

- Keep the current behavior but move toward narrower initializers per concern or per section.

### 7. The current model duplicates menu concepts

Symptoms:

- `services` and `featuredItems` both describe dish/menu content.
- `DemoLanding.astro` includes a fallback from `services` into `featuredItems`.

Why it matters:

- The distinction is workable, but not strongly encoded.
- It may create double-maintenance when scaling to more businesses.

Recommended later move:

- Clarify whether `services` means menu categories, offer cards, or generic commercial offerings.

## Low Priority

### 8. Some model fields are not earning their complexity yet

Examples:

- `missingDataFlags`
- `completenessScore`
- `ownerNarrative`
- `featuredNote`
- `display.contactLabel`

Why it matters:

- These fields increase the surface area of the model without clear runtime benefit today.

Recommended later move:

- Either use them intentionally in UI/operator workflows or remove them from the core model.

### 9. Generalization is broader than runtime coverage

Symptoms:

- The type system and schema mapping now cover more local-business niches.
- The active runtime reference case is still just one real restaurant business.
- Some section-level copy and defaults remain more food-friendly than truly sector-neutral.

Why it matters:

- The app is reusable in spirit, not yet in a robust productized sense.

Recommended later move:

- Keep broadening only where it reduces real friction, and test the next niche with a real business package before claiming full generality.

## Things To Freeze For Now

Until a later refactor block, treat these as stable contracts:

- the normalized `BusinessBrief` shape
- the preset-to-section variant mapping
- section anchors used by CTAs and footer links
- the current JSON-LD/meta pipeline
- the runtime asset folder and filenames for The Dosa Spot
