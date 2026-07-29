# Design QA — Kalles-style product card preview

## Evidence

- Source visual truth: `/var/folders/9p/zx47l4xx1bxcvb6dy6xnnc_40000gn/T/codex-clipboard-484fd480-fd25-4709-b043-f60bd25aa7f3.png`
- Local implementation: `http://127.0.0.1:4173/kalles-card-preview.html`
- Desktop implementation screenshot: `/Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel/kalles-preview-hover.png`
- Mobile implementation screenshot: `/Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel/kalles-preview-mobile.png`
- Quick-view screenshot: `/Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel/kalles-preview-modal.png`
- Full-view comparison: `/Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel/kalles-preview-comparison.png`
- Focused card comparison: `/Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel/kalles-preview-card-comparison.png`

## Capture normalization

- Source pixels: `554 × 838`; supplied screenshot with unknown device density.
- Desktop CSS viewport and screenshot: `1440 × 1000`, device pixel ratio `1`.
- Mobile CSS viewport and screenshot: `390 × 844`, device pixel ratio `1`.
- Focused comparison: source media crop `525 × 670`; implementation media crop `307 × 428`, normalized to `481 × 670` before side-by-side comparison.
- Full-view comparison: source and desktop implementation were both normalized to `1000px` height.
- Desktop state: the first product uses `:focus-within`, which deliberately renders the same secondary-image and action-group state as mouse hover while preserving a visible keyboard focus ring.
- Mobile state: default touch layout with a two-column `175px` grid, persistent wishlist/add controls, and fixed five-item bottom navigation.

## Required fidelity surfaces

- Fonts and typography: `Tajawal` provides the Arabic adaptation of Kalles' clean sans-serif hierarchy. Product titles, prices, microcopy, pills, and header labels remain legible at both tested breakpoints.
- Spacing and layout rhythm: the portrait media ratio, 52% action-pill width, vertical action stack, side controls, badge placement, four-column desktop grid, and two-column mobile grid match the source's proportions without horizontal overflow.
- Colors and tokens: black/white/green surfaces follow the reference. Cyan quick-add was intentionally mapped to Hadeel's red brand accent so the preview reflects the existing theme token.
- Image quality and asset fidelity: the primary target product uses the real Kalles image pair, including the secondary hover image. Other grid products use real photographic assets; no placeholder or CSS-drawn product art is present.
- Copy and content: the English reference labels were localized to concise Arabic storefront copy. Product names, prices, categories, size labels, and storefront notice are coherent in RTL.
- Icons: Bootstrap Icons supplies a consistent real icon set for wishlist, expand, quick view, add, header actions, and the mobile bar.
- Accessibility and behavior: controls are semantic buttons with labels, focus treatment is visible, reduced motion is supported, dialog closes by its close control, backdrop click, or Escape, and there is no mobile horizontal overflow.

## Comparison history

### Pass 1

- [P2] Desktop action pills were too narrow relative to the media area.
  - Fix: increased the action group from `136px` to `160px` and raised the pill height to `46px`.
- [P2] Desktop wishlist and expand controls used white circular surfaces instead of the source's floating white line icons.
  - Fix: removed the desktop circles, applied white icons with a subtle drop shadow, and retained circular controls only for the touch layout.
- [P2] The desktop new badge was undersized.
  - Fix: increased it from `58px` to `70px`, retaining the smaller mobile override.

### Pass 2

- Post-fix focused comparison confirms matching portrait crop, 52% pill width, action-stack proportions, floating line icons, green circular badge, and bottom size row.
- The remaining differences are intentional locale/brand adaptations: Arabic RTL copy and Hadeel red instead of Kalles cyan.
- No actionable P0, P1, or P2 findings remain.

## Primary interactions tested

- Desktop secondary-image swap and action-group reveal.
- Quick-view dialog open with the correct product name, price, and image.
- Size selection inside quick view.
- Add-to-cart from quick view: dialog closes, cart count increments, and success toast appears.
- Mobile quick-add: cart count increments and success toast appears.
- Mobile two-column grid and fixed bottom bar.
- Browser console checked after desktop and mobile interaction tests: no warnings or errors.

## Follow-up polish

- [P3] The QA screenshot includes the keyboard focus ring around the wishlist icon because focus was used to capture the hover-equivalent state. Ordinary mouse hover does not show that ring.

## Live Salla verification

- Draft storefront tested: `dev-zaboon` through Salla's authenticated theme preview.
- Desktop hover screenshot: `/Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel/salla-live-card-hover.png`
- Native quick-view screenshot: `/Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel/salla-live-quick-view.png`
- Mobile screenshot at `390 × 844`: `/Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel/salla-live-mobile.png`
- Desktop card media measured `333 × 465px`; action pills measured `173 × 46px`.
- Mobile card measured `175px` wide with a `42 × 42px` native add control and a fixed `390 × 55px` bottom toolbar.
- No horizontal overflow was present on mobile.
- The card and quick-view add actions both used Salla's native `salla-add-product-button` and incremented the real preview cart. The cart was restored to its original quantity after testing.
- The demo product has one gallery image, so the live card correctly keeps its primary image instead of fabricating a hover swap. Products with a distinct second gallery image receive the swap automatically.
- Console output contained only Salla preview/Twilight tracking `405` responses and platform schema/offers notices; no error originated from the theme's product-card script or stylesheet.

final result: passed
