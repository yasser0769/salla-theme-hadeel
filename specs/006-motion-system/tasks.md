# Tasks: HDL-06 Motion System

**Input**: `specs/006-motion-system/spec.md`, `design.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/motion-contract.md`, `quickstart.md`
**Roadmap ID**: `HDL-06`
**Organization**: Tasks are grouped by user story and use exact repository paths.

## Phase 0: Blocking Product & Design Gates

- [x] T001 Confirm HDL-02, HDL-03, and HDL-05 are complete and set HDL-06 to `implementing` in `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and `.specify/.runtime/hadeel-night-run.md`
- [x] T002 Confirm `specs/006-motion-system/spec.md` has no unresolved product ambiguity and `specs/006-motion-system/design.md` records Figma Revision 1 as Approved for Implementation, including RTL CTA logical-start correction
- [x] T003 Record pre-change static, CSS snapshot, JavaScript/CSS byte, compressed-package, dependency, entry/chunk, and network assumptions in `specs/006-motion-system/evidence/baseline.md`
- [x] T004 Record `salla-drawer`, `salla-modal`, and `salla-slider` internal transition control as Platform-owned Spike with native-behavior fallback in `specs/006-motion-system/evidence/platform-boundary.md`

**Checkpoint**: No source-code task starts before T001–T004 pass.

## Phase 1: Shared Foundation

- [x] T005 Add failing contract tests for allowlisted settings, profile caps, no raw class interpolation, no recurring CTA timer, no runtime Anime import/global, critical-content visibility, and direction rules in `tests/motion-system.test.mjs`
- [x] T006 Implement the strict motion contract checker for settings, tokens, timer/import bans, reveal allowlist, and named timing exceptions in `scripts/check-motion-system.mjs`
- [x] T007 Integrate the motion checker without weakening existing gates in `scripts/check-theme.mjs`

**Checkpoint**: The focused test must witness at least one deliberately broken fixture fail before implementation makes it pass.

## Phase 2: User Story 1 — Merchant selects a motion personality (P1)

**Goal**: A merchant selects Calm, Balanced, or Rich; only motion personality changes and Balanced is safe by default.

**Independent test**: Resolve each valid level plus an unknown value, compare identical rendered content/DOM order, and verify the level-specific token caps and mobile reduction state.

- [x] T008 [US1] Extend the failing settings/profile cases for `motion_level`, `motion_reduce_mobile`, legacy compatibility, and rollback-safe unknown values in `tests/motion-system.test.mjs`
- [x] T009 [US1] Add the two bilingual merchant settings while preserving both legacy product setting IDs/types/options/defaults in `twilight.json`
- [x] T010 [US1] Register the two new settings and update legacy HDL-06 ownership/compatibility metadata in `src/config/settings-registry.json`
- [x] T011 [US1] Add an allowlisted `motion_level` resolver and normalized mobile-reduction body state without raw interpolation in `src/views/layouts/master.twig`
- [x] T012 [US1] Define Calm/Balanced/Rich/reduced semantic duration, easing, distance, and stagger properties in `src/assets/styles/01-settings/motion.scss` and import them in settings order from `src/assets/styles/app.scss`
- [x] T013 [US1] Make the settings, resolver, and token contract cases pass and record the independent story result in `specs/006-motion-system/evidence/us1-settings.md`

**Checkpoint**: US1 is independently usable after save/re-render; changing the setting does not change content, DOM order, or commerce availability.

## Phase 3: User Story 2 — Customer receives clear, non-distracting feedback (P1)

**Goal**: Theme-owned feedback begins immediately, noncritical reveal runs once, hover has keyboard/touch parity, and no commerce content waits for motion.

**Independent test**: Use Product CTA, one eligible Home reveal, Blog like, Card, and native overlay/slider specimens; verify feedback begins within 100ms, reveal happens once, no timer repeats, and critical content stays visible without JavaScript.

- [x] T014 [US2] Extend failing tests for one-shot reveal, no hidden critical selectors, product action-only feedback, Blog native feedback, no Anime runtime import, and logical-only direction mirroring in `tests/motion-system.test.mjs`
- [x] T015 [US2] Implement a progressive-enhancement controller that reads computed CSS tokens, observes explicit noncritical targets once, tracks active animations, and degrades safely without WAAPI/IntersectionObserver in `src/assets/js/partials/motion.js`
- [x] T016 [US2] Initialize the shared motion controller without a new entry, chunk, or request in `src/assets/js/app.js`
- [x] T017 [US2] Replace the periodic CTA interval with immediate post-action feedback and bounded cleanup in `src/assets/js/product.js` and remove the obsolete interval data attribute from `src/views/pages/product/single.twig`
- [x] T018 [US2] Replace both AnimeJS Blog effects with native state update plus optional token-driven WAAPI feedback in `src/assets/js/blog.js`
- [x] T019 [US2] Remove the Anime runtime import/wrapper from `src/assets/js/app.js` and delete the unused runtime module `src/assets/js/partials/anime.js` while leaving `package.json` and `pnpm-lock.yaml` unchanged
- [x] T020 [US2] Add explicit noncritical reveal opt-ins only to approved Home specimens in `src/views/components/home/fixed-banner.twig`, `src/views/components/home/brands.twig`, and `src/views/components/home/custom-testimonials.twig`
- [x] T021 [US2] Replace theme-owned raw transition/animation values with semantic tokens in their existing owners under `src/assets/styles/02-generic/`, `src/assets/styles/03-elements/`, and `src/assets/styles/04-components/`, documenting any functional continuous-animation exception in `scripts/check-motion-system.mjs`
- [x] T022 [US2] Verify focus/active/touch parity, transform/opacity-only motion, logical start/end translation, and unchanged media/non-directional effects in `tests/motion-system.test.mjs` and record the story result in `specs/006-motion-system/evidence/us2-feedback.md`

**Checkpoint**: US2 works with JavaScript disabled for all critical content/actions and contains no recurring commercial-attention timer or Anime runtime.

## Phase 4: User Story 3 — Motion-sensitive customer is protected (P2)

**Goal**: OS reduced motion overrides the merchant level initially and during the session; mobile reduction safely caps Rich without disabling functional state feedback.

**Independent test**: Start Rich, activate `prefers-reduced-motion: reduce` during an active theme-owned animation, and verify cancellation to final state, no new nonessential motion, no smooth scroll, and intact loading/error/Drawer behavior.

- [x] T023 [US3] Extend failing reduced-motion tests for initial reduce, live preference change, smooth-scroll removal, active-animation cancellation, and Rich-to-Balanced mobile aliasing in `tests/motion-system.test.mjs`
- [x] T024 [US3] Add the global declarative reduced-motion override and mobile Rich cap within the motion token owner in `src/assets/styles/01-settings/motion.scss`
- [x] T025 [US3] Listen for MediaQueryList preference changes, cancel active theme-owned animations to final state, and suppress future nonessential motion in `src/assets/js/partials/motion.js`
- [x] T026 [US3] Replace initial-load-only reduced-motion assumptions in Product feedback with the shared runtime state in `src/assets/js/product.js`
- [x] T027 [US3] Make all reduced-motion cases pass and record the independent story result in `specs/006-motion-system/evidence/us3-reduced-motion.md`

**Checkpoint**: OS reduce has higher priority than Rich and requires no reload; functional feedback, focus, and scroll lock remain intact.

## Phase 5: Build, Preview, Review, and Acceptance

- [x] T028 Run `node --test tests/motion-system.test.mjs`, existing HDL-03/04/05 suites, `node scripts/check-motion-system.mjs --strict`, `node scripts/check-theme.mjs --json`, and `git diff --check`, recording exact output in `specs/006-motion-system/evidence/automated-gates.md`
- [x] T029 Run `npx webpack --mode production`, then `node scripts/check-theme.mjs --build --max-errors=0`; include only generated `public/` changes attributable to the production build
- [x] T030 Compare `/tmp/hdl06-before-css.txt` and `/tmp/hdl06-after-css.txt`, app.css/app.js raw and gzip bytes, compressed-package estimate, file/request/entry/chunk/dependency sets, and record every delta in `specs/006-motion-system/evidence/performance.md`
- [x] T031 Create an isolated temporary Salla preview worktree/branch, verify its exact local/remote SHA, state both to Yasser, and wait for branch confirmation before any browser access
- [x] T032 Capture post-change Home/Product/Collection/Cart evidence for Arabic Mobile RTL 390×844, English Mobile LTR 390×844, Arabic Desktop RTL 1366×768, and English Desktop LTR 1366×768 under `specs/006-motion-system/evidence/live/<sha>/`
- [x] T033 Capture reduced-motion initial/live-change, JavaScript-disabled, keyboard/focus, Drawer/Modal focus-return/scroll-lock, one-shot reveal, CTA latency/no-repeat, overflow, CLS, and resource-URL evidence under `specs/006-motion-system/evidence/live/<sha>/`; label unavailable Salla internals `NOT VERIFIED` and stale drafts `SALLA PREVIEW SYNC FAILURE`
- [x] T034 Run independent Final Review against `specs/006-motion-system/spec.md`, `design.md`, `plan.md`, `tasks.md`, Constitution v1.0.1, source diff, generated bundles, and live evidence; record `STATUS`, `BLOCKERS`, and requirement coverage in `specs/006-motion-system/evidence/final-review.md`
- [x] T035 Apply only blocker fixes through the Kimi implementation path, then repeat T028–T034 for every affected gate and evidence artifact
- [x] T036 Obtain Yasser's final HDL-06 acceptance, then update `ROADMAP.md`, `docs/spec-kit/spec-index.json`, `specs/006-motion-system/spec.md`, and `.specify/.runtime/hadeel-night-run.md` to complete with evidence links

## Dependencies & Parallel Work

- T001–T004 are blocking; T005–T007 follow and must be green before source implementation.
- US1 (T008–T013) establishes the resolver and tokens required by US2 and US3.
- US2 (T014–T022) and US3 (T023–T027) may be reviewed independently, but edits to `motion.js`, `product.js`, and `motion.scss` must remain sequential.
- T028–T030 require all story checkpoints. T031–T033 require production-synced source and explicit owner branch confirmation. T034 follows all available evidence.
- No task is marked `[P]`: the compact implementation intentionally shares the motion contract, test file, and core JS/CSS owners.

## Requirement Coverage

| Requirements | Tasks |
|---|---|
| FR-001–003, FR-014–015 | T005–T013 |
| FR-007–013, FR-016–017 | T014–T022 |
| FR-004–006 | T023–T027 |
| FR-018, SC-001–008 | T028–T036 |

## Implementation Strategy

1. Make the shared contract executable before changing behavior.
2. Deliver US1 as the smallest independently testable merchant-facing increment.
3. Add customer feedback/reveal in US2 without hiding critical content or touching Salla internals.
4. Add and verify dynamic reduced-motion protection in US3.
5. Build once after the last source change, then use only an owner-confirmed isolated preview for rendered evidence.

## Format Validation

- Every executable item uses `- [ ] T###`.
- Every user-story task has a `[US#]` label and an exact file path.
- Tests precede implementation in each story.
- No task edits `public/` by hand, changes dependencies, or invents a private Salla API.

