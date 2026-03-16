# Manual Intake Prompt

Use this when converting a real local business brief into a structured manual profile or a `BusinessBriefInput`-compatible draft.

## Goal

Collect only truthful, manually verified business data while also capturing the visual and operational context needed to drive the landing safely.

## Intake Prompt

```text
Create a structured business brief for a local business website package.

Rules:
- Do not invent reviews, ratings, phone numbers, addresses, hours, prices, or coordinates.
- If a field is unknown, return null or an empty array.
- Keep copy concise, commercially believable, and grounded in verified facts.
- Prioritize visual direction, local clarity, and the most truthful next step.

Return JSON with these fields:
- businessName
- niche
- tagline
- shortDescription
- city
- country
- address
- phone
- email
- website
- openingHours
- coordinates
- socialLinks
- services
- faqItems
- realReviews
- imageAssets
- brandHints
- brandColors
- toneHints
- visualMood
- seoTitle
- seoDescription
- localSeoData
- missingDataFlags
- completenessScore
- desiredLuxuryLevel
- visualIntensity
- photographyStyle
- atmosphereKeywords
- preferredContrast
- sectionDensityPreference
- proofPoints
- heroSignature
- materialFinish
- imageTreatment
```

## Operator Notes

- Keep `realReviews` empty unless the source has been explicitly verified.
- Use reserved domains such as `.example` for mock links only.
- `proofPoints` should describe truthful strengths of the concept, not fabricated business performance.
- Prefer categories like `restaurant`, `barbershop`, `personal-care`, `retail-shop`, `fitness-wellness`, `clinic-health`, or `local-service` when the niche is known.
