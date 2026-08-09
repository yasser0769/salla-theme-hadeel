# T006 — Fresh-draft materialization and Twig return shapes

**Result: CAPTURED — fresh draft, not a proven fresh theme installation**

**Captured at**: 2026-08-09 03:41–03:48 UTC  
**Isolated preview branch**: `codex/preview-hdl-03-20260808` at `662eca99d68c9a946b4ae241485571bc92a8ca93`  
**Salla CLI**: 3.2.45
**Owner-confirmed draft**: `524850391`

## Required capture

T006 measures how a newly created disposable draft materializes Boolean,
String, single-choice Items, unset, and explicit-default values before and
after its first save. No supported Salla marker proves that the underlying
store is a fresh theme installation, so the evidence is intentionally scoped
to the draft lifecycle only.

## Evidence

The owner manually confirmed the branch in Partners Portal and supplied draft
`524850391`. Both captures contain `salla-draft-524850391`, English/LTR DOM,
the commit-specific Spike fixture, and six `localhost:8000` assets:

- `evidence/live/final-662eca99/migration-spike/fresh-english-draft-before-first-save.json`
- `evidence/live/final-662eca99/migration-spike/fresh-english-draft-before-first-save.png`
- `evidence/live/final-662eca99/migration-spike/fresh-english-draft-after-first-save.json`
- `evidence/live/final-662eca99/migration-spike/fresh-english-draft-after-first-save.png`

Before the first save, the editor displayed declared defaults while Twig
returned `null` for every new Spike ID. After the first save, Twig returned the
materialized values: Boolean `true`/`false`, default String, empty String,
single-choice Items scalar, companion mode `follow_preset`, and the conditioned
String default.

## Limit

No supported Salla metadata identifies the store as a fresh theme install.
The draft evidence therefore cannot establish install-age detection or prove
how an entirely new merchant installation differs from an upgraded merchant.
HDL-03 does not infer either behavior.

## Conclusion

Fresh-draft before/after-first-save materialization is **captured** and T006 is
complete. Fresh-install detection remains **not supported/not claimed**. The
implementation remains safe for both possibilities by keeping the preset
engine explicitly disabled until enrollment and validating every
missing/unknown value.
