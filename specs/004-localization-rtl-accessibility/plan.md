# Implementation Plan: HDL-04 — Localization, RTL/LTR, and Accessibility

**Branch**: `codex/hdl-04-localization-rtl-accessibility` (unrelated inherited work preserved)
**Date**: 2026-08-09
**Spec**: `specs/004-localization-rtl-accessibility/spec.md`
**Design**: Revision 1 approved by Yasser; Figma matrix `398:2`, frames `398:5`–`398:8`, rules `398:9`, coverage `391:96`
**Mode**: HADEEL LEAN MODE

## Summary and decision

Audit and polish the existing shared storefront. Keep Salla's `<html lang/dir>`, `theme.is_rtl`,
`salla.lang`, native components, and DOM source order. Localize remaining theme-owned literals,
remove the custom Quick View direction fallback, align Collection toolbar DOM and visual order,
make the existing dropdown/collapses keyboard-safe, restore link focus, scope typography to LTR,
and add a zero-dependency static contract.
No new component, setting, dependency, bundle entry, network request, or visual system is allowed.

## Approved design gate

- [x] Arabic mobile, Arabic desktop, critical English/LTR, focus order, mixed content, overlays, and states are covered by the reused HDL-02 matrix.
- [x] Yasser wrote `APPROVE HDL-04 REV 1`.
- [x] Figma is treated as visual intent; DOM, contrast, reflow, ARIA, Lighthouse, and Salla runtime behavior require post-change evidence.

## Current evidence and classification

- `src/locales/ar.json` and `en.json`: 86/86 leaves, identical keys, no empty values — **Existing / preserve**.
- `master.twig`: Salla owns `user.language.code`, `user.language.dir`, and merchant font token — **Existing / preserve**.
- Theme-owned English literals remain in Blog, Customer, Cart, Landing, Thank-you, banners, and menu fallbacks — **Audit & Polish**.
- `product-card.js` reads `document.documentElement.dir || 'rtl'`; replace with inherited/Salla runtime direction — **Audit & Polish**.
- `main-menu.js` infers scroll sign from computed CSS direction; use `salla.config.get('theme.is_rtl')` — **Audit & Polish**.
- Global `:focus-visible` exists, but `a:focus { outline:none }` suppresses link fallback focus; remove that reset while preserving deliberate visible component focus treatments — **Audit & Polish**.
- Six non-zero `letter-spacing` declarations apply without language scoping; keep the English treatment but scope it in each owning rule to LTR — **Audit & Polish**.
- Collection toolbar reverses CSS direction independently of DOM, so visual and Tab order can diverge — **Audit & Polish**.
- Full runtime RTL/LTR matrix and accessibility score do not exist at the baseline — **Build evidence**, not a UI rebuild.
- Existing product-route 320px overflow is inherited and remains routed to its owning product/gallery Specs and HDL-29; HDL-04 must not worsen or conceal it.

## File-level scope

| Requirement | Files | Change |
|---|---|---|
| FR-001 | `src/locales/{ar,en}.json`; affected Twig; `main-menu.js` | Add paired a11y strings and replace theme-owned visible/accessible literals. Do not duplicate Salla platform translations. |
| FR-002/003 | `master.twig` (verify only), `product-card.js`, `main-menu.js`, directional Twig/SCSS found by the audit | Preserve Salla runtime direction; remove custom/default-RTL detection; keep only directional icon mirroring and logical start/end behavior. |
| FR-004/005 | `app.js`, Blog/Product templates, `product/index.twig`, `reset.scss`, `collection.scss` | Put toolbar DOM in logical start→end order; add expanded/controls/Escape/focus-return behavior to the existing dropdown/collapses; remove only the global link focus suppression; ensure names and button types. |
| FR-006/007 | `cart.scss`, `storefront-system.scss`, `product.scss`, affected text selectors | Scope each non-zero letter-spacing declaration inside its owning rule to LTR; add targeted wrapping/min-width rules only where live evidence shows harmful clipping. |
| FR-001…008 | `scripts/check-localization-a11y.mjs`, `scripts/check-theme.mjs`, `tests/localization-rtl-accessibility.test.mjs` | Enforce locale parity/non-empty values, no known forbidden literals/custom lang-dir detection/positive tabindex/global link focus suppression, LTR-scoped letter spacing, directional exceptions, toolbar order, and dropdown/collapse ARIA. |

