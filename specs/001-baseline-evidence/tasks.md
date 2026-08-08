# Tasks: خط الأساس وخريطة الموجود والأدلة (Baseline, Existing-Capability Map, and Evidence)

**Input**: `/specs/001-baseline-evidence/spec.md`, `design.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`
**Roadmap ID**: `HDL-01`
**Branch**: `codex/hdl-01-baseline-evidence`
**Baseline commit**: `66b7b69e3117235c8a614a0502de21ca928e227e`
**Comparator**: `origin/master` at `833f19d0` (`git rev-list --left-right --count origin/master...HEAD` → `0 38`)
**Organization**: Tasks are grouped by user story and include exact file paths.

## Format

`[ID] [P?] [US?] Description with exact path`

- `[P]` = parallelizable (different file or independent read-only command, no dependency on an incomplete task).
- `[US1]` / `[US2]` / `[US3]` = user-story phase tasks only. Phase 0, Phase 1, and the Final Phase carry no story label.

## The single implementation deliverable

HDL-01 is **documentation-only**. The one and only implementation deliverable is:

```text
specs/001-baseline-evidence/baseline-report.md
```

No task in this list creates, modifies, moves, or deletes any other file during the Kimi implementation window.

## Roles and the Kimi implementation window

| Role | Model / owner | Owns |
|---|---|---|
| Orchestrator | Codex orchestrator | Phase 0 gates, pre-implementation artifact remediation, runtime-log appends, review dispatch, post-acceptance close-out |
| Implementer | **Kimi K3 High** | Phase 1 → Phase 4 (writing `baseline-report.md`), plus fix tasks T069 and T072 — **report only** |
| Artifact analyzer | **Claude Opus 5 High** (fallback: GPT-5.6 Sol High via Codex) | T008 pre-implementation SpecKit Analyze; read-only findings |
| Report reviewer | **Claude Opus 5 High** (fallback: GPT-5.6 Sol High via Codex) | T068 report conformance and T071 Final Review; read-only findings |
| Human Gate | **Yasser** | T073 owner acceptance |

**Kimi implementation window** = T011 → T045, plus the two fix tasks T069 and T072.

Inside that window Kimi K3 High MUST NOT create, modify, move, or delete:
`src/`, `public/`, `twilight.json` (settings), `src/locales/ar.json`, `src/locales/en.json`,
`package.json`, `pnpm-lock.yaml`, `ROADMAP.md`, `docs/spec-kit/spec-index.json`, `AGENTS.md`,
`specs/001-baseline-evidence/design.md`, `specs/001-baseline-evidence/spec.md`, or
`.specify/.runtime/hadeel-night-run.md`.

**Explicitly allowed**: the **orchestrator** appends phase evidence to
`.specify/.runtime/hadeel-night-run.md` **before** the window opens (T009) and **after** it closes
(T074). The runtime-log hash captured at T010 is the hash of the log *after* T009's append, so
orchestrator appends outside the window never fail the T067 comparison, and any edit made *inside*
the window does.

## Standing rules for every task below

1. Never run bare `npx webpack --mode production` — `output.clean: true` (`webpack.config.js:25-29`) wipes and rewrites `public/`. Use `--output-path "$(mktemp -d)"` (quickstart.md §2.3, research.md R-003).
2. Never run `salla theme preview` — it leaves `public/` as a development build (`docs/salla-twilight-notes.md` §6, research.md R-006).
3. Never run `pnpm install` or `npm install` — dependency files are out of scope (AGENTS.md rule 5).
4. Every number written into the report carries its producing command and `66b7b69e` (invariant I-1).
5. Report language is Arabic-first; paths, commands, SHAs, IDs, tags, numbers and units stay ASCII (research.md R-005).
6. **Zero feature-by-feature Theme Raed comparison** anywhere (invariant I-7, `DECISION HDL-01`).

---

## Phase 0: Blocking Product & Design Gates *(orchestrator — before the Kimi window)*

