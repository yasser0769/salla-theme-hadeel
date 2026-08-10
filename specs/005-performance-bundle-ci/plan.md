# Implementation Plan: HDL-05 — Corrected Performance, Package Budget, and CI Gates

**Branch**: `codex/hdl-05-performance-bundle-ci`
**Date**: 2026-08-10
**Spec**: `specs/005-performance-bundle-ci/spec.md`
**Design**: N/A — infrastructure only; any rendered verification uses a Salla storefront
**Correction authority**: owner decision after direct clarification from Salla Support

## Summary

Migrate HDL-05 from the superseded `sum(rawBytes(public/**))` publishing model to
Salla's confirmed compressed distributable-theme-package model. Restore the exact
pre-C1 Salla/Twilight Safelist, retain the separately approved no-local-font
architecture, retain C5 because its media changes are lossless and accessibility-safe,
and keep raw/gzip/per-file/runtime measurements as independent engineering telemetry.

Historical T001–T011 execution and evidence remain intact. They describe what happened,
but their raw-1MB publishing verdicts are explicitly `SUPERSEDED`.

## Authoritative contract

The authority chain is:

1. Constitution Principle V: durable separation of publishing compliance and runtime performance.
2. HDL-05 Spec: product/engineering requirements.
3. `src/config/bundle-budget.json`: numeric hard cap, target percentage, package allowlist, manifests.
4. `scripts/check-bundle-budget.mjs`: deterministic enforcement and reporting.
5. CI: invokes the checker without copying or redefining the limit.

The checker derives the internal target at runtime as the configured percentage of the
configured hard cap. Raw `public/`, gzip-9, compressed production assets, and per-file
growth are reported independently and do not determine Salla publishing compliance.

## Deterministic package definition

Salla's exact server-side file manifest is not locally exposed. The checker therefore
publishes two explicitly different measurements.

### `sallaPackageEstimate`

An allowlisted, deterministic ZIP containing the files reasonably established as the
Twilight theme artifact:

- root build/runtime contracts: `package.json`, `pnpm-lock.yaml`, PostCSS, Tailwind,
  Twilight, and Webpack configuration;
- production `public/**`;
- build inputs under `src/assets/**`;
- publish-time locales under `src/locales/**`;
- Twig templates under `src/views/**`.

It excludes engineering-only `src/config/**`, including the bundle contract itself, to
avoid self-reference and because those files are not part of the upstream Twilight
theme structure. It also excludes `.DS_Store`, logs, and prior ZIPs. Each included file
has a committed path, raw byte count, and SHA-256. ZIP entries are POSIX-sorted with
fixed timestamps, permissions, compression level, and metadata.

### `repositoryArchiveDiagnostic`

A broad deterministic repository ZIP used only to diagnose repository weight. It may
include Specs, evidence, tests, and project documentation, while excluding `.git/`,
`node_modules/`, worktrees, logs, caches, coverage, `.DS_Store`, and previous ZIPs. It is
never displayed as Salla theme publishing size.

## Gate architecture

| Concern | Measurement | Result |
|---|---|---|
| Salla publishing compliance | compressed `sallaPackageEstimate` | Within internal target: PASS; above target but within hard cap: PASS WITH HEADROOM WARNING; above hard cap: FAIL |
| Package/build drift | exact allowlisted paths + SHA-256 and exact `public/` rows | FAIL until a verified build and `--update` |
| Raw build telemetry | raw `public/`, gzip-9, deterministic public ZIP, per-file ceilings | INFO/WARN only |
| Dependency policy | package dependency names against committed allowlist | FAIL on unapproved addition |
| Media policy | fonts, video/demo/sample, oversized unregistered media | FAIL |
| Runtime performance | requests, transferred bytes, product-count scaling, rendering, Lighthouse/CWV | Independent evidence gate |

The package checker prints raw package bytes, compressed package bytes, hard cap,
derived internal target, usage percentage, remaining target headroom, remaining hard-cap
headroom, and verdict. Raw `public/ > 1 MB` is an explicit positive regression witness:
it must not falsely fail publishing compliance when the compressed package passes.

## Safelist restoration

T010 contained two logical changes and is repaired surgically:

- **C1**: restore `tailwind.config.js` byte-for-byte from
  `evidence/t010-c1-pre-change-tailwind.config.js` and remove the C1-owned
  `src/config/salla-safelist.txt`.
- Verify the restored config SHA-256, installed full Safelist SHA-256, normalized CSS
  snapshot, representative Cart/Loyalty/notification/order selectors, and production build.
- Do not create a new curated Safelist and do not run another deletion-tier exercise.

The exact pre-C1 source is independently corroborated by the preserved evidence and
preview-baseline commit `86c53092`. The restored CSS snapshot must match
`evidence/t010-c1-before.css` exactly.

## T005F font architecture

Retain the permanent owner-approved decision:

- no `.woff`/`.woff2` or other theme-owned font files;
- no theme-owned `@font-face`;
- Salla `theme.font` through `--font-main` plus system fallback;
- `use_theme_font` retained as the existing compatibility no-op.

The corrected package model does not reopen local-font architecture.

## C5 decision

Keep C5. Its placeholder WebP is decoded-pixel-identical to the prior PNG; the five SVG
changes preserve appearance and payment-icon accessible names; CSS is unchanged; source,
evidence, and production hashes are pinned by tests. No functional media was removed.

## CI architecture

Four independent jobs remain:

1. `package-budget`: compressed package compliance, package drift, and build telemetry.
2. `demo-media`: functional-media and forbidden-media policy.
3. `dependency-policy`: committed dependency allowlist.
4. `bundle-tests`: positive/negative/determinism/contamination regression suite.

The package job has no `continue-on-error` or branch skip. A raw/per-file warning does
not fail it. A compressed package above the Salla hard cap does.

## Runtime performance contract

Package compliance does not measure storefront runtime quality. Retain useful T012
evidence for home, product, collection, Arabic mobile, and English desktop; retain the
product-count request-scaling test; record unavailable Lighthouse/CWV or authenticated
routes as `NOT VERIFIED`. Remove only C1-specific before/after proof and rollback debt,
because the experimental Safelist is no longer shipped.

Future feature plans still state effects on requests, transfer, rendering, and
interaction. No per-product request scaling is permitted where data can be batched or
included.

## Rollback and recovery

- C1 restoration is recoverable from Git and its historical evidence but must not be
  re-applied as a size fix under the superseded model.
- C5 remains independently reversible if a genuine media regression is later proven.
- T005F remains an independent architectural decision and is not part of size-model rollback.
- Package generation writes no repository ZIP by default; it measures deterministic
  bytes in memory and updates only the committed manifest after build-sync passes.
- If Salla later exposes an exact server manifest, replace the estimate allowlist through
  a focused contract migration and retain the prior measurement as historical evidence.

## Fresh Constitution Check — v1.0.1

- [x] Publishing compliance uses Salla's confirmed compressed package method.
- [x] Internal target is derived as 95% of the current configured compressed hard cap.
- [x] Raw/gzip/CSS/JS/network/runtime metrics remain independent.
- [x] C1 Safelist coverage is restored exactly; no supported state is removed for raw size.
- [x] T005F no-local-font architecture remains intact.
- [x] C5 remains only after lossless/accessibility evidence is rechecked.
- [x] Package allowlist and uncertainty are explicit; repository ZIP is diagnostic only.
- [x] CI, tests, and manifest share one numeric source of truth.
- [x] Bundle compliance and runtime performance remain independent release gates.
- [x] No dependency, setting, override layer, commit, push, or unrelated cleanup is introduced.

**Constitution Check result: PASS.**
