# QA Report Format

## Files

Each run generates:

- `qa-report.json`
- `qa-report.md`

## JSON Shape

High-level shape:

```json
{
  "schemaVersion": 1,
  "fileKind": "qa-report",
  "businessSlug": "the-dosa-spot",
  "generatedAt": "ISO date",
  "summary": {
    "checksRun": 0,
    "passed": 0,
    "errors": 0,
    "warnings": 0,
    "polish": 0,
    "manualReview": 0
  },
  "context": {
    "siteUrl": "",
    "routeSnapshots": [],
    "visibleSections": [],
    "heroCtas": [],
    "finalCtas": [],
    "imageSummary": {}
  },
  "checks": [],
  "manualReview": []
}
```

## Check Entry

Each check includes:

- `id`
- `category`
- `status`
- `severity`
- `title`
- `summary`
- optional `details`
- optional `paths`
- optional `route`

## Markdown Output

The Markdown report is meant for fast human review and groups results into:

- Errors
- Warnings
- Polish
- Passes
- Manual Review

## Intended Usage

The JSON report is for tooling, comparison, and future automation.

The Markdown report is for release review, preview review, and quick teammate handoff.
