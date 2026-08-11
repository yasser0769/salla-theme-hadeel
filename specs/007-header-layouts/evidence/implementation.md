# HDL-07 Implementation Evidence (Lean T016–T020)

**Date**: 2026-08-11 · **Owner**: Kimi K3 High · **Mode**: Lean Execution
**Scope**: T016 Transparent, T017 Commerce, T018 shared Mobile + one Sticky
controller, T019 focused assertions, T020 this record. T001–T015 untouched.

All storefront behavior below is **NOT VERIFIED** against a rendered Salla
storefront. Verification is owned by T021–T028 (focused suites, build gates,
exact-SHA Salla Preview). The only evidence in this file is static: source
inspection, `node --test tests/header-layouts.test.mjs`, and
`node scripts/check-header-layouts.mjs --strict`.

## Architecture implemented

One header core, four body-class layouts. The DOM, menu data source, Salla
components, and native events are shared by `centered`, `start`, `transparent`,
and `commerce`; layout differences are CSS Grid placement over that one DOM.

### T016 — Transparent header

- **Eligible-Hero marker** (`src/views/components/home/enhanced-slider.twig`):
  the full-width Hero is the single approved owner of
  `data-hadeel-header-hero`. It also emits the server safe-ink marker
  `data-hadeel-header-hero-ink="light"` only when at least one slide renders
  and every rendered slide carries the existing dark overlay
  (`slide.without_overlay` falsy for all). One overlay-less slide or an empty
  slider withholds the marker.
- **First-paint gate** (`storefront-system.scss`): the Top state exists only
  inside three relational `:has()` selectors that require simultaneously:
  `.hadeel-header-transparent` + `[data-hadeel-header-transparent-home="true"]`
  + the marked Hero as `:first-child` of `#main-content` + ink proof —
  explicit `light|dark`, or `auto` only with the safe-ink marker. Unsupported
  `:has()`, a missing/non-first Hero, or uncertain auto ink never match, so
  the ordinary opaque surface is what paints; nothing flashes transparent and
  falls back later.
- **Top**: `.store-header` overlays the Hero (absolute, z-index 30) with a
  transparent nav surface and the resolved ink (`#fff` light, `--hadeel-ink`
  dark/default). The original logo is never filtered, inverted, or mirrored;
  it sits on a small neutral plate (`rgba(255,255,255,0.92)` pill). Missing
  logo renders the escaped `{{ store.name }}` text fallback
  (`.navbar-brand__name`, Twig autoescape).
- **Scrolled**: the shared controller's `fixed-pinned`/`fixed-header` states
  return the nav to the opaque `--hadeel-surface` with normal ink and no plate.
  Because the overlay never occupies document flow, the architecture is
  intended to avoid a layout jump — **NOT VERIFIED** until Salla preview. No
  new color setting; `--hadeel-surface` is reused.

### T017 — Commerce header + visibility controls

- **Two-row desktop grid** (`storefront-system.scss`,
  `@media (min-width: 1024px)`): row 1 = brand / the one wide search button /
  actions; row 2 = full-width menu (`grid-column: 1 / -1`). Grid placement
  only — DOM and focus order stay logical and identical across layouts.
