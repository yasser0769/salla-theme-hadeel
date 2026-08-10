# T010 — Executed C1 + C5 Reductions

> **HISTORICAL.** C1 and its raw-cap rationale are `SUPERSEDED` and were surgically
> reversed on 2026-08-10. C5 remains after independent lossless/accessibility audit.

- **Executed:** 2026-08-10
- **Branch / HEAD:** `codex/hdl-05-performance-bundle-ci` / `eb40134dcda5c147ff03a048ad05b3e11ba8a15b`
- **Implementer:** Kimi K3 High (`kimi-code/k3`, thinking enabled)
- **Owner decision:** `C1-LAUNCH-CORE-FULL-LOYALTY + C5-LOSSLESS-MEDIA — ACCEPT HIGH RISK`
- **Mutation boundary:** no commit, stage, push, Salla preview, browser, package, lockfile, or unrelated-user-file change.

## C1 — source-owned launch-core Safelist

- `src/config/salla-safelist.txt`: 1,630 lines, SHA-256 `833fae3b9bf4d9266d57bb6e21609a3417695b38694b5b2ef5c5c44d075ba5b8`, byte-identical to the accepted evidence artifact.
- `tailwind.config.js` now consumes that source-owned file instead of the package's 2,494-line full Safelist.
- The prior Tailwind config and full Safelist are preserved as reproducibility evidence.
- Production `app.css`: 802,202 → **648,682 B** raw (−153,520); 103,802 → **85,694 B** gzip-9 (−18,108).
- Normalized snapshot: 6,838 → 5,646 rules. The C1 diff contains the accepted Safelist reduction; no override layer was added.
- Evidence: `t010-c1-before.css`, `t010-c1-after.css`, `t010-c1-diff.txt`, and `t010-c1-pre-change-tailwind.config.js`.

## C5 — lossless media

- `placeholder.png` 20,664 B → lossless `placeholder.webp` 4,310 B.
- Five SVGs were replaced byte-for-byte from the accessibility-preserving approved evidence outputs.
- Source, production build, and evidence hashes match for all six assets.
- Original PNG and shipped WebP decode to exact RGBA MD5 `49a075f8c5a5ed03958ebeeb4954f459`.
- Payment SVGs retain valid `role="img"`, `aria-labelledby`, and matching title IDs.
- Every theme-owned runtime/template/registry reference now uses `images/placeholder.webp`; no stale production reference remains.
- CSS snapshot before/after C5 is byte-identical at 5,646 rules; the diff is empty.

Pure media saving is **21,565 B**. The approved `.png` → `.webp` fallback literal makes `add-product-toast.js` one byte larger, so the net built saving is **21,564 B**.

The `add-product-toast.js` per-file ceiling was raised by exactly one byte, 25,605 → 25,606, solely for that approved extension change. This is the written reason required by the ratchet contract; no other ceiling was raised and the aggregate hard-cap gate changed from red to green.

## Final measured bundle

| Metric | Post-font baseline | Post-C1 | Post-C1+C5 |
|---|---:|---:|---:|
| Files | 28 | 28 | 28 |
| Raw | 1,172,827 | 1,019,307 | **997,743** |
| gzip-9 | 227,413 | 209,305 | **196,388** |
| Hard-cap margin | −172,827 | −19,307 | **+2,257** |
| Internal-target gap | 322,827 | 169,307 | **147,743 over** |

The one-byte difference from the 997,742 B decision projection is fully reconciled by the JavaScript literal above.

## Automated result before T011 evidence capture

- HDL-05 tests: 29/29 pass.
- Production webpack: pass.
- `check-theme --build`: 0 errors / 0 warnings; build-sync pass.
- Bundle budget: pass at 997,743 B; internal target remains informationally over.
- `git diff --check`: pass.
- Runtime safety remains `NOT VERIFIED` and is the confirm-or-revert gate in T012.

## Temporary internal-target exception

- **Owner:** Yasser Alshihri, via the recorded high-risk T009 acceptance after disclosure of the target gap.
- **Scope:** HDL-05 ships at 997,743 B, below the hard cap but 147,743 B above the 850,000 B internal target.
- **Expiry:** HDL-29 final release gate, or earlier if a safe measured reduction reaches the target.
- **Removal plan:** keep per-file ratchets at the measured post-T010 ceilings; later Specs must fund any growth with measured reductions; HDL-23 and HDL-24…27 revalidate the experimental Safelist; HDL-29 must either reach the target or obtain a new explicit release exception and may never waive the 1,000,000 B hard cap.
- **Tracked owners:** `../follow-up-register.md` rows HDL-23, HDL-24…27, and HDL-29.
