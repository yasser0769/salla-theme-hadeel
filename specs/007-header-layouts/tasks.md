# Tasks: HDL-07 Four Header Layouts

**Input**: `specs/007-header-layouts/spec.md`, `design.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Roadmap ID**: `HDL-07`
**Implementation owner**: Kimi K3 High
**Review owner**: Claude Opus 5 High when available; GPT-5.6 Sol High fallback

## Phase 0: Blocking Product & Design Gates

- [x] T001 Confirm HDL-02 through HDL-06 are complete and move only HDL-07 to `implementing` in `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and `specs/007-header-layouts/spec.md`
- [x] T002 Confirm `specs/007-header-layouts/spec.md` contains no unresolved product ambiguity and preserve HDL-08 menu-content and HDL-09 search-result boundaries
- [x] T003 Confirm Figma Rev 1 approval, page/node coverage, and acceptance gate `460:411` in `specs/007-header-layouts/design.md`
- [x] T004 Record baseline guard, bundle, package, git branch/SHA, and unrelated working-tree changes in `specs/007-header-layouts/evidence/baseline.md`
- [x] T005 Record the resolved Hero, contrast/logo, editor-condition, and Salla-component Spikes from `specs/007-header-layouts/research.md` in `specs/007-header-layouts/evidence/feasibility.md`

**Checkpoint**: No source-code task starts until T001–T005 pass. Figma approval is final; runtime behavior remains unverified.

## Phase 1: Shared Foundation

- [x] T006 Map HDL-07-FR-001 through HDL-07-FR-008 to source, tests, Figma Nodes, and expected evidence in `specs/007-header-layouts/evidence/traceability.md`
- [x] T007 Capture the pre-change normalized CSS snapshot and production bundle sizes in `specs/007-header-layouts/evidence/bundle-before.md`
- [x] T008 [P] Add failing-first fixtures for valid/invalid layout, logo-size, ink, and Boolean settings in `tests/fixtures/header-layouts/settings.json`
- [x] T009 [P] Add failing-first static/runtime-contract tests for one header core, strict allowlists, settings parity, visibility controls, eligible-Hero confinement, and no duplicate listeners/requests in `tests/header-layouts.test.mjs`
- [x] T010 Add the strict HDL-07 checker and a reversible invalid-fixture witness in `scripts/check-header-layouts.mjs`
- [x] T011 Integrate the HDL-07 checker without weakening existing checks in `scripts/check-theme.mjs`
- [x] T012 Extend `header_layout` with only `transparent|commerce` and add safe new HDL-07 Boolean/Items fields with proven condition shapes in `twilight.json`
- [x] T013 Update qualified records, bilingual metadata, safe defaults, allowed values, class maps, owners, and evidence for every HDL-07 field in `src/config/settings-registry.json`
- [x] T014 Extend the strict `header_layout` resolver allowlist while preserving existing defaults/profile maps and add strict logo-size/ink resolution in `src/views/layouts/master.twig`
- [x] T015 Run the focused settings/resolver/header suites and record exact output in `specs/007-header-layouts/evidence/foundation-tests.md`

**Checkpoint**: Invalid input cannot reach a class/attribute, legacy `centered|start` resolution is identical, and all new controls have independent safe defaults.

## Lean Execution Mode — Remaining Work

T001–T015 are complete and frozen. The remaining work is intentionally outcome-led:
one implementation pass, focused verification, one independent review, one exact-SHA
Salla preview, and owner acceptance. Evidence is consolidated into
`evidence/implementation.md`, `evidence/verification.md`, and
`evidence/final-review.md`; screenshots and preview DOM records may live under
`evidence/live/<sha>/`.

### Implementation

