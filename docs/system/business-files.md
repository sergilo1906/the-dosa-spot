# Business Files

## Folder Convention

Each business record now lives under:

```text
business-input/<business-slug>/
|- intake.json
|- raw/
|  |- maps/
|  |- html/
|  |- images/
|  |- docs/
|  |- notes/
|- normalized/
   |- business-raw.json
   |- business-brief.json
   |- missing-data.json
   |- content-plan.json
   |- image-map.json
   |- input-manifest.json
```

Current implemented example:

- [intake.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/intake.json)
- [business-raw.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/business-raw.json)
- [business-brief.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/business-brief.json)
- [missing-data.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/missing-data.json)
- [content-plan.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/content-plan.json)
- [image-map.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/image-map.json)
- [input-manifest.json](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/input-manifest.json)

## File Roles

### `business-raw.json`

Use this file for:

- facts captured from research
- sources and notes
- loose offer and trust inputs
- field state tracking
- asset inventory references

Do not use this file as final render input.

### `business-brief.json`

Use this file for:

- normalized business identity
- location and contact
- offer blocks
- clean FAQs
- trust summary
- brand voice
- local SEO fields

This is the bridge between intake and rendering.

### `missing-data.json`

Use this file to explain:

- what is missing
- what is only inferred
- what is pending confirmation
- what is in conflict

Every important gap should have:

- a path
- a state
- a severity
- a reason
- an impact
- a recommended action

### `content-plan.json`

Use this file for editorial and conversion intent:

- CTA hierarchy
- section priorities
- messaging focus
- conversion goal
- fallback rules

This is not raw data, and it is not UI code. It is the planning layer in between.

### `image-map.json`

Use this file for asset decisions:

- which image is hero-ready
- which image is just backup
- which image should be discarded
- what alt text to use
- what future crops are useful

## Loader Entry Points

Business-record helpers:

- [index.ts](C:/Users/Sergi/OneDrive/Escritorio/Webs/src/data/business-records/index.ts)
- [master-record.ts](C:/Users/Sergi/OneDrive/Escritorio/Webs/src/lib/business/master-record.ts)
- [manifest.ts](C:/Users/Sergi/OneDrive/Escritorio/Webs/src/lib/ingestion/manifest.ts)

Current runtime business entry point:

- [index.ts](C:/Users/Sergi/OneDrive/Escritorio/Webs/src/data/businesses/index.ts)

## Practical Rule

If a future block needs to change business truth, start in the JSON files first.

Only change the render-facing TypeScript adapter when:

- a new field must be exposed to the existing app
- a new validation rule must be enforced
- a new derived mapping is needed
