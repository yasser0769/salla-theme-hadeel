# US2 — Customer receives clear, non-distracting feedback: independent story result

**Story**: User Story 2 (P1) — theme-owned feedback begins immediately,
noncritical reveal runs once, hover has keyboard/touch parity, and no commerce
content waits for motion.
**Recorded**: 2026-08-10, after the Codex-review rework of T021 (Tailwind
utility coverage) and the T022 source parity/audit fixes. Scope: local source
and executable contract only — rendered acceptance remains T032/T033.

## Independent test (from tasks.md Phase 3)

Use Product CTA, one eligible Home reveal, Blog like, Card, and native
overlay/slider specimens; verify feedback begins within 100ms, reveal happens
once, no timer repeats, and critical content stays visible without JavaScript.

## What was verified (executable, offline, this working tree)

- `node --test tests/motion-system.test.mjs` — **107 tests, 107 pass, 0 fail**.
  Tests-first red witnesses recorded during this phase:
  - T021-review scanner tests: suite failed at module load
    (`findMotionUtilities` not yet exported); after implementing the scanner
    the suite went 88 tests / 87 pass / 1 fail, the single failure being the
    repo-level gate pinning **77 `motion-utility` findings** — the real
    Tailwind utility inventory before migration.
  - New T022/T027 describe blocks initially failed 3 cases (fixed-offset
    assertion shape, a self-reference in a comment, and the mirroring test
    needing the documented directional-icon corrections); 107/107 after the
    corrections.
- `node scripts/check-motion-system.mjs --full --json` — **0 errors, phase 2**
  (11 rules ok, including the new `motion-utility`).
- `node scripts/check-theme.mjs --json` — exit 0, 0 errors, 0 warnings.

### Utility inventory and migration (T021 completion)

The corrected guard scanned theme SCSS `@apply` bodies, Twig class attributes,
and JS class strings. **77 banned-utility findings** (`transition`,
`transition-*`, `transition-[...]`, `duration-*`, `delay-*`, `ease-*`,
`animate-*`) across 19 SCSS files, 4 Twig templates, and `app.js` — all
migrated to explicit `var(--motion-duration-*)` / `var(--motion-easing-*)`
declarations in the same existing owners. Notable moves:

- `.slide--cat-entry` transition went to the surviving `storefront-system.scss`
  rule, not the legacy `home-blocks.scss` duplicate (one declaration site; the
  duplicate-selector guard confirms).
- `animate-slideUpFromBottom`/`animate-slideDownFromBottom` (Tailwind config
  `.6s linear`) replaced by keyframes owned in `02-generic/common.scss` with
  token duration/easing; `tailwind.config.js` entries are now unused and are
  not emitted.
- `ease-elastic`/`duration-700`/`delay-500` on the landing-page fast-checkout
  bar replaced by token timing; the raw 500ms delay is gone (contract caps).
- `transition: all` / property-less shorthands narrowed everywhere to explicit
  non-layout property lists (executable test: zero layout-animating or
  unqualified transitions outside the named progress exceptions).
- `var(--motion-*, rawFallback)` fallbacks are now flagged by
  `findRawTimings` (test-pinned); none exist in the source.
- Named utility exceptions: **zero** (`NAMED_UTILITY_EXCEPTIONS` is empty and
  enforced).

### T022 source parity/audit fixes

- `thankyou.js`: raw `${i * 100}ms` stagger replaced by
  `--motion-stagger-index` (data) × `var(--motion-stagger)` (time) — zero
  stagger outside Rich and under OS reduce; no raw runtime duration.
- `slideInStart`: fixed `translateX(20px)` replaced by logical start-edge
  motion — `--hadeel-motion-start-sign` (-1 LTR / +1 RTL in
  `02-generic/common.scss`) × `var(--motion-reveal-distance)`. Executable
  RTL/LTR source tests pin both signs and the absence of fixed offsets.
- `toRightFromLeft` (physical slide) deleted; the feature-icon hover effect is
  now `featureIconPop` (scale/opacity only, non-directional) with
  `:focus-within` parity.
- `toTopFromBottom` corrected to the vertical axis its name states
  (`translateY(var(--motion-reveal-distance))`), no content/order change.
- `wishlist.js`: height animation and forced reflow removed; removal is an
  opacity-only exit (`fade-out-collapse` no longer pins `height: 0
  !important`), element removed on `transitionend`; reload-on-empty semantics
  unchanged; no-JS content untouched (the class is only ever added by JS).
- Layout-property animation removed: header `.inner` no longer transitions
  `top`; `.collapse-content` no longer transitions `grid-template-rows`;
  wishlist no longer transitions `height`; product pagination bullets no
  longer transition `width`; `menus.scss` sub-menu no longer transitions
  `max-height`. The four named progress exceptions keep their state-property
  transitions (see below).
- `home.js`: the 100ms hide-then-fade timer is deleted; the active featured
  tab switches directly to `is-active opacity-100 translate-y-0` — final
  visible state at 0ms, no timer.
- `app.js` `toggleModal`: `ease-out duration-300` class strings removed (the
  transition now lives on `.s-salla-modal-overlay`/`.s-salla-modal-body` in
  `02-generic/common.scss`, token-timed — markup may be runtime-injected by
  Salla apps, so it stays class-based); the raw 350ms hide timer is now
  bounded and token-derived (`hadeelMotion.durationMs('--motion-duration-ui')
  + 50ms` buffer).
- Focus/active/touch parity: banner text reveal and feature-icon effect fire
  on `:focus-within` as well as `:hover` (executable pins); product-card hover
  reveals already carried `:focus-within` (regression-pinned). No positive
  tabindex and no DOM-order changes were introduced (the HDL-04 checker covers
  positive tabindex repo-wide; zero errors).
- Mirroring: no `scaleX(-1)` inside `@keyframes` and none on media/logo
  selectors; the only X-flips are the pre-existing static directional-icon
  glyph corrections (`.flip-x` truck icon, `sicon-arrow-left`,
  `nav--start i`), executable-pinned.

### Named functional timing exceptions (exactly five, verified)

1. `.loader` spinner `1s` (`02-generic/common.scss:144`) — functional
   continuous loading indicator; stopped under `prefers-reduced-motion:
   reduce` in the same owner file (static ring stays visible).
2. `stroke-dashoffset 1s` progress ring (`04-components/product.scss:48`).
3. `stroke-dashoffset 1s` progress ring (`04-components/product-card.scss:289`).
4. Cart free-shipping width `0.5s` (`04-components/cart.scss:65`).
5. Toast free-shipping width `250ms`
   (`04-components/add-product-toast.scss:96`; additionally forced to
   `transition: none` under reduce by the existing owner block).

No decorative attention motion is excepted. The add-to-cart merchant effects
consume `var(--motion-duration-feedback)` and are `animation: none` under
reduce.

## Platform-owned / not verified here (explicit)

- `salla-drawer`/`salla-modal`/`salla-slider` internal transition timing and
  easing: **NOT VERIFIED** — no public motion API is proven; nothing was
  patched through private selectors (Platform-owned Spike, unchanged from
  `evidence/platform-boundary.md`).
- Focus trap, focus return, and scroll-lock inside Salla overlays on a live
  storefront: **NOT VERIFIED** — live-preview gates T032/T033.
- Rendered RTL/LTR visual parity, hover/touch behavior on real devices, CLS,
  and feedback latency measurements: **NOT VERIFIED** — same gates. All
  direction/parity claims above are source-level executable checks only.
- Production build, `--build` sync, bundle budgets: T028–T030.
