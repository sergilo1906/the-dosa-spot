# Operation Checklist

## Before preview

- run `npm run release:validate -- <slug>`
- read `business-input/<slug>/normalized/qa-report.md`
- confirm there are no QA errors
- review warnings and decide whether preview is still useful
- make sure the target Firebase project is explicit
- make sure the canonical site URL is explicit if the final domain is already known

## Before live

- preview URL reviewed on desktop and mobile
- QA errors at `0`
- QA warnings reviewed and ideally cleared
- CTA routes tested
- core assets load correctly
- canonical / domain decisions reviewed
- deploy command includes `--confirm-live`

## After preview

- verify home loads
- verify demo routes if they are still part of the system
- verify image paths
- verify primary CTA and secondary CTA
- verify footer links
- verify no obvious copy degradation leaks

## After live

- check live URL
- confirm latest build is what shipped
- confirm no accidental preview/live confusion
- note any remaining warnings for the next pass
