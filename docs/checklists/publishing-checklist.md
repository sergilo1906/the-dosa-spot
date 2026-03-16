# Publishing Checklist

## Validation Gate

- `npm run release:validate -- <slug>`
- `npm run check` passed
- `npm run build` passed
- `qa-report.md` reviewed
- QA errors at `0`

## Preview Gate

- target Firebase project is explicit
- preview command prepared:

```bash
npm run deploy:preview -- <slug> <firebase-project-id>
```

- preview URL reviewed on desktop
- preview URL reviewed on mobile
- hero CTA checked
- final CTA checked
- key assets checked
- no obvious legacy branding leaks beyond accepted warnings

## Live Gate

- preview approved
- current warnings reviewed
- live command prepared:

```bash
npm run deploy:live -- <slug> <firebase-project-id> confirm-live
```

- if warnings remain, explicit decision made about `allow-warnings`
- canonical/domain decision reviewed
- no project confusion between preview and live

## Post-Deploy

- live URL opens
- main route opens
- 404 opens
- key asset opens
- latest build is the one deployed
