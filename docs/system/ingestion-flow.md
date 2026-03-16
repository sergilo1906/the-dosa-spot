# Ingestion Flow

## End-To-End Intake Flow

```text
Create business-input/<slug>/
-> fill intake.json
-> drop raw source files into maps/html/images/docs/notes
-> run ingest:manifest
-> inspect input-manifest.json warnings
-> clean or add missing source files
-> update normalized business files
-> let the existing adapter feed the app
```

## Step 1: Seed The Business

Create:

- `business-input/<slug>/intake.json`

This file is the minimum handshake with the system.

It should answer:

- what business this is
- what slug to use
- what type it is if known
- what maps link exists
- what commercial direction is already known

## Step 2: Drop Raw Inputs

Put files into the correct raw folders when possible.

Perfection is not required.

The manifest layer exists so the workflow still works if:

- HTML is missing
- filenames are rough
- only notes and images are available

## Step 3: Generate The Manifest

Run:

```bash
npm run ingest:manifest -- <slug>
```

This creates:

- `business-input/<slug>/normalized/input-manifest.json`

## Step 4: Read The Manifest

Use the manifest to see:

- what was detected
- what classification was guessed
- which inputs are missing
- whether the package is usable enough to keep moving

## Step 5: Normalize

Once the intake package is readable enough, add or refresh:

- `raw/notes/manual-profile.json`

Then run:

```bash
npm run normalize:business -- <slug>
```

This generates:

- `business-raw.json`
- `business-brief.json`
- `missing-data.json`
- `content-plan.json`
- `reconciliation-report.json`

inside `business-input/<slug>/normalized/`.

## Step 6: Render Stays Stable

The app still renders from the existing business adapter.

That means the new ingestion layer improves the front of the pipeline without forcing a UI or SEO refactor.
