# HDL-05 Follow-up Task Register

- **Created:** 2026-08-10 during the original HDL-05 review.
- **Corrected:** 2026-08-10 after Salla Support confirmed compressed-package sizing.
- **Rule:** stable historical IDs remain visible. C1-only obligations are checked as
  `SUPERSEDED`, not silently deleted. Genuine runtime/media risks remain open under their
  owning Specs.

## Register

- [ ] **HDL-18/HDL-19 — Inherited product-route overflow.**
  Owner: Specs `018-product-page-layouts` / `019-product-media-gallery`. The captured
  Arabic mobile product route rendered an inherited 11 px overflow. HDL-05 does not fix
  or conceal it; the owning Specs verify and repair it before the HDL-29 launch gate.

- [x] **HDL-23 — Experimental C1 supporting-route Safelist revalidation. — SUPERSEDED**
  The exact pre-C1 full Salla/Twilight Safelist was restored on 2026-08-10. Supporting,
  account, order, wallet, notification, Cart, and Loyalty selectors are no longer omitted
  by C1, so its revalidation/revert obligation is discharged. Historical evidence remains.

- [ ] **HDL-23-MEDIA — Integrated C5 functional-media states.**
  Owner: Spec `023-supporting-pages`. When the routes become available, verify the
  thank-you `delivery-bro.svg`, integrated `placeholder.webp` lazy-load fallback, and the
  platform-generated route-relative `images/s-empty.png` request. These are genuine
  runtime/media checks, not compressed-package or Safelist blockers.

- [x] **HDL-24 — Preset Safelist revalidation (luxury). — SUPERSEDED**
  C1 is no longer shipped; the full package Safelist is restored. Normal preset visual
  verification remains owned by HDL-24 but carries no HDL-05 C1 rollback debt.

- [x] **HDL-25 — Preset Safelist revalidation (modern). — SUPERSEDED**
  Same correction as HDL-24.

- [x] **HDL-26 — Preset Safelist revalidation (minimal). — SUPERSEDED**
  Same correction as HDL-24.

- [x] **HDL-27 — Preset Safelist revalidation (practical-digital). — SUPERSEDED**
  Same correction as HDL-24.

- [ ] **HDL-29 — Independent runtime release gate.**
  Owner: Spec `029-release-hardening`. Run the full throttled Lighthouse/Core Web Vitals
  pass and close genuine route/runtime risks. Publishing compliance is checked separately
  by the authoritative compressed-package checker. The former raw-850,000 target,
  raw-1MB exception, authenticated-Loyalty C1 proof, and final experimental-Safelist
  rollback gate are `SUPERSEDED`. If Salla later exposes its exact server package manifest,
  replace the documented estimate allowlist through a focused HDL-05 contract update.

## Rules

- Checked `SUPERSEDED` rows are historical decisions, not claims that their old validation ran.
- Open rows are resolved only by the owning Spec with post-change evidence.
- HDL-28 has no HDL-05 obligation and remains intentionally absent.
