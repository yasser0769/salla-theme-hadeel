# Tasks: HDL-03 — Settings Architecture and Preset Engine

**Input**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`  
**Required execution order**: Setup → blocking migration/editor Spike → foundational contracts → independently testable user stories → live verification  
**Implementation/fix model**: Kimi K3 High only

## Phase 1 — Setup and measured baseline

- [X] T001 Record commit SHA, current guard result, public file SHA/byte manifest, app.css/app.js raw+gzip sizes, and CSS snapshot in `specs/003-settings-preset-engine/evidence/baseline/manifest.json`
- [X] T002 [P] Record the exact 45-global/62-component recursive Twilight inventory and qualified-key rules in `specs/003-settings-preset-engine/evidence/baseline/settings-inventory.json`
- [X] T003 [P] Capture the six legacy setting IDs, types, defaults, exact options, class prefixes, and base variants from `twilight.json`, `src/views/layouts/master.twig`, and `src/assets/styles/04-components/storefront-system.scss` in `specs/003-settings-preset-engine/evidence/baseline/legacy-class-contract.json`
- [X] T004 Confirm no pre-existing guard errors and no `package.json`/`pnpm-lock.yaml` changes, then record the preflight result in `specs/003-settings-preset-engine/evidence/baseline/preflight.md`

## Phase 2 — Foundational migration/editor Spike (blocking)

**Gate**: Complete T005–T009 before any task that changes `twilight.json` or `src/`. If a disposable Salla draft is inaccessible, record `not verified`; do not infer platform behavior or weaken the compatibility boundary.

- [X] T005 Capture pre-schema configured-draft save/reload behavior for Boolean, String, Items, unset, explicit-default, and non-default values in `specs/003-settings-preset-engine/evidence/migration-spike/pre-schema-store.md`
- [X] T006 [P] Capture fresh-draft materialization and Twig return shapes for the same field families in `specs/003-settings-preset-engine/evidence/migration-spike/fresh-store.md`
- [X] T007 Test the exact global equality-condition shape, companion-mode defaults, option additions/removals, and hidden-value persistence in `specs/003-settings-preset-engine/evidence/migration-spike/editor-contract.md`
- [X] T008 Search captured platform state for a supported fresh-versus-existing marker and document the evidence-backed result in `specs/003-settings-preset-engine/evidence/migration-spike/migration-decision.md`
- [X] T009 Lock `preset_engine_enabled=false` as the compatibility boundary when no supported distinction exists, and record all unsupported editor behaviors as non-selectable Spikes in `specs/003-settings-preset-engine/evidence/migration-spike/gate-result.md`

**Preview-sync exception (owner policy, updated 2026-08-09):** A recorded `SALLA PREVIEW SYNC FAILURE` does not fail code. Before any browser preview, report the temporary branch and SHA and wait for the owner to confirm that branch in Partners Portal. Only an owner-confirmed signed storefront/editor whose branch-specific implementation renders may support live claims. T005 is verified on configured draft `797574311`. T006 captured before/after-first-save materialization on owner-confirmed draft `524850391`; it is explicitly a fresh draft, not proof of a fresh theme installation. T007 is concluded with the exact condition, companion default, and hidden-value persistence verified; option removal/re-addition remains `NOT VERIFIED` and is not relied on by HDL-03. Later phases retain `preset_engine_enabled=false`, no automatic migration, no editor write API, unchanged legacy option lists, and allowlisted runtime fallback regardless of editor behavior.

## Phase 3 — Shared contracts and validation foundation

- [X] T010 Create the canonical qualified settings registry for all 45 globals and 62 component/nested fields in `src/config/settings-registry.json`
- [X] T011 Add the four exact profiles as `PresetProfile` objects with six bootstrap follower maps, ownership, versions, and deferred-owner fields in `src/config/settings-registry.json`
- [X] T012 [P] Add reusable baseline and deliberately-invalid fixtures for registry/profile checks in `tests/fixtures/settings-preset-engine/valid.json` and `tests/fixtures/settings-preset-engine/invalid.json`
- [X] T013 Implement strict recursive Twilight-to-registry coverage, qualified uniqueness, required metadata, default/options parity, owner/source, mode pairing, profile-map, allowlist, and base-variant validation in `scripts/check-settings-registry.mjs`
- [X] T014 Make `scripts/check-settings-registry.mjs --strict` prove the invalid fixture fails and the valid fixture passes without mutating repository files in `scripts/check-settings-registry.mjs`
- [X] T015 Integrate the strict registry contract into the normal and `--build` flows without changing existing checks in `scripts/check-theme.mjs`
- [X] T016 Add the shared pure resolution reference and fixture loaders for Node tests in `tests/helpers/settings-preset-engine.mjs`
- [X] T017 Verify T010–T016 with `node scripts/check-settings-registry.mjs --strict` and `node scripts/check-theme.mjs`, recording exact output in `specs/003-settings-preset-engine/evidence/contracts/foundation.md`

**Live-preview packaging correction (2026-08-09):** The owner-confirmed draft `1402312628` rendered `<!-- Error In This View! (File [src/views/partials/preset-classes.twig] Not Found) --!>` with HTTP 200 and localhost:8000 asset preloads — a real runtime code failure, not a preview-sync failure. Salla server rendering does not package a new top-level `src/views/partials/` directory (no such committed directory exists; every shipped Twig lives under `layouts/`, `pages/`, `components/`). Fix: the centralized resolver was moved inline into `src/views/layouts/master.twig` with identical resolution semantics, `src/views/partials/` was removed, and the T019 parity test now pins the shipped maps inside `master.twig`. The T023/T024/T030/T031/T036 task texts in this file were updated to the corrected path.

## Phase 4 — User Story 1: Safe preset start (P1)

**Goal**: A merchant explicitly enrolls, chooses one of four profiles, and gets safe visual classes without content or commerce changes.

**Independent test**: Engine-off output matches all legacy combinations; engine-on with every follower in Follow resolves all four maps and emits exactly one allowlisted class per family.

- [X] T018 [P] [US1] Add Node tests for engine-off parity across all 324 legacy class combinations in `tests/settings-preset-engine.test.mjs`
- [X] T019 [P] [US1] Add Node tests for all four profiles × six followers, deterministic output, idempotence, and one-class-per-family in `tests/settings-preset-engine.test.mjs`
- [X] T020 [P] [US1] Add contract tests proving no profile owns color/font, content, page order, price, availability, options, or purchase actions in `tests/settings-preset-engine.test.mjs`
- [X] T021 [US1] Add `preset_engine_enabled`, `preset_profile`, and the six dormant `*_mode` controls without changing legacy IDs/types/options/defaults, preserving Basic-before-Advanced order in `twilight.json`
- [X] T022 [US1] Add at most one static Follow-versus-Custom scope explanation and use only the Spike-proven global condition shape, or keep new controls visible if unverified, in `twilight.json`
- [X] T023 [US1] Implement allowlisted engine-off, profile, mode, and safe-default resolution in `src/views/layouts/master.twig` (inline resolver block; see the live-preview packaging note below)
- [X] T024 [US1] Include the resolver once, emit its exact resolved classes, and preserve all existing merchant color/font properties in `src/views/layouts/master.twig`
- [X] T025 [US1] Add non-customer-facing profile/source/validation evidence attributes without rendering warning copy in `src/views/layouts/master.twig`
- [X] T026 [US1] Run the US1 tests and static guards and record exact results in `specs/003-settings-preset-engine/evidence/tests/us1.md`

## Phase 5 — User Story 2: Persistent Custom overrides (P1)

**Goal**: A Custom value survives profile switches/save/reload, while followers change and one field can explicitly return to Follow.

**Independent test**: Set one valid semantic Custom value, switch profile, serialize/reload, then return only that field to Follow; the Custom store never mutates and unrelated modes remain unchanged.

- [X] T027 [P] [US2] Add tests proving valid Custom wins over every profile and invalid Custom cannot reach a class in `tests/settings-preset-engine.test.mjs`
- [X] T028 [P] [US2] Add tests for one/multiple Custom values across profile switches and serialization/reload in `tests/settings-preset-engine.test.mjs`
- [X] T029 [P] [US2] Add tests proving per-field return to Follow affects only that field and preserves the stored Custom value in `tests/settings-preset-engine.test.mjs`
- [X] T030 [US2] Complete mode normalization and no-write Custom resolution paths in `src/views/layouts/master.twig` (inline resolver block)
- [X] T031 [US2] Verify no `theme.settings.set()`, client storage, listener, observer, API, or runtime request implements persistence in `src/views/layouts/master.twig`
- [X] T032 [US2] Run the US2 tests and record exact state-transition results in `specs/003-settings-preset-engine/evidence/tests/us2.md`

## Phase 6 — User Story 3: Safe existing-store migration (P1)

**Goal**: Unknown or old data never breaks the storefront, overwrites merchant data, or produces an unknown class.

**Independent test**: Unknown preset/mode/legacy/Custom/profile values produce documented allowlisted fallbacks plus a traceable `needs_review` marker; disabling the engine restores valid legacy output.

- [X] T033 [P] [US3] Add tests for exact fallback precedence on invalid preset, unknown mode, invalid legacy/Custom value, and missing profile map in `tests/settings-preset-engine.test.mjs`
- [X] T034 [P] [US3] Add no-mutation tests that deep-freeze inputs and compare serialized stores before/after resolution in `tests/settings-preset-engine.test.mjs`
- [X] T035 [P] [US3] Add rollback-fixture tests proving new stored IDs are ignored and the six old values reproduce baseline classes when the engine is disabled in `tests/settings-preset-engine.test.mjs`
- [X] T036 [US3] Implement unknown-mode valid-Custom preservation, invalid-Custom profile fallback, safe-default fallback, and aggregated `needs_review` evidence without customer-visible warnings in `src/views/layouts/master.twig` (inline resolver block)
- [X] T037 [US3] Ensure invalid raw setting text is absent from all rendered class and data-attribute output in `src/views/layouts/master.twig`
- [X] T038 [US3] Run the US3 tests and record fallback/rollback results in `specs/003-settings-preset-engine/evidence/tests/us3.md`

## Phase 7 — User Story 4: Complete maintainable registry (P2)

**Goal**: Maintainers can detect duplicated qualified identities, missing ownership/default/fallback/source, registry drift, or unsafe class values before release.

**Independent test**: The current registry passes; one isolated defect for each rule fails with an actionable qualified key and leaves the valid repository clean.

- [X] T039 [P] [US4] Add tests for all 45 global records, all 62 component/nested records, and legal repeated raw component IDs in `tests/settings-preset-engine.test.mjs`
- [X] T040 [P] [US4] Add tests for missing owner/default/fallback/source, changed legacy meaning/type/options, bad profile IDs, incomplete maps, and illegal values in `tests/settings-preset-engine.test.mjs`
- [X] T041 [P] [US4] Add tests requiring selectors for non-default class values and `base_variant: true` for `minimal`, `centered`, and `comfortable` in `tests/settings-preset-engine.test.mjs`
- [X] T042 [US4] Make checker diagnostics include the qualified registry key, source path, violated rule, and expected value in `scripts/check-settings-registry.mjs`
- [X] T043 [US4] Confirm every `theme.settings.get()` global key is declared and registered while component-local duplicates remain scoped in `scripts/check-settings-registry.mjs`
- [X] T044 [US4] Run the US4 tests and broken-fixture witness and record exact output in `specs/003-settings-preset-engine/evidence/tests/us4.md`

## Phase 8 — Polish, live evidence, and release gates

- [X] T045 Run `node scripts/check-settings-registry.mjs --strict` and `node --test tests/settings-preset-engine.test.mjs`, recording zero failures in `specs/003-settings-preset-engine/evidence/final/automated.md`
- [X] T046 Run `npx webpack --mode production` and `node scripts/check-theme.mjs --build --json`, recording exact build/guard output in `specs/003-settings-preset-engine/evidence/final/build-guard.md`
- [X] T047 Compare CSS snapshots, public SHA manifests, raw sizes, gzip sizes, entries, dependencies, and chunks against T001 and record a zero HDL-03 delta in `specs/003-settings-preset-engine/evidence/final/bundle-network.md`
- [X] T048 [P] Capture engine-disabled Arabic RTL at 320×800 and 1366×768 with current DOM JSON and paired screenshots in `specs/003-settings-preset-engine/evidence/live/final-662eca99/legacy-ar/`
- [X] T049 [P] Capture engine-disabled English LTR at 320×800 and 1366×768 with current DOM JSON and paired screenshots in `specs/003-settings-preset-engine/evidence/live/final-662eca99/legacy-en/`
- [X] T050 Capture all four profiles with identical product/content/state and all followers at Arabic RTL/English LTR mobile+desktop in `specs/003-settings-preset-engine/evidence/live/final-662eca99/profiles/`
- [X] T051 Capture Luxury → one semantic Custom → Modern → save/reload, proving the Custom class is stable and at least one follower changes, in `specs/003-settings-preset-engine/evidence/live/final-662eca99/custom-switch/`
- [X] T052 Capture return of only that field to Follow in Arabic RTL and English LTR critical states in `specs/003-settings-preset-engine/evidence/live/final-662eca99/return-follow/`
- [X] T053 Capture keyboard sequence, visible focus, long Arabic/English labels, 320px overflow, price, availability, options, and CTA visibility in `specs/003-settings-preset-engine/evidence/live/final-662eca99/accessibility-commerce/` (capture complete; FR-017 product overflow and one off-screen focus finding remain open for Final Review/owner disposition)
- [X] T054 Canonicalize before/after resource URLs and prove zero HDL-03-attributable network URLs in `specs/003-settings-preset-engine/evidence/final/bundle-network.md`
- [X] T055 Rebuild production after preview and rerun all contract, test, guard, and diff checks in `specs/003-settings-preset-engine/evidence/final/post-preview.md`
- [X] T056 Execute the rollback drill against a saved post-feature fixture and record exact restored legacy classes in `specs/003-settings-preset-engine/evidence/final/rollback.md`
- [X] T057 Verify every accepted screenshot/DOM timestamp is later than the final source change and every preview capture contains an asset matching `localhost:<CLI-reported-port>` in `specs/003-settings-preset-engine/evidence/final/evidence-index.json`
- [X] T058 Update requirement, story, task, test, Figma-node, source, and evidence traceability in `specs/003-settings-preset-engine/evidence/final/traceability.md`
- [X] T059 Update implementation status and actual model/evidence refs without marking owner acceptance in `specs/003-settings-preset-engine/spec.md`, `specs/003-settings-preset-engine/design.md`, `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and `.specify/.runtime/hadeel-night-run.md`
- [X] T060 Run `git diff --check`, inspect the complete scoped diff, and confirm `.vscode/settings.json`, `package.json`, `pnpm-lock.yaml`, and unrelated goal files are untouched in `specs/003-settings-preset-engine/evidence/final/repository-check.md`

