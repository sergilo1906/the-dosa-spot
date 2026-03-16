# Input Structure

## Goal

The intake layer is designed for messy real-world business capture.

It assumes:

- files may arrive in the wrong order
- not every source exists on day one
- images may be available before HTML
- notes may be the only truth for some fields at first

The structure should help organize that mess, not pretend the mess does not exist.

## Folder Layout

```text
business-input/<slug>/
|- intake.json
|- raw/
|  |- maps/
|  |- html/
|  |- images/
|  |- docs/
|  |- notes/
|- normalized/
   |- input-manifest.json
   |- business-raw.json
   |- business-brief.json
   |- missing-data.json
   |- content-plan.json
   |- reconciliation-report.json
   |- image-map.json
```

## Why This Layout

- `intake.json` holds the light manual seed.
- `raw/` holds real source material and imperfect operator files.
- `normalized/` holds the cleaned system files from block 2 plus the generated manifest from block 3.

This keeps source intake and system-ready data adjacent without mixing them.

## What Goes Where

### `intake.json`

Put here:

- business name
- slug
- niche if known
- primary category if known
- city and country if known
- maps link
- short manual summary
- desired CTA or tone hints if already decided

### `raw/maps/`

Put here:

- `maps-link.txt`
- `maps-overview.html`
- `maps-menu.html`
- `maps-reviews.html`
- `maps-info.html`

### `raw/html/`

Put here:

- website home HTML
- menu HTML
- service HTML
- copied exports from other public pages

### `raw/images/`

Put here:

- `logo.*`
- `hero-01.*`
- `dish-01.*`
- `interior-01.*`
- `exterior-01.*`
- `team-01.*`

The naming does not have to be perfect for the first import, but the manifest will warn when it is messy.

### `raw/docs/`

Put here:

- `menu.pdf`
- docs
- review summaries
- exported text
- support files

### `raw/notes/`

Put here:

- `notes.md`
- `manual-profile.json`
- decisions
- manual confirmations
- operator comments

## Naming Convention

Recommended:

- lowercase
- kebab-case
- explicit role-first names

Examples:

- `maps-link.txt`
- `maps-overview.html`
- `menu.pdf`
- `hero-01.jpg`
- `dish-01.jpg`
- `interior-01.jpg`
- `notes.md`

## Current Example

The live example is:

- [the-dosa-spot](C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot)
