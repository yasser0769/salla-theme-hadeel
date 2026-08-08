# Data Model: HDL-02 Design Governance

**Feature**: HDL-02 · **Revision**: 2 · **Date**: 2026-08-08

This is a documentation-domain model. It creates no database, runtime schema, or storefront API.

## 1. Entities

### DesignRevision

| Field | Type | Rule |
|---|---|---|
| `spec_id` | `HDL-NN` | Required; `HDL-02` for the shared system |
| `revision` | positive integer | Monotonically increasing within a spec |
| `figma_file_key` | string | Required; immutable for an approval record |
| `page_node_id` | Figma node ID | Required and resolvable |
| `root_node_id` | Figma node ID | Required and resolvable |
| `status` | enum | `Draft`, `Ready for Owner Review`, `Approved`, `Reopened`, `Superseded` |
| `owner_statement` | string | Required only for `Approved`; exact user statement |
| `approved_by` | string | Required only for `Approved` |
| `approved_on` | ISO date | Required only for `Approved` |
| `supersedes` | revision/null | Required when replacing an earlier approved/review revision |

### FoundationRecord

| Field | Type | Rule |
|---|---|---|
| `canonical_name` | string | Unique and begins `HDL-02/Shared/` |
| `category` | enum | color, typography, spacing, radius, grid, elevation, icon/media, motion |
| `figma_reference` | node/style/variable ID | Required |
| `runtime_mapping` | string/null | Existing runtime token/property or owned Spike |
| `web_syntax` | string/null | Required for web-targeted local variables where applicable |
| `arabic_rtl_constraint` | string | Required |
| `owner` | `HDL-NN`/named owner | Required |

### ComponentFamily

| Field | Type | Rule |
|---|---|---|
| `canonical_name` | string | Unique and begins `HDL-02/Shared/` |
| `node_id` | Figma node ID | One registered component-set node |
| `responsibility` | string | Functional purpose, not cosmetic layout name |
| `variant_axes` | set | Only presentation/state/direction/device axes |
| `variant_count` | integer | Positive; sum across approved families = 88 |
| `states` | set | Applicable interaction/data states or explicit N/A rationale |
| `directions` | set | RTL/LTR where textual or directional |
| `evidence_refs` | set | Foundations/settings/platform/spike references |

Exactly nine approved families exist: Button, Form Control, Badge/Status, Product Price, Product
Card Skeleton, Overlay Shell, Header Navigation, Tabs Accordion, and Feedback State.

### NodeRegistryRecord

| Field | Type | Rule |
|---|---|---|
| `record_key` | composite | `spec_id + canonical_name + revision`; unique |
| `kind` | enum | foundation, component-set, governance, matrix, QA, frame |
| `page_or_section` | string | Required |
| `node_id` | Figma node ID | Required; unique within current approved revision unless deliberately shared |
| `direct_url` | HTTPS URL | Must encode the same node ID |
| `viewport` | enum/null | mobile, desktop, responsive, N/A |
| `language_direction` | enum/null | Arabic/RTL, English/LTR, bidirectional, N/A |
| `covered_states` | set | Required or explicit N/A |
| `revision_status` | status | Must agree with DesignRevision |
| `owner` | string | Required |

### SettingsEvidenceRecord

| Field | Type | Rule |
|---|---|---|
| `property` | string | One visible property only |
| `owning_scope` | enum | Global, Component, Fixed |
| `visibility` | enum | Basic, Advanced, Not merchant-controlled |
| `control_source` | enum | Salla runtime, existing setting, component field, platform contract, Spike |
| `control_id` | string/null | Exact ID/property path when confirmed |
| `values_and_default` | string | Required for confirmed controls |
| `mobile_difference` | string/N/A | Required |
| `evidence_status` | enum | Confirmed, Spike — Not approved for implementation |
| `evidence_ref` | path/node/API/spike owner | Required |

### CoverageRecord

| Field | Type | Rule |
|---|---|---|
| `subject` | component/frame | Required |
| `viewport_direction` | enum | Arabic Mobile RTL, Arabic Desktop RTL, English Mobile LTR, English Desktop LTR |
| `content_state` | string | Same semantics within comparison pairs |
| `interaction_states` | set/N/A | N/A requires reason |
| `focus_contract` | ordered set/N/A | Directional interactive frames use logical order |
| `mirror_rule` | mirror/non-mirror/N/A | Directional reason required |
| `evidence_node_id` | Figma node ID | Required |

### ApprovalRecord

| Field | Type | Rule |
|---|---|---|
| `spec_id` | `HDL-NN` | Required |
| `revision` | positive integer | Must equal current DesignRevision |
| `statement` | string | Exact owner statement |
| `owner` | string | Required |
| `date` | ISO date | Required |
| `scope` | string | Identifies approved nodes/design handoff |

### DeviationRecord

| Field | Type | Rule |
|---|---|---|
| `approved_node_revision` | node + revision | Required |
| `preview_evidence` | URL/path + timestamp | Must be rendered Salla evidence after the change |
| `difference` | string | Observable, not inferred |
| `classification` | enum | Bug, Salla Platform, Responsive, Accessibility, Performance, Product Decision |
| `owner` | `HDL-NN`/person | Required |
| `decision` | enum | Fix, Accept, Spike |
| `owner_approval` | statement/date/null | Required before an intentional difference is accepted |

## 2. Relationships

- One `DesignRevision` owns many Foundation, ComponentFamily, NodeRegistry, SettingsEvidence,
  and Coverage records.
- One approved `DesignRevision` has exactly one complete `ApprovalRecord`.
- Every `ComponentFamily` has one current `NodeRegistryRecord` and one or more Coverage records.
- Every merchant-selectable variant resolves to at least one confirmed SettingsEvidenceRecord;
  otherwise it resolves to an owned Spike and is not implementation-approved.
- A DeviationRecord references one approved node/revision and one later rendered-preview item; it
  never mutates the original approval.

## 3. State transitions

```text
Draft → Ready for Owner Review → Approved
  ↑               │                  │
  └──── Reopened ─┴──────────────────┘
                                      └→ Superseded (when a newer revision is approved)
```

- Documentation-only correction that does not alter intent may stay in the same revision and is
  logged.
- Any visual, behavioral, responsive, text/direction, Variant, or merchant-setting change moves
  the affected revision to `Reopened`; Plan/Tasks/implementation pause until new approval.
- Approval never transfers automatically to a higher revision.

## 4. Global invariants

1. Current approved revision is exactly 2; Revision 1 is Superseded.
2. File/page/root IDs agree across `design.md`, report, contract, and direct links.
3. Nine unique component-set records total 88 variants.
4. Four parity frames use the same semantic scenario/state and differ only as required by
   viewport, language, and direction.
5. Directional controls mirror; logos, product media/photos, and Search/Cart/Play/Check do not.
6. Every unknown is an owned Spike; zero unclassified merchant-selectable variants exist.
7. No HDL-02 record claims rendered-storefront proof.
8. Theme source/build delta is zero.
