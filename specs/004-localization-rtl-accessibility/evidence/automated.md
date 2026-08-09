# HDL-04 automated evidence

Captured: 2026-08-09 (Asia/Riyadh), after the last HDL-04 source change.
Branch: `codex/hdl-04-localization-rtl-accessibility`
Base HEAD: `207a4d1e184b87c7913df1829dc8ca34444e0e5d`

## Results

- `node --test tests/localization-rtl-accessibility.test.mjs`: 24 passed, 0 failed, including the real-helper collapse class-order regression.
- `node --test tests/settings-preset-engine.test.mjs`: 73 passed, 0 failed.
- `node scripts/check-theme.mjs --json`: 0 errors, 0 warnings; all seven static checks passed.
- `npx webpack --mode production`: completed with the three inherited webpack size recommendations; no build error.
- `node scripts/check-theme.mjs --build`: 0 errors, 0 warnings; `public/` matches a fresh production build.
- `git diff --check`: passed.
- Final normalized CSS snapshot: `output/css-snapshot-after-hdl04-final.txt`, 6,844 rules. The output directory is local evidence and remains ignored.

## Bundle budget

| Scope | Baseline raw | Current raw | Delta raw | Baseline gzip-9 | Current gzip-9 | Delta gzip-9 |
|---|---:|---:|---:|---:|---:|---:|
| All 13 production CSS/JS files | 1,133,082 B | 1,134,340 B | +1,258 B | 203,771 B | 204,012 B | +241 B |
| `app.css` | 802,732 B | 803,110 B | +378 B | 103,977 B | 104,019 B | +42 B |
| `app.js` | 128,388 B | 129,221 B | +833 B | 36,869 B | 37,056 B | +187 B |

Result: PASS against the approved `+2,048 B raw / +512 B gzip` aggregate limit. No dependency, webpack entry, chunk, font/media asset, or intended runtime request was added.

## Still pending

Arabic Salla evidence from the proven temporary preview branch is recorded in `live-preview.md`. The complete four-way runtime matrix, final post-fix collapse interaction, contrast, and Lighthouse remain **not verified**, so T008 stays open. This file does not claim complete storefront acceptance.
