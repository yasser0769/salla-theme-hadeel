# Implementation Plan: HDL-06 Motion System

**Branch**: `codex/hdl-06-motion-system` | **Date**: 2026-08-10 | **Spec**: [spec.md](spec.md)
**Input**: Approved feature specification in `specs/006-motion-system/spec.md`
**Roadmap ID**: `HDL-06`
**Design handoff**: [Figma Revision 1](design.md) — owner approved 2026-08-10

## Summary

Replace Hadeel’s scattered motion values and periodic CTA attention loop with one progressive-enhancement motion contract. The server validates two new merchant settings and emits allowlisted body state; CSS owns semantic duration/easing/distance tokens; a small theme-owned controller provides one-shot noncritical reveal and cancels active motion when the OS preference changes. Existing Salla components retain their focus, scroll-lock, and internal behavior. No content, price, CTA, or search result is hidden pending JavaScript.

## Design Gate Check *(blocking)*

- [x] `design.md` contains approved Figma page and direct Node IDs.
- [x] Owner wrote **Approved for Implementation** (`APPROVE HDL-06 REV 1`).
- [x] Arabic mobile, Arabic desktop, critical English/LTR, reduced motion, and required states are covered.
- [x] CTA uses logical start: right in RTL and left in LTR.
- [x] Salla-owned transition control is marked as Spike, not assumed.

## Technical Context

**Platform**: Salla Twilight theme; server-rendered Twig plus Salla Stencil components
**Source of truth**: `src/`, `twilight.json`, and repository contracts; `public/` is generated output
**Build**: `npx webpack --mode production`
**Guard**: `node scripts/check-theme.mjs --build --max-errors=0`
**Target flows**: shared shell, Home noncritical reveals, Product add-to-cart feedback, Blog like feedback, Salla Drawer/Modal/Slider verification
**Existing implementation**: scattered CSS timing values, partial reduced-motion blocks, `html { scroll-behavior: smooth; }`, global `animejs` load for limited Blog use, and periodic product CTA `setInterval`
**Salla APIs/components**: `salla-drawer`, `salla-modal`, `salla-slider`, `salla-add-product-button`; only documented/public methods are relied upon
**Testing**: Node 20 built-in tests, motion static guard, existing HDL-03/04/05 suites, production build sync, rendered Salla four-way matrix
**Performance goals**: no new request/chunk/entry/dependency/font/media; aggregate `app.css + app.js` does not exceed the 931,423-byte raw baseline; motion-attributed CLS `0.000`
**Accessibility goals**: OS reduced-motion override, dynamic preference response, visible focus and unchanged keyboard order, no hover-only function, critical content available at `0ms`
**Localization**: no new storefront copy expected; merchant labels are recorded bilingually in the settings registry
**Scale/scope**: two new global settings, two preserved legacy product settings, one shared resolver, one shared motion controller

## Constitution Check *(GATE)*

- [x] Conversion > customization > polish: commerce content is never delayed; periodic CTA attention is removed.
- [x] One Salla theme and one shared core: one resolver and one token contract serve all presets/components.
- [x] Components remain responsibility-based; no per-preset JS/CSS trees are introduced.
- [x] Mobile/Arabic first with four-way RTL/LTR evidence and logical start/end motion.
- [x] Compressed package, raw bundle, network, CLS, interaction, and accessibility budgets are explicit gates.
- [x] Approved Figma → isolated branch → build/guard → owner-confirmed Salla preview evidence chain is preserved.
- [x] Existing code was audited and classified before plan work.
- [x] No Kalles/Raed code, identity, fake commerce data, raw HTML, secret, or new third-party script is introduced.
- [x] No Constitution exception is required.

## Existing-Code Reuse Map

