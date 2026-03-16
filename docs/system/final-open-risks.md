# Final Open Risks

## Production-Critical

### 1. Canonical domain is still not locked

- Current default fallback still uses the legacy Firebase hostname.
- This is already surfaced by QA as a warning.
- Risk: release can still ship with technically valid but semantically wrong canonical identity.

### 2. Release-critical scripts still use `node --experimental-strip-types`

- This is acceptable in the current machine and Node version.
- It is not the ideal base for a more production-hardened operational flow.
- Risk: environment sensitivity and future maintenance friction.

### 3. The system is still only proven on one real business

- The Dosa Spot is a strong reference case.
- It is not enough proof for strong multi-business confidence.
- Risk: hidden assumptions survive until the second real onboarding.

## Important But Not Blocking

### 4. Runtime registration is still manual

- New businesses still require code registration, not just dropping files into `business-input/`.
- Risk: onboarding friction and operator error, not a core architectural failure.

### 5. Image pipeline remains heuristic-heavy

- The current approach is pragmatic and honest.
- It is still more reliable for food-led imagery than for broader business categories.
- Risk: weaker automatic selection quality on other sectors.

### 6. Large CSS surface remains

- `src/styles/global.css` is still a large shared regression surface.
- Risk: accidental visual regressions when touching shared styling.

## Deliberately Accepted Tradeoffs

- release is local-script-based instead of CI/CD-heavy
- copy polish hints remain non-blocking
- archive/sample material still exists where it is clearly marked
- assembly still owns some presentation text to keep the render practical

## What I Would Not Prioritize Yet

Do not spend the next pass on:

- a large CSS refactor
- CI/CD expansion
- removing every archive or sample artifact
- over-automating runtime registration before a second real-business test

## Best Next Move

If the goal is stronger production confidence with minimal waste, the next sequence should be:

1. add one second real business from a non-restaurant sector
2. lock the production domain
3. remove `--experimental-strip-types`
4. rerun release validation for both businesses
