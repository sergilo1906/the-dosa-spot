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

## Release validation

```bash
npm run check
npm run build
npm run preview
```

## Firebase deploy

This repo includes `firebase.json` and `.firebaserc.example`, but it does not commit a real Firebase project binding.

1. Copy `.firebaserc.example` to `.firebaserc`
2. Replace `your-firebase-project-id` with the real Firebase project id
3. Run `npm run check`
4. Run `npm run build`
5. Run `npm run deploy:firebase`

You can also deploy without `.firebaserc` by using:

```bash
firebase deploy --only hosting --project <your-firebase-project-id>
```

## Project notes

- Runtime images are served from `public/demo/restaurants/the-dosa-spot-real/`
- Source photo mapping is documented in `docs/presentation/the-dosa-spot-real-assets.md`
- The repo excludes local build outputs, preview logs, Lighthouse exports, and the reference ZIP from version control