- [x] T001 Verify `git rev-parse HEAD` equals `66b7b69e3117235c8a614a0502de21ca928e227e` per `specs/001-baseline-evidence/quickstart.md` §1.1, and verify the `upstream` remote resolves to `https://github.com/SallaApp/theme-raed.git` per §1.2
- [x] T002 [P] Confirm `specs/001-baseline-evidence/spec.md` contains zero **unresolved/open** clarification or owner-decision markers (resolved historical mentions are allowed), and that `DECISION HDL-01` (2026-08-08) is recorded in `docs/spec-kit/DECISION-LOG.md`
- [x] T003 [P] Confirm `specs/001-baseline-evidence/design.md` records Figma file `12z0jRutTHcdhlZQrRmcXU`, page `359:2`, board `359:3`, Revision 1, and the owner statement `APPROVE HDL-01 REV 1` — **Approved for Implementation**
- [x] T004 [P] Read-only confirmation in `ROADMAP.md`: 29 rows `HDL-01`…`HDL-29` exist, `HDL-01` has no dependencies, and its pre-implementation status is `planning`; do not edit it before the synchronized transition at T009
- [x] T005 [P] Read-only confirmation in `docs/spec-kit/spec-index.json`: 18 of 29 rows carry compound `classification` values (15 × `Existing — Audit & Polish + Build`, 3 × `… + Spike`), staged as the FR-001 divergence evidence per `specs/001-baseline-evidence/research.md` R-002 — **do not edit the file**
- [x] T006 [P] Confirm both Salla feasibility unknowns are carried as labelled spikes in `specs/001-baseline-evidence/research.md` (R-004 bundle measurement method, R-006 preview parity), and confirm HDL-01 exposes no merchant control per `specs/001-baseline-evidence/plan.md` §Settings Architecture
- [x] T007 Record the pre-implementation working-tree state by running `specs/001-baseline-evidence/quickstart.md` §5.1 and §5.2 and confirming the only expected line is `M .vscode/settings.json`
- [x] T008 **Pre-implementation SpecKit Analyze gate** *(orchestrator)* — run the read-only `speckit-analyze` pass over `spec.md`, `plan.md`, and `tasks.md` using Claude Opus 5 High (fallback GPT-5.6 Sol High via Codex); the orchestrator, never Kimi, applies any approved lifecycle-artifact remediation before the Kimi window, and this gate passes only when zero CRITICAL/HIGH blockers remain
- [x] T009 Synchronize the `planning → implementing` lifecycle transition in `specs/001-baseline-evidence/spec.md`, the HDL-01 row in `ROADMAP.md`, and only the HDL-01 `status` field in `docs/spec-kit/spec-index.json`; append the same transition and the model assignments in §Roles above to `.specify/.runtime/hadeel-night-run.md` — **these are the last lifecycle writes before the Kimi window opens**
- [x] T010 Capture the pre-implementation hash snapshot **outside the repository** with `shasum specs/001-baseline-evidence/spec.md specs/001-baseline-evidence/design.md .specify/.runtime/hadeel-night-run.md > /tmp/hdl-01-preimpl-shasums.txt`, then verify `/tmp/hdl-01-preimpl-shasums.txt` holds exactly three lines

**Checkpoint**: The Kimi implementation window opens only after T001–T010 pass. No task after this point may write to any file except `specs/001-baseline-evidence/baseline-report.md` until the window closes at T073.

---

## Phase 1: Foundational *(Kimi K3 High — blocking prerequisites for US1, US2, US3)*

- [x] T011 Create `specs/001-baseline-evidence/baseline-report.md` containing exactly the 13 section headings listed in `specs/001-baseline-evidence/plan.md` §Report Content Plan, each FR heading beginning with its `HDL-01-FR-00N` ID so it is greppable regardless of language
- [x] T012 Write the `## Header` section of `specs/001-baseline-evidence/baseline-report.md` per `specs/001-baseline-evidence/data-model.md` §0: full SHA-40 `66b7b69e3117235c8a614a0502de21ca928e227e`, branch `codex/hdl-01-baseline-evidence`, comparator `origin/master` `833f19d0` with counts `0 38`, measurement date `2026-08-08`, Figma refs `12z0jRutTHcdhlZQrRmcXU` / `359:2` / `359:3` / Rev 1, tooling versions (Node `v26.5.0`, pnpm `10.33.0`, Salla CLI `3.2.45`, Spec Kit `0.16.1`)
- [x] T013 Write the validity and scope statements into `## Header` of `specs/001-baseline-evidence/baseline-report.md`: the numbers are evidence for `66b7b69e` only and expire at the first source change; the Kimi implementation window modifies only `specs/001-baseline-evidence/baseline-report.md`; and `.specify/.runtime/hadeel-night-run.md` may be appended only by the orchestrator outside that window at T009 and T074 (invariant I-3)
- [x] T014 [P] Reproduce the shared guard evidence with `node scripts/check-theme.mjs --json` and `node scripts/check-theme.mjs --build --json` per `specs/001-baseline-evidence/quickstart.md` §2.1–§2.2, and stage the verbatim output for the FR-003 section of `specs/001-baseline-evidence/baseline-report.md`
- [x] T015 [P] Reproduce the shared inventory counts and the four complete canonical key sets per `specs/001-baseline-evidence/quickstart.md` §2.6 (21 page templates, 22 component templates, 7 declared components, 37 interactive settings plus 8 excluded static rows; also 24 JS files, 42 `.scss`, 58 distinct `salla-*` tags, locales 86/86) and stage the exact sorted keys for the FR-001 register and the remaining counts for FR-002

**Checkpoint**: The report file exists with its header and section skeleton. US1, US2, and US3 may now proceed and are independently completable in any order.

---

## Phase 2 — User Story 1: كمالك المشروع (P1)

