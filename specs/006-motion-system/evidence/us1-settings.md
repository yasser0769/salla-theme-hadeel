# US1 — Merchant selects a motion personality: independent story result

**Story**: User Story 1 (P1) — the merchant picks Calm, Balanced, or Rich; only the
motion personality changes and Balanced is safe by default.
**Recorded**: 2026-08-10, from the proven Phase A gate results (see the
"Phase A foundation" entry in `tasks.md` → Runtime Log). Written during Runtime
Phase B per the phase plan; Phase A evidence values are reproduced verbatim.

## Independent test (from tasks.md Phase 2)

Resolve each valid level plus an unknown value, compare identical rendered
content/DOM order, and verify the level-specific token caps and mobile
reduction state.

## What was verified (executable, offline)

All commands below were run on this working tree; exact numbers are from the
Phase A run recorded in `tasks.md`.

- `node --test tests/motion-system.test.mjs` — 33 tests, 33 pass, 0 fail at the
  Phase A checkpoint (first run: 14 pass / 19 fail, the expected
  pre-implementation witness). Re-run during Runtime Phase B after the runtime
  test additions: **61 tests, 61 pass, 0 fail** — the settings/resolver/token
  cases still pass unchanged.
- `node scripts/check-motion-system.mjs --strict` — phase 1, 0 errors
  (6 rules ok): `motion-settings`, `motion-resolver`, `motion-tokens`,
  `motion-reveal`, `motion-scroll`, `motion-direction`.
- `node --test tests/settings-preset-engine.test.mjs` — 73 tests, 73 pass,
  0 fail (only the hardcoded global-count 55→58 and exact-additions assertions
  were touched for the three HDL-06 records).
- `node scripts/check-theme.mjs --json` — exit 0, 0 errors, 0 warnings.

Contract points pinned by those suites:

- `motion_level` accepts only `calm`/`balanced`/`rich`; unknown, mistyped, and
  malformed values (including arrays, booleans, numbers, and markup-injection
  strings) resolve to `balanced` — `resolveMotionLevel` reference semantics in
  `scripts/check-motion-system.mjs`, mirrored by the Twig allowlist resolver in
  `src/views/layouts/master.twig` (`hadeel_motion_levels` pinned, exactly one
  `hadeel-motion-{{ hadeel_motion_level }}` class, matching
  `data-hadeel-motion` value, no raw `theme.settings.get` in any class).
- `motion_reduce_mobile` normalization is fail-closed to the four enrolled
  truthy shapes; the mobile-reduction class and data marker are emitted only
  when the normalized value is true.
- Token caps hold per level (Calm ≤160ms / 0px reveal, Balanced ≤240ms / ≤8px,
  Rich ≤400ms / ≤20px with bounded 40ms stagger); the OS reduced override
  converges all three levels to ≤100ms / 0px / stagger-off; the mobile Rich cap
  aliases Rich to Balanced values under `.hadeel-motion-rich.hadeel-motion-reduce-mobile`
  at `max-width: 767px`.
- Both legacy product settings keep their exact IDs, types, options, and stored
  defaults (`product_add_to_cart_animation` items/tada;
  `product_add_to_cart_animation_interval` number/6). During Runtime Phase B
  the interval's registry description was updated to state the explicit
  compatibility no-op — after its consumption was actually removed.
- Settings Matrix: `static-motion-title` (structural), `motion_level` (basic,
  default balanced), `motion_reduce_mobile` (advanced, default true), plus the
  two preserved legacy advanced settings — all registered in
  `src/config/settings-registry.json` with HDL-06 ownership and bilingual labels.

## Acceptance criteria coverage

1. Level switch changes motion personality only: the level resolves to exactly
   one body class + data value; content, DOM order, and commerce templates are
   untouched by the resolver (verified statically — rendered-storefront
   confirmation is a T032/T033 live-preview gate, not claimed here).
2. Default first-open behavior is Balanced: `motion_level` default is
   `balanced` and the resolver falls back to `balanced` for any unknown stored
   value.

## Not verified here (explicit)

- Rendered Salla storefront behavior after save/re-render (live preview gates
  T031–T033).
- Production build, `--build` sync, and bundle budgets (T028–T030).
