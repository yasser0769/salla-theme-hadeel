# HDL-02 Design System Report — Figma Design System and Visual Approval Gate

**Feature**: HDL-02 · `specs/002-figma-design-system/`
**Approved design**: Figma **Revision 2** — `APPROVE HDL-02 REV 2` by Yasser on 2026-08-08
**Report author**: Kimi K3 High (implementation model for T013–T035)
**Report date**: 2026-08-08
**Repository baseline**: `9e22771b21e85ea3b4aee847946ad4574683d02d` (branch `codex/hdl-02-figma-design-system`)
**Status of HDL-02**: `accepted` — documentation-only evidence packet; Owner Acceptance granted via the exact statement `ACCEPT HDL-02` by Yasser on 2026-08-08

## 0. Evidence policy and scope boundary

This report is the sole authorized repository write of the HDL-02 implementation pass
(`/tmp/hdl-02-implementation-boundary.txt`: `authorized_write=specs/002-figma-design-system/design-system-report.md`,
`bundle_delta_budget=0 B`, `network_request_delta=0`, `runtime_work_delta=0`).

Evidence policy, in force for every claim below:

1. **Figma proves intent only.** No rendered storefront, ARIA, keyboard DOM, Lighthouse,
   performance, or accessibility result was verified in HDL-02. HDL-02 changes no storefront
   source, so no runtime behavioral claim is made anywhere in this report.
2. **GitHub proves the repository contract** (specs, settings evidence, source-scope diffs).
3. **Rendered Salla preview proves behavior** — and is explicitly `N/A — no source change` here;
   it becomes mandatory in the consuming spec that first changes `src/**`.
4. Every factual claim below cites an approved artifact (`design.md`, `spec.md`, `plan.md`,
   `research.md`, `data-model.md`, `contracts/visual-spec-handoff.md`), a repository source file
   (`twilight.json`, `src/views/layouts/master.twig`), or a preimplementation evidence file under
   `/tmp/hdl-02-*.txt`. A local mock-up is never evidence about the theme (AGENTS.md).

Scope boundary (from `spec.md` §3 and `design.md` النطاق والحدود):

- **In HDL-02**: design-system governance, reusable Foundations, nine representative component
  families, Node ID Registry, Settings Matrix, Coverage Matrix, revision/approval lifecycle, and
  this evidence report.
- **Deferred to owning specs**: complete Home/Product/Collection/Search/Cart/supporting-page
  flows, the four Presets and demo stores, final motion values (HDL-06), final
  performance/budget values (HDL-05), and any Twig/SCSS/JS or `twilight.json` change.

### Preimplementation evidence inventory (all PASS)

| Evidence file | Result |
|---|---|
| `/tmp/hdl-02-spec-readiness.txt` | PASS — 0 unresolved product ambiguity; 10 FRs; 4 user stories (US1 P1, US2 P1, US3 P1, US4 P2); Figma gate 9/9; acceptance evidence 8/8 |
| `/tmp/hdl-02-design-gate.txt` | PASS — Revision 2 approved; 20 registry rows; parity frames `398:5`–`398:8`; revision_1=Superseded |
| `/tmp/hdl-02-preimpl-shasums.txt` | SHA-256 of `spec.md`, `design.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/visual-spec-handoff.md`, `quickstart.md`, `.specify/.runtime/hadeel-night-run.md` frozen before this report |
| `/tmp/hdl-02-preimpl-source-status.txt` | PASS — `git status --porcelain` and `git diff` over `src public twilight.json package.json pnpm-lock.yaml`: 0 entries, 0 bytes |
| `/tmp/hdl-02-index-validation.txt` | PASS — `docs/spec-kit/spec-index.json` parses; exactly one HDL-02 record, status `implementing` |
| `/tmp/hdl-02-artifact-readiness.txt` | PASS — 0 unresolved clarifications, 0 template placeholders, 0 unresolved placeholder tokens, 0 constitution exceptions in plan/research/data-model/contract |
| `/tmp/hdl-02-parity-link-check.txt` | PASS — all four direct frame URLs encode Node IDs `398:5`–`398:8`; all present in registry |
| `/tmp/hdl-02-expected-nodes.txt` | 20 registry rows, 9 component sets, variant_total=88 extracted from `design.md` |
| `/tmp/hdl-02-settings-evidence.txt` | PASS — Salla runtime `theme.color.*`/`theme.font.*` mappings plus 9 exact existing setting IDs; 0 invented custom setting IDs |
| `/tmp/hdl-02-fr-coverage.txt` | PASS — FR-001…FR-010 reconciled to implementation/verification tasks, 10/10 covered |
| `/tmp/hdl-02-implementation-boundary.txt` | PASS — model routing, zero-runtime budget, single authorized write |

---

## 1. User Story 1 — Owner approves a known revision (P1)

### 1.1 Approved Figma identity (FR-001)

| Identity field | Value |
|---|---|
| Figma file | `12z0jRutTHcdhlZQrRmcXU` — https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled |
| Figma page | `16 · HDL-02 Design System` — Node `381:2` — https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=381-2 |
| Design root | `HDL-02/Shared/Design-System/Responsive/Bidirectional/Rev-2` — Node `381:3` (1440×13018, 17 direct sections, single top-level root) |
| Direction QA matrix | `RTL/LTR Parity Matrix · Revision 2` — Node `398:2` (1312×2342) |
| Current revision | **2** |
| Revision 1 | **Superseded** — rejected by the owner for insufficient RTL/LTR parity; not a valid reference for Plan or implementation |
| Protected sibling | HDL-01 page `359:2` and board `359:3` remain present with unchanged names and Node IDs (`design.md` verification log) |

