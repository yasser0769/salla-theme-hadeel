# T008 — Owner decision packet: measured CSS/font/bundle candidates (C1–C5)

> **HISTORICAL — SUPERSEDED raw-byte decision packet.** Measurements remain evidence of
> the original work. C1 was later reversed exactly; C5 and T005F remain.

- **Recorded (UTC):** 2026-08-09
- **HEAD:** `eb40134dcda5c147ff03a048ad05b3e11ba8a15b` (HDL-05 changes uncommitted on `codex/hdl-05-performance-bundle-ci`)
- **Current committed-tree absolute (checker-verified):** 28 files, **1,172,827 B raw**, **227,413 B gzip-9** — over the 1,000,000 B hard cap by **172,827 B**, over the 850,000 B internal target by 322,827 B.
- **Baseline reproduction:** `git archive HEAD public` + the 5 gitignored `*.LICENSE.txt` build artifacts reproduces the spec baseline exactly: **33 files / 1,559,227 raw / 609,438 gzip-9**. The 31 B offset noted in plan.md is gone — absolutes in this packet come from the committed checker, not hand arithmetic.
- **Authoritative reconciliation:** `evidence/deeper-safelist-spike.md` supersedes the contradictory conservative label in the first packet and adds a reproducible named cap-passing scope. Exact generator/input artifacts are under `evidence/t009-spike/`.
- **Method:** candidates were built only in throwaway isolated copies. The deeper spike reproduced final `app.css` byte-for-byte at **802,202 B**. Its unrelated JS output was 32 raw / 212 gzip bytes larger than the primary manifest, so the table projects only within-environment CSS deltas onto the authoritative primary total.
- **No option in this packet claims runtime safety.** That claim belongs to the T012 post-change runtime gate. Browser/preview runs are owner-gated and were not performed; every surface that could not be rendered is listed as **NOT VERIFIED** below, not omitted.

## C1 — Salla Tailwind safelist scope (`safe-list-css.txt`, 2,494 lines)

### Coverage inventory (plan.md evidence model)

**Source 1 — exhaustive static inventory (built):** theme Twig/JS/SCSS/JSON, Salla/Twilight component and package sources, and the shipped Safelist inventory. The strict scan records 2,472 package/source-backed rows, 5 known-unrendered rows, and 17 rows with no evidence. The exhaustive inventory script and its final results are tracked at `evidence/t009-spike/hdl05-tier-inventory.mjs` and `evidence/t009-spike/hdl05-spike-results.md` (exact corpus: `src/views/**/*.twig`, `src/assets/js/**/*.js`, `twilight.json`, `tailwind.config.js`, all text files under `node_modules/@salla.sa/twilight-components/{dist,loader}`, and all text files under `node_modules/@salla.sa/twilight-tailwind-theme` except `safe-list-css.txt` itself — 2,358 corpus files, 2,494 safelist tokens). A second scan that excluded compiled Salla package evidence produced the earlier 2,213/281 split; it is retained only as an experimental measurement, never called conservative.

**Source 2 — rendered DOM/network samples:** **none obtainable in this phase.** Fresh captures require a browser against a Salla preview (owner-gated, not run). The valid historical same-source evidence (HDL-04 preview commit `7c89f9a6`, draft `1209839665`, origin `localhost:8000`) consists of screenshots and narrative — no DOM class dumps or network logs — so it contributes **zero class-level rows**. Tier B is therefore empty and every Tier-A/D boundary below rests on static evidence alone.

**Strict tiering result:** Tier A **2,472** · Tier B **0** · Tier C **5** · Tier D **17**. The strict conservative candidate retains A+C and removes only D. Unrendered surfaces remain explicitly **NOT VERIFIED**: English/LTR, customer/account/orders/wallet, blog, thank-you, Loyalty history, populated collection, and final preset matrices.

### Measured deltas (`app.css`; final primary baseline 802,202 raw / 103,802 gzip-9)

| Scope | Lines kept | app.css raw | Δ raw | Δ gzip-9 | Verdict |
|---|---:|---:|---:|---:|---|
| Baseline (full Safelist) | 2,494 | 802,202 | — | — | — |
| **Strict conservative** (A+C; removes 17 D rows) | 2,477 | 801,715 | **−487** | −28 | **conservative-within-proven-coverage** |
| Source-exclusion scan | 2,213 | 744,157 | −58,045 | −6,407 | Experimental; does not pass cap |
| Prior source-derived list | 1,909 | 702,036 | −100,166 | −12,159 | Experimental; does not pass cap |
| Theme-reachable families + core | 1,858 | 692,484 | −109,718 | −13,294 | Experimental; does not pass cap |
| Launch-route families + core | 1,630 | 648,682 | −153,520 | −18,108 | Experimental; does not pass cap |
| **`C1-LAUNCH-CORE-LOYALTY-CART`** | **1,488** | **620,784** | **−181,418** | **−21,364** | **Named experimental / high risk; passes cap by 8,591 total bytes** |
| Full Safelist removal | 0 | 308,794 | −493,408 | −56,918 | Unsafe ceiling; rejected |