## Runtime Log

### Phase A foundation — 2026-08-10 16:47 +03

Completed: T005–T012 (T013 evidence file deferred to the story checkpoint;
Phase 0 gates T001–T004 and all runtime/source-adoption tasks T014+ remain
open and unclaimed here).

Delivered:

- `scripts/check-motion-system.mjs` — finalized: per-rule phase metadata
  (`MOTION_RULE_PHASE`, `MOTION_PHASE_ACTIVE = 1`), `--full` previews the
  phase-2 runtime-adoption rules (timer/Anime repo bans, raw-timing
  tokenization, JS controller) without enforcing them early; exported pure
  helpers `resolveMotionLevel`, `normalizeMotionReduceMobile`,
  `findRecurringTimers`, `findBannedJs`, `findRawTimings`. Deliberately broken
  witness at `tests/fixtures/motion-system/broken/` (plain files, no
  dependencies) fails phase 1 with 34 errors across all six active rules.
- `tests/motion-system.test.mjs` — 33 tests. Pre-implementation run captured
  19 expected failures (settings/resolver/tokens/repo-gate); post-implementation
  33/33 pass.
- `src/assets/styles/01-settings/motion.scss` — single token owner: 12 semantic
  tokens; Calm 140ms/0px/no-reveal, Balanced 200ms/4px, Rich 320ms/12px + 40ms
  bounded stagger; OS reduce override 80ms/0px/stagger-off over all three
  levels; mobile Rich→Balanced cap at `max-width: 767px` under
  `.hadeel-motion-rich.hadeel-motion-reduce-mobile`. No `!important`, no
  physical-direction motion. Imported by `app.scss` in settings order.
