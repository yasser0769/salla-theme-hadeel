# HDL-06 Baseline (T003) — pre-change measurements

**Date**: 2026-08-10 · **Branch**: `codex/hdl-06-motion-system` · **Captured before any HDL-06 source change.**

## Static guard

```text
$ node scripts/check-theme.mjs --json
exit 0 — 0 errors, 0 warnings (full JSON: /tmp/hdl06-check-theme-before.json)
```

## Compressed package estimate (HDL-05 deterministic model)

```text
$ node scripts/check-bundle-budget.mjs --budget
[publishing]
   info  Salla package model: sallaPackageEstimate (156 allowlisted files; exact server-side manifest not locally provable)
   info  Raw theme package: 2071195 B
   info  Compressed theme package: 475903 / 1000000 B — PASS
   info  Usage: 47.59%
   info  Internal target: 950000 B (95% of current Salla hard cap)
   info  Remaining to internal target: 474097 B
   info  Remaining to Salla hard cap: 524097 B
[build-telemetry]
   info  public/: 1151263 B raw / 214496 B gzip-9 / 217576 B deterministic ZIP — telemetry only
0 error(s)
```

## Byte measurements (committed production build)

| Artifact | Raw bytes | gzip-9 bytes |
|---|---:|---:|
| `public/app.css` | 802,202 | 103,810 |
| `public/app.js` | 129,221 | 37,063 |
| **aggregate app entry** | **931,423** | — |
| `public/` total | 1,151,263 | 214,496 (ZIP 217,576) |

## CSS snapshot

```text
$ node scripts/css-snapshot.mjs /tmp/hdl06-before-css.txt
6838 rules -> /tmp/hdl06-before-css.txt (938,093 B)
```

## Pre-change motion audit (source classification)

- **Entries/chunks**: `webpack.config.js` entries — `app` (app.scss + wishlist.js + app.js + blog.js), `home`, `product-card`, `main-menu`, `wishlist-card`, `add-product-toast`, `digital-files`, `checkout`, `pages`, `product`, `order`, `testimonials`. HDL-06 adds none.
- **Dependencies**: `animejs` declared in `package.json`, imported at runtime only via `src/assets/js/partials/anime.js` (`window.anime` global + `Anime` wrapper), consumed by `app.js` (`this.anime()` helper, no callers outside the wrapper) and `blog.js` (two like-counter effects). HDL-06 removes the runtime import/wrapper only; `package.json`/`pnpm-lock.yaml` stay unchanged.
- **Network requests**: theme adds no motion-related request today; HDL-06 adds none.
- **Periodic CTA timer**: `src/assets/js/product.js:initAddToCartAnimation` runs `window.setInterval(play, intervalSeconds * 1000)` (2–40s, from `data-add-to-cart-animation-interval`) — removed by HDL-06; feedback becomes action-triggered.
- **Reduced motion today**: only 4 component blocks (`product.scss`, `add-product-toast.scss`, `storefront-system.scss`, `product-card.scss`); `html { scroll-behavior: smooth; }` unguarded in `02-generic/common.scss`; Product CTA check is initial-load-only.
- **Raw timing values**: ~45 transition/animation declarations with raw time literals across 16 owner files; only one `var(--animate-duration)` reference exists and that token is undefined (animate.css whitelist) — the duplicate `.animated` rule in `common.scss` is overridden by `02-generic/animations.scss` (imported later), which hardcodes `400ms`.
- **Smooth scroll**: `02-generic/common.scss:1-3` `html { scroll-behavior: smooth; }` with no reduced-motion gate.
