# T017 — Phase 3 foundation verification (HDL-03)

**Captured at**: 2026-08-08 (UTC+3 session), after T010–T016 completed
**Commit**: `5deac563f21210529124c2c0a9101ab5befde4e1` (branch `codex/hdl-03-settings-preset-engine`, HEAD == approved baseline)
**Node**: v26.5.0
**Scope**: static fail-closed contract work only. T005–T007 remain open; no live-platform claim is made or implied. No Salla preview was run.

## Contract counts

- Registry: **45 global + 62 component/nested = 107 records**, exactly matching a fresh recursive walk of `twilight.json` (0 missing, 0 extra).
- Profiles: exactly `luxury`, `modern`, `minimal`, `practical_digital`; each owns the six bootstrap follower values from the approved plan map and defers `final_visual_identity` to HDL-24/25/26/27 respectively.
- Followers: exactly `layout_width`, `section_spacing`, `corner_style`, `product_card_style`, `header_layout`, `header_density`; each references its future `global::<id>_mode` key (not a registry record until T021).
- Base variants declared: `product_card_style.minimal`, `header_layout.centered`, `header_density.comfortable` (contract R-007). All other rendered class values have SCSS selectors, verified by the checker.
- Witness fixtures: `tests/fixtures/settings-preset-engine/valid.json` passes; `invalid.json` carries 5 seeded defect families and fails.

## 1. Strict registry check

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
    ok   registry matches twilight.json recursively (45 globals, 62 component/nested records)

[twig-parity]
    ok   every twig class interpolation matches a registered prefix and safe default

[witness]
    ok   valid fixture passes document validation
    ok   invalid fixture fails with 8 error(s) as required

registry: 45 global + 62 component/nested records, 4 profiles
0 error(s)
```

## 2. Witness proof — valid fixture passes standalone

```bash
node scripts/check-settings-registry.mjs --registry tests/fixtures/settings-preset-engine/valid.json --document-only
```

Exit code `0` (`0 error(s)`, `registry: 8 global + 4 component/nested records, 4 profiles`).

## 3. Witness proof — invalid fixture fails standalone

```bash
node scripts/check-settings-registry.mjs --registry tests/fixtures/settings-preset-engine/invalid.json --document-only
```

Exit code `1`. Exact output:

```text
[schema]
    ok   registry document conforms to the approved schema

[uniqueness]
  FAILED duplicate qualified key "global::corner_style"
         global::corner_style
  FAILED raw id "corner_style" declared twice in the global scope
         global::corner_style

[metadata]
    ok   every record has an HDL-NN owner and a twilight.json source path

[mode-pairing]
  FAILED mode_setting must be "global::product_card_style_mode"
         global::product_card_style
  FAILED preset-aware followers must be exactly layout_width, section_spacing, corner_style, product_card_style, header_layout, header_density
         got: corner_style, corner_style, header_density, header_layout, layout_width, product_card_style, section_spacing

[profiles]
  FAILED profile "luxury" must defer final_visual_identity to HDL-24
         got: "HDL-99"

[base-variant]
  FAILED base_variant=true is only approved for the three contract R-007 records
         global::layout_width

[allowlist]
  FAILED safe_default "huge" is not allowlisted
         global::section_spacing
  FAILED safe_default "huge" is outside allowed_values
         global::section_spacing

registry: 9 global + 4 component/nested records, 4 profiles
8 error(s)
```

Seeded defects and where they were caught: duplicate qualified key + duplicate raw global id → `uniqueness`; follower without mode key + follower-set drift → `mode-pairing`; wrong deferred identity owner → `profiles`; base variant on a non-base default → `base-variant`; safe default outside the allowlist → `allowlist` (two rules).

## 3a. Independent review mutation — source_path drift (fixed)

GPT-5.6 Sol High independent review demonstrated a false negative: a registry mutant with `global::layout_width.source_path` changed from `twilight.json#/settings/6` to `twilight.json#/settings/999` passed the checker.

**Before fix** (exit code `0` — false negative):

```text
[coverage]
    ok   registry matches twilight.json recursively (45 globals, 62 component/nested records)
```

**After fix** (exit code `1`):

```text
[coverage]
  FAILED source_path drift: registry "twilight.json#/settings/999" vs expected "twilight.json#/settings/6"
         global::layout_width
```

