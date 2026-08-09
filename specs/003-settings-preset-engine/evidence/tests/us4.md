# T044 — US4 verification: complete maintainable registry (HDL-03)

**Captured at**: 2026-08-09 (UTC+3 session), after T039–T043 completed
**Commit**: `5deac563f21210529124c2c0a9101ab5befde4e1` (branch `codex/hdl-03-settings-preset-engine`; no commits made by this work)
**Node**: v26.5.0
**Scope**: static + deterministic Node verification only. **No Salla preview was run**; the Phase 8 live matrix remains the behavioral gate.

## What was built (T039–T043)

- **T039** — 4 tests in `tests/settings-preset-engine.test.mjs`: the current registry passes the full strict checker with zero errors (54 global / 62 component / 4 profiles, matching `twilight.json`); all **45 baseline globals** pinned from `evidence/baseline/settings-inventory.json` remain registered with unchanged id/type (the 9 additions are exactly the HDL-03 engine controls); all **62 component/nested records** remain registered under component-path-qualified keys; **legal repeated raw component ids** (`static-desc`×3, `auto_play`×2, `with-bg`×4, `title`×4, `display_style`×2) stay distinct under qualified keys, cross-scope raw-id reuse is witnessed legal, and a global raw-id duplicate is witnessed failing.
- **T040** — 4 mutation-witness tests, one isolated defect per rule, each run through the real checker against a temp registry: missing owner/default/fallback/source → schema rejection; changed legacy type or options → `coverage` drift error at `global::layout_width`; bad profile ids / incomplete maps / a fifth profile → rejection (exactly four canonical ids); illegal values (non-allowlisted profile value, `safe_default` outside `allowed_values`, a seventh preset-aware follower) → rejection with the qualified key.
- **T041** — 3 tests: every non-default class value of every class-producing record has an SCSS selector (theme-owned prefixes) or a compiled class in committed `public/app.css`; `base_variant: true` is exactly the three contract R-007 records — `product_card_style`/`minimal`, `header_layout`/`centered`, `header_density`/`comfortable` — with matching declared defaults; removal of an approved base variant, an invented base variant, and a selector-less class value (`.hadeel-layout-gargantuan`) each fail with the qualified key and the missing selector named.
- **T042** — checker diagnostics upgraded in `scripts/check-settings-registry.mjs`: every finding carries the violated **rule**, the **qualified registry key** (`where`), the record's **twilight.json source path** (`source`, auto-attached for registered keys), and the **expected value** where applicable (coverage drifts, base-variant, mode-pairing, metadata, profiles, allowlist, twig-parity); the CLI prints the new `source:`/`expected:` lines. 2 tests pin the diagnostic shape for both a coverage drift and a document-rule violation. Witness behavior and the approved schema are untouched (the invalid fixture still fails with exactly 8 errors — see §2).
- **T043** — new `twig-settings` rule in `scripts/check-settings-registry.mjs` (full mode only): every static `theme.settings.get('…')` key in `src/views/**/*.twig` (Twig comments stripped, so documentation examples are not read as usage) must be registered as a `global::<id>` record; component-scoped raw ids never satisfy a global read. **33 keys** currently read, all declared and registered. 3 tests: independent rescan, checker rule ok-line, scoped-duplicates witness.

## 1. US4 tests

```bash
node --test tests/settings-preset-engine.test.mjs
```

Exit code `0`. US4 suites, exact output:

```text
▶ T039 US4: all 54 global + 62 component records, legal repeated raw ids
  ✔ the current registry passes the full strict checker with zero errors (28.528012ms)
  ✔ all 54 current global records are registered, including the 45 baseline globals (0.414629ms)
  ✔ all 62 component/nested records are registered under component-qualified keys (1.104898ms)
  ✔ legal repeated raw component ids stay distinct under qualified keys (9.596896ms)
✔ T039 US4: all 54 global + 62 component records, legal repeated raw ids (39.91445ms)
▶ T040 US4: one isolated defect per rule fails with an actionable key
  ✔ missing owner/default/fallback/source metadata is rejected (27.673707ms)
  ✔ changed legacy type or options are caught as drift against twilight.json (46.340552ms)
  ✔ bad profile ids and incomplete maps are rejected (14.517205ms)
  ✔ illegal values are rejected (14.852015ms)
✔ T040 US4: one isolated defect per rule fails with an actionable key (103.686024ms)
▶ T041 US4: selectors for non-default class values; base_variant contract
  ✔ every non-default class value has an SCSS selector or a compiled CSS mapping (1.37569ms)
  ✔ base_variant is true for exactly minimal, centered, and comfortable (0.211648ms)
  ✔ base-variant and selector defects fail loudly with the qualified key (27.907808ms)
✔ T041 US4: selectors for non-default class values; base_variant contract (29.691022ms)
▶ T042 US4: diagnostics carry key, source path, rule, and expected value
  ✔ coverage diagnostics include the qualified key, source path, rule, and expected value (21.924006ms)
  ✔ document-rule diagnostics include the qualified key, source path, rule, and expected value (3.330418ms)
✔ T042 US4: diagnostics carry key, source path, rule, and expected value (25.405314ms)
▶ T043 US4: every theme.settings.get global key is declared and registered
  ✔ every static theme.settings.get key in templates maps to a registered global record (5.06681ms)
  ✔ the checker twig-settings rule passes on the current repository (19.412632ms)
  ✔ component-local duplicate raw ids remain scoped; only global duplicates fail (19.797277ms)
✔ T043 US4: every theme.settings.get global key is declared and registered (44.491125ms)
```

Whole-file summary at the same run: `tests 45, suites 14, pass 45, fail 0` (16 US4 tests added to the 29 US1–US3 tests).

## 2. Strict registry check (with preserved witness behavior)

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

[twig-settings]
    ok   every theme.settings.get global key is declared in twilight.json and registered (33 keys read); component raw ids remain scoped

[witness]
    ok   valid fixture passes document validation
    ok   invalid fixture fails with 8 error(s) as required

registry: 54 global + 62 component/nested records, 4 profiles
0 error(s)
```

## 3. Broken-fixture witness (diagnostic shape through the real CLI)

One isolated defect (`declared_default` of `global::layout_width` changed to `"compact"`) written to a temp copy, then:

```bash
node scripts/check-settings-registry.mjs --registry /tmp/hdl03-broken-registry.json
```

Exit code `1`. Exact failing section:

```text
[coverage]
  FAILED declared_default drift: registry "compact" vs twilight "wide"
         global::layout_width
         source: twilight.json#/settings/6
         expected: "wide"
```

The diagnostic carries the violated rule (`[coverage]`), the qualified registry key (`global::layout_width`), the twilight.json source path, and the expected value — and every other rule still reports `ok` on the same run. The temp file was deleted afterwards; the valid repository is untouched.

Diagnostic witness coverage (each witnessed in the T040–T042 suites): schema shape, qualified-key uniqueness, global raw-id uniqueness, metadata owner/source, mode-pairing, profiles (ids, maps, allowlisted values, deferred owners), base-variant, allowlist selectors/safe defaults, coverage drift (type/options/default/source_path), twig-parity, twig-settings, and the inverted-witness guard.

## 4. Theme guard with production build sync

```bash
node scripts/check-theme.mjs --build --json
```

Exit code `0`: `errors: 0, warnings: 0`; all seven checks `ok` (`duplicate-selectors`, `hardcoded-arabic`, `dead-classes`, `css-variables`, `theme-settings`, `settings-registry`, `build-sync`). **Public delta: zero bytes** — `public/` is untouched and matches a fresh production build; no asset source was modified.

## 5. Hygiene

```bash
git diff --check
```

Exit code `0` (no output). `.vscode/settings.json`, `package.json`, `pnpm-lock.yaml`, `public/`, `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and `.specify/.runtime/hadeel-night-run.md` untouched by this batch; no commit/push performed. Changed files in this batch: `scripts/check-settings-registry.mjs`, `tests/settings-preset-engine.test.mjs`, `specs/003-settings-preset-engine/tasks.md`, and this evidence file.

## Not verified (kept open by policy)

- Live Salla storefront rendering (all Phase 8 gates). The inline resolver still requires an owner-confirmed preview after the draft-1402312628 packaging fix.
- The `twig-settings` rule's negative path is exercised by code review and the T043 mutation witnesses for scoping; an end-to-end negative would require planting an unregistered `theme.settings.get` in `src/views`, which is deliberately not done.