| Requirement | Existing files/components | Classification | Reuse/change |
|---|---|---|---|
| FR-001–003 motion contract | `src/assets/styles/01-settings/tokens.scss`, `02-generic/animations.scss`, existing component transitions | Existing + Build | Add semantic motion aliases in one owner file; replace owned raw timings rather than stacking overrides. |
| FR-002/006 merchant level | `twilight.json`, `src/config/settings-registry.json`, `src/views/layouts/master.twig` | Build | Add two settings; validate exact values server-side; emit one allowlisted level class and one mobile-reduction state. |
| FR-004/005 reduced motion | four existing component `prefers-reduced-motion` blocks and one Product JS check | Existing — Audit & Polish | Add a global contract, remove smooth scroll under reduce, evaluate preference at interaction time, and cancel active theme-owned animations on change. |
| FR-007/010 critical visibility/CLS | server-rendered Twig, current visible-by-default markup | Existing — preserve | Reveal uses WAAPI only after an eligible noncritical node enters view; no hidden pre-JS CSS state and transform/opacity only. |
| FR-008/013 CTA feedback | `src/assets/js/product.js`, `single.twig`, existing `hadeel-atc-animation--*` classes | Existing — behavior correction | Delete periodic interval. Trigger selected class immediately from user action, clean on animation end, and cancel under reduce. |
| FR-009 hover parity | existing focus/active/touch styles | Existing — audit | Convert timing values to tokens; tests ensure no function is gated by hover. |
| FR-011 RTL/LTR | `theme.is_rtl`, `salla.config('theme.is_rtl')`, logical CSS | Existing — reuse | Directional distance is expressed as logical signed variables; media/non-directional effects never mirror. |
| FR-012 Salla overlays/sliders | native `salla-drawer`, `salla-modal`, `salla-slider` | Spike | Do not reach into undocumented internals. Measure actual transitions/focus/scroll lock in preview and record `NOT VERIFIED` where control is unavailable. |
| FR-016 motion library | `app.js`, `partials/anime.js`, `blog.js`, `animejs` dependency | Existing — simplify | Remove runtime import/wrapper and replace the two Blog effects with native state update/WAAPI. Package/lock cleanup is a separate dependency-only commit. |
| FR-017 one-shot reveal | no shared reveal controller | Build | Small IntersectionObserver controller; explicit noncritical opt-in only; unobserve after first entry; active animations cancel to final state on reduce. |
| FR-018 evidence | HDL-02 parity pattern, HDL-05 preview policy | Existing — reuse | Capture same semantic state across four direction/device points after the last source edit. |

## Salla Feasibility & Research

| Question | Evidence | Decision | Safe fallback |
|---|---|---|---|
| Can theme code safely set Drawer/Modal/Slider transition internals? | `docs/salla-twilight-notes.md` documents public methods but no motion-duration API; components use private scoped classes | Spike | Keep platform transition; apply tokens only to theme-owned wrappers; report exact component as `NOT VERIFIED`. |
| Can settings update live without save/re-render? | Twilight settings are server-rendered; no merchant-setting event API is proven | Not required | Settings take effect after save/re-render; no editor DOM script. |
| Can focus/scroll lock be reimplemented safely? | Salla components own these behaviors | No | Never replace them; verify no regression only. |
| Can reveal remain safe with delayed/disabled JS? | WAAPI starts only on intersection and does not require a hidden base class | Confirmed browser pattern | Unsupported/no-JS browsers show content immediately with no reveal. |
| Can reduced preference change during the session? | `MediaQueryList` change event is browser-native | Confirmed for theme-owned motion | Cancel active WAAPI/CSS feedback and mark eligible elements final; CSS media query handles declarative motion. |

## Settings Architecture

| Setting | Owner | Tier | Default | Conditions | Registry labels |
|---|---|---|---|---|---|
| `motion_level` | global / HDL-06 | Basic | `balanced` | none | Arabic + English; values `calm`, `balanced`, `rich` |
| `motion_reduce_mobile` | global / HDL-06 | Advanced | `true` | none; avoid hidden-value persistence assumptions | Arabic + English |
| `product_add_to_cart_animation` | global product / HDL-06 | Advanced existing | `tada` | unchanged | Description changes to action feedback only |
| `product_add_to_cart_animation_interval` | global product / HDL-06 | Compatibility existing | `6` | unchanged and visible | ID/type/value retained; clearly documented as legacy no-op |

The Twig resolver allowlists values and falls back to `balanced`; raw settings are never concatenated into a class. The new settings do not participate in Preset profiles in HDL-06.

## Bundle, Network, and Runtime Budget