### 1.2 Node Registry — complete current records (FR-001, FR-006)

Exactly **20 complete current registry records**, all Revision 2, all `Approved`, owner Yasser,
approval date 2026-08-08, `supersedes = Revision 1` where the record replaces Revision 1 content
(rows 1–16) and `supersedes = none` for records introduced by Revision 2 (rows 17–20, the
parity frames). Record key = `HDL-02 + <canonical name> + Rev 2`; page/section for every row is
page `381:2` under root `381:3`. Direct URLs encode the same Node ID as the row
(`/tmp/hdl-02-parity-link-check.txt` verified this mechanically for the parity frames).

| # | Canonical name | Kind | Node ID | Direct URL | Viewport | Language/Direction | Covered states | Rev | Status | Owner | Approved | Supersedes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Foundations | foundation | `382:2` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=382-2 | responsive | bidirectional | 7 foundation cards (color, typography, spacing, radius, grid, elevation, icon/media+motion contract) | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 2 | Button (shared set) | component-set | `384:37` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=384-37 | responsive | bidirectional | 16 variants: Size (Default/Large) × Style (Primary/Outline) × State (Default/Hover/Focus/Disabled); Pressed not implemented in this set | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 3 | Form Control (shared set) | component-set | `384:61` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=384-61 | responsive | RTL + LTR | 16 variants: Type (Input/Select) × State (Default/Focus/Error/Disabled) × Direction (LTR/RTL); 16-of-16 labels wired (§2.5) | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 4 | Badge (shared set) | component-set | `384:73` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=384-73 | responsive | bidirectional | 4 variants: Tone (Neutral/Success/Danger/Promo); interaction states N/A — non-interactive indicator | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 5 | Product Price (shared set) | component-set | `386:15` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=386-15 | responsive | bidirectional | 4 variants: State (Regular/Sale/SoldOut/Free); Hover/Focus N/A — non-interactive display | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 6 | Product Card Skeleton (shared set) | component-set | `386:49` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=386-49 | responsive | RTL + LTR | 6 variants: Direction (RTL/LTR) × State (Loading/Default/SoldOut) | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 7 | Overlay Shell (shared set) | component-set | `386:129` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=386-129 | responsive | RTL + LTR | 12 variants: Type (Drawer/Modal) × Direction (RTL/LTR) × State (Ready/Loading/Error) | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 8 | Header Navigation (shared set) | component-set | `389:61` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-61 | desktop + mobile | RTL + LTR | 8 variants: Device (Desktop/Mobile) × Direction (RTL/LTR) × State (Default/SearchOpen) | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 9 | Tabs Accordion (shared set) | component-set | `389:105` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-105 | responsive | RTL + LTR | 16 variants: Type (Tab/Accordion) × Direction (RTL/LTR) × State (Default/Active/Focus/Disabled); Hover not implemented in this set | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 10 | Feedback State (shared set) | component-set | `389:137` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-137 | responsive | RTL + LTR | 6 variants: Direction (RTL/LTR) × State (Loading/Empty/Error) | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 11 | Governance | governance | `390:2` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=390-2 | N/A — governance panel | N/A | Draft/Review/Approved/Reopened/Superseded lifecycle documentation | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 12 | Node ID Registry | matrix | `390:24` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=390-24 | N/A — registry panel | N/A | Visual registry of the nine shared families | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 13 | Settings Matrix | matrix | `391:2` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=391-2 | N/A — matrix panel | N/A | 12 settings/decisions (§3.1) | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 14 | Coverage Matrix | matrix | `391:96` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=391-96 | N/A — matrix panel | N/A | 7 coverage dimensions (§2.3) | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 15 | QA / Approval Gate | QA | `391:139` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=391-139 | N/A — QA panel | N/A | Approved for Implementation — Revision 2 owner record | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 16 | RTL/LTR QA Matrix | QA | `398:2` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-2 | mobile + desktop | bidirectional | Four paired frames + What mirrors / What does not mirror / Why panel | 2 | Approved | Yasser | 2026-08-08 | Revision 1 |
| 17 | Arabic Mobile RTL | frame | `398:5` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-5 | mobile 390×980 | Arabic/RTL | Header Default, Tab Active, Input+Select Focus, Primary Button Default, Carousel with Pagination, Drawer Ready (§2.4) | 2 | Approved | Yasser | 2026-08-08 | none — new in Rev 2 |
| 18 | English Mobile LTR | frame | `398:6` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-6 | mobile 390×980 | English/LTR | Same semantic scenario/states as `398:5` | 2 | Approved | Yasser | 2026-08-08 | none — new in Rev 2 |
| 19 | Arabic Desktop RTL | frame | `398:7` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-7 | desktop specimen 608×900 | Arabic/RTL | Same semantic scenario/states as `398:5` | 2 | Approved | Yasser | 2026-08-08 | none — new in Rev 2 |
| 20 | English Desktop LTR | frame | `398:8` | https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-8 | desktop specimen 608×900 | English/LTR | Same semantic scenario/states as `398:5` | 2 | Approved | Yasser | 2026-08-08 | none — new in Rev 2 |

