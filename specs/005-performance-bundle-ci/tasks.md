# Tasks: HDL-05 — Performance, Bundle Budget, and CI Gates

**Inputs**: `spec.md`, `design.md` (gate N/A), compact `plan.md`
**Mode**: HADEEL LEAN MODE
**Implementer**: Kimi K3 High

> **Historical policy:** T001–T013 record the original execution and are not rewritten
> away. Any raw-1MB publishing rationale in those tasks is **SUPERSEDED by Salla
> compressed-package clarification — 2026-08-10**. Corrective work begins at T014.

## Phase 1 — Measurement contract

- [X] T001 Create `src/config/bundle-budget.json` from the current post-T005F `public/` tree: `hardCapBytes` 1000000, `internalTargetBytes` 850000, `generatedFromSha`, dependency allowlist copied from today's `package.json`, registered functional media (`images/placeholder.png`, the four `images/s-empty*.png`), and one row per file with `path`, `rawBytes`, `gzip9Bytes`, `sha256`, `ceilingBytes`. The committed evidence preserves the original 33 files / 1,559,227 raw / 609,438 gzip-9 baseline; the live manifest must reproduce the current 28 files / 1,172,827 raw / 227,413 gzip-9 result (FR-001, FR-002).
- [X] T002 Create `scripts/check-bundle-budget.mjs` using Node 20 built-ins only (`node:fs`, `node:path`, `node:zlib`, `node:crypto`) with `--check` (default), `--update`, `--json`, `--report`. Enforce the hard cap, report the internal target, enforce per-file ceilings, print path/recorded/actual/overage per breach, treat gzip as informational, sort paths POSIX-order, emit 2-space JSON + trailing newline, refuse `--update` when `public/` is out of sync with a fresh build, and refuse to write any ceiling above the hard cap (FR-001, FR-002, FR-007, FR-011).
- [X] T003 Add the demo-media and dependency-policy checks to the same script (or sibling functions it exports): fail on unregistered oversized media, video containers, and demo/sample naming; fail when `package.json` dependency names leave the committed allowlist. Never write to `package.json` or `pnpm-lock.yaml` (FR-003, FR-006).
- [X] T004 Add `tests/performance-bundle-ci.test.mjs` (`node --test`): manifest matches `public/`; `--update` is byte-identical across two runs; a synthetic over-cap tree **fails**; a synthetic per-file overage fails; a gzip-smaller-but-raw-larger tree still fails; an unregistered demo asset fails; an unlisted dependency fails (FR-001, FR-003, FR-006, FR-011).
- [X] T005 Add four independent jobs to `.github/workflows/verify-production-bundle.yml` — `bundle-budget`, `demo-media`, `dependency-policy`, `bundle-tests` — with no `continue-on-error`, no label/branch skip, and no allowance above 1,000,000. Record in the workflow comment that `bundle-budget` is expected red inside the implementation branch until remediation lands, and that this transient red is intentional while a red hard cap at the final HDL-05 review/commit is not permitted (FR-007, FR-009, FR-011).
- [X] T005F Execute the owner-approved permanent font architecture decision dated 2026-08-09: delete every source `woff`/`woff2` asset (including all Thmanyah weights), remove all custom `@font-face` and bundled-font references/imports, and render with Salla `theme.font` plus a safe system fallback only. Preserve `use_theme_font` in `twilight.json` and the settings registry with its existing ID/type/default/storage as a deprecated compatibility no-op; do not delete the setting. Run a production build so `public/` is cleaned rather than hand-edited; prove no local font or font-face remains, run the HDL-04 RTL/LTR regression tests, and record the exact raw/gzip saving against 385,492 B baseline (FR-002, FR-010, FR-012).

## Phase 2 — Merchant speed (US1, P1)

- [X] T006 [US1] Classify the original 33 `public/` assets: the five removed font files are recorded as owner-approved removal, and all 28 current assets are classified used/unused from source grep plus available rendered-DOM evidence. Record the per-route theme-owned request set for home/product/collection and prove theme request count does not scale with product count where evidence exists; unavailable fresh runtime rows remain explicitly `NOT VERIFIED`. Save under `specs/005-performance-bundle-ci/evidence/` (FR-004, FR-005, FR-008).

## Phase 3 — Developer guardrail (US2, P1)

- [X] T007 [US2] Verify the gate is real: run `node scripts/check-bundle-budget.mjs` on the current post-font-removal tree and confirm it FAILS with 1,172,827 vs 1,000,000; confirm the negative tests from T004 pass; confirm no path through gzip, allowlist, exception, or workflow flag can turn that into a PASS. Record the literal output (FR-007, FR-011, FR-012).

## Phase 4 — Owner decision packet (US3, P2)

