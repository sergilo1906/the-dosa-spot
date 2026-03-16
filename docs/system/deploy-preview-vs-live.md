# Deploy Preview vs Live

## Preview deploy

Use preview when you want a safe review URL without touching production.

Command:

```bash
npm run deploy:preview -- <slug> <firebase-project-id>
```

Behavior:

- runs full validation first
- creates a Firebase Hosting preview channel
- does not overwrite live hosting
- allows QA warnings so review can continue

If no channel id is passed, the script generates a short one automatically.

## Live deploy

Use live only after preview review is accepted.

Command:

```bash
npm run deploy:live -- <slug> <firebase-project-id> confirm-live
```

Behavior:

- runs full validation first
- requires explicit confirmation
- blocks if no Firebase project is resolved
- blocks if QA still has warnings unless `allow-warnings` or `--allow-warnings` is passed

## Project resolution

Preview and live deploys resolve Firebase project id in this order:

1. `--project <id>`
2. `FIREBASE_PROJECT_ID`
3. local `.firebaserc`

`.firebaserc.example` is documentation only and is not used automatically.

## Site URL resolution

Build and QA also need a canonical site URL. The release workflow resolves it in this order:

1. `--site-url <url>`
2. `PUBLIC_SITE_URL`
3. `SITE_URL`
4. `https://<firebase-project-id>.web.app`

That keeps `astro.config.mjs`, SEO tags, QA, and deploy intent better aligned during preview and live runs.

## Current real state

In the current workspace:

- Firebase auth is available
- no real `.firebaserc` is committed
- there is no active project in the repo by default

So deploys should use `--project <id>` unless you create a local `.firebaserc`.

## Shell-safe note

The release script also accepts named flags, but the most reliable npm form in PowerShell is the positional one shown above.
