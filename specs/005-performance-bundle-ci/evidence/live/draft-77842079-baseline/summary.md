# HDL-05 pre-C1/C5 baseline capture — draft 77842079

- Captured: 2026-08-10 12:16–12:22 +03
- Owner-confirmed branch: `codex/preview-hdl-05-baseline-20260810`
- Proven preview SHA before browser open: `86c53092106d6771be5d20d2e4b00624c05179d3`
- Browser: Chrome; temporary viewport overrides 390×844 and 1366×768
- Owner-confirmed draft: `77842079`
- Rendered store: `dev-f5vbpgh2dnmmvhzp` (`اختيارات ياسر`)

## Preview identity and sync failures

The owner-confirmed editor initially served its remote `app.css` at 648,682 bytes with SHA-256
`6f54a8213fc13066b8ca4e1cd1e50b989439c260ce8617591f7458c2af75b48b`. That is byte-identical to
the primary post-C1/C5 `public/app.css`, not the baseline worktree's 802,202-byte production CSS
(`8da283e0f9aa4c7b16459f1ae193bb660596bf4e9cced913fcb81be49fd14b64`). This is a
**SALLA PREVIEW SYNC FAILURE**, not a code failure.

The CLI was then run only inside the temporary baseline worktree with
`salla theme preview --store Demo_5 --without-editor --browser chrome`. It started the local asset
server at `localhost:8000`, but created draft `1169141734` instead of owner-confirmed draft
`77842079`. This is a second **SALLA PREVIEW SYNC FAILURE**. The CLI-created draft was not used as
identity evidence.

The owner-confirmed editor URL was rebound to the baseline worktree's local asset server. The
rendered storefront then proved both sides simultaneously: body class `salla-draft-77842079` and
all six theme assets from `http://localhost:8000`. The baseline development `app.css` response was
1,028,350 encoded bytes; the production baseline remains 802,202 raw bytes.

## Captured result

Arabic home at 390×844 rendered 15 product cards with `lang=ar`, `dir=rtl`, six local theme
responses totaling 1,686,422 encoded bytes, and no horizontal overflow (`390 == 390`). All six
local responses returned 200 without disk-cache or service-worker attribution. See
`arabic-home-state.json` and `arabic-home-network.json`.

The requested `/en/` route at 1366×768 rendered `lang=ar`, `dir=rtl` on the same confirmed draft.
Therefore a genuine English/LTR baseline is **NOT VERIFIED**; see `english-locale-probe.json`.

The largest visible collection (`c902392690`) rendered 11 unique product cards and exposed no
pagination/load-more control. No merchant catalogue state was mutated. Therefore the strict
same-collection comparison at two product counts is also **NOT VERIFIED**.

## Gate effect

This capture supplies a genuine pre-C1/C5 Arabic home request set on a proven baseline worktree and
owner-confirmed draft. It does **not** close either remaining independent-review blocker:

1. the store exposes no second product count for the same collection; and
2. the confirmed store does not render English/LTR, while the prior post-change bilingual evidence
   was captured on a different store/draft (`dev-v37bn5qobfotqowz`, draft `1233213199`).

No cross-store or Arabic-as-English comparison is presented as valid evidence.
