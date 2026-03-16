# Business Onboarding Checklist

## Input Package

- slug created under `business-input/`
- `intake.json` exists
- raw folders exist
- maps link exists
- notes exist
- at least one real CTA path is likely to be truthful

## Source Material

- images added to `raw/images/`
- menu/services notes added
- review notes added if available
- manual profile reflects what is truly verified

## Pipeline

- `npm run release:prepare -- <slug>`
- `input-manifest.json` generated
- `business-brief.json` generated
- `missing-data.json` reviewed
- `image-map.json` reviewed
- `assembly-profile.json` reviewed

## Runtime Readiness

- business registered in runtime if needed
- presets defined if needed
- no slug collision with another business

## Validation

- `npm run release:validate -- <slug>`
- `qa-report.md` reviewed
- no QA errors