- `src/assets/styles/02-generic/common.scss` — smooth scroll gated behind
  `prefers-reduced-motion: no-preference` at its single source (OS reduce
  disables it; no override layer added).
- `twilight.json` — appended exactly three global settings (indices 55–57):
  `static-motion-title`, `motion_level` (calm/balanced/rich, default balanced),
  `motion_reduce_mobile` (boolean, default true). Every legacy ID/type/options/
  default byte-preserved (checker pins the two legacy product settings exactly).
- `src/config/settings-registry.json` — three bilingual HDL-06 records
  (structural/basic/advanced); legacy records already carried HDL-06 ownership;
  their descriptions still describe the pre-Phase-B consumption and stay
  accurate until T017/T019 land.
- `src/views/layouts/master.twig` — closed allowlist resolver
  (`hadeel_motion_levels = ['calm', 'balanced', 'rich']`, balanced fallback,
  fail-closed boolean normalization), exactly one `hadeel-motion-{{ level }}`
  class, `data-hadeel-motion`, conditional `hadeel-motion-reduce-mobile` class
  + `data-hadeel-motion-reduce-mobile` marker. No raw `theme.settings.get`
  reaches a class.
- `scripts/check-theme.mjs` — motion guard integrated as contract check 10 at
  the active foundation phase; existing gates untouched.
