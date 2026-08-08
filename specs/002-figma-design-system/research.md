# Research: HDL-02 Figma Design-System Governance

**Feature**: HDL-02 · **Date**: 2026-08-08 · **Approved design**: Revision 2
**Repository baseline**: `9e22771b21e85ea3b4aee847946ad4574683d02d`

All planning unknowns are resolved. This file records decisions; it does not expand HDL-02 into
storefront implementation or complete page design.

## R-001 — Implementation boundary

- **Decision**: implement HDL-02 as an auditable design-governance evidence packet and a
  downstream handoff contract. Do not edit theme source, build output, settings, locales, or
  dependencies.
- **Rationale**: Revision 2 already contains the in-scope visual build: foundations, nine
  component sets, registries, matrices, QA gate, and parity specimens. The approved spec
  explicitly excludes Twig/SCSS/JS and `twilight.json` changes.
- **Alternatives considered**: implement matching storefront components now (rejected as work
  owned by HDL-03…HDL-23); end the spec at Figma approval with no implementation evidence
  (rejected because later specs need a stable, reviewable contract).

## R-002 — Contract boundary for later specs

- **Decision**: publish `contracts/visual-spec-handoff.md` as the interface exposed to every
  later visual spec.
- **Rationale**: FR-010 defines a real cross-spec interface: naming, node registration, coverage,
  approval, deviation logging, and reopen behavior. A contract prevents each spec from
  reinterpreting those rules.
- **Alternatives considered**: rely only on narrative in `design.md` (rejected as difficult to
  validate consistently); create a runtime API/schema (rejected because the interface is
  governance, not software execution).

## R-003 — Salla color and font evidence

- **Decision**: treat `theme.color.*` and `theme.font.*` as Salla runtime properties and
  `use_theme_font` as the existing Hadeel setting. Do not invent `color_primary` or `font`
  setting records in `twilight.json`.
- **Rationale**: `master.twig:82-91` consumes the runtime objects, while `twilight.json` declares
  the `color` and `fonts` features and contains `use_theme_font`; exact setting lookup shows no
  custom `color_primary` or `font` IDs.
- **Alternatives considered**: model both as theme setting IDs (rejected by repository evidence);
  hardcode Figma sample values into production (rejected because the merchant owns them).

## R-004 — Runtime parity and accessibility claims

- **Decision**: Revision 2 proves visual intent and governance only. It must not be described as
  proof of rendered DOM direction, keyboard order, ARIA, or Lighthouse results.
- **Rationale**: HDL-02 changes no storefront code. The constitution requires rendered Salla
  evidence for behavioral claims, and HDL-04 plus consuming specs own that validation.
- **Alternatives considered**: run a current storefront preview and infer compliance (rejected
  because the existing theme has not implemented Revision 2); cite the local Figma screenshots
  as runtime proof (forbidden by the evidence policy).

## R-005 — Build, preview, and performance gates

- **Decision**: record production build and rendered preview as `N/A — no source change`, enforce
  a `0 B / 0 request / 0 runtime` delta, and run `node scripts/check-theme.mjs --build` only as a
  final repository drift regression check.
- **Rationale**: building into `public/` is unnecessary for documentation and could create noise;
  the guard safely verifies committed output against a fresh production build. Any source diff
  automatically invalidates the N/A decision and activates the full build/preview matrix.
- **Alternatives considered**: run and commit a production build with no source changes
  (rejected as unnecessary churn); skip all repository checks (rejected because public drift or
  accidental source scope still must be detected).

## R-006 — Figma traceability constraints

- **Decision**: use file/page/root IDs, direct node links, WEB variable syntax, and the repository
  approval record as the canonical traceability chain.
- **Rationale**: Code Connect has no existing 1:1 repository declarations and the available
  Figma environment lacks the required seat; named version-history save is unsupported. Both
  constraints are recorded and neither prevents deterministic node/revision identity.
- **Alternatives considered**: claim Code Connect coverage (rejected as false); block HDL-02 on a
  tool/seat feature not required by the spec (rejected as disproportionate).

## R-007 — Approval semantics

- **Decision**: the owner's exact statement `APPROVE HDL-02 REV 2` is the authoritative approval
  of Revision 2 and is normalized in `design.md` as “Approved for Implementation — Revision 2”. Any material visual,
  behavioral, responsive, directional, text, variant, or setting change reopens the gate.
- **Rationale**: the statement uniquely identifies the spec and revision and was supplied at the
  defined Human Gate. Revision 1 remains Superseded.
- **Alternatives considered**: require the owner to repeat a second synonymous phrase (rejected
  as an unnecessary Human Gate); allow documentation approval to float to later revisions
  (rejected by FR-007).

## R-008 — Deliverable and ownership

- **Decision**: Kimi K3 High owns creation/fixes of `design-system-report.md`; GPT-5.6 Sol High
  owns plan/tasks/analyze/final review while Claude is unavailable. Approved `spec.md` and
  `design.md` are inputs, not implementation work products.
- **Rationale**: this preserves the owner's model routing and gives the no-code implementation a
  concrete, independently reviewable output.
- **Alternatives considered**: let implementation rewrite approved design artifacts (rejected
  because it could silently change intent); have the planner self-certify the final report
  (rejected because review must remain independent).
