# Render Rules

## Core rule

Components should render from assembly decisions, not from raw business data alone.

The render path is now:

1. master record + profiles
2. assembly engine
3. `assembly-profile.json`
4. Astro sections

## Section rules

- `hero` always renders.
- `popular-items` renders only if there is a reliable highlight set.
- `services` renders only if structured offer data exists.
- `credibility` renders only if rating, review themes, or proof points exist.
- `about` renders only if service modes or practical visit context exist.
- `gallery` renders only if approved gallery assets exist.
- `faq` renders only if there are at least two practical answers.
- `cta` renders only if a truthful primary action exists.
- `footer` always renders, but links inside it only stay live for visible sections.

## CTA rules

- Hero uses the strongest truthful action plus one quieter backup.
- Final CTA uses the same primary action, but prefers a more practical support action like `Call`.
- No CTA is rendered without a real `href`.
- Missing digital routes degrade toward directions, in-page menu, or call.

## Image rules

- Hero gets `heroMain`.
- Hero support gets at most one support image.
- Highlights use selected dish images first.
- Gallery uses the approved gallery selection from the image pipeline.
- Fallback remains separate and does not silently replace stronger slots unless needed.

## Current business

For The Dosa Spot, the assembly renders:

- hero
- popular items
- services
- credibility
- about
- gallery
- faq
- final CTA
- footer

with:

- hero CTA: `Get Directions` + `View Menu`
- final CTA: `Get Directions` + `Call`