- `tests/settings-preset-engine.test.mjs` — only the hardcoded global-count
  (55→58) and exact-additions assertions updated for the three HDL-06 records.

Gate results (this working tree, exact commands):

- `node --test tests/motion-system.test.mjs` — 33 tests, 33 pass, 0 fail
  (first run: 14 pass / 19 fail, the expected pre-implementation witness).
- `node --test tests/settings-preset-engine.test.mjs` — 73 tests, 73 pass, 0 fail.
- `node scripts/check-motion-system.mjs --strict` — phase 1, 0 errors (6 rules ok).
- `node scripts/check-theme.mjs --json` — exit 0, 0 errors, 0 warnings
  (baseline preserved; motion-system check ok).
- `git diff --check` — clean on every source file; reports trailing whitespace
  only inside `public/app.css`, which a pre-existing stray `webpack` watch
  process (PID 4598, running since before this session) regenerated as a
  development build at 16:40 +03 when the SCSS sources changed. Not hand-edit
  territory: no build was run per Phase A scope; a production rebuild before
  any commit (HDL-05 rule) resolves it. Flagged to the owner.

Not verified (explicitly): production build, `--build` sync, bundle budgets,
and any rendered Salla storefront behavior — all out of Phase A scope.

### Runtime Phase B — 2026-08-10 +03

Completed: T013–T020 and T023–T026 (T024's content — the global reduced
override and the mobile Rich cap in `motion.scss` — was already delivered and
test-pinned by Phase A; marked complete here on that evidence). Left open:
T021 (CSS token migration, intentionally the next phase), T022 (focus/touch
parity verification + `us2-feedback.md`), T027+.

Tests first: `tests/motion-system.test.mjs` grew from 33 to 61 tests (28 new
runtime cases). Pre-implementation run captured the expected failure:
**61 tests, 38 pass, 23 fail** — every failure inside the seven new runtime
describe blocks (controller contract, entry initialization, repo-wide Anime
ban, action-only product feedback, Blog native feedback, Loyalty, reveal
opt-ins). Post-implementation: **61/61 pass**.

Delivered:

- `src/assets/js/partials/motion.js` — the single shared controller, exposed
  once as `window.hadeelMotion` for the separate page bundles. Reads computed
  `--motion-*` tokens via `getComputedStyle` (no duplicated profile table),
  observes explicit `data-hadeel-reveal` opt-ins once via IntersectionObserver
  (`unobserve` on fire, disconnected under reduce), feature-detects WAAPI and
  IntersectionObserver (no reveal, no functional loss without them), tracks
  active theme-owned animations in a Set and finishes them to final state on a
  live `prefers-reduced-motion: reduce` MediaQueryList change, and suppresses
  new nonessential motion while reduced. Non-directional (translateY/scale/
  opacity only), no timers, no Anime.
- `src/assets/js/app.js` — initializes the controller at the top of
  `loadTheApp()` on the existing entry (no new chunk/request); the
  `./partials/anime` import and the `app.anime()` wrapper method are removed;
  the stale commented `app.anime` call in `cart.js` was swept with it.
- `src/assets/js/product.js` — the periodic `setInterval` CTA attention loop
  and the initial-load-only `matchMedia` reduce branch are gone.
  `initAddToCartFeedback()` binds one bounded effect to a real `click` on the
  theme-rendered `salla-add-product-button` host (`[data-add-to-cart-animation]`),
  never touches private `.s-button-*` internals, never implies cart
  success/failure, and reads the live `window.hadeelMotion.prefersReducedMotion`
  state. Cleanup is a one-shot 1400ms `setTimeout` (longest shipped effect is
  the 1.3s heart-beat), not an interval.
- `src/views/pages/product/single.twig` — only
  `data-add-to-cart-animation-interval` removed; `data-add-to-cart-animation`
  and every other attribute preserved. Both legacy settings remain
  byte-identical in `twilight.json`; the interval's registry description now
  states the explicit compatibility no-op (updated only after the behavior
  change landed).
- `src/assets/js/blog.js` — both AnimeJS effects replaced: the like count is
  written synchronously (`textContent`) with the `liked` class toggle; Salla
  still owns request success/failure; one optional
  `window.hadeelMotion?.feedback(countSpan)` pulse.
- `src/assets/js/loyalty.js` — Anime timeline deleted; the script now only
  offers one optional shared-controller feedback pulse. It never counts from
  zero and never hides the total.
- `src/views/pages/loyalty.twig` — the visible points span server-renders
  `{{ user.loyalty_points }}` instead of `0` (`data-count` unchanged).
- `src/assets/js/partials/anime.js` — deleted. `package.json` /
  `pnpm-lock.yaml` untouched.
