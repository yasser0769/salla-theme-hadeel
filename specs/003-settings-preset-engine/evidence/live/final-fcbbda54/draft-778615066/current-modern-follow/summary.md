# HDL-03 Phase A (read-only batch) — draft 778615066, current state: engine ON / Modern / all Follow

- Date (UTC): 2026-08-09T06:44:04Z
- Draft: `draft-778615066` (supersedes 1095952682) · Version: `192045281` · Source SHA: `fcbbda542b1b8dcc6747202ae616af32f4f66b1c` (Salla CLI, localhost:8000/8001)
- Store: `1736483913` / `dev-v37bn5qobfotqowz` (`https://salla.sa/dev-v37bn5qobfotqowz`, plan team)
- Watch URL token: `7908381efb248144d405c7c02114840e` · Storefront landing: `https://salla.design/{en|ar}/dev-v37bn5qobfotqowz?preview=true`
- Batch was READ-ONLY: no setting changes, no Save/Publish/Confirm.

## Editor artifacts

| Artifact | Verdict | Shows |
|---|---|---|
| `editor-presets-group-top-20260809T064404Z.png` | PASS | Group title bar «التصميمات الجاهزة», engine toggle ON, profile «عصري» (modern), boundary note, inline explainer «كيف تعمل التصميمات الجاهزة؟» |
| `editor-presets-modes-six-follow-20260809T064404Z.png` | PASS | Six «اتباع التصميم الجاهز» (follow_preset) selects in DOM order — Basic (عرض المحتوى، المسافة بين الأقسام، استدارة الحواف) before Advanced (نمط بطاقات المنتجات، تخطيط رأس المتجر، ارتفاع رأس المتجر) — plus boundary/Save bar |
| `editor-presets-group-order-values-20260809T064404Z.json` | PASS | Exact DOM order (11 nodes), all current values (engine on, modern, 6× follow_preset, legacy stored: wide/balanced/rounded/minimal/centered/comfortable) |

## Storefront artifacts (Modern + all Follow)

Every capture: `salla-draft-778615066` ✓ · 6 localhost:8000 assets (app.css, app.js, product-card.js, main-menu.js, add-product-toast.js, home.js) ✓ · `hadeel-preset-modern` + all six hadeel families ✓ · `data-hadeel-preset="modern"` + `data-hadeel-preset-sources` (all six `:preset`) ✓ · `scrollWidth == innerWidth` (no overflow) ✓ · CDP `Emulation.setDeviceMetricsOverride` ✓

| Artifact | Verdict | Viewport | lang/dir | Commerce signals |
|---|---|---|---|---|
| `home-modern-follow-en-ltr-1366x768-20260809T064404Z.{png,json}` | PASS | 1366×768 dsf=1 | en/ltr | 15 cards hydrated, prices "174 AED / 349 AED" sale strikethrough, quick-view CTAs; cart/search/drawer present |
| `home-modern-follow-en-ltr-320x800-20260809T064404Z.{png,json}` | PASS | 320×800 dsf=2 mobile | en/ltr | 15 cards, prices, wishlist/quickview/cart icon CTAs, mobile bottom nav |
| `home-modern-follow-ar-rtl-1366x768-20260809T064404Z.{png,json}` | PASS | 1366×768 dsf=1 | ar/rtl | 15 cards, Arabic-Indic prices "١٧٤ د.إ", Arabic quick-view CTAs |
| `home-modern-follow-ar-rtl-320x800-20260809T064404Z.{png,json}` | PASS | 320×800 dsf=2 mobile | ar/rtl | 15 cards, Arabic prices, Arabic bottom nav (recaptured post-hydration) |

## Honesty notes

- `salla-products-list` hydration is slow/racy in standalone preview: the first AR 320×800 measure (30s wait) recorded 0 cards; the page hydrated shortly after and the capture was redone with 15 cards. JSON files reflect the final accepted measurements.
- The editor-embedded preview iframe renders partially unstyled at times (localhost CSS timing inside the iframe); the standalone watch-tab storefront — which is the accepted evidence surface — renders fully styled.
- `add_to_cart_buttons` (`salla-add-product-button`) is 0 on home in all states: CTA icons are card-level custom buttons, not that component. Recorded as-observed.
- Editor preview iframe and storefront both show product images, prices, and CTAs; no console-level verification of ws://localhost:8001 live-reload was performed (read-only batch).
