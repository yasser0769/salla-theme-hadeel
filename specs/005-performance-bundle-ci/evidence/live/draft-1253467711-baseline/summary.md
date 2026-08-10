# Draft 1253467711 — pre-C1/C5 Product and Collection baseline

Owner-confirmed baseline branch `codex/preview-hdl-05-baseline-20260810` at
`86c53092106d6771be5d20d2e4b00624c05179d3` was served through `localhost:8000` in Chrome. Every row
has the body class `salla-draft-1253467711`, the expected local theme assets, the required locale and
viewport, cache disabled, and no throttling.

The CLI created draft `614237496` instead of the owner-confirmed draft. This is recorded as
`SALLA PREVIEW SYNC FAILURE`, not code FAIL; the accepted captures use the owner's draft token and the
baseline worktree's local assets.

`product-collection-before.json` contains four baseline rows: Product and Collection in Arabic
390×844 and English 1366×768. Product uses nine theme-local resources / 1,755,545 content bytes;
Collection uses six / 1,746,472. Both languages have identical resource profiles per route, correct
`lang`/`dir`, and no horizontal overflow at the required viewport.