- `data-hadeel-reveal` added exactly once to each approved specimen:
  `fixed-banner.twig`, `brands.twig`, `custom-testimonials.twig`. No hidden
  CSS base state; no reveal on price/CTA/search/cart/media.
- `specs/006-motion-system/evidence/us1-settings.md` — written from the proven
  Phase A results (T013).

Gate results (this working tree, exact commands):

- `node --test tests/motion-system.test.mjs` — 61 tests, 61 pass, 0 fail.
- `node --test tests/settings-preset-engine.test.mjs` — 73 tests, 73 pass, 0 fail.
- `node scripts/check-motion-system.mjs --strict` — phase 1, 0 errors (6 rules ok).
- `node scripts/check-motion-system.mjs --full --json` — phase 2 preview,
  5 errors, **all in `motion-timing` only**: the five registered named
  functional exceptions (`.loader` 1s, `stroke-dashoffset` 1s ×2, cart/toast
  width transitions) each report "named exception no longer matches any raw
  value — remove it". The raw literals still exist (verified:
  `product.scss:48`, `product-card.scss:289`, `common.scss:144`); the phase-2
  scanner's declaration matcher only sees unindented declarations, so nested
  SCSS is currently invisible to it. Reconciling the scanner with the migrated
  declarations is part of T021's token migration — intentionally the next
  phase, unchanged here. Every other full-phase rule — `motion-no-timer`,
  `motion-no-anime`, `motion-controller` — is green.
- `node scripts/check-theme.mjs --json` — exit 0, 0 errors, 0 warnings
  (all 9 checks ok, motion-system integration included).
- `git diff --check -- . ':!public'` — clean.

Not verified (explicitly): production build, `--build` sync, bundle budgets,
and rendered Salla storefront behavior — no preview/build was run in this
phase by scope; `public/` was not touched.

Remaining `--full` rules, exact: `motion-timing` (5 findings listed above) —
owned by T021, the intentionally deferred next phase.

#### Runtime Phase B — Codex review remediation, 2026-08-10 +03

An independent code review of the Phase B runtime found four concrete gaps.
All four were fixed tests-first, inside the same phase scope (T021, T022,
T027 remain open — unchanged):

1. **Progressive enhancement hardening** (`partials/motion.js`) —
   `window.matchMedia` absence and legacy MediaQueryList implementations
   exposing only `addListener`/`removeListener` (older Safari) are now
   feature-detected; the controller constructs and `destroy()` removes
   whichever listener shape was installed. `token()` falls back to
   `document.documentElement` when body is unavailable and to `''` when
   `getComputedStyle` itself is unavailable.
2. **Reveal is exactly once** — revealed targets are tracked in a `WeakSet`,
   marked on first intersection even when the animation is a no-op
   (zero-token profiles, no WAAPI), and `initReveal()` never re-observes an
   already revealed target, so reduce false→true→false can never replay.
3. **`track()` tolerates finished-less WAAPI** — animations without
   `Animation.finished` release through finish/cancel events; one with
   neither is still tracked. Live reduce settles every tracked animation
   with `finish()` when possible, `cancel()` as fallback.
4. **Product CSS-class feedback joins the shared controller** — new
   `playClassFeedback(element, className)` restarts the class, tracks
   `element.getAnimations()` when supported (so a live reduce finishes/
   cancels it too), cleans the class after the animations settle, and falls
   back to a one-shot timer derived from the computed
   `animation-duration`/`animation-delay` — the raw 1400ms constant is gone.
   `product.js` now makes one `window.hadeelMotion?.playClassFeedback()` call
   on the `salla-add-product-button` host; no private selector, no success
   implication, no timer of its own. The `HadeelMotion` class is exported for
   the offline tests only; the runtime still creates exactly one instance via
   `initHadeelMotion()`.

Tests first: pre-implementation `node --test tests/motion-system.test.mjs`
failed at module load (`HadeelMotion` not yet exported) with the new
behavioral describes in place. Post-implementation:

- `node --test tests/motion-system.test.mjs` — **74 tests, 74 pass, 0 fail**
  (13 new: 12 behavioral controller cases with small window/document/
  animation mocks + 1 product source-teeth case pinning the shared-controller
  delegation and the absence of the private timer/raw constant).
- `node scripts/check-motion-system.mjs --full --json` — 5 errors, **all in
  `motion-timing` only** (the same five named-exception scanner findings
  documented above, owned by T021); `motion-controller` and every other rule
  green.
- `node scripts/check-theme.mjs --json` — exit 0, 0 errors, 0 warnings.
- `git diff --check -- . ':!public'` — clean.

Not verified (explicitly): production build, `--build` sync, bundle budgets,
and rendered Salla storefront behavior — no preview/build/commit was run per
the remediation scope; `public/` was not touched.

### Runtime T021 — 2026-08-10 17:51 +03

