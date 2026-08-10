# US3 — Motion-sensitive customer is protected: independent story result

**Story**: User Story 3 (P2) — OS reduced motion overrides the merchant level
initially and during the session; mobile reduction safely caps Rich without
disabling functional state feedback.
**Recorded**: 2026-08-10, after the T021-review rework and T022 fixes. Scope:
local executable proof only — live Drawer/focus/scroll-lock verification
remains T032/T033.

## Independent test (from tasks.md Phase 4)

Start Rich, activate `prefers-reduced-motion: reduce` during an active
theme-owned animation, and verify cancellation to final state, no new
nonessential motion, no smooth scroll, and intact loading/error/Drawer
behavior.

## What was verified (executable, offline, this working tree)

`node --test tests/motion-system.test.mjs` — **107 tests, 107 pass, 0 fail**,
including the behavioral controller suite (small window/document/animation
mocks driving the real `HadeelMotion` class) and the declarative-coverage
source pins below.

### Initial reduced state and live false→true change

- The controller reads the OS preference at construction and installs a live
  MediaQueryList `change` listener (modern `addEventListener('change')` and
  legacy `addListener` both feature-detected; absence of `matchMedia`
  degrades safely) — behavioral tests: "no window.matchMedia", "legacy
  MediaQueryList", and the reveal toggle suite.
- A live reduce change finishes every tracked animation to its final state
  (`finish()`, `cancel()` fallback when `finish()` throws) and settles shared
  CSS-class feedback (`playClassFeedback`) — behavioral tests: "a live reduce
  change finishes every tracked animation" and "a live reduce change settles
  the class feedback and cleans the class".

### Suppression of new nonessential motion

- Under reduce, `feedback()` and `playClassFeedback()` return `null` and add
  nothing — behavioral tests: "reduce suppresses new nonessential motion",
  "reduced motion suppresses class feedback entirely".
- Reveal: reduce disconnects the IntersectionObserver; already-revealed
  targets are never re-observed across reduce false→true→false (WeakSet);
  pending targets re-arm when reduce lifts — behavioral tests: "a revealed
  target is never re-observed or replayed", "a no-WAAPI target is marked
  revealed".
- Declarative: the OS-reduce override in `01-settings/motion.scss` converges
  every level to the ≤100ms floor with `--motion-duration-reveal: 0ms`,
  `--motion-stagger: 0ms`, and all distances `0px` (token tests + the T027
  stagger/reveal pins). Because every theme transition/animation now consumes
  those tokens (T021/T022), all token-driven motion compresses or stops under
  reduce with no per-component media queries.
- Reveal distances are token-driven everywhere, so reduce zeroes them —
  including `fadeInDown` (raw `-15px` removed, now
  `calc(var(--motion-reveal-distance) * -1)`) and the logical `slideInStart`.
  The thank-you stagger collapses to 0ms because `--motion-stagger` is 0ms
  under reduce.

### No smooth scroll

- `scroll-behavior: smooth` exists only behind
  `@media (prefers-reduced-motion: no-preference)` at its single source in
  `02-generic/common.scss` (`motion-scroll` rule + token-suite pin).

### Continuous and class-based effects stop

- The `.loader` spinner (the only continuous theme-owned animation) is
  `animation: none` under reduce in its owner file; the static ring remains
  visible, so the loading state stays understandable (T027 pin).
- Add-to-cart class feedback is `animation: none` under reduce
  (`product.scss` owner block, T027 pin) and is additionally settled at
  runtime through the shared controller.

### Mobile Rich cap

- Under `max-width: 767px`, `.hadeel-motion-rich.hadeel-motion-reduce-mobile`
  aliases Rich to Balanced values (≤240ms, ≤8px, stagger off) — token-suite
  test "mobile Rich reduction aliases Rich to Balanced values". Drawer
  opening, feedback, and loading/error states are not disabled by the cap.

### Functional indicators stay meaningful

- The four progress exceptions (two `stroke-dashoffset` rings, cart width,
  toast width) transition a state property only — no spatial motion — and the
  toast one is additionally forced to `transition: none` under reduce.
- Executable proof that no reduce block hides content or controls: every
  `@media (prefers-reduced-motion: reduce)` block in the stylesheets is
  scanned; none contains `display: none` or `visibility: hidden`.

## Not verified here (explicit)

- Live storefront behavior under an OS-level reduce toggle, including Salla
  Drawer/Modal focus return and scroll lock: **NOT VERIFIED** — live-preview
  gates T032/T033. Salla overlay internals were not patched (Platform-owned
  Spike).
- JavaScript-disabled rendering of reduced states on a real storefront, CLS
  measurements, and real-device confirmation: **NOT VERIFIED** — same gates.
