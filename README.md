# The Dosa Spot

Astro site for The Dosa Spot, prepared for Firebase Hosting with a production build in `dist/`.

## Stack

- Astro 5
- Tailwind CSS
- Anime.js
- Lenis
- Embla Carousel
- Firebase Hosting

## Main routes

- `/` main public landing
- `/demo/dosa-poster/` alternate presentation route
- `/demo/dosa-monolith/` compact alternate presentation route

Demo routes are `noindex` and excluded from the sitemap.

## Local development

Use Node `22+`.

```bash
npm install
npm run dev
```

## Documentation

Start with:

- [Docs Hub](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/README.md)
- [System Overview](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/system/system-overview.md)
- [New Business Guide](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/operations/new-business-guide.md)
- [The Dosa Spot Reference](C:/Users/Sergi/OneDrive/Escritorio/Webs/docs/businesses/the-dosa-spot.md)

## Release validation

```bash
npm run release:validate -- the-dosa-spot
```

This runs:

1. business preparation pipeline
2. `astro check`
3. `astro build`
4. product QA report generation

Release validation now scopes the build to the requested slug via `ACTIVE_BUSINESS_SLUG`, so `/` and shared SEO output are generated for the correct business instead of whichever preset happened to be globally default.

The QA report is written to `business-input/<slug>/normalized/qa-report.json` and `qa-report.md`.

## Release operations

Check the current release surface:

```bash
npm run release:status
```

Prepare data and render inputs for one business:

```bash
npm run release:prepare -- the-dosa-spot
```

Deploy a Firebase preview channel:

```bash
npm run deploy:preview -- the-dosa-spot <firebase-project-id>
```

Deploy live hosting only after review:

```bash
npm run deploy:live -- the-dosa-spot <firebase-project-id> confirm-live
```

If QA still has warnings, `deploy:live` is blocked unless you explicitly add `allow-warnings`.
Named options such as `--project`, `--channel`, `--expires`, and `--confirm-live` are also supported.

If you already know the final canonical domain, pass it explicitly:

```bash
npm run release:validate -- the-dosa-spot --site-url https://your-domain.example
```

If `--site-url` is omitted, the release workflow uses `SITE_URL`, `PUBLIC_SITE_URL`, or derives `https://<firebase-project-id>.web.app` during preview/live deploys.

## Firebase deploy config

This repo includes `firebase.json` and `.firebaserc.example`, but it does not commit a real Firebase project binding.

1. Copy `.firebaserc.example` to `.firebaserc`
2. Replace `your-firebase-project-id` with the real Firebase project id
3. Run `npm run release:validate -- the-dosa-spot`
4. Run `npm run deploy:preview -- the-dosa-spot <your-firebase-project-id>`
5. Run `npm run deploy:live -- the-dosa-spot <your-firebase-project-id> confirm-live`

You can also deploy without `.firebaserc` by using:

```bash
npm run deploy:preview -- the-dosa-spot <your-firebase-project-id>
```

or:

```bash
npm run deploy:live -- the-dosa-spot <your-firebase-project-id> confirm-live
```

## Project notes

- Runtime images are generated into `public/businesses/<slug>/images/`
- Refresh the current business image set with `npm run images:process -- <slug>`
- The Dosa Spot currently serves runtime assets from `public/businesses/the-dosa-spot/images/`
- Preview and live release docs live under `docs/system/`
- The repo excludes local build outputs, Firebase local binding, preview logs, Lighthouse exports, and the reference ZIP from version control
