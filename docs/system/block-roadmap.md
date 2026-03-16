# Block Roadmap

## Block 1 Outcome

After this audit, the next blocks should build on what is already working instead of restarting from theory.

The key principle is:

- protect the normalization seam
- reduce false generality
- separate data concerns from presentation concerns
- avoid redesign churn while the system contract is still soft

## Recommended Block 2

### Focus

Clarify and stabilize the data/content boundary.

### Why this should come next

- It unlocks safer refactors later.
- It reduces coupling between business truth and presentation styling.
- It makes every other block more predictable.

### Suggested scope

- review `BusinessBriefInput` and `BusinessBrief`
- identify factual fields vs editorial fields vs visual-hint fields
- define what must stay manual
- define what can be derived
- remove or quarantine fields that are not actively used
- document the contract for one active business before widening again

### Do not do yet

- do not redesign sections
- do not rebuild the preset system
- do not introduce a CMS
- do not change deploy infrastructure

## Recommended Block 3

### Focus

Decompose the visual system without changing the public look.

### Suggested scope

- split `global.css` into section or concern-based files
- preserve tokens in `tokens.css`
- keep class names stable where possible
- reduce the blast radius of visual edits

## Recommended Block 4

### Focus

Clean the sample layer and documentation drift.

### Suggested scope

- decide whether inactive sample businesses remain product assets or should be archived
- either wire `PresetDock` back intentionally or remove it
- align prompt docs and owner docs with the current restaurant product
- remove route names and preset names that no longer exist

## Recommended Block 5

### Focus

Formalize the image and deploy identity layer.

### Suggested scope

- create a cleaner image manifest workflow
- decide the permanent canonical domain
- align `astro.config.mjs`, `site.ts`, Firebase project naming, and public environment naming

## Things Worth Preserving Across All Later Blocks

- the normalized single business object feeding the page
- static generation with simple deployability
- centralized SEO/meta generation
- preset-driven rendering
- explicit public asset paths until a replacement pipeline is ready
