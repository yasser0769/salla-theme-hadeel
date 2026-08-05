# Product and cart visual QA

- Source visual truth: `/var/folders/9p/zx47l4xx1bxcvb6dy6xnnc_40000gn/T/codex-clipboard-cac8851e-8d9e-4832-994f-93695c047672.png` through `/var/folders/9p/zx47l4xx1bxcvb6dy6xnnc_40000gn/T/codex-clipboard-c85b7eb6-fc1a-434c-8c81-5edac04c8d44.png`.
- Implementation screenshot: unavailable.
- Viewport and density: source screenshots are cropped regions with unknown CSS viewport and device pixel ratio; no normalization was possible.
- State: sale pricing, discount badge, gallery thumbnail, header cart, purchase controls, and populated cart drawer.

## Full-view and focused comparison

The source crops were inspected and the corresponding implementation selectors were updated. A post-change storefront capture could not be produced because `salla theme preview` failed while requesting the preview: tag `1.0.117` already exists. Without a rendered Salla storefront, neither a full-view nor focused same-state comparison is valid.

## Findings and implementation history

- Fixed floating-point saving output by rounding the price delta before formatting and by rendering the initial delta as money.
- Recomputed and rounded the discount percentage, with a fixed LTR badge value.
- Replaced the black active-thumbnail border with the merchant accent color.
- Removed conflicting cart-summary rules, centered the counter, prevented clipping, and unified the cart icon color.
- Normalized purchase-control sizing and quantity direction; the mobile row continues to hide the wishlist control.
- Passed cart-drawer custom translations from Twig, suppressed unresolved raw keys, moved remove beside quantity, allowed two-line names, and tightened item spacing.

## Verification performed

- `npx webpack --mode production`: passed.
- `node scripts/check-theme.mjs --build`: passed with 0 errors and 0 warnings.
- CSS snapshot comparison: 126-line scoped diff covering only the affected product, header, purchase, and cart-drawer rules.
- Live Salla storefront screenshot and interaction checks: blocked by the preview tag conflict.

## Remaining blocker

A new Salla preview that accepts the current theme version is required to verify typography, spacing, colors, image treatment, copy, RTL/LTR behavior, price updates, quantity updates, removal, and checkout interactions against the supplied screenshots.

final result: blocked
