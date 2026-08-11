# HDL-07 Foundation Tests — T015

**Recorded at**: 2026-08-10T22:28:03Z (UTC)
**Branch**: `codex/hdl-07-header-layouts` (baseline SHA `e261352d8e3796f0e30ca3663de121368764d901` + uncommitted T001–T014 working-tree changes; nothing committed by this phase)

Exact command outputs. Failing-first runs were captured before the T012–T014
source edits; passing runs after them.

## Failing-first (before T012–T014 source edits)

- `node --test tests/header-layouts.test.mjs` → exit 1, 13 failing tests, all
  on the not-yet-implemented surface (twilight declarations, registry records,
  resolver, SCSS hooks); the guardrail tests (single core, Hero confinement,
  runtime budget, fixture resolution, legacy byte-identity) passed already.
  Full output: `evidence/tests/t009-failing-first.txt`.
- `node scripts/check-header-layouts.mjs --strict` → exit 1, **23 error(s)**;
  witness already functional: 27 fixture cases resolved, the deliberately
  invalid witness rejected. Full output: `evidence/tests/t010-failing-first.txt`.
- `node scripts/check-theme.mjs --json` → exit 1, `errors: 23, warnings: 0` —
  all 23 from the new `header-layouts` check; every pre-existing check
  remained at zero (integration weakened nothing).

## Passing (after T012–T014)

| Command | Exit | Result |
|---|---:|---|
| `node --test tests/header-layouts.test.mjs` | 0 | tests 24, pass 24, fail 0 (full output: `evidence/tests/t009-passing.txt`) |
| `node --test tests/settings-preset-engine.test.mjs` | 0 | tests 73, pass 73, fail 0 |
| `node --test tests/localization-rtl-accessibility.test.mjs tests/motion-system.test.mjs tests/performance-bundle-ci.test.mjs` | 0 | tests 177, pass 177, fail 0 |
| `node scripts/check-header-layouts.mjs --strict` | 0 | 0 error(s); 27 fixture cases resolve; invalid witness rejected (full output: `evidence/tests/t010-passing.txt`) |
| `node scripts/check-theme.mjs --json` | 0 | errors 0, warnings 0 |
| `node scripts/check-theme.mjs --build --json` | 0 | errors 0, warnings 0 (public/ matches a fresh production build) |
| `node scripts/check-bundle-budget.mjs --budget` | 0 | Compressed theme package 480,417 / 1,000,000 B — PASS; 0 error(s); pre-existing `checkout.js` +3 B telemetry WARN unchanged |
| `node scripts/check-bundle-budget.mjs --update` | 0 | manifest ratcheted after the verified `--build` pass (sanctioned path; src file hashes/sizes re-recorded) |
| JSON parse: twilight.json, settings-registry.json, fixture, spec-index.json, bundle-budget.json | 0 | all valid |
| `git diff --check` | 0 | clean |

Total deterministic tests: **274 pass / 0 fail**.

## Production build and bundle delta

`npx webpack --mode production` → exit 0 (3 pre-existing size warnings).

| File | Baseline (T007) | After T014 | Delta | Cap |
|---|---:|---:|---:|---:|
| `public/app.css` | 799,430 B | 799,754 B | **+324 B** | ≤ +12,288 B |
| `public/app.js` | 116,474 B | 116,474 B | **+0 B** | ≤ +4,096 B |
| Compressed package | 478,773 B | 480,417 B | +1,644 B | < 950,000 B target |

No dependency, entry, chunk, media, or font changes.

## Normalized CSS delta (snapshot evidence)

`node scripts/css-snapshot.mjs` before → 6,772 rules; after → 6,777 rules.
`diff -u` shows exactly 5 added rules, zero removed or modified
(`evidence/tests/t014-css-delta.txt`; snapshots at
`evidence/css-snapshot-before.txt` and `evidence/css-snapshot-after-t015.txt`):

1. `.hadeel-header-transparent` → `--hadeel-header-transparent-ink: var(--hadeel-ink)` (foundation token hook; no visual change)
2. `.hadeel-header-commerce` → `--hadeel-header-commerce-search-min: 280px` (foundation token hook; no visual change)
3. `@media(min-width:1024px) .hadeel-header-logo-small .navbar-brand img` → `max-height: 40px`
4. `@media(min-width:1024px) .hadeel-header-logo-medium .navbar-brand img` → `max-height: 52px` (= pre-HDL-07 desktop cap; default renders identically)
5. `@media(min-width:1024px) .hadeel-header-logo-large .navbar-brand img` → `max-height: 64px`

## Interface-change adaptations in existing tests (not logic changes)

- `tests/settings-preset-engine.test.mjs` T018: combination-space pin updated
  324 → 648 (3×3×3×3×4×2) because `header_layout` gained two approved values;
  the legacy 324 space is a strict subset and still resolves byte-identically.
- Same file T039: global record count pins 58 → 63 and the approved-additions
  list extended with exactly the five HDL-07 ids.
- `src/config/bundle-budget.json`: regenerated via `--update` (never
  hand-edited) after the `--build` gate passed, re-recording the changed
  `storefront-system.scss`, `master.twig`, and `twilight.json` hashes/sizes.

## Phase-1 checkpoint state

- Invalid input cannot reach a class/attribute: proven by 15 invalid fixture
  cases (unknown values, booleans, numbers, arrays, empty/whitespace strings,
  CSS-injection string) resolving to safe defaults, plus the rejected
  raw-passthrough witness.
- Legacy `centered|start` resolution is identical: fixture cases
  `legacy_centered`/`legacy_start`, byte-identity test, HDL-03 engine-off
  parity suite (73/73), and a normalized CSS diff containing only additions.
- All new controls have independent safe defaults: `header_transparent_home=true`,
  `header_show_search=true`, `header_show_account=true`, `header_logo_size=medium`,
  `header_transparent_ink=auto`; editor conditions are the proven equality shape
  and are presentation-only.

## Explicitly not verified here

Rendered Salla runtime behavior (transparent overlay, sticky measurement,
mobile states) — by design deferred to the isolated preview checkpoint in
Phases 5–6. The 3 webpack size warnings and the `checkout.js` +3 B telemetry
warning are pre-existing baseline conditions, unchanged.
