# Final-Review Remediation — HDL-05

> **HISTORICAL — old C1/raw-cap contract.** Current corrective review uses the compressed
> package model and the restored full Safelist.

- **Recorded:** 2026-08-10
- **Branch / HEAD:** `codex/hdl-05-performance-bundle-ci` / `eb40134dcda5c147ff03a048ad05b3e11ba8a15b`
  (HDL-05 changes remain uncommitted; no commit, stage, push, preview, or remote action was taken
  during remediation)
- **Implementer:** Kimi K3 High
- **Review remediated:** independent GPT-5.6 Sol High final review, `STATUS: FAIL`, seven blockers.
- **Preserved invariants:** C1 and C5 exact artifacts (SHA-256s unchanged), the 997,743 B primary
  production result, and every saved capture under `evidence/live/draft-1233213199/` are untouched.
  No dependency, setting, `package.json`/lockfile, `AGENTS.md`, or `.vscode/settings.json` change.

## Fixed blockers (repository artifacts, no new Salla capture required)

- **Blocker 3 — full-public build-sync enforcement.** `scripts/check-theme.mjs --build` now compares
  the complete fresh webpack output against the committed `public/` tree recursively: every file by
  exact relative path and sha256 — images, `*.LICENSE.txt`, nested files, missing files, and stale
  extra files (previously only top-level non-licence JS/CSS were compared). The comparator is the
  pure exported `diffBuildTrees()`; `check-theme.mjs` is main-guarded so tests can import it without
  running the guard. Six focused tests in `tests/performance-bundle-ci.test.mjs` prove identical
  trees pass, stale/drifted nested assets are detected, extra nested assets are detected, missing and
  drifted licence files are detected, and `--update` refuses to ratchet a tree that fails the
  freshness gate (with a positive control that a clean tree ratchets). `public/` itself was never
  hand-edited; synchronization is via `npx webpack --mode production` only.
