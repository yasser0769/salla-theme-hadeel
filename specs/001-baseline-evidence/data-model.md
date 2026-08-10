# Phase 1 Data Model: HDL-01 — Report Structure and Validation Rules

> **HISTORICAL BASELINE — publishing interpretation superseded 2026-08-10.** Preserve
> the recorded raw measurements, but do not use their raw-1MB comparison or former 85%
> target as current policy. HDL-05's compressed distributable-package model is authoritative.

**Feature**: `HDL-01` · **Date**: 2026-08-08 · **Baseline commit**: `66b7b69e`  
**Plan**: [plan.md](plan.md) · **Research**: [research.md](research.md) · **Spec**: [spec.md](spec.md)

HDL-01 has no database, no runtime state, and no API. Its "entities" are the **record types that
make up `specs/001-baseline-evidence/baseline-report.md`**. This file defines each record's
fields, its validation rules derived from the `HDL-01-FR-*` requirements, and the report's own
lifecycle — so the report can be checked mechanically rather than reviewed by impression.

**Storage**: one Markdown file. Each entity below is one table or one subsection of that file.
**Cardinality**: exactly one report; no sidecar files, no `evidence/` directory, no JSON export
(research.md R-001).

---

## 0. `ReportHeader` — one instance

Opens the document. Everything downstream is only valid relative to these fields.

| Field | Type | Value at baseline | Rule |
|---|---|---|---|
| `baseline_sha` | full SHA-40 | `66b7b69e3117235c8a614a0502de21ca928e227e` | MUST be the full SHA, not abbreviated; MUST equal `git rev-parse HEAD` at measurement time |
| `branch` | string | `codex/hdl-01-baseline-evidence` | — |
| `comparator_ref` / `comparator_sha` | string / SHA | `origin/master` / `833f19d0` | MUST be accompanied by the ahead/behind counts `0 38` |
| `measurement_date` | ISO date | `2026-08-08` | Absolute date; relative wording ("today", "last night") is forbidden |
| `figma_reference` | file + page + node + revision | `12z0jRutTHcdhlZQrRmcXU`, `359:2`, `359:3`, Rev 1 | MUST match `design.md` exactly |
| `tooling_versions` | list | Node `v26.5.0`, pnpm `10.33.0`, Salla CLI `3.2.45`, Spec Kit `0.16.1` | Any version affecting a reported number MUST be listed |
| `validity_statement` | prose | — | MUST state that the numbers are evidence for this commit **only** and expire at the first source change (`spec.md` §12) |
| `scope_statement` | prose | — | MUST state that HDL-01 changes no file under `src/` or `public/` |

**Validation**: `baseline_sha` MUST appear in the header and be referenced by every numeric
record. A report whose header SHA differs from `git rev-parse HEAD` is stale and MUST be
re-measured, not patched.

---

## 1. `RoadmapSpecRecord` — exactly 29 instances (FR-001)

One per `ROADMAP.md` row, `HDL-01` … `HDL-29`.

| Field | Type | Rule |
|---|---|---|
| `id` | `HDL-NN` | Unique; the set MUST be exactly `HDL-01`…`HDL-29` with no gap and no duplicate |
| `title_ar` | string | From `ROADMAP.md` |
| `phase` | enum | One of the six roadmap phases |
| `primary_classification` | enum | **Exactly one** of `Existing — Audit & Polish` \| `Build` \| `Spike` \| `Deferred`. Compound values are invalid |
| `index_classification` | string | Verbatim `classification` from `docs/spec-kit/spec-index.json` |
| `divergence` | bool | `true` when `primary_classification` ≠ `index_classification`; expected `true` for the 18 compound rows |
| `source_location` | path(s) | Where the capability lives today, or `—` for `Build` rows with no current implementation |
| `expected_evidence` | enum | The evidence type that will accept the row (→ `EvidencePolicyRow.change_type`) |
| `dependencies` | `HDL-NN[]` | From `ROADMAP.md`; MUST match it exactly |

