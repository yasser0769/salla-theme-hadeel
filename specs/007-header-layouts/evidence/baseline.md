# HDL-07 Baseline — T004

**Captured at**: 2026-08-10T22:01:50Z (UTC)
**Branch**: `codex/hdl-07-header-layouts`
**HEAD SHA**: `e261352d8e3796f0e30ca3663de121368764d901`

All commands run from the repository root before any Phase-1 source edit.

## Guard

```bash
node scripts/check-theme.mjs --json
```

Exit `0`; `errors: 0`, `warnings: 0`. This matches the quickstart expected
baseline and is the count Phase 1 must not regress.

## Bundle / package

```bash
node scripts/check-bundle-budget.mjs --budget
```

Exit `0`, `0 error(s)`:

- Raw theme package: 2,078,795 B (telemetry).
- Compressed theme package: **478,773 / 1,000,000 B — PASS** (47.88%).
- Internal target: 950,000 B; remaining to target: 471,227 B.
- `public/`: 1,134,522 B raw / 209,186 B gzip-9 / 212,266 B deterministic ZIP
  (telemetry only).
- Pre-existing WARN (telemetry, unrelated to HDL-07, must not be hidden or
  expanded): raw per-file ratchet exceeded: `public/checkout.js` — ceiling
  11,727 B, actual 11,730 B, growth 3 B.

## Bundle sizes

```bash
wc -c public/app.css public/app.js
```

- `public/app.css`: **799,430 B**
- `public/app.js`: **116,474 B**

HDL-07 caps (plan.md): app.css ≤ 799,430 + 12,288 = 811,718 B;
app.js ≤ 116,474 + 4,096 = 120,570 B.

## Normalized CSS snapshot

```bash
node scripts/css-snapshot.mjs /tmp/hdl07-before.css.txt
```

`6772 rules -> /tmp/hdl07-before.css.txt`. This is the pre-change snapshot the
final CSS delta is diffed against (T041).

## Working-tree state at baseline

`git status --short --branch` showed the following **pre-existing, unrelated
changes that must be preserved** (not created by HDL-07):

Modified (pre-existing):

- `.specify/.runtime/hadeel-night-run.md`
- `.vscode/settings.json`
- `AGENTS.md`
- `ROADMAP.md` *(HDL-07 T001 edit: HDL-07 row status → implementing)*
- `docs/spec-kit/spec-index.json` *(HDL-07 T001 edit: HDL-07 status → implementing)*

Untracked (pre-existing): `.agents/`, `.claude/`, `.specify/.gitignore`,
`.specify/init-options.json`, `.specify/integration.json`,
`.specify/integrations/`, `.specify/memory/.constitution-template.json`,
`.specify/scripts/`, `.specify/templates/`, `.specify/workflows/`,
`MANIFEST.md`, `README-AR.md`, `docs/spec-kit/ALL-SPECS-COMBINED.md`,
`docs/spec-kit/COPY-INSTRUCTIONS.md`, `docs/spec-kit/FIGMA-WORKFLOW.md`,
`docs/spec-kit/FUTURE-BACKLOG.md`, `docs/spec-kit/IMPLEMENTATION-ORDER.md`,
`docs/spec-kit/PRODUCT-BLUEPRINT.md`, `docs/spec-kit/SPEC-CATALOG-AR.md`,
`docs/spec-kit/VALIDATION-REPORT.md`, `hadeel-speckit-complete.zip`,
`specs/006-motion-system/evidence/live/3231f1689829aba4c6a2a32184dca35f61a771ca/`,
`specs/006-motion-system/evidence/live/422d5f2a26a791b06dec1f3c901511d2d0ed2f30/`,
`specs/007-header-layouts/` (this feature directory),
`specs/008-…` through `specs/028-…` sibling feature directories.

Note: `public/` is clean at baseline (production build, in sync — guard
`--build` not yet run in this phase; static guard is 0/0).

## Dependency confirmation (T001 evidence)

- HDL-02: `done` (ROADMAP.md / spec-index.json).
- HDL-03: `done` — owner-approved; evidence index linked.
- HDL-04: `implemented @ 870c4b5b` — independent review PASS / BLOCKERS 0;
  complete four-way runtime acceptance is deferred by design to the HDL-07
  owner checkpoint (carried in the plan verification matrix).
- HDL-05: `done` — corrective review PASS / blockers 0.
- HDL-06: `done @ e261352d` — owner accepted; review PASS / blockers 0.

All HDL-07 dependencies are therefore complete to the level their approved
specs require before HDL-07 implementation. HDL-07 status moved to
`implementing` in `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and
`specs/007-header-layouts/spec.md` (T001).

## Spec/design gate confirmations (T002/T003 evidence)

- T002: `spec.md` contains no unintended `[NEEDS CLARIFICATION]` (grep: the
  only occurrence is the acceptance-criteria checklist line itself). HDL-08
  menu-content and HDL-09 search-result boundaries are pinned in spec.md §6
  ("يملك HDL-08 محتوى القائمة… يملك HDL-09 نتائج واقتراحات البحث؛ HDL-07 يملك
  موضع المشغّل وحالة shell المفتوحة فقط").
- T003: `design.md` records Figma Rev 1 approval: page `456:2`, review board
  `460:2`, Desktop component `457:202`, Mobile component `459:112`, reused
  HDL-02 primitive `389:61`, full state matrix (`460:40`…`461:229`), owner
  statement `APPROVE HDL-07 REV 1` dated 2026-08-11, and acceptance gate
  `460:411` (recorded in design.md by T003).

## Phase-0 Analyze remediation applied (before any source work)

1. spec.md §9 Figma checklist marked complete — the gate was already approved
   in Rev 1; completion note cites design.md node IDs and the owner statement.
2. spec.md §6 product decisions clarified: the scrolled header background uses
   the existing safe theme surface token (`--hadeel-surface`, defined in
   `storefront-system.scss`); HDL-07 adds **no** independent
   background-color setting, matching approved Rev 1.
3. spec.md §6 clarified: the preview SHA is a commit created only on the
   temporary isolated preview branch; no preview commit is created on the
   primary branch before owner acceptance.
