# Implementation Plan: Four Header Layouts

**Branch**: `codex/hdl-07-header-layouts` | **Date**: 2026-08-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/007-header-layouts/spec.md`
**Roadmap ID**: `HDL-07`
**Design handoff**: [design.md](design.md), Figma Rev 1 (`460:2`)
**Plan model**: GPT-5.6 Sol High via Codex after a bounded Claude Opus 5 High retry returned no output and ended `Execution error`

**Execution mode**: Lean from T016 onward. T001–T015 and their existing artifacts are
frozen; they are not regenerated or re-litigated. Remaining evidence is consolidated
into implementation, verification, final review, and the minimum exact-SHA live assets.

## Summary

Extend the existing single `header.twig` core from two Desktop arrangements to four
allowlisted variants: `centered`, `start`, `transparent`, and `commerce`. Preserve the
existing mobile shell, Salla menu/cart/account/search contracts, legacy setting values,
and the HDL-03 preset resolver. Layout differences are CSS Grid variants over one DOM;
only one small shared runtime controller owns sticky/scrolled state.

Transparent mode is progressive and fail-safe. It activates only on the home page when
the first rendered main-content element is an explicitly marked eligible Hero. CSS
`:has()` can establish the no-flash first-paint relationship; unsupported browsers,
missing or non-first Hero content, and uncertain automatic contrast all render the
normal surface. No client image analysis, duplicated header tree, external request, or
new dependency is allowed.

## Design Gate Check *(blocking)*

- [x] `design.md` records the approved page `456:2`, review board `460:2`, and direct variant/state Node IDs.
- [x] Owner wrote `APPROVE HDL-07 REV 1`; Figma acceptance gate `460:411` and local artifacts record 2026-08-11.
- [x] Arabic mobile/desktop, critical English/LTR, four Desktop layouts, shared Mobile states, no-Hero/light-Hero, and long-content cases are covered.
- [x] Hero eligibility, logo contrast, and editor behavior were researched; unsupported behavior has a safe fallback rather than an assumed API.

## Technical Context

**Platform**: Salla Twilight theme; server-rendered Twig plus Salla-injected web components
**Source of truth**: `src/`, `twilight.json`, `src/config/settings-registry.json`, repository docs; `public/` is generated output
**Build**: `npx webpack --mode production`
**Guard**: `node scripts/check-theme.mjs --build`
**Target pages**: all storefront pages for the shared header; home for transparent eligibility; collection for crowded navigation; product/cart for commerce no-regression
**Existing implementation**: one `src/views/components/header/header.twig`; body-class resolution in `src/views/layouts/master.twig`; header ownership split between `header.scss` (pinning) and `storefront-system.scss` (skin/layout); sticky controller in `src/assets/js/app.js`; menu behavior in `src/assets/js/partials/main-menu.js`
**Classification**: `centered`, `start`, Sticky, wishlist, More menu, shared mobile, cart/account/search actions = Existing — Audit & Polish; `transparent`, `commerce`, visibility/logo-size/ink controls, eligible-Hero marker and deterministic header contract test = Build; image-luminance detection and independent light/dark Salla logo = unsupported Spike with safe fallback
**Salla APIs/components**: `theme.settings.get`, `is_page`, `{% component home %}`, `salla.event.dispatch('search::open'|'login::open')`, `salla-cart-summary` `icon` slot, `salla-user-menu`, and `salla.config.get('theme.is_rtl')`; no invented setting-write or image-analysis API
**Testing**: Node built-ins, focused HDL-07 contracts, only relevant HDL-03/04/05/06 regressions, production build/build-sync, bundle/package gates, and one rendered owner-confirmed Salla pass
**Performance goals**: zero dependency/entry/chunk/request/media/font delta; `app.css` increase ≤12,288 raw bytes and `app.js` increase ≤4,096 raw bytes; compressed package remains below the 950,000-byte internal target; passive/rAF-bounded scroll work and no layout shift attributable to Sticky
**Accessibility goals**: 44px mobile targets, semantic buttons/links, preserved native Salla accessible names, visible focus, logical focus/DOM order in RTL/LTR, no color-only state, contrast ≥4.5:1 for text/icons, Lighthouse accessibility target ≥95 when platform-owned behavior permits
**Localization**: Arabic/RTL first with English/LTR parity; reuse `blocks.header.*`; add paired locale keys only if visible copy is genuinely new; never infer language/direction
**Scale/scope**: four Desktop variants × RTL/LTR × top/scrolled; one Mobile core × RTL/LTR × top/scrolled/menu-open/search-open; eleven global header controls total (four existing, seven new — menu/cart visibility added by the T023 blocker fix)

## Constitution Check *(GATE)*

- [x] Conversion > customization > polish: search/cart/navigation stay discoverable; unsafe contrast falls back.
- [x] One Salla theme and one shared core: one Twig header, one menu data source, one controller.
- [x] Components by responsibility: visual layouts are body-class variants, not copied components.
- [x] Mobile/Arabic first with RTL/LTR parity: shared mobile DOM and logical CSS; Figma parity matrix is approved.
- [x] Bundle/performance/accessibility budgets are explicit and blocking.
- [x] Figma/GitHub/Salla preview evidence chain is preserved; local mockups are not acceptance evidence.
- [x] Existing code and installed component contracts were audited before build work.
- [x] Independent identity, truthful commerce, localization, and secure defaults are preserved.
- [x] Constitution exceptions: none.

**Post-design re-check**: PASS. `research.md`, `data-model.md`, contracts, and
`quickstart.md` introduce no exception and resolve every planning unknown.

## Existing-Code Reuse Map

| Requirement | Existing files/components | Classification | Reuse/change |
|---|---|---|---|
| FR-001 shared logo/search/account/cart | `header.twig`, `salla-cart-summary`, `salla-user-menu` | Existing + Build | Keep one DOM and native actions; add conditional visibility and one wide search trigger without duplicating behavior. |
| FR-002 transparent home + scrolled surface | `header.scss`, `storefront-system.scss`, `app.js` | Build | Eligible-Hero marker + fail-safe relational CSS; shared scrolled state returns to normal surface. |
| FR-003 no eligible first Hero | `pages/index.twig`, `components/home/enhanced-slider.twig` | Spike resolved to Build/fallback | Mark only the eligible full-width Hero; any uncertain DOM/contrast state remains normal. |
| FR-004 Sticky without jump | `App.initiateStickyMenu`, `setHeaderHeight` | Existing — Audit & Polish | Preserve one controller; measure synchronously/ResizeObserver-safe and batch scroll state with `requestAnimationFrame`. |
| FR-005 accessible actions | `header.twig`, global focus-visible contract | Existing — Audit & Polish | Keep semantic controls and names; remove fragile account overlay styling where possible; verify Salla internals live. |
| FR-006 no duplicate JS/menu | `custom-main-menu`, `main-menu.js` | Existing | No second menu instance/data fetch/controller per layout. |
| FR-007 light/dark logo or fallback | `store.logo`, `.navbar-brand` | Spike resolved to fallback | Preserve original logo; text fallback when absent; neutral contrast plate in transparent mode. No color inversion. |
| FR-008 long/crowded RTL/LTR | `enable_more_menu`, shared mobile menu | Existing — Audit & Polish | Reuse More behavior; logical grid/min-width rules and rendered parity evidence. |

## Salla Feasibility & Research

| Question | Evidence | Decision | Fallback |
|---|---|---|---|
| Can Twig identify the merchant's first configured home component before `{% component home %}` renders? | Official Home docs describe `{% component home %}` as the render boundary but expose no ordered component collection to the page template. | No supported pre-render query is assumed. Eligible component templates emit a marker; CSS checks the first rendered element. | Selector mismatch/unsupported `:has()` leaves the normal header. |
| Can the theme calculate image brightness or request separate Salla light/dark logos? | Current repo/runtime exposes `store.logo`; no official or installed contract proves luminance metadata or a second logo. | Do not analyze pixels or invent a logo field/API in HDL-07. Explicit ink is a merchant choice; `auto` activates only for a provably overlaid Hero. | Normal surface for uncertainty; preserve the original logo on a neutral brand plate or use store-name text if absent. |
| Are setting conditions/persistence usable? | Existing HDL-03 live evidence and registry pin the exact equality condition shape; official `twilight.json` docs support global settings. Editor localization and dynamic mutation are not documented. | Reuse Boolean/Items shapes and the proven equality condition only. Runtime correctness never depends on fields being hidden. | Keep controls visible if condition behavior differs; values remain independently safe. |
| Can layout variants share Salla components? | Installed docs confirm `salla-cart-summary` icon slot and only `login-btn` for `salla-user-menu`; current header already uses native events/components. | Keep native components and restyle the real trigger where possible. | If upstream private classes change, retain semantic native component and document the exact visual limitation. |

Full decisions and rejected alternatives are in [research.md](research.md).

## Settings Architecture

| Setting | Owner | Level | Default | Conditions | Runtime contract |
|---|---|---|---|---|---|
| `header_layout` | global / HDL-07 | Basic | existing `centered` | none | Preserve `centered|start`; add `transparent|commerce`; strict allowlist/class map. |
| `header_is_sticky` | global / existing | Basic | existing `true` | none | One shared controller; false adds no scroll observer. |
| `header_transparent_home` | global / HDL-07 | Basic | `true` | `header_layout=transparent` where proven | Allows the transparent variant to fall back to surface without changing layout selection. |
| `header_show_search` | global / HDL-07 | Basic | `true` | none | Controls icon and commerce search trigger together. |
| `header_show_wishlist` | global / existing | Basic | existing `true` | none | Existing behavior unchanged. |
| `header_show_account` | global / HDL-07 | Basic | `true` | none | Controls logged-in and logged-out account triggers together. |
| `header_show_menu` | global / HDL-07 | Basic | `true` | none | Controls the single shared menu cell — desktop custom-main-menu and the mobile trigger together. |
| `header_show_cart` | global / HDL-07 | Basic | `true` | none | Controls the single native `salla-cart-summary`. |
| `header_logo_size` | global / HDL-07 | Advanced | `medium` | none | `small|medium|large`; one allowlisted class/CSS token. |
| `header_density` | global / existing | Advanced | existing `comfortable` | none | Existing `compact|comfortable` behavior and preset ownership remain. |
| `header_transparent_ink` | global / HDL-07 | Advanced | `auto` | `header_layout=transparent` where proven | `auto|light|dark`; invalid/unset → `auto`; uncertainty → normal surface. |

Every new setting is registered with qualified key, owner, type, bilingual registry
labels, safe default, allowed values, evidence, and class/attribute mapping. Salla editor
labels remain in the proven single-label format; storefront locale files are not falsely
claimed to localize editor chrome.

## Bundle, Network, and Runtime Budget

- **Measured baseline (2026-08-11)**: `public/app.css` 799,430 B raw / 104,336 B gzip-9; `public/app.js` 116,474 B raw / 31,508 B gzip-9; compressed distributable estimate 478,773 / 1,000,000 B; internal target 950,000 B.
- **Maximum feature increase**: app CSS +12,288 B raw; app JS +4,096 B raw; no other bundle may grow for HDL-07 without architecture review.
- **New dependencies/entries/media/fonts**: zero.
- **Network requests**: zero new URLs and zero per-layout/per-product requests.
- **Runtime**: no image sampling, MutationObserver, repeated interval, or per-layout listener. Sticky uses one passive scroll listener with one pending rAF at most and resize-based height updates.
- **Rendering**: normal header is the default before enhancement; eligible transparency is CSS-first; no hidden duplicate header or menu.
- **Rollback trigger**: package target exceeded, any new request/chunk/dependency/media, JS/CSS cap exceeded, CLS attributable to header, focus/contrast regression, invalid class emission, legacy output change, or failed guard/build.

## Project Structure

### Documentation

```text
specs/007-header-layouts/
├── spec.md
├── design.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── header-layout-contract.md
│   └── live-evidence.schema.json
└── tasks.md                    # T001–T015 frozen; T016+ Lean execution
```

### Source Code

```text
twilight.json
src/config/settings-registry.json
src/views/layouts/master.twig
src/views/components/header/header.twig
src/views/components/home/enhanced-slider.twig
src/assets/styles/04-components/header.scss
src/assets/styles/04-components/storefront-system.scss
src/assets/js/app.js
src/locales/ar.json             # only if new storefront copy is required
src/locales/en.json             # paired with ar.json
scripts/check-header-layouts.mjs
scripts/check-theme.mjs
tests/header-layouts.test.mjs
public/                         # generated by production build only
```

**Structure Decision**: all variants remain at the existing shared resolution, Twig,
style, and runtime boundaries. No new stylesheet layer, header partial tree, webpack
entry, app, or duplicated menu/search/cart implementation is created.

## Lean Verification and Evidence

The remaining sequence is deliberately compact:

1. Implement Transparent, Commerce, the shared Mobile shell, and the single
   Sticky/Scrolled controller in the existing core.
2. Run focused HDL-07 contracts plus the relevant settings, RTL/accessibility, budget,
   and motion regressions.
3. Run the production build, `check-theme --build`, bundle budget, and diff check.
4. Complete one independent review and apply only blocking in-scope fixes.
5. Create one isolated preview branch/worktree from the reviewed SHA, wait for Yasser's
   branch confirmation, and run one Chrome Salla Preview.
6. Practically check four layouts across Desktop/Mobile and Arabic/English, with 320px
   and 390px mobile stress; Transparent Top/Scrolled/Fallback; Commerce crowded
   navigation; Menu/Search; touch/focus sanity; and legacy centered/start.
7. Compare the rendered result with Figma Rev 1 and present it for `ACCEPT HDL-07`.

Evidence is consolidated into:

- `evidence/implementation.md` — architecture, source changes, constraints, and live
  items still not verified.
- `evidence/verification.md` — focused tests, build/gates, exact preview identity, live
  outcomes, and Figma comparison.
- `evidence/final-review.md` — the single independent review and final blocker count.
- `evidence/live/<sha>/` — only screenshots or DOM measurements needed to support the
  practical preview decision.

The existing contract/checker/schema artifacts created in T001–T015 are preserved and
may continue to run, but Lean execution adds no new checker, fixture, schema, canonical
network inventory, full rollback drill, or mandatory multi-page Lighthouse run unless a
real uncovered defect or regression makes one necessary.

Compatibility remains a blocking outcome: `centered|start`, density, Sticky, wishlist,
preset maps, menu/search/cart/account behavior, and safe defaults must not regress.
Unknown or unsafe Transparent conditions render the ordinary surface. No migration,
dependency, request, chunk, media, font, or build-architecture change is permitted.

## Complexity Tracking

| Constitution Exception | Why Needed | Simpler Alternative Rejected | Owner | Expiry/Remediation |
|---|---|---|---|---|
| None | — | — | — | — |