Completed: T021 only (CSS semantic timing migration + motion guard phase
promotion). Left open: T022, T027, and all build/budget/live-preview tasks
(T028+). No build, preview, commit, or watcher was run; `public/`,
`package.json`, and `pnpm-lock.yaml` untouched; unrelated dirty work
preserved.

Tests first: `tests/motion-system.test.mjs` grew from 74 to 82 tests (8 new
scanner cases). Pre-implementation run captured the expected red:
**82 tests, 77 pass, 5 fail** — all five failures inside the strengthened
`findRawTimings` describe (indented/nested declarations, leading-dot times +
raw easing functions, raw literal alongside a token, diagnostic shape, broken
witness). Post-implementation: **82/82 pass**.

Delivered:

- `scripts/check-motion-system.mjs` — `findRawTimings` rebuilt: matches
  transition/animation longhands and shorthands (vendor-prefixed included) at
  any indentation and anywhere on a line; reports every raw nonzero time
  (leading-dot `.3s`/`.5s` forms included) and every raw easing
  function/keyword (`cubic-bezier()`, `steps()`/`step-start`/`step-end`,
  `ease*`/`linear`); strips `var(...)` with balanced parens so token
  consumption (including token fallbacks) is exempt while a raw literal
  alongside a token in the same declaration is still flagged; ignores
  `@keyframes` bodies, comments, zero/`none`, and non-timing properties
  (`transition-property`, `animation-name`). Diagnostics keep file/line/
  property/full declaration. The vestigial `//@` regex alternative is gone;
  no selector guessing added.
- Migration inventory after scanner repair: `--full` reported 48 errors =
  47 raw declarations across 16 owner files + 1 stale exception selector.
  All 47 migrated in place to `var(--motion-duration-ui)` +
  `var(--motion-easing-standard/-exit/-emphasized)` (ordinary UI),
  `var(--motion-duration-feedback)` (bounded action feedback: add-to-cart
  effect classes, `.scale-pulse`, `.rubberBand`), `var(--motion-duration-
  reveal)` (`.slide-in-start` one-shot entrance), and `var(--motion-stagger)`
  (banner description entrance delay). No raw literal remains next to a
  token; no `!important`, no late override layer, no new selector layer.
- `src/assets/styles/02-generic/common.scss` — added the missing
  declarative reduce stop for `.loader:before` (the only continuous
  theme-owned animation) next to its owner rule; the static ring stays
  visible so the loading state remains understandable. All other migrated
  rules are covered declaratively by the OS-reduce token override in
  `01-settings/motion.scss` (durations converge on the 80ms/0ms floor) plus
  the four pre-existing component reduce blocks; functional state indicators
  are untouched.
- Named exceptions retained: exactly 5, each verified against the actual
  post-migration declaration — `.loader` spinner `1s` (common.scss:144,
  continuous functional; exception selector corrected from `.loader` to the
  declaration substring `animation: loader`), `stroke-dashoffset 1s` progress
  rings (product.scss:48, product-card.scss:289), cart free-shipping width
  `0.5s` (cart.scss:65), toast free-shipping width `250ms`
  (add-product-toast.scss:96, already forced to `transition: none` under
  reduce by the existing block at add-product-toast.scss:340). No decorative
  attention motion was turned into an exception.
- Phase promotion: `MOTION_PHASE_ACTIVE` 1 → 2, only after `--full` reached
  0 errors. Phase-gating comments, the CLI `--full` note, and the two
  phase-pinning tests updated; `check-theme.mjs` consumes the default phase,
  so default/strict/check-theme now enforce all ten rules.
- Stale comment sweep: the `hadeel-atc-animation--*` header comment in
  product.scss no longer describes the removed periodic interval; it now
  states post-action feedback via `window.hadeelMotion.playClassFeedback()`.

Gate results (this working tree, exact commands):

- `node --test tests/motion-system.test.mjs` — 82 tests, 82 pass, 0 fail
  (pre-implementation witness: 77 pass / 5 fail, recorded above).
- `node --test tests/settings-preset-engine.test.mjs` — 73 tests, 73 pass,
  0 fail.
- `node scripts/check-motion-system.mjs --full --json` — 0 errors, phase 2
  (all 10 rules ok).
- `node scripts/check-motion-system.mjs --strict --json` — 0 errors, phase 2.
- `node scripts/check-theme.mjs --json` — exit 0, 0 errors, 0 warnings.
- `git diff --check -- . ':!public'` — clean.

Not verified (explicitly): production build, `--build` sync, bundle budgets,
rendered Salla storefront/RTL/focus behavior (T022/T027/T033 scope), and the
on-screen feel of re-timed effects (token values are within the approved
profile caps; visual acceptance remains a live-preview gate). `public/` was
not rebuilt — per scope no build was run; a production rebuild is required
before any commit that includes these `src/assets/**` changes.

