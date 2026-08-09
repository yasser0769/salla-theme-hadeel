# T038 — US3 verification: safe existing-store migration (HDL-03)

**Captured at**: 2026-08-09 (UTC+3 session), after T033–T037 completed
**Commit**: `5deac563f21210529124c2c0a9101ab5befde4e1` (branch `codex/hdl-03-settings-preset-engine`; no commits made by this work)
**Node**: v26.5.0
**Scope**: static + deterministic Node verification only. **No Salla preview was run in this batch**; rendered-DOM behavior of the Twig resolver remains gated on the Phase 8 live matrix.

> **Correction (2026-08-09, same session):** The owner-confirmed draft `1402312628` rendered `<!-- Error In This View! (File [src/views/partials/preset-classes.twig] Not Found) --!>` with HTTP 200 and localhost:8000 asset preloads — a real runtime code failure. Salla server rendering does not package a new top-level `src/views/partials/` directory. The resolver was moved inline into `src/views/layouts/master.twig` with identical semantics, `src/views/partials/` was removed, and the T019 parity test now pins the shipped maps inside `master.twig`. Path claims below were updated; all suites were re-run after the move and still pass (`tests 29, pass 29, fail 0`).

## What was built/verified (T033–T037)

- **T033** — 5 tests in `tests/settings-preset-engine.test.mjs` pinning the exact fallback precedence: missing/null/empty/unknown profile → `modern` map + `needs_review` (contract step 2); unknown mode → `needs_review` with a valid Custom preserved first, else the normalized profile value (step 3); invalid legacy value (engine off) → `safe_default` + `needs_review` (step 1), invalid Custom with `custom` mode → profile value + `needs_review` (step 5), `follow_preset` ignores the stored value entirely (step 6); a missing or non-allowlisted profile-map entry → `safe_default` + `needs_review` with intact sibling entries unaffected (step 7); precedence proof that a valid Custom beats the profile fallback even when the profile itself is unknown.
- **T034** — 2 no-mutation tests: inputs deep-frozen (any write inside the resolver would throw on the frozen graphs) resolve without throwing, and merchant store + registry serialize byte-identical before/after across engine on/off × all four profiles; the store key set is invariant under resolution.
- **T035** — new fixture `tests/fixtures/settings-preset-engine/rollback.json` (a complete post-feature store: engine disabled, `preset_profile: luxury`, all six modes `custom`, six allowlisted legacy values) plus 3 tests: the engine coercion matches the Twig exactly (`[true,'true',1,'1']`); every new stored ID is ignored with the engine off; stripping the new IDs changes nothing and the six old values reproduce the pinned baseline classes byte-for-byte (`hadeel-layout-full hadeel-spacing-compact hadeel-corners-rounded hadeel-card-elevated hadeel-header-start hadeel-header-density-compact`).
- **T036** — the four fallback behaviors in the inline resolver block of `src/views/layouts/master.twig` (implemented under T023 in the since-removed partial; moved inline after the draft-1402312628 packaging failure) reviewed line-by-line against the contract: unknown-mode valid-Custom preservation, invalid-Custom profile fallback, safe-default fallback, and aggregated `needs_review` via `hadeel_review` rendered only as the non-customer-facing `data-hadeel-preset-review` attribute — no warning copy anywhere in the rendered page. **No semantics change was needed in this batch**; the T033 tests pin identical semantics in the reference resolver.
- **T037** — rendered-output audit of `src/views/layouts/master.twig` (see §2).

> **Correction (2026-08-09, Final Review fix):** `data-hadeel-preset-review` now renders whenever `hadeel_review` is non-empty — including engine-off invalid legacy values (FR-012 / contract step 1 require a traceable `needs_review` state for the legacy fallback). `data-hadeel-preset` and `data-hadeel-preset-sources` remain engine-on only, and valid engine-off output is byte-equivalent in classes (review state never touches the class attribute). A shipped-Twig regression suite (`FR-012 fix: …`, 3 tests) pins this in `tests/settings-preset-engine.test.mjs`. The T037 row below was updated accordingly.

## 1. Fallback/rollback results (Node tests)

```bash
node --test tests/settings-preset-engine.test.mjs
```

Exit code `0`. US3 suites, exact output:

