# QA Checks

## Structure

- required normalized files exist
- built home page exists
- built demo pages exist
- built `404.html` exists
- built `robots.txt` exists
- master record has no internal validation issues or unresolved conflict items

## Assets

- assembly-selected images exist in `image-map.json`
- selected assets exist in both `public/` and `dist/`
- mapped image alt text is non-empty
- duplicate asset symptoms are reported

## Assembly

- hero has a usable primary CTA
- visible CTA count stays within copy limits
- visible CTAs resolve to useful hrefs
- visible sections have enough data
- footer links do not point to hidden sections
- critical missing paths are covered by degradation rules

## Copy

- copy-profile validation issues are surfaced
- rendered home copy is scanned for forbidden claims
- repeated phrase hints are surfaced as polish

## SEO

- title, meta description, and canonical exist
- pages expose exactly one H1
- primary pages include JSON-LD
- home stays indexable
- demo pages and 404 stay noindex
- visible NAP appears on home
- legacy branding leaks in canonical config are surfaced

## Accessibility

- built images avoid empty/generic alt text
- skip link is present
- generic link labels are flagged
- FAQ affordance is real when FAQ is visible

## Experience

- weak image load is tracked
- hero CTA load stays focused
- empty support copy is flagged
- FAQ answer length can be flagged as polish

## Manual Review

The current engine also emits manual review prompts for:

- contrast and mobile comfort
- image crop quality
- editorial polish on repeated phrases
