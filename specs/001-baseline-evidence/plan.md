# Implementation Plan: خط الأساس وخريطة الموجود والأدلة (Baseline, Existing-Capability Map, and Evidence)

> **HISTORICAL BASELINE — publishing interpretation superseded 2026-08-10.** Raw
> measurements and the recorded decisions remain evidence of the HDL-01 execution; the
> raw-1MB comparison and former 85% target are not current policy. HDL-05 now gates a
> deterministic compressed distributable-theme estimate.

**Branch**: `codex/hdl-01-baseline-evidence` | **Date**: 2026-08-08 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-baseline-evidence/spec.md`  
**Roadmap ID**: `HDL-01`  
**Design handoff**: [design.md](design.md) — Revision 1, **Approved for Implementation** (Yasser, 2026-08-08, `APPROVE HDL-01 REV 1`)  
**Baseline commit**: `66b7b69e3117235c8a614a0502de21ca928e227e`  
**Comparator**: `origin/master` at `833f19d0` (`git rev-list --left-right --count origin/master...HEAD` → `0 38`)

## Summary

HDL-01 produces **exactly one documentation artifact** and changes no code.

**Deliverable (filename decided by this plan):**

```text
specs/001-baseline-evidence/baseline-report.md
```

That single file is the whole implementation. It records, against the named commit and with a
reproducible command beside every number: the 29-row roadmap classification, the
source-to-`public/` capability map, verbatim build and guard results, bundle measurements
against Salla's published ceiling, the accepted-evidence policy, the launch-ranked risk list
with owners, the remote branch inventory, and the owner-bounded Theme Raed relationship
baseline.

**Approach — preserve the existing shared core by not touching it.** HDL-01 is a *read* pass.
The Hadeel shared core (`src/views/layouts/master.twig`, `src/assets/styles/app.scss`,
`src/assets/js/partials/product-card.js`, `twilight.json`, `src/locales/*.json`) is inventoried
and classified, never edited. Every capability is classified under Constitution VII before any
later spec is allowed to rebuild it — which is the entire point of running HDL-01 first.

**Expected bundle / network / source impact: zero.** Kimi's sole implementation deliverable is
`baseline-report.md`; no file under `src/`, `public/`, `package.json`, `pnpm-lock.yaml`, or
`twilight.json` changes. The orchestrator separately owns lifecycle metadata: the runtime-log
entries before/after the Kimi window and the post-acceptance `ROADMAP.md` / spec-index status
updates. Those documentation/governance writes are explicitly listed in tasks and do not alter
the zero runtime/source delta. `design.md` and `spec.md` are frozen before the Kimi window, with
their hashes checked by [quickstart.md](quickstart.md) §5.

**Owner decision preserved verbatim.** Per `DECISION HDL-01` (Yasser, 2026-08-08,
`docs/spec-kit/DECISION-LOG.md`): HDL-01 records only a **concise, reproducible Theme Raed
relationship baseline** (five items, §Relationship Baseline below). A **feature-by-feature
comparison is forbidden in HDL-01**. The full product/visual/experience/capability distinctness
audit is the **blocking release gate `HDL-29-FR-011`** and is not performed, previewed, or
pre-judged here.

## Design Gate Check *(blocking)*

- [x] `design.md` contains approved Figma page and Node IDs, or this is a documented non-visual feature.
      → Figma file `12z0jRutTHcdhlZQrRmcXU`, page `00 · HDL-01 Baseline & Evidence` (`359:2`),
      board `HDL-01 / Board / Rev 1` (`359:3`), 1440×5016. Gate type is
      **documentation/QA**, which `spec.md` §9 records as the applicable type for a non-UI deliverable.
- [x] Owner wrote **Approved for Implementation**.
      → `design.md` §الموافقة: `APPROVE HDL-01 REV 1` — **Approved for Implementation**, Yasser, 2026-08-08, Revision 1.
- [x] Arabic mobile, Arabic desktop, critical English/LTR, and required states are covered.
      → **Not applicable, and explicitly recorded as such** in `spec.md` §9 and `design.md` §Node IDs:
      HDL-01 produces no storefront surface, so there are no mobile/desktop/LTR/state frames to
      approve. The exemption is bound to the documentation/QA gate type only; any spec that
      produces a customer-facing surface restores all four items in full. The *current* RTL/LTR
      posture is instead captured as a measured baseline for HDL-04 to consume (FR-006 row 4).
- [x] Any Salla feasibility unknown is marked as Spike/research, not assumed.
      → Two unknowns, both carried as research entries, not facts: (a) whether Salla's 1 MB
      ceiling is measured the same way this plan measures `public/` (research.md R-004);
      (b) live Salla preview parity, which is **not an acceptance condition here** because no
      source changes (research.md R-006).

## Technical Context

**Platform**: Salla Twilight theme (server-rendered Twig + Salla-hosted `salla-*` Stencil components)  
**Source of truth**: `src/` and repository docs; generated `public/` is build output  
**Build**: `npx webpack --mode production` — measured verbatim; **re-run for verification uses
`--output-path "$(mktemp -d)"`** so `public/` is never rewritten (see research.md R-003)  
**Guard**: `node scripts/check-theme.mjs --build` — safe to re-run as-is; it builds into a
temp dir (`scripts/check-theme.mjs:319`) and only *compares* against `public/`  
**Target pages**: None. The deliverable is a Markdown report; the *subject* of the inventory is
the full template set — 21 page templates under `src/views/pages/` and 22 component templates
under `src/views/components/`.  
**Existing implementation**: `specs/001-baseline-evidence/` currently holds `spec.md`,
`design.md`, `spec-input.md`. No report file exists yet. Classification of HDL-01 itself:
**Existing — Audit & Polish** (the theme exists and is being audited; the report is the polish artifact).  
**Salla APIs/components**: 58 distinct `salla-*` tags referenced across `src/`; API surface as
recorded in `docs/salla-twilight-notes.md` (read from `@salla.sa/twilight*` `^2.14.531` in
`node_modules`). HDL-01 **calls no API and adds no component** — it cites this file as the
inventory reference for the capability map.  
**Testing**: No automated test is added. Validation is (1) the repository guard, unchanged and
still green, (2) the report-validation checklist in quickstart.md §4, which is itself a list of
runnable commands, (3) `git status --porcelain` proving zero source impact.  
**Performance goals**: **Δ = 0 bytes, Δ = 0 requests, Δ = 0 ms.** HDL-01 ships no runtime asset.
The *baseline* it records: `public/` = 1,557,969 B (1,521.5 KiB); `app` entrypoint = 909 KiB;
`app.css` = 802,732 B; `app.js` = 128,388 B; 3 webpack performance warnings.  
**Accessibility goals**: **Not applicable as a target** (no rendered surface). Recorded as a
*measured gap*: no Lighthouse accessibility run exists at this commit, which is itself the
baseline finding handed to HDL-04/HDL-05 (FR-006 row 4).  
**Localization**: The report is an **internal owner-facing document and adds zero locale keys**
(`spec.md` §12). It is written **Arabic-first** to match `spec.md`/`design.md` and User Story 1
("يفتحه ياسر دون فتح الكود"), with identifiers, paths, commands, SHAs and numbers left in
Latin/ASCII so they stay copy-pasteable (research.md R-005). Measured locale baseline it
records: `src/locales/ar.json` = 86 leaf keys, `src/locales/en.json` = 86 leaf keys, zero
missing on either side.  
**Scale/scope**: 1 output file; 29 roadmap rows; 7 `HDL-01-FR-*` sections; 3 user stories;
13 build outputs (12 JS entries + `app.css`); 45 `twilight.json` settings (8 static, 37
interactive); 7 declared custom components; 10 remote refs total (including the symbolic
`origin`/HEAD alias and `upstream/master`).

## Constitution Check *(GATE)*

Evaluated against `.specify/memory/constitution.md` v1.0.0. **Implementation-process result:
PASS, zero exceptions for this documentation-only change. Project public-release readiness:
FAIL** because the inherited published bundle is above the constitutional/Salla ceiling.
Re-evaluated after Phase 1 design (below) with the same split verdict.

- [x] **I. Conversion > customization > polish.** HDL-01 changes no customer-facing surface, so
      it cannot obscure price, availability, options, or checkout. It *serves* priority 1 by
      forcing every later spec to know what exists before spending effort.
- [x] **II. One Salla theme and one shared core.** No new theme, no app, no fork, no parallel
      layer. The report's explicit job (FR-002, FR-007) is to make duplicated implementations
      visible so they are not created — see User Story 2.
- [x] **III. Components by responsibility; layouts are variants when data/behavior match.**
      No component is added or split. The capability map records current responsibility per
      source path so later specs can judge variant-vs-new-component from evidence.
- [x] **IV. Mobile/Arabic first with RTL/LTR parity.** No new surface to test. The report is
      Arabic-first (R-005). Current RTL/LTR state is captured as a baseline for HDL-04, and the
      86/86 locale parity is recorded as measured, not assumed.
- [x] **V. HDL-01 runtime delta passes; the project public-release budget remains FAILED.**
      HDL-01's own delta is **zero** because it adds only a Markdown report. The inherited
      `public/` total is nevertheless 1,521.5 KiB against a 1 MB public ceiling, so Constitution
      V's release gate is not satisfied. The report records and assigns remediation to HDL-05;
      no public release may occur until that gate passes or the owner approves a temporary,
      documented exception with owner, scope, expiry, and removal plan. HDL-01 requests no such
      exception and does not reinterpret an inherited overage as a passing release gate.
- [x] **VI. Figma/GitHub/Salla preview evidence chain is preserved.** Figma Rev 1 approved;
      GitHub commit `66b7b69e` is the code reference for every number; Salla preview is recorded
      as **not applicable as acceptance evidence for this spec only**, with its availability
      status logged instead, and the requirement reinstated in full at the first source change
      (`spec.md` §10).
- [x] **VII. Existing code is audited before build work.** This *is* the audit. FR-007 forbids
      rebuilding anything before it is classified, and the whole 29-row classification exists to
      enforce that on HDL-02…HDL-29.
- [x] **VIII. Independent identity, truthful commerce, localization, secure defaults.** The
      identity risk is recorded with measured evidence and a named owner, and the bounded
      relationship baseline is exactly what Principle VIII needs to become auditable. No Kalles
      or Raed code, asset, text, or identity is copied into the report — only commit SHAs, tree
      hashes, paths, and counts. No fabricated numbers: every figure carries its producing command.
- [x] **Any exception is documented with owner, expiry, and remediation.** **No exception is
      requested.** See Complexity Tracking.

**Gate verdict:** PASS to implement the documentation-only baseline; **FAIL for public release**
until HDL-05 remediates the bundle/performance gate (or the owner records a compliant temporary
exception). No exception is requested by HDL-01.

## Existing-Code Reuse Map

HDL-01 **reuses by reading**; the "Reuse/change" column is `read-only` for every row by
construction, because the spec's Definition of Done forbids source changes.

| Requirement | Existing files/components | Classification | Reuse/change |
|---|---|---|---|
| **HDL-01-FR-001** — complete repository register + 29/29 roadmap rows | `src/views/pages/**/*.twig` (21), `src/views/components/**/*.twig` (22), `twilight.json.components` (7), interactive `twilight.json.settings` where `type != "static"` (37), `ROADMAP.md` (29 rows), `docs/spec-kit/spec-index.json` | Existing — Audit & Polish | Enumerate the four source sets completely, with state/source/responsibility on every record; count and explain the 8 excluded static separators. Separately assign one primary classification per roadmap row under R-002. Compound index values remain an open discrepancy and are not fixed here. |
| **HDL-01-FR-002** — feature → source → build output | `src/views/pages/` (21), `src/views/components/` (22), `src/assets/js/` (24 files), `src/assets/styles/` (42 `.scss`), `webpack.config.js:11-24` (12 entries), `public/` (13 built JS/CSS) | Existing — Audit & Polish | Read `webpack.config.js` entry map and `public/` file sizes. **`public/` is never hand-edited** (AGENTS.md rule 1). Twig and locale files map to **no** `public/` output — Salla renders them server-side — and the report states that explicitly rather than leaving a blank cell. |
| **HDL-01-FR-003** — verbatim build + guard results | `scripts/check-theme.mjs`, `webpack.config.js`, `.github/workflows/verify-production-bundle.yml` | Existing — Audit & Polish | Run guard read-only; cite the production build already measured at this exact SHA. Contradiction between `AGENTS.md` ("currently reports pre-existing errors") and the measured `0 errors / 0 warnings` is recorded as an **open discrepancy owned by HDL-05** — FR-003 forbids fixing it inside HDL-01. |
| **HDL-01-FR-004** — bundle size, confirmed vs needs-Salla-confirmation | `public/` (1,557,969 B), `docs/building-a-salla-theme.md:27` (public 1 MB / private 2 MB) | Existing — Audit & Polish | Measure `public/` byte total as the comparable number; record the webpack `app` entrypoint (909 KiB) **separately** as a build-tool signal, not a platform limit. Whether Salla measures the same way is marked **unconfirmed** (R-004). |
| **HDL-01-FR-005** — accepted-evidence policy per change type | `AGENTS.md` §Definition of done + §Evidence rules, Constitution VI, `docs/salla-twilight-notes.md` §6 | Existing — Audit & Polish | Consolidate the rules that already exist into one table, including the two cases the spec demands: **"no visual evidence required"** for invisible changes and **"Salla preview unavailable"** with its temporary substitute. |
| **HDL-01-FR-006** — launch-ranked risks with owners | Measured: `public/` overage; `src/views/layouts/master.twig:97` body class `theme-raed`; 6 `raed/preview-images/*` paths in `twilight.json`; 14 Raed references in `README.md`; `twilight.json` description = "fashion theme" vs blueprint's general marketplace; 5 pending dependabot branches | Existing — Audit & Polish | Record each with its measured evidence, owning spec, and blocks-public-launch flag. Identity risk → **HDL-29 via `HDL-29-FR-011`**; HDL-01 records and does not remediate. |
| **HDL-01-FR-007** — no rebuild before classification | Constitution VII; `AGENTS.md` §Regressions | Existing — Audit & Polish | Stated as a standing rule in the report and enforced by FR-001 coverage: a row without a classification is a row no spec may start building. |

## Salla Feasibility & Research

| Question | Official evidence / installed API / storefront spike | Decision | Fallback |
|---|---|---|---|
| Is `public/` size the number comparable to Salla's ceiling? | `docs/building-a-salla-theme.md:27` — "Public themes: **1 MB max.** Private themes: **2 MB.**" | **Confirmed** as the comparable artifact | Record the webpack entrypoint number separately and label it a build-tool signal |
| Does Salla measure that 1 MB the way we do (raw bytes? `du` allocation? MB=10⁶ or MiB=2²⁰? pre- or post-publish transform?) | No Salla document in-repo states the method. Local spread is real: raw total 1,557,969 B vs `du -sk` 1,604 KiB | **Unconfirmed — carried as a Spike for HDL-05** | Report both raw bytes and `du`, plus the overage under both MB=10⁶ (155.8%) and MiB=2²⁰ (148.6%). The overage verdict is identical under every interpretation, so the decision is safe while the method stays unconfirmed |
| Can a production build be re-measured without rewriting `public/`? | `webpack.config.js:25-29` sets `output.clean: true` on `public()`; `scripts/check-theme.mjs:319-321` already builds to `mkdtempSync(...)` with `--output-path` | **Confirmed** | Verification re-runs use `npx webpack --mode production --output-path "$(mktemp -d)"`; `node scripts/check-theme.mjs --build` is safe unmodified |
| Is a live Salla preview required to accept HDL-01? | Constitution VI (preview = acceptance env for *visual/behavioral change*); `spec.md` §10 (not applicable, no `src/`/`public/` change); Salla CLI `3.2.45` authenticated, theme `224400990` status `development` | **Not applicable to this spec**; availability status is recorded instead | Requirement returns in full at the first source change, and such a change moves to its owning spec |
| Does HDL-01 expose any external interface needing a contract? | No new `twilight.json` setting, no locale key, no `salla-*` usage, no CLI, no DOM/template contract, no HTTP surface | **No — `contracts/` intentionally not created** | If a later HDL-01 revision were ever to emit a machine-readable index, that would be a new interface and would require `contracts/` |
| Do 18 compound classifications in `spec-index.json` override FR-001's "exactly one"? | Constitution §Governance precedence: constitution → owner-approved spec + clarifications → plan → tasks. `spec-index.json` is a generated index, not an owner-approved spec | **No — FR-001 wins**; report assigns one primary, logs the divergence | Divergence table names a proposed owner; HDL-01 modifies neither `spec-index.json` nor `ROADMAP.md` |

## Settings Architecture

| Setting | Owner (global/component) | Basic/Advanced | Default | Conditions | Locale keys |
|---|---|---|---|---|---|
| None | — | — | — | — | — |

**Not applicable by owner decision.** `spec.md` §6: HDL-01 adds no merchant setting and does not
edit `twilight.json`; settings architecture is owned by HDL-03. `twilight.json` enters this
feature only as **read material** for the inventory. Baseline recorded for HDL-03 to consume:
**45 setting records (8 static, 37 interactive)**, and all 37 interactive IDs are read by at
least one template with **no undeclared reads** — consistent with the guard's `theme-settings`
check reporting `ok` at this commit.

## Bundle, Network, and Runtime Budget

- **Baseline bundle**: `public/` = **1,557,969 bytes = 1,521.5 KiB** across 33 files
  (`du -sk` reports 1,604 KiB of filesystem allocation — the difference is block allocation, not
  payload). Composition: `app.css` 802,732 B (51.5%), 12 JS bundles 330,350 B (21.2%),
  5 Thmanyah `.woff2` files 385,492 B (24.7%), remaining images/licenses ≈ 39,395 B (2.5%).
  Webpack `app` entrypoint = `app.css` + `app.js` = 931,120 B = **909 KiB**.
- **Maximum feature increase**: **0 bytes.** Not a budget allocation — a structural fact. HDL-01
  writes one Markdown file under `specs/`, which webpack never reads and Salla never ships.
  Any non-zero delta means the spec's Definition of Done was violated and the change must be
  moved to an owning spec.
- **New dependencies**: **None.** `package.json` and `pnpm-lock.yaml` are untouched (AGENTS.md
  rule 5). No `pnpm install` is run as part of this feature.
- **Network requests**: **before = after.** No script, no font, no image, no fetch is added or
  removed. No per-product request pattern is introduced.
- **Loading strategy**: Not applicable — nothing is loaded. The *existing* strategy is recorded
  as baseline: 12 page-scoped entries (`home`, `product`, `checkout`, `pages`, `order`,
  `testimonials`, plus 5 partial bundles) already split by page, with the shared `app` bundle
  carrying the full stylesheet.
- **Rollback trigger**: `git status --porcelain` showing any modification under `src/`,
  `public/`, `package.json`, `pnpm-lock.yaml`, or `twilight.json` attributable to HDL-01, **or**
  `node scripts/check-theme.mjs --build` no longer reporting `0 errors / 0 warnings`. Either
  condition → revert the working tree to `66b7b69e` for those paths and re-run the guard.
- **Pre-existing overage (recorded, not owned here)**: 1,521.5 KiB against the 1 MB public
  ceiling = **148.6%** of 1 MiB, or **155.8%** of 1 MB(10⁶). Internal target (≤85% of max) is
  870.4 KiB / 830.1 KiB. Gap to close ≈ **651 KiB**. **Owner: HDL-05.** Largest single levers
  visible at baseline: `app.css` (802,732 B) and the bundled font family (385,492 B). HDL-01
  states the numbers and stops — sizing the fix is HDL-05's job.

## Project Structure

### Documentation

```text
specs/001-baseline-evidence/
├── spec.md              # existing — NOT modified by this feature
├── design.md            # existing, Approved for Implementation — NOT modified
├── spec-input.md        # existing — NOT modified
├── plan.md              # this file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output — report structure & validation rules
├── quickstart.md        # Phase 1 output — reproduction & validation guide
├── tasks.md             # created later by /speckit.tasks — workflow artifact, not the deliverable
└── baseline-report.md   # THE deliverable — the single final report artifact
```

**No `contracts/` directory is created.** HDL-01 exposes no external interface: no public API, no
CLI command, no `twilight.json` setting, no locale key, no template/DOM contract, no HTTP
endpoint, no machine-readable output consumed by another system. The deliverable is a
human-read internal Markdown document. Per the plan workflow's own rule ("Skip if project is
purely internal"), `contracts/` is skipped, and the reason is recorded here and in research.md
R-001 rather than left as an unexplained gap.

**"Exactly one final report artifact"** means exactly one file matching the deliverable role.
`tasks.md` is a spec-kit workflow file, not a report, and does not count against that limit.
`plan.md`, `research.md`, `data-model.md`, and `quickstart.md` are planning artifacts.
`baseline-report.md` is the only file that carries HDL-01's findings. No second report, no
`appendix-*.md`, no `evidence/` folder, no JSON sidecar, no images.

**Filename rationale** (`baseline-report.md`): matches the feature slug `001-baseline-evidence`,
reads unambiguously next to the spec-kit reserved names, sorts adjacent to `design.md` in the
directory listing, and needs no date or SHA in the name because both are inside the document
header — a SHA in the filename would go stale the moment the report is regenerated.
Alternatives rejected: `report.md` (too generic across 29 spec folders),
`HDL-01-baseline-report.md` (redundant — the directory already encodes HDL-01),
`baseline-2026-08-08.md` (invites accidental multiple dated reports, violating "exactly one").

### Source Code

```text
# READ ONLY. No file below is created, modified, moved, or deleted by HDL-01.

src/views/pages/                    21 page templates      → inventoried, classified
src/views/components/               22 component templates → inventoried, classified
src/views/layouts/master.twig       body classes, CSS vars → identity evidence (class `theme-raed`, line 97)
src/assets/styles/                  42 .scss, entry app.scss → mapped to public/app.css
src/assets/js/                      24 .js                 → mapped to 12 webpack entries
src/assets/js/partials/product-card.js  custom-salla-product-card → capability-map row
src/locales/ar.json, en.json        86 / 86 leaf keys      → locale parity baseline
twilight.json                       45 settings, 7 components → settings + identity evidence
webpack.config.js                   12 entries (lines 11-24) → source→output mapping authority
scripts/check-theme.mjs             repo guard             → executed read-only
public/                             33 files, 1,557,969 B  → measured only; never hand-edited
```

**Structure Decision**: The deliverable lives beside its spec because it *is* spec-kit output
and its acceptance is owned by this spec (`spec.md` §5: "تقرير واحد داخل
`specs/001-baseline-evidence/`"). It is not placed in `docs/` — `docs/` holds durable technical
reference (`salla-twilight-notes.md`, `building-a-salla-theme.md`) that stays true across
commits, whereas this report is a **snapshot pinned to `66b7b69e`** that loses evidentiary
value at the first source change (`spec.md` §12). Keeping it under `specs/` makes that
scoping obvious and keeps the `ROADMAP.md` evidence link stable. The source paths listed are
the real Hadeel tree read from `webpack.config.js` and the filesystem — no generic
app/database scaffolding is invented.

## Report Content Plan

The report contains exactly these sections, each anchored to a requirement ID so FR coverage is
mechanically checkable (success criterion: 7 of 7).

| Report section | Covers | Content contract |
|---|---|---|
| `## Header` | all | Baseline SHA `66b7b69e`, branch, comparator `origin/master` `833f19d0`, measurement date 2026-08-08, tooling versions, validity statement |
| `## HDL-01-FR-001 — سجل القدرات وتصنيف الـ29` | FR-001 | Four exhaustive repository-inventory tables (21 pages, 22 component templates, 7 declared components, 37 interactive settings) with stable keys/state/source/responsibility, plus 29 roadmap rows with one primary classification each and the `spec-index.json` divergence flag |
| `## HDL-01-FR-002 — خريطة المصدر إلى المخرجات` | FR-002 | Closed 14-record set: the 12 webpack entries plus grouped Twig and locale no-output records; each maps capability → source path(s) → webpack entry → `public/` output + bytes or an explicit server/publish-time reason |
| `## HDL-01-FR-003 — نتائج البناء والفحص` | FR-003 | Verbatim command, SHA, date, exit status, error/warning counts; open-discrepancy subsection |
| `## HDL-01-FR-004 — قياس حجم الحزمة` | FR-004 | Comparable `public/` number, separate entrypoint number, ceiling comparison, confirmed vs needs-Salla-confirmation |
| `## HDL-01-FR-005 — سياسة الأدلة` | FR-005 | Evidence table per change type incl. "no visual evidence required" and "preview unavailable" rows |
| `## HDL-01-FR-006 — المخاطر مرتبة بأثر الإطلاق` | FR-006 | Ranked risks: measured evidence, owning spec, blocks-launch flag |
| `## HDL-01-FR-007 — قاعدة عدم إعادة البناء قبل التصنيف` | FR-007 | Standing rule + how FR-001 coverage enforces it |
| `## خط أساس العلاقة مع Theme Raed` | FR-006 / DECISION HDL-01 | The five owner-approved items, with the explicit no-feature-by-feature statement and the `HDL-29-FR-011` referral |
| `## جرد الفروع` | US1, edge cases | Every remote branch with state |
| `## قصص المستخدم — دليل القبول` | US1, US2, US3 | One subsection per story showing where its acceptance test is satisfied |
| `## فروق مفتوحة` | FR-003 | Doc-vs-runtime contradictions, each with proposed owner, none fixed here |
| `## طريقة القياس وحدودها` | all | Every command, its output location, and what it cannot prove |

### 29-spec classification (FR-001)

Every `ROADMAP.md` row gets **exactly one** of `Existing — Audit & Polish` / `Build` / `Spike` /
`Deferred`. Decision rule (full derivation in research.md R-002):

1. **Spike** if the row's core capability depends on unconfirmed Salla behavior that must be
   resolved before it can be planned at all.
2. Otherwise **Existing — Audit & Polish** if a responsible implementation for the row's core
   capability is present in `src/` today.
3. Otherwise **Build**.
4. **Deferred** only where a governing artifact already places the row outside the current release.

Rule 2 is decided on the row's **core** capability, not on whether every sub-item exists — that
is precisely why 18 of 29 index entries went compound, and why a single primary plus a recorded
divergence is the honest representation. Each row also carries: source location, expected
evidence type, and the `spec-index.json` value with a divergence flag where they differ.

### Exhaustive repository register (FR-001)

The same FR-001 section contains four source-derived tables with stable `record_key` values:

- `page:<path>` for every one of the 21 `src/views/pages/**/*.twig` files.
- `component-template:<path>` for every one of the 22 `src/views/components/**/*.twig` files.
- `custom-component:<path>` for every one of the 7 `twilight.json.components[].path` values.
- `setting:<id>` for every one of the 37 `twilight.json.settings[]` records whose `type` is not
  `static`.

Every row carries current state, exact source location, and responsibility owner. The eight
`type = static` records are structural titles/separators, so the report records their count and
the objective exclusion rule rather than treating them as merchant-editable settings. V21
compares the complete key sets with the repository and rejects omissions, duplicates, or blank
state/source/responsibility cells.

### Source-to-`public/` mapping (FR-002)

Authority: `webpack.config.js:11-24`. Twelve entries → thirteen outputs (`app` emits both CSS
and JS). Baseline sizes measured at `66b7b69e`:

| Entry | Source | `public/` output | Bytes |
|---|---|---|---|
| `app` | `styles/app.scss`, `js/wishlist.js`, `js/app.js`, `js/blog.js` | `app.css` + `app.js` | 802,732 + 128,388 |
| `product` | `js/product.js`, `js/products.js` | `product.js` | 56,127 |
| `home` | `js/home.js` | `home.js` | 36,947 |
| `product-card` | `js/partials/product-card.js` | `product-card.js` | 31,643 |
| `add-product-toast` | `js/partials/add-product-toast.js` | `add-product-toast.js` | 25,605 |
| `checkout` | `js/cart.js`, `js/thankyou.js` | `checkout.js` | 11,727 |
| `main-menu` | `js/partials/main-menu.js` | `main-menu.js` | 10,421 |
| `testimonials` | `js/testimonials.js` | `testimonials.js` | 9,957 |
| `digital-files` | `js/partials/digital-files.js` | `digital-files.js` | 5,720 |
| `pages` | `js/loyalty.js`, `js/brands.js` | `pages.js` | 5,284 |
| `wishlist-card` | `js/partials/wishlist-card.js` | `wishlist-card.js` | 5,142 |
| `order` | `js/order.js` | `order.js` | 3,389 |
| — | `src/views/**/*.twig` | **none** — rendered by Salla server-side | — |
| — | `src/locales/*.json` | **none** — merged by Salla at publish time | — |

The report expands this into a **capability**-keyed table (Header, Cart Drawer, Product Card,
Search, Footer, …) so User Story 2's test — "look up one large capability, find its source path,
its build output, and its classification" — is satisfied by direct lookup.

### Evidence policy (FR-005)

Consolidates Constitution VI and `AGENTS.md` §Definition of done into one table:

| Change type | Required evidence | If Salla preview is unavailable |
|---|---|---|
| Source code (`src/`) | Production build passes + guard `0/0` + commit SHA | Build + guard remain mandatory; preview evidence is deferred, not waived, and the change stays unaccepted |
| Build output (`public/`) | `node scripts/check-theme.mjs --build` reports `public/` matches a fresh build | Same — guard is local and always available |
| Visual change | Screenshot of the **rendered Salla storefront**, timestamped **after** the change | Owner-supplied manual preview URL (Constitution VI); a local mock-up is never a substitute |
| Behavioral / interaction | Live DOM measurement or interaction capture on the rendered storefront | Same as visual; a code-only reading is not proof |
| Performance | Measured number + producing command + SHA | Local build-size numbers may stand in for bundle checks; Lighthouse cannot be substituted locally |
| **Invisible change** (docs, comments, spec artifacts — **this feature**) | **No visual evidence required.** Commit SHA + guard still green + `git status` proving scope | Not applicable — no preview involved |

Standing rules carried into the report: an artifact older than the code it describes is not
evidence (`AGENTS.md` §Evidence rules); a number without a producing command and a commit SHA is
not evidence (`spec.md` §8); "not verified" is stated explicitly rather than implied.

### Risks and owners (FR-006), ranked by launch impact

| # | Risk | Measured evidence at `66b7b69e` | Owner | Blocks public launch |
|---|---|---|---|---|
| 1 | **Identity / distinctness from Theme Raed** | Root commit `8bf2ce6` tree `9d9056896ba1` is byte-identical to Raed `dc902f6`; `master.twig:97` renders body class `theme-raed`; `twilight.json` references 6 `raed/preview-images/*` assets; `README.md` carries 14 Raed references; `twilight.json` describes a "fashion theme" while the blueprint defines a general marketplace theme | **HDL-29 via `HDL-29-FR-011`** (remediation routed by that gate to the owning component/content specs) | **Yes** |
| 2 | **Bundle size over Salla's public ceiling** | `public/` 1,521.5 KiB vs 1 MB max → 148.6% (MiB) / 155.8% (MB); internal 85% target 870.4 KiB; gap ≈ 651 KiB; `app.css` 51.5% and fonts 24.7% of total | **HDL-05** | **Yes** |
| 3 | **Performance / entrypoint weight** | 3 webpack performance warnings; `app` entrypoint 909 KiB; no Lighthouse run exists at this commit | **HDL-05** | **Yes** (Constitution V) |
| 4 | **RTL/LTR and accessibility unmeasured** | Locale parity 86/86 measured and clean; no RTL/LTR render matrix and no accessibility score exists at baseline | **HDL-04** (a11y scoring gate shared with HDL-05) | **Yes** (Constitution IV/V) |
| 5 | **Salla preview availability** | Salla CLI `3.2.45` authenticated; theme `224400990` `Hadeel`, status `development`; preview capability available but not invoked (no source change to verify) | **HDL-05** operationally; **HDL-29** at release | No for HDL-01; **yes** for any source change |
| 6 | **Unmerged / stale branches** | 5 dependabot branches not contained in HEAD; 2 codex branches fully contained; `upstream/master` diverged `3333 / 97` with **no merge-base** | **HDL-05** (dependencies/CI); release owner for branch hygiene | No |
| 7 | **Documentation contradicts runtime** | `AGENTS.md` claims the guard "currently reports pre-existing errors"; measured `0 errors / 0 warnings`. `spec-index.json` carries compound classifications against FR-001's "exactly one" | **HDL-05** (guard/CI docs); governance owner (Yasser) for the spec-kit index | No |

Ranking rule: launch-blocking risks first, ordered by remediation distance; non-blocking risks
follow. Every row states measured evidence, never impression. **HDL-01 remediates none of them.**

### Theme Raed relationship baseline (bounded — DECISION HDL-01)

Exactly the five owner-approved items from `spec.md` §3, and nothing beyond them:

1. **Origin / base — PROVEN, by snapshot equality, not by ancestry.**
   Hadeel root commit `8bf2ce6fab2d8939f344e620203bb6638b80b161` has tree
   `9d9056896ba11ead6f6a108857c1e6f7aca4bad9`. Theme Raed commit
   `dc902f62775f25bf98f67b76da93eb098b1e207d` has the **exact same tree**
   `9d9056896ba11ead6f6a108857c1e6f7aca4bad9`. Therefore Hadeel began as an exact snapshot of
   Raed at that point. Separately and non-contradictorily,
   `git merge-base upstream/master HEAD` **returns no result (exit 1)** — the two histories are
   unrelated because Hadeel's history was restarted. The report states both facts together so
   the absent merge-base is never misread as "no relationship".
2. **High-level current differences** — repository/structure level only, a few lines per axis
   (history model, build entry set, styling system, settings surface, locale set). No
   feature-by-feature table.
3. **Areas of strong similarity** — flagged as **risk signals warranting later inspection**,
   explicitly not as findings: body class `theme-raed`, the 6 inherited `raed/preview-images/*`
   references in `twilight.json`, and the Raed-pointing `README.md`.
4. **Identity/distinctness launch risk** with the named owner — **HDL-29 via `HDL-29-FR-011`**,
   blocking: no PASS, no release without proven distinctness; every FAIL routes back to its
   owning spec, is fixed there, and is re-audited.
5. **Commit and evidence references** — both SHAs, both trees, `origin/master` `833f19d0`,
   `upstream/master` `3bd09f11`, the counts `0 38` and `3333 97`, every command used, and the
   measurement date, so the comparison can be re-run at the same point later.

**Explicit prohibition restated in the report body:** HDL-01 performs **zero** feature-by-feature
comparisons with Theme Raed. If the need surfaces during implementation, it is logged as a
signal in item 3 and referred to HDL-29 — never executed here.

### Branch inventory

| Branch | Tip | State at `66b7b69e` |
|---|---|---|
| `codex/hdl-01-baseline-evidence` | `66b7b69e` | **HEAD** — the baseline itself |
| `origin` (symbolic `origin/HEAD` alias) | `833f19d0` | **Comparator alias** — resolves to the same tip as `origin/master`, not separate work |
| `origin/codex/product-buy-button-options` | `66b7b69e` | **Identical to HEAD** — same commit, looks like separate work but is not (`spec.md` §8 edge case) |
| `origin/codex/figma-product-collection` | `14fbe512` | **Contained in HEAD** — merged in substance, name still open (`spec.md` §8 edge case) |
| `origin/master` / `master` | `833f19d0` | Comparator — HEAD is ahead 38, behind 0 |
| `origin/dependabot/npm_and_yarn/animejs-4.3.6` | `32cdcef1` | Pending — not contained |
| `origin/dependabot/npm_and_yarn/babel/core-7.29.0` | `4a5d9179` | Pending — not contained |
| `origin/dependabot/npm_and_yarn/babel/plugin-transform-runtime-7.29.0` | `a4cfdeae` | Pending — not contained |
| `origin/dependabot/npm_and_yarn/css-loader-7.1.4` | `d014b9ba` | Pending — not contained |
| `origin/dependabot/npm_and_yarn/postcss-loader-8.2.1` | `3eae0e4a` | Pending — not contained |
| `upstream/master` (SallaApp/theme-raed) | `3bd09f11` | **Diverged, unrelated history** — `3333 / 97`, no merge-base |

Remote-ref reconciliation: 10 total refs = 1 symbolic comparator alias + `origin/master` +
2 merged/identical codex refs + 5 dependabot refs pending + 1 upstream ref diverged. The work-state
counts required by `spec.md` §11 remain 2 merged/identical, 5 pending, and 1 diverged; comparator
and symbolic alias are reference rows, not pending work.

## Verification Matrix

| Page/flow | Mobile RTL | Desktop RTL | Mobile LTR | Desktop LTR | Browser/device | Evidence |
|---|---|---|---|---|---|---|
| **None — HDL-01 renders no customer-facing surface** | n/a | n/a | n/a | n/a | n/a | Not applicable |

Storefront verification is **not applicable and is recorded as such**, not skipped
(`spec.md` §10, §9). It is replaced by document verification, which is fully runnable:

| Check | Command / method | Pass condition |
|---|---|---|
| Guard unchanged | `node scripts/check-theme.mjs --build --json` | `0 errors / 0 warnings`, `build-sync` = ok |
| Zero source impact | `git status --porcelain -- src/ public/ package.json pnpm-lock.yaml twilight.json AGENTS.md \| grep -vE '^\?\?'` | **No output.** Note: the spec-kit bundle (`.specify/`, `specs/`, `ROADMAP.md`, `docs/spec-kit/`) is **already untracked** at `66b7b69e`, so "git status is empty" is the wrong test — see quickstart.md §5 |
| Approved artifacts untouched | `shasum specs/001-baseline-evidence/{spec,design}.md` and `.specify/.runtime/hadeel-night-run.md`, compared to hashes captured before implementation | Unchanged. Git cannot police this (the directory is untracked), so the hashes must be captured up front |
| Only allowed files added | `ls specs/001-baseline-evidence/` | Only `spec.md`, `spec-input.md`, `design.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `baseline-report.md` (+ `tasks.md` later) |
| Exactly one report | `ls specs/001-baseline-evidence/*.md` | Exactly one deliverable report file |
| 29/29 rows classified | grep `HDL-\d\d` rows in the FR-001 table | 29 unique IDs, each with exactly one primary classification |
| Full repository register | quickstart.md V21 exact-set comparison | 21 page keys + 22 component-template keys + 7 custom-component keys + 37 interactive-setting keys; exact source-set equality, no duplicates, no blank state/source/responsibility |
| 7/7 FR sections | grep `HDL-01-FR-00[1-7]` headings | All seven present as named sections |
| Every number reproducible | quickstart.md §2 command replay | Each replayed value equals the reported value |
| No feature-by-feature Raed comparison | Manual read of the relationship-baseline section | Five items only; prohibition sentence present; `HDL-29-FR-011` referral present |

Full procedure and exact commands: [quickstart.md](quickstart.md).

## User Story Coverage

| Story | Priority | How this plan satisfies its independent acceptance test |
|---|---|---|
| **US1 — Owner sees what exists and what is missing** | P1 | Report lives at `specs/001-baseline-evidence/baseline-report.md`, opens with `66b7b69e` + measurement date, contains the exhaustive 21/22/7/37 repository register and all 29 `ROADMAP.md` rows each with exactly one classification (FR-001 section), plus a launch-ranked risk list (FR-006 section). Readable without opening code. `git status` proves no `src/`/`public/` change. |
| **US2 — Developer/agent finds current ownership before editing** | P1 | The FR-002 capability table is keyed by capability name (Cart Drawer, Product Card, Header, …) → source path → build output → classification, so a single lookup answers "improve or build?" without reading the repo. Twig/locale rows explicitly state they have no `public/` output, removing the temptation to hand-edit `public/` or add a parallel layer. |
| **US3 — QA reviewer gets a comparable baseline** | P2 | The FR-003/FR-004 sections record guard `0/0`, build 22.4s, `app.css` 784 KiB, `app.js` 125 KiB, `app` entrypoint 909 KiB, `public/` 1,521.5 KiB — each with its producing command and pinned to `66b7b69e`. quickstart.md §2 gives the exact re-run commands, so a later delta is a number against a named commit, not an impression. |

## Rollback and Compatibility

- **Existing settings**: unchanged. No `twilight.json` setting is added, removed, or renamed, so
  no merchant configuration migrates and no stored value is invalidated.
- **Merchants**: zero impact. No published asset changes; no storefront behavior changes; no
  merchant sees any difference. The theme record `224400990` is untouched.
- **Fallback behavior**: none needed — there is no runtime code path to fall back from.
- **Rollback steps**: `git rm specs/001-baseline-evidence/baseline-report.md` (plus the three
  planning artifacts if the whole plan is withdrawn), then `node scripts/check-theme.mjs --build`
  to confirm `0/0`. No rebuild, no republish, no merchant notification.
- **Compatibility**: the report is a **snapshot pinned to `66b7b69e`**. Its numbers stop being
  valid evidence at the first source commit after it (`spec.md` §12). The report states this in
  its header so a stale reading cannot be mistaken for a current one, and quickstart.md §2 is the
  refresh procedure: re-run the same commands, replace the numbers, update the SHA.

## Complexity Tracking

| Constitution Exception | Why Needed | Simpler Alternative Rejected | Owner | Expiry/Remediation |
|---|---|---|---|---|
| **None** | — | — | — | — |

No constitutional exception is requested for implementing this documentation-only baseline.
The pre-existing bundle overage remains a **failed project public-release gate** owned by HDL-05,
not a passing condition and not an implicit exception. Public release is forbidden until the gate
passes or the owner records a temporary exception satisfying Constitution V and Governance. The
identity/distinctness gate likewise remains blocking and is owned by HDL-29-FR-011. HDL-01 changes
neither runtime condition; its measured delta is zero on every axis.

## Post-Design Constitution Re-check

Re-evaluated after generating research.md, data-model.md, and quickstart.md: **PASS for HDL-01
implementation; public-release readiness remains FAIL, unchanged.**
The Phase 1 design added no dependency, no runtime code, no setting, no locale key, no network
call, and no `contracts/` interface. The only new files are Markdown planning artifacts plus the
one planned report. No gate moved from pass to fail, and no new exception appeared.

**Unresolved NEEDS CLARIFICATION: none.** Every open question from Technical Context was resolved
in [research.md](research.md) (R-001…R-008). The two Salla-side unknowns are recorded as
explicitly-labelled unconfirmed items with safe fallbacks, per Constitution II — they are not
clarifications blocking this plan.