Invariant checks on this registry: rows = 20 (matches `/tmp/hdl-02-expected-nodes.txt`
`registry_rows=20`); component sets = 9; all names unique; no record points to a deleted node or a
non-current revision. Re-creating or moving an approved node requires updating this registry; an
`Approved` record pointing at a deleted node or another revision is forbidden (FR-001).

### 1.3 ApprovalRecord — exact Revision 2 approval (FR-007)

One complete ApprovalRecord exists for HDL-02; per `data-model.md`, one approved DesignRevision
has exactly one complete ApprovalRecord.

| Field | Value |
|---|---|
| `spec_id` | HDL-02 |
| `revision` | 2 |
| `statement` | `APPROVE HDL-02 REV 2` |
| Normalized record | **APPROVE HDL-02 REV 2 by Yasser on 2026-08-08** |
| `owner` | Yasser |
| `date` | 2026-08-08 |
| `scope` | Design root `381:3` on page `381:2`, all 20 registry records in §1.2, and the Revision 2 design handoff `design.md` |
| Normalized status | Approved for Implementation — Revision 2 |

Approval semantics (`research.md` R-007): the exact statement uniquely identifies the spec and
revision and was supplied at the defined Human Gate; approval never floats to a later revision.

### 1.4 Revision lifecycle and transition rules (FR-007)

Legal states and transitions (`data-model.md` §3):

```text
Draft → Ready for Owner Review → Approved
  ↑               │                  │
  └──── Reopened ─┴──────────────────┘
                                      └→ Superseded (when a newer revision is approved)
```

Rules:

- Only the owner places **Approved for Implementation**, with name, date, and revision number
  recorded in `design.md`. Missing any field leaves the status Pending.
- A documentation-only correction that does not alter intent may stay inside the same revision
  and is logged.
- **Material-change conditions that reopen Plan/Tasks/implementation**: any post-approval change
  touching visual form, behavior, responsiveness, text/direction, a Variant, or a merchant
  setting moves the revision to `Reopened`, marks the previous approval **Superseded**, issues a
  new revision number, and blocks affected Plan/Tasks/implementation until the new revision is
  approved. Revision 1 is in exactly this terminal state: **Superseded** after the owner rejected
  its RTL/LTR parity sufficiency; it is retained as history only and carries no live approval.
- On conflicting concurrent edits, the latest approved revision is the only implementation
  reference; partial approvals from two revisions are never merged.

**US1 checkpoint**: current revision (2), all 20 node records, the single complete
ApprovalRecord, and the reopen/supersede behavior are recorded above and are internally
consistent; a reviewer can resolve every registered link from §1.2 without chat history.

---

## 2. User Story 2 — Designer reuses the system (P1)

### 2.1 Foundation inventory and counts (FR-001, FR-009)

| Domain | In the approved file | Revision 2 decision |
|---|---:|---|
| Variable collections | **8** | Reuse local collections; no import from Material 3 or Simple Design System |
| Variables | **150** | No broken aliases, no `ALL_SCOPES`, no variable left without WEB syntax after review |
| Text styles | **18** | Tajawal is the Figma specimen face only; production font stays merchant-controlled via `theme.font.name` → `--font-main` |
| Effect styles | **5** | Reuse local shadows; no parallel elevation system |
| Foundation cards | **7** | Documented inside Foundations section `382:2` |

Foundation facts of record (`design.md` Foundations ومصادر الحقيقة):

- `neutral/muted` was corrected from `#757575` to the source value `#878787` and linked to a
  description stating its source.
- `brand/primary` and its shades are visual specimens of merchant-owned runtime values, not
  imposed fixed colors.
- Semantic typography variables with no confirmed production token carry WEB syntax plus a
  `Spike — Figma-only` description.
- Motion remains a preliminary contract tagged Spike until HDL-06 decides final values.

**WEB syntax policy**: every web-targeted local variable carries WEB syntax; the variable layer
plus Node IDs is the operative Figma↔code traceability link (§3.4).

**Arabic typography**: Arabic/RTL is the primary design path; Tajawal specimens exercise Arabic
shaping, but the production face is whatever the merchant selects in Salla (`theme.font.*`),
surfaced through `--font-main` in `master.twig:82,87`.

**Merchant-controlled color/font mapping**: `brand/*` color specimens map to Salla runtime
`theme.color.primary` / `theme.color.darker(0.15)` / `theme.color.lighter(0.15)` /
`theme.color.reverse_text` → `--color-primary*` (`master.twig:88-91`); font specimens map to
`theme.font.name`/`theme.font.path` (`master.twig:82,87`). These are runtime properties, not
HDL-02 setting IDs (§3.1, rows 1–2).

**Independent asset provenance**: all collections, styles, and components are local to the Hadeel
Figma file; zero third-party library imports (no Material 3, no Simple Design System); zero
assets, code, copy, or identity taken from Kalles or Theme Raed; zero fabricated social-proof
figures. Every Solid fill inside the components is bound to a local variable (`design.md`).

### 2.2 Component families — exactly nine shared sets (FR-003, FR-006)

variant_total = 88 (16+16+4+4+6+12+8+16+6). Every family name begins `HDL-02/Shared/`, each has
one registered component-set node in §1.2, and evidence references point to §1.2 registry rows,
the Settings Evidence Matrix (§3.1), and the parity frames (`398:5`–`398:8`).

