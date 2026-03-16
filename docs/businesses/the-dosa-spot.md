# The Dosa Spot

## Why This File Exists

This is the current real reference business for the system.

Use it when you want to see how one business flows from raw input to release.

## Business Entry Points

### Input package

- [intake.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/intake.json)
- [raw/maps](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/raw/maps)
- [raw/docs](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/raw/docs)
- [raw/images](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/raw/images)
- [raw/notes](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/raw/notes)

### Normalized package

- [business-raw.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/business-raw.json)
- [business-brief.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/business-brief.json)
- [missing-data.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/missing-data.json)
- [content-plan.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/content-plan.json)
- [image-map.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/image-map.json)
- [sector-profile.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/sector-profile.json)
- [visual-profile.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/visual-profile.json)
- [copy-profile.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/copy-profile.json)
- [assembly-profile.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/assembly-profile.json)
- [qa-report.md](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/qa-report.md)

### Runtime references

- [business-records/the-dosa-spot](C:/Users/Sergi/OneDrive/Escritorio/Webs/src/data/business-records/the-dosa-spot)
- [businesses index](C:/Users/Sergi/OneDrive/Escritorio/Webs/src/data/businesses/index.ts)
- [preset-definitions.ts](C:/Users/Sergi/OneDrive/Escritorio/Webs/src/data/preset-definitions.ts)
- [public images](C:/Users/Sergi/OneDrive/Escritorio/Webs/public/businesses/the-dosa-spot/images)

## Real Pipeline

For this business today, the working flow is:

```bash
npm run release:prepare -- the-dosa-spot
npm run release:validate -- the-dosa-spot
npm run deploy:preview -- the-dosa-spot <firebase-project-id>
npm run deploy:live -- the-dosa-spot <firebase-project-id> confirm-live
```

If the final domain is already known, add:

```bash
--site-url https://your-domain.example
```

## What The System Currently Decides

- sector: restaurant
- visual family: food-warm-editorial
- primary CTA: Get Directions
- hero/final CTA fallback logic: truthful and direction-first
- preview/live release is blocked if project binding is missing
- live is blocked if QA warnings remain unless explicitly accepted

## Current Important Gaps

The main real gaps still relevant for this business are:

- no committed `.firebaserc`
- no active Firebase project bound by default
- the default canonical fallback still uses a legacy Firebase hostname unless `SITE_URL` / `--site-url` is set
- some mild repeated-phrase polish hints remain in copy
- no verified opening hours in the business package

## Why This Business Matters

The Dosa Spot is the best current example of:

- raw intake package
- normalized master record
- image pipeline
- assembly decisions
- QA output
- release flow

If you want to add another business, use this one as the reference case rather than guessing from older docs.