**Goal**: Yasser opens the report without opening code and sees every roadmap row classified, the launch-ranked risks with owners, the bounded Theme Raed relationship baseline, and the branch inventory.

**Independent test**: Open `specs/001-baseline-evidence/baseline-report.md` alone. The repository register exhaustively covers the 21/22/7/37 source sets; all 29 rows `HDL-01`…`HDL-29` carry exactly one classification; risks are ranked by launch impact with a named owner and an explicit blocks-launch flag; the relationship baseline has exactly five items plus the prohibition sentence and the `HDL-29-FR-011` referral; every remote branch has a state. Verified by V3, V5, V6, V7, V8, V9, V10, V11, V17, V21.

- [x] T016 [P] [US1] Reproduce the branch inventory per `specs/001-baseline-evidence/quickstart.md` §2.7 (`git branch -r`, `git rev-list --left-right --count origin/master...HEAD` → `0 38`, `upstream/master...HEAD` → `3333 97`, the `git merge-base --is-ancestor` loop), confirm the current output has exactly 10 remote refs including the symbolic `origin`/`origin-HEAD` alias, and stage the output for `specs/001-baseline-evidence/baseline-report.md`
- [x] T017 [P] [US1] Reproduce the five relationship-baseline commands per `specs/001-baseline-evidence/quickstart.md` §2.8 (root `8bf2ce6fab2d8939f344e620203bb6638b80b161`, tree `9d9056896ba11ead6f6a108857c1e6f7aca4bad9`, Raed `dc902f62775f25bf98f67b76da93eb098b1e207d` same tree, `git merge-base upstream/master HEAD` → no output / exit 1) plus the three similarity **signal** counts (`master.twig:97` body class `theme-raed`, **6** `raed/preview-images` references in `twilight.json`, 14 `raed` references in `README.md`) — and stop at the §2.8 STOP condition without extending into any diff
- [x] T018 [US1] Write the `## HDL-01-FR-001 — سجل القدرات وتصنيف الـ29` section of `specs/001-baseline-evidence/baseline-report.md` with all 29 `ROADMAP.md` rows, each carrying **exactly one** of `Existing — Audit & Polish` / `Build` / `Spike` / `Deferred` applied by the ordered rule in `specs/001-baseline-evidence/research.md` R-002 (rules R1.1, R1.2, R1.3)
- [x] T019 [US1] Add the `source_location`, `expected_evidence`, `phase`, and `dependencies` columns to the FR-001 table in `specs/001-baseline-evidence/baseline-report.md`, matching `ROADMAP.md` exactly and leaving no row without an evidence type (rules R1.4, R1.5)
- [x] T020 [US1] Add the `index_classification` column and `divergence` flag to the FR-001 table in `specs/001-baseline-evidence/baseline-report.md` using the 18 compound `docs/spec-kit/spec-index.json` values captured at T005, stating that `spec-index.json` is not modified (rule R1.6)
- [x] T021 [US1] Add four exhaustive `RepositoryInventoryRecord` tables to the FR-001 section of `specs/001-baseline-evidence/baseline-report.md`, using the canonical keys from `quickstart.md` §2.6: all 21 `page:<path>` rows, all 22 `component-template:<path>` rows, all 7 `custom-component:<path>` rows, and all 37 `setting:<id>` rows where `type != "static"`; give every row non-empty current state, exact source location, and responsibility owner, and record `static_count = 8` with the structural-title/separator exclusion reason (rules R1A.1–R1A.4, invariant I-9)
- [x] T022 [US1] Write the `## HDL-01-FR-006 — المخاطر مرتبة بأثر الإطلاق` section of `specs/001-baseline-evidence/baseline-report.md` with the seven ranked risks from `specs/001-baseline-evidence/plan.md` §Risks and owners, each with measured evidence, owning spec, and an explicit `blocks_public_launch` yes/no (rules R6.3, R6.4)
- [x] T023 [US1] Verify in `specs/001-baseline-evidence/baseline-report.md` that the FR-006 table covers all six `spec.md` §5 categories (الحجم، الأداء، الهوية، RTL/LTR، المعاينة، الفروع) plus doc-drift, that risk #1 names **HDL-29 via `HDL-29-FR-011`** as owner, and that every row states HDL-01 does not remediate it (rules R6.1, R6.2, R6.5)
- [x] T024 [US1] Write the `## HDL-01-FR-007 — قاعدة عدم إعادة البناء قبل التصنيف` section of `specs/001-baseline-evidence/baseline-report.md` stating the Preserve-Audit-Then-Improve standing rule and how FR-001's 29/29 coverage enforces it on HDL-02…HDL-29
- [x] T025 [US1] Write the `## خط أساس العلاقة مع Theme Raed` section of `specs/001-baseline-evidence/baseline-report.md` with **exactly five** numbered items per `specs/001-baseline-evidence/data-model.md` §8 — origin/base proven by tree equality **together with** the absent merge-base, high-level differences at repository/structure level only, similarity **signals** (including the **6** `raed/preview-images` references), identity risk owner, and evidence references (both SHAs, both trees, `833f19d0`, `3bd09f11`, counts `0 38` and `3333 97`, commands, date) — rules R8.1, R8.4, R8.5
- [x] T026 [US1] Add to the relationship-baseline section of `specs/001-baseline-evidence/baseline-report.md` the explicit sentence that **no feature-by-feature comparison is performed in HDL-01** and the referral of the full distinctness audit to the blocking gate **`HDL-29-FR-011`** (rules R8.2, R8.3)
- [x] T027 [US1] Write the `## جرد الفروع` section of `specs/001-baseline-evidence/baseline-report.md` listing all 10 remote refs and resolving the symbolic `origin`/`origin-HEAD` alias explicitly as an alias of `origin/master`, then reconcile the actual work refs to 2 merged/identical + 5 dependabot pending + 1 upstream diverged, list `origin/master` separately as the comparator, and include the two `spec.md` §8 edge-case notes on `origin/codex/product-buy-button-options` and `origin/codex/figma-product-collection` (rules R7.1–R7.5)
- [x] T028 [US1] Write the US1 subsection of `## قصص المستخدم — دليل القبول` in `specs/001-baseline-evidence/baseline-report.md` showing where each step of the US1 acceptance test is satisfied