| Canonical name | Responsibility | Node ID | Variant axes | Variant count | States | Directions | Evidence refs |
|---|---|---|---|---|---|---|---|
| HDL-02/Shared/Button | Action trigger (Primary/Outline emphasis) | Node `384:37` | Axes: Size(Default/Large) × Style(Primary/Outline) × State(Default/Hover/Focus/Disabled) | 16 variants | Default, Hover, Focus, Disabled; Pressed N/A — not an implemented variant in the approved set, retained only as a general audit criterion; Loading/Empty/Error N/A — not data-bound; Sold-out N/A — commerce state lives on price/card | RTL + LTR | Evidence: registry #2; §3.1 rows 1 (color) and 5 (radius); parity frames all four |
| HDL-02/Shared/Form-Control | Input and Select entry controls with shared label | Node `384:61` | Axes: Type(Input/Select) × State(Default/Focus/Error/Disabled) × Direction(LTR/RTL) | 16 variants | Default, Focus, Disabled, Error; Hover N/A on mobile-first path — Focus carries the affordance; Loading/Empty/Sold-out N/A — atomic entry control | RTL + LTR | Evidence: registry #3; §2.5 label repair; §2.4 focus contract |
| HDL-02/Shared/Badge | Non-interactive status/tone indicator | Node `384:73` | Axis: Tone(Neutral/Success/Danger/Promo) | 4 variants | Interaction states N/A — conveys state, receives no input; tones cover semantic status | bidirectional (text-only) | Evidence: registry #4; foundations color tokens |
| HDL-02/Shared/Product-Price | Commerce price display incl. sale/sold-out/free | Node `386:15` | Axis: State(Regular/Sale/SoldOut/Free) | 4 variants | Regular, Sale, SoldOut, Free; Hover/Focus/Pressed N/A — display-only; Disabled N/A — SoldOut carries the unavailable commerce state | bidirectional; currency isolated per §2.4 Bidi rules | Evidence: registry #5; §2.4 Bidi isolation (`SAR 249.00`) |
| HDL-02/Shared/Product-Card-Skeleton | Product-card loading/placeholder composition | Node `386:49` | Axes: Direction(RTL/LTR) × State(Loading/Default/SoldOut) | 6 variants | Loading, Default, SoldOut; Empty/Error N/A — collection-level states live in Feedback-State; Hover/Focus deferred to the real card owned by HDL-10 | RTL + LTR | Evidence: registry #6; §3.1 row 6 (`product_card_style`) |
| HDL-02/Shared/Overlay-Shell | Drawer/Modal container with async content | Node `386:129` | Axes: Type(Drawer/Modal) × Direction(RTL/LTR) × State(Ready/Loading/Error) | 12 variants | Ready, Loading, Error; Empty N/A — empty content is Feedback-State territory; opens from logical start (§2.4) | RTL + LTR | Evidence: registry #7; §3.1 row 12 (owned Spike for new overlay fields) |
| HDL-02/Shared/Header-Navigation | Store header/navigation primitives | Node `389:61` | Axes: Device(Desktop/Mobile) × Direction(RTL/LTR) × State(Default/SearchOpen) | 8 variants | Default, SearchOpen; Loading/Empty/Error/Sold-out N/A — chrome, not data-bound | RTL + LTR | Evidence: registry #8; §3.1 rows 7–9 (`header_layout`, `header_density`, `header_show_wishlist`) |
| HDL-02/Shared/Tabs-Accordion | Sectioned content switching/disclosure | Node `389:105` | Axes: Type(Tab/Accordion) × Direction(RTL/LTR) × State(Default/Active/Focus/Disabled) | 16 variants | Default, Active, Focus, Disabled; Hover N/A — not an implemented variant in the approved set, retained only as a general audit criterion; Loading/Empty/Error N/A — container states belong to content region | RTL + LTR | Evidence: registry #9; parity Tab Active in all four frames |
| HDL-02/Shared/Feedback-State | Async/collection outcome messaging | Node `389:137` | Axes: Direction(RTL/LTR) × State(Loading/Empty/Error) | 6 variants | Loading, Empty, Error; Hover/Focus/Pressed/Disabled/Sold-out N/A — presentational outcome, actions inside use Button | RTL + LTR | Evidence: registry #10; §8 coverage matrix Async/Data row |

### 2.3 Coverage Matrix summary (FR-002, FR-003)

The Coverage Matrix (`391:96`) spans 7 dimensions; per-family applicability is recorded in §2.2
and the registry. Summary of required coverage and where it is proven:

| Dimension | Requirement (spec.md §8) | Where satisfied in Revision 2 |
|---|---|---|
| Arabic Mobile | Default for all nine families; long text and missing-data cases where applicable; starting point | `398:5`; family variants in §2.2 |
| Arabic Desktop | Responsive layout per family; Hover where a pointer exists, never as the only path to function | `398:7`; Button Hover variants |
| English/LTR parity | Parity for every textual/directional/interactive element: icon direction, content order, overlay opening, focus | `398:6`, `398:8` paired to the Arabic frames with identical semantics |
| Keyboard/Focus | Focus-visible and logical order for every interactive element | Focus variants (Button, Form Control, Tabs) + `Focus/01…08` contract nodes in each parity frame; runtime DOM verification deferred (§5) |
| Async/Data | Loading/Empty/Error for data-bound families; reasoned N/A otherwise | Overlay-Shell (Ready/Loading/Error), Feedback-State (Loading/Empty/Error), Card-Skeleton (Loading) |
| Commerce | Disabled and Sold-out on price/card/commerce actions; price/availability/action stay legible | Product-Price SoldOut; Card-Skeleton SoldOut; Button Disabled |
| Motion | Transition description plus `prefers-reduced-motion` alternative for animated elements; final values owned by HDL-06 | Preliminary motion contract in Foundations, tagged Spike (§3.1 row 11) |