## Dependencies

```text
Phase 1
  └─> Phase 2 migration/editor Spike (blocking)
        └─> Phase 3 shared contracts
              ├─> US1 safe preset start
              │     ├─> US2 Custom persistence
              │     └─> US3 safe migration/fallback
              └─> US4 registry maintenance
                    └─> Phase 8 live verification and release gates
```

- US1 is the MVP and must pass before live preset evidence.
- US2 depends on the US1 activation/profile path, but its state-transition tests remain independently runnable.
- US3 depends on the shared allowlists and is independently testable with invalid fixtures.
- US4 depends only on Phase 3 and may proceed in parallel with US1–US3 once the canonical registry exists.
- Phase 8 begins only after every story's independent test passes.

## Parallel execution examples

- Setup: T002 and T003 can run in parallel after T001 establishes the commit.
- Spike: T005 and T006 can run in parallel on separate disposable drafts; T007–T009 consume both.
- Foundation: T011 and T012 can run in parallel after the registry shape in T010.
- US1: T018–T020 can be authored in parallel before T021–T025.
- US2: T027–T029 are independent test groups.
- US3: T033–T035 are independent invalid/no-mutation/rollback test groups.
- US4: T039–T041 are independent checker test groups.
- Live evidence: T048 and T049 can run in parallel only if both use the same committed source and equivalent content/state.

## Implementation strategy

1. Prove platform and migration limits; do not guess.
2. Build the canonical registry/checker and witness deliberate failures.
3. Deliver US1 as the MVP behind a disabled-by-default compatibility boundary.
4. Add Custom persistence and invalid-data safety through pure no-write resolution.
5. Complete registry drift protection.
6. Verify against the signed Salla preview, restore production output, and hand the evidence to independent Final Review.

## Format validation

- Total tasks: 60 (`T001`–`T060`).
- Story tasks: US1 9, US2 6, US3 6, US4 6.
- Parallel-safe tasks: 18.
- Every executable task uses `- [ ] T###`, optional `[P]`, required `[US#]` only inside story phases, and at least one exact repository path.
