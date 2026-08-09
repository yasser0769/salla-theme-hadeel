# T032 — US2 verification: persistent Custom overrides (HDL-03)

**Captured at**: 2026-08-09 (UTC+3 session), after T027–T031 completed
**Commit**: `5deac563f21210529124c2c0a9101ab5befde4e1` (branch `codex/hdl-03-settings-preset-engine`; no commits made by this work)
**Node**: v26.5.0
**Scope**: static + deterministic Node verification only. **No Salla preview was run in this batch**; rendered-DOM behavior of the Twig resolver remains gated on the Phase 8 live matrix.

> **Correction (2026-08-09, same session):** The owner-confirmed draft `1402312628` rendered `<!-- Error In This View! (File [src/views/partials/preset-classes.twig] Not Found) --!>` with HTTP 200 and localhost:8000 asset preloads — a real runtime code failure. Salla server rendering does not package a new top-level `src/views/partials/` directory. The resolver was moved inline into `src/views/layouts/master.twig` with identical semantics, `src/views/partials/` was removed, and the T019 parity test now pins the shipped maps inside `master.twig`. Path claims below were updated; all suites were re-run after the move and still pass (`tests 29, pass 29, fail 0`).

## What was built/verified (T027–T031)

- **T027** — 3 tests in `tests/settings-preset-engine.test.mjs`: a valid Custom value beats every profile map for every follower (contract step 4); 16 invalid Custom shapes (wrong case, whitespace, CSS injection, HTML, null/undefined, wrong types) never reach a class in any mode × profile; a valid Custom also wins for an unknown mode before any fallback (contract step 3).
- **T028** — 3 tests: one Custom is byte-stable across a `luxury → modern` switch while ≥1 follower changes and all followers resolve `from: preset`; three simultaneous Customs stay fixed across all four profiles with only followers moving; a JSON serialize/reload round-trip leaves the store and the resolution byte-identical.
- **T029** — 2 tests: returning one field to `follow_preset` re-resolves only that field from the profile map (other Customs and followers deep-equal before/after); the stored Custom value survives return-to-Follow (store bytes unchanged) and wins again verbatim on explicit re-selection.
- **T030** — mode normalization and no-write Custom resolution in the inline resolver block of `src/views/layouts/master.twig` (implemented under T023 in the since-removed partial; moved inline after the draft-1402312628 packaging failure) reviewed line-by-line against contract steps 3–6: mode is read per follower (`{id}_mode`); only the exact strings `custom`/`follow_preset` are recognized, anything else (null included, per the migration Spike) takes the unknown-mode branch; the resolver contains no write of any kind. **No semantics change was needed in this batch** — the implementation already carries these paths, and the new T027–T029 tests pin the identical semantics in the reference resolver that the shipped maps are pinned to (T019 parity test, now against `master.twig`).
- **T031** — persistence-mechanism audit (see §2).

## 1. State-transition results (Node tests)

```bash
node --test tests/settings-preset-engine.test.mjs
```

Exit code `0`. US2 suites, exact output:

```text
▶ T027 US2: valid Custom wins; invalid Custom never reaches a class
  ✔ a valid Custom value wins over every profile for every follower (0.409812ms)
  ✔ an invalid Custom value can never reach a class, in any mode or profile (3.384964ms)
  ✔ a valid Custom also wins for an unknown mode, before any fallback (contract step 3) (0.339567ms)
✔ T027 US2: valid Custom wins; invalid Custom never reaches a class (4.315566ms)
▶ T028 US2: Custom survives profile switches and serialization/reload
  ✔ one Custom survives a luxury -> modern switch while the followers change (0.336342ms)
  ✔ multiple Customs survive switches across all four profiles; only followers move (0.386225ms)
  ✔ a JSON serialize/reload round-trip preserves the store and the resolution byte-for-byte (0.323299ms)
✔ T028 US2: Custom survives profile switches and serialization/reload (1.22134ms)
▶ T029 US2: per-field return to Follow is scoped and lossless
  ✔ returning one field to Follow re-follows only that field and leaves other Customs intact (0.288229ms)
  ✔ the stored Custom value survives return-to-Follow and wins again on explicit re-selection (0.171203ms)
✔ T029 US2: per-field return to Follow is scoped and lossless (0.58438ms)
```

Whole-file summary at the same run: `tests 29, suites 9, pass 29, fail 0` (US1/US3 suites included; US3 detail is in `us3.md`).

## 2. T031 — no hidden persistence or runtime mechanism

```bash
grep -nE "theme\.settings\.set|localStorage|sessionStorage|addEventListener|MutationObserver|IntersectionObserver|ResizeObserver|fetch\(|XMLHttpRequest|navigator\.sendBeacon|document\.cookie|salla\.api|<script" \
  src/views/layouts/master.twig
```

Matches, each classified:

| Location | Match | Classification |
|---|---|---|
| `master.twig:49` | `theme.settings.set` in a `{# … #}` documentation table | pre-existing Twilight comment, untouched by HDL-03 |
| `master.twig:59` | `theme.settings.set('placeholder', 'images/placeholder.png')` | pre-existing Twilight boilerplate, outside the resolver path, untouched by HDL-03 (not in the HDL-03 diff) |
| `master.twig:61,62,64,70,151` | pre-existing `<script>` asset tags | pre-existing theme bundles, untouched by HDL-03 |

The complete HDL-03 diff to `master.twig` (verified via `git diff src/views/layouts/master.twig`) is exactly: the inline resolver block before `<body>` (moved in from the removed partial with identical semantics), the six resolved-class interpolations, the conditional `hadeel-preset-{id}` class, and the three conditional evidence data attributes. **No `theme.settings.set()`, client storage, listener, observer, API call, or runtime request implements Custom persistence.** Persistence is platform-owned: the merchant's saved values live in the six unchanged legacy setting IDs and the six `*_mode` IDs; the resolver only reads.

## 3. Guards at this state

- `node scripts/check-settings-registry.mjs --strict` — exit `0`, `0 error(s)` (full output in `us3.md` §3, same run).
- `node scripts/check-theme.mjs --build --json` — exit `0`, `errors: 0, warnings: 0`, all seven checks `ok` including `build-sync` (full JSON in `us3.md` §4, same run).
- `git diff --check` — exit `0`, no output.

**Public delta: zero bytes.** No asset source was touched; `public/` is untouched and matches a fresh production build.

## Not verified (kept open by policy)

- Rendered Custom-persistence behavior on a live Salla storefront (save/reload in the real editor). The Phase 8 matrix (T051/T052) remains the behavioral gate.
- Fresh-store materialization and option removal/re-addition (Spike items still unverified; no code depends on them).
