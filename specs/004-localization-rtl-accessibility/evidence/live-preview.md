# HDL-04 live Salla preview evidence

Captured on 2026-08-09 (Asia/Riyadh) from preview commit `7c89f9a6`. A later source-only review fix corrected the product note/file collapse class order; the routes and observations below remain attributable to the named preview commit, but the collapse interaction itself requires a post-fix preview.

## Proven preview identity

- Preview worktree: `.worktrees/preview-hdl-04-207a4d1e`
- Preview branch: `preview/hdl-04-207a4d1e`
- Preview commit: `7c89f9a607f3121d1c1c9f50d7f0061a93ea550d`
- Salla editor draft: `1209839665`
- Rendered body marker: `salla-draft-1209839665`
- Local asset origin: `http://localhost:8000`
- The preview branch was confirmed by the owner before browser verification.
- The CLI-created draft `2009529907` was not used as evidence because it did not match the owner-confirmed draft.

Every accepted route loaded Hadeel CSS/JS from `localhost:8000` with HTTP 200. The rendered body also contained the expected `hadeel-*` classes. The inherited `theme-raed` class remains present and is not used as preview-identity evidence.

## Verified Arabic RTL results

| Route/state | Viewport | Result |
|---|---:|---|
| Home, hydrated products | 1366×768 | `lang=ar`, `dir=rtl`, 15 product cards, price and CTA content present, `clientWidth=scrollWidth=1366`, body letter spacing `normal`. |
| Home, hydrated products | 390×844 | 15 product cards, no horizontal overflow, body letter spacing `normal`. |
| Home | 320×800 | No horizontal overflow. |
| Collection, empty category | 1366×768 and 390×844 | RTL toolbar rendered without horizontal overflow. The merchant category contained no products, so populated toolbar/card behavior remains unverified. |
| Product with long Arabic title | 1366×768 | Correct title, price, and visible purchase CTA; `clientWidth=scrollWidth=1366`; Hadeel product bundle loaded locally. |
| Product with long Arabic title | 390×844 | Correct title and visible purchase CTA; `clientWidth=scrollWidth=390`; no non-zero computed letter spacing found. |
| Cart with four items | 1366×768 and 390×844 | `lang=ar`, `dir=rtl`, local checkout bundle, no horizontal overflow, theme-owned quantity label is Arabic. |

Keyboard-only traversal was exercised with trusted Chrome input on the Arabic home route. Desktop focus order followed header tools → category/navigation → logo → search → wishlist → cart → product actions. Mobile focus order followed menu → logo → search → cart → product actions. Focus indicators were visible on the tested controls (2px/3px outlines depending on the owning control).

## Captured artifacts

- `ar-home-desktop-1366x768-7c89f9a6.png`
- `ar-home-desktop-focus-7c89f9a6.png`
- `ar-home-mobile-390x844-7c89f9a6.png`
- `ar-home-mobile-focus-390x844-7c89f9a6.png`
- `ar-home-mobile-320x800-7c89f9a6.png`
- `ar-collection-desktop-1366x768-7c89f9a6.png`
- `ar-collection-mobile-390x844-7c89f9a6.png`
- `ar-product-desktop-1366x768-7c89f9a6.png`
- `ar-product-mobile-390x844-7c89f9a6.png`
- `ar-product-320-overflow-7c89f9a6.png`
- `ar-cart-desktop-1366x768-7c89f9a6.png`
- `ar-cart-mobile-390x844-7c89f9a6.png`

## Explicitly not verified / routed risks

1. **English/LTR runtime matrix — NOT VERIFIED.** `await salla.config.languages()` returned only Arabic (`code=ar`, `status=enabled`, `rtl=true`). Direct `/en` returned Salla 410 in Arabic and loaded no local theme assets. This is a demo-store capability blocker, not an HDL-04 code pass or failure. Repeat the English mobile/desktop matrix at the HDL-07 integrated manual checkpoint after English is enabled.
2. **Product 320px reflow — ROUTE TO HDL-18/HDL-19, release recheck HDL-29.** At an emulated 320px screen, `documentElement.clientWidth=320`, `scrollWidth=348`, and `visualViewport.scale≈0.9195`. The product purchase/gallery layout contains 348px-wide content. The same page passes at 390px. This is not caused by the bounded HDL-04 direction/localization changes and is not silently waived.
3. **Salla-owned quantity buttons — PLATFORM-OWNED EXCEPTION, release recheck HDL-29.** In the Arabic cart, the theme-owned quantity input label is `الكمية`, while hydrated Salla component buttons expose `Increase quantity` and `Decrease quantity`. The labels originate from Salla component output, not theme templates.
4. **Blog disclosure interaction — NOT VERIFIED.** The demo store returned Salla 403 for `/blog`; no theme assets or blog DOM were rendered. Static ARIA/keyboard tests cover the theme contract, but runtime behavior must be repeated when the route is enabled.
5. **Populated collection state — NOT VERIFIED.** The available category was empty. Empty-state direction passed, but populated filter/density/sort order and focus must be repeated with catalogue data.
6. **Lighthouse and measured contrast — NOT VERIFIED.** No project Lighthouse executable is installed, dependencies were intentionally not changed, and the available authenticated WebBridge surface does not expose Lighthouse. Run the audit at the HDL-07 checkpoint; do not infer a score from source or screenshots.
7. A home navigation item rendered merchant data as visible `null` while its accessible fallback name was `Category`. Route menu-data cleanup to HDL-08 and recheck in HDL-29.
8. **Thank-you route and illustration direction — NOT VERIFIED.** The post-order `/thank-you` route was not reachable in the demo store during the T008 pass, so the un-mirrored illustration (the `rtl:-scale-x-100` removal) has static contract coverage only. Repeat the route when an order can be completed; do not infer a runtime pass from source.
9. **Product note/file collapse after the final review fix — NOT VERIFIED.** The fixed implementation has a behavioral regression test against the real helper, but the existing screenshots predate that class-order fix. Repeat click/open, `aria-expanded`, `inert`, Escape, and focus-return checks from a preview SHA containing the fix.

These limitations keep task T008 open. They do not invalidate the verified Arabic source/runtime results and must not be represented as a complete four-way runtime acceptance.
