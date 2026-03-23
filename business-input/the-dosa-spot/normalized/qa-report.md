# Product QA Report

- Business: the-dosa-spot
- Generated: 2026-03-17T11:19:35.703Z
- Checks run: 38
- Passed: 28
- Errors: 0
- Warnings: 0
- Polish: 10
- Manual review: 3

## Errors
- None

## Warnings
- None

## Polish
- [POLISH] Some visible sections are thin or under-supported: One or more visible sections look too thin for their current visibility decision.
- [POLISH] Gallery is visible with limited variety: The gallery is intentionally compact because the current approved image set is limited.
- [POLISH] Copy profile surfaced issues: The copy engine detected issues or hints that should be reviewed before release.
- [POLISH] Copy validation issue in highlights: Repeated phrase across samples: "curry plates".
- [POLISH] Copy validation issue in highlights: Repeated phrase across samples: "pickup or".
- [POLISH] Copy validation issue in highlights: Repeated phrase across samples: "or delivery".
- [POLISH] Copy validation issue in highlights: Repeated phrase across samples: "pickup or delivery".
- [POLISH] Copy validation issue in highlights: Repeated phrase across samples: "potato masala".
- [POLISH] Copy validation issue in highlights: Repeated phrase across samples: "you want".
- [POLISH] Copy repetition hints are still present: The copy engine still sees repeated phrase patterns that are worth a final edit pass.

## Passes
- [PASS] Normalized business files are present: All expected normalized JSON files exist for the current business.
- [PASS] Master record is internally coherent: The current business record has no validation issues and no unresolved conflict items.
- [PASS] Built routes exist: Verified 4 expected built routes including home, demos, and 404.
- [PASS] robots.txt exists: The build includes robots.txt for crawler guidance.
- [PASS] Assembly image references are valid: Every image used by the assembly profile exists in image-map.json.
- [PASS] Selected image files exist in public and dist: Every selected asset resolves both in source assets and in the built output.
- [PASS] Mapped images have non-empty alt text: All approved and backup images carry non-empty mapped alt text.
- [PASS] No duplicate image symptoms detected: The current image-map does not report duplicate assets.
- [PASS] Hero has a primary CTA: Get Directions resolves to a usable action.
- [PASS] CTA count stays within the configured limit: Hero shows 2 CTA(s) and final CTA shows 2; both stay within the max of 2.
- [PASS] Visible CTAs resolve cleanly: Every visible CTA in hero and final CTA has a usable href.
- [PASS] Footer links respect section visibility: No enabled footer link points to a hidden section.
- [PASS] Critical missing data has a degradation rule: Critical missing paths in the current brief are acknowledged by the assembly degradation layer.
- [PASS] Rendered copy avoids forbidden claims: The built home page does not appear to expose prohibited order, menu, hours, or testimonial claims.
- [PASS] Action labels stay specific: The built pages do not rely on generic link labels like "Learn more".
- [PASS] Title, description, and canonical are present: Every checked route includes the basic visible SEO tags.
- [PASS] Heading structure has one H1 per checked page: The checked built pages each expose exactly one H1.
- [PASS] Structured data is present on primary pages: Home and demo pages include JSON-LD output.
- [PASS] Robots directives match route intent: Home stays indexable, while demos and 404 stay noindex.
- [PASS] Visible NAP stays coherent on the home page: The home page includes the current business name, address, and phone cues.
- [PASS] Home page stays scoped to the active business: The built home page does not appear to leak another registered business name.
- [PASS] Site URL branding looks clean: The configured canonical site URL does not show obvious legacy branding.
- [PASS] Built images have non-empty alt text: The checked built pages do not expose empty or generic img alt text.
- [PASS] Skip link is present on checked pages: Each checked page includes the Skip to content link.
- [PASS] FAQ affordance is real: The visible FAQ renders as real details elements.
- [PASS] Weak-image load is limited: Only 0 image(s) are marked weak in the current image set.
- [PASS] Hero action load stays focused: The hero keeps one clear primary action and one secondary path at most.
- [PASS] Render-ready blocks do not expose empty support copy: The assembly profile keeps core support copy populated for visible blocks.

## Manual Review
- [WARNING] Review contrast and touch comfort on a real mobile device: The automated layer cannot fully verify contrast, tap comfort, or real scroll rhythm. Reason: Visual contrast and mobile comfort still need a human eye and a real device.
- [POLISH] Review hero and gallery crops: The current asset mix includes either weak reserves or a compact gallery. Reason: Crop quality and perceived richness still need a visual review beyond heuristics.
- [POLISH] Review repeated phrase hints in visible copy: The copy engine still flags minor repetition patterns. Reason: These are soft issues that benefit from editorial judgment, not blind automation.

