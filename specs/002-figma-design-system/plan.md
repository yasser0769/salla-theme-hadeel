# Implementation Plan: Figma Design System and Visual Approval Gate

**Branch**: `codex/hdl-02-figma-design-system` | **Date**: 2026-08-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-figma-design-system/spec.md`
**Roadmap ID**: `HDL-02`
**Design handoff**: [design.md](design.md) · approved Figma Revision 2

## Summary

Freeze the approved Revision 2 design-system contract as a documentation-only implementation:
validate the existing Figma foundations, nine reusable component families, Node ID registry,
settings evidence, RTL/LTR parity matrix, and approval lifecycle; then publish a traceable
evidence report and downstream handoff contract. HDL-02 does not modify Twig, SCSS, JavaScript,
locales, `twilight.json`, dependencies, or `public/`.

## Design Gate Check *(blocking)*

- [x] `design.md` records the approved Figma file, page `381:2`, root `381:3`, registry nodes, and direct Revision 2 parity-frame links.
- [x] Owner wrote `APPROVE HDL-02 REV 2`; `design.md` records Yasser, 2026-08-08, and Revision 2.
- [x] Arabic mobile, Arabic desktop, English mobile/LTR, English desktop/LTR, directional behavior, and required states are covered.
- [x] Unconfirmed Salla capabilities are marked `Spike` with a later owning spec; no platform assumption is promoted to an implementation fact.

**Gate result before Phase 0**: PASS. Revision 1 is Superseded and cannot be used for planning.

## Technical Context

**Platform**: Salla Twilight storefront theme plus the shared Hadeel Figma file
**Source of truth**: GitHub for repository contracts; Figma Revision 2 for approved visual intent; rendered Salla preview only for later runtime implementations
**Build**: `N/A — no source change`; production build becomes mandatory if scope changes to `src/**`
**Guard**: final regression check `node scripts/check-theme.mjs --build`; expected zero new errors and no `public/` drift
**Target pages**: no rendered storefront page; Figma page `16 · HDL-02 Design System` (`381:2`) only
**Existing implementation**: approved Figma root `381:3`, 8 variable collections/150 variables, 18 text styles, 5 effect styles, 9 component sets/88 variants, governance/registry/settings/coverage/QA sections, and four parity frames in `design.md`
**Salla APIs/components**: no runtime call is added; evidence reuses Salla runtime `theme.color`/`theme.font` and confirmed existing `theme.settings` IDs from `twilight.json`
**Testing**: deterministic artifact checks, exact Node/setting/coverage reconciliation, Figma structural evidence review, repository scope diff, JSON/Markdown validation, and final theme guard
**Performance goals**: exactly 0 production bundle bytes, 0 network requests, 0 runtime work, and 0 interaction-latency change
**Accessibility goals**: preserve the approved focus, direction, contrast-intent, and non-mirroring contracts; runtime ARIA/keyboard/Lighthouse proof remains owned by HDL-04 and consuming visual specs
**Localization**: no customer-facing strings and no locale changes; approved specimens are Arabic/RTL first with paired English/LTR content and Bidi isolation examples
**Scale/scope**: one approved revision, 20 registered design/governance nodes, 9 reusable families, 88 variants, 12 settings/evidence decisions, and 4 direct parity frames

## Constitution Check *(GATE)*

- [x] Conversion > customization > polish: governance prevents decorative variants without merchant/customer purpose or evidence.
- [x] One Salla theme and one shared core: shared Figma families and contracts are inherited; no preset or implementation fork is created.
- [x] Components by responsibility: nine functional families use variants for presentation/state/direction.
- [x] Mobile/Arabic first with RTL/LTR parity: Revision 2 supplies four paired frames and explicit direction/focus rules.
- [x] Bundle/performance/accessibility budgets pass: runtime delta is zero; accessibility intent is recorded without claiming runtime proof.
- [x] Figma/GitHub/Salla evidence chain is preserved: visual intent and repository contract are traceable; preview is truthfully N/A because no storefront source changes.
- [x] Existing code is audited before build work: HDL-01 and current `twilight.json`/`master.twig` evidence are reused; no code build is authorized.
- [x] Independent identity, truthful commerce, localization, and secure defaults: no third-party assets, fabricated activity, strings, input surface, or script is introduced.
- [x] Constitution exceptions: none.

**Pre-design gate**: PASS. **Post-design gate**: PASS after Phase 1; no unresolved clarification or exception remains.

## Existing-Code Reuse Map

| Requirement | Existing files/components | Classification | Reuse/change |
|---|---|---|---|
| FR-001 Node registry | `design.md`; Figma `390:24` | Build already realized in approved design | Normalize and validate in the evidence report; do not duplicate nodes |
| FR-002 direction parity | Figma `398:2`, `398:5`–`398:8` | Build already realized | Validate paired state/content and mirroring contract |
| FR-003 interaction states | Component sets `384:37`–`389:137`; QA annotations | Build already realized | Record applicability and explicit `N/A` reasons |
| FR-004 variant evidence | `twilight.json`; `src/views/layouts/master.twig`; HDL-01 report | Existing — Audit & Polish | Cite confirmed source or retain `Spike`; no settings added |
| FR-005 Settings Matrix | Figma `391:2`; `twilight.json` | Existing evidence + design governance | Reconcile every row to runtime property, existing ID, fixed decision, or owned spike |
| FR-006 legal naming | Figma component/root names; `design.md` | Build already realized | Deterministically check `HDL-02/Shared/…` names and unique IDs |
| FR-007 revision lifecycle | Figma `390:2`, `391:139`; `design.md` | Build already realized | Freeze Revision 2 approval; define reopen/supersede transition |
| FR-008 deviation record | `design.md` template; later Salla preview evidence | Deferred runtime use | Publish the contract; no fabricated deviation record |
| FR-009 bounded deliverable | approved Figma root and this feature directory | Build | Produce only evidence report and contract artifacts |
| FR-010 downstream gate | `docs/spec-kit/FIGMA-WORKFLOW.md`; handoff contract | Build | Make inheritance and blocking rules executable by later specs |

## Salla Feasibility & Research

| Question | Official evidence / installed API / storefront spike | Decision | Fallback |
|---|---|---|---|
| Merchant color/font sources | `master.twig:82-91`; Twilight `features` includes `fonts` and `color` | Confirmed Salla runtime properties, not custom setting IDs | Keep Figma values illustrative and merchant-controlled |
| Existing visual setting IDs | `twilight.json` exact IDs/options | Confirmed only for rows that exist | Missing capability stays `Spike` with owning spec |
| Runtime RTL/keyboard behavior | No runtime implementation in HDL-02 | Design contract only; not verified as storefront behavior | HDL-04 and consuming specs test rendered DOM |
| Code Connect | No repository declarations; tool/seat constraint recorded in `design.md` | Non-blocking; not implemented | Node IDs + WEB variable syntax remain traceability contract |
| Named Figma version history | Current tool does not support the operation | Non-blocking | Revision identity is frozen in root name, docs, registry, and approval record |

All decisions and rejected alternatives are consolidated in [research.md](research.md).

## Settings Architecture

| Setting / runtime property | Owner | Level | Default/source | Conditions | Locale keys |
|---|---|---|---|---|---|
| `theme.color.*` | Salla runtime / global | Basic platform control | merchant selection | Always available with `color` feature | N/A — platform UI |
| `theme.font.*` + `use_theme_font` | Salla runtime + theme/global | Basic | merchant font; `use_theme_font=false` | `fonts` feature | Existing Salla/theme labels; no HDL-02 keys |
| `layout_width` | theme/global | Basic | `wide` | none | Existing label only |
| `section_spacing` | theme/global | Basic | `balanced` | none | Existing label only |
| `corner_style` | theme/global | Basic | `square` | none | Existing label only |
| `product_card_style` | theme/global | Basic | `minimal` | owned by later card implementation | Existing label only |
| `header_layout` | theme/global | Basic | `centered` | owned by HDL-07 | Existing label only |
| `header_density` | theme/global | Advanced | `comfortable` | owned by HDL-07 | Existing label only |
| `header_show_wishlist` | theme/global | Advanced | `true` | owned by HDL-07 | Existing label only |
| `show_mobile_toolbar` | theme/global | Basic | `true` | owned by HDL-12 | Existing label only |
| Motion level | HDL-06/global | Spike | Owned Spike; value set by HDL-06 | not merchant-exposed in HDL-02 | Defined by HDL-06 if exposed |
| New overlay fields | consuming component | Spike | Owned Spike; no HDL-02 default | require confirmed field/API first | Defined by consuming spec if approved |

HDL-02 creates no setting, option, locale key, or merchant-control behavior.

## Bundle, Network, and Runtime Budget

- **Baseline bundle**: inherited HDL-01 measured `public/` baseline; HDL-02 does not rewrite it.
- **Maximum feature increase**: `0 B` production bundle delta.
- **New dependencies**: none.
- **Network requests**: `0 → 0` added requests.
- **Loading strategy**: N/A; documentation/Figma governance has no storefront loading path.
- **Rollback trigger**: any diff under `src/`, `public/`, `twilight.json`, locales, package manifests, or lockfile; any non-zero runtime/bundle delta; or any change to approved visual intent without Revision 3 approval.

## Project Structure

### Documentation

```text
specs/002-figma-design-system/
├── spec.md                         # approved requirements
├── design.md                       # approved Revision 2 handoff and Node IDs
├── plan.md                         # this implementation plan
├── research.md                     # resolved planning decisions
├── data-model.md                   # governance entities and invariants
├── contracts/
│   └── visual-spec-handoff.md      # contract consumed by later visual specs
├── quickstart.md                   # reproducible validation guide
├── tasks.md                        # generated after planning
└── design-system-report.md         # Kimi-owned implementation evidence packet
```

### Source Code

```text
src/                                # read-only evidence; no HDL-02 edits
public/                             # committed build output; no HDL-02 edits
twilight.json                       # read-only settings evidence; no HDL-02 edits
```

**Structure Decision**: keep the implementation documentation-only inside the owning feature
directory. The approved Figma nodes are the built visual system; the repository adds one
auditable report and one downstream contract without creating a parallel CSS/component layer.

## Verification Matrix

| Artifact/flow | Mobile RTL | Desktop RTL | Mobile LTR | Desktop LTR | Environment | Evidence |
|---|---:|---:|---:|---:|---|---|
| Direction parity matrix | `398:5` | `398:7` | `398:6` | `398:8` | Figma Revision 2 | `design.md` + report |
| Shared component families | applicable variants | applicable variants | applicable variants | applicable variants | Figma component sets | registry/coverage reconciliation |
| Approval/revision lifecycle | N/A | N/A | N/A | N/A | repository + Figma governance | exact owner statement and transition checks |
| Rendered Salla storefront | N/A | N/A | N/A | N/A | no source change | explicitly deferred to consuming specs |

## Rollback and Compatibility

The plan changes no theme runtime contract, merchant setting, stored value, or built asset.
Rollback is limited to reverting HDL-02 documentation artifacts and restoring the previous
lifecycle status. If approved Figma intent must change, do not patch Revision 2 in place: mark it
Superseded/Reopened, issue Revision 3, repeat the four-frame parity review, and obtain a new owner
approval before regenerating Plan/Tasks. Later specs continue to consume Revision 2 until that
new approval exists.

## Complexity Tracking

| Constitution Exception | Why Needed | Simpler Alternative Rejected | Owner | Expiry/Remediation |
|---|---|---|---|---|
| None | — | — | — | — |
