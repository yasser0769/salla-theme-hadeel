# HDL-07 Feasibility — T005 (Resolved Spikes)

**Recorded at**: 2026-08-10 (baseline SHA `e261352d8e3796f0e30ca3663de121368764d901`)
**Source**: `specs/007-header-layouts/research.md` (status: Complete; no
unresolved planning unknowns), plan.md "Salla Feasibility & Research" table.

This file records the four Spikes that spec.md §12 deferred to research after
Figma approval, and the decision each one resolved to. None of them remains a
blocking product question; each has a safe fallback instead of an assumed API.

## S-1 — Hero eligibility (first eligible home Hero)

- **Question**: can the theme know whether the merchant's first home component
  is a Hero suitable for a transparent header before `{% component home %}`
  renders?
- **Evidence**: Salla's official Home documentation describes
  `{% component home %}` as the render boundary but exposes no ordered
  component collection to the page template.
- **Decision (research.md R-003)**: no supported pre-render query is assumed.
  The eligible full-width enhanced Hero template (`enhanced-slider.twig`)
  emits its own server-rendered marker (`data-hadeel-header-hero`); the
  transparent relationship is established only when that marker is the first
  element child of `#main-content`, using CSS `:has()` for first paint plus
  the shared scrolled controller — no MutationObserver, no client image
  analysis, no initial client-side transparency.
- **Fallback**: unsupported `:has()`, a DOM/wrapper mismatch, a missing Hero,
  or any non-Hero first element leaves the ordinary header surface. No flash.

## S-2 — Contrast / logo (light-dark ink and brand artwork)

- **Question**: can the theme compute Hero image brightness or request a
  separate Salla light/dark logo?
- **Evidence**: the current repo/runtime exposes `store.logo` only; no
  official or installed contract proves luminance metadata or a second logo
  field.
- **Decision (research.md R-004)**: no pixel sampling, no `filter: invert()`,
  no invented `store.logo_dark`/`store.logo_light`. `header_transparent_ink`
  is a merchant choice (`auto|light|dark`); `auto` may choose light ink only
  when the eligible Hero template proves all relevant slides carry the
  existing dark overlay (a server-rendered marker), otherwise `auto` returns
  to the normal surface. The original logo is never recolored — it gets a
  neutral contrast plate; a missing logo renders the escaped store name.
  The scrolled surface uses the existing `--hadeel-surface` token; HDL-07
  adds no independent color setting (spec.md §6, Rev 1).
- **Fallback**: any uncertainty → normal opaque surface with the original
  logo.

## S-3 — Editor-condition shapes (settings visibility)

- **Question**: are `twilight.json` field conditions reliable for hiding
  advanced controls (e.g. `header_transparent_home` only with the transparent
  layout)?
- **Evidence**: HDL-03 live evidence and the canonical registry pin the exact
  equality condition shape (`{ "id": …, "operation": "=", "value": … }`);
  official twilight.json documentation supports global settings. Editor
  localization and dynamic sibling mutation are not documented.
- **Decision (research.md R-005)**: add only Boolean and single-choice Items
  fields; where conditions are used, reuse only the proven equality shape.
  Every new field has an independent safe standalone default, so editor
  visibility is presentation-only and runtime correctness never depends on a
  field being hidden.
- **Fallback**: if condition behavior differs in the editor, the controls
  simply stay visible; resolved output is unchanged.

## S-4 — Salla-component contracts (cart/account/search)

- **Question**: can the four layouts share Salla's native cart, account, and
  search components without forking behavior?
- **Evidence**: `docs/salla-twilight-notes.md` (read out of the installed
  `@salla.sa/twilight*` packages): `salla-cart-summary` supports the `icon`
  slot; `salla-user-menu` supports the `login-btn` slot only (the trigger is a
  fixed template); native `search::open` / `login::open` events exist and are
  already used by the current header.
- **Decision (research.md R-007)**: keep the native components and events in
  one shared `header.twig` core; restyle the real trigger where possible; the
  commerce wide search is one button-shaped **trigger** dispatching the same
  `search::open` event — HDL-09 owns results/suggestions, HDL-08 owns menu
  contents.
- **Fallback**: if upstream private classes change, the semantic native
  component remains and the exact visual limitation is documented rather than
  patched over with a cloned component.

## Carry-over

- Runtime behavior of every decision above is **not verified** until the
  isolated Salla preview checkpoint (Phase 6); the live-evidence matrix in
  plan.md and `quickstart.md` owns that proof.
- The preview SHA is a commit created only on the temporary preview branch,
  never on primary before owner acceptance (spec.md §6, Phase-0 remediation).