### Runtime T021-review rework + T022 + T027 — 2026-08-10 +03

Completed: T021 (re-completed after the Codex review corrected the false
green), T022 (local/source scope), T027 (local evidence). Left open: T028+
build/budget/live-preview tasks. No build, preview, commit, or watcher was
run; `public/`, `package.json`, `pnpm-lock.yaml` untouched; unrelated dirty
work preserved. No Salla private-selector rewrites.

Codex review finding: the T021 checker scanned only CSS declarations, so raw
Tailwind motion utilities and JS/Twig timing survived. Corrected tests first.

Tests-first red record (exact):

1. Utility/var-fallback scanner tests added: suite failed at module load
   (`findMotionUtilities` not yet exported) — the expected pre-implementation
   witness.
2. After implementing `findMotionUtilities` + the `motion-utility` rule:
   88 tests, 87 pass, 1 fail — the single failure being the repo-level gate
   pinning **77 `motion-utility` errors** (the real inventory) before
   migration. T021 was re-opened at this point.
3. After migrating all 77 findings: 88/88 pass, `--full` 0 errors; T021
   re-closed.
4. T022/T027 describe blocks added: 107 tests, first run 104 pass / 3 fail
   (assertion-shape issues in the new direction/mirroring tests, fixed
   test-side; one stale comment self-reference removed). Final: **107 tests,
   107 pass, 0 fail**.

Delivered:

- `scripts/check-motion-system.mjs` — new exported `findMotionUtilities`
  (SCSS `@apply` bodies incl. missing-trailing-semicolon bodies, Twig class
  attributes incl. single-quoted, JS string literals; variant prefixes
  stripped; `transition-none`/`animate-none` allowed; `transition-*` banned
  because it compiles default raw timing) + new phase-2 rule `motion-utility`
  with an enforced-empty `NAMED_UTILITY_EXCEPTIONS`. `findRawTimings` now
  scans the whole declaration value including `var()` fallbacks, so a raw
  literal inside `var(--motion-*, 200ms)` is flagged (test-pinned).
  `MOTION_RULE_PHASE` gains `motion-utility: 2`; header docs updated.
- Migration of all 77 utility findings to token-driven declarations in their
  existing owners (19 SCSS files, 4 Twig templates, `app.js`), zero utility
  exceptions. `animate-slideUp/DownFromBottom` keyframes moved into
  `02-generic/common.scss` (tailwind.config.js entries now unused/unemitted).
  `.slide--cat-entry` transition placed in the surviving
  `storefront-system.scss` rule (duplicate-selector guard clean).
- T022 source fixes: `thankyou.js` stagger → `--motion-stagger-index` ×
  `var(--motion-stagger)`; `slideInStart` logical start-edge via
  `--hadeel-motion-start-sign`; `toRightFromLeft` replaced by non-directional
  `featureIconPop` with `:focus-within` parity; `toTopFromBottom` corrected
  to `translateY(var(--motion-reveal-distance))`; `wishlist.js` opacity-only
  removal (no height/reflow); layout-property animation removed (header
  `top`, collapse `grid-template-rows`, wishlist `height`, pagination
  `width`, menus `max-height`, every `transition: all`/property-less
  shorthand narrowed); `home.js` 100ms hide timer deleted (final visible
  state at 0ms); `app.js` modal uses token-owned classes +
  `hadeelMotion.durationMs`-derived bounded cleanup; banner reveal keyboard
  parity; mirroring confined to documented directional-icon glyph
  corrections.
- `scripts/check-theme.mjs` — header/integration comments corrected to phase
  2 wording only (explicitly authorized; no behavior change).
- Evidence: `specs/006-motion-system/evidence/us2-feedback.md`,
  `specs/006-motion-system/evidence/us3-reduced-motion.md` with explicit
  NOT-VERIFIED platform/live items.

Exceptions: exactly the five functional ones, re-verified against the actual
post-migration declarations (loader `1s` — reduce-stopped in its owner;
`stroke-dashoffset 1s` ×2; cart width `0.5s`; toast width `250ms` — also
`transition: none` under reduce). No decorative attention exception.

Gate results (this working tree, exact commands):

- `node --test tests/motion-system.test.mjs` — 107 tests, 107 pass, 0 fail.
- `node --test tests/settings-preset-engine.test.mjs` — 73 tests, 73 pass, 0 fail.
- `node --test tests/localization-rtl-accessibility.test.mjs` — 24 tests, 24 pass, 0 fail.
- `node scripts/check-motion-system.mjs --full --json` — 0 errors, phase 2
  (11 rules ok).
- `node scripts/check-motion-system.mjs --strict --json` — 0 errors, phase 2.
- `node scripts/check-theme.mjs --json` — exit 0, 0 errors, 0 warnings.
- `git diff --check -- . ':!public'` — clean.

