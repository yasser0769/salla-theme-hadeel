---
description: "HDL-02 documentation-only implementation tasks for the approved Figma design system"
---

# Tasks: Figma Design System and Visual Approval Gate

**Input**: `specs/002-figma-design-system/spec.md`, `design.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/visual-spec-handoff.md`, `quickstart.md`
**Roadmap ID**: `HDL-02`
**Approved reference**: Figma Revision 2 · owner statement `APPROVE HDL-02 REV 2`
**Implementation owner**: Kimi K3 High writes/fixes only `specs/002-figma-design-system/design-system-report.md`
**Organization**: Tasks are grouped by the four user stories and every task has an independently checkable file target.

## Format

`[ID] [P?] [US?] Description with exact path`

## Phase 1: Blocking Product, Design, and Scope Gates

- [x] T001 Confirm HDL-01 is `done`, synchronize HDL-02 to `implementing`, and record the transition in `ROADMAP.md`, `docs/spec-kit/spec-index.json`, `specs/002-figma-design-system/spec.md`, and `.specify/.runtime/hadeel-night-run.md`
- [x] T002 Verify `specs/002-figma-design-system/spec.md` contains no unresolved product ambiguity and save the command output to `/tmp/hdl-02-spec-readiness.txt`
- [x] T003 Verify `specs/002-figma-design-system/design.md` records Revision 2, direct Node IDs, Yasser, 2026-08-08, and the exact statement `APPROVE HDL-02 REV 2`; save evidence to `/tmp/hdl-02-design-gate.txt`
- [x] T004 [P] Capture SHA-256 hashes for `specs/002-figma-design-system/spec.md`, `design.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/visual-spec-handoff.md`, `quickstart.md`, and `.specify/.runtime/hadeel-night-run.md` in `/tmp/hdl-02-preimpl-shasums.txt`
- [x] T005 [P] Capture `git status --porcelain -- src public twilight.json package.json pnpm-lock.yaml` in `/tmp/hdl-02-preimpl-source-status.txt` and fail if it is non-empty
- [x] T006 [P] Validate `docs/spec-kit/spec-index.json` parses and its HDL-02 record is unique in `/tmp/hdl-02-index-validation.txt`
- [x] T007 Record the implementation boundary, model routing, zero-runtime budget, and authorized output file in `/tmp/hdl-02-implementation-boundary.txt`

**Checkpoint**: Revision 2 approval is current, protected planning artifacts are hashed, and no theme source task is authorized.

## Phase 2: Shared Validation Foundation

- [x] T008 Extract the approved Node registry rows and direct parity-frame IDs from `specs/002-figma-design-system/design.md` into `/tmp/hdl-02-expected-nodes.txt`
- [x] T009 [P] Extract exact existing setting IDs/options from `twilight.json` and Salla runtime color/font mappings from `src/views/layouts/master.twig` into `/tmp/hdl-02-settings-evidence.txt`
- [x] T010 [P] Validate that `specs/002-figma-design-system/plan.md`, `research.md`, `data-model.md`, and `contracts/visual-spec-handoff.md` contain no template placeholders or unresolved `NEEDS CLARIFICATION`; save output to `/tmp/hdl-02-artifact-readiness.txt`
- [x] T011 [P] Verify the four direct frame URLs in `specs/002-figma-design-system/design.md` encode Node IDs `398:5`, `398:6`, `398:7`, and `398:8`; save output to `/tmp/hdl-02-parity-link-check.txt`
- [x] T012 Reconcile FR-001 through FR-010 from `specs/002-figma-design-system/spec.md` to planned report sections in `/tmp/hdl-02-fr-coverage.txt`

**Checkpoint**: Expected nodes, settings evidence, artifact readiness, and complete FR coverage are reproducible before report implementation.

## Phase 3: User Story 1 — Owner Approves a Known Revision (P1)

**Goal**: Make the exact approved revision, its node identity, and lifecycle independently auditable.
**Independent test**: A reviewer can start from the report, resolve every registered Revision 2 link, and prove approval completeness without consulting chat history.

- [x] T013 [US1] Create the report header, evidence policy, repository baseline, approved Figma file/page/root identity, and scope boundary in `specs/002-figma-design-system/design-system-report.md`
- [x] T014 [US1] Add the complete current Node Registry with canonical name, kind, Node ID, direct URL, viewport/direction, states, revision, status, owner, date, and supersession data to `specs/002-figma-design-system/design-system-report.md`
- [x] T015 [US1] Add the exact Revision 2 ApprovalRecord and the Draft/Review/Approved/Reopened/Superseded transition rules to `specs/002-figma-design-system/design-system-report.md`
- [x] T016 [US1] Mark Revision 1 Superseded and state the material-change conditions that reopen Plan/Tasks/implementation in `specs/002-figma-design-system/design-system-report.md`
- [x] T017 [US1] Verify the report contains one complete ApprovalRecord, all expected Node IDs from `/tmp/hdl-02-expected-nodes.txt`, and no stale Revision 1 implementation reference; save results to `/tmp/hdl-02-us1-validation.txt`

**Checkpoint**: US1 passes when current revision, nodes, approval, and reopen behavior are complete and internally consistent.

