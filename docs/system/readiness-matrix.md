# Readiness Matrix

| Area | Current state | Preparation level | Risk | Real blocker | Recommendation | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| Data model | Clear layered contract with distinct normalized artifacts and shared validation | Strong | Medium | No | Keep contract stable and exercise it with a second real business | Medium |
| Ingestion | Practical package structure and manifest generation exist | Strong | Medium | No | Add more real messy source sets to validate naming tolerance | Medium |
| Normalization | Produces usable brief, missing-data, and content-plan with explicit states | Strong | Medium | No | Expand coverage with more varied source mixes | Medium |
| Sector engine | Explicit, inspectable, and reusable for core local-business categories | Strong | Medium | No | Validate against a non-food business before trusting it broadly | Medium |
| Visual engine | Family selection and fallbacks are coherent and reusable | Moderate | Medium | No | Test with a second sector and weaker image sets | Medium |
| Copy engine | Good constraints, honesty rules, and block-level guidance | Moderate | Medium | No | Treat as controlled rule layer, not autonomous final copy | Medium |
| Image pipeline | Useful for scoring, export, and role selection | Moderate | Medium-high | No | Test on non-food imagery and confirm Windows dependency strategy | Medium |
| Assembly | Centralized and one of the cleanest parts of the system | Strong | Low-medium | No | Keep new render logic flowing through assembly, not sections | Medium |
| QA | Detects meaningful product and release issues beyond build failures | Strong | Medium | No | Keep manual review for visual comfort and crop judgment | Medium |
| Release | Clear preview/live flow with guards and checklists | Moderate | Medium-high | Yes | Remove experimental runtime dependency and lock canonical domain | High |
| Docs | Good enough to operate without chat history in a careful workflow | Moderate-strong | Medium | No | Keep entry docs current and avoid doc sprawl | Medium |
| Multi-business readiness | Reusable in design, lightly proven in reality | Partial | High | Yes | Prove the system with one non-restaurant real business | High |

## Readiness Scale

- **Strong**: ready for serious controlled use
- **Moderate**: usable, but still needs operator judgment
- **Partial**: architecture points in the right direction, but proof is still thin

## Bottom Line

The system is strongest in:

- data contracts
- assembly
- QA
- structured release flow

The system is least proven in:

- multi-business operation
- cross-sector generalization
- release/runtime hardening outside the current local environment
