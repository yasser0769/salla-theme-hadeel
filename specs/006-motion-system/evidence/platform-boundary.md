# HDL-06 Platform Boundary (T004) — Platform-owned Spike

**Date**: 2026-08-10 · **Status**: Spike recorded; native behavior is the fallback.

## Boundary statement

The internal transition duration/easing of Salla's Stencil components is **not**
theme-controllable through any proven public interface:

- `salla-drawer`, `salla-modal`, `salla-slider` expose public methods and slots
  (recorded in `docs/salla-twilight-notes.md` from
  `node_modules/@salla.sa/twilight-components`), but **no motion/duration
  configuration API** exists in the installed package surface.
- Their rendered classes (`.s-slider-container`, `.s-button-btn`, …) are
  **private scoped implementation details**. Styling or timing them from the
  theme is a fragile override that can silently break on any upstream patch
  release, and risks regressing component-owned focus trapping and scroll lock.

## Decision (research.md §7)

- The theme does **not** reach into component internals for motion.
- Theme-owned tokens (`01-settings/motion.scss`) apply only to theme-owned
  wrappers and markup.
- Component-owned focus trap, focus return, scroll lock, and keyboard order are
  never reimplemented; HDL-06 only verifies no regression.
- Rendered transition behavior of `salla-drawer` / `salla-modal` / `salla-slider`
  (Swiper) is measured in the post-change Salla preview evidence phase
  (T032–T033). Any behavior that cannot be driven or measured through a public
  interface is recorded as `NOT VERIFIED` with component/selector/evidence —
  never patched through a private selector.

## Safe fallback

Native Salla component behavior. If a measured difference from the approved
Figma prototypes is found in preview, it is documented as a Platform-owned
delta for owner decision — it is not a theme-code failure and triggers no
fragile override.

## HDL-06 code-level consequences

- Product add-to-cart feedback attaches to the theme-rendered
  `salla-add-product-button` **host element** (the tag from our own
  `single.twig` markup), listening to the bubbling `click` — no private inner
  classes (`.s-button-btn`) are selected.
- Reveal/feedback controllers use only public browser APIs (WAAPI,
  IntersectionObserver, MediaQueryList) on theme-owned elements carrying
  explicit `data-hadeel-reveal` opt-ins.