- [X] T008 [US3] Run the C1–C5 candidate spike in temporary isolated builds that are never committed, and write `evidence/css-font-candidates.md`.
  - **C1 coverage, in this order.** (a) Build an **exhaustive static inventory** of Salla tags, classes, and states referenced by `src/views/**/*.twig`, `src/assets/js/**`, Twilight components, the hook/config surface (`twilight.json`, `tailwind.config.js`), and the shipped `node_modules/@salla.sa/twilight-tailwind-theme/safe-list-css.txt`. (b) Add **rendered DOM/network samples from the routes that are actually provable** — the Arabic home, product, empty collection, and cart at 1366×768 / 390×844 / 320×800 — plus any valid historical same-source evidence (HDL-04 preview commit `7c89f9a6`, Salla draft `1209839665`, origin `localhost:8000`). (c) Classify every class into **tiers A–D** per `plan.md`, and write each unrendered surface — English/LTR, customer/account, blog, thank-you, populated collection, final preset matrices — as an explicit **NOT VERIFIED** line rather than omitting it. Report the **conservative candidate** (Tier D only) and, separately and labelled as experimental, each larger scope reaching into Tier C with its measured delta and named risk. **No option may claim runtime safety** — that claim belongs to T012.
  - **Do not** harvest or wait on preset-specific matrices (HDL-24…27) and **do not** treat English/LTR demo-store unavailability (`salla.config.languages()` → `ar` only, `/en` → Salla 410) as a blocker; both are recorded, not resolved, here.
  - C2: record the already-approved removal's measured result from T005F (raw+gzip delta, removed files/rules, Salla-font/system-fallback contract, RTL/LTR regression evidence); do not re-offer keep/subset/consolidate as options. C3: measure splitting blog/wishlist off the `app` entry; C4: record as rejected with its ~31–35 KB measurement; C5: classify.
  - Record per candidate the raw+gzip delta, the coverage tier it rests on, the risk, the reversal cost, and a verdict of **conservative-within-proven-coverage** or **experimental-with-named-risk**. Include the arithmetic showing no single lever clears the cap, re-measured absolutes replacing the 31 B-offset figures, and a plain statement of what the conservative candidate alone does and does not achieve against 1,000,000 B (FR-005, FR-009, FR-010, FR-012).
- [X] T009 [US3] Present the packet and obtain a recorded owner **product decision** on the accepted Safelist scope: the conservative candidate or a named experimental scope, with the accepted risk level stated. The permanent no-local-font decision is already recorded and executed in T005F; do not reopen it. If the owner accepts an experimental scope, record with it the revalidation obligation passed to HDL-24…27 and HDL-29. **No destructive Safelist/CSS change before this decision is recorded** (FR-010). Owner accepted `C1-LAUNCH-CORE-FULL-LOYALTY + C5-LOSSLESS-MEDIA — HIGH RISK` on 2026-08-10; exact artifacts, 997,742 B projection, actual 997,743 B result, 2,257 B measured margin, and T012/HDL-23/HDL-24…27/HDL-29 rollback obligations are recorded in the evidence packet and tracked with stable unchecked IDs and explicit owners in `follow-up-register.md`.

## Phase 5 — Approved remediation

- [X] T010 Execute the remaining approved reductions in impact order, one focused change set each — accepted C1, then accepted C5. C3 is not executed because the measured split increases total `public/` by 3,692 B and was rejected in T008. Use `node scripts/css-snapshot.mjs` before/after diff, `npx webpack --mode production`, `node scripts/check-bundle-budget.mjs --update`, and zero visual diff against the approved HDL-02/HDL-04 screens. C2 is the separately authorized T005F change. Each reduction must be **revertible on its own**: keep the pre-change safelist/config input under `evidence/` so the prior build is exactly reproducible, and touch nothing outside that candidate. Execution proceeds on the owner's recorded Safelist decision even though runtime safety is not yet proven — T012 is the gate that confirms or reverts it. Add no override layer of any kind (FR-002, FR-009, FR-010). Executed result: 997,743 B raw / 196,388 B gzip-9 / 28 files; hard cap passes by 2,257 B; C5 CSS diff empty; details and ratchet reason in `evidence/t010-execution.md`.

## Final phase — Gates, evidence, and review

- [X] T011 Run `node --test tests/performance-bundle-ci.test.mjs`, `node scripts/check-theme.mjs --json`, `npx webpack --mode production`, `node scripts/check-theme.mjs --build --max-errors=0`, `node scripts/check-bundle-budget.mjs`, and `git diff --check`; save literal outputs with command, date, and SHA under `evidence/` (FR-007, FR-011, FR-012). Captured at `2026-08-10T07:25:19+03:00` in `evidence/t011-final-gates.md`: HDL-05 29/29, production build pass with inherited warnings, guard/build-sync 0/0, bundle budget pass at 997,743 B, diff-check clean.
- [X] T012 Retain the captured home/product/collection, Arabic/mobile, English/LTR, request,
  transfer, and product-count evidence with honest `NOT VERIFIED` rows. The C1-specific
  before/after proof and revert blocker are **SUPERSEDED by the exact pre-C1 Safelist
  restoration — 2026-08-10** and no longer hold HDL-05 hostage. Runtime performance stays
  independent from package compliance (FR-004, FR-008, FR-012).
