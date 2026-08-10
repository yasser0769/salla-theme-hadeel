# T009 — Deeper Safelist Spike and Named Experimental Scope

> **HISTORICAL — SUPERSEDED.** This spike responded to the incorrect raw-1MB publishing
> premise. Its measurements remain intact, but none authorizes an active reduced Safelist.

- **Recorded:** 2026-08-09
- **Primary branch / HEAD:** `codex/hdl-05-performance-bundle-ci` / `eb40134dcda5c147ff03a048ad05b3e11ba8a15b`
- **Primary post-font baseline:** 28 files / **1,172,827 raw** / **227,413 gzip-9**; `app.css` **802,202 raw / 103,802 gzip-9**.
- **Isolation:** `/tmp/hdl05-deeper-safelist.8IPMZs`; no primary source, config, bundle, branch, index, commit, or remote was mutated by this spike.
- **Safety claim:** none. These are build measurements only. Runtime safety remains owned by T012.

## Why this spike was required

The prior T008 artifacts disagreed about the Tier-D-only candidate:

- `evidence/t009-spike/hdl05-spike-results.md` (script: `evidence/t009-spike/hdl05-tier-inventory.mjs`; both tracked from the `.worktrees/spike-hdl-05-bundle` originals — the results document byte-identical, the script since patched on 2026-08-10 to resolve the repository root from its tracked location, with unchanged corpus and counts; see `final-review-remediation.md` Blocker 4) included compiled Salla package sources in the exhaustive corpus and measured **2,472 Tier A + 5 Tier C + 17 Tier D**, with only **487 raw bytes** removed.
- `evidence/css-font-candidates.md` excluded that compiled-package evidence and reported **2,213 Tier A + 281 Tier D**, with **58,045 raw bytes** removed.

The first interpretation is retained as the strict conservative boundary because the plan requires the shipped Salla component/package surface in Source 1. The 58,045-byte scope is therefore experimental, not conservative. Neither reaches the hard cap.

## Reproducible method

1. Copy the current working source to a fresh temporary directory, excluding `.git`, `public/`, worktrees, and `node_modules`; symlink the existing read-only dependency tree.
2. Scan all theme Twig/JS/SCSS/JSON for literal `s-*` tokens and `salla-*` component tags.
3. Expand complete Safelist families for components reachable from the launch routes: layouts, all home components, home, product plus its partials, collection, cart, and brands.
4. Retain generic/core primitives and every literal `s-*` token referenced by the repository.
5. For the named cap-passing scope, retain the Loyalty families used by widget/cart/reward/modal/points-banner/confirmation/prize-item, but omit inferred full Loyalty landing/history families not referenced literally.
6. Run a production webpack build per variant and measure every `public/` file with Node `gzipSync(level: 9)`.

The isolated full-Safelist build reproduced `app.css` exactly at **802,202 B**. Its JS total was 32 raw / 212 gzip bytes larger than the primary manifest, so only within-environment CSS deltas are projected onto the authoritative primary total. The chosen candidate was rebuilt twice byte-identically.

Reproducibility artifacts:

- `evidence/t009-spike/hdl05-tier-inventory.mjs` — the exhaustive pre-decision static inventory script (Source 1 corpus definition, tier classifier)
- `evidence/t009-spike/hdl05-spike-results.md` — its final results: 2,494 safelist tokens, 2,358 corpus files, Tier A 2,472 / Tier B 0 / Tier C 5 / Tier D 17
- `evidence/t009-spike/generate-family-scopes.mjs`
- `evidence/t009-spike/family-inventory.json`
- `evidence/t009-spike/safelist-full-baseline.txt` — SHA-256 `52f1205b99071a81444f8a2fb49cc32ba1f7df9fd10e781d3b50571a2dcab2ab`
- `evidence/t009-spike/safelist-launch-core-full-loyalty.txt` — SHA-256 `833fae3b9bf4d9266d57bb6e21609a3417695b38694b5b2ef5c5c44d075ba5b8`
- `evidence/t009-spike/safelist-launch-core-loyalty-cart.txt` — SHA-256 `c5dee58b5c32c63b3498464b3f4ff1d8a17d09ffa92b241f5589920a70cff87a`
- Candidate `app.css` — SHA-256 `36810c968f002040c8497c6151de0a82f678b4d84b9f2e5c350a51f7bea232d6`

## Measured decision curve

