# T009 — Migration/editor Spike gate result

**GATE: CONSERVATIVE STATIC PATH OPEN; EDITOR CONTRACT PARTIALLY LIVE-VERIFIED.** Per the owner preview-sync policy, a recorded platform sync failure does not stop the project. The disabled-by-default enrollment boundary remains mandatory. After the initial blocked attempt below, owner-confirmed drafts verified T005 (configured draft `797574311`), captured T006 before/after-first-save materialization (fresh draft `524850391` — explicitly **not** proof of a fresh theme installation), and concluded T007 with the exact equality condition and hidden-value persistence **passed**; option removal/re-addition churn remains **not verified** and is **not relied on**.

**Captured at**: 2026-08-08 UTC (initial gate); live follow-ups 2026-08-08 21:10–21:18 UTC (T005/T007) and 2026-08-09 03:41–03:48 UTC (T006)
**Commit**: `5deac563f21210529124c2c0a9101ab5befde4e1` (branch `codex/hdl-03-settings-preset-engine`)
**Salla CLI**: 3.2.45 (authenticated; 1 theme `Hadeel` ID 224400990; 10 demo stores listed)

## Spike task results

| Task | Capture | Result |
|---|---|---|
| T005 | `pre-schema-store.md` — configured-draft save/reload (Boolean, String, Items, unset, explicit-default, non-default) | **verified** — owner-confirmed draft `797574311` (initial CLI attempt blocked by commit gate; follow-up succeeded) |
| T006 | `fresh-store.md` — fresh-draft default materialization + Twig return shapes | **captured** — owner-confirmed fresh draft `524850391`; a fresh *draft*, not a proven fresh theme installation |
| T007 | `editor-contract.md` — global condition shape, companion-mode defaults, option add/remove, hidden-value persistence | **concluded 3/4** — exact equality condition and hidden-value persistence **passed**, companion default passed with dormancy caveat; option churn **not verified** and not relied on |
| T008 | `migration-decision.md` — fresh-versus-existing marker search | **no supported marker found** in public docs or captured state |

Blocking command evidence (exact, ANSI stripped):

```bash
salla theme preview --store Demo_5 --without-editor --only-link
```

```text
INFO  run checks:
     ✓ twilight.json was found.
     ✓ Github account is linked.
     ✓ Theme ID exists.
     ✓ The theme folder is linked to GitHub repository.

INFO  The CLI detected certain changes in some files

? Please, commit the changes before requesting Theme Preview. Shall the CLI commit those changes? › yes
```

The original attempt was refused at the commit prompt. A later owner-authorized isolated-preview follow-up used a temporary worktree and branch only.

## Isolated-preview follow-up

- Preview worktree: `.worktrees/preview-hdl-03-20260808`
- Preview branch: `codex/preview-hdl-03-20260808`
- Local/upstream/remote SHA: `e40b0cf064ac36f97e3bb93e03fdefaa5b3d1968`
- Command: `salla theme preview --store Demo_5 --with-editor --browser chrome`
- CLI: passed checks; local assets `http://localhost:8000`; editor opened in Chrome
- Rendered storefront at `2026-08-08T20:27:19.638Z`: body class `theme-raed`; no `#hdl03-spike-settings`; no localhost resources
- Partners Portal: redirected to login, so branch selection/Confirm could not be completed without credentials
- Cleanup: preview stopped; production rebuild and `node scripts/check-theme.mjs --build --json` passed with 0 errors and 0 warnings; worktree returned clean

**Classification: `SALLA PREVIEW SYNC FAILURE`.** This is not a code FAIL and does not authorize positive live evidence.

## Locked compatibility boundary

**`preset_engine_enabled=false` is locked as the only safe compatibility
boundary.** Because no supported fresh-versus-existing distinction exists
(T008), the explicit disabled-by-default enrollment switch is mandatory and
final unless a later, separately-evidenced Spike proves a supported marker.
Automatic migration is prohibited. No implementation may infer installation
age, silently migrate a value, or overwrite an invalid legacy value.

## Non-selectable Spikes (recorded, not implementable)

The following remain **non-selectable Spikes** — no HDL-03 task may implement,
simulate, or depend on them:

1. **Dynamic pre-save impact summary** in the Salla settings panel (no
   write-capable editor API proven).
2. **Destructive batch Reset All** across multiple settings (no multi-setting
   write/confirmation contract proven; must not be simulated with storefront
   JavaScript, storage, or an external app).
3. **Automatic migration** of existing merchant values (no
   fresh-versus-existing marker; T008).
4. ~~**Hidden-value persistence**~~ — **live-verified** on owner-confirmed
   draft `797574311` for the exact tested equality-condition shape (T007 §4):
   a saved value survived save/reload while its control was hidden. Runtime
   safety still never depends on visibility, and Custom fields stay visible.
5. **Global cross-group conditions** beyond the exact existing
   `{id, operation: "=", value: true}` boolean shape. That exact shape is now
   **live-verified** (T007 §1); anything beyond it remains unverified. If a
   later live panel rejects reuse, controls remain visible and labeled.
6. **Settings-panel label localization** from theme locale keys (unsupported;
   bounded exception already recorded in plan.md Complexity Tracking — registry
   carries `label_ar`/`label_en`; no automatic panel-language switching is
   claimed).

## What later phases may rely on

- The six legacy setting IDs, types, defaults, exact options, class prefixes,
  and base variants captured in `../baseline/legacy-class-contract.json`
  (repository evidence, commit `5deac563`).
- The 45-global / 62-component recursive inventory and qualified-key rules in
  `../baseline/settings-inventory.json` (repository evidence).
- Static-only implementation shapes: allowlisted resolution, safe defaults,
  `needs_review` markers, and visible controls — none of which depends on any
  unverified platform behavior.
- Live-verified editor behaviors from owner-confirmed draft `797574311`
  (T005/T007): the exact `{id, operation: "=", value: true}` condition shape,
  companion-mode editor-presentation defaults (dormant until first save), and
  hidden-value persistence for the exact tested shape. Option churn was never
  verified and nothing in HDL-03 relies on it: legacy option lists are
  unchanged and the runtime allowlist rejects unknown values regardless.
- No fresh-install claim: T006 evidence is a fresh draft (`524850391`), not a
  proven fresh theme installation; no install-age marker exists (T008), so the
  explicit disabled-by-default enrollment boundary stays mandatory.

**Close statement (updated 2026-08-09).** T005 and T007 are **live-verified within their exact recorded scope** on owner-confirmed draft `797574311`: configured-draft save/reload shapes, the exact `{id, operation: "=", value: true}` condition shape, companion-mode editor-presentation defaults (dormant until first save), and hidden-value persistence for the exact tested shape. T006 is **fresh-draft evidence only** (`524850391`) — captured before/after-first-save materialization, not a fresh theme installation. Option churn (option removal/re-addition) and fresh-install detection **remain unverified and are not relied on**: legacy option lists are unchanged, runtime allowlists reject unknown values regardless of editor behavior, and `preset_engine_enabled=false` stays the mandatory enrollment boundary. A future owner-confirmed preview is required only to capture **post-remediation rendered code** and the remaining matrix evidence (including the pending English engine-off keyboard control); it does not reclassify the completed captures above.