Annotations of record (`design.md` التغطية والتفاعل): no function depends on Hover alone; Focus
and Disabled are shown where applicable; Drawer and Modal show Ready/Loading/Error in both
directions; Header shows Desktop/Mobile and Default/SearchOpen in both directions; Feedback shows
Loading/Empty/Error in both directions. Contrast, touch-target size, text zoom, Arabic text-wrap
(no clipping), and reading order are annotated as acceptance concerns; their **measurement** is
deferred to rendered-preview verification in the consuming spec (§5). Semantic headings and
prices stayed independent per-Variant values; shared Text properties that erased meaning or the
English copy were removed.

### 2.4 RTL/LTR parity — four frames and direction rules (FR-002)

All four frames use the same semantic scenario and states: Header `Default`, Tab `Active`,
Input and Select in `Focus`, Primary Button in `Default`, Carousel with Pagination, Drawer in
`Ready`. Pairs differ only as required by viewport, language, and direction (data-model invariant
4). Compared and fixed in Revision 2 (`design.md` RTL/LTR Parity):

- Real frame and Auto Layout ordering — not text swapping alone.
- Paragraph alignment right in Arabic, left in English.
- Icon/text ordering; the Cart icon is non-directional and moves to logical start without
  flipping its glyph.
- Documented mapping of `START`/`END` to physical padding per direction.
- Drawer/Menu opens from start: right in RTL, left in LTR.
- Breadcrumbs/Back: `رجوع →` in RTL, `← Back` in LTR.
- Carousel/Pagination: Previous on start, Next on end; directional arrows flipped and item order
  mirrored, product media not flipped.
- Button/Input/Select/Tab carry identical values and states within each pair.

**Logical focus contract**: each parity frame contains semantic focus-order nodes `Focus/01`
through `Focus/08` in logical reading order. This is a design contract only; actual DOM/keyboard
verification after implementation is owned by HDL-04 and the consuming spec.

**Bidi rules**: prices, currency, numbers, SKUs, URLs, and mixed-language runs are isolated with
Unicode Bidi isolates inside mixed text — demonstrated with `SAR 249.00`, `SKU HDL-2026`, and a
URL specimen. Bidi isolation is a rule the consuming implementation must reproduce in markup.

**What mirrors / What does not mirror / Why** (panel inside `398:2`):

| What mirrors | Why |
|---|---|
| Physical item order, Auto Layout direction | Reading order follows language direction |
| Paragraph alignment (right AR / left EN) | Text anchor follows script |
| Logical start/end spacing (`START`/`END` → physical padding) | Spacing must track reading direction |
| Directional icon/text order, directional arrows (Back, carousel Previous/Next) | Directional affordances encode navigation direction |
| Drawer/Menu opening side (start: right RTL / left LTR) | Overlay entry follows reading start |
| Breadcrumb/Back sequencing | Navigation history reads in language order |

| What does not mirror | Why |
|---|---|
| HADEEL logo geometry | Brand mark is direction-neutral identity |
| Product media and photography | Image content is authored, not directional UI chrome |
| Search, Cart, Play, Check icons | Non-directional glyphs; flipping would falsify their meaning |

### 2.5 Form Control shared-label repair — 16 of 16 (FR-003)

Revision 2 fixed a structural gap in component set `384:61`: the shared Text property
`Label#384:17` was connected to only the eight LTR variants. All **16 of 16** labels are now
connected to the same node, and both the Arabic and the English instances were proven to accept
the correct override (`design.md`). This is a Figma component-property fact; it claims nothing
about runtime storefront labels (§5).

**US2 checkpoint**: exactly nine unique shared families totaling 88 variants, all foundation
counts (8/150/18/5/7), state/direction applicability with explicit N/A reasons, parity rules, and
the label repair are recorded above; no parallel third-party library exists.

---

## 3. User Story 3 — Developer traces design to real capability (P1)

### 3.1 Settings Evidence Matrix (FR-004, FR-005)

All `SettingsEvidenceRecord` fields from `data-model.md` are populated: `property`,
`owning_scope`, `visibility`, `control_source`, `control_id`, `values_and_default`,
`mobile_difference`, `evidence_status`, `evidence_ref`. Confirmed rows cite
`/tmp/hdl-02-settings-evidence.txt`, which was extracted from `twilight.json` and
`src/views/layouts/master.twig` before this report was written; this report re-verified the same
defaults/options read-only. HDL-02 creates no setting, option, locale key, or merchant-control
behavior; invented custom setting IDs = 0.