**Checkpoint**: US1 is independently demonstrable — the owner-facing half of the report is complete and passes V3, V5, V6, V7, V8, V9, V10, V11, V17, V21 on its own.

---

## Phase 3 — User Story 2: كمطور أو وكيل (P1)

**Goal**: An agent starting HDL-02 or later looks up one large capability and immediately finds its source path, its build output, and its classification.

**Independent test**: Search `specs/001-baseline-evidence/baseline-report.md` for a single capability (Cart Drawer, Product Card, or Header). One lookup returns at least one responsible `src/` path, the corresponding `public/` output with its byte size, and the classification — with no blank cells and no instruction to hand-edit `public/`. Verified by V12 and the FR-002 reading in V13's neighbourhood.

- [x] T029 [P] [US2] Reproduce the source-to-output mapping per `specs/001-baseline-evidence/quickstart.md` §2.5 (`sed -n '11,24p' webpack.config.js` for the 12 entries; the `public/` file listing for the 13 outputs) and stage it for `specs/001-baseline-evidence/baseline-report.md`
- [x] T030 [US2] Write the entry→output table of the `## HDL-01-FR-002 — خريطة المصدر إلى المخرجات` section of `specs/001-baseline-evidence/baseline-report.md` with the 12 webpack entries and 13 outputs and exact baseline bytes from `specs/001-baseline-evidence/plan.md` §Source-to-`public/` mapping, using `webpack.config.js:11-24` as the sole mapping authority (rule R2.2)
- [x] T031 [US2] Expand the FR-002 section of `specs/001-baseline-evidence/baseline-report.md` into the **closed 14-record capability table**: exactly the 12 webpack entries listed in `specs/001-baseline-evidence/data-model.md` §2 plus `twig-templates` and `locales`; include source paths under `src/`, webpack entry, `public/` output or explicit no-output reason, bytes where applicable, classification matching the owning `RoadmapSpecRecord`, and dependent `salla-*` components (rules R2.1, R2.4, R2.6, invariant I-4)
- [x] T032 [US2] Add the explicit no-output rows to the FR-002 table in `specs/001-baseline-evidence/baseline-report.md`: `src/views/**/*.twig` → "no `public/` output — rendered server-side by Salla" and `src/locales/*.json` → "no `public/` output — merged by Salla at publish time"; state that `public/` is never hand-edited (rules R2.1, R2.5)
- [x] T033 [US2] Reconcile the FR-002 output bytes in `specs/001-baseline-evidence/baseline-report.md` against the `public/` total: 12 JS bundles 330,350 B + `app.css` 802,732 B + fonts 385,492 B + remaining ≈ 39,395 B = 1,557,969 B (rule R2.3, invariant I-6)
- [x] T034 [US2] Write the US2 subsection of `## قصص المستخدم — دليل القبول` in `specs/001-baseline-evidence/baseline-report.md` showing where each step of the US2 acceptance test is satisfied

**Checkpoint**: US2 is independently demonstrable — the capability map answers "improve or build?" in one lookup without reading the repository.

---

## Phase 4 — User Story 3: كمراجع جودة (P2)

**Goal**: A QA reviewer gets a comparable, reproducible baseline: guard and build results verbatim, bundle measurement against Salla's ceiling, the accepted-evidence policy, the open discrepancies, and the method with its limits.

