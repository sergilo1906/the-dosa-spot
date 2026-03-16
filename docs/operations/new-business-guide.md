# New Business Guide

## Goal

Use this guide when you want to add a new business without breaking the existing one.

## 1. Create The Business Package

Create:

```text
business-input/<slug>/
|- intake.json
|- raw/
|  |- maps/
|  |- html/
|  |- images/
|  |- docs/
|  `- notes/
`- normalized/
```

Use [Input Structure](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/input-structure.md) for naming conventions.

## 2. Fill The Minimum Inputs

At minimum, make sure you have:

- business name
- slug
- niche
- city
- country
- maps link
- manual notes summary
- desired primary CTA if known
- some real images if the site needs visual proof

## 3. Run The Business Pipeline

```bash
npm run release:prepare -- <slug>
```

That runs:

1. input manifest
2. normalization
3. sector profile
4. image processing
5. visual profile
6. copy profile
7. assembly profile

## 4. Review The Normalized Outputs

Check:

- `business-input/<slug>/normalized/business-brief.json`
- `business-input/<slug>/normalized/missing-data.json`
- `business-input/<slug>/normalized/content-plan.json`
- `business-input/<slug>/normalized/image-map.json`
- `business-input/<slug>/normalized/assembly-profile.json`

You are looking for:

- wrong CTA direction
- wrong sector
- weak image choices
- too many missing fields
- misleading assumptions

## 5. Register The Business In Runtime

If this business should become a live/renderable business, wire it into:

- `src/data/business-records/<slug>/`
- `src/data/business-records/index.ts`
- `src/data/preset-definitions.ts` if it needs presets

This step is still manual today.
The system is reusable, but it is not zero-config multi-business runtime yet.

Do not reuse another business slug or overwrite an existing preset accidentally.

## 6. Run Validation

```bash
npm run release:validate -- <slug>
```

Review:

- `qa-report.json`
- `qa-report.md`

The release workflow now scopes the build to `<slug>` automatically, so the homepage and shared SEO output do not accidentally render another business while you validate.

## 7. Run Preview

```bash
npm run deploy:preview -- <slug> <firebase-project-id>
```

Use preview first. Do not go straight to live.

## 8. Before Live

Only after preview review:

```bash
npm run deploy:live -- <slug> <firebase-project-id> confirm-live
```

If QA still has warnings, live is blocked unless you explicitly accept them.

## Files You Will Usually Touch

- `business-input/<slug>/intake.json`
- `business-input/<slug>/raw/*`
- `business-input/<slug>/normalized/*`
- `src/data/business-records/*`
- `src/data/preset-definitions.ts`

## Files You Should Not Touch Lightly

- `src/lib/business/master-record.ts`
- `src/lib/assembly/engine.ts`
- `src/lib/qa/engine.ts`
- `src/lib/seo/site.ts`

Those are shared system contracts.
