# T012 — Post-change Salla runtime gate

> **Current status (T013 review, 2026-08-10): REOPENED / INCOMPLETE.** The saved Home before/after
> evidence is valid, but Product and Collection lack the required bilingual before/after network
> captures, and FR-004 still lacks two product counts on one actual Collection route. The older
> rendered matrix below remains supporting evidence; it does not close these two acceptance blockers.

- **Captured:** 2026-08-10 07:39–07:48 +03
- **Owner-confirmed editor draft:** `1233213199`
- **Preview branch:** `codex/preview-hdl-05-20260810`
- **Preview SHA:** `a9e9ab0c11eeafe1bf0024b8aad2342eef4ec3b9`
- **Primary implementation branch / HEAD:** `codex/hdl-05-performance-bundle-ci` / `eb40134dcda5c147ff03a048ad05b3e11ba8a15b`
- **Browser:** Chrome, explicitly selected; 390×844 mobile and 1366×768 desktop overrides
- **Throttling:** none. Slow-network/device throttling is **NOT VERIFIED**.

## Preview identity and sync result

The preview worktree was clean and its local, upstream, and remote SHA all matched
`a9e9ab0c11eeafe1bf0024b8aad2342eef4ec3b9` before the browser opened. The Salla CLI was run only in
that worktree with `--browser chrome`.

The CLI created draft `460224008` even though the owner confirmed draft `1233213199`. This is recorded
as **SALLA PREVIEW SYNC FAILURE**, not a code failure. The owner-confirmed editor's signed watch route
was used instead. The rendered storefront proved the intended draft and local source simultaneously:

- body class `salla-draft-1233213199`;
- the expected `hadeel-*` layout/preset classes;
- `app.css`, `app.js`, `product-card.js`, `main-menu.js`, `add-product-toast.js`, and the route entry
  loaded from `http://localhost:8000`.

The preview worktree's path-sensitive production output is 31 raw / 212 gzip-9 bytes larger than the
primary build. It passes the hard cap at 997,774 B and is documented in
`specs/005-performance-bundle-ci/preview-environment-offset.md` — a **preview-branch-only note that
exists solely in preview commit `a9e9ab0c11eeafe1bf0024b8aad2342eef4ec3b9`** (branch
`codex/preview-hdl-05-20260810`, worktree `.worktrees/preview-hdl-05-20260810`). **It is not present in
the primary tree** and is not copied back. The authoritative primary production result remains 997,743 B
raw / 196,388 B gzip-9.

## Rendered matrix

| Route | Locale / viewport | Result |
|---|---|---|
| Home | Arabic RTL / 390×844 | PASS — 16 cards, local Hadeel assets, `scrollWidth=390` |
| Product `p1852650594` | Arabic RTL / 390×844 | Commerce PASS — price and add-to-cart visible; inherited overflow `401 > 390` recorded for HDL-18/19 and HDL-29 |
| Collection `c2108520314` | Arabic RTL / 390×844 | PASS — 5 cards, local Hadeel assets, `scrollWidth=390` |
| Cart | Arabic RTL / 390×844 | PASS — 5 populated items, local checkout entry, `scrollWidth=390` |
| Home | English LTR / 1366×768 | PASS — 16 cards, `lang=en`, `dir=ltr`, `scrollWidth=1366` |
| Product `p1852650594` | English LTR / 1366×768 | PASS — add-to-cart and price present, payment icons rendered, `scrollWidth=1366` |
| Collection `c2108520314` | English LTR / 1366×768 | PASS — 5 cards, `scrollWidth=1366` |
| Cart | English LTR / 1366×768 | PASS — 5 populated items, `scrollWidth=1366` |

This corrects the older capability assumption that the demo store was Arabic-only. English was added
before this capture and the live `/en/` storefront now renders the same confirmed draft and local
assets. Product names remain merchant-authored Arabic content inside the English UI; that is store data,
not locale inference by the theme.

Evidence basis for the matrix: every row has a saved screenshot under `live/draft-1233213199/`. The
English product/collection/cart rows additionally have **state-only** JSONs (`product-en-state.json`,
`collection-en-state.json`, `cart-en-state.json`) — DOM state snapshots, not network captures; their
request evidence stays NOT VERIFIED as stated below.

## Post-change request evidence

These are Chrome CDP encoded transfer measurements from the development preview. Development bundle
bytes must not be compared with the production budget; the production gate uses the committed raw-file
measurement above. **Traceability per row is explicit** (see the appendix): rows marked *saved capture*
are backed by a committed JSON artifact under `live/draft-1233213199/`; a row marked *observed-only
session summary* was read in the live session but has no saved capture and must not be cited as saved
evidence.