| # | Property | Owning scope | Visibility | Control source | Control ID | Values and default | Mobile difference | Evidence status | Evidence ref |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Primary/store color | Global | Basic | Salla runtime | `theme.color.*` (→ `--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-primary-reverse`) | Merchant-selected at runtime; Figma `brand/*` swatches are specimens only | None | Confirmed | `master.twig:88-91`; `/tmp/hdl-02-settings-evidence.txt` |
| 2 | Store font | Global | Basic | Salla runtime + existing setting | `theme.font.*` + `use_theme_font` (boolean, default `false`) | Merchant font from Salla panel; theme font only when `use_theme_font=true` | None | Confirmed | `master.twig:82,87`; `twilight.json` `use_theme_font` |
| 3 | Layout width | Global | Basic | Existing setting | `layout_width` (items) | Options `compact`, `wide`, `full`; default `wide` | None | Confirmed | `twilight.json`; settings-evidence |
| 4 | Section spacing | Global | Basic | Existing setting | `section_spacing` (items) | Options `compact`, `balanced`, `spacious`; default `balanced` | None | Confirmed | `twilight.json`; settings-evidence |
| 5 | Corner style | Global | Basic | Existing setting | `corner_style` (items) | Options `square`, `soft`, `rounded`; default `square` | None | Confirmed | `twilight.json`; settings-evidence |
| 6 | Product card style | Global | Basic | Existing setting | `product_card_style` (items) | Options `minimal`, `bordered`, `elevated`; default `minimal` | None | Confirmed | `twilight.json`; settings-evidence; implementation owned by the card spec |
| 7 | Header layout | Global | Basic | Existing setting | `header_layout` (items) | Options `centered`, `start`; default `centered` | Header-Navigation Mobile variants apply density/layout per `389:61` | Confirmed | `twilight.json`; settings-evidence; owned by HDL-07 |
| 8 | Header density | Global | Advanced | Existing setting | `header_density` (items) | Options `compact`, `comfortable`; default `comfortable` | Same as row 7 | Confirmed | `twilight.json`; settings-evidence; owned by HDL-07 |
| 9 | Header wishlist visibility | Global | Advanced | Existing setting | `header_show_wishlist` (boolean) | Default `true` | Same as row 7 | Confirmed | `twilight.json`; settings-evidence; owned by HDL-07 |
| 10 | Mobile toolbar visibility | Global | Basic | Existing setting | `show_mobile_toolbar` (boolean) | Default `true` | Mobile-only control by definition | Confirmed | `twilight.json`; settings-evidence; owned by HDL-12 |
| 11 | Motion level | Global (once decided) | Not merchant-controlled in HDL-02 | Spike | none exists | No confirmed values; three motion levels and final values are undecided | Unknown — decided with the motion system | **Spike — Not approved for implementation** | Owner: HDL-06; preliminary motion contract in Foundations |
| 12 | New overlay fields | Component | Not merchant-controlled in HDL-02 | Spike | none exists | No confirmed field/API for additional overlay options | Unknown | **Spike — Not approved for implementation** | Owner: the consuming component spec; must confirm an existing field/API first |

Context of record: `announcement_enabled=true` and `footer_is_dark=true` are documented as
existing context but create no new Variant in the nine represented HDL-02 families (`design.md`
Settings Matrix). Scope semantics per FR-005: `Global` affects the whole store, `Component` stays
within section fields, `Fixed` is a quality decision not exposed to the merchant — the Fixed
decisions in this revision are the direction/mirroring rules (§2.4), the focus contract, and the
Bidi isolation rules, which need no merchant switch.

### 3.2 Owned non-implementable Spikes (FR-004)

| Spike | Owner | Decision criteria to resolve | Status |
|---|---|---|---|
| Motion level / motion token values | HDL-06 | HDL-06 defines the three motion levels, final token values, and `prefers-reduced-motion` alternatives; only then may a motion option be presented as implementable | Spike — Not approved for implementation |
| New overlay fields | The consuming component spec | A confirmed existing `twilight.json` field, component field, or documented Salla/Twilight API must be cited; otherwise the option stays out of the implementable list | Spike — Not approved for implementation |

Neither Spike appears as an implementable option anywhere in this report; unclassified
merchant-selectable variants = 0 (data-model invariant 6).

### 3.3 Tool constraints (FR-004 traceability honesty)

- **Code Connect**: no Code Connect files exist in the repository and no valid 1:1 code component
  exists in this scope to connect. The tool itself requires a Dev or Full seat on a Figma
  Organization/Enterprise plan, which the current environment does not have. HDL-02 therefore
  does **not** claim any code-connection integration.
- **Named version history**: a save attempt via `saveVersionHistoryAsync` is unsupported in the
  current Figma environment; the attempt was not executed and caused no partial write.
- **Actual fallback in force**: the Node ID Registry (§1.2) + WEB variable syntax (§2.1) + the
  revision identity frozen in the root name (`…/Rev-2`), governance panel, QA gate, and this
  approval record constitute the traceable link between Figma and the repository. These
  constraints are tool limitations, not blockers for HDL-02 approval, and they must not be
  described as implemented integrations.

### 3.4 End-to-end variant traces (FR-004, FR-005)

Three merchant-selectable variants from three different families, traced through the Node
Registry and Settings Evidence Matrix to an exact source:

**Trace A — Header Navigation, Desktop RTL Default (registry #8, node `389:61`).**
Variant axes: Device=Desktop, Direction=RTL, Mode=Default. Merchant-visible properties: header
arrangement and height. Settings Matrix rows 7–8 resolve both to existing `twilight.json` IDs:
`header_layout` ∈ {`centered`, `start`}, default `centered`; `header_density` ∈ {`compact`,
`comfortable`}, default `comfortable`. Evidence status: Confirmed (settings-evidence); runtime
application is owned by HDL-07. Verdict: implementable in principle, no Spike.

**Trace B — Product Card Skeleton, RTL Default (registry #6, node `386:49`).**
Variant axes: Direction=RTL, ContentState=Default. Merchant-visible property: card presentation
style. Settings Matrix row 6 resolves it to existing `product_card_style` ∈ {`minimal`,
`bordered`, `elevated`}, default `minimal`. Evidence status: Confirmed (settings-evidence);
runtime card implementation belongs to its owning spec. Direction behavior is a Fixed decision
(§2.4 mirroring rules), not a merchant option. Verdict: implementable in principle, no Spike.

**Trace C — Overlay Shell, Drawer RTL Ready (registry #7, node `386:129`).**
Variant axes: Kind=Drawer, Direction=RTL, AsyncState=Ready. Opening side is a Fixed decision
(start = right in RTL; §2.4). The async Ready/Loading/Error states are component-contract
behavior. Any **additional** merchant-facing overlay field traces to Settings Matrix row 12:
`Spike — Not approved for implementation`, owner = consuming component spec, decision criterion =
a confirmed existing field/API. Verdict: approved shell geometry/states are traceable; any new
field is explicitly non-implementable until resolved — and is counted as an owned Spike, keeping
the unclassified count at zero.

**US3 checkpoint**: confirmed facts (rows 1–10), Fixed decisions, and owned Spikes (rows 11–12)
are disjoint and exhaustive; zero invented setting IDs; zero unclassified selectable variants;
three cross-family traces reach an exact source.

---

## 4. User Story 4 — Later visual spec inherits the foundation (P2)

### 4.1 Downstream ownership map (FR-010)

| HDL-02 output | Later owner |
|---|---|
| Settings Matrix contract and Basic/Advanced/Global/Component/Follow Preset rules | HDL-03 |
| Detailed RTL/LTR, focus, accessibility, and localization rules; runtime DOM/keyboard verification | HDL-04 |
| Final bundle/performance measurement and CI gates | HDL-05 |
| Motion token values and the three motion levels | HDL-06 |
| Full Header/Search/Product/Card/Cart/Home/Catalog/Supporting-page designs | HDL-07 through HDL-23, each per its scope |
| Configuration and identity of the four Presets and demo stores | HDL-24 through HDL-27 |
| Merchant onboarding and marketplace presentation/listing assets, with their visual-governance and approval evidence | HDL-28 |
| Comprehensive comparison, Theme Raed differentiation, launch testing | HDL-29 |

**Shared-component change/reopen rule**: every later owner adds its own Node IDs and never
silently modifies an approved shared component. If use reveals a need to change a shared
component, the HDL-02 node returns to `Reopened` and a new revision is issued before affected
implementation continues (spec.md §12).

### 4.2 Handoff contract — required consumer fields (FR-006, FR-010)

From `contracts/visual-spec-handoff.md`, a consumer's `design.md` MUST contain, before Plan:

1. Spec ID, Figma file/page/section, current revision, lifecycle status, and direct Node URLs.
2. A Node Registry row per approved Frame/Component set: canonical name, kind, device,
   language/direction, states, revision, owner, approval date, `supersedes`.
3. Arabic Mobile RTL first, Arabic Desktop RTL, then critical English Mobile/Desktop LTR parity.
4. Applicable Default/Hover/Focus-visible/Pressed/Disabled and Loading/Empty/Error/Sold-out
   states; every omitted state carries an explicit N/A reason.
5. A Settings Matrix row for every visible choice, resolving to an existing setting, component
   field, documented platform contract, Fixed quality decision, or owned Spike.
6. The exact owner approval statement, owner name, date, and revision.

Canonical naming (FR-006):

- Shared foundations/components: `HDL-02/Shared/<Responsibility>/…`
- Consumer frames/components: `HDL-XX/<Responsibility>/<Viewport>/<Direction>/<State>` —
  canonical example `HDL-09/SearchDrawer/Mobile/RTL/Loading`.
- Responsibility names describe purpose/behavior, never a decorative style; a presentation
  difference with identical data/behavior is a Variant, not a forked component; two different
  names for the same entity are forbidden in the registry.

### 4.3 Evidence chain and DeviationRecord lifecycle (FR-008)

Evidence chain: **Figma → GitHub → rendered Salla**. Figma proves intent; GitHub proves
implementation; the rendered Salla preview after the latest build proves behavior. A standalone
mock-up or stale screenshot can never prove storefront behavior (AGENTS.md evidence rules).

Deviation lifecycle after any later spec ships:

1. Compare the approved node/revision against the rendered Salla preview captured **after** the
   latest build.
2. Record a `DeviationRecord` with all `data-model.md` fields: `approved_node_revision`,
   `preview_evidence` (URL/path + timestamp), observable `difference` (not inferred),
   `classification` ∈ {Bug, Salla Platform, Responsive, Accessibility, Performance, Product
   Decision}, `owner`, `decision` ∈ {Fix, Accept, Spike}, and `owner_approval`.
3. An intentional difference may be called accepted only after owner approval is recorded; the
   DeviationRecord never mutates or erases the original approval.
4. No deviations are pre-accepted in HDL-02 (spec.md §13); none exist to record because no source
   shipped.

### 4.4 Consumer gate examples (FR-010)

**Bounded PASS example (synthetic).** Spec HDL-09 registers
`HDL-09/SearchDrawer/Mobile/RTL/Loading` in its `design.md` with: direct Node URLs for Arabic
Mobile RTL, Arabic Desktop RTL, and paired English LTR frames; a registry row per frame (kind,
device, direction, states, revision 1, owner, approval date, `supersedes` = none); states
Default/Hover/Focus-visible/Pressed plus Loading/Empty/Error, with Disabled marked N/A ("drawer
trigger lives in Header, not the drawer"); a Settings Matrix resolving the search trigger to the
existing header component field and declaring any new search option an owned Spike; and the exact
owner statement with name/date/revision. Result: all six contract fields present → may enter
Plan.

**Blocking FAIL example (synthetic).** A later spec registers `HDL-15/ProductGallery` frames but
its `design.md` shows approval copied from an older revision, and one merchant-selectable gallery
layout Variant cites no setting, field, API, or owned Spike. Per the contract, stale-revision
approval plus an unclassified selectable Variant is a **hard gate failure**: the spec may not
enter Plan/Tasks/implementation until the current revision is approved and the Variant is
confirmed or tagged `Spike — Not approved for implementation` with an owner.

Consumer completion check (verbatim contract gate): shared HDL-02 foundations/components reused;
canonical names and direct Node IDs recorded; four-way direction/device coverage complete or
explicitly N/A; interactions, async states, and focus contract documented; settings evidence
complete with owned Spikes; exact current-revision owner approval recorded; post-implementation
production build and theme guard pass; post-change rendered Salla evidence captured; deviations
classified and approved or fixed.

**US4 checkpoint**: every mandatory contract clause maps to §§4.1–4.4; every later owner cited is
a real roadmap ID/range (HDL-03…HDL-06; HDL-07…HDL-23; HDL-24…HDL-27; HDL-28; HDL-29); the PASS/FAIL examples are
evaluable from this report and the contract alone.

---

## 5. Build, preview, and runtime gates (FR-009)

- Production build `npx webpack --mode production`: **N/A — no source change**.
- Rendered Salla preview: **N/A — no source change**.
- Theme bundle delta: **0 B**; network request delta: **0 requests**; runtime work delta: **0**.
- Source-scope proof: `git status --porcelain` and `git diff` over
  `src public twilight.json package.json pnpm-lock.yaml` returned 0 entries / 0 bytes before this
  report (`/tmp/hdl-02-preimpl-source-status.txt`); the post-report check is a final-review gate
  (T038).
- Invalidation rule: any diff under `src/`, `public/`, `twilight.json`, locales, package
  manifests, or the lockfile voids this N/A, moves the change to its owning spec, and activates
  the full production-build plus rendered-preview gate there (quickstart §4).

## 6. Honest limits of this evidence

- Figma Revision 2 proves **visual intent and governance only**. Nothing in HDL-02 verifies a
  rendered storefront, ARIA behavior, keyboard DOM order, Lighthouse scores, performance metrics,
  or accessibility results. Those verifications are owned by HDL-04, HDL-05, and each consuming
  spec against a live Salla preview after real source changes.
- Node IDs and approval identity are frozen in documentation and Figma naming; the Figma tool
  could not persist named version history (§3.3), so revision identity relies on the registered
  root/QA/registry nodes plus this repository record.
- The existing theme has not implemented Revision 2; parity and state coverage above describe the
  approved design, not current storefront behavior.

## 7. FR and story traceability

| Requirement | Report sections |
|---|---|
| FR-001 design.md + Node registry | §1.1, §1.2, §2.1 |
| FR-002 language/device order | §2.3, §2.4 |
| FR-003 behavior and states | §2.2, §2.3, §2.5 |
| FR-004 variant implementability evidence | §3.1–§3.4 |
| FR-005 Settings Matrix | §3.1, §3.2 |
| FR-006 canonical naming | §1.2, §2.2, §4.2 |
| FR-007 approval/revision lifecycle | §1.3, §1.4 |
| FR-008 deviation record | §4.3 |
| FR-009 bounded deliverable | §0, §2.1, §5 |
| FR-010 downstream gate | §4.1–§4.4 |

| User story | Report sections | Checkpoint |
|---|---|---|
| US1 — owner approves a known revision (P1) | §1.1–§1.4 | Revision 2 identity, 20 records, one complete ApprovalRecord, reopen/supersede rules |
| US2 — designer reuses the system (P1) | §2.1–§2.5 | 9 families, variant_total = 88, foundation counts, state/direction coverage, label repair |
| US3 — developer traces design to real capability (P1) | §3.1–§3.4 | Confirmed/Fixed/Spike disjoint and exhaustive; 3 traces; 0 unclassified variants |
| US4 — later spec inherits the foundation (P2) | §4.1–§4.4 | Ownership map, handoff contract, deviation lifecycle, PASS/FAIL examples |

## 8. Final acceptance record

| Field | Value |
|---|---|
| Final Review | STATUS: PASS · BLOCKERS: 0 |
| Owner acceptance statement | `ACCEPT HDL-02` |
| Accepted by | Yasser |
| Accepted on | 2026-08-08 |
| Effect | Acceptance closes the HDL-02 Human Gate; the lifecycle status transition to `done` in `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and `spec.md` is a separate governance step owned outside this report |
| Completion evidence | This report (`specs/002-figma-design-system/design-system-report.md`) plus the `/tmp/hdl-02-*.txt` evidence files inventoried in §0; the report SHA-256 is recalculated externally after this edit |

**End of report — HDL-02, Revision 2, accepted 2026-08-08.**
