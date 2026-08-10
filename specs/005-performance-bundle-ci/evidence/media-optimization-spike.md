# T009 — C5 Lossless Media Optimization Spike

> **CURRENT C5 evidence / SUPERSEDED size rationale.** Lossless and accessibility
> findings remain active; raw-cap arithmetic below is historical only.

- **Recorded:** 2026-08-10
- **Primary branch / HEAD:** `codex/hdl-05-performance-bundle-ci` / `eb40134dcda5c147ff03a048ad05b3e11ba8a15b`
- **Primary post-font baseline:** 28 files / **1,172,827 raw** / **227,413 gzip-9**.
- **Isolation:** `/tmp/hdl05-media-spike.XYDeSh`; no primary source asset, generated `public/` asset, config, branch, index, commit, or remote was changed.
- **Safety claim:** local codec/render evidence only. Storefront URL resolution, network behavior, and Salla-rendered visual safety remain `NOT VERIFIED` until T012.

## Candidate definition

**Name:** `C5-LOSSLESS-MEDIA`

1. Convert the opaque `src/assets/images/placeholder.png` to lossless WebP and update every theme-owned literal reference from `images/placeholder.png` to `images/placeholder.webp`.
2. Run the five shipped SVGs through the committed accessibility-preserving SVGO configuration.
3. Preserve payment-icon `role="img"`, `aria-labelledby`, and matching `<title id>` nodes.
4. Do not delete any image, change photographic/product media, add a dependency, or add a runtime request.

The exact proposed outputs and SVGO configuration are preserved under `evidence/t009-media/`. They are evidence inputs only and are not wired into `src/` or `public/` before the T009 owner decision.

## Measured raw-byte result

| Asset | Before | Candidate | Saving |
|---|---:|---:|---:|
| `placeholder.png` → lossless `placeholder.webp` | 20,664 | 4,310 | **16,354** |
| `check.svg` | 824 | 459 | 365 |
| `delivery-bro.svg` | 7,573 | 3,702 | 3,871 |
| `payment_icons/mispay.svg` | 5,796 | 5,775 | 21 |
| `payment_icons/tabby.svg` | 2,625 | 1,688 | 937 |
| `payment_icons/tamara.svg` | 652 | 635 | 17 |
| **Total** | **38,134** | **16,569** | **21,565** |

The four tiny `s-empty*.png` files are unchanged. gzip is not used as a pass gate and was not projected for this unexecuted source candidate.

## Lossless and render-equivalence evidence

### Placeholder

- Original SHA-256: `495a4948585c5da0579f1b64574c32d8cf99ea67881688442927c8fdff07eda9`.
- Candidate SHA-256: `401e04acb08ab1309aacd5977e8b2e5065f23e91966d84f3a2817b6bc0a96bd4`.
- Both decoders produce the exact RGBA MD5 `49a075f8c5a5ed03958ebeeb4954f459`.
- The original contains an alpha channel, but every pixel is opaque; the lossless WebP decoder therefore reports identical RGBA pixels without a meaningful alpha payload.

### SVGs at intrinsic display size

Quick Look rendered the original and accessibility-preserving candidate at 16 px (`check`), 150 px (`delivery-bro`), and 38 px (payment icons). FFmpeg compared decoded RGBA frames:

| Asset | RGBA result | PSNR average | SSIM all |
|---|---|---:|---:|
| `check.svg` | exact MD5 match | ∞ | 1.000000 |
| `delivery-bro.svg` | sub-pixel encoder difference | 67.039895 dB | 0.999995 |
| `mispay.svg` | exact MD5 match | ∞ | 1.000000 |
| `tabby.svg` | sub-pixel encoder difference | 77.965563 dB | 1.000000 |
| `tamara.svg` | exact MD5 match | ∞ | 1.000000 |

The two non-identical pairs were also inspected visually from `evidence/t009-media/rendered/`; no visible difference was observed at the measured intrinsic sizes.

### Accessibility contract

All optimized SVGs are valid XML. Each payment icon retains:

- `role="img"`;
- its original `aria-labelledby` value;
- a `<title>` whose `id` exactly matches that reference.

The default SVGO result that removed these nodes was rejected and is not included in the candidate or its arithmetic.

## Combined cap path

The 1,630-line `launch-core` Safelist scope keeps the complete 284-row `s-loyalty` family but omits supporting-route family expansion. It measures **−153,520 B**, leaving the authoritative primary total at **1,019,307 B**. Combining that exact CSS delta with `C5-LOSSLESS-MEDIA` gives:

The spike projected `1,172,827 − 153,520 − 21,565 = 997,742 B`. Execution added one byte to `add-product-toast.js` because `.webp` is one character longer than `.png`, so the measured result is **997,743 B**.

This clears the 1,000,000 B hard cap by only **2,257 B** and remains **147,743 B above** the 850,000 B internal target. Pure media saving remains 21,565 B; net built saving is 21,564 B.

## Risk and required revalidation

This combination is functionally safer than removing half of the Loyalty family, but it remains **experimental / high risk** because:

1. the Safelist scope can miss Salla-injected states on supporting routes;
2. the placeholder file extension and all literal references must change together;
3. live Salla rendering and network resolution are not proven by local decoder tests;
4. a 2,257-byte measured margin leaves almost no growth room for later Specs.

If selected, T010 must keep the CSS and media reductions independently revertible. T012 must verify Home, Product, Collection, Cart, every rendered placeholder occurrence, the thank-you delivery illustration, all payment icons, DOM classes, accessible names, network 200 responses, and byte totals. HDL-23 owns supporting-route revalidation; HDL-24…27 own preset revalidation; HDL-29 is the final release gate. Any regression reverts the owning reduction rather than adding an override.