- [X] T013 Historical independent review executed and recorded `STATUS: FAIL` / `BLOCKERS: 2`.
  Its C1/raw-cap closure contract is superseded; the corrected implementation receives a
  new independent review at T025 rather than falsifying this historical result.

## Corrective phase — compressed package source of truth

- [X] T014 Correct Constitution v1.0.1 and root/agent guidance after the owner-approved
  Salla Support clarification; separate package compliance, build telemetry, and runtime.
- [X] T015 Restore the exact pre-C1 Tailwind/Safelist configuration from preserved T010
  evidence; remove only the C1-owned reduced Safelist; prove config/CSS hashes and restored
  Cart/Loyalty/Salla/Twilight states.
- [X] T016 Audit C5 independently and keep it only because decoded pixels, SVG appearance,
  accessible names, runtime references, and source/build/evidence hashes remain safe.
- [X] T017 Migrate `bundle-budget.json` and `check-bundle-budget.mjs` to the deterministic
  compressed `sallaPackageEstimate`, derived 95% target, repository diagnostic, package
  manifest drift, and raw/gzip/per-file telemetry.
- [X] T018 Correct HDL-05 regression tests for PASS/WARN/FAIL boundaries, raw-over-1MB PASS,
  compressed-over-cap FAIL, deterministic ZIP, contamination exclusions, drift, media,
  dependencies, full Safelist, C5, fonts, and build sync.
- [X] T019 Correct CI so `package-budget` gates the compressed distributable estimate and
  reports target/headroom while the other HDL-05 jobs remain independent.
- [X] T020 Correct Spec, Plan, Tasks, and Design without erasing historical measurements;
  run a fresh Constitution Check against v1.0.1.
- [X] T021 Supersede C1-only T012 and HDL-23/24/25/26/27/29 revalidation/rollback debt;
  preserve genuine runtime, C5-media, Lighthouse/CWV, and inherited-overflow risks.
- [X] T022 Synchronize roadmap, Spec index, runtime/night-run state, combined Spec copy,
  follow-up register, and project checkpoint status after validation.
- [X] T023 Rebuild production assets and run the complete corrective gate set, including
  package determinism, RTL/LTR, theme guard/build sync, media, dependencies, stale-rule scan,
  font absence, `git diff --check`, and post-change rendered evidence or explicit NOT VERIFIED.
- [X] T024 Record concise corrective evidence with old/new measurements, C1/C5/T005F
  decisions, package uncertainty, validation output, and affected source-of-truth files.
- [X] T025 Run an independent corrective review across policy, Specs, implementation,
  tests, CI, evidence integrity, downstream cleanup, and stale-rule scan until
  `STATUS: PASS` / `BLOCKERS: 0`.

## Dependencies and independent checks

- T001 → T002 → T003 → T004 → T005. T005F is independently authorized and may run during Phase 1; it must complete before T008 records C2. T006 is independent of the checker and can run in parallel with Phase 1.
- T007 needs T002/T004/T005. T008 needs T006's asset classification only — it does **not** depend on HDL-24…27 preset matrices, on English/LTR demo-store availability, or on any route the demo store does not serve. T009 needs T008. T010 needs T009.
- Historical dependency: T011 followed T010; T012/T013 were executed under the old C1
  contract. Corrective dependency: T014 → T015–T021 → T022–T024 → T025.
- **US1** passes independently when the three routes have recorded per-route bytes and request sets for every language the demo store actually serves, the unserved language is recorded as `NOT VERIFIED` with its reason and routed to HDL-07, and no per-product request pattern exists.
- **US2** passes independently when a breach fails CI with an actionable message and no bypass exists — proven by a negative test, not by assertion.
- **US3** passes independently when every candidate carries a measured delta, its coverage tier, a risk, a reversal cost, and a conservative-or-experimental verdict; when every unrendered surface is written as `NOT VERIFIED` by name; when no candidate claims runtime safety before T012; and when no destructive change preceded the owner's recorded decision.
- No task edits `package.json`, `pnpm-lock.yaml`, another Spec, `.vscode/settings.json`, unrelated untracked files, or `public/` by hand. No task commits or pushes.

## FR coverage

| FR | Tasks |
|---|---|
| FR-001 | T001, T002, T004 |
| FR-002 | T001, T002, T005F, T010 |
| FR-003 | T003, T004 |
| FR-004 | T006 |
| FR-005 | T006, T008 |
| FR-006 | T003, T004 |
| FR-007 | T002, T005, T007, T011, T013 |
| FR-008 | T006, T012 |
| FR-009 | T005, T008, T010 |
| FR-010 | T005F, T008, T009, T010, T012 |
| FR-011 | T002, T004, T005, T007, T011 |
| FR-012 | T005F, T007, T008, T011, T012 |
