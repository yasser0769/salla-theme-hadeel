# Phase 1 Data Model — HDL-03

## PresetProfile

| Field | Type | Rule |
|---|---|---|
| `id` | enum | Exactly `luxury`, `modern`, `minimal`, `practical_digital`. |
| `version` | positive integer | Increments when an owned mapping changes. |
| `name_ar`, `name_en` | non-empty string | Registry/documentation labels; no unsupported editor-localization claim. |
| `purpose` | non-empty string | Merchant-facing intent, not implementation detail. |
| `owned_values` | object | One allowlisted value for every HDL-03 follower. |
| `deferred_values` | object | Optional future setting → owning Spec; never selectable until implemented. |

Validation: every owned key maps to a global `SettingRecord` with `preset_support=true`; every value is allowed. A profile cannot own content, page order, store colors/font, price, availability, or purchase behavior.

## SettingRecord

| Field | Type | Rule |
|---|---|---|
| `key` | string | Qualified identity: `global::<id>` or `<component.path>::<nested-field-path>`. |
| `id` | string | Exact raw `twilight.json` ID. |
| `scope` | enum | `global` or `component`. |
| `source_path` | string | Exact JSON location or stable component path. |
| `owner_spec` | HDL ID | One accountable owner. |
| `tier` | enum | `basic`, `advanced`, or `structural`. |
| `type` | string | Exact Twilight type. |
| `allowed_values` | array | Exact option values for enums; empty only when type is not enumerable. |
| `declared_default` | mixed | Normalized `selected`/`value`, where the platform declares one. |
| `safe_default` | mixed | Valid render fallback; mandatory for all interactive globals. |
| `preset_support`, `override_support` | boolean | True only when the feature has a real tested effect. |
| `mode_setting` | qualified key/null | Required for each preset-aware follower. |
| `class_prefix` | string/null | Explicit prefix when the value produces a class. |
| `base_variant` | boolean | True only for a valid default implemented by base CSS. |
| `label_ar`, `label_en`, `description` | string | Required documentation metadata. |
| `evidence_status` | enum | `existing`, `build`, `spike`, `deferred`. |

Validation: keys are unique; raw IDs are unique inside a scope only; every recursive Twilight record exists; every global runtime read is declared; existing IDs keep type, meaning, and option values.

## SettingResolution

| Field | Type | Rule |
|---|---|---|
| `setting_key` | qualified key | A preset-aware global record. |
| `engine_enabled` | boolean | False forces exact legacy resolution. |
| `profile_id` | profile enum/raw | Raw input is validated before lookup. |
| `mode` | `follow_preset`/`custom`/raw | Raw input is validated. |
| `custom_value` | mixed | Never mutated by resolution. |
| `resolved_value` | allowed value | Always allowlisted. |
| `resolved_from` | enum | `legacy`, `custom`, `preset`, or `safe_default`. |
| `validation_state` | enum | `valid` or `needs_review`. |

### State transitions

```text
engine disabled ──> legacy allowlist ──> legacy or safe_default
engine enabled + custom ──> valid custom ──> custom
engine enabled + invalid custom ──> normalized profile ──> preset + needs_review
engine enabled + follow ──> valid profile value ──> preset
engine enabled + unknown mode ──> valid preserved custom, else normalized profile ──> needs_review
missing/invalid normalized profile value ──> safe_default + needs_review
profile switch ──> recompute followers only; custom stores unchanged
return one field to follow ──> recompute that field only
```

Resolution is deterministic, idempotent, side-effect free, and returns exactly one value per class family.

## MigrationDecision

| Field | Type | Rule |
|---|---|---|
| `setting_key` | qualified key | Existing or new record under review. |
| `legacy_value` | mixed | Captured, never silently rewritten. |
| `render_fallback` | allowed value | Used only when the value is invalid. |
| `merchant_action` | enum | `none`, `explicit_enroll`, `review`, `return_to_follow`. |
| `owner_spec` | HDL ID | Owner of remediation. |
| `evidence_ref` | string | Test, commit, DOM JSON, or editor capture. |

## EvidenceRecord

| Field | Type | Rule |
|---|---|---|
| `captured_at` | ISO-8601 | Later than the last relevant source change. |
| `commit_sha` | full SHA | Exact tested revision. |
| `scenario` | string | Stable verification-matrix ID. |
| `viewport`, `language`, `direction` | object/string | Actual runtime values, not requested values. |
| `preview_assets` | URL array | At least one signed preview resource matching `localhost:<CLI-reported-port>`; the accepted CLI 3.2.45 run used port `8000`. |
| `body_classes` | string array | Resolved `hadeel-*` classes. |
| `overflow`, `commerce` | object | 320px fit and price/CTA evidence. |
| `network` | resource array | Canonicalized comparison; HDL-03 attributable delta must be empty. |
| `screenshot_path`, `dom_path` | string | Paired artifacts for the same state. |

An EvidenceRecord is valid only when its source timestamp is current and it comes from a rendered Salla preview, not a standalone mockup.