- **Blocker 4 — exhaustive C1 inventory basis shipped.** The pre-decision inventory script and final
  results, previously only in the ignored `.worktrees/spike-hdl-05-bundle`, are now tracked at
  `evidence/t009-spike/hdl05-tier-inventory.mjs` and `evidence/t009-spike/hdl05-spike-results.md`
  The results document remains a byte-identical copy of the worktree original (sha256 `709f520a…`).
  The script, however, is **no longer byte-identical**: on 2026-08-10 it was patched in place
  (original sha256 `c30ba199…`, current sha256
  `51d372bd561c28106c95d1620eded41bda22799f630be072a4a3d7f39b441420`) because the copied script
  derived its ROOT from its own evidence directory and exited 1 looking for `node_modules` there.
  It now resolves the repository root four levels up from its tracked location and writes its two
  generated safelist outputs (`hdl05-safe-list-conservative.txt`, `hdl05-safe-list-tierA.txt`) next
  to itself inside `evidence/t009-spike/` instead of at ROOT. The corpus definition, tier classifier,
  and printed counts are unchanged and were re-verified by running the patched script from the
  repository root: 2,494 safelist tokens, 2,358 corpus files, Tier A 2,472 / Tier B 0 / Tier C 5 /
  Tier D 17 (outputs 2,477 and 2,472 lines). A regression test in
  `tests/performance-bundle-ci.test.mjs` ("T009 spike inventory script is reproducible from its
  tracked location") locks this behavior. `evidence/css-font-candidates.md`,
  `evidence/deeper-safelist-spike.md`, and `plan.md` reference the tracked artifacts, making the
  deliverable self-contained. No unrelated worktree files copied.
- **Blocker 5 — tracked follow-up task register.** `../follow-up-register.md` created with stable
  unchecked IDs and explicit owners: HDL-18/HDL-19 (inherited product-route overflow, owners Specs
  018/019), HDL-23 (supporting/customer/account/Loyalty routes, the integrated thank-you
  `delivery-bro.svg` and `placeholder.webp` fallback states, and the `s-empty` path risk, owner
  Spec 023), HDL-24…27 (per-preset Safelist revalidation, owners Specs 024/025/026/027), HDL-29
  (internal-target exception removal or renewed explicit release exception, full Lighthouse/CWV with
  recorded throttling, Salla upload accounting, authenticated Loyalty, final Safelist release gate,
  and the remaining same-collection/before-after network capture gaps; owner Spec 029). `plan.md`
  (both the routing section and the Constitution Exception), `tasks.md` (T009),
  `evidence/t010-execution.md`, and `evidence/t012-runtime-evidence.md` now reference the register.
  No future-Spec file was edited (tasks.md forbids other-Spec edits).
- **Blocker 7 — traceability contradictions.** `evidence/t012-runtime-evidence.md` now carries a
  traceability appendix distinguishing saved JSON artifacts from observed-only session summaries; the
  Arabic-home request-table row (no saved network JSON) is relabelled observed-only rather than
  asserted as captured evidence; English product/collection/cart JSONs are labelled state-only; the
  missing network rows (English product/collection/cart, Arabic home, all pre-change request logs)
  are explicitly NOT VERIFIED. No Arabic-home JSON or pre-change request logs were invented.

## Bounded blocker-6 documentation correction

- The workflow comment baseline in `.github/workflows/verify-production-bundle.yml` is corrected
  from 1,172,885 to the measured post-T005F **1,172,827 B**, and the comment now states the T010
  C1+C5 remediation turned the `bundle-budget` job green at 997,743 B (2,257 B margin). The t012
  preview-offset provenance is corrected: `preview-environment-offset.md` is a **preview-branch-only**
  note at `specs/005-performance-bundle-ci/preview-environment-offset.md` in preview commit
  `a9e9ab0c11eeafe1bf0024b8aad2342eef4ec3b9` (branch `codex/preview-hdl-05-20260810`), **not present
  in the primary tree**.

## Remaining blockers (require a new Salla preview capture — NOT fixed here)

- **Blocker 1 — strict same-collection two-count comparison.** The confirmed store exposed only the
  five-card collection state, so theme request-count invariance across two product counts is
  unproven. It can only be discharged by a new rendered Salla preview capture; it was not
  fabricated, relabelled, or marked verified.
- **Blocker 2 — before/after bilingual network evidence.** No valid pre-change request logs exist
  (historical HDL-04 evidence has screenshots only), and no saved Arabic-home network JSON exists —
  the post-change Arabic-home row is observed-only. A same-path/same-device before/after capture in
  both languages requires a new preview session and was not manufactured here.
- **T012 is reopened in `tasks.md`** and stays incomplete until that capture proves both; T013
  remains incomplete. The existing 2026-08-10 07:39–07:48 +03 capture is preserved as-is in
  `evidence/t012-runtime-evidence.md` with its NOT VERIFIED rows intact.

### Baseline capture attempt — 2026-08-10 12:16–12:22 +03

A proven pre-C1/C5 worktree (`codex/preview-hdl-05-baseline-20260810` at
`86c53092106d6771be5d20d2e4b00624c05179d3`) was captured on owner-confirmed draft `77842079`.
The remote draft first served the post-change CSS and the CLI created the wrong draft; both are
recorded as `SALLA PREVIEW SYNC FAILURE`. Rebinding the confirmed draft to the baseline worktree's
local server then proved `salla-draft-77842079` plus six localhost assets and saved a genuine Arabic
home baseline request set under `evidence/live/draft-77842079-baseline/`.

The attempt does not close either blocker. The confirmed store's `/en/` route rendered
`lang=ar`, `dir=rtl`, while the prior post-change bilingual evidence belongs to another store/draft;
no cross-store comparison is claimed. Its largest visible collection exposed 11 products and no
pagination/load-more state, so a second same-collection count could not be observed without mutating
merchant catalogue data. T012 and T013 therefore remain incomplete.

### Post-change same-store follow-up — 2026-08-10 12:34–12:38 +03

After the owner enabled English, owner-confirmed draft `999707124` on the same
`dev-f5vbpgh2dnmmvhzp` store was captured from the proven post-C1/C5 worktree
`a9e9ab0c11eeafe1bf0024b8aad2342eef4ec3b9`. Published production CSS matched the worktree exactly;
the locally rebound draft then produced saved cache-disabled Arabic and English request summaries
under `evidence/live/draft-999707124-after/`.

**Blocker 1 is closed.** On one rendered `Latest Products` list and the same URL, `Load more`
increased the product count from 15 to 16 unique IDs. The transition emitted zero theme-owned
requests and zero theme-owned bytes; no merchant data was mutated. This is the strict two-count
request-scaling evidence that the earlier different-route comparison lacked.

**Blocker 2 remains open only for English-before.** Arabic now has a same-store, same-count,
same-build-mode before/after comparison. English post-change is genuine (`lang=en`, `dir=ltr`), but
English was enabled only after the baseline capture, so a fresh proven baseline-branch English
capture is still required. T012 and T013 remain incomplete until that final row is captured and
reviewed.

### English baseline closure — 2026-08-10 13:09–13:12 +03

**The English Home baseline row is closed.** Owner-confirmed draft `1779563474` was captured from the proven baseline
worktree `86c53092106d6771be5d20d2e4b00624c05179d3` after English was enabled on the same store. The
accepted cache-disabled 1366×768 row proves `lang=en`, `dir=ltr`, 15 products, no overflow, and six
localhost responses totaling 1,686,422 encoded bytes. It compares directly with the saved
post-change English row on draft `999707124`: the identical six-request set totals 1,491,006 bytes.

The Home-only Arabic and English matrix is recorded in `evidence/bilingual-before-after-final.md`.
The later T013 independent review correctly found that Product and Collection before/after captures
are still missing and that the two-count evidence used Home rather than Collection. T012 is reopened;
T013 remains incomplete.

## Post-remediation gate results (2026-08-10, this working tree)

- `node --test tests/performance-bundle-ci.test.mjs` — 36/36 pass (35 prior + 1 new Blocker-4
  regression test: "T009 spike inventory script is reproducible from its tracked location").
- `node scripts/check-theme.mjs --json` — 0 errors / 0 warnings.
- `npx webpack --mode production` — exit 0, inherited warnings only; `public/` regenerated by the
  build, never by hand; totals unchanged at 28 files / 997,743 raw / 196,388 gzip-9.
- `node scripts/check-theme.mjs --build --max-errors=0` — 0 errors / 0 warnings; build-sync compares
  all 28 files recursively and passes.
- `node scripts/check-bundle-budget.mjs` — 0 errors; hard cap passes at 997,743 B; internal target
  remains informationally exceeded under the recorded exception (`../follow-up-register.md` HDL-29).
- `git diff --check` — clean.

## Independent re-review (2026-08-10)

- Model: **GPT-5.6 Sol High** (independent re-review after the Blocker-4 fix above).
- Exact static result: `STATIC_STATUS: PASS`, `STATIC_BLOCKERS: 0`, `CLOSED_BLOCKER_4: yes`,
  `NEW_BLOCKERS: 0`.
- Remaining runtime blockers: exactly 2 — the strict same-collection comparison at two product
  counts (Blocker 1) and genuine bilingual before/after network evidence (Blocker 2). Both still
  require a new owner-confirmed Salla preview capture; T012 remains reopened and T013 remains
  incomplete. HDL-05 is not marked complete/accepted.
