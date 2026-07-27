# Product page design QA

## Scope

Implementation of the selected Kalles product-page patterns in the Salla product template:

- Old price and saved amount
- Quantity and purchase actions above the fold
- Share and wishlist actions beside purchase
- Size guide
- Ask about the product

## Evidence

- Reference: `/var/folders/9p/zx47l4xx1bxcvb6dy6xnnc_40000gn/T/codex-clipboard-476d9ea1-ec12-4ed9-ae78-79032cda75ff.png`
- Live Salla screenshot: `/tmp/salla-product-final-desktop-149.png`
- Side-by-side comparison: `/tmp/salla-product-design-qa-comparison-149.png`
- Verified viewport: 1680 × 770 at device pixel ratio 2
- Direction and typeface: RTL with `"Thmanyah Sans", sans-serif`

## Comparison

### Full view

- The live Salla page preserves its real header, breadcrumb, product content, images, and native storefront behavior.
- The product media and information remain in the same two-column relationship as the reference.
- Product title, price, compact description, stock state, and the purchase panel fit in the initial viewport.

### Purchase region

- Purchase actions are above the fold.
- The native Add Product component remains responsible for Add to Cart and Quick Buy.
- Share and wishlist use Salla native web components and sit beside the purchase actions.
- A third-party WhatsApp button injected into the purchase row is hidden there to prevent crowding; the dedicated Ask about the product action remains below the row.
- The tested product has merchant-hidden quantity, so the quantity control correctly remains conditional. Eligible non-booking products render the native `salla-quantity-input`.

### Conditional product data

- Old price and saved amount render only when `product.is_on_sale` is true.
- The saved amount is recalculated after product-option price changes.
- Size guide renders only when `product.has_size_guide` is true and opens through Salla's size-guide event and component.
- Ask about the product uses store WhatsApp when configured and falls back to store email.

## Visual quality checks

- No horizontal overflow was found at the verified live desktop viewport.
- Purchase controls have consistent pill geometry, alignment, and spacing.
- The accent red, muted text, borders, stock green, and saving green follow the reference hierarchy while remaining compatible with the store palette.
- Product media uses the merchant's real images without placeholder or generated assets.
- Long product copy is shortened above the fold and linked to the full details section.

## Findings resolved

1. Purchase controls originally appeared too low because product metadata preceded the form. The form was moved above secondary metadata.
2. Share and wishlist originally appeared in a separate row. They were integrated with the purchase controls.
3. Full product description pushed conversion actions below the fold. A compact summary now appears above the fold.
4. A storefront app injected an extra WhatsApp CTA into the purchase tools and crowded the native buttons. The duplicate injected action is now suppressed in that row.

final result: passed
