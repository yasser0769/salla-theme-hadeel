# T030 — Performance deltas (pre-HDL-06 vs final production build)

**Finalized**: 2026-08-10 21:57 +03. **Before** is the committed HDL-05
production state at `e5f99aed110422ad557d4eee0953c8cfb5b6fd7c`, recorded by
the then-current `src/config/bundle-budget.json`. **After** is the final
HDL-06 production output served by preview commit
`3194eda5fadf8f42b312b1fe484082d8ebbcc13a` and byte-matched against Salla
draft `722988000`.

## CSS rule snapshot

- Before: `/tmp/hdl06-before-css.txt` — 6,838 normalized rules.
- Final: `/tmp/hdl06-final-css.txt` — 6,772 normalized rules (−66 net).
- Set comparison: 228 baseline lines removed and 162 final lines added.
- The final delta is attributable to the semantic motion-token migration,
  narrowed transition properties, reduced-motion/mobile-cap rules, removal of
  obsolete timing declarations, the approved one-shot reveal rules, and the
  focused `form.scss` selector correction found during live QA. No parallel
  override layer was added.

## Bundle bytes (raw / manifest gzip-9)

| File | Before raw | Final raw | Δ raw | Before gzip-9 | Final gzip-9 | Δ gzip-9 |
|---|---:|---:|---:|---:|---:|---:|
| `public/app.css` | 802,202 | 799,430 | **−2,772** | 103,802 | 104,336 | +534 |
| `public/app.js` | 129,221 | 116,474 | **−12,747** | 37,056 | 31,508 | **−5,548** |
| `public/home.js` | 36,947 | 36,787 | −160 | 11,814 | 11,794 | −20 |
| `public/product.js` | 56,127 | 55,540 | −587 | 17,242 | 17,124 | −118 |
| `public/checkout.js` | 11,727 | 11,730 | +3 | 3,785 | 3,785 | 0 |
| `public/pages.js` | 5,284 | 4,806 | −478 | 1,862 | 1,704 | −158 |
| **App CSS + JS** | **931,423** | **915,904** | **−15,519** | **140,858** | **135,844** | **−5,014** |

The final app entry is below both the pre-HDL-06 baseline (931,423 B) and the
plan ceiling. The JS decrease is mainly removal of the runtime Anime import
and wrapper. The intermediate 836,385-byte CSS build was not final: Kimi's
focused semantic-composite and selector correction removed 36,955 raw bytes
from that candidate while preserving the three motion profiles.

## Publishing package and build telemetry

- Salla package model: 157 allowlisted files, 2,078,795 B raw,
  **478,773 / 1,000,000 B compressed — PASS** (47.88%).
- Remaining to the 950,000 B internal target: 471,227 B.
- `public/`: 1,134,522 B raw / 209,186 B gzip-9 / 212,266 B deterministic
  ZIP. These are telemetry, not the Salla publishing gate.
- One inherited telemetry-only warning remains: `public/checkout.js` exceeds
  its raw per-file ratchet by 3 B. It does not fail compressed publishing
  compliance and is unrelated to a new request or dependency.

## Entries, chunks, dependencies, fonts, and media

- Webpack entrypoints remain `app`, `checkout`, `home`, `pages`, `product`.
- No new entry, chunk, request pattern, dependency, font, image, or video.
- Dependency names remain 32; `package.json` and `pnpm-lock.yaml` are
  untouched.
- Local fonts and local `@font-face`: zero. Merchant-selected Salla font with
  system fallback remains the runtime architecture.
- Registered functional media remain 5 rows.

## Live Salla asset and request evidence

The final owner-confirmed draft loaded the same route-specific theme asset
basename set as the pre-fix evidence: `app.css`, `app.js`, `product-card.js`,
`main-menu.js`, `add-product-toast.js`, plus the existing route bundle where
applicable. There is no HDL-06 entry/chunk or theme-request addition.

Direct draft download and local production artifacts matched byte-for-byte:

- `app.css`: 799,430 B, SHA-256
  `2434873818d7ce2230292a35e52ab25e10cb1d747a0e6d16a96c37aec5e97722`.
- `app.js`: 116,474 B, SHA-256
  `fb71e33f6f0ad3b3683a0da3fb8773214f9397de401b388347a35101618caacd`.

The 16 live matrix files record the actual draft URLs in DOM provenance.
Their isolated-world Performance API returned an empty resource list, so no
invented byte-waterfall claim is made; DOM asset provenance plus direct
download hashes are the authoritative sync evidence.

## Runtime interpretation

- The final profile probe proves the compiled CSS caps on the real draft:
  Calm 140/100/0 ms, Balanced 200/120/240 ms, Rich 320/160/400 ms; mobile
  Rich is capped to Balanced when `hadeel-motion-reduce-mobile` is present.
- Total page CLS remains high on several Home/Product/Cart fixtures because
  of Salla component hydration and existing page reflow. HDL-06 introduces no
  layout-property animation (contract gate PASS), but the live observer does
  not isolate causal attribution well enough to claim total CLS PASS.
- Lighthouse/Core Web Vitals and authenticated pages remain release-level
  work for their owning Specs/HDL-29; they are not silently inferred here.