The coverage rule now compares every registry `source_path` against the exact expected path derived by the recursive twilight walk. The same hardening round also replaced the hand-rolled deep-equal with Node's built-in `isDeepStrictEqual`, pinned base variants to the exact approved key→default map (`global::product_card_style→minimal`, `global::header_layout→centered`, `global::header_density→comfortable`; `base_variant=true` anywhere else is rejected, and those three records must declare it), and removed the silent exemption for non-theme class prefixes: `object-cover`/`object-contain` are now verified against the committed `public/app.css` (both present as compiled Tailwind utilities). Fixture (`--document-only`) validation remains independent of the real twilight.json and repository styles.

## 4. Theme guard (static)

```bash
node scripts/check-theme.mjs
```

Exit code `0`. Exact output:

```text
[duplicate-selectors]
    ok   no selector is split across component files

[hardcoded-arabic]
    ok   no hardcoded Arabic outside src/locales

[dead-classes]
    ok   every theme class in SCSS is rendered somewhere

[css-variables]
    ok   every referenced custom property is defined

[theme-settings]
    ok   every setting read by a template is declared in twilight.json

[settings-registry]
    ok   settings registry matches twilight.json and the HDL-03 contracts (strict)

0 error(s), 0 warning(s)
note: build sync not checked — rerun with --build
```

## 5. Theme guard with production build sync

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

**Public delta: none.** `public/` was not touched by this batch and `build-sync` confirms it matches a fresh production build of the unchanged `src/` assets byte-for-byte.

## 6. Whitespace / diff hygiene

```bash
git diff --check
```

Exit code `0` (no output).

## 7. Resolution helper smoke check (T016)

```js
resolveSetting({ engineEnabled: false, profileId: 'modern', mode: 'follow_preset', customValue: 'compact', legacyValue: 'compact' }, layout_width_record, profiles)
// -> {"resolved_value":"compact","resolved_from":"legacy","validation_state":"valid"}
resolveSetting({ engineEnabled: true, profileId: 'luxury', mode: 'follow_preset', customValue: 'compact' }, corner_style_record, profiles)
// -> {"resolved_value":"rounded","resolved_from":"preset","validation_state":"valid"}
resolveSetting({ engineEnabled: true, profileId: 'nope', mode: 'weird', customValue: 'junk' }, header_density_record, profiles)
// -> {"resolved_value":"comfortable","resolved_from":"preset","validation_state":"needs_review"}
resolveBodyClasses({ engineEnabled: true, profileId: 'practical_digital', modes: {}, values: {} }, registry)
// -> classes: hadeel-layout-compact, hadeel-spacing-compact, hadeel-corners-soft,
//    hadeel-card-bordered, hadeel-header-start, hadeel-header-density-compact
//    profile_class: hadeel-preset-practical_digital (exactly one class per family)
```

Full `node:test` suites are T018+ and out of this batch.

## 8. Protected-file state

```bash
git status --porcelain -- twilight.json package.json pnpm-lock.yaml .vscode/settings.json public src/views src/assets src/locales
```

Output: only ` M .vscode/settings.json` — a modification that **predates this session** (recorded in `evidence/baseline/preflight.md`) and was not touched. `twilight.json`, `package.json`, `pnpm-lock.yaml`, `public/`, `src/views/`, `src/assets/`, `src/locales/` are all clean.

## Files added/changed in this batch

- `src/config/settings-registry.json` (new — canonical registry, T010+T011)
- `scripts/check-settings-registry.mjs` (new — strict checker + witness mode, T013+T014; hardened after independent review: exact source_path drift detection, `isDeepStrictEqual`, pinned base-variant map, compiled-CSS verification for non-theme class prefixes)
- `tests/fixtures/settings-preset-engine/valid.json` (new — T012)
- `tests/fixtures/settings-preset-engine/invalid.json` (new — T012)
- `scripts/check-theme.mjs` (modified — additive `settings-registry` check only; no existing check changed, T015)
- `tests/helpers/settings-preset-engine.mjs` (new — pure resolution reference + fixture loaders, T016)

## Unresolved / open

- T005–T007 remain open (SALLA PREVIEW SYNC FAILURE); no live claim in this batch depends on them.
- Live Salla preview verification (T048+) remains open by policy.