| Route | All responses / encoded B | Theme-local responses / encoded B | Cards | Capture basis |
|---|---:|---:|---:|---|
| Arabic home | 90 / 1,525,117 | 6 / 1,491,006 | 16 | **Observed-only session summary — no saved network JSON** |
| Arabic product | 138 / 1,601,926 | 9 / 1,562,752 | 1 product | Saved: `product-network.json` |
| Arabic collection | 88 / 1,585,466 | 6 / 1,553,505 | 5 | Saved: `collection-network.json` |
| Arabic cart | 104 / 1,530,863 | 6 / 1,469,316 | 5 items | Saved: `cart-network.json` |
| English home | 94 / 1,548,622 | 6 / 1,491,006 | 16 | Saved: `english-home-network.json` |

The English product, English collection, and English cart **network rows are NOT VERIFIED** — no network
capture was saved for those routes; only state JSONs exist (`product-en-state.json`,
`collection-en-state.json`, `cart-en-state.json`, state-only). No Arabic-home network JSON and no
pre-change request logs exist, and none are invented here.

Home with 16 cards and collection with 5 cards both load six theme-local URLs, so no per-card theme
request pattern was observed. A strict same-collection comparison at two product counts is **NOT
VERIFIED** because the confirmed store exposed only the five-card collection state and this task did
not mutate merchant catalogue data. Before-change CDP request sets are also **NOT VERIFIED** because no
valid pre-C1/C5 network capture exists; historical HDL-04 evidence has screenshots but no request log.

The product route adds its page entry and the three functional payment SVGs. All nine local responses
were 200. The live payment SVGs retained visible dimensions and accessible `alt` text. Upstream Salla
telemetry returned 405 and recommendations returned 403 on some routes; those URLs are not theme-owned
and are not attributed to C1/C5.

## Safelist runtime gate

- Approved source artifact: 1,630 lines, SHA-256
  `833fae3b9bf4d9266d57bb6e21609a3417695b38694b5b2ef5c5c44d075ba5b8`.
- The exact artifact and build output remain pinned by the HDL-05 Node tests (29 at capture time;
  35 after the final-review remediation added the build-sync suite).
- Shadow-root-aware DOM capture found 142 live `s-*` class tokens / 21 `salla-*` tags on English home
  and 171 live `s-*` tokens / 34 tags on Arabic cart.
- Of those, 95 home and 112 cart class tokens are exact rows in the source-owned Safelist; 128 home and
  156 cart tokens have a literal selector in built `app.css`. Remaining tokens include Salla base or
  internal state classes, while the Safelist is Tailwind extractor input rather than a canonical list
  of every runtime `s-*` class.
- Visual inspection of home, product, collection, and populated cart found no missing layout, control,
  card, drawer, price, quantity, or checkout styling attributable to C1.

No Tier A/B regression was observed, so the T010 C1 rollback gate is not triggered. Full authenticated
Loyalty is **NOT VERIFIED**: `cart.twig` renders `<salla-loyalty>` only when both `loyalty` and
`user.loyalty_points` exist, and neither Arabic nor English cart emitted a Loyalty tag in this account.
The accepted full Loyalty families remain in the 1,630-line artifact and must be revalidated in HDL-23
and HDL-29 before release (tracked in `../follow-up-register.md`).

## C5 media gate

- `placeholder.webp` returned from localhost and decoded completely at its exact natural dimensions
  550×550. Store data did not trigger its fallback state, so integrated fallback behavior is **NOT
  VERIFIED**; the direct decode and exact RGBA equality test are recorded instead.
- Tamara, Tabby, and MIS Pay SVGs returned 200 and rendered inside the product payment row.
- `delivery-bro.svg` returned from localhost and rendered as a valid 150×150 SVG document. Integrated
  thank-you state is **NOT VERIFIED** because no completed-order route was available.
- No PNG placeholder request occurred on home/product/collection/cart.

The populated collection emitted one inherited route-relative request to
`<collection-route>/images/s-empty.png`, which returned 404. The repository has no static template or
JS reference; the 119-byte source/public asset is retained and registered. This is a platform-generated
path-resolution release risk tracked in `../follow-up-register.md` (HDL-23 and HDL-29 rows), not a C5
regression and not a reason to remove the asset.

## Performance and unverified rows

Chrome CDP diagnostics and navigation timing were saved in `live/draft-1233213199/`, but they are not
Lighthouse or Core Web Vitals. Lighthouse scores, LCP/CLS/INP, throttled testing, customer/account,
authenticated Loyalty, integrated thank-you media, and the same-collection two-count comparison are
all **NOT VERIFIED** for the reasons above. No dependency was added to manufacture a score; automated
Lighthouse remains routed to HDL-29 as planned (`../follow-up-register.md`, HDL-29 row).

