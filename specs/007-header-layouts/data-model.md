# Phase 1 Data Model — HDL-07

## HeaderConfiguration

| Field | Type | Validation / default | Owner |
|---|---|---|---|
| `layout` | enum | `centered|start|transparent|commerce`; default preserves existing `centered` | `header_layout` |
| `sticky` | boolean | existing safe default `true` | `header_is_sticky` |
| `transparent_home` | boolean | default `true`; meaningful only with transparent layout | `header_transparent_home` |
| `show_search` | boolean | default `true` | `header_show_search` |
| `show_wishlist` | boolean | existing default `true` | `header_show_wishlist` |
| `show_account` | boolean | default `true` | `header_show_account` |
| `logo_size` | enum | `small|medium|large`; default `medium` | `header_logo_size` |
| `density` | enum | existing `compact|comfortable`; existing default `comfortable` | `header_density` |
| `transparent_ink` | enum | `auto|light|dark`; invalid/unset → `auto` | `header_transparent_ink` |

Validation is server-side allowlist resolution. Raw merchant input is never interpolated
into a class or attribute. Existing HDL-03 Follow/Custom resolution continues to own
`header_layout` and `header_density`; the five new HDL-07 settings are independent safe
global controls.

## HeaderLayoutVariant

| ID | Desktop structure | Mobile structure | Behavior |
|---|---|---|---|
| `centered` | menu / centered brand / actions in the approved balanced arrangement | shared core | existing default semantics preserved |
| `start` | brand at logical start, menu center/fill, actions end | shared core | existing semantics preserved |
| `transparent` | centered layout placed over eligible first Hero | shared core | normal surface when ineligible/uncertain; surface after scroll |
| `commerce` | utility row with prominent search trigger plus navigation row | shared core | same search event and menu data; no duplicated search/menu logic |

Exactly one layout class is emitted. Layouts differ only by presentation and shell
placement; their child interaction contracts are identical.

## HeaderSlot

| Slot | Required | Visibility | Contract |
|---|---:|---|---|
| menu trigger/navigation | yes | Desktop menu; Mobile trigger | one `custom-main-menu`; logical focus order; HDL-08 owns menu contents |
| brand | yes | always | original `store.logo`; text fallback; no mirroring/inversion |
| search | conditional | `show_search` | icon or commerce-wide trigger dispatches the same `search::open` event; HDL-09 owns results |
| account | conditional | `show_account` | native `salla-user-menu` or `login::open`; one accessible control |
| wishlist | conditional | `show_wishlist` | existing wishlist link/counter behavior |
| cart | yes | always | native `salla-cart-summary` with supported icon slot |

## HeroEligibility

| Field | Type | Rule |
|---|---|---|
| `is_first_main_element` | boolean | eligible marker must be the first element child of `#main-content` |
| `component_kind` | enum | HDL-07 initially supports only the full-width enhanced Hero |
| `auto_ink` | enum/null | `light` only when all rendered slides use the proven dark overlay; otherwise null |
| `rendered_marker` | data attribute | emitted server-side by the eligible component; never inferred from image pixels |

Eligibility is progressive: any unknown or failed condition results in ordinary header
surface. Later Hero types may join only through their owning Specs and the same contract.

## HeaderRuntimeState

| State | Entry | Exit | DOM effect |
|---|---|---|---|
| `top` | initial and `scrollY` below threshold | scroll crosses threshold | no scrolled marker; transparent may be active |
| `scrolled` | threshold crossed while Sticky is enabled | returns above threshold | one `is-scrolled`/`fixed-header` state; opaque readable surface |
| `menu_open` | native mobile menu opens | close/Escape/outside per native contract | body menu state; focus returns to trigger |
| `search_open` | search trigger dispatches open event | native search closes | native search shell; focus behavior verified live |
| `fallback_surface` | Hero/contrast/selector condition is not proven | eligibility becomes proven on next server render | ordinary header; no flash or client promotion |

State transitions must not reorder the DOM, mount a duplicate header, or create a second
scroll listener. Reduced-motion settings govern transitions but not visibility.

## HeaderEvidenceRecord

| Field | Type | Rule |
|---|---|---|
| `captured_at` | ISO-8601 | later than the last relevant source change |
| `commit_sha` | 40-char SHA | exact preview implementation commit |
| `branch` | string | isolated preview branch confirmed by owner |
| `scenario` | enum/string | stable matrix ID |
| `viewport` | object | width, height, DPR |
| `html` | object | actual `lang` and `dir` |
| `layout` | enum | resolved body class and configured value |
| `state` | enum | top/scrolled/menu_open/search_open/fallback_surface |
| `hero` | object | first-element selector, eligibility marker, auto ink |
| `geometry` | object | header/main rectangles and overlap/CLS observations |
| `accessibility` | object | names, focus order/return, target sizes, contrast result |
| `network` | array | canonicalized resource URLs; HDL-07 before/after set delta empty |
| `overflow` | object | `scrollWidth <= innerWidth` plus exact widths |
| `artifacts` | array | screenshot/DOM/Lighthouse paths |

The JSON shape is pinned by `contracts/live-evidence.schema.json`; screenshots alone do
not satisfy runtime acceptance.
