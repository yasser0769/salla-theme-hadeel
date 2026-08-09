# Preset Resolution Contract

## Inputs

- `preset_engine_enabled`
- `preset_profile`
- for each follower: `*_mode` and its unchanged legacy/Custom setting value
- immutable registry allowlists, safe defaults, and four profile maps

## Output

For each family, return one allowlisted `resolved_value`, one `resolved_from`, and one `validation_state`. Rendering may emit the corresponding allowlisted body class and non-customer-facing evidence attributes. It must not persist, delete, normalize, or overwrite merchant input.

The emitted class surface is exactly:

- six resolved families, `hadeel-layout-`, `hadeel-spacing-`, `hadeel-corners-`,
  `hadeel-card-`, `hadeel-header-`, `hadeel-header-density-` + an allowlisted
  value, registered on the six follower records (`class_prefix`);
- while the engine is on, one unstyled evidence marker class
  `hadeel-preset-{profile}` + the normalized profile id, registered on
  `global::preset_profile` as `class_prefix` with `class_marker: true`
  (intentionally no SCSS selector; FR-016 requires representation, not styling);
- non-customer-facing `data-hadeel-preset*` evidence attributes.

Every merchant-input comparison is strict and fails closed: engine activation
uses `is same as` against the four enrolled shapes; profile, mode, and allowlist
comparisons reject non-string raw types before membership is tested. Loose
`in`/`==` against merchant input is a contract violation. Raw input is never
concatenated into a class.

## Algorithm

1. If the engine is disabled, validate the legacy value and emit it; invalid legacy input emits the safe default with `needs_review`.
2. If enabled, validate the profile. Unknown profile input uses `modern` and marks `needs_review`.
3. Validate the mode. An unknown mode marks `needs_review`, then preserves a valid Custom value; if Custom is invalid/missing it uses the normalized profile value.
4. Valid `custom` plus a valid Custom value emits Custom.
5. Valid `custom` plus an invalid Custom value marks `needs_review`, then uses the normalized profile value.
6. Valid `follow_preset` emits the normalized profile's allowlisted value.
7. A missing/invalid normalized profile candidate emits the setting's safe default and marks `needs_review`.
8. Emit exactly one class per family. Raw input is never concatenated into a class.

## Invariants

- Existing six setting IDs, types, option values, and meanings are immutable in HDL-03.
- Engine installation with the activation switch off reproduces the legacy 324-value combination matrix exactly.
- Profile switching writes nothing and changes followers only.
- A valid Custom value survives switch, save/reload, and return from Follow.
- Resolution is deterministic, idempotent, and side-effect free.
- No profile changes content, page/component order, color/font ownership, price, availability, options, or purchase actions.
- No runtime request, client listener, storage write, new bundle, or dependency.

## Failure and rollback

Block or revert the feature commit if a legacy ID/type/option changes destructively, a pre-enrollment storefront changes output, an unknown class is emitted, Custom is lost, any public byte/request/dependency is added, the 320px/commerce matrix regresses, or a contract/build/guard check fails.

Rollback disables/reverts the resolver, rebuilds production output, and replays a saved post-feature fixture containing the new IDs through the legacy path. New IDs may remain stored but must be ignored safely; old values must produce baseline classes byte-for-byte in the test snapshot.