- **Publishing baseline**: deterministic Salla package estimate `475,903 / 1,000,000 B` compressed (47.59%); internal target `950,000 B`.
- **Build baseline**: `public/` 1,151,263 B raw; `app.css` 802,202 B raw / 103,802 gzip-9; `app.js` 129,221 B raw / 37,056 gzip-9; aggregate app entry 931,423 B raw.
- **Maximum feature increase**: aggregate production `app.css + app.js` must not exceed 931,423 B; CSS may grow by at most 12 KiB raw only if the removed Anime runtime keeps the aggregate flat or lower. Compressed package must remain below the 95% internal target.
- **New dependencies/entries/chunks/fonts/media**: zero.
- **Network requests**: exact URL-set delta attributable to HDL-06 must be empty.
- **Runtime**: feedback begins within 100ms; noncontinuous duration caps 160/240/400ms; zero recurring CTA timer; zero motion-attributed CLS; no theme-owned animation continues after reduce is activated.
- **Rollback trigger**: any critical content hidden pre-JS, lost focus/scroll lock, unknown class, periodic attention, new request/chunk, aggregate growth, package warning/fail, motion CLS, or test/guard failure.

## Project Structure

### Documentation

```text
specs/006-motion-system/
├── spec.md
├── design.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/motion-contract.md
├── quickstart.md
└── tasks.md                 # generated in the next phase
```

### Source Code

```text
twilight.json
src/config/settings-registry.json
src/views/layouts/master.twig
src/views/pages/product/single.twig
src/views/components/home/*.twig         # explicit noncritical reveal targets only
src/assets/styles/01-settings/motion.scss
src/assets/styles/app.scss
src/assets/styles/02-generic/{common,animations}.scss
src/assets/styles/03-elements/*.scss      # token replacement only where owned
src/assets/styles/04-components/*.scss    # token replacement/reduced-motion audit
src/assets/js/app.js
src/assets/js/partials/motion.js
src/assets/js/partials/anime.js            # remove runtime wrapper
src/assets/js/{product,blog}.js
scripts/check-motion-system.mjs
scripts/check-theme.mjs
tests/motion-system.test.mjs
public/*                                   # production build output only
```

**Structure Decision**: Motion variables live in `01-settings`, generic keyframes in their existing owner, and component rules stay in their existing component files. No late override stylesheet is allowed. JS reads resolved CSS custom properties so CSS remains the single timing source.

## Verification Matrix

| Page/flow | Mobile RTL | Desktop RTL | Mobile LTR | Desktop LTR | Evidence |
|---|---:|---:|---:|---:|---|
| Home eligible one-shot reveal + no-JS visibility | ✓ | ✓ | ✓ | ✓ | `evidence/live/<sha>/home-*` |
| Product CTA action feedback + reduced motion | ✓ | ✓ | ✓ | ✓ | `evidence/live/<sha>/product-*` |
| Collection cards/slider + critical result visibility | ✓ | ✓ | ✓ | ✓ | `evidence/live/<sha>/collection-*` |
| Cart/Drawer/Modal focus and scroll lock | ✓ | ✓ | ✓ | ✓ | `evidence/live/<sha>/overlay-*` |
| Dynamic OS reduce and mobile Rich cap | ✓ | — | ✓ | — | `evidence/live/<sha>/preference-*` |

Chrome is the required acceptance browser. Safari/Firefox behavior is recorded when available; unavailable platform-owned behavior is explicitly `NOT VERIFIED`. Before opening any browser preview, create an isolated preview worktree/branch, state its exact branch and SHA, and wait for owner confirmation.

## Rollback and Compatibility

- Preserve both legacy setting IDs, types, option values, and stored defaults. No migration or hidden persistence is required.
- Unknown/new `motion_level` values resolve to `balanced`; false-like mobile values are normalized explicitly.
- A source rollback safely ignores stored new setting IDs and continues using preserved legacy values.
- Rollback is file-scoped: remove the resolver/body state/controller and token substitutions, restore the prior Product action path, rebuild production, and rerun all guards. Do not reset or revert unrelated work.
- The dependency declaration for `animejs` remains until a separate dependency-only commit updates `package.json` and `pnpm-lock.yaml`; runtime code must not import it after HDL-06.

## Post-Design Constitution Check

PASS. Phase 0/1 artifacts introduce no exception, duplicated core, unsupported Salla API, hidden critical content, local font, dependency, request, or per-preset implementation. All earlier gates remain satisfied.

## Complexity Tracking

| Constitution Exception | Why Needed | Simpler Alternative Rejected | Owner | Expiry/Remediation |
|---|---|---|---|---|
| None | — | — | — | — |