- [x] T016 Implement Transparent Header end to end: eligible first-Hero marker, safe `auto|light|dark` ink, ordinary-surface fallback, original-logo preservation, neutral brand plate, store-name fallback, and Top/Scrolled styling using the shared header core in `enhanced-slider.twig`, `header.twig`, `storefront-system.scss`, and `header.scss`
- [x] T017 Implement Commerce Header and the approved search/menu/cart/account/wishlist visibility behavior using the same menu/search/cart/account DOM and native Salla actions in `header.twig`, `storefront-system.scss`, and `main-menu.js` only where shared overflow behavior genuinely needs adjustment
- [x] T018 Complete the one shared Mobile Header and one Sticky/Scrolled controller for all four layouts: logical RTL/LTR CSS, real Boolean gating, 320/390 safety, 44px targets, focus sanity, long/missing logo behavior, and no duplicated listener/controller in `app.js`, `master.twig`, `header.twig`, `header.scss`, and `storefront-system.scss`
- [x] T019 Add or refine only focused contract/regression assertions that protect the four layouts, strict settings, eligible-Hero fallback, legacy `centered|start`, one shared DOM/controller, visibility controls, logical direction, and mobile safety in the existing HDL-07/HDL-03/HDL-04 test files; do not add another checker, fixture, or schema unless a real uncovered defect requires it
- [x] T020 Record the implemented architecture, changed files, bundle/runtime intent, and explicitly unverified live behavior in `specs/007-header-layouts/evidence/implementation.md`

### Focused Verification and Review

- [x] T021 Run the HDL-07 suite plus only the relevant HDL-03 settings, HDL-04 localization/RTL/accessibility, HDL-05 budget, and HDL-06 motion regressions; record exact commands/results in `specs/007-header-layouts/evidence/verification.md`
- [x] T022 Run `npx webpack --mode production`, `node scripts/check-theme.mjs --build --json`, `node scripts/check-bundle-budget.mjs --budget`, and `git diff --check`; record exact size deltas and gate results in `specs/007-header-layouts/evidence/verification.md`
- [x] T023 Run one independent final review after implementation and gates; apply only blocking in-scope Kimi fixes, rerun affected gates, and require `PASS / BLOCKERS: 0` in `specs/007-header-layouts/evidence/final-review.md`

### Exact-SHA Salla Preview and Owner Gate

- [ ] T024 Create one isolated temporary preview worktree/branch from the exact reviewed SHA without mutating the primary tree; record branch/local/upstream/remote SHA in `specs/007-header-layouts/evidence/verification.md`
- [ ] T025 Report the exact preview branch and SHA to Yasser and wait for Partners Portal confirmation before opening a browser or starting Salla Preview
- [ ] T026 Start one Salla Preview from the temporary worktree with Chrome explicit; verify the intended SHA/branch and localhost preview assets, or record `SALLA PREVIEW SYNC FAILURE` without calling code FAIL
- [ ] T027 Practically verify all four layouts on Desktop/Mobile in Arabic RTL and English LTR, including 320/390 safety, basic focus/touch targets, shared DOM/actions, and legacy `centered|start`; save only necessary screenshots/DOM data under `evidence/live/<sha>/`
- [ ] T028 Verify Transparent Top/Scrolled/Fallback, Commerce crowded navigation, and Menu/Search interactions; compare the rendered result with approved Figma Rev 1 and consolidate outcomes/deviations in `specs/007-header-layouts/evidence/verification.md`
- [ ] T029 Present the reviewed exact-SHA result to Yasser and wait for explicit `ACCEPT HDL-07`; do not mark done, commit/push/merge the primary branch, or start HDL-08 before acceptance
- [ ] T030 After acceptance, synchronize HDL-07 `done` status and concise evidence links in `spec.md`, `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and `.specify/.runtime/hadeel-night-run.md`

## Lean Dependencies

1. T016–T020 complete the implementation without revisiting T001–T015.
2. T021–T023 block preview creation.
3. T025 is the Human Gate before browser/preview work.
4. T029 is the owner acceptance gate before completion or HDL-08.
