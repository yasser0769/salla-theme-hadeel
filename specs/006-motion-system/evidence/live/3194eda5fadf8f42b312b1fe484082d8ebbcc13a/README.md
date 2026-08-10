# HDL-06 — Final live evidence index

This directory contains the final owner-confirmed Salla storefront evidence
for preview commit `3194eda5fadf8f42b312b1fe484082d8ebbcc13a`. It is an
evidence index, not the owner's final acceptance.

## Preview identity and sync

- Branch: `codex/preview-hdl-06-20260810`.
- Local HEAD, `origin` branch, and inspected preview source:
  `3194eda5fadf8f42b312b1fe484082d8ebbcc13a`.
- Clean isolated worktree:
  `.worktrees/preview-hdl-06-20260810`.
- Owner-confirmed Salla draft: `722988000`; store:
  `dev-v37bn5qobfotqowz`.
- All evidence timestamps are later than the 2026-08-10 21:40:37 +03 preview
  commit.
- `asset-provenance.json` proves draft `app.css` and `app.js` are byte- and
  SHA-256-identical to the local production build. **No Salla preview sync
  failure occurred.**

## Four-environment × four-page matrix

The 16 `<environment>-<page>.json/.png` pairs cover Home, Collection,
Product, and Cart in:

- Arabic mobile RTL 390×844.
- English mobile LTR 390×844.
- Arabic desktop RTL 1366×768.
- English desktop LTR 1366×768.

Results: 16/16 have the expected `html[lang][dir]`, the final draft class and
asset URLs, visible price/CTA where applicable, and
`documentElement.scrollWidth <= innerWidth`. Balanced computed composites are
consistent in all four environments: UI 200ms, feedback 120ms, reveal 240ms.

## Motion profiles and reduced motion

- `motion-profile-live-css-probe.json` validates actual compiled draft CSS:
  Calm 140/100/0 ms, Balanced 200/120/240 ms, and Rich 320/160/400 ms.
  Mobile Rich is capped to Balanced when mobile reduction is enabled. The
  temporary body-class probe was restored to Balanced and does **not** claim
  merchant-editor persistence.
- `reduced-motion-live-change.json` starts one real theme-owned feedback
  animation, changes the OS media query during the session, then records the
  controller switching to reduced state and active animations falling 1→0.
- `reduced-motion-initial.json` verifies reduced state at page initialization:
  UI/feedback 80ms, reveal 0ms, distance 0px, stagger 0ms.
- The emulated media state was reset after capture.
- `reveal-one-shot-live-probe.json` adds one temporary noncritical eligible
  target to the real draft DOM, records one 240ms/4px reveal, proves that a
  second attempt leaves the call count at one, then removes the target and
  disconnects the probe observer. This closes the live one-shot behavior gap
  without mutating merchant data.

## Progressive enhancement and keyboard

- `progressive-enhancement-app-js-blocked.json/.png`: with draft `app.js`
  temporarily blocked, critical product content, price, and CTA remained
  visible and the document did not overflow. Blocking was reset afterward.
- Both keyboard JSON files contain 14 real Chrome Tab stops on the mobile
  product page. All stops show `:focus-visible` and remain within the viewport
  in Arabic RTL and English LTR.
- `cta-feedback-nonmutating-live-probe.json` exercises the exact shared
  controller and merchant-selected `shake` class on the real CTA host without
  dispatching a click or cart request. Feedback began in 8.3ms, ran once,
  settled with zero active animations, did not repeat, added zero resource
  requests, and produced `0.000` motion-attributed CLS. Source/tests separately
  pin the real host's click listener to this same synchronous method.

## Platform-owned boundaries

- `mobile-menu-keyboard-boundary.json`: keyboard opening and RTL drawer side
  are correct, but Escape does not close the legacy `mmenu-light` drawer and
  backdrop close returns focus to `BODY`, not the trigger.
- `platform-search-modal-boundary.json`: Salla's `salla-modal` moves focus to
  the search input and locks body scrolling, but Escape did not close it in
  this draft.

These are **NOT VERIFIED — platform/legacy-owned behavior**, not HDL-06 PASS
claims. No private Salla component internals were patched. Route them to the
owning navigation/search integration Specs and HDL-29.

## CLS interpretation

`cls-matrix.json` records supported `layout-shift` observations in all 16
cases. Collection is near zero; several Home/Product/Cart fixtures have high
total CLS. Recorded sources are existing Salla product hydration, footer and
section reorder, Swiper/product details, and cart forms.

The controlled CTA motion window recorded `0.000` CLS, while the reveal probe
uses only transform/opacity and the full contract gate rejects every
layout-property transition. That supports SC-005 for theme-owned motion. The
much higher total page CLS is still an independent release risk and remains
routed to the page owners and HDL-29.

## Explicitly not verified

- A genuine Add-to-cart transaction was not initiated because it changes the
  demo cart. The HDL-06 motion integration is covered by the source-bound click
  contract plus the non-mutating live controller/class probe; Salla's cart
  request/result itself is platform commerce behavior, not claimed here.
- Merchant editor save/reload persistence for all three motion levels was not
  mutated during QA; the live CSS contract and validated Twig allowlist are
  proven independently.
