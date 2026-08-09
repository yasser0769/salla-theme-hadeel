# T026 — US1 verification: safe preset start (HDL-03)

**Captured at**: 2026-08-08 (UTC+3 session), after T018–T025 completed
**Commit**: `5deac563f21210529124c2c0a9101ab5befde4e1` (branch `codex/hdl-03-settings-preset-engine`; no commits made by this work)
**Node**: v26.5.0
**Scope**: static + deterministic Node verification only. Rendered-DOM behavior of the Twig resolver remains gated on the Phase 8 live matrix.

> **Correction (2026-08-09):** After this file was recorded, the owner-confirmed draft `1402312628` rendered `<!-- Error In This View! (File [src/views/partials/preset-classes.twig] Not Found) --!>` — Salla server rendering does not package a new top-level `src/views/partials/` directory. The resolver was moved inline into `src/views/layouts/master.twig` with identical semantics and `src/views/partials/` was removed. Path claims in §"What was built" below were updated accordingly. After the move, all US1 suites were re-run and still pass inside the current 29-test run (see `us2.md`/`us3.md` §1); §1–§5 below preserve the original US1-batch outputs as recorded.

## Authoritative Spike inputs applied

From the recorded migration/editor Spike (this session's owner-authorized evidence):

- New settings return **null in Twig before first save** even when the editor displays declared defaults → `preset_engine_enabled=false` is the only safe default and the resolver treats any non-explicitly-true value as OFF.
- The exact global equality condition `{id, operation: "=", value: true}` works → the seven new valued controls (`preset_profile` + six `*_mode`) use exactly this shape, conditioned on `preset_engine_enabled`. The one static explanation (`static-preset-scope-note`) is deliberately **unconditioned** (condition shape is proven for valued controls; runtime never depends on visibility).
- Companion-mode editor default displays `follow_preset` but runtime is null until save → with the engine ON, null/unknown mode follows the approved contract: `needs_review` + valid-Custom preservation, **never** treated as a valid declared default (owner-locked semantics; helper behavior unchanged).
- Hidden saved values survive condition hide/save/reload → legacy Custom stores stay persisted even while their mode control is hidden by a condition.
- Fresh-store and option removal/re-addition remain **unverified** → no automatic migration, no enrollment inference, no editor write API.

## What was built (T018–T025)

- `tests/settings-preset-engine.test.mjs` — 11 tests in 3 suites (T018/T019/T020), including a static parity test pinning the shipped Twig resolver maps (`hadeel_allowed`, `hadeel_safe`, `hadeel_profiles`) to the canonical registry.
- `twilight.json` — 9 new records after `product_card_style`: `preset_engine_enabled` (boolean, default false, no condition), `preset_profile` (items, default `modern`), `static-preset-scope-note` (the single T022 static), and the six dormant `*_mode` controls (items, default `follow_preset`; Basic modes before Advanced modes). **All six legacy IDs/types/options/selected defaults untouched** (verified by registry coverage parity and the 324-combination test).
- `src/config/settings-registry.json` — 54 global + 62 component records; 9 new records with `evidence_status: "build"`; global `source_path` indices recomputed after the insertion.
- `src/views/layouts/master.twig` — contains the one centralized allowlisted resolver as an inline block before `<body>` (moved here after the draft-1402312628 packaging failure; read-only: no `theme.settings.set`, no JS, no storage, no network); emits the six resolved classes plus `hadeel-preset-{id}` when the engine is on; T025 evidence attributes `data-hadeel-preset` and `data-hadeel-preset-sources` render only when the engine is on, and `data-hadeel-preset-review` renders whenever the review list is non-empty, including engine-off invalid legacy (corrected in the 2026-08-09 Final Review fix; no customer-facing warning copy). Merchant color/font `<style>` block and `use_theme_font` untouched.

## 1. Node tests

```bash
node --test tests/settings-preset-engine.test.mjs
```

Exit code `0`. Exact output:

```text
▶ T018 US1: engine-off legacy parity
  ✔ all 324 legacy class combinations resolve byte-identically (12.855949ms)
  ✔ invalid legacy values fall back to the documented safe default with needs_review (0.596022ms)
  ✔ engine off ignores the new engine controls entirely (null or garbage) (0.730014ms)
✔ T018 US1: engine-off legacy parity (16.279472ms)
▶ T019 US1: profiles, determinism, one class per family
  ✔ all four profiles resolve every follower from the approved bootstrap map (0.767315ms)
  ✔ resolution is deterministic and idempotent (0.61057ms)
  ✔ exactly one allowlisted class per family (0.482083ms)
  ✔ unknown profile normalizes to modern with needs_review (contract step 2) (0.293914ms)
  ✔ shipped Twig resolver maps match the canonical registry (0.954984ms)
✔ T019 US1: profiles, determinism, one class per family (3.74168ms)
▶ T020 US1: profiles never own commerce, content, color, or font
  ✔ every profile owns exactly the six follower keys, nothing else (0.374586ms)
  ✔ no profile key touches color/font/content/order/price/availability/options/purchase (2.582227ms)
  ✔ deferred final-identity owners are HDL-24…27 and profiles carry versions (0.215969ms)
✔ T020 US1: profiles never own commerce, content, color, or font (3.491911ms)
ℹ tests 11
ℹ suites 3
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 195.498384
```

## 2. Strict registry check

```bash
node scripts/check-settings-registry.mjs --strict
```

Exit code `0`. Exact output:

```text
[schema]
    ok   registry document conforms to the approved schema

[uniqueness]
    ok   qualified keys are unique; raw ids are unique within the global scope

[metadata]
    ok   every record has an HDL-NN owner and a twilight.json source path

[mode-pairing]
    ok   six followers pair with their future *_mode keys; everything else is explicitly non-preset

[profiles]
    ok   four canonical profiles own allowlisted values and defer identity to HDL-24…27

[allowlist]
    ok   class values are allowlisted; non-base variants have SCSS selectors or compiled CSS mappings; safe defaults are valid

[coverage]
    ok   registry matches twilight.json recursively (54 globals, 62 component/nested records)

[twig-parity]
    ok   every twig class interpolation matches a registered prefix and safe default

[witness]
    ok   valid fixture passes document validation
    ok   invalid fixture fails with 8 error(s) as required

registry: 54 global + 62 component/nested records, 4 profiles
0 error(s)
```

## 3. Theme guard (static)

```bash
node scripts/check-theme.mjs
```

Exit code `0`: all six checks `ok` (duplicate-selectors, hardcoded-arabic, dead-classes, css-variables, theme-settings, settings-registry), `0 error(s), 0 warning(s)`.

## 4. Theme guard with production build sync

```bash
node scripts/check-theme.mjs --build --json
```

Exit code `0`. Exact output:

```json
{
  "errors": 0,
  "warnings": 0,
  "findings": [
    {
      "check": "duplicate-selectors",
      "level": "ok",
      "message": "no selector is split across component files"
    },
    {
      "check": "hardcoded-arabic",
      "level": "ok",
      "message": "no hardcoded Arabic outside src/locales"
    },
    {
      "check": "dead-classes",
      "level": "ok",
      "message": "every theme class in SCSS is rendered somewhere"
    },
    {
      "check": "css-variables",
      "level": "ok",
      "message": "every referenced custom property is defined"
    },
    {
      "check": "theme-settings",
      "level": "ok",
      "message": "every setting read by a template is declared in twilight.json"
    },
    {
      "check": "settings-registry",
      "level": "ok",
      "message": "settings registry matches twilight.json and the HDL-03 contracts (strict)"
    },
    {
      "check": "build-sync",
      "level": "ok",
      "message": "public/ matches a fresh production build"
    }
  ]
}
```

**Public delta: zero bytes.** No CSS/JS asset source was touched; `public/` is untouched and matches a fresh production build. No dependency, no new request, no runtime listener/observer/storage.

## 5. Hygiene

```bash
git diff --check
```

Exit code `0` (no output). `.vscode/settings.json`, `package.json`, `pnpm-lock.yaml` untouched; pre-existing unrelated modifications preserved; no commit/push performed.

## Not verified (kept open by policy)

- Rendered output of the inline resolver block in `master.twig` on a live Salla storefront: the draft-1402312628 render proved the include-based variant fails at runtime; the inline variant still requires a passing owner-confirmed preview in the Phase 8 matrix (T048–T053), which remains the behavioral gate.
- Fresh-store materialization and option removal/re-addition (Spike items still unverified; no code depends on them).
