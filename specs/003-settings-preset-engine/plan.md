# Implementation Plan: HDL-03 — Settings Architecture and Preset Engine

**Branch**: `codex/hdl-03-settings-preset-engine` | **Date**: 2026-08-08 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/003-settings-preset-engine/spec.md`  
**Roadmap ID**: `HDL-03`  
**Design handoff**: [Approved Figma Revision 1](design.md)  
**Baseline commit**: `5deac563f21210529124c2c0a9101ab5befde4e1`

## Summary

Build a server-rendered preset-resolution layer over Hadeel's existing six global visual controls without forking Twig, CSS, or JavaScript. A merchant explicitly enables the engine, selects one of four canonical profiles, and chooses `follow_preset` or `custom` per supported setting. Existing setting IDs remain the stored custom values, so switching profiles never overwrites merchant data. Invalid values resolve through allowlisted safe defaults and are exposed as a traceable `needs_review` state rather than becoming CSS classes.

The implementation adds no dependency, client-side resolver, network request, or preset-specific bundle. It reuses the current body-class contracts and CSS already present in `storefront-system.scss`. Final visual tuning of the four profiles remains owned by HDL-24…HDL-27.

## Design Gate Check *(blocking)*

- [x] `design.md` records the approved Figma page, root, boards, and direct critical-frame Node IDs.
- [x] Yasser wrote the exact approval statement `APPROVE HDL-03 REV 1` on 2026-08-08.
- [x] Arabic mobile/desktop RTL and English mobile/desktop LTR show the same values and states.
- [x] Follow → Custom → profile switch → Custom persistence is explicit.
- [x] Safe, Blocked, Needs Review, focus, long labels, and ownership boundaries are covered where applicable.
- [x] Unsupported Salla behavior remains a non-selectable Spike rather than an implementation claim.

## Technical Context

**Platform**: Salla Twilight theme; server-rendered Twig with merchant configuration from `twilight.json`  
**Source of truth**: GitHub repository and approved Figma Revision 1; rendered Salla storefront is the behavioral acceptance environment  
**Build**: `npx webpack --mode production`  
**Guard**: `node scripts/check-theme.mjs --build` plus the feature-specific registry/resolution checks planned below  
**Target pages**: every page extending `src/views/layouts/master.twig`; the critical preview flow uses home, product, and collection pages  
**Existing implementation**: six settings already render allowlisted body-class families from `master.twig`; matching variants live in `storefront-system.scss`  
**Salla APIs/components**: `theme.settings.get()` and the documented `twilight.json` global setting types; no client-side Salla component or API is required  
**Testing**: deterministic Node contract checks, production build/guard, CSS snapshot, and a rendered Salla matrix covering Arabic/English × 320px/mobile/desktop  
**Performance goals**: 0 new runtime requests, 0 JavaScript bytes, 0 duplicate preset bundles, and a public-output byte delta of 0 for HDL-03  
**Accessibility goals**: setting state is named in text, not color-only; storefront output preserves existing focus/DOM order; no content or purchase action is hidden by a preset  
**Localization**: storefront copy uses locale keys only; Salla settings-panel label localization remains the bounded platform exception described under Complexity Tracking  
**Scale/scope**: current 45 global setting records (37 interactive, 8 static), all 62 recursively declared component/nested fields, 4 profiles, 6 preset-aware settings, 8 new interactive global controls, 1 static explanatory record, and 1 static Presets group-title record

## Constitution Check *(GATE)*

- [x] **Conversion > customization > polish**: profiles only affect visual classes; price, availability, content, options, and purchase actions remain unchanged.
- [x] **One Salla theme and one shared core**: one resolver and the current class families serve all four profiles.
- [x] **Components by responsibility**: global settings remain global; component-specific fields remain owned by their component Specs.
- [x] **Mobile/Arabic first with RTL/LTR parity**: approved Revision 1 and the preview matrix cover both directions and viewports.
- [x] **Incremental performance/accessibility budget**: HDL-03 adds zero public bytes/requests/runtime work. The inherited 1,557,969-byte public-release breach remains a failed project gate owned by HDL-05 and is not hidden or waived here.
- [x] **Evidence chain**: approved Figma → repository contracts/source → post-change Salla preview evidence.
- [x] **Audit before build**: the 45-record baseline, six body-class settings, existing conditions, and current build output were measured before planning.
- [x] **Identity/trust/localization/security**: profiles are Hadeel-owned composition maps, no copied code/assets/content, no fabricated commerce data, raw HTML, external scripts, or untrusted class interpolation.
- [x] **Exceptions documented**: the settings-panel localization limitation is bounded below with owner, expiry, and remediation.

**Gate result before Phase 0**: PASS for HDL-03 implementation. Public release remains blocked independently by HDL-05.

## Architecture and Resolution Flow

1. `preset_engine_enabled=false` is the compatibility boundary. While disabled, `master.twig` emits the six existing classes from the six existing setting values exactly as today.
2. Enabling the engine is the merchant's explicit enrollment in the preset contract. Only after that enrollment do the new mode defaults take effect; no pre-HDL-03 storefront output changes merely because the schema was installed.
3. When explicitly enabled, `preset_profile` is validated against `luxury`, `modern`, `minimal`, and `practical_digital`; an unknown value falls back to `modern`.
4. Each supported setting has a separate `*_mode` control with `follow_preset` or `custom`. Its existing setting ID remains the custom-value store.
5. Resolution order is deterministic: valid Custom → valid normalized-profile value → documented safe default. An invalid `custom` value or unknown mode marks `needs_review` but still tries the validated profile before the safe default; an unknown mode uses a valid preserved Custom value first.
6. The resolver validates every chosen value against the existing option allowlist before interpolating a class. Unknown input never reaches a CSS class.
7. The renderer emits one resolved class per family plus `hadeel-preset-{id}` and a non-customer-facing validation data marker for preview/test evidence.
8. Switching profiles reads but never writes existing setting values; all Custom values therefore remain available when their mode returns to `custom`.
9. Profile maps compose only existing classes. HDL-24…HDL-27 may refine the maps/tokens through new approved revisions without copying implementation trees.

## Existing-Code Reuse Map

| Requirement | Existing files/components | Classification | Reuse/change |
|---|---|---|---|
| FR-001 Basic/Advanced grouping | `twilight.json` static titles and confirmed boolean `conditions` shape | Existing — Audit & Polish | One explicit Presets group: `static-presets-title` (format `title`) opens it; it holds the engine, profile, scope note, and six modes in Basic-before-Advanced order; legacy controls stay outside. Condition only new engine controls on the enable boolean; do not invent condition syntax. Only `format: title|line` statics are group boundaries — a `format: description` note never splits a group. The checker's `group-order` and `presets-group` rules enforce both. |
| FR-002 one core | `master.twig`; one `app.scss` entry | Existing — Audit & Polish | Add one global resolver include; no preset-specific entries or page trees. |
| FR-003/004 profile selector/maps | Absent; current setting option allowlists | Build | Add one selector and four bootstrap composition maps using existing values; final art direction stays Deferred. |
| FR-005…007 Follow/Custom | Six current setting IDs and class families | Build | Add six mode controls; retain current IDs as persistent Custom stores; never mutate them on a profile switch. |
| FR-008…011 registry | `twilight.json`; `scripts/check-theme.mjs` declared/used key scan | Existing + Build | Add a machine-readable sidecar registry and strict recursive validator; preserve the existing guard. |
| FR-012/016 fallback/allowlist | Existing dropdown options and matching SCSS classes | Existing + Build | Validate preset, mode, and resolved value before rendering; fail closed to per-setting defaults. |
| FR-013 zero network | Server-rendered body classes | Existing | No JS resolver, API, storage, or network path. |
| FR-014 no import/reorder | Current Salla page/component rendering | Existing | Resolver does not touch page/component content or ordering. |
| FR-015 real effect only | Current six class families | Existing | Every new control maps to an observable resolved class or is rejected by the registry check. |
| FR-017 safe commerce/320px | Existing price, availability, purchase, and responsive components | Existing — Audit & Polish | Verify they remain visible and usable in the live matrix; no profile selector may hide them. |

## Salla Feasibility & Research

| Question | Evidence | Decision | Fallback |
|---|---|---|---|
| Can global values be declared and read? | [Official `twilight.json` docs](https://docs.salla.dev/421921m0); `docs/salla-twilight-notes.md` §4; current `master.twig` | Confirmed | Undeclared IDs are forbidden by the existing guard. |
| Which control families are documented? | [Official theme setup docs](https://docs.salla.dev/421879m0) document String, Numeric, Boolean, List, and Collection | Confirmed | Use only existing boolean/items shapes. |
| Can Advanced controls use conditions? | Current `twilight.json` has three working boolean equality conditions for installment providers; the exact `{id, operation: "=", value: true}` shape was **live-verified** on owner-confirmed draft `797574311` (T007 §1) | Confirmed only for that exact shape | If a live panel rejects reuse, controls remain visible and clearly labeled; runtime correctness does not depend on hiding them. |
| Does `theme.settings.set()` persist merchant choices? | Local Twilight notes and `master.twig` show it as an in-render global variable helper; no official persistence contract was found | Not a persistence API | Never call it to save modes or Custom values. Salla persists declared controls; switching a profile performs no writeback. |
| Can theme-setting labels/options be localized through theme locale keys? | Official localization docs cover storefront `trans()` and locale files; official settings examples use literal labels; current `multilanguage` applies to merchant-entered field values, not control labels | Spike / not confirmed | Keep registry `label_ar`/`label_en`; add no claim of automatic panel-language switching. Apply the bounded exception below until Salla documents a label schema. |
| Can the theme distinguish old and new installations for automatic migration? | No install-version or stored-vs-default API is documented locally or officially | Not confirmed | Explicit opt-in enable switch defaults off, preserving every existing storefront until the merchant enables the engine. |
| Can invalid legacy input show a dynamic admin warning? | The theme controls storefront rendering but not Salla's settings-panel validation UI | Spike / not selectable | Safe fallback + `needs_review` test marker + registry report; never expose a customer warning or overwrite the stored value. |

### Blocking migration/editor Spike before source changes

Use one store configured before the schema change and one fresh disposable store. Capture persisted and rendered shapes before/after save for Boolean, String, single-choice Items, an unset field, new-setting defaults, existing default/non-default values, companion modes, and added/removed options. In the actual Salla editor, verify the exact global `conditions` shape, hidden-value persistence, and whether any supported metadata distinguishes a pre-existing merchant from a fresh installation. If the platform does not expose that distinction—as current evidence indicates—the explicit disabled-by-default enrollment boundary is mandatory and automatic migration is prohibited.

**Spike outcome (T005–T009, owner-confirmed drafts):** the exact equality-condition shape and hidden-value persistence **passed** live (draft `797574311`); companion-mode defaults are editor-presentation defaults until first save, so dormancy behind `preset_engine_enabled=false` stays mandatory; option removal/re-addition churn remains **not verified** and is **not relied on** (legacy option lists unchanged; runtime allowlists reject unknown values); fresh-draft materialization was captured on draft `524850391` without any fresh-install overclaim; no fresh-versus-existing marker exists (T008). See `evidence/migration-spike/gate-result.md`.

## Settings Architecture

### New controls

| Setting | Owner | Tier | Default | Conditions | Allowed values / role |
|---|---|---|---|---|---|
| `preset_engine_enabled` | HDL-03 global | Basic | `false` | none | Explicit migration/activation boundary. |
| `preset_profile` | HDL-03 global | Basic | `modern` | enabled = true | `luxury`, `modern`, `minimal`, `practical_digital`. |
| `layout_width_mode` | HDL-03 global | Basic | `follow_preset` | enabled = true | `follow_preset`, `custom`; Custom value stays in `layout_width`. |
| `section_spacing_mode` | HDL-03 global | Basic | `follow_preset` | enabled = true | Same contract; Custom value stays in `section_spacing`. |
| `corner_style_mode` | HDL-03 global | Basic | `follow_preset` | enabled = true | Same contract; Custom value stays in `corner_style`. |
| `product_card_style_mode` | HDL-03 contract; variants HDL-10 | Advanced | `follow_preset` | enabled = true | Custom value stays in `product_card_style`. |
| `header_layout_mode` | HDL-03 contract; variants HDL-07 | Advanced | `follow_preset` | enabled = true | Custom value stays in `header_layout`. |
| `header_density_mode` | HDL-03 contract; variants HDL-07 | Advanced | `follow_preset` | enabled = true | Custom value stays in `header_density`. |

The `follow_preset` defaults above are dormant while `preset_engine_enabled=false`. They become operative only after explicit enrollment. The migration Spike must verify how Salla materializes these defaults; it may not weaken the disabled compatibility boundary or overwrite any of the six legacy values.

One non-interactive static record may explain that profile switching changes Follow fields and preserves Custom fields. It is not a dynamic impact summary, does not mutate sibling controls, and is subject to the documented settings-panel localization exception.

### Bootstrap profile composition

| Profile | Layout | Spacing | Corners | Card | Header | Density | Ownership note |
|---|---|---|---|---|---|---|---|
| `luxury` | `wide` | `spacious` | `rounded` | `elevated` | `centered` | `comfortable` | Safe bootstrap; final identity HDL-24. |
| `modern` | `wide` | `balanced` | `square` | `minimal` | `centered` | `comfortable` | Matches the current defaults for a stable activation path; final identity HDL-25. |
| `minimal` | `wide` | `spacious` | `square` | `minimal` | `centered` | `comfortable` | Safe bootstrap; final identity HDL-26. |
| `practical_digital` | `compact` | `compact` | `soft` | `bordered` | `start` | `compact` | Safe bootstrap; final identity HDL-27. |

`use_theme_font` remains merchant-controlled and never follows a profile. Store color/font runtime properties likewise remain outside preset resolution.

## Registry and Contract Strategy

- `src/config/settings-registry.json` is the machine-readable sidecar. It records every global setting and recursively identified component field with source path, owner, scope, tier, default/fallback, allowed values, preset/override support, Arabic/English registry labels, and evidence state.
- `scripts/check-settings-registry.mjs` compares the sidecar with `twilight.json`, the approved profile contract, all `theme.settings.get()` consumers, and body-class mappings. It fails on duplicate/missing IDs, missing owner/default/fallback/source, unknown options, or unrecognized class values.
- The runtime resolver is intentionally small and server-rendered. The checker, not CSS source order, guarantees that its profile map and setting allowlists stay synchronized.
- Component fields may be `Deferred` to their owning Spec but must still be present with an owner and source; Deferred is not a missing record.
- Registry identity is scope-qualified: globals use `global::<id>` and component fields use `<component.path>::<nested-field-path>`. Repeated raw component-local IDs are legal; duplicate qualified keys are not.
- Default no-op variants (`minimal`, `centered`, `comfortable`) are marked `base_variant: true`; non-default class values require an explicit SCSS selector. The checker must not demand decorative empty selectors.
- Every emitted class family is registered: the six resolved families on their follower records, and the engine-on evidence marker class `hadeel-preset-{profile}` on `global::preset_profile` as `class_prefix` with `class_marker: true` (unstyled by design, so no SCSS selector and no public CSS delta). The checker's `twig-resolved` and `twig-preset-marker` rules fail on any prefix/ID mismatch or missing emission.

## Bounded Platform Deviations

- A theme cannot currently prove a write-capable Salla editor API for a dynamic pre-save impact summary or a destructive batch reset of multiple settings. Revision 1 remains the product-intent reference, but implementation may only provide static explanatory copy plus the observable resolved-class summary in the rendered preview.
- Per-setting return to `follow_preset` is implementable and required. Batch Reset All remains a non-selectable Spike until Salla exposes a confirmed multi-setting write/confirmation contract; it must not be simulated with storefront JavaScript, storage, or an external app.
- Figma's `24 px` value is illustrative. The real `corner_style` allowlist remains `square` (0), `soft` (8), and `rounded` (16); HDL-03 must not invent a 24px option.
- Hidden-value persistence under the exact tested equality-condition shape is now live-verified (T007 §4, draft `797574311`). HDL-03 still keeps Custom fields visible as the conservative choice: option churn was never verified, and runtime safety never depends on visibility. Conditions hide only the new engine controls on the enable boolean.

## Bundle, Network, and Runtime Budget

- **Baseline public output**: 33 files, **1,557,969 bytes**; `app.css` 802,732 B and `app.js` 128,388 B at `5deac563`.
- **Compressed reference**: `app.css` 105,052 B gzip; `app.js` 36,981 B gzip.
- **Maximum HDL-03 increase**: **0 public bytes**. The planned change is Twig/config/scripts only and reuses existing CSS classes.
- **New dependencies**: none; `package.json` and `pnpm-lock.yaml` are out of scope.
- **Network requests**: 0 before / 0 after for preset resolution.
- **Runtime work**: bounded server-side scalar comparisons during render; 0 client listeners, observers, storage writes, or hydration.
- **Inherited release gate (corrected 2026-08-10)**: HDL-05 gates the deterministic compressed distributable-theme estimate against Salla's 1 MB ceiling. Raw `public/` is telemetry; HDL-03's zero-byte delta remains a valid regression constraint.
- **Rollback trigger**: any public byte delta, duplicated preset selectors/styles, new request, lost Custom value, unknown class, visible commerce regression, or unapproved Figma deviation.

## Project Structure

### Documentation

```text
specs/003-settings-preset-engine/
├── spec.md
├── design.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   ├── settings-registry.schema.json
│   ├── preset-resolution.md
│   └── verification-evidence.md
├── evidence/                # generated Spike, test, live-preview, and final evidence
├── quickstart.md
└── tasks.md                 # generated in the next SpecKit phase
```

### Source and validation

```text
twilight.json
src/
├── config/
│   └── settings-registry.json
└── views/
    └── layouts/master.twig      # resolver inline: Salla does not package a new top-level partials/ dir (draft 1402312628)
