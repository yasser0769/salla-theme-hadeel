# Tasks: HDL-04 — Localization, RTL/LTR, and Accessibility

**Inputs**: `spec.md`, approved `design.md`, compact `plan.md`
**Mode**: HADEEL LEAN MODE
**Implementer**: Kimi K3 High

## Phase 1 — Foundation

- [x] T001 Add the HDL-04 static contract and Node tests for locale parity, forbidden literals/direction detection, positive tabindex, global link focus suppression, LTR-scoped letter spacing, toolbar order, directional exceptions, and dropdown/collapse ARIA in `scripts/check-localization-a11y.mjs`, `scripts/check-theme.mjs`, and `tests/localization-rtl-accessibility.test.mjs` (FR-001…FR-006).

## Phase 2 — Arabic RTL customer flow (US1, P1)

- [x] T002 [US1] Add paired Hadeel accessibility strings and replace theme-owned accessible/visible literals in `src/locales/ar.json`, `src/locales/en.json`, `src/views/pages/blog/{index,single}.twig`, `src/views/layouts/customer.twig`, `src/views/pages/{cart,landing-page,thank-you}.twig`, and affected `src/views/components/home/*.twig` templates (FR-001, FR-005).
- [x] T003 [US1] Remove custom direction inference in `src/assets/js/partials/{product-card,main-menu}.js`; put Collection toolbar DOM in logical filter → density → sort order in `src/views/pages/product/index.twig`, remove its CSS direction reversal in `src/assets/styles/04-components/collection.scss`, and keep mirroring limited to directional icons (FR-002, FR-003, FR-004).
- [x] T004 [US1] Remove only the global link focus suppression, scope every theme-owned non-zero letter-spacing declaration inside its owning rule to LTR, and add only evidence-driven long-text safeguards in `src/assets/styles/02-generic/reset.scss` and the affected files under `src/assets/styles/04-components/` (FR-005, FR-006, FR-007).

## Phase 3 — English LTR parity (US2, P1)

- [x] T005 [US2] Verify the same templates, controls, prices, mixed-direction strings, icon rules, and long-content states use identical DOM/functionality in LTR; fix only parity gaps in the files already touched by T002–T004 (FR-001, FR-002, FR-003, FR-007).

## Phase 4 — Keyboard and assistive technology (US3, P2)

- [x] T006 [US3] Make the Blog category dropdown and product note/file collapses expose correct type/name/controls/expanded state and support Escape plus focus return without visual/DOM divergence in `src/views/pages/blog/index.twig`, `src/views/pages/partials/product/options.twig`, and `src/assets/js/app.js`; verify affected controls have visible focus and accessible names (FR-004, FR-005, FR-008).

## Final phase — Gates, evidence, and review

- [x] T007 Run `node --test tests/localization-rtl-accessibility.test.mjs`, `node scripts/check-theme.mjs --json`, CSS before/after snapshot, `npx webpack --mode production`, `node scripts/check-theme.mjs --build`, bundle-budget comparison, and `git diff --check`; save concise outputs under `specs/004-localization-rtl-accessibility/evidence/` (FR-001…FR-008).
- [ ] T008 Validate the approved four-way RTL/LTR matrix plus affected routes from a proven `preview/hdl-04-<short-sha>` worktree/branch, record branch/SHA/lang/dir/focus/overflow/contrast/Lighthouse evidence under `specs/004-localization-rtl-accessibility/evidence/`, and classify stale Salla output as `SALLA PREVIEW SYNC ISSUE` (FR-002…FR-008).
- [x] T009 Run independent Claude Opus 5 High review (GPT-5.6 Sol High fallback) against the Spec, approved Figma, plan/tasks, diff, tests, and live evidence; route every blocker to Kimi K3 High until `STATUS: PASS` and `BLOCKERS: 0`, then create the focused HDL-04 commit and update `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and `.specify/.runtime/hadeel-night-run.md`.

T008 has partial Arabic evidence from the proven preview commit and remains open by design. The missing English/LTR, post-fix collapse, Blog, populated Collection, contrast, and Lighthouse checks carry to the owner’s integrated manual checkpoint after HDL-07; they are not silently accepted here.

## Dependencies and independent checks

- T001 precedes T002–T006 so each fix is guarded. T002–T004 precede T005; T006 can be verified independently after T002. T007 precedes T008; T008 precedes T009.
- US1 passes independently when Arabic RTL has localized names, runtime direction, visible focus, zero non-scoped letter spacing, and safe long content.
- US2 passes independently when the same semantic state and action set works in English LTR without reversed non-directional media/icons.
- US3 passes independently when keyboard users can open/close/escape the affected controls in logical DOM order with visible focus and meaningful names.
- No task changes `package.json`, `pnpm-lock.yaml`, merchant settings, or generated `public/` by hand.