## Phase 4: User Story 2 — Designer Reuses the System (P1)

**Goal**: Prove the shared foundations and component families are reusable governed assets rather than detached drawings.
**Independent test**: The report enumerates all foundation categories and exactly nine unique component families totaling 88 variants, with direction/state applicability and no parallel third-party library.

- [x] T018 [US2] Add the foundation inventory for 8 collections, 150 variables, 18 text styles, 5 effect styles, WEB syntax policy, Arabic typography, merchant-controlled color/font mapping, and local/independent asset provenance to `specs/002-figma-design-system/design-system-report.md`
- [x] T019 [US2] Add exactly nine `HDL-02/Shared/…` component-family rows with responsibility, Node ID, variant axes/count, states, directions, and evidence references to `specs/002-figma-design-system/design-system-report.md`
- [x] T020 [US2] Add the Coverage Matrix summary including applicable Default/Hover/Focus/Pressed/Disabled/Loading/Empty/Error/Sold-out states, motion/reduced-motion handoff, contrast/touch/zoom/text-wrap annotations, and explicit N/A reasons to `specs/002-figma-design-system/design-system-report.md`
- [x] T021 [US2] Add the four-frame RTL/LTR parity findings, logical start/end behavior, focus contract, and `What mirrors / What does not mirror / Why` rules to `specs/002-figma-design-system/design-system-report.md`
- [x] T022 [US2] Record the Form Control shared-label repair and the final 16-of-16 property wiring evidence without claiming runtime storefront behavior in `specs/002-figma-design-system/design-system-report.md`
- [x] T023 [US2] Verify there are exactly nine unique component rows, `variant_total = 88`, all foundation counts match, and every family has states/direction evidence; save results to `/tmp/hdl-02-us2-validation.txt`

**Checkpoint**: US2 passes when a later designer can identify and reuse each shared family and its constraints without redrawing it.

## Phase 5: User Story 3 — Developer Traces Design to Real Capability (P1)

**Goal**: Ensure every selectable design decision resolves to confirmed repository/platform evidence or an owned non-implementable Spike.
**Independent test**: Three sampled variants from different families trace through Node Registry and Settings Matrix to an exact source; the total unclassified selectable-variant count is zero.

- [x] T024 [US3] Add a Settings Evidence Matrix with component/node, property, owner, scope, visibility, control source/ID, values/default, mobile difference, evidence status/reference, distinguishing Salla runtime `theme.color`/`theme.font`, existing `twilight.json` IDs, Fixed decisions, and owned Spikes in `specs/002-figma-design-system/design-system-report.md`
- [x] T025 [US3] Add exact values/defaults and source references for `use_theme_font`, `layout_width`, `section_spacing`, `corner_style`, `product_card_style`, `header_layout`, `header_density`, `header_show_wishlist`, and `show_mobile_toolbar` to `specs/002-figma-design-system/design-system-report.md`
- [x] T026 [US3] Record motion-level and new-overlay-field unknowns as `Spike — Not approved for implementation` with later owning specs and decision criteria in `specs/002-figma-design-system/design-system-report.md`
- [x] T027 [US3] Record Code Connect and named-version-history tool constraints with the actual Node-ID/WEB-syntax fallback, without claiming unsupported integration, in `specs/002-figma-design-system/design-system-report.md`
- [x] T028 [US3] Trace at least three merchant-selectable variants from different component families through registry and settings evidence in `specs/002-figma-design-system/design-system-report.md`
- [x] T029 [US3] Compare report setting IDs/options against `/tmp/hdl-02-settings-evidence.txt`, assert zero invented IDs and zero unclassified selectable variants, and save results to `/tmp/hdl-02-us3-validation.txt`

**Checkpoint**: US3 passes when confirmed facts, Fixed decisions, and owned Spikes are disjoint and exhaustive.

## Phase 6: User Story 4 — Later Visual Spec Inherits the Foundation (P2)

**Goal**: Give later specs a complete, blocking design-to-implementation handoff contract.
**Independent test**: A synthetic later-spec record can be evaluated as PASS/FAIL using only the contract and report, including naming, four-way coverage, settings evidence, approval, deviations, and reopen rules.

- [x] T030 [US4] Add the downstream ownership map from HDL-03 through HDL-29 and the shared-component change/reopen rule to `specs/002-figma-design-system/design-system-report.md`
- [x] T031 [US4] Add the required consumer handoff fields and canonical naming examples from `specs/002-figma-design-system/contracts/visual-spec-handoff.md` to `specs/002-figma-design-system/design-system-report.md`
- [x] T032 [US4] Add the Figma → GitHub → rendered Salla evidence chain and DeviationRecord classification/approval requirements to `specs/002-figma-design-system/design-system-report.md`
- [x] T033 [US4] Add a bounded synthetic PASS example and one blocking FAIL example for the handoff contract to `specs/002-figma-design-system/design-system-report.md`
- [x] T034 [US4] Verify every mandatory contract clause has a report reference and every later owner is a real roadmap ID/range; save results to `/tmp/hdl-02-us4-validation.txt`