scripts/
└── check-settings-registry.mjs
tests/
└── settings-preset-engine.test.mjs
public/                      # production rebuild only; expected byte-identical
```

**Structure Decision**: use one global Twig resolver because all pages inherit `master.twig`; retain current setting IDs and class owners; add standalone Node checks rather than changing dependencies or creating a second runtime layer.

## Verification Matrix

| Page/flow | Mobile RTL | Desktop RTL | Mobile LTR | Desktop LTR | Browser/device | Evidence |
|---|---|---|---|---|---|---|
| Engine disabled preserves current classes | 320 | 1366 | 320 | 1366 | Chromium | Post-change DOM class capture + screenshots |
| Each profile, zero Custom overrides | 320 | 1366 | 320 | 1366 | Chromium | Resolved-class matrix from live Salla preview |
| One Custom mode survives profile switch | 320 | 1366 | 320 | 1366 | Chromium keyboard + pointer | Before/after settings values, DOM classes, screenshots |
| Invalid preset/mode/custom fallback | 320 | 1366 | 320 | 1366 | Node contract + Chromium marker | Feature test output + safe live class marker |
| Price, availability, product options, primary CTA | 320 | 1366 | 320 | 1366 | Product page | Visible-state screenshots and DOM measurements |
| Header/card/spacing/corners composition | 320 | 1366 | 320 | 1366 | Home | Screenshot comparison against approved intent |
| Long Arabic/English labels and focus order | 320 | 1366 | 320 | 1366 | Chromium keyboard-only pass | Focus sequence and overflow measurements |

The executed matrix used the repository task contract of `320×800` and
`1366×768`; the earlier `1440` planning target was not executed and is not
claimed. WebKit/Safari was unavailable in this Salla editor workflow and is
**not verified**; cross-browser coverage remains a release-hardening item for
HDL-29. This correction records the evidence actually captured and does not
weaken HDL-03-FR-017: the product-route 320px overflow remains an open
acceptance finding.

## Rollback and Compatibility

- Disabling `preset_engine_enabled` is the immediate functional rollback and restores the exact six current setting values.
- Removing the eight new controls and resolver include returns the repository to the baseline without migrating or rewriting stored merchant values.
- Existing IDs and meanings never change. No task may replace an existing value, delete an option, or silently reset a merchant choice.
- `modern` mirrors current defaults, but explicit opt-in remains mandatory because non-default existing merchant values cannot be distinguished from defaults through a documented Salla API.
- If Salla rejects the new condition usage, keep controls visible and rely on labels/modes; do not change the resolution contract or guess another schema.
- If a profile value is unavailable because its owner Spec is not complete, resolve to the documented bootstrap map; do not expose an unfinished value.

## Complexity Tracking

| Constitution Exception | Why Needed | Simpler Alternative Rejected | Owner | Expiry/Remediation |
|---|---|---|---|---|
| New Salla settings-panel labels cannot be proven to consume `src/locales` keys | Official settings schema/examples accept literal `label`/option strings, while official localization docs describe storefront `trans()` only. Omitting labels would make controls unusable; inventing a localized label object would be unsupported. | Locale keys as literal labels (would show raw keys); a custom admin app (violates one-theme scope); claiming `multilanguage` localizes labels (unsupported). | Yasser via approved HDL-03 Spec/Revision 1 | Registry must carry Arabic and English; Spike must be rechecked at HDL-28 marketplace preparation or earlier Salla schema evidence. Replace literals when a supported panel-label contract exists. |

No runtime, bundle, security, or architecture exception is requested.

## Post-Design Constitution Re-evaluation

- [x] Phase 0 decisions use documented Salla controls or bounded Spikes; none guesses persistence, localization, or migration APIs.
- [x] Phase 1 contracts enforce one resolver, explicit ownership, allowlists, safe defaults, and no writeback.
- [x] The design creates no dependency, network request, duplicated runtime tree, or public bundle growth.
- [x] Compatibility rollback is explicit and preserves all current merchant values.
- [x] Live storefront evidence remains mandatory before Final Review and owner acceptance.

**Gate result after Phase 1**: PASS for Tasks generation. The project-wide public-release size gate remains FAILED and owned by HDL-05.
