# HDL-07 Independent Final Review (Lean T023)

**Date**: 2026-08-11
**Scope**: reviewed T016–T022 only; rendered storefront behavior remains owned by T024–T028.
**Reviewer route**: Claude Opus 5 High was retried at this major phase boundary but produced no output during the bounded attempt and was stopped. Review transferred automatically to GPT-5.6 Sol High via Codex, per the approved fallback policy.

## Finding and resolution

The initial review found one blocking contract gap: `header_show_menu` and
`header_show_cart` were missing even though the Lean HDL-07 requirement names
visibility controls for Search/Menu/Cart/Account/Wishlist.

Kimi K3 High fixed the blocker without duplicating the header core:

- Added both global Boolean settings next to the existing header controls in
  `twilight.json`, defaulting to `true`, with qualified bilingual registry
  records.
- `header_show_menu` gates the one shared menu cell, so the Desktop
  `custom-main-menu` and Mobile trigger disappear together.
- `header_show_cart` gates the one native `salla-cart-summary`.
- When the menu is hidden, `initiateMobileMenu()` now exits before starting its
  element-polling loop. When the header cart is hidden, add-to-cart animation
  uses null-safe optional chaining.
- Existing HDL-07 and settings-registry assertions were extended only for these
  real contracts; no dependency, entry, chunk, media, font, request, or parallel
  header implementation was added.

## Independent verification

- Source inspection confirms exactly one `.store-header`, `#mainnav`,
  `.main-nav-shell`, `.navbar-brand`, `custom-main-menu`, search dispatch, and
  `salla-cart-summary` in the shared template source.
- `node --test tests/header-layouts.test.mjs` → 34/34 passed.
- `node scripts/check-header-layouts.mjs --strict` → 0 errors.
- `node scripts/check-settings-registry.mjs --strict` → 65 globals + 62
  component/nested records, 0 errors.
- Kimi's post-fix full focused run → 284/284 passed; production build succeeded;
  `check-theme --build --json` returned 0 errors/0 warnings; bundle gate returned
  0 errors after the official ratchet; `git diff --check` was clean.
- Final deltas vs T007 baseline: CSS +10,434 B (cap +12,288), app JS +197 B
  (cap +4,096), compressed package 484,887/1,000,000 B and below the 950,000 B
  internal target.

## Preview-owned risks (not static blockers)

Transparent Top/Scrolled/Fallback, Commerce crowded navigation, hidden Menu/Cart
rendering, 320/390 safety, RTL/LTR, focus/touch behavior, and Figma visual parity
remain **NOT VERIFIED** until the reviewed-SHA Salla Preview in T024–T028.

## Verdict

**PASS / BLOCKERS: 0**