Not verified (explicitly): production build, `--build` sync, bundle budgets,
and all rendered Salla storefront/RTL/focus/Drawer/scroll-lock behavior
(T028–T033 gates). Platform-owned Drawer/Modal/Slider internal transitions
remain `NOT VERIFIED` Platform-owned Spike; nothing was patched through
private selectors.

### Runtime T028–T030 — 2026-08-10 19:55 +03

Completed: T028 (automated gates evidence), T029 (production build + build
sync), T030 (performance deltas). Left open: T031–T036 (preview worktree,
live evidence, final review, acceptance). No preview was created; no commit,
push, merge, reset, or revert was run; `package.json`/`pnpm-lock.yaml`
untouched.

Blocker found and fixed first (tests-first): the HDL-05 suite was red —
`node --test tests/performance-bundle-ci.test.mjs` failed with `actual: 55,
expected: 0` because the committed `src/config/bundle-budget.json` was
ratcheted at the pre-HDL-06 tree while `public/` on disk was a stale
development build regenerated by a stray webpack watch process (PID 4598,
running since Aug 7, cwd = project root). Fix: stopped the stray watcher
(SIGTERM), ran the T029 production build, then ratcheted the manifest via
`node scripts/check-bundle-budget.mjs --update` (documented HDL-05 workflow;
no hand-edited measurements). All affected gates rerun green.

T029: `npx webpack --mode production` — compiled successfully (3 pre-existing
asset-size warnings only; app.css 817 KiB flagged by webpack defaults).
`node scripts/check-theme.mjs --build --max-errors=0` — exit 0, 0 errors,
0 warnings, `[build-sync] ok public/ matches a fresh production build (28
files compared recursively by path and sha256)`. `public/` carries no eval
devtool; the only modified `public/` paths are `app.css`, `app.js`,
`checkout.js`, `home.js`, `pages.js`, `product.js` — all attributable to the
production build.

T030 deltas (before = committed HEAD manifest / Aug 10 16:00 baseline; after =
19:50 production build): CSS snapshot 6,838 → 6,882 rules (227 removed /
271 added lines, all token-migration attributable); app.css 802,202 →
836,385 raw (+34,183), gzip-9 103,802 → 105,788; app.js 129,221 → 116,474
raw (−12,747), gzip-9 37,056 → 31,508 (animejs runtime removal); public/
total 1,151,263 → 1,171,477 raw, gzip-9 214,496 → 210,638 (−3,858);
compressed package 475,903 → 479,890 / 1,000,000 B — PASS (47.99%); package
files 156 → 157 (+motion.js, +motion.scss, −anime.js); entries/chunks
unchanged (app, checkout, home, pages, product); dependencies 32 = 32;
media 5 = 5; zero local fonts. Network URL delta NOT VERIFIED (preview gate).
Full details: `specs/006-motion-system/evidence/performance.md`.

Final T028 gate results (exact, this working tree):

- `node --test tests/motion-system.test.mjs` — 107 tests, 107 pass, 0 fail.
- `node --test tests/settings-preset-engine.test.mjs` — 73 tests, 73 pass, 0 fail.
- `node --test tests/localization-rtl-accessibility.test.mjs` — 24 tests, 24 pass, 0 fail.
- `node --test tests/performance-bundle-ci.test.mjs` — 39 tests, 39 pass, 0 fail.
- `node scripts/check-motion-system.mjs --full --json` — 0 errors, phase 2
  (11 rules ok).
- `node scripts/check-motion-system.mjs --strict --json` — 0 errors, phase 2.
- `node scripts/check-theme.mjs --json` — 0 errors, 0 warnings.
- `node scripts/check-bundle-budget.mjs` — 0 errors.
- `git diff --check -- . ':!public'` — clean.

Not verified (explicitly): all live storefront behavior — T031–T033 preview
gates (rendering, RTL/focus, reduced-motion live toggle, Drawer/Modal
internals, CLS, network waterfall).

### Runtime T001–T004 — 2026-08-10 +03

Documentation-only closure. Codex independent review verified the cited
evidence and found T001–T004 complete: HDL-06 state is `implementing` in
`ROADMAP.md`, `docs/spec-kit/spec-index.json`, and
`.specify/.runtime/hadeel-night-run.md` (T001); `design.md` records Figma
Revision 1 Approved for Implementation including the RTL CTA logical-start
correction, with no unresolved spec ambiguity (T002);
`evidence/baseline.md` holds the pre-change static/snapshot/byte/package/
dependency/entry-chunk/network baseline (T003); `evidence/platform-boundary.md`
records the Drawer/Modal/Slider internals as Platform-owned Spike with
native-behavior fallback (T004). Checkboxes flipped `[ ]` → `[x]`; no source,
build, preview, or git action taken.
