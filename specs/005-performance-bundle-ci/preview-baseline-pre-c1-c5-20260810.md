# Preview-only baseline — HDL-05 PRE-C1/C5 (2026-08-10)

**This file belongs to a temporary, isolated preview branch. It is not part of the
primary tree and must never be merged back as a remediation claim.**

- **Branch:** `codex/preview-hdl-05-baseline-20260810`
- **Worktree:** `.worktrees/preview-hdl-05-baseline-20260810`
- **Base (start point):** `a9e9ab0c11eeafe1bf0024b8aad2342eef4ec3b9`
  (`codex/preview-hdl-05-20260810`, the post-C1/C5 "after" preview)
- **Historical file source:** `eb40134dcda5c147ff03a048ad05b3e11ba8a15b`
  (parent/base commit), used **only** for C1/C5-owned files.
- **Intent:** reproduce the post-font-removal, pre-C1/C5 storefront baseline so the
  "before" side of the T010 C1+C5 reduction can be previewed and measured. Only
  T010 C1 (launch-core Safelist) and T010 C5 (lossless media) are reversed.
  The permanent zero-local-font architecture (T005F), all HDL-04 behavior, the
  bundle checker/guard/remediation tooling, and every other current change are kept.

## Ownership evidence

C1/C5 ownership was taken from the primary-tree evidence
`specs/005-performance-bundle-ci/evidence/t010-execution.md` and verified against
`git diff eb40134d..a9e9ab0c` before any change:

- **C1-owned:** `tailwind.config.js` safelist content entry; `src/config/salla-safelist.txt`.
- **C5-owned:** `placeholder.png`/`placeholder.webp` media swap, the five optimized
  SVGs, and the five theme-owned `.png` → `.webp` references.
- The `settings-registry.json` description change in the same range is T005F
  (font deprecation), **not** C5, and was deliberately kept.

## Exact restored paths

Restored byte-for-byte from `eb40134d`:

- `tailwind.config.js` (content source back to the full package Safelist
  `node_modules/@salla.sa/twilight-tailwind-theme/safe-list-css.txt`, 2,494 lines)
- `src/assets/images/placeholder.png` (20,664 B original PNG)
- `src/assets/images/check.svg`
- `src/assets/images/delivery-bro.svg`
- `src/assets/images/payment_icons/mispay.svg`
- `src/assets/images/payment_icons/tabby.svg`
- `src/assets/images/payment_icons/tamara.svg`
- `src/views/layouts/master.twig` (`theme.settings.set('placeholder', 'images/placeholder.png')`)
- `src/views/components/home/main-links.twig`
- `src/views/pages/blog/single.twig`
- `src/views/pages/customer/orders/single.twig`
- `src/assets/js/partials/add-product-toast.js`

Removed (C1/C5 artifacts, absent from a clean production build):

- `src/config/salla-safelist.txt` (C1 launch-core Safelist)
- `src/assets/images/placeholder.webp` and, via `output.clean` rebuild,
  `public/images/placeholder.webp` (C5 WebP artifact)

Not restored (permanent architecture): no `fonts.scss`, no `thmanyahsans-*.woff2`
font files, no `@font-face` anywhere.

## Expected pre-C1/C5 metrics (from `evidence/t010-execution.md`, post-font baseline row)

| Metric | Expected baseline |
|---|---:|
| Files in `public/` | 28 |
| Raw total | 1,172,827 B |
| gzip-9 total | 227,413 B |
| Hard-cap (1,000,000 B) margin | −172,827 B |

## Measured on this branch (production build, 2026-08-10)

| Metric | Expected (evidence) | Measured |
|---|---:|---:|
| Files in `public/` | 28 | 28 |
| Raw total | 1,172,827 B | 1,172,858 B |
| gzip-9 total | 227,413 B | 227,626 B |
| Hard-cap margin | −172,827 B | **−172,858 B (gate RED, as expected)** |

The measured gzip-9 figure is the authoritative deterministic number printed by
`node scripts/check-bundle-budget.mjs --budget` (content-encoded, no per-file
filename headers) — **not** a naive `gzip -c` sum, which is not the project
contract. The drift against the recorded evidence is **+31 B raw / +213 B gzip-9**;
the +213 B gzip offset matches the already-recorded after-preview
preview-path/environment offset (`preview-environment-offset.md`), and the raw
offset is inherited from the `a9e9ab0c` mirror commit's own rebuild (its committed
`public/` is itself 31 B larger than the T010 record), not from this reversal:
byte-level comparison against the after-preview build shows every file untouched by
C1/C5 is byte-identical, `app.css` is exactly the recorded pre-C1 802,202 B, and
`add-product-toast.js` shrinks by exactly the documented 1 B for the
`.webp` → `.png` literal.

## Expected gate status

- The dedicated **hard-cap budget gate is expected to FAIL** on this historical
  baseline (raw total exceeds the 1,000,000 B cap). **This failure is the evidence
  the baseline exists to produce — it is not a code regression.** The 1,000,000 B
  cap in `scripts/check-bundle-budget.mjs` and the committed
  `src/config/bundle-budget.json` manifest are intentionally left untouched.
- The functional-media registration gate and the T010 C1/C5 contract tests in
  `tests/performance-bundle-ci.test.mjs` also legitimately fail on this baseline,
  because they assert the C1/C5 end state that this branch deliberately reverses.
- HDL-04 localization/RTL/accessibility and settings tests are expected to pass;
  HDL-04 behavior is unchanged.
