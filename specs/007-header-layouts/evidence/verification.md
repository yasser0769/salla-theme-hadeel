# HDL-07 Verification Evidence (Lean T021–T022)

**Date**: 2026-08-11 · **Owner**: Kimi K3 High · **Mode**: Lean Execution
**Scope**: T021 focused suites, T022 production build + gates. Live storefront
behavior remains **NOT VERIFIED** — the exact-SHA Salla Preview is T024–T028.

## T021 — Focused suites

Command (repo filename is `tests/performance-bundle-ci.test.mjs`; no
`performance-budget.test.mjs` exists):

```bash
node --test tests/header-layouts.test.mjs tests/settings-preset-engine.test.mjs \
  tests/localization-rtl-accessibility.test.mjs tests/performance-bundle-ci.test.mjs \
  tests/motion-system.test.mjs
```

Final result: **284 tests / 74 suites / 284 pass / 0 fail.**

Also: `node scripts/check-header-layouts.mjs --strict` → **0 errors**, invalid
fixture witness rejected as required.

### Gate-exposed defect found and fixed during T021/T022

The first production build measured `public/app.css` at 825,737 B — **+26,307 B**
over the T007 baseline of 799,430 B, breaching the approved plan cap of
+12,288 B. Root cause: the transparent `:has()` gate repeated its full
three-selector chain across every nested color override (≈33 KB of added
normalized CSS). Fix (architecture, not gate-weakening):

- Each ink gate now compiles to ONE `:is()` selector of identical specificity.
- Ink consumption moved into the base control rules as
  `color: var(--hadeel-header-ink-current, var(--hadeel-ink))`; the gate only
  SETS the variable (Top = transparent ink, scrolled = normal ink). Undefined
  outside the gate, so legacy `centered|start` rendering is unchanged.
- Redundant `.inner`/box-shadow declarations dropped (inner inherits).

Rebuilt result is within caps (below). The CSS-snapshot delta
(`/tmp/hdl07-before.css.txt` 6772 rules → after 6906 rules) is entirely
HDL-07 selectors; no unrelated rule changed.

## T022 — Build and gates

```bash
npx webpack --mode production
# compiled with 3 warnings in ~27s — the 3 warnings are the pre-existing
# webpack asset/entrypoint size recommendations for app.css/app entry, not errors.
```

### Size deltas vs T007 baseline (`evidence/bundle-before.md`)

| File | Baseline | After HDL-07 | Delta | Plan cap | Verdict |
|---|---:|---:|---:|---:|---|
| `public/app.css` raw | 799,430 | 809,864 | **+10,434** | ≤ 811,718 (+12,288) | PASS |
| `public/app.js` raw | 116,474 | 116,599 | **+125** | ≤ 120,570 (+4,096) | PASS |
| Compressed package | 478,773 | 484,516 | **+5,743** | < 950,000 internal target | PASS (48.45% of 1,000,000) |

No other bundle changed for HDL-07. Dependency/entry/chunk/media/font/request
delta from this batch: **zero** (no `package.json`/lockfile touch, no new
webpack entry, no `fetch(`/XHR added, no new asset emitted — build emitted only
`app.css`, `app.js`, `main-menu.js` diffs from edited sources).

### Gate results (exact)

```bash
node scripts/check-theme.mjs --build --json
# errors: 0, warnings: 0
# "public/ matches a fresh production build (28 files compared recursively by path and sha256)"
```

```bash
node scripts/check-bundle-budget.mjs --budget   # PRE-UPDATE, recorded before ratchet
# 12 error(s) — all manifest drift on exactly the files this batch changed:
# public/app.css, public/app.js, public/main-menu.js, src/assets/js/app.js,
# src/assets/js/partials/main-menu.js, storefront-system.scss, header.twig,
# enhanced-slider.twig, master.twig. Publishing: 484,516 / 1,000,000 B — PASS.
# WARN pre-existing: public/checkout.js +3 B over its 11,727 B ceiling (telemetry).
```

The drift was the sanctioned case (verified HDL-07 change within approved plan
caps), so the official ratchet was run:

```bash
node scripts/check-bundle-budget.mjs --update
# bundle-budget.json updated: compressed theme package 484516 / 1000000 B — PASS
node scripts/check-bundle-budget.mjs --budget   # POST-UPDATE
# 0 error(s); publishing 484,516 / 1,000,000 B (48.45%, under 950,000 target);
# the pre-existing checkout.js +3 B telemetry WARN remains visible, not expanded.
```

Changed generated/config files: `src/config/bundle-budget.json` (official
`--update` ratchet, 34 measurement rows) and `public/` (production build
output, never hand-edited).

```bash
git diff --check   # clean, exit 0
```

## NOT VERIFIED (owned by T024–T028)

- All rendered storefront behavior: transparent Top/Scrolled/Fallback and
  `:has()` support in the preview browser, commerce two-row rendering and
  crowded navigation, four-layout RTL/LTR + 320/390 mobile behavior, sticky
  no-jump, real-Boolean sticky gating, legacy `centered|start` parity.
- Lighthouse/performance measurements on a live store.

## T023 blocker fix — menu/cart visibility verification (2026-08-11)

Scope: `header_show_menu` + `header_show_cart` settings, registry records,
header.twig guards, app.js null-safety, checker/test coverage. All edits via
apply_patch; T001–T015 historical evidence untouched; the frozen HDL-03 suite
received only the forced count/list updates (63→65 records, two added ids).

### Focused suites

```bash
node --test tests/header-layouts.test.mjs tests/settings-preset-engine.test.mjs \
  tests/localization-rtl-accessibility.test.mjs tests/performance-bundle-ci.test.mjs \
  tests/motion-system.test.mjs
# 284 tests / 74 suites / 284 pass / 0 fail
node scripts/check-header-layouts.mjs --strict    # 0 errors
node scripts/check-settings-registry.mjs --strict # 65 global + 62 component records, 0 errors
```

### Build and gates

```bash
npx webpack --mode production   # compiled, 3 pre-existing size warnings only
node scripts/check-theme.mjs --build --json   # errors: 0, warnings: 0
git diff --check                # clean, exit 0
```

### Size deltas vs T007 baseline (existing caps, no change)

| File | Baseline | After fix | Delta | Plan cap | Verdict |
|---|---:|---:|---:|---:|---|
| `public/app.css` raw | 799,430 | 809,864 | **+10,434** | ≤ 811,718 (+12,288) | PASS |
| `public/app.js` raw | 116,474 | 116,671 | **+197** | ≤ 120,570 (+4,096) | PASS |
| Compressed package | 478,773 | 484,887 | **+6,114** | < 950,000 internal | PASS (48.49%) |

Budget gate: pre-update `--budget` → 5 errors (drift on exactly the files this
fix changed: `public/app.js`, `src/assets/js/app.js`, `header.twig`,
`twilight.json`); publishing PASS. Official `--update` ratchet applied;
post-update `--budget` → **0 errors**, 484,887 / 1,000,000 B. WARNs unchanged,
including the pre-existing `checkout.js` +3 B telemetry note. Zero new
dependency/entry/chunk/media/font/request.

Menu-hidden and cart-hidden rendering, the mobile shell without a menu cell,
and add-to-cart without the summary remain **NOT VERIFIED** until the T024–T028
preview.