```text
▶ T033 US3: exact fallback precedence on invalid data
  ✔ missing, null, empty, or unknown profile resolves through the modern map with needs_review (0.489964ms)
  ✔ unknown mode flags needs_review: valid Custom preserved first, otherwise the normalized profile value (0.304268ms)
  ✔ invalid legacy value (engine off) falls to the safe default; invalid Custom (engine on) falls to the profile value (0.240676ms)
  ✔ a missing or invalid profile map entry falls to the safe default with needs_review (contract step 7) (0.829059ms)
  ✔ precedence: a valid Custom beats the profile fallback even when the profile itself is unknown (0.150993ms)
✔ T033 US3: exact fallback precedence on invalid data (2.276106ms)
▶ T034 US3: resolution never mutates merchant or registry state
  ✔ deep-frozen inputs resolve without throwing; stores serialize byte-identical before/after (3.031119ms)
  ✔ resolution does not add, rename, or delete keys on the merchant store (0.222581ms)
✔ T034 US3: resolution never mutates merchant or registry state (3.380943ms)
▶ T035 US3: rollback — disabled engine ignores the new IDs and reproduces baseline classes
  ✔ the fixture is a complete post-feature store: new IDs present, six legacy values allowlisted (0.198727ms)
  ✔ engine off ignores every new stored ID and emits exactly the six legacy classes (0.325389ms)
  ✔ stripping the new IDs changes nothing: baseline classes reproduce byte-for-byte (0.255958ms)
✔ T035 US3: rollback — disabled engine ignores the new IDs and reproduces baseline classes (0.932626ms)
```

Whole-file summary at the same run: `tests 29, suites 9, pass 29, fail 0` (US1/US2 suites included; US2 detail is in `us2.md`).

## 2. T037 — invalid raw setting text cannot reach a class or data attribute

Every interpolation in the rendered `<body>` tag of `master.twig` (extracted with `sed -n '/<body id="app"/,/^>/p' … | grep -oE '\{\{[^}]*\}\}'`), classified:

| Interpolation | Why raw setting text cannot pass |
|---|---|
| `theme.settings.get('use_theme_font'/'footer_is_dark'/'sticky_add_to_cart')` ternaries | pre-existing; boolean ternaries emitting **fixed literal** classes only |
| `hadeel_resolved.{id}` ×6 | every value comes from the resolver, which only ever assigns an allowlisted value (`hadeel_allowed[id]`), a profile-map value validated against the allowlist, or `hadeel_safe[id]`; the T027 garbage-matrix test (16 invalid shapes × 5 modes × 4 profiles × 6 followers) proves the emitted class is always exactly `prefix + allowlisted value` |
| `hadeel-preset-{{ hadeel_profile }}` / `data-hadeel-preset` | `hadeel_profile` is `hadeel_profile_raw` only when `hadeel_profile_raw in hadeel_profiles\|keys`, else the literal `'modern'` — raw profile text never renders |
| `data-hadeel-preset-sources` | built only from internal follower IDs and the fixed `legacy/custom/preset/safe_default` tokens |
| `data-hadeel-preset-review` | built only from internal setting IDs; renders whenever the aggregated review list is non-empty — engine-on flags **and** engine-off invalid legacy (corrected in the Final Review fix; previously engine-on only) |
| `trans('…')`, `'app.js'\|asset`, `page.slug`/`store.scope` ternaries | locale strings, asset filter, and fixed-literal ternaries; not merchant setting text |

The resolver never concatenates `theme.settings.get()` output into a class or attribute; contract step 8 holds in the shipped template.

## 3. Strict registry check (same state)

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

## 4. Theme guard with production build sync (same state)

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

## 5. Hygiene

```bash
git diff --check
```

Exit code `0` (no output). `.vscode/settings.json`, `package.json`, `pnpm-lock.yaml`, `public/`, `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and `.specify/.runtime/hadeel-night-run.md` untouched by this batch; pre-existing unrelated modifications preserved; no commit/push performed.

**Public delta: zero bytes.** Code change in this batch: `src/views/layouts/master.twig` only (resolver inlined from the removed partial; semantics identical — the Twig maps and branches are character-for-character the code the T019 parity test pinned before). `public/` is untouched and matches a fresh production build. No dependency, no new request, no runtime listener/observer/storage, no JS, no CSS.

## Not verified (kept open by policy)

- Rendered fallback/needs_review behavior of the inline resolver on a live Salla storefront: the draft-1402312628 render proved the include-based variant fails at runtime; the inline variant still requires a passing owner-confirmed preview. The Phase 8 matrix (T048–T053) and the rollback drill (T056) remain the behavioral gates.
- Fresh-store materialization and option removal/re-addition (Spike items still unverified; no code depends on them).