**Independent test**: Re-run the commands in `specs/001-baseline-evidence/quickstart.md` §2 at `66b7b69e` and confirm each replayed value equals the reported value; every figure in the FR-003 and FR-004 sections carries its producing command and the baseline SHA. Verified by V2, V12, V13, V14, V15, V16, V18, V19.

- [x] T035 [P] [US3] Reproduce the bundle measurements per `specs/001-baseline-evidence/quickstart.md` §2.4 (`public/` raw total `1557969`, 33 files, `du -sk` 1604, the eight largest assets, fonts total `385492`) and stage them for `specs/001-baseline-evidence/baseline-report.md`
- [x] T036 [US3] Write the `## HDL-01-FR-003 — نتائج البناء والفحص` section of `specs/001-baseline-evidence/baseline-report.md` transcribing verbatim, each with command + SHA + run date + exit status + literal error/warning counts: `node scripts/check-theme.mjs --json` (0/0, five static checks ok), `node scripts/check-theme.mjs --build --json` (0/0, `public/` matches a fresh production build), `npx webpack --mode production` (success in 22.437s, `app.css` 784 KiB, `app.js` 125 KiB, `app` entrypoint 909 KiB, **3** performance warnings) — rules R3.1, R3.2
- [x] T037 [US3] Add the substitution disclosure to the FR-003 section of `specs/001-baseline-evidence/baseline-report.md`: the cited webpack run was executed at this SHA, and the reproduction form is `npx webpack --mode production --output-path "$(mktemp -d)"` because a bare run rewrites `public/` (rule R3.4, research.md R-003)
- [x] T038 [US3] Write the `## HDL-01-FR-004 — قياس حجم الحزمة` section of `specs/001-baseline-evidence/baseline-report.md` per `specs/001-baseline-evidence/data-model.md` §4: `public/` raw total 1,557,969 B (1,521.5 KiB) as the **single** measure comparable to Salla's ceiling, the `app` entrypoint 909 KiB labelled a **build-tool signal, not a platform limit**, the overage stated under **both** 155.8% of 1 MB(10⁶) and 148.6% of 1 MiB, the 85% internal target and ≈651 KiB gap, and the method marked `needs-salla-confirmation` — recorded as a measured baseline, never an optimisation target (rules R4.1–R4.5)
- [x] T039 [US3] Write the `## HDL-01-FR-005 — سياسة الأدلة` section of `specs/001-baseline-evidence/baseline-report.md` as the six-row evidence table from `specs/001-baseline-evidence/plan.md` §Evidence policy, including the **"لا يلزم دليل بصري / no visual evidence required"** row for invisible changes (the row HDL-01 itself falls under) and the **"معاينة سلة غير متاحة / Salla preview unavailable"** substitute column, with substitution stated as deferral not waiver, no local mock-up accepted as evidence, and a commit SHA required on every row (rules R5.1–R5.5)
- [x] T040 [US3] Write the `## فروق مفتوحة` section of `specs/001-baseline-evidence/baseline-report.md` with the three discrepancies from `specs/001-baseline-evidence/research.md` R-008 (`AGENTS.md` guard-errors claim vs measured 0/0 → HDL-05; `docs/spec-kit/spec-index.json` compound classifications vs FR-001 → governance owner Yasser; `twilight.json` "fashion theme" vs general-marketplace blueprint → HDL-28 routed by `HDL-29-FR-011`), each with `fixed_here = false` and its named file left unmodified (rules R9.1, R9.2, R9.3)
- [x] T041 [US3] Write the `## طريقة القياس وحدودها` section of `specs/001-baseline-evidence/baseline-report.md` listing every command used, where its output came from, and what it cannot prove — including the two dangerous commands that were deliberately not run (bare `npx webpack --mode production`, `salla theme preview`)
- [x] T042 [US3] Record in `## طريقة القياس وحدودها` of `specs/001-baseline-evidence/baseline-report.md` that **Salla storefront preview validation is N/A for HDL-01 because no `src/` or `public/` file changes**, with the availability status recorded instead (Salla CLI `3.2.45` authenticated; theme `224400990` `Hadeel`, status `development`; capability available but **not invoked**), and that the requirement returns in full at the first source change — **do not run a preview**
- [x] T043 [US3] Record in `## طريقة القياس وحدودها` of `specs/001-baseline-evidence/baseline-report.md` that **mobile/desktop Arabic-RTL and English-LTR validation is N/A** (no customer-facing surface), substituting the measured RTL/LTR and accessibility baseline handed to HDL-04: locale parity 86/86 with zero missing keys, no RTL/LTR render matrix at baseline, and no Lighthouse accessibility run at this commit
- [x] T044 [US3] Record in `## طريقة القياس وحدودها` of `specs/001-baseline-evidence/baseline-report.md` that the **Figma-vs-Salla-preview comparison is N/A** for HDL-01 (documentation/QA gate type, no approved storefront frames) and begins at HDL-02, per `specs/001-baseline-evidence/spec.md` §9 and `specs/001-baseline-evidence/design.md` §Node IDs
- [x] T045 [US3] Write the US3 subsection of `## قصص المستخدم — دليل القبول` in `specs/001-baseline-evidence/baseline-report.md` showing where each step of the US3 acceptance test is satisfied

