# Copy Validation

## Purpose

Copy validation is a lightweight QA layer.

It does not judge style like an editor would, but it catches the most common failure modes early.

## What It Checks

Defined in:

- [rules.ts](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/lib/copy/rules.ts)
- [engine.ts](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/lib/copy/engine.ts)

Current checks include:

- block length overflow
- filler phrasing
- forbidden claim patterns
- repeated phrases across sampled text
- FAQ utility

## Sample Source

The engine validates the text already present in the current business record, including:

- hero title, subheadline, and support
- CTA labels
- highlight summaries
- trust summary
- review signals
- gallery support line
- location focus
- FAQ questions and answers
- final CTA reason
- footer summary

## Severity Levels

- `error`: unsafe or misleading claim risk
- `warning`: too long or structurally weak
- `hint`: repetition, filler, or low-value phrasing

## Current Example

For The Dosa Spot the copy profile currently returns:

- `0 errors`
- `0 warnings`
- `2 hints`

Those hints come from repeated short phrases, not from fabricated or unsafe claims.

## Operating Rule

The validation layer is meant to protect honesty and clarity.

If a block fails because data is missing, the fix should usually be:

- simplify the copy
- reduce the block
- or suppress the claim

not invent extra language.
