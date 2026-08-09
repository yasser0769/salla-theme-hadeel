# Phase 0 Research — HDL-03 Settings Architecture and Preset Engine

**Date**: 2026-08-08  
**Baseline**: `5deac563f21210529124c2c0a9101ab5befde4e1`  
**Status**: Complete; no unresolved `NEEDS CLARIFICATION` items

## R-001 — Keep one server-rendered resolution boundary

**Decision**: Resolve the six preset-aware settings once from `master.twig` through one included Twig partial. Emit only validated existing body-class values.

**Rationale**: All six settings are currently consumed at this boundary. The theme already owns the corresponding class families and needs no client runtime.

**Rejected**: client-side resolution, one Twig/CSS tree per preset, runtime JSON fetches, or a Salla app. Each adds divergence, requests, or persistence behavior not required by the feature.

## R-002 — Preserve legacy values and require explicit enrollment

**Decision**: Keep the six existing IDs, types, options, and values unchanged. Add `preset_engine_enabled=false` as the compatibility boundary. Existing output remains authoritative until the merchant explicitly enables the engine.

**Rationale**: Salla exposes no documented installation age, stored-versus-default marker, schema version, or setting-existence API. `theme.settings.get(id, fallback)` is a render read; its fallback is not migration metadata.

**Rejected**: repurposing an existing value as `follow_preset`, changing legacy defaults, or automatically enabling the engine. These can silently replace saved merchant choices and make source rollback emit unknown classes.

## R-003 — Store mode separately from Custom value

**Decision**: Add one `*_mode` setting per supported setting. The old setting remains the Custom store. While enrolled, `follow_preset` is the mode default; switching profiles never writes a legacy setting.

**Rationale**: Separate persistence is the only theme-only design that retains a Custom value across switches and allows a one-field return to Follow.

**Rejected**: a single sentinel in a legacy field or `theme.settings.set()`. The sentinel destroys the previous value; Salla's pinned Raed source demonstrates `set()` as render-context assignment, not merchant persistence.

## R-004 — Limit settings schema to proven shapes

**Decision**: Use only existing Boolean and single-choice Items shapes, existing option/default conventions, and the exact equality condition shape already present in Hadeel. Treat global cross-group conditions as unverified until a live editor Spike passes.

**Evidence**: [Salla Twilight JSON](https://docs.salla.dev/421921m0), [theme setup field types](https://docs.salla.dev/421879m0), and pinned [theme-raed `twilight.json`](https://github.com/SallaApp/theme-raed/blob/3bd09f11f8d9a2a346838acbe78861eae7826c47/twilight.json).

**Rejected**: invented condition operators, compound logic, or undocumented label objects.

## R-005 — Settings-panel localization remains a bounded exception

**Decision**: Record `label_ar` and `label_en` in the registry, but do not claim Salla will localize field or option labels from theme locale files.

**Rationale**: Official localization documentation covers storefront `trans()` and merchant-entered multilingual values. No primary source proves `{ar,en}` label objects or locale keys for editor controls.

**Rejected**: `multilanguage` on item labels or undocumented label objects. Recheck by HDL-28 or sooner if official evidence appears.

## R-006 — Use a qualified registry identity

**Decision**: Identify globals as `global::<id>` and component/nested fields as `<component.path>::<nested-field-path>`. Enforce uniqueness only on qualified keys and within each scope.

**Rationale**: The current file has 107 recursive field records: 45 globals and 62 component/collection fields. Component-local IDs such as `title` legally repeat; raw whole-file uniqueness would create false failures.

**Rejected**: a flat raw-ID registry or a registry containing only Twig-consumed globals. Both leave ownership gaps.

## R-007 — Validate class mappings without decorative CSS

**Decision**: Every class-producing value is allowlisted. Non-default variants require an owned SCSS selector; `minimal`, `centered`, and `comfortable` are explicit `base_variant: true` values whose behavior comes from base rules.

**Rationale**: These defaults are valid today even though they intentionally need no dedicated selectors.

**Rejected**: empty CSS selectors solely to satisfy a checker, or raw string interpolation into class names.

## R-008 — Keep the feature bundle-neutral

**Decision**: Add no dependency, Webpack entry/chunk, runtime request, CSS rule, or JavaScript. HDL-03's maximum `public/` delta is zero bytes.

**Rationale**: The existing six class families can represent the bootstrap profiles. The current committed public output is already 1,557,969 bytes, above Salla's documented 1 MB publication ceiling; HDL-05 owns reduction and HDL-03 may not worsen it.

**Rejected**: preset-specific stylesheets, duplicated selector trees, or editor/storefront scripts.

## R-009 — Treat unsupported editor actions as Spikes

**Decision**: Implement per-setting return to Follow. Keep dynamic pre-save summaries, destructive Reset All, live admin warnings, and hidden Custom-field persistence as non-selectable Spikes unless the live editor proves a supported contract.

**Rationale**: A Twilight storefront theme has no confirmed API for mutating sibling merchant settings or extending the Salla settings-panel DOM.

**Rejected**: local storage, storefront network calls, or an external app masquerading as native theme-setting persistence.

## R-010 — Verify with deterministic contracts and live Salla evidence

**Decision**: Use Node 20's built-in `node:test`, a strict registry checker integrated into the theme guard, a 324-combination legacy matrix, and signed Salla preview evidence in Arabic/English at 320×800 and 1366×768.

**Rationale**: The package deliberately has no test runner and dependency changes are out of scope. Static tests prove resolution; only Salla-rendered DOM proves platform behavior.

**Rejected**: standalone mockups, demo-store URLs, screenshots predating the source change, or a package dependency added for validation.

## Required migration/editor Spike

Before changing source, compare one pre-schema configured draft with one fresh disposable draft. Record before/after save/reload behavior for Boolean, String, single-choice Items, unset fields, new defaults, explicit default/non-default values, companion-mode defaults, and option additions/removals. Verify the exact global condition shape, whether hidden values survive, Twig return shapes, and whether any supported metadata distinguishes old from new stores.

If the distinction remains unavailable, the disabled-by-default enrollment boundary is final. No implementation may infer installation age, silently migrate a value, or overwrite an invalid legacy value.