The named scope retains launch-route component families, generic/core primitives, every literal source token, and 142 Loyalty cart/widget/reward/points-banner rows. It omits supporting-route family expansion and 142 inferred full Loyalty landing/history rows. This can regress Salla server-injected states and supporting routes; its accepted-risk contract and exact rollback/revalidation obligations are in `evidence/deeper-safelist-spike.md`. No scope claims runtime safety before T012.

## C2 — Bundled Thmanyah fonts — EXECUTED (owner decision 2026-08-09, T005F)

Not re-offered as an option. Measured result (`evidence/font-removal.md`, independently reproduced twice):

| Measure | Before | After | Δ |
|---|---:|---:|---:|
| `public/` files | 33 | 28 | −5 |
| Raw bytes | 1,559,227 | 1,172,827 | **−386,400** |
| gzip-9 bytes | 609,438 | 227,413 | **−382,025** |

Composition: 5 font files 385,492 raw / 381,808 gz + `app.css` font rules/fallback 908 raw / 217 gz. Runtime font contract: Salla `theme.font` → `--font-main` with the generic system fallback `sans-serif`; `use_theme_font` ID/type/default/storage preserved as a deprecated no-op; zero `woff/woff2/@font-face/Thmanyah` in `src/` or `public/` (pinned by tests). HDL-04 tests 24/24, HDL-03 73/73, `check-theme --build` 0/0. RTL/LTR rendering on a live storefront: **NOT VERIFIED** (preview gate).

## C3 — Split `blog`/`wishlist` off the always-loaded `app` entry

Measured in the isolated env: `app.js` shrinks by 12,018 raw, but the new `wishlist.js` and `blog.js` entries add their own runtime/module overhead. **Total `public/` increases by 3,692 raw / 1,948 gzip-9** and file count rises 28 → 30. C3 is rejected as a cap-reduction lever; no template or build change is authorized from it.

## C4 — Deleting a large feature stylesheet (`storefront-system.scss` / `product.scss`)

**Rejected** (recorded so it is not re-proposed). Plan-measured contribution is only ~31–35 KB each against the curated-safelist build, and each deletes real features. Not re-measured in this spike: removing either file breaks the build by design, and the plan's measurement stands. Reversal cost: n/a — not a candidate.

## C5 — Lossless image optimization; no deletion

Classification in `evidence/asset-classification.md` still stands: no image is authorized for deletion, including `check.svg` and the four tiny `s-empty*.png` files whose Salla-rendered use remains `NOT VERIFIED`.

A later isolated spike found a non-deletion candidate, `C5-LOSSLESS-MEDIA`: lossless WebP conversion of the fully opaque placeholder plus accessibility-preserving SVG optimization. Exact decoded RGBA pixels match for the placeholder; three SVGs match exactly; Delivery and Tabby measure SSIM 0.999995 and 1.000000 respectively with no visible difference at intrinsic size. Payment icon roles and title references are preserved. Total measured raw saving is **21,565 B**. Full hashes, metrics, proposed outputs, and the rejected accessibility-breaking default-SVGO result are documented in `evidence/media-optimization-spike.md`.

This is still experimental until live Salla resolution and rendering pass T012. Licence files (815 B) are webpack-emitted and unchanged.

## The arithmetic the owner decision rests on

Post-T005F absolute: **1,172,827 B**. Hard cap: **1,000,000 B** (gap 172,827 B).

| Combination | Resulting total | Clears cap? |
|---|---:|---|
| Strict conservative C1 | 1,172,340 | **No** (over by 172,340) |
| Theme-reachable families + core | 1,063,109 | **No** (over by 63,109) |
| Launch-route families + core | 1,019,307 | **No** (over by 19,307) |
| **Launch-route families + core + `C5-LOSSLESS-MEDIA`** | **997,743 measured** | **Yes (margin 2,257)** |
| **`C1-LAUNCH-CORE-LOYALTY-CART`** | **991,409** | **Yes (margin 8,591)** |
| Full C1 removal (unsafe ceiling) | 679,419 | Yes, but rejected |

Plain statement: the conservative scope cannot close HDL-05. The owner selected the 1,630-line launch-core scope plus lossless media because it retains the complete Loyalty family. The measured result is 997,743 B with a 2,257 B margin; supporting-route/runtime safety remains unverified. The 1,488-line `C1-LAUNCH-CORE-LOYALTY-CART` alternative was not selected. Full removal remains rejected.

## What this packet does not claim

- No runtime safety for any scope — that is T012's verdict only.
- No English/LTR, customer/account/orders/wallet, blog, thank-you, full Loyalty history, populated-collection, or preset-matrix coverage — all **NOT VERIFIED**, routed to HDL-07 (language availability), HDL-23 (supporting routes), HDL-24…27 (per-preset revalidation), and HDL-29 (launch gate).
- No Lighthouse/CWV numbers — no zero-dependency tooling exists; the automated job is deferred to HDL-29 behind its own dependency commit (plan.md).
