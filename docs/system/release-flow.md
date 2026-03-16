# Release Flow

## Goal

Keep release work short, repeatable, and hard to do wrong.

## Recommended sequence

For one business:

```bash
npm run release:prepare -- <slug>
npm run release:validate -- <slug>
npm run deploy:preview -- <slug> <firebase-project-id>
```

After manual review:

```bash
npm run deploy:live -- <slug> <firebase-project-id> confirm-live
```

## What each step does

### `release:prepare`

Runs the business pipeline in the right order:

1. input manifest
2. normalization
3. sector analysis
4. image processing
5. visual profile
6. copy profile
7. assembly profile

### `release:validate`

Runs:

1. `release:prepare`
2. `npm run check`
3. `npm run build`
4. `npm run qa:product -- <slug>`

It also blocks if:

- tracked sensitive files are detected
- the QA report contains errors

### `deploy:preview`

Runs `release:validate` first, then deploys to a Firebase preview channel.

Warnings are allowed here because preview exists to review unresolved but non-blocking issues safely.

### `deploy:live`

Runs `release:validate` first, then deploys to live hosting only if:

- `--confirm-live` is present
- Firebase project resolution succeeds
- QA warnings are cleared, or `allow-warnings` / `--allow-warnings` is explicitly passed

## Argument style

The most reliable npm form in PowerShell is:

```bash
npm run deploy:preview -- <slug> <firebase-project-id>
npm run deploy:live -- <slug> <firebase-project-id> confirm-live
```

Named forms like `--project`, `--site-url`, `--channel`, `--expires`, and `--confirm-live` are also supported.

You can also pass `--site-url <url>` when you want the build, canonical tags, and QA to target a specific production domain.

If `--site-url` is omitted, release scripts try to resolve it in this order:

1. `--site-url <url>`
2. `PUBLIC_SITE_URL`
3. `SITE_URL`
4. `https://<firebase-project-id>.web.app` when a project id is available

## Why QA runs after build

This system's QA reads built HTML in `dist/`, so product QA belongs after `astro build`, not before it.