`public/` is never edited. Any source asset change is followed by a production rebuild.

## Architecture and compatibility

- The contract is source-only and deterministic; Node 20 built-ins only.
- Dynamic merchant content stays untranslated and is escaped/used as its own accessible name where meaningful.
- Existing Salla catalogue keys remain valid; Hadeel-owned keys are paired in both theme locale files.
- `use_theme_font=false` remains the safe default, so Salla's selected font remains primary. HDL-04 does not alter settings.
- No CSS `order`/direction reversal is used to fake toolbar RTL. Source order is filter → density → sort and focus follows DOM order.
- No broad physical-to-logical rewrite: each changed directional rule must correspond to an approved frame and pass both directions.

## Verification and budgets

Automated gates:

1. `node --test tests/localization-rtl-accessibility.test.mjs`
2. `node scripts/check-theme.mjs --json`
3. CSS snapshot before/after, then `npx webpack --mode production`
4. `node scripts/check-theme.mjs --build`
5. `git diff --check`

Bundle baseline: 13 CSS/JS files, `1,133,082` raw / `203,771` gzip-9;
`app.css` `802,732` raw / `103,977` gzip-9; `app.js` `128,388` raw / `36,869` gzip-9.
Expected delta is non-positive or negligible. Hard gates: zero dependencies, entries, chunks, and runtime requests;
total CSS+JS may not grow by more than 2,048 raw / 512 gzip bytes without architecture review.
The pre-existing public-size release risk remains owned by HDL-05/HDL-29.

Rendered Salla QA uses a temporary `preview/hdl-04-<short-sha>` worktree/branch only. Before browser QA,
prove the selected branch and SHA; if Salla serves stale server templates, record `SALLA PREVIEW SYNC ISSUE`
instead of failing the code. Codex performs this QA without a separate owner review stop; the next scheduled
manual storefront checkpoint remains after HDL-07.

| Flow | Arabic mobile RTL | English mobile LTR | Arabic desktop RTL | English desktop LTR |
|---|---:|---:|---:|---:|
| Home/header/menu/footer | 390×844 | 390×844 | 1366×768 | 1366×768 |
| Collection controls/drawer | 390×844 | 390×844 | 1366×768 | 1366×768 |
| Product/Quick View/mixed price | 390×844 | 390×844 | 1366×768 | 1366×768 |
| Cart quantity/long title | 390×844 | 390×844 | 1366×768 | 1366×768 |

Affected Blog/Customer/Landing/Thank-you routes receive targeted keyboard/name checks when reachable.
Capture actual `html lang/dir`, branch/SHA marker, focus sequence, accessible names, 320/390px overflow,
computed letter spacing for Arabic, contrast/reflow, and Lighthouse accessibility/performance. Targets:
accessibility ≥95 and performance ≥75 where Salla platform behavior permits; platform exceptions need evidence.

## Rollback gates

Revert the HDL-04 feature commit if a locale key is missing/empty, a customer string remains hardcoded,
Salla language/direction is overridden, visual/focus order diverges, a non-directional icon mirrors, focus becomes
invisible, Arabic receives non-zero letter spacing, long content loses meaning, a new request/dependency/chunk
appears, bundle budget is exceeded, or build/guard/tests fail. Source rollback plus production rebuild restores
the prior behavior; no settings or merchant data migration is involved.

## Constitution / quick consistency check

- [x] Covers FR-001…FR-008 and the approved Figma nodes.
- [x] Preserves one Salla-native shared core and existing working behavior.
- [x] Mobile Arabic first with complete English/LTR verification.
- [x] No unresolved Salla capability blocks implementation.
- [x] No dependency, network, settings, data migration, Kalles/Raed copying, or Constitution exception.
- [x] HDL-01/02/03 dependencies are owner-approved; HDL-04 is ready for Kimi implementation.