**Checkpoint**: US3 is independently demonstrable — the report is a comparable baseline whose every number can be replayed against `66b7b69e`.

---

## Final Phase: Validation, Review, Acceptance, and Close-out *(mandatory)*

### V1–V21 — the quickstart validation battery *(Kimi K3 High, then re-run at T070)*

All twenty-one checks are defined in `specs/001-baseline-evidence/quickstart.md` §4 and are run against
`R=specs/001-baseline-evidence/baseline-report.md`.

- [x] T046 [P] V1 — Confirm exactly one report file exists: `ls specs/001-baseline-evidence/*.md` returns only `spec.md`, `spec-input.md`, `design.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `tasks.md`, `baseline-report.md` (invariant I-2)
- [x] T047 [P] V2 — Confirm `grep -c '66b7b69e3117235c8a614a0502de21ca928e227e' specs/001-baseline-evidence/baseline-report.md` ≥ 1 with the full SHA-40 in the header
- [x] T048 [P] V3 — Confirm 29 unique roadmap IDs: `grep -oE 'HDL-(0[1-9]|1[0-9]|2[0-9])' specs/001-baseline-evidence/baseline-report.md | sort -u | wc -l` = `29`
- [x] T049 [P] V4 — Confirm 7 of 7 FR sections: `grep -oE 'HDL-01-FR-00[1-7]' specs/001-baseline-evidence/baseline-report.md | sort -u | wc -l` = `7`
- [x] T050 [P] V5 — Read the FR-001 table in `specs/001-baseline-evidence/baseline-report.md` and confirm no classification cell contains `+` and no compound value appears
- [x] T051 [P] V6 — Confirm `grep -c 'spec-index' specs/001-baseline-evidence/baseline-report.md` ≥ 1, the 18 compound index rows are flagged, and `docs/spec-kit/spec-index.json` is unmodified
- [x] T052 [P] V7 — Read the relationship-baseline section of `specs/001-baseline-evidence/baseline-report.md` and confirm exactly five numbered items, no more and no fewer
- [x] T053 [P] V8 — Confirm `grep -c 'feature-by-feature\|ميزة بميزة' specs/001-baseline-evidence/baseline-report.md` ≥ 1 and that every occurrence is a **prohibition**, never a comparison
- [x] T054 [P] V9 — Confirm `grep -c 'HDL-29-FR-011' specs/001-baseline-evidence/baseline-report.md` ≥ 1
- [x] T055 [P] V10 — Manually read `specs/001-baseline-evidence/baseline-report.md` end to end and confirm **zero** feature-by-feature Raed-vs-Hadeel comparisons or per-feature tables anywhere (invariant I-7)
- [x] T056 [P] V11 — Read the FR-006 table in `specs/001-baseline-evidence/baseline-report.md` and confirm all six risk categories are present, no `owning_spec` is empty, and no blocks-launch flag is blank
- [x] T057 [P] V12 — Exhaustively audit every numeric claim in `specs/001-baseline-evidence/baseline-report.md` and confirm each carries its producing command and the baseline SHA (invariant I-1)
- [x] T058 [P] V13 — Read the FR-004 section of `specs/001-baseline-evidence/baseline-report.md` and confirm exactly one measure is flagged comparable to Salla's limit and the `app` entrypoint is labelled a build-tool signal
- [x] T059 [P] V14 — Run `grep -c '148.6' specs/001-baseline-evidence/baseline-report.md` and `grep -c '155.8' specs/001-baseline-evidence/baseline-report.md` separately and confirm each returns at least one occurrence
- [x] T060 [P] V15 — Confirm `grep -c 'لا يلزم دليل بصري\|no visual evidence' specs/001-baseline-evidence/baseline-report.md` ≥ 1
- [x] T061 [P] V16 — Confirm `grep -ci 'معاينة سلة غير متاحة\|preview unavailable' specs/001-baseline-evidence/baseline-report.md` ≥ 1
- [x] T062 [P] V17 — Read the branch table in `specs/001-baseline-evidence/baseline-report.md` and confirm it resolves all 10 remote refs: the symbolic `origin`/`origin-HEAD` alias is explained, `origin/master` is the comparator, and the work refs reconcile to 2 merged/identical, 5 pending, and 1 diverged
- [x] T063 [P] V18 — Read the open-discrepancy table in `specs/001-baseline-evidence/baseline-report.md` and confirm every row states it is not fixed here and that each named file is unmodified
- [x] T064 V19 — Run `node scripts/check-theme.mjs --build --json` and confirm `0` errors, `0` warnings and `build-sync` = ok
- [x] T065 V20 — Prove zero source impact by running `specs/001-baseline-evidence/quickstart.md` §5.1, §5.2 and §5.3 and confirming no `M`/`A`/`D`/`R` line for tracked source or config, and no unexpected path in `specs/001-baseline-evidence/`
- [x] T066 V21 — Exhaustively compare the four canonical FR-001 key sets generated by `specs/001-baseline-evidence/quickstart.md` §2.6 with the keys in `baseline-report.md`: require an empty sorted diff, exactly 87 unique rows (21 page + 22 component-template + 7 custom-component + 37 setting), zero duplicates, non-empty state/source/responsibility on every row, and `static_count = 8` with the objective exclusion reason (rules R1A.1–R1A.4, invariant I-9)

### Approved-artifact integrity

- [x] T067 Compare `shasum specs/001-baseline-evidence/spec.md specs/001-baseline-evidence/design.md .specify/.runtime/hadeel-night-run.md` against `/tmp/hdl-01-preimpl-shasums.txt` captured at T010 and confirm all three hashes are unchanged across the Kimi implementation window — a mismatch on any of the three fails the feature per `specs/001-baseline-evidence/quickstart.md` §5.4–§5.5

### Analyze, review, and fixes

- [x] T068 **Independent report-conformance checkpoint** *(reviewer)* — Claude Opus 5 High (fallback GPT-5.6 Sol High via Codex) reviews `specs/001-baseline-evidence/baseline-report.md` only against the frozen `spec.md`, `plan.md`, `tasks.md`, and data-model rules and records PASS or report-only findings; this is not a second SpecKit Analyze pass and modifies no file
- [x] T069 **Kimi K3 High fixes** — apply every report-conformance finding from T068 to `specs/001-baseline-evidence/baseline-report.md` only; lifecycle-artifact remediation belongs exclusively to the orchestrator before the Kimi window and no other file may be touched
- [x] T070 Re-run the full V1–V21 battery (T046–T066) and the T067 hash comparison against `specs/001-baseline-evidence/baseline-report.md` after the T069 fixes
- [x] T071 **Final Review checkpoint** *(reviewer)* — Claude Opus 5 High (fallback GPT-5.6 Sol High via Codex) reviews `specs/001-baseline-evidence/baseline-report.md` against `spec.md` §5 (all seven FRs), §11 (success criteria), `data-model.md` rules R1.1–R10.1 plus R1A.1–R1A.4, and invariants I-1…I-9, and issues PASS or a findings list; review only, no file modified
- [x] T072 **Kimi K3 High fixes** — apply every Final Review finding from T071 to `specs/001-baseline-evidence/baseline-report.md` only, then re-run T046–T067; repeat T071→T072 until T071 returns PASS

### Human Gate and close-out

- [x] T073 **Human Gate — Yasser acceptance** of `specs/001-baseline-evidence/baseline-report.md` per `specs/001-baseline-evidence/spec.md` §10 final item; the report stays in `validated` and moves to `accepted` only on explicit owner approval. **The Kimi implementation window closes here.**
- [x] T074 *(orchestrator, after acceptance)* Append the HDL-01 completion evidence to `.specify/.runtime/hadeel-night-run.md`: models actually used per phase, V1–V21 results, the T067 hash comparison result, and Yasser's acceptance statement with its timestamp
- [x] T075 *(orchestrator, after acceptance)* Update `specs/001-baseline-evidence/spec.md` and the `HDL-01` row in `ROADMAP.md` from `implementing` to `done`, and add the evidence link to `specs/001-baseline-evidence/baseline-report.md`
- [x] T076 *(orchestrator, after acceptance)* Update only the `status` field of the `HDL-01` entry in `docs/spec-kit/spec-index.json` from `implementing` to `done` — **leave its `classification` value untouched**, since that compound value is the recorded FR-001 divergence owned by the governance owner
- [x] T077 *(orchestrator, after acceptance)* Create the independent HDL-01 commit on `codex/hdl-01-baseline-evidence` containing `specs/001-baseline-evidence/baseline-report.md`, `specs/001-baseline-evidence/tasks.md`, and the T074–T076 close-out updates, with one primary reason and no unrelated work, then re-run `node scripts/check-theme.mjs --build` to confirm `0 errors / 0 warnings`

---

## Dependencies & Parallel Work

### Phase order

```text
Phase 0 (T001–T010)  →  Phase 1 (T011–T015)  →  ┌ US1 (T016–T028) ┐
   orchestrator gates      foundational          │ US2 (T029–T034) │ → Final Phase (T046–T077)
                                                 └ US3 (T035–T045) ┘
