# Repo and Artifacts

## Tracked on purpose

- `src/` application code
- `scripts/` operational and pipeline scripts
- `docs/system/` system documentation
- `business-input/<slug>/normalized/` normalized business outputs and reports
- `public/businesses/<slug>/images/` runtime-ready business assets

## Local-only or ignored

- `dist/`
- `.astro/`
- `.firebase/`
- `.firebaserc`
- `.env*`
- logs and Lighthouse exports
- reference ZIP and local image folders already excluded by `.gitignore`

## Business-specific operation

The system is operated per business slug:

- inputs: `business-input/<slug>/raw/`
- normalized outputs: `business-input/<slug>/normalized/`
- runtime images: `public/businesses/<slug>/images/`

All release commands take `<slug>` so the workflow does not stay hardcoded to one business.

## Git / GitHub hygiene

- keep local Firebase binding out of git
- do not track secrets or env files
- use `git status --short` before pushing
- use `npm run release:status` to inspect repo/deploy readiness quickly

## Current repo reality

- GitHub remote is configured
- GitHub auth is available locally
- Firebase auth is available locally
- Firebase project binding is still local/manual by design
