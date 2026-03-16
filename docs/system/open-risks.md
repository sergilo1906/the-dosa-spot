# Open Risks

## Still Open

### 1. Final production domain is still undecided

- The system can now accept `SITE_URL`, `PUBLIC_SITE_URL`, or `--site-url`.
- The default fallback is still the legacy Firebase hostname.
- Until the real canonical domain is fixed, QA can still surface a release warning in some runs.

### 2. The release scripts still rely on `node --experimental-strip-types`

- This is workable on the current Node 22 setup.
- It is still a tooling dependency worth replacing later with a less experimental runtime path.

### 3. `src/styles/global.css` is still a very large shared surface

- Hardening did not split the stylesheet.
- That is still one of the biggest regression surfaces in the repo.

### 4. Real runtime coverage is still single-business

- The system is much more reusable than before.
- The only fully exercised real business package is still The Dosa Spot.
- The next real non-restaurant business will be the best test of the broader contracts.

### 5. Sample-era assets and references still exist

- Some sample SVGs and archive presentation docs remain on disk.
- They are now less misleading, but they still add repo surface area.

## Intentionally Accepted

These are not bugs right now; they are conscious tradeoffs:

- the assembly layer still owns a meaningful amount of presentational text
- copy polish hints are still allowed to exist as non-blocking QA polish items
- release stays local-script-based instead of adding CI/CD complexity immediately

## Safe Next Steps

If you want the next hardening pass to stay pragmatic, the best targets are:

1. decide the real production domain and make it the default site URL
2. replace `--experimental-strip-types`
3. test the full pipeline with one non-restaurant real business
4. split `global.css` only after the contracts stay stable through that second business