**Checkpoint**: US4 passes when later specs can apply the governance contract without hidden chat context or relaxed approval rules.

## Phase 7: Polish, Cross-Cutting Verification, and Final Review

- [x] T035 Record build and rendered-preview gates as `N/A — no source change`, plus zero bundle/network/runtime delta, in `specs/002-figma-design-system/design-system-report.md`
- [x] T036 Run every command in `specs/002-figma-design-system/quickstart.md` that applies before final acceptance and save consolidated output to `/tmp/hdl-02-quickstart-validation.txt`
- [x] T037 [P] Run `git diff --check` and validate `docs/spec-kit/spec-index.json`; save results to `/tmp/hdl-02-format-validation.txt`
- [x] T038 [P] Prove zero diff under `src/`, `public/`, `twilight.json`, `package.json`, and `pnpm-lock.yaml`; save results to `/tmp/hdl-02-final-source-status.txt`
- [x] T039 Run `node scripts/check-theme.mjs --build` and save the complete result to `/tmp/hdl-02-theme-guard.txt`
- [x] T040 Compare protected artifact hashes with `/tmp/hdl-02-preimpl-shasums.txt`; allow only the planned lifecycle runtime entry outside `design-system-report.md`, and save results to `/tmp/hdl-02-protected-hash-check.txt`
- [x] T041 Verify all FR-001 through FR-010 and all four story checkpoints are supported by exact report evidence in `/tmp/hdl-02-final-fr-matrix.txt`
- [x] T042 Retry Claude Opus 5 High for independent Final Review; on unavailability, record fallback and run GPT-5.6 Sol High review against `specs/002-figma-design-system/design-system-report.md` with result in `/tmp/hdl-02-final-review.md`
- [x] T043 If T042 reports any blocker, route fixes only to Kimi K3 High in `specs/002-figma-design-system/design-system-report.md`, then rerun T036–T042 until `STATUS: PASS` and `BLOCKERS: 0`
- [x] T044 Present the validated report for Yasser's final `ACCEPT HDL-02` Human Gate without changing HDL-02 to `done`
- [x] T045 After Yasser accepts, set HDL-02 to `done`, add the evidence link, and record acceptance in `ROADMAP.md`, `docs/spec-kit/spec-index.json`, `specs/002-figma-design-system/spec.md`, `specs/002-figma-design-system/design-system-report.md`, and `.specify/.runtime/hadeel-night-run.md`
- [x] T046 Commit only the HDL-02-owned artifacts and lifecycle updates, leaving `.vscode/settings.json` and unrelated untracked paths untouched; record the commit in `.specify/.runtime/hadeel-night-run.md`

## Dependencies & Story Completion Order

```text
Phase 1 gate → Phase 2 foundation
                     ├→ US1 approval identity
                     ├→ US2 reusable system
                     └→ US3 evidence traceability
US1 + US2 + US3 → US4 downstream contract → final verification → owner acceptance
```

- US1, US2, and US3 are independently testable but their Kimi edits are sequential because they touch the same report file.
- US4 depends on the stable identities and evidence rules produced by US1–US3.
- T004–T006 and T009–T011 are parallel read-only checks with distinct `/tmp` outputs.
- T037 and T038 are parallel final checks; T039–T043 are sequential gates.

## Parallel Execution Examples

```text
# Before implementation
T004 protected hashes || T005 source scope || T006 JSON validation

# Shared foundation
T009 settings evidence || T010 artifact readiness || T011 parity links

# Final verification
T037 format/JSON || T038 source-scope proof
```

Do not parallelize T013–T033: they update one Kimi-owned report and must preserve a coherent narrative.

## Implementation Strategy

1. **MVP — US1**: freeze the approved revision, complete registry, and approval lifecycle.
2. **Reusable foundation — US2**: prove shared families, states, direction, and counts.
3. **Traceability — US3**: classify every setting/variant decision using real evidence.
4. **Handoff — US4**: make the contract consumable by later specs.
5. **Independent gate**: verify source isolation, guard, requirements, and final review before asking for acceptance.

## Coverage Map

| Requirement | Implementation tasks | Verification tasks |
|---|---|---|
| FR-001 | T013–T016 | T017, T041 |
| FR-002 | T021 | T023, T041 |
| FR-003 | T020–T022 | T023, T041 |
| FR-004 | T024–T029 | T029, T041 |
| FR-005 | T024–T026 | T029, T041 |
| FR-006 | T019, T031 | T023, T034 |
| FR-007 | T015–T016 | T017, T042 |
| FR-008 | T032 | T034, T042 |
| FR-009 | T013, T035 | T038–T041 |
| FR-010 | T030–T033 | T034, T040 |

## Notes

- Production build and Salla preview are not run because HDL-02 changes no storefront source; a source diff invalidates this task list and activates the full build/preview gate.
- Figma evidence proves visual intent only; do not claim runtime direction, keyboard, ARIA, performance, or accessibility scores.
- Kimi implementation/fixes are restricted to `design-system-report.md`; GPT/Claude lifecycle work may mark tasks and statuses but must not rewrite the Kimi report.
- User-owned `.vscode/settings.json`, package files, and unrelated untracked paths remain untouched.
