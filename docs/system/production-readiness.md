# Production Readiness

## Verdict

The system is **usable with limitations** for serious work on new businesses.

That means:

- it is strong enough to process and publish another real business with discipline
- it is not yet strong enough to call fully production-ready for repeated multi-business operation without extra care

If this were a go / no-go review, the honest verdict would be:

- **go for controlled use**
- **not yet go for fast, low-supervision scale**

## Why This Is The Verdict

The system now has real structure across:

- intake
- normalization
- sector / visual / copy decision layers
- image processing
- assembly
- QA
- release
- documentation

That is real progress, and it is no longer just a handcrafted landing page.

But four limitations still matter too much to ignore:

1. only one real business is fully exercised end to end
2. runtime registration for a new business still requires manual code wiring
3. the default canonical site URL still falls back to a legacy hostname
4. release scripts still depend on `node --experimental-strip-types`

None of those make the system fake.
They do mean the system is not yet at the point where you should assume new businesses will slot in with low risk and little supervision.

## What Is Actually Ready

### Data model

The master-record structure is good enough for real use.
Raw, brief, missing-data, content-plan, image-map, sector, visual, copy, assembly, and QA outputs now have distinct roles.

### Intake and normalization

The intake package shape is clear and the normalization layer produces useful outputs instead of silent guesswork.
Missing fields and pending items stay visible, which is the right production behavior.

### Decision engines

Sector, visual, and copy engines are good enough to act as reusable guidance layers.
They are not "smart in every case," but they are explicit, inspectable, and safer than manual improvisation.

### Assembly and QA

Assembly is one of the strongest parts now.
It centralizes CTA, visibility, images, and degradation instead of scattering those choices through components.

QA is also meaningfully useful.
It catches real product mistakes, not just build failures.

### Release flow

Preview vs live is much clearer than before.
There are real safeguards against unsafe live deploys.

## What Is Only Partially Ready

### Multi-business operation

The system is conceptually multi-business, but operationally still closer to "single real business with reusable contracts."

Adding a second business is feasible.
Adding several businesses quickly would still be fragile.

### Image pipeline

The image pipeline is usable for production-reasonable selection and export.
It is still heuristic-heavy and conservative, especially outside food-led cases.

### Documentation

The docs are now good enough to onboard a careful operator.
They are not yet minimal enough to guarantee that every future contributor will always read the right thing first.

## What Is Still Fragile

### Real-world generalization

The biggest real unknown is not code style or docs.
It is whether the full pipeline behaves well on a second real business in another sector.

### Runtime registration

New businesses still need manual registration in:

- `src/data/business-records/`
- `src/data/business-records/index.ts`
- sometimes `src/data/preset-definitions.ts`

That is acceptable now, but it is still a production-friction point.

### Tooling/runtime assumptions

The current scripts assume:

- Node 22+
- `--experimental-strip-types`
- Windows-friendly image processing path

That is workable, but it is not a fully hardened cross-environment platform yet.

## Real Blockers

These are the only things I would treat as true blockers before calling the system production-ready in a stronger sense:

1. run the full pipeline on one non-restaurant real business
2. decide and set the final production domain so canonical defaults stop carrying legacy branding
3. replace `--experimental-strip-types` in release-critical scripts

## Not Blockers

These matter, but I would not stop serious use over them right now:

- copy polish hints
- archive/sample docs still present but clearly marked
- large shared `global.css`
- local-script-based release instead of CI/CD

## Recommendation

Do not open a big new architecture phase.

Run a **short Block 15 mini-phase only if you want stronger production confidence**:

1. onboard one second real business from a non-restaurant sector
2. lock the canonical production domain
3. replace experimental type-stripping in scripts
4. rerun release validation for both businesses

If you do that and the system still behaves cleanly, I would move the verdict from **usable with limitations** to **almost ready / controlled production-ready**.