```

### Story completion order

| Story | Priority | Depends on | Blocks |
|---|---|---|---|
| **US1** — owner sees what exists and what is missing | P1 | Phase 1 only | Nothing — US2 and US3 do not need it |
| **US2** — developer/agent finds current ownership | P1 | Phase 1 only | Nothing |
| **US3** — QA reviewer gets a comparable baseline | P2 | Phase 1 only | Nothing |

The three stories are genuinely independent: each writes a disjoint set of sections in the same
file. Because they share one file, they are **not** marked `[P]` against each other — run one story
phase at a time, in priority order US1 → US2 → US3, or complete them in any order that suits the
implementer.

### Hard dependencies

- T008 is the pre-implementation SpecKit Analyze gate; any lifecycle-artifact remediation must finish before T009.
- T010 must run **after** T009, or the runtime-log hash will not match at T067.
- T011 blocks every task from T012 onward — the file must exist first.
- T012 and T013 block T046–T065 (V2 needs the header SHA).
- T015 blocks T021; T021 blocks the exhaustive V21 check at T066.
- T016 blocks T027; T017 blocks T025 and T026; T018 blocks T019 and T020; T025 blocks T026.
- T029 blocks T030; T030 blocks T031, T032 and T033.
- T035 blocks T038; T014 blocks T036; T036 blocks T037.
- T046–T066 require every story phase complete.
- T068 requires T046–T067; T069 requires T068; T070 requires T069; T071 requires T070; T072 requires T071.
- T073 requires T071 = PASS. T074–T077 require T073.

### Parallel opportunities

| Where | Parallel set | Why safe |
|---|---|---|
| Phase 0 | T002, T003, T004, T005, T006 | Five independent read-only checks on five different files |
| Phase 1 | T014, T015 | Two independent read-only command groups, no shared write |
| US1 | T016, T017 | Two independent read-only git command groups, staged before any write |
| US2 | T029 | Read-only, may run concurrently with the tail of US1 |
| US3 | T035 | Read-only, may run concurrently with the tail of US2 |
| Final Phase | T046–T063 | Eighteen independent read-only checks over one file |

Not parallel: any two tasks that write to `specs/001-baseline-evidence/baseline-report.md`; T064 and
T065 (both execute repository-state commands and must observe a settled tree); every task in the
review/fix/acceptance chain T068 → T077.

---

## Implementation Strategy

### MVP scope

**MVP = Phase 0 + Phase 1 + User Story 1 (T001–T028).**

At that point `specs/001-baseline-evidence/baseline-report.md` already delivers HDL-01's core
promise: the owner can open one document, see all 29 roadmap rows classified with exactly one
value each, read the launch-ranked risks with named owners, read the bounded five-item Theme Raed
relationship baseline with its prohibition and `HDL-29-FR-011` referral, and see every branch's
state — all pinned to `66b7b69e` with no source file touched. US2 and US3 then make the same
document usable by agents and by QA.

### Incremental delivery

1. **T001–T010** — gates pass, hashes captured, window opens.
2. **T011–T015** — file, header, scope statement, shared evidence staged.
3. **T016–T028** — US1 complete → demo to the owner; V3/V5/V6/V7/V8/V9/V10/V11/V17 pass.
4. **T029–T034** — US2 complete → an agent resolves any capability in one lookup.
5. **T035–T045** — US3 complete → every number replayable; N/A items recorded, no preview run.
6. **T046–T067** — V1–V21 and the approved-artifact hash comparison.
7. **T068–T072** — independent report-conformance review → Kimi fixes → Final Review → Kimi fixes until PASS.
8. **T073–T077** — Yasser accepts, orchestrator appends evidence, updates status, commits.

---

## Notes

- Vague tasks are invalid; every task above names the exact file it reads or writes.
- Every one of the seven `HDL-01-FR-*` requirements maps to at least one implementation task and at least one verification task: FR-001 → T015, T018–T021 / V3, V5, V6, V21; FR-002 → T030–T033 / V12; FR-003 → T036, T037 / V19; FR-004 → T038 / V13, V14; FR-005 → T039 / V15, V16; FR-006 → T022, T023 / V11; FR-007 → T024 / V5.
- A green CLI log is normally not enough for visual behavior — but HDL-01 produces **no** visual behavior, so V1–V21 plus the §5 scope proof replace storefront evidence here (T042–T044). That exemption is bound to this documentation-only spec and does not carry to any spec that produces a customer-facing surface.
- The `raed/preview-images` reference count is **6**, verified by direct `rg` evidence against `twilight.json`.
- The current remote-reference scale is **10 remote refs total**, including the symbolic `origin` alias and `origin/master`; this value is synchronized across `plan.md`, `data-model.md`, and `quickstart.md`, and T016, T027, and T062 require the report to re-measure and explain it.
- No task in this list modifies `src/`, `public/`, `twilight.json`, `src/locales/*.json`, `package.json`, `pnpm-lock.yaml`, `AGENTS.md`, `specs/001-baseline-evidence/spec.md`, or `specs/001-baseline-evidence/design.md` at any point.