## Gate decision

**T012 PASS for the post-change C1/C5 runtime gate as captured on 2026-08-10 07:39–07:48 +03.** The
rendered Arabic/English core routes, local asset identity, responsive direction, commerce controls,
payment media, and current Salla component styling show no C1/C5 regression in this capture. The
inherited 11px Arabic mobile product overflow, unauthenticated Loyalty gap, platform-generated
`s-empty.png` 404, strict two-count comparison, and Lighthouse/CWV gaps remain explicit owned release
risks and are not represented as verified.

**Remediation status (2026-08-10, later):** the independent GPT-5.6 Sol High final review returned
`STATUS: FAIL` with seven blockers. Blockers 1 and 2 require a **new** Salla preview capture and are
NOT proven by this document; T012 is reopened in `tasks.md` until that capture exists. The four
repository-artifact blockers fixed without a new capture, and the bounded blocker-6 correction, are
recorded in `final-review-remediation.md`. Nothing in this file was upgraded to "verified" during
remediation.

## Appendix — evidence traceability (saved artifacts vs observed-only)

Added during the final-review remediation (blocker 7). Every runtime claim in this file is either
backed by a committed artifact under `live/draft-1233213199/` or labelled observed-only.

## Reopened-review capture attempt — 2026-08-10 12:16–13:12 +03

New owner-confirmed captures added useful evidence, but the T013 independent review found that they
do not close the exact HDL-05 contract:

1. One Home `Latest Products` list increased from 15 to 16 unique products through its real `Load
   more` control and emitted zero new theme-local requests/bytes. This is supplemental evidence, not
   FR-004 closure, because FR-004 requires one actual Collection route at two product counts.
2. Cache-disabled Arabic and English **Home** before/after rows use the same store, route,
   15-product state, local-server build mode, and language-appropriate viewport. The six-request set
   is unchanged and local bytes fall 1,686,422 → 1,491,006 in both languages. Product and Collection
   before/after network rows are still absent.

Salla CLI created the wrong draft during every baseline/after local-server start; each occurrence is
recorded as `SALLA PREVIEW SYNC FAILURE`, and each accepted row instead proves the owner-confirmed
draft body class plus the intended localhost assets. No code failure is attributed to the CLI drift.

**Current T012 result: REOPENED / INCOMPLETE.** The two missing acceptance comparisons must be
captured before T013 can pass. Separately routed Lighthouse/CWV, authenticated Loyalty,
customer/account, integrated fallback, and inherited overflow rows remain `NOT VERIFIED` where
documented and continue to their explicit HDL-23/HDL-29 owners; they are not silently waived.

**Saved JSON artifacts (citable as captured evidence):**

| Artifact | Backs |
|---|---|
| `product-network.json`, `collection-network.json`, `cart-network.json`, `english-home-network.json` | the four *saved capture* rows of the post-change request table |
| `english-home-state.json`, `cart-state.json`, `cart-en-state.json`, `product-en-state.json`, `collection-en-state.json` | rendered-matrix facts: card/item counts, `lang`/`dir`, `scrollWidth`, local asset URLs, Loyalty tag absence, commerce controls. The three English product/collection/cart files are **state-only** — no network data |
| `salla-dom-home-en.json`, `salla-dom-cart-ar.json` | the shadow-root-aware `s-*` token / `salla-*` tag counts for English home and Arabic cart |
| `cdp-performance-metrics.json` | CDP diagnostics/navigation timing only — **not** Lighthouse, not CWV |
| `placeholder-webp-state.json`, `delivery-svg-state.json` | the direct-decode media checks |
| route `*.png` screenshots | the visual rows of the rendered matrix |

**Observed-only session summaries (no saved capture — never cite as saved evidence):**

- The **Arabic home request row** (90 responses / 1,525,117 encoded B; 6 theme-local / 1,491,006 B).
  No Arabic-home network JSON exists and none is fabricated; the numbers stand as a session summary.
- Arabic home/product/collection DOM-state details beyond their screenshots (no Arabic state JSONs
  were saved for home/product/collection).
- Any token counts for routes other than the two saved `salla-dom-*.json` dumps.

**Explicitly absent (NOT VERIFIED, not invented):** pre-change/before request logs, Arabic-home
network JSON, English product/collection/cart network captures, Lighthouse/CWV output, throttled
runs, authenticated Loyalty, integrated thank-you media, and the strict same-collection two-count
comparison.
