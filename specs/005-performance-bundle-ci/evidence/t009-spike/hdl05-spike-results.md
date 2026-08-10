# HDL-05 bundle-size spike — measurement results

Date: 2026-08-09. Worktree: `.worktrees/spike-hdl-05-bundle` (branch `codex/spike-hdl-05-bundle`).
**All numbers are byte measurements only. No runtime-safety claim is made or implied for any
variant.** gzip = `gzip -9 -n -c FILE | wc -c`. Raw = `stat -f '%z'`. Totals = sum over every
file in `public/`.

## Step 0 — Font parity (applied to match primary post-T005F)

- Deleted `src/assets/images/fonts/` (the `thmanyah/` woff2 files).
- Deleted `src/assets/styles/01-settings/fonts.scss`.
- Removed `@use './01-settings/fonts' as *;` from `src/assets/styles/app.scss`.
- Removed the `body.use-theme-font { font-family: "Thmanyah Sans", ... }` rule from
  `src/assets/styles/04-components/storefront-system.scss` and changed the `body` font-family
  there from `var(--font-main), sans-serif` to
  `var(--font-main), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Verified: `grep -ri "thmanyah\|@font-face\|\.woff" src` → no matches.

## Step 1 — Baseline B0

Commands:

```bash
git show HEAD:tailwind.config.js > tailwind.config.js   # full 2,493-line Salla safelist
npx webpack --mode production                            # exit 0, 3 perf warnings, no errors
find public -type f -exec stat -f '%z %N' {} \;          # summed for total raw
gzip -9 -n -c public/app.css | wc -c                     # per-file gzip-9
```

Result: **files=28, total_raw=1,172,916, total_gzip9=227,683; app.css raw=802,260
gzip9=103,859; app.js raw=129,228 gzip9=37,099.**

**Sanity check vs stated primary baseline:** app.css matches exactly (802,260 B). Totals do
NOT match exactly: total raw is +31 B (1,172,916 vs 1,172,885) and total gzip-9 is +213 B
(227,683 vs 227,470). Read-only size comparison against the primary `public/` localizes the
entire +31 B to five JS files, each 6–7 B larger in this worktree:
`add-product-toast.js` (+6), `app.js` (+7), `product-card.js` (+6), `product.js` (+6),
`testimonials.js` (+6). Cause not investigated further (likely a small source/banner drift
between the worktree commit and primary HEAD); reported here per instructions, not silently
reconciled. app.css — the subject of every C1 variant — is byte-identical, so C1 deltas vs
B0 are comparable to primary's post-font baseline.

## Step 2 — Static inventory + tiers (script: `hdl05-tier-inventory.mjs`)

Safelist tokens: 2,494 unique non-empty lines (file has 2,493 newline-terminated lines +
final line). Corpus ("Source 1"): 2,358 files — `src/views/**/*.twig`, `src/assets/js/**/*.js`,
`twilight.json`, `tailwind.config.js`, all text files under
`node_modules/@salla.sa/twilight-components/{dist,loader}`, and all text files under
`node_modules/@salla.sa/twilight-tailwind-theme` except `safe-list-css.txt` itself.

| Tier | Count | Meaning |
|---|---|---|
| A | 2,472 | word-boundary exact match in corpus (boundaries = non `[A-Za-z0-9_-]`) |
| B | 0 | rendered-DOM evidence: **none machine-readable this phase** (only screenshots exist) — intentionally empty |
| C | 5 | non-A matching known-unrendered surface pattern (customer/account/.../address) |
| D | 17 | non-A, non-C |

Outputs: `hdl05-safe-list-conservative.txt` = Tier A + C (2,477 lines);
`hdl05-safe-list-tierA.txt` = Tier A only (2,472 lines).

Note: Tier A is nearly the whole safelist because the corpus includes the compiled CSS shipped
inside `@salla.sa/twilight-tailwind-theme`, which mentions almost every safelist selector.
Tier A therefore measures "mentioned anywhere in Salla's shipped package sources", not
"rendered on this storefront" — no safety conclusion should be drawn from it.

Tier D examples (all 17 listed; ≤30 requested):

```
[dir='rtl'] s-basket-gap-entry .s-basket-gap-card-offer.s-basket-gap-card-offer .s-count-down-item:not(:last-child)::after
[dir='ltr'] s-basket-gap-entry .s-basket-gap-card-offer.s-basket-gap-card-offer .s-count-down-item:not(:first-child)::after
[dir='rtl'] flatpickr-calendar
salla-slider[direction='ltr'] s-slider-block__title-nav
salla-slider:not(hydrated), .carousel-slider
salla-slider[type]:not(hydrated) > div, salla-slider[type]:not(.hydrated) .swiper > div > div, .carousel-slider .swiper
salla-slider[type]:not(hydrated) > div > div, salla-slider[type]:not(.hydrated) .swiper > div > div > div, .carousel-slider .swiper-wrapper > div
salla-slider:not([type='carousel']):not([type='thumbs']):not(hydrated) > div, salla-slider.photos-slider:not(.hydrated) > div
salla-slider:not([type='carousel']):not([type='thumbs']):not(hydrated) > div > div, salla-slider.photos-slider:not(.hydrated) > div > div
salla-slider:not([type='carousel']):not([type='thumbs']):not(hydrated) > div > div:nth-child(n+2)
salla-slider:not(hydrated)
thumbs s-slider-thumbs-container
salla-slider video-entry, salla-slider .model-entry
salla-slider video-entry:before, salla-slider .model-entry:before
salla-slider model-entry .s-toggle-switcher
salla-slider model-entry:before
[dir='ltr'] s-verify-back
```

(All 17 Tier D tokens are multi-selector compound lines; Tailwind's candidate extraction can
never match them as single utilities anyway.)

## Step 3 — C1 builds

Method per variant: edit the safelist path in `tailwind.config.js` `content` (or delete the
line for full removal), `npx webpack --mode production`, measure. All builds exit 0, no
errors, same 3 pre-existing webpack performance warnings as B0.

| Variant | Safelist content | app.css raw | app.css gzip9 | total raw | total gzip9 | Δ raw vs B0 | Δ gzip9 vs B0 |
|---|---|---:|---:|---:|---:|---:|---:|
| B0 (baseline) | full `safe-list-css.txt` (2,494 tokens) | 802,260 | 103,859 | 1,172,916 | 227,683 | — | — |
| C1-conservative | `hdl05-safe-list-conservative.txt` (A+C, 2,477) | 801,773 | 103,831 | 1,172,429 | 227,655 | −487 | −28 |
| C1-experimental-tierA — **EXPERIMENTAL** | `hdl05-safe-list-tierA.txt` (A only, 2,472) | 801,773 | 103,831 | 1,172,429 | 227,655 | −487 | −28 |
| C1-derived (prior exploratory list, re-measured) | `hdl05-safe-list-css.txt` (1,909 lines) | 702,094 | 91,700 | 1,072,750 | 215,524 | −100,166 | −12,159 |
| C1-full-removal — **UNSAFE, measurement ceiling only** | safelist content line removed | 308,852 | 46,941 | 679,508 | 170,765 | −493,408 | −56,918 |

Observations (measurements, not safety claims):
- Conservative and Tier-A-only produce byte-identical output: the 5 Tier-C-only tokens
  generate no utilities (all are compound selector lines).
- Both shrink app.css by only 487 B (−0.06%). Corpus-based Tier A keeps ~99% of the safelist
  (see the corpus caveat in Step 2), so it is not a meaningful reduction lever as classified.
- The derived 1,909-line list removes 100,166 raw / 12,159 gzip-9 B from totals.
- Full removal is the ceiling: −493,408 raw / −56,918 gzip-9.

## Step 4 — C3 entry split (composition measurement only)

With `tailwind.config.js` restored to B0 (full safelist), `webpack.config.js` changed:
`entry.app` = `[asset('styles/app.scss'), asset('js/app.js')]`, plus new entries
`wishlist: asset('js/wishlist.js')` and `blog: asset('js/blog.js')`.
Build exit 0. **This measures bundle composition only — no claim about how templates would
load the new entries.**

| File | B0 raw | B0 gzip9 | C3 raw | C3 gzip9 | Δ raw | Δ gzip9 |
|---|---:|---:|---:|---:|---:|---:|
| app.js | 129,228 | 37,099 | 117,210 | 33,104 | −12,018 | −3,995 |
| wishlist.js | — | — | 3,685 | 1,494 | +3,685 | +1,494 |
| blog.js | — | — | 12,025 | 4,449 | +12,025 | +4,449 |
| app.css (sanity) | 802,260 | 103,859 | 802,260 | 103,859 | 0 | 0 |
| **total public/** | 1,172,916 | 227,683 | 1,176,608 | 229,631 | **+3,692** | **+1,948** |

C3 alone *increases* total bytes (+3,692 raw / +1,948 gzip-9): the split entries each pay
their own webpack runtime/module overhead. file count 28 → 30.

Combination measured directly (C1-derived safelist + C3 entries, one build):
total raw 1,076,442 / gzip-9 217,472 — exactly C1-derived + 3,692 / + 1,948, i.e. C3's cost
is additive. app.css 702,094 / 91,700; app.js 117,210 / 33,104.

## Step 5 — Cap computation (vs 1,000,000 B total-raw cap, from measured B0 = 1,172,916 B)

Required reduction to reach the cap: **172,916 raw B**.

| Combination | Total raw (B) | Source | Reaches ≤1,000,000? |
|---|---:|---|---|
| B0 | 1,172,916 | measured | No (over by 172,916) |
| C1-conservative | 1,172,429 | measured | No (over by 172,429) |
| C1-experimental-tierA | 1,172,429 | measured | No (over by 172,429) |
| C1-derived | 1,072,750 | measured | No (over by 72,750) |
| C3 alone | 1,176,608 | measured | No (over by 176,608) |
| C1-derived + C3 | 1,076,442 | measured | No (over by 76,442) |
| C1-full-removal (UNSAFE ceiling) | 679,508 | measured | Yes (under by 320,492) |
| C1-full-removal + C3 | 683,200 | computed (679,508 + 3,692) | Yes (under by 316,800) |

Plain statement: **no measured SAFE-labeled combination reaches the 1,000,000 B raw cap.**
The only variant under the cap is full safelist removal, which is the UNSAFE measurement
ceiling. Closing the remaining 72,750–76,442 B gap from C1-derived would require reductions
outside what was measured here (or a safelist smaller than the derived list); this spike
makes no claim about what is safe to remove.

## What changed in this worktree (left as-is, per instructions)

- Deleted: `src/assets/images/fonts/`, `src/assets/styles/01-settings/fonts.scss` (font parity, Step 0).
- Edited: `src/assets/styles/app.scss` (removed fonts `@use`),
  `src/assets/styles/04-components/storefront-system.scss` (removed `use-theme-font` rule,
  body font-family fallback chain).
- Edited: `tailwind.config.js` — **currently points at `hdl05-safe-list-css.txt` (derived)
  with the C3 webpack entries** (state of the last combination build). Original HEAD version
  restorable via `git show HEAD:tailwind.config.js`; pre-spike derived-safelist version
  preserved at `tailwind.config.derived-safelist.js.bak`.
- Edited: `webpack.config.js` — C3 entry split (app/wishlist/blog).
- Added: `hdl05-tier-inventory.mjs`, `hdl05-safe-list-conservative.txt`,
  `hdl05-safe-list-tierA.txt`, `tailwind.config.derived-safelist.js.bak`, this report.
- Untouched: `hdl05-safe-list-css.txt` (other agent's file), `node_modules` (symlink),
  everything outside the worktree. No commits, no pushes, no git mutations.
- `public/` currently holds the C1-derived+C3 combination build (development of this spike;
  rebuild from HEAD config restores B0 bytes, font parity aside).