- **Exactly ONE search control** (`header.twig`, architecture correction
  2026-08-11): every layout renders the same single `.header-action--search`
  button with the same single `salla.event.dispatch('search::open')` whenever
  `header_show_search` is true — one button, one dispatch, one handler in
  source, no branch duplication. No commerce-layout predicate or mini-resolver
  exists in Twig at all. The button carries one shared label span
  (`.header-action__label`), hidden by default for centered, start,
  transparent, and all mobile layouts (the button's `aria-label` names it);
  CSS under `.hadeel-header-commerce` desktop widens that same element
  (flex, registered min-width, border, label revealed, icon shrunk). On
  commerce mobile the same element simply inherits the shared 44×44 icon
  sizing — no override, no duplicate hidden focusable control. Search results
  remain HDL-09's; menu content HDL-08's.
- **Visibility settings** (completed by the T023 blocker fix): five switches,
  each gating exactly one shared control — `header_show_search` the single
  search button, `header_show_menu` the single shared `.main-nav-shell__menu`
  cell (desktop `custom-main-menu` and the mobile trigger together),
  `header_show_cart` the single `salla-cart-summary`, `header_show_account`
  the logged-in `salla-user-menu` and logged-out login dispatch together, and
  the pre-existing `header_show_wishlist`. Removal is clean — no hidden
  focusable duplicate. The sr-only h1/h2 store heading renders
  unconditionally; the missing-logo visible span is an additional fallback,
  never a semantic removal.
- **Overflow measurement** (`main-menu.js`): `checkMenuOverflow` no longer
  subtracts shell siblings when `body.hadeel-header-commerce` is present,
  because the menu owns its own full-width row. No other menu logic changed.

### T018 — Shared mobile header + one Sticky/Scrolled controller

- **Real-Boolean serialization** (`master.twig`): the old
  `window.header_is_sticky = "{{ … }}"` emitted the truthy string `"false"`,
  so sticky=false still installed the scroll listener. It now serializes a real
  JS boolean through the same four enrolled shapes as the HDL-03/07 resolver:
  unset uses the declared default true; an invalid non-enrolled shape resolves
  false. Serialization only — the resolver itself is untouched.
- **One controller** (`app.js`): `initiateStickyMenu()` is installed only when
  `header_is_sticky` is boolean true. It measures the actual shell
  (`#mainnav .inner` clientHeight) before pinning and on load/resize, and
  batches scroll state through at most one pending `requestAnimationFrame` on
  the single passive scroll listener. No MutationObserver, interval, image
  analysis, or per-layout listener was added.
- **Shared mobile shell** (`storefront-system.scss`, `max-width: 1023px`): one
  arrangement for all four layouts — menu trigger / centered brand / actions.
  Logical CSS only (grid + `inset-inline`); no direction branches were added.
  Side columns are 88px so two 44px touch targets fit with an 80px brand floor
  (256px total inside the 288px container at the 320px minimum). Menu trigger,
  actions, and cart are 44×44px. Long logos stay clamped
  (`min(118px, 100%)`, `object-fit: contain`); missing logos render the
  truncated store-name fallback. Focus uses the existing global
  `:focus-visible` contract.

## Changed files (this batch)

- `src/views/components/home/enhanced-slider.twig` — eligibility + safe-ink markers
- `src/views/components/header/header.twig` — ONE search control/dispatch,
  visibility guards, missing-logo fallback with unconditional sr-only heading
- `src/views/layouts/master.twig` — real-Boolean sticky serialization only
- `src/assets/js/app.js` — rAF-bounded sticky controller, shell measurement
- `src/assets/js/partials/main-menu.js` — commerce overflow measurement
- `src/assets/styles/04-components/storefront-system.scss` — transparent
  Top/Scrolled, commerce grid + CSS-only search widening, brand fallback,
  mobile 44px/320px
- `tests/header-layouts.test.mjs` — refined/added focused assertions
  (34 tests, 10 suites, all passing)
- `specs/007-header-layouts/evidence/implementation.md` — this file

T023 blocker fix additionally changed: `twilight.json` (two settings),
`src/config/settings-registry.json` (two records + 31 shifted source_path
indices), `tests/helpers/header-layouts.mjs` and
`scripts/check-header-layouts.mjs` (seven-setting contracts),
`src/views/components/header/header.twig` (menu/cart guards), and
`src/assets/js/app.js` (hidden-menu/cart null-safety).

`header.scss` (pinning owner) needed no change: the existing
`fixed-pinned`/`fixed-header` pinning composes with the new states.
No `public/` build, dependency, entry, chunk, request, media, or font change;
no `!important`; no new stylesheet layer; no hardcoded visible copy.

## T023 blocker fix — menu/cart visibility (2026-08-11)

The independent T023 review found one blocking omission: the Lean requirements
call for visibility settings for Search/Menu/Cart/Account/Wishlist, but menu
and cart were unconditional. Fix (still **NOT VERIFIED** on a rendered store):

- **Settings** (`twilight.json`): `header_show_menu` and `header_show_cart`,
  both global booleans, default `true`, Arabic editor labels, no conditions,
  inserted adjacent to the other header controls (indices 32/33). The 31
  later `source_path` indices in `src/config/settings-registry.json` were
  shifted +2 via apply_patch and verified by the registry checker; two
  qualified bilingual records (`global::header_show_menu`,
  `global::header_show_cart`) were added with owner HDL-07, safe defaults, and
  no preset support.
- **Guards** (`header.twig`): `header_show_menu` wraps the one shared
  `.main-nav-shell__menu` cell so the desktop menu and mobile trigger are
  removed together; `header_show_cart` wraps the one `salla-cart-summary`. No
  duplicate DOM or handlers.
- **Runtime null-safety** (`app.js`): `initiateMobileMenu` returns early when
  no `#mobile-menu` trigger exists (no forever polling); `animateToCart` is
  called with an optional chain so add-to-cart never throws when the summary
  is hidden.
- **Contracts**: `tests/helpers/header-layouts.mjs` `NEW_SETTING_IDS`,
  `scripts/check-header-layouts.mjs` `expectedNew`, and the focused
  parity/visibility assertions in `tests/header-layouts.test.mjs` now cover
  all five visibility controls and the guard shapes.

## Static verification run in this batch

- `node --test tests/header-layouts.test.mjs` → **34 pass / 0 fail** (10 suites)
- `node scripts/check-header-layouts.mjs --strict` → **0 errors**, fixture
  witness rejected as required
- `git diff --check` → clean (run at batch end)

## NOT VERIFIED (storefront-only, owned by T021–T028)

- Transparent Top/Scrolled/Fallback on a rendered store, including `:has()`
  behavior in the preview browser, first-paint no-flash, and Hero-under-header
  overlap.
- Commerce two-row rendering, crowded-navigation overflow, and the widened
  search button's native search open.
- Four-layout × Desktop/Mobile × RTL/LTR parity, 320/390 stress, focus and
  touch-target measurements, long/missing logo rendering.
- Sticky no-jump behavior and real-Boolean gating on a live store.
- Legacy `centered|start` byte-identical rendering on a live store.
- Bundle size deltas, build sync, and all gates (T021–T022 own these; no build
  was run in this batch by design).
