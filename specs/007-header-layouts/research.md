# Phase 0 Research — HDL-07 Four Header Layouts

**Date**: 2026-08-11
**Status**: Complete; no unresolved planning unknowns

## R-001 — Keep one shared header DOM

**Decision**: Preserve `src/views/components/header/header.twig` as the single logo,
menu, search, account, wishlist, and cart tree. The four Desktop layouts are strict
body-class/CSS Grid variants; Mobile is one shared arrangement.

**Rationale**: Data and behavior are identical. This follows the constitution and avoids
four menu instances, divergent accessible names, duplicate Salla components, and extra
runtime work.

**Alternatives rejected**: four Twig partial trees; JavaScript DOM reparenting; one
webpack entry per layout.

## R-002 — Extend the existing resolver without changing legacy meaning

**Decision**: Append `transparent|commerce` to `header_layout`; keep `centered|start`,
the current default, preset profile mappings, mode setting, and persisted custom value.
Update `twilight.json`, the canonical registry, Twig allowlist, tests, and SCSS mapping
atomically.

**Rationale**: HDL-03 established `header_layout` as the persistent Custom store. A new
parallel setting or repurposed value would create migration and rollback ambiguity.

**Alternatives rejected**: `header_layout_v2`; changing the default; adding preset maps
for unapproved future preset identities.

## R-003 — Transparent mode is marker-driven and fail-safe

**Decision**: Mark the existing full-width enhanced Hero template as eligible. Apply
transparent first-paint styling only when that marker is the first rendered element in
`#main-content`, the layout is `transparent`, and the setting is enabled. Use CSS
`:has()` for the backward relationship and a shared scrolled-state controller.

**Rationale**: Salla's official Home documentation states that `{% component home %}`
renders the merchant-managed home features, but exposes no ordered component collection
to `index.twig`. Component templates can reliably mark their own output. Modern
relational CSS avoids waiting for a client script and therefore avoids a transparent
flash.

**Safe fallback**: unsupported `:has()`, a wrapper/DOM shape mismatch, a missing Hero,
or any non-Hero first element leaves the ordinary surface intact. This is verified on a
rendered Salla storefront before acceptance.

**Alternatives rejected**: guessing from configured component order; moving the Hero
outside `{% component home %}`; a MutationObserver; initial client-side transparency.

Sources: [Salla Home Page](https://docs.salla.dev/422558m0),
[Twilight components overview](https://docs.salla.dev/422580m0).

## R-004 — Never infer image luminance or alter the merchant logo

**Decision**: `header_transparent_ink=auto` may choose light ink only when the eligible
Hero template proves all relevant slides carry the existing dark overlay. Otherwise
`auto` returns to the normal surface. Explicit `light|dark` is merchant intent. The
original `store.logo` is never inverted; transparent mode gives it a small neutral
contrast plate. Missing logo renders the store name as text.

**Rationale**: The current Salla context exposes `store.logo`, not a documented second
light/dark logo or luminance value. Client pixel sampling adds timing, CORS, and visual
instability. Preserving brand artwork is more important than pretending contrast is
known.

**Alternatives rejected**: CSS `filter: invert()`; canvas sampling; a network image
service; an unproven `store.logo_dark`/`store.logo_light`; shipping local logo assets.

## R-005 — Reuse proven setting shapes and keep runtime independent of editor hiding

**Decision**: Add only Boolean and single-choice Items fields. Where conditions are
used, reuse the exact equality shape already proven by HDL-03. Every field has a safe
standalone default, so incorrect editor visibility cannot break the storefront.

**Rationale**: Official `twilight.json` documentation confirms global settings and the
Partners Portal editing flow. HDL-03 proved Hadeel's equality condition shape. No source
proves dynamic sibling mutation, image-derived defaults, or localized editor-label
objects.

**Alternatives rejected**: dynamic editor summaries; changing sibling values; relying
on hidden fields for correctness; locale keys inside editor schema.

Sources: [Salla Twilight.json](https://docs.salla.dev/421921m0),
[Setup a theme](https://docs.salla.dev/421879m0), HDL-03 research/evidence.

## R-006 — One small Sticky/scrolled controller

**Decision**: Refine `App.initiateStickyMenu()` rather than add another controller. It
measures the real header shell, batches scroll changes through one pending
`requestAnimationFrame`, uses passive scroll, updates height on resize/content changes,
and emits semantic top/scrolled classes/data only.

**Rationale**: The current implementation already owns Sticky but measures late and
handles every scroll event directly. Refining that boundary is smaller and reduces
layout-jump risk.

**Alternatives rejected**: a second transparent-header controller; one listener per
layout; polling; a new animation dependency.

## R-007 — Use Salla-native interaction contracts

**Decision**: Keep `salla-cart-summary` and its supported `icon` slot; keep native login
and search events; keep `salla-user-menu`, styling its actual trigger where possible.
The commerce search field is a button-shaped trigger for HDL-09's search experience, not
a second search implementation.

**Rationale**: Installed Twilight evidence documents the cart slot and the limited user
menu slot. Reusing native components preserves counters, login state, and platform
behavior.

**Alternatives rejected**: custom cart state; cloned account menu; a new search request
or suggestion API in HDL-07.

Sources: `docs/salla-twilight-notes.md`,
[Twilight Web Components](https://docs.salla.dev/422689m0).

## R-008 — Logical layout, DOM order, and shared Mobile are the parity mechanism

**Decision**: Keep a logical DOM sequence and implement Desktop arrangement with CSS
Grid areas/logical properties. Mobile always uses menu → centered brand → search/cart
actions in the same semantic sequence; hidden controls leave no empty focus stop.

**Rationale**: Visual `row-reverse` would decouple focus and visual order. One DOM plus
direction-aware grid is easier to verify against the approved RTL/LTR matrix.

**Alternatives rejected**: duplicated RTL markup; JavaScript order switches; positive
`tabindex`; mirroring logos or non-directional icons.

## R-009 — Budgets are independent gates

**Decision**: Add no dependency, chunk, request, font, or media. Cap HDL-07 at +12,288
raw CSS bytes and +4,096 raw app-JS bytes while separately requiring compressed-package
compliance below 950,000 B, zero new network URLs, no material Lighthouse regression,
and no header-attributable CLS.

**Rationale**: The corrected constitution separates Salla's compressed publishing gate
from raw bundle and runtime performance telemetry. Header code is site-wide, so even a
small regression is multiplied across every page.

**Alternatives rejected**: accepting package compliance as proof of runtime performance;
adding a layout library; using runtime image analysis.

## R-010 — Preview evidence must be branch/SHA-bound

**Decision**: Use an isolated temporary preview worktree/branch only after source review.
Before the browser opens, report its exact branch/SHA and wait for Yasser's Partners
Portal confirmation. Capture signed preview evidence after the last source change.

**Rationale**: This project has repeatedly observed stale Salla CLI branch/sync behavior.
An old draft is neither a code pass nor a code failure.

**Fallback**: record `SALLA PREVIEW SYNC FAILURE`, keep runtime claims unverified, and do
not mutate/commit/push the primary branch to satisfy the CLI.