| Scope | Kept lines | Raw delta | Projected primary total | Hard-cap result | Classification |
|---|---:|---:|---:|---:|---|
| Full Salla Safelist | 2,494 | — | 1,172,827 | 172,827 over | Baseline |
| Strict Tier-D-only | 2,477 | −487 | 1,172,340 | 172,340 over | Conservative |
| Source-exclusion scan | 2,213 | −58,045 | 1,114,782 | 114,782 over | Experimental; prior packet, does not pass |
| Prior source-derived list | 1,909 | −100,166 | 1,072,661 | 72,661 over | Experimental; does not pass |
| All theme-reachable families + core | 1,858 | −109,718 | 1,063,109 | 63,109 over | Experimental; does not pass |
| Launch-route families + core | 1,630 | −153,520 | 1,019,307 | 19,307 over | Experimental; does not pass |
| **Launch-route families + core + C5 lossless media** | **1,630** | **−175,084 net built** | **997,743** | **passes by 2,257** | **Selected experimental / high risk; retains full Loyalty** |
| **Launch core + Loyalty cart subset** | **1,488** | **−181,418** | **991,409** | **passes by 8,591** | **Named experimental / high risk** |
| Launch core without inferred Loyalty states | 1,361 | −202,385 | 970,442 | passes by 29,558 | More destructive; not recommended |
| Full Safelist removal | 0 | −493,408 | 679,419 | passes by 320,581 | Unsafe ceiling; rejected |

For the named experimental scope, projected gzip-9 is **206,049 B** and `app.css` is **620,784 B**. Gzip remains informational.

## Exact named experimental scope

**Name:** `C1-LAUNCH-CORE-LOYALTY-CART`

It retains:

- every generic/no-`s-*` Safelist row;
- every literal `s-*` token referenced by Hadeel source;
- full component-family expansion for layouts, Home, Product and product partials, Collection, Cart, Brands, and shared home components;
- the explicit core primitives for form/input/button/modal/alert/toast/loading/drawer/menu/search/product-card/add-product/quantity/slider/cart/breadcrumb;
- 142 Loyalty rows covering direct references plus widget/cart/reward/modal/points-banner/confirmation/prize-item states.

It does not family-expand supporting-route-only components such as Orders, Wallet, User Settings, Rating Modal, notifications, and verification, and it removes 142 inferred Loyalty landing/history rows such as points-history tables and the full program landing presentation. Exact membership is the committed candidate text file above; prose is not the contract.

## Accepted-risk requirements if selected

This scope is **not safe by inference**. Selecting it accepts these named risks:

1. Salla server-rendered or hook-injected states absent from repository source can lose generated styles.
2. Customer/account/orders/wallet/blog/thank-you/landing/testimonials/loyalty-history surfaces are not fully covered by the launch-family expansion.
3. The Cart Loyalty widget subset is retained, but no authenticated rendered Loyalty state has been verified yet.
4. English/LTR is unavailable on the current demo store and remains `NOT VERIFIED` until HDL-07 or another proven bilingual store.
5. The 8,591-byte margin is narrow and leaves the theme **141,409 B above** the 850,000 internal target; subsequent Specs cannot grow the bundle without compensating reductions.

Required revalidation and rollback:

- T012 must add Cart and an authenticated Loyalty widget/reward state to Home/Product/Collection, verify before/after DOM classes against the candidate CSS, and revert C1 on any regression.
- Customer/account/orders/wallet/loyalty page/blog/thank-you/supporting routes must be revalidated in HDL-23 and again at HDL-29.
- Every preset must revalidate the shipped scope in HDL-24…27, with the final release gate in HDL-29.
- Any missing style causes a focused C1 revert, never a forward override stylesheet or `!important` patch.

## Owner choices at T009

1. **`HDL-05 SAFELIST: CONSERVATIVE`** — accept only strict Tier-D removal. The cap remains red and HDL-05 is explicitly not done.
2. **`HDL-05: C1-LAUNCH-CORE-FULL-LOYALTY + C5-LOSSLESS-MEDIA — ACCEPT HIGH RISK`** — **selected 2026-08-10**: exact 1,630-line artifact `safelist-launch-core-full-loyalty.txt` (SHA-256 `833fae3b9bf4d9266d57bb6e21609a3417695b38694b5b2ef5c5c44d075ba5b8`) plus the lossless-media candidate. Projected total was 997,742 B; measured total is 997,743 B / margin 2,257 B because the `.webp` JS literal adds one byte. Full Loyalty is retained; supporting-route and live-media obligations are accepted.
3. **`HDL-05 SAFELIST: C1-LAUNCH-CORE-LOYALTY-CART — ACCEPT HIGH RISK`** — authorize the exact 1,488-line artifact, with every revalidation and rollback obligation above. It has a wider cap margin but removes 142 inferred Loyalty landing/history rows.
4. **`HDL-05 SAFELIST: ANOTHER SPIKE`** — request another measured scope; no T010 change begins.

Full removal and the no-Loyalty inferred variant are not recommended owner choices.
