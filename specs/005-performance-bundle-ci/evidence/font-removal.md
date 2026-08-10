# T005F — Font Removal Evidence

> **HISTORICAL SIZE VERDICT:** raw/gzip measurements remain valid telemetry, but all
> raw-1MB/85% compliance gaps below are `SUPERSEDED`. The no-local-font decision remains active.

- **Recorded (UTC):** 2026-08-09T14:04:11Z
- **Current HEAD:** `eb40134dcda5c147ff03a048ad05b3e11ba8a15b`
- **Decision:** Owner-approved permanent font architecture decision dated 2026-08-09.

## Verification commands

Post-change independent verification used the following command set:

```bash
npx webpack --mode production
node --test tests/localization-rtl-accessibility.test.mjs
node --test tests/settings-preset-engine.test.mjs
node scripts/check-theme.mjs --build --json
git diff --check
find src public -type f \( -iname '*.woff' -o -iname '*.woff2' \) -print
rg -n '@font-face|Thmanyah Sans|thmanyahsans' src public
find public -type f | wc -l
find public -type f -print0 | xargs -0 stat -f %z | awk '{raw += $1} END {print raw}'
find public -type f -print0 | while IFS= read -r -d '' file; do gzip -9 -n -c "$file" | wc -c; done | awk '{gzip += $1} END {print gzip}'
```

## Measured bundle result

| Measure | Baseline | After T005F | Delta |
|---|---:|---:|---:|
| `public/` file count | 33 | 28 | -5 |
| Raw bytes | 1,559,227 | 1,172,827 | -386,400 |
| Deterministic gzip-9 bytes | 609,438 | 227,413 | -382,025 |

The five removed font files themselves accounted for **385,492 raw bytes**. `app.css` fell from **803,110** to **802,202 raw bytes**, an additional **908 raw bytes**.

## Remaining budget gaps

- **Official hard-cap gap:** 172,827 raw bytes above the 1,000,000-byte cap.
- **Internal target gap:** 322,827 raw bytes above the 850,000-byte internal target.

## Gate results

- HDL-04 localization/RTL/accessibility tests: **24/24 passed**.
- HDL-03 settings/preset tests: **73/73 passed**.
- Production webpack build: **succeeded** with the inherited **3 warnings**.
- `node scripts/check-theme.mjs --build --json`: **0 errors / 0 warnings**, with build-sync **ok**.
- `git diff --check`: **clean**.
- `find`/`rg`: **zero** `woff`/`woff2`, `@font-face`, `Thmanyah Sans`, or `thmanyahsans` matches in `src` or `public`.

## Font and compatibility contract

Hadeel now renders with Salla `theme.font` exposed through `--font-main` plus a safe system fallback only. No bundled local font remains.

`use_theme_font` remains in `twilight.json` and `src/config/settings-registry.json` with its existing ID/type/default/storage contract:

- `id`: `use_theme_font`
- `type`: `boolean`
- `format`: `switch`
- `default` / `value`: `false`
- `selected`: `false`
- Registry key: `global::use_theme_font`
- Merchant setting storage: preserved

The only remaining runtime compatibility behavior is the existing `use-theme-font` body class emitted by `master.twig` from the preserved merchant setting. That class is a deprecated no-op for font selection: it preserves merchant storage and markup compatibility but selects no bundled font.

## Independent re-verification (2026-08-09T14:07Z, HEAD `eb40134d`)

Re-ran the full gate set on the working tree; every number above reproduced exactly:

- CSS snapshot before/after (`evidence/t005f/css-snapshot-before.txt`, `evidence/t005f/css-snapshot-after.txt`): 6,844 → 6,838 rules. The normalized diff is font-only: the 5 Thmanyah `@font-face` rules and `body.use-theme-font` rule are removed; the old `DINNextLTArabic` default is replaced by the generic `sans-serif` fallback wherever the compiled Salla/Tailwind CSS resolves `--font-main`; and the body keeps the explicit OS fallback chain after the merchant variable. No layout, spacing, direction, color, or component rule changed.
- Baseline reconstructed from `git archive HEAD public` plus the 5 gitignored `public/*.LICENSE.txt` build artifacts: exactly **33 files / 1,559,227 raw / 609,438 gzip-9** (zlib `gzipSync` level 9) — matches the spec baseline.
- After a fresh `npx webpack --mode production` (`output.clean` removed the generated fonts; `public/` never hand-edited): **28 files / 1,172,827 raw / 227,413 gzip-9**. Saving: **386,400 raw / 382,025 gzip-9** (fonts 385,492 raw / 381,808 gz + `app.css` 908 raw / 217 gz).
- `node --test tests/localization-rtl-accessibility.test.mjs`: 24/24 pass. `node --test tests/settings-preset-engine.test.mjs`: 73/73 pass. `node scripts/check-theme.mjs --build --json`: 0 errors / 0 warnings, build-sync ok. `git diff --check`: clean.
- `find src public -iname '*.woff*'` → 0 files; `grep -ri thmanyah src public` → 0; `grep -rn '@font-face' src public` → 0. (The only `woff` substring hits are `newOffers…` identifiers in `src/assets/js/cart.js` — unrelated false positives.)
- `twilight.json` unchanged; `master.twig` unchanged; settings-registry record `global::use_theme_font` preserved with ID/type/default/storage intact (description only re-labelled as deprecated no-op).

## Runtime preview status

Runtime-rendered Salla preview is **NOT VERIFIED** until the required owner-confirmed preview branch is available and checked. This document records source/build/test evidence only and makes no rendered-storefront visual or behavioral claim.