**Validation rules**
- **R1.1** Count MUST be exactly 29 (`spec.md` §11: "29 من 29 صفًا").
- **R1.2** `primary_classification` MUST be single-valued (FR-001).
- **R1.3** Classification MUST be derivable by the ordered rule in research.md R-002; the applied
  rule number SHOULD be inferable from `source_location`.
- **R1.4** `Deferred` MUST cite the governing artifact that defers the row. No row may be deferred
  on the report author's judgement.
- **R1.5** Every row MUST have a non-empty `expected_evidence`; "no row without a classification"
  extends to evidence (`spec.md` §11).
- **R1.6** Rows with `divergence = true` MUST also appear in `OpenDiscrepancyRecord` (as the
  single aggregate discrepancy #2), and the report MUST NOT modify `spec-index.json`.

---

## 1A. `RepositoryInventoryRecord` — exhaustive source register (FR-001)

One row for every member of four objective source sets. This entity prevents inventory counts
from being mistaken for a usable central register.

| Field | Type | Rule |
|---|---|---|
| `record_key` | string | Unique stable key: `page:<path>` \| `component-template:<path>` \| `custom-component:<path>` \| `setting:<id>` |
| `kind` | enum | `page-template` \| `component-template` \| `custom-component` \| `important-setting` |
| `source_location` | path / JSON path | Exact repository source; non-empty |
| `current_state` | enum | `present` \| `missing` \| `spike`; the baseline source sets should resolve to `present` |
| `responsibility_owner` | roadmap ID / named area | Non-empty owner of later audit or change work |
| `selection_basis` | string | Source command/query that included the record |
| `command` / `baseline_sha` | string / SHA | Reproduction evidence required by I-1 |

**Objective source sets**

1. Every `src/views/pages/**/*.twig` file — exactly 21 `page:` keys.
2. Every `src/views/components/**/*.twig` file — exactly 22 `component-template:` keys.
3. Every `twilight.json.components[].path` — exactly 7 `custom-component:` keys.
4. Every `twilight.json.settings[]` record where `type != "static"` — exactly 37 `setting:` keys.

The eight records where `type = "static"` are structural titles/separators rather than
merchant-editable settings. Their count and this exclusion basis MUST be stated in the report;
they MUST NOT be selected or omitted by subjective judgement.

**Validation rules**

- **R1A.1** The four key sets MUST be exactly equal to their repository-derived sets: 21/21,
  22/22, 7/7, and 37/37, with no missing or extra key.
- **R1A.2** `record_key` MUST be unique across the entire register.
- **R1A.3** `source_location`, `current_state`, and `responsibility_owner` MUST be non-empty on
  every row.
- **R1A.4** The report MUST record `static_count = 8` and the objective exclusion reason.

---

## 2. `CapabilityMapRecord` — one per capability in the closed baseline set (FR-002)

Keyed by capability name so User Story 2 resolves in one lookup.

| Field | Type | Rule |
|---|---|---|
| `capability` | string | One member of the closed 14-record baseline set below; human-facing labels may clarify the entry but may not add or omit records |
| `source_paths` | path[] | **At least one** responsible path under `src/` (FR-002) |
| `webpack_entry` | string \| `—` | From `webpack.config.js:11-24`; `—` for Twig/locale rows |
| `public_output` | path \| explicit reason | `public/<name>.js` \| `public/app.css`, **or** the explicit string "no `public/` output — rendered server-side by Salla" / "merged by Salla at publish time" |
| `output_bytes` | integer \| `—` | Exact bytes at baseline |
| `classification` | enum | MUST equal the `primary_classification` of the owning `RoadmapSpecRecord` |
| `salla_components` | `salla-*`[] | Twilight components the capability depends on |

**Validation rules**
- **R2.1** Every major capability MUST have ≥1 source path and a resolved `public_output` field
  (FR-002). A blank cell is invalid; "no output" MUST be stated as a reason, not left empty.
- **R2.2** `public_output` MUST be derived from `webpack.config.js`, never guessed from filename
  similarity.
- **R2.3** The 13 built outputs MUST reconcile: 12 JS + `app.css`, summing with fonts/images to
  the `BundleMeasurement.public_total`.
- **R2.4** The record MUST NOT prescribe an edit. It states what exists; deciding what changes
  belongs to the owning spec (FR-007).
- **R2.5** No record may instruct or imply hand-editing `public/` (`AGENTS.md` rule 1).
- **R2.6** The table MUST contain exactly 14 records: one for each of the 12 baseline webpack entries, one grouped Twig/server-rendered record, and one grouped locale/publish-time record. No ellipsis or subjective "major" selection is allowed.

**Baseline entry set** (authority `webpack.config.js:11-24`): `app`, `home`, `product-card`,
`main-menu`, `wishlist-card`, `add-product-toast`, `digital-files`, `checkout`, `pages`,
`product`, `order`, `testimonials`. The two explicit no-output records are `twig-templates` and
`locales`, yielding the closed 14-record capability set.

---

## 3. `BuildEvidenceRecord` — one per executed command (FR-003)

| Field | Type | Rule |
|---|---|---|
| `command` | string | Verbatim, copy-pasteable, including flags |
| `sha` | SHA | MUST equal `ReportHeader.baseline_sha` |
| `run_date` | ISO date + time + tz | — |
| `exit_status` | success \| failure | Verbatim; a failure MUST be reported as a failure |
| `errors` / `warnings` | integer | Literal counts (FR-003: "عدد الأخطاء والتحذيرات حرفيًا") |
| `duration` | string | Where the tool reports it |
| `key_outputs` | k/v | e.g. `app.css` 784 KiB, `app.js` 125 KiB, `app` entrypoint 909 KiB |
| `notes` | prose | Any substitution or caveat, e.g. the `--output-path` re-run form |

**Baseline instances**

| Command | Result |
|---|---|
| `node scripts/check-theme.mjs --json` | 0 errors, 0 warnings; all five static checks `ok` |
| `node scripts/check-theme.mjs --build --json` | 0 errors, 0 warnings; `public/` matches a fresh production build |
| `npx webpack --mode production` | success in 22.437s; `app.css` 784 KiB, `app.js` 125 KiB, `app` entrypoint 909 KiB; **3** performance warnings |

**Validation rules**
- **R3.1** Numbers MUST be transcribed as the tool printed them, before any interpretation.
- **R3.2** Every record MUST carry `command` + `sha` + `run_date` (`spec.md` §11).
- **R3.3** A doc-vs-runtime conflict MUST become an `OpenDiscrepancyRecord` and MUST NOT be fixed
  inside HDL-01 (FR-003).
- **R3.4** The re-run substitution (research.md R-003) MUST be disclosed in `notes`, not silently
  applied — the reported webpack numbers come from a run at this SHA, and the reproduction command
  uses `--output-path "$(mktemp -d)"` to protect `public/`.

---

## 4. `BundleMeasurement` — one per measured quantity (FR-004)

| Field | Type | Rule |
|---|---|---|
| `measure` | string | e.g. `public/` raw total, `app` entrypoint, `app.css` |
| `value_bytes` | integer | Exact bytes |
| `value_human` | string | KiB/MiB, with the conversion base stated |
| `method` | command | The command that produced it |
| `comparable_to_salla_limit` | bool | **Exactly one** measure may be `true` — the `public/` total (research.md R-004) |
| `confidence` | enum | `confirmed` \| `needs-salla-confirmation` |
| `share_of_total` | percent | For composition rows |

**Baseline instances**

| Measure | Bytes | Human | Comparable | Confidence |
|---|---|---|---|---|
| `public/` raw total (33 files) | 1,557,969 | 1,521.5 KiB | **yes** | method `needs-salla-confirmation` |
| `public/` `du -sk` allocation | — | 1,604 KiB | no | confirmed (machine-dependent) |
| webpack `app` entrypoint | 931,120 | 909 KiB | **no** (build-tool signal) | confirmed |
| `app.css` | 802,732 | 784 KiB · 51.5% | no | confirmed |
| `app.js` | 128,388 | 125 KiB | no | confirmed |
| 12 JS bundles combined | 330,350 | 322.6 KiB · 21.2% | no | confirmed |
| 5 Thmanyah `.woff2` | 385,492 | 376.5 KiB · 24.7% | no | confirmed |
| Salla public ceiling | 1,048,576 / 1,000,000 | 1 MB | reference | `docs/building-a-salla-theme.md:27` |
| Internal target (85%) | 891,289 / 850,000 | — | reference | Constitution V |

**Validation rules**
- **R4.1** Exactly one measure carries `comparable_to_salla_limit = true`.
- **R4.2** The entrypoint number MUST be labelled a build-tool signal wherever it appears, so it
  is never read as a platform limit (`spec.md` clarification 3).
- **R4.3** The overage MUST be stated under **both** MB = 10⁶ (155.8%) and MiB = 2²⁰ (148.6%),
  with the note that the verdict is the same under either.
- **R4.4** The method mismatch with Salla MUST be marked `needs-salla-confirmation` explicitly
  (FR-004).
- **R4.5** The overage MUST be recorded as a **measured baseline, not an improvement target**
  (`spec.md` §10) and MUST NOT be optimised inside HDL-01.

---

## 5. `EvidencePolicyRow` — one per change type (FR-005)

| Field | Type | Rule |
|---|---|---|
| `change_type` | enum | `source-code` \| `build-output` \| `visual` \| `behavioral` \| `performance` \| `invisible` |
| `required_evidence` | string | What proves the change |
| `preview_unavailable_substitute` | string | Temporary substitute when Salla preview is down |
| `visual_evidence_required` | bool | MUST be `false` for `invisible` — the case `spec.md` §5 requires by name |
| `timestamp_rule` | string | Evidence MUST post-date the change (`AGENTS.md` §Definition of done) |

**Validation rules**
- **R5.1** The table MUST contain a row where `visual_evidence_required = false` (`invisible`) —
  this is the row HDL-01 itself falls under.
- **R5.2** The table MUST contain a "Salla preview unavailable" substitute for every row whose
  normal evidence is a preview (FR-005).
- **R5.3** No substitute may claim a local mock-up as evidence about the theme
  (`AGENTS.md` §Evidence rules; Constitution VI).
- **R5.4** Every row MUST require a commit SHA, so no evidence floats free of a code state.
- **R5.5** Preview substitution is **deferral, not waiver** — the change stays unaccepted until
  preview evidence exists.

---

## 6. `RiskRecord` — ranked, one per risk (FR-006)

| Field | Type | Rule |
|---|---|---|
| `rank` | integer | Unique, ascending; launch-blocking risks first |
| `category` | enum | `identity` \| `bundle` \| `performance` \| `rtl-ltr-a11y` \| `preview` \| `branches` \| `doc-drift` — the six `spec.md` §5 categories plus doc-drift |
| `measured_evidence` | string | A measured fact with its producing command. Impressions are invalid |
| `owning_spec` | `HDL-NN` \| named owner | MUST be non-empty (FR-006) |
| `blocks_public_launch` | bool | Explicit yes/no (FR-006) |
| `remediation_note` | prose | MUST state that HDL-01 does not remediate |

**Validation rules**
- **R6.1** All six `spec.md` §5 categories MUST be present.
- **R6.2** The `identity` risk MUST name **HDL-29 via `HDL-29-FR-011`** as owner and MUST NOT
  contain a feature-by-feature comparison (`DECISION HDL-01`).
- **R6.3** Every risk MUST carry a measured evidence string, never a judgement.
- **R6.4** `blocks_public_launch` MUST be explicitly `true` or `false`; blank is invalid.
- **R6.5** No `RiskRecord` may be resolved, mitigated, or downgraded inside HDL-01.

---

## 7. `BranchRecord` — one per remote branch (US1, `spec.md` §8)

| Field | Type | Rule |
|---|---|---|
| `branch` | string | Full ref name |
| `tip_sha` | short SHA | — |
| `state` | enum | `head` \| `identical-to-head` \| `contained-in-head` \| `pending` \| `comparator` \| `comparator-alias` \| `diverged-unrelated` |
| `evidence_command` | string | `git merge-base --is-ancestor` / `git rev-list --left-right --count` |
| `note` | prose | Required for the two edge cases below |

**Validation rules**
- **R7.1** Every remote branch MUST appear with a state (`spec.md` §11: "كل فرع بعيد مذكور بحالته").
- **R7.2** `identical-to-head` MUST carry the note that it is the same commit, not separate work
  — the `spec.md` §8 edge case, measured on `origin/codex/product-buy-button-options` at `66b7b69e`.
- **R7.3** `contained-in-head` MUST carry the note that the branch is merged in substance though
  its name is still open — measured on `origin/codex/figma-product-collection` (`14fbe512`).
- **R7.4** Counts MUST reconcile with `spec.md` §11: 2 merged/identical, 5 dependabot pending,
  1 upstream diverged.
- **R7.5** `upstream/master` MUST be recorded as `diverged-unrelated` with `3333 / 97` and the
  absent merge-base.
- **R7.6** The symbolic `origin`/`origin-HEAD` alias MUST be recorded as `comparator-alias` and
  identified as the same tip as `origin/master`, not counted as separate pending work.

---

## 8. `RelationshipBaselineRecord` — exactly one, exactly five items (DECISION HDL-01)

| Item | Field | Rule |
|---|---|---|
| 1 | `origin_base` | Proven by tree equality: root `8bf2ce6` tree `9d9056896ba1` = Raed `dc902f6` tree `9d9056896ba1`. MUST also state `git merge-base upstream/master HEAD` returns nothing (exit 1) because histories are unrelated. Both facts together (research.md R-007) |
| 2 | `high_level_differences` | Repository/structure level only, a few lines per axis. Feature-level detail is invalid |
| 3 | `similarity_areas` | Risk **signals** for later inspection, explicitly not findings and not verdicts |
| 4 | `identity_risk_owner` | MUST be `HDL-29` via `HDL-29-FR-011`, blocking |
| 5 | `evidence_references` | Both SHAs, both trees, `origin/master` `833f19d0`, `upstream/master` `3bd09f11`, counts `0 38` and `3333 97`, every command, the date |

**Validation rules**
- **R8.1** Exactly five items — no more (scope creep), no fewer (`spec.md` §11: "خمسة بنود من خمسة").
- **R8.2** The record MUST contain an explicit sentence stating that **no feature-by-feature
  comparison is performed in HDL-01** and referring the full audit to `HDL-29-FR-011`.
- **R8.3** **Zero** feature-by-feature comparisons anywhere in the report (`spec.md` §11: "صفر
  مقارنات ميزة بميزة").
- **R8.4** Item 1 MUST NOT report the absent merge-base alone; tree equality MUST accompany it, or
  the record misleads by omission (research.md R-007).
- **R8.5** Item 3 MUST be phrased as signals warranting inspection, never as proven duplication.

---

## 9. `OpenDiscrepancyRecord` — one per contradiction (FR-003)

| Field | Type | Rule |
|---|---|---|
| `documented_claim` | string + file:line | Verbatim |
| `measured_reality` | string + command | Verbatim |
| `proposed_owner` | `HDL-NN` \| named owner | "Proposed" — HDL-01 cannot assign work to another spec |
| `fixed_here` | bool | MUST be `false` for every row |

**Baseline instances**: (1) `AGENTS.md` guard-errors claim vs measured `0/0` → HDL-05;
(2) `spec-index.json` compound classifications vs FR-001 → governance owner (Yasser);
(3) `twilight.json` "fashion theme" vs general-marketplace blueprint → HDL-28, routed by
`HDL-29-FR-011` if it becomes a distinctness FAIL.

**Validation rules**
- **R9.1** `fixed_here` MUST be `false` for all rows (FR-003).
- **R9.2** The file named in a discrepancy MUST NOT be modified by HDL-01.
- **R9.3** Execution is the truth; the document is the recorded gap (FR-003).

---

## 10. `FRSectionAnchor` — exactly 7 instances (`spec.md` §11)

| Field | Type | Rule |
|---|---|---|
| `fr_id` | `HDL-01-FR-00N` | Exactly `001`…`007`, each once |
| `heading` | string | MUST begin with the FR ID so a language-independent `grep` finds it (research.md R-005) |

**Validation**: **R10.1** — 7 of 7 present, each a named section
(`grep -c 'HDL-01-FR-00[1-7]'` over headings MUST return 7 distinct IDs).

---

## Report lifecycle

The one state machine in this feature — the report document itself:

```text
absent ──write──> draft ──quickstart §4 checks pass──> validated
                    │                                      │
                    │<────── any check fails ──────────────┘
                                                           │
                                            owner review ──┴──> accepted
                                                           └──> changes-requested ──> draft
```

| State | Entry condition | Exit condition |
|---|---|---|
| `absent` | before implementation | file created |
| `draft` | file exists | all validation rules R1.1…R10.1 plus R1A.1…R1A.4 pass |
| `validated` | every rule passes and `git status` shows zero impact outside the allowed set | owner reviews |
| `accepted` | Yasser approves (`spec.md` §10 final item) | `ROADMAP.md` `HDL-01` → `done` **in a separate change owned by the workflow, not by HDL-01** |
| `changes-requested` | owner objects | return to `draft` |
| `stale` | any commit after `66b7b69e` touches `src/` | re-measure via quickstart.md §2; **do not** patch numbers in place |

**Transition rule**: a report may not move `draft → validated` while any validation rule fails, and
may not move to `accepted` without explicit owner approval. `stale` is reachable from `validated`
and `accepted` alike — acceptance does not freeze the evidence, it only records that the snapshot
was true at `66b7b69e`.

---

## Cross-entity invariants

| ID | Invariant |
|---|---|
| **I-1** | Every number in the report belongs to a record carrying `command` + `baseline_sha` (`spec.md` §11) |
| **I-2** | Exactly one report file exists under `specs/001-baseline-evidence/`; planning artifacts and `tasks.md` are not reports |
| **I-3** | No record implies or instructs a change to `src/`, `public/`, `package.json`, `pnpm-lock.yaml`, `twilight.json`, `design.md`, `spec.md`, `ROADMAP.md`, or the runtime log |
| **I-4** | `RoadmapSpecRecord.primary_classification` and `CapabilityMapRecord.classification` agree for the same `HDL-NN` |
| **I-5** | `RiskRecord.owning_spec` values are real roadmap IDs or named people; no orphan risk |
| **I-6** | Total of `CapabilityMapRecord.output_bytes` plus fonts and images equals `BundleMeasurement` `public/` total (1,557,969 B) |
| **I-7** | Zero feature-by-feature Theme Raed comparisons anywhere in the document (`DECISION HDL-01`) |
| **I-8** | No customer-facing string and no locale key is introduced (`spec.md` §12) |
| **I-9** | `RepositoryInventoryRecord` keys equal all four repository-derived source sets exactly; counts alone are insufficient (R1A.1…R1A.4) |
