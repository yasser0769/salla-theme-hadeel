# T030 — Performance deltas (pre-HDL-06 vs post-HDL-06 production build)

**Recorded**: 2026-08-10 19:51 +03. **Before** = pre-HDL-06 production state,
exactly as recorded in the committed `src/config/bundle-budget.json` at HEAD
(`e5f99aed`) and the HDL-06 baseline evidence (2026-08-10 16:00). **After** =
fresh `npx webpack --mode production` of the HDL-06 tree (completed
2026-08-10 19:50 +03, 13.5 s),
manifest ratcheted via `node scripts/check-bundle-budget.mjs --update` (never
hand-edited).

## CSS rule snapshot (`scripts/css-snapshot.mjs`)

- Before: `/tmp/hdl06-before-css.txt` (Aug 10 16:00, pre-change baseline) —
  6,838 rules.
- After: `/tmp/hdl06-after-css.txt` (Aug 10 19:51) — 6,882 rules (+44).
- Diff: 227 lines removed / 271 lines added. The removed side is raw timing
  and easing literals (`152 × .3s`, `40 × cubic-bezier(.4,0,.2,1)`,
  `30 × ease`, `17 × .15s`, `14 × .5s`, plus `.16s/.18s/.2s/.4s/225ms/.6s/.9s`
  and one-off `cubic-bezier(...)` values); the added side is the semantic
  token consumption (`387 × var(--motion-duration-ui)`,
  `364 × var(--motion-easing-standard)`, plus `emphasized/exit` easings,
  `duration-feedback`, `duration-reveal`, `stagger`, `reveal-distance`) and
  the new keyframes/reduced-motion/mobile-cap rules. Every delta is the
  T021/T022 token migration and T023–T027 declarative motion system — no
  unrelated visual change was introduced.

## Bundle bytes (raw / gzip-9)

| File | Before raw | After raw | Δ raw | Before gzip-9 | After gzip-9 | Δ gzip-9 |
|---|---|---|---|---|---|---|
| `public/app.css` | 802,202 | 836,385 | +34,183 | 103,802 | 105,788 | +1,986 |
| `public/app.js` | 129,221 | 116,474 | −12,747 | 37,056 | 31,508 | −5,548 |
| `public/home.js` | 36,947 | 36,787 | −160 | 11,814 | 11,794 | −20 |
| `public/product.js` | 56,127 | 55,540 | −587 | 17,242 | 17,124 | −118 |
| `public/checkout.js` | 11,727 | 11,730 | +3 | 3,785 | 3,785 | 0 |
| `public/pages.js` | 5,284 | 4,806 | −478 | 1,862 | 1,704 | −158 |
| **`public/` total (28 files)** | **1,151,263** | **1,171,477** | **+20,214** | **214,496** | **210,638** | **−3,858** |

Attribution: app.css growth is the semantic token layer, migrated transition
declarations, reduced-motion/mobile-cap blocks, and keyframes (T021–T027).
app.js shrinks because the animejs runtime import/wrapper was removed
(T018–T020, `motion-no-anime`) and modal/toast logic slimmed (T022);
home/product/pages shrink from the removed timer/layout-animation code.
Raw `public/` totals are telemetry only (HDL-05 policy), never the publishing
gate.

## Salla compressed package estimate (deterministic HDL-05 model)

- Files: 156 → 157 (`+ src/assets/js/partials/motion.js`,
  `+ src/assets/styles/01-settings/motion.scss`,
  `− src/assets/js/partials/anime.js`).
- Raw package: 2,071,195 → 2,118,671 B (+47,476).
- Compressed package: **475,903 → 479,890 B (+3,987)** — PASS at 47.99% of
  the 1,000,000 B Salla hard cap (internal 950,000 B target untouched).
- Deterministic ZIP of `public/`: 217,576 → 213,718 B (telemetry).

## Entries, chunks, dependencies, fonts, media

- Webpack entrypoints unchanged: `app` (app.js + app.css), `checkout`,
  `home`, `pages`, `product` — no new entry, no new chunk, no changed chunk
  mapping (build log compared against the pre-HDL-06 baseline evidence).
- Dependencies: 32 recorded names before and after; `package.json` /
  `pnpm-lock.yaml` untouched (`animejs` stays declared per the HDL-06 baseline
  decision — only the runtime import was removed).
- Fonts: zero local font files, zero `@font-face` (HDL-05 font gates pass).
- Media: 5 registered rows before and after; no new image/video added.

## Network URL delta

**NOT VERIFIED** — live-verifiable only through preview (T031–T033). Static
proof: entry/request set is unchanged (same 5 entrypoints, same 28 public
files, no new chunk or asset URL pattern), so no new runtime request is
expected; the actual waterfall remains a preview gate.

## Not verified here (explicit)

- Runtime rendering performance, CLS, INP, and real-device behavior:
  **NOT VERIFIED** — preview gates T031–T033.
