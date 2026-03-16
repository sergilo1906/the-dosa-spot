# Copy Engine

## Purpose

The copy engine turns the current business record into a reusable set of writing rules.

It does not try to publish final copy on its own.

It decides:

- which tone should lead
- what each block is allowed to say
- how short or long each block should stay
- which CTA labels are valid
- which claims are forbidden
- how the copy should degrade when data is missing
- how the current business copy should be checked before reuse

## Inputs

The engine reads:

- `business-brief.json`
- `missing-data.json`
- `content-plan.json`
- `sector-profile.json`
- `visual-profile.json`

These inputs are combined in:

- [engine.ts](/C:/Users/Sergi/OneDrive/Escritorio/Webs/src/lib/copy/engine.ts)

## Outputs

The engine writes:

- `copy-profile.json`

For the live example:

- [copy-profile.json](/C:/Users/Sergi/OneDrive/Escritorio/Webs/business-input/the-dosa-spot/normalized/copy-profile.json)

## Main Decisions

### Tone selection

Tone is chosen from:

- sector tone priority
- sector engine tone hints
- brand tone hints from the brief
- visual family context

The output always contains:

- one primary tone
- up to three support tones
- short reasoning

### Block rules

Each visible block gets:

- a purpose
- audience intent
- tone preference
- preferred inputs
- proof types allowed
- length limits
- things to avoid
- forbidden claim areas
- degradation guidance

### Constraints

The engine also sets:

- max visible CTA count
- repetition window
- honesty rules
- forbidden claim list for the business

### QA checks

The engine checks sample text already present in the business record and flags:

- length overflow
- filler language
- forbidden claim patterns
- repeated phrases

## Current Script

Run:

```bash
npm run copy:analyze -- the-dosa-spot
```

This script reads the current normalized record and rewrites `copy-profile.json`.
