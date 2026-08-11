# HDL-07 Traceability — T006

**Recorded at**: 2026-08-10, baseline SHA `e261352d8e3796f0e30ca3663de121368764d901`.
Maps every `HDL-07-FR-*` (spec.md §5) to source, tests, Figma Rev 1 nodes, and
the evidence that must exist before acceptance.

| FR | Requirement | Source (owner files) | Tests / checkers | Figma nodes (Rev 1) | Expected evidence |
|---|---|---|---|---|---|
| HDL-07-FR-001 | Four layouts share one logo/search/account/cart core | `src/views/components/header/header.twig` (one DOM), `master.twig` (one `hadeel-header-{layout}` class), `storefront-system.scss` (grid variants) | `tests/header-layouts.test.mjs` single-core assertions; `scripts/check-header-layouts.mjs` one-`.store-header`/one-`custom-main-menu`/one-`salla-cart-summary` rules | Desktop `457:202`; variants `460:40/54/69/83/98/112/127/143` | `evidence/tests/*` suite outputs; live DOM single-instance records under `evidence/live/<sha>/` |
| HDL-07-FR-002 | Transparent header on home only by default; readable surface after scroll | `master.twig` (layout + ink resolution), `enhanced-slider.twig` (eligibility marker), `storefront-system.scss` (`:has()` first-paint + scrolled surface via `--hadeel-surface`), `app.js` (shared scrolled state) | test suite: marker confinement, safe-auto-ink, no client image analysis; checker: transparent eligibility rules | `460:98/112` (Top), `460:164` (dark Hero), `460:179` (Scrolled) | `evidence/scenarios/transparent.md` (T017); live `transparent-*` captures: computed surface/ink before/after scroll |
| HDL-07-FR-003 | Auto fallback to normal header when first section is not eligible | Same as FR-002 (fail-safe predicates) | test suite: first-element/no-Hero/fallback assertions | `460:194` (No Hero), `460:208` (light Hero) | live `transparent-*` fallback captures: no flash, ordinary surface from first paint |
| HDL-07-FR-004 | Sticky on/off without layout jump | `src/assets/js/app.js` (`App.initiateStickyMenu`, `setHeaderHeight`), `header.scss` (pinning) | test suite: one controller/one passive listener/≤1 pending rAF, no scroll observer when Sticky false | `460:179`, Mobile `460:238/302` | `evidence/runtime-budget.md` (T043); live rectangles + CLS observations (T051) |
| HDL-07-FR-005 | All icons accessible with focus states | `header.twig` (semantic controls, native accessible names), global focus-visible contract (HDL-04) | `tests/localization-rtl-accessibility.test.mjs` regression + header focus assertions | `461:229` (edge cases: focus order/return, 44px targets) | HDL-04 carried runtime items in `evidence/live/<sha>/hdl04-*`; focus-return captures (T052) |
| HDL-07-FR-006 | No duplicated JS or menu data per layout | `src/assets/js/partials/main-menu.js` (one `custom-main-menu`), `app.js` (one controller) | test suite + checker: no second menu instance/listener/request | — (behavioral) | `evidence/runtime-budget.md`: zero new URLs, one shared Sticky controller |
| HDL-07-FR-007 | Light/dark logo handling or documented fallback | `header.twig` (original `store.logo`, escaped store-name fallback, neutral contrast plate), `master.twig` (`header_transparent_ink` strict resolution), `storefront-system.scss` (ink tokens) | test suite: original-logo preservation, no inversion, escaped fallback | `460:164/179/194/208`, edge `461:229` (missing logo) | live brand-fallback captures (T051) |
| HDL-07-FR-008 | Long text and crowded menu in RTL and LTR | `header.twig`, `main-menu.js` (More behavior), `storefront-system.scss` (logical grid, min-width) | test suite: logical order, no direction detection, no positive tabindex; localization regression | `461:229` (long logo, crowded menu → More) | live `crowded-*` matrix at 320/390/1366 RTL+LTR (T053) |

## Settings traceability (spec.md §6 / plan.md Settings Architecture)

| Setting | twilight.json | registry record | resolver (master.twig) | default | condition |
|---|---|---|---|---|---|
| `header_layout` (+`transparent\|commerce`) | T012 | `global::header_layout` (T013) | HDL-03 resolver allowlist (T014) | existing `centered` | none |
| `header_is_sticky` | existing | `global::header_is_sticky` | existing | `true` | none |
| `header_transparent_home` | T012 | `global::header_transparent_home` (T013) | T014 | `true` | `header_layout=transparent` (proven equality shape) |
| `header_show_search` | T012 | `global::header_show_search` (T013) | — (T026 reads it) | `true` | none |
| `header_show_wishlist` | existing | `global::header_show_wishlist` | existing | `true` | none |
| `header_show_account` | T012 | `global::header_show_account` (T013) | — (T026 reads it) | `true` | none |
| `header_logo_size` | T012 | `global::header_logo_size` (T013) | strict allowlist (T014) | `medium` | none |
| `header_density` | existing | `global::header_density` | existing HDL-03 resolver | `comfortable` | none |
| `header_transparent_ink` | T012 | `global::header_transparent_ink` (T013) | strict allowlist (T014) | `auto` | `header_layout=transparent` (proven equality shape) |

## Evidence chain rule

Figma proves product/visual intent; deterministic suites/checkers prove source
contracts; only the owner-confirmed Salla preview (Phase 6, exact SHA) proves
runtime behavior. No row above is accepted from a local mockup.
