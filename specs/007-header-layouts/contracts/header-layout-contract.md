# HDL-07 Header Layout Contract

## 1. Resolution

1. Resolve `header_layout` through the existing HDL-03 strict setting boundary.
2. Allowed output is exactly one of `centered`, `start`, `transparent`, `commerce`.
3. Invalid raw input resolves to the existing safe default and records Needs Review
   through the existing registry/resolver mechanism.
4. Emit exactly one `hadeel-header-{layout}` body class.
5. Resolve `header_logo_size` and `header_transparent_ink` through independent strict
   allowlists; booleans, numbers, arrays, empty strings, whitespace variants, and raw
   CSS/HTML never reach a class or style value.

## 2. Shared DOM

The storefront renders exactly one `.store-header`, one `#mainnav`, one
`.main-nav-shell`, one `.navbar-brand`, one `custom-main-menu`, and one
`salla-cart-summary`. Conditional search/account/wishlist controls may be absent, but no
hidden duplicate remains focusable. Commerce may render one wide search **trigger** in
the same core; it dispatches the same native search event and performs no request.

Visual order is expressed through grid areas and logical properties. Positive
`tabindex`, DOM cloning for RTL, `row-reverse` used to fake reading order, and mirrored
logos/Search/Cart/Play/Check icons are forbidden.

## 3. Transparent Eligibility

Transparent Top styling is permitted only when all are true:

1. resolved layout is `transparent`;
2. `header_transparent_home` is true;
3. `#main-content` exists and its first element child has
   `data-hadeel-header-hero`;
4. ink is explicit `light|dark`, or `auto` has a server-rendered safe ink marker;
5. the browser supports the selector/behavior used to establish eligibility.

Any failed/unknown predicate renders the ordinary surface. The feature must never first
paint transparent and later discover that it should fall back. `scrolled` always uses an
opaque readable surface. The original logo is not recolored; it receives a neutral
contrast plate. Missing logo renders escaped store-name text.

## 4. Sticky and State

- Sticky false: no scroll listener/controller; the normal document layout remains.
- Sticky true: one passive scroll listener and at most one pending rAF callback.
- Height is measured from the actual shell before it can pin and updated on resize or
  content-size change. Normal variants reserve their measured height; transparent Top
  intentionally overlays the eligible Hero and must not create a layout jump when the
  scrolled fixed surface appears.
- State classes/attributes are idempotent and do not contain raw setting values.
- Menu and search open/close use existing native events/contracts. Escape/close returns
  focus to the initiating control where the platform exposes that behavior.

## 5. Settings Compatibility

- Existing IDs, defaults, meanings, and options are immutable except appending the two
  approved `header_layout` options.
- Existing merchants with `centered|start` render the same functional controls and
  preset behavior before opting into a new layout.
- New Boolean visibility controls default true; new size/ink controls default to safe
  `medium`/`auto`.
- Editor conditions are presentation-only. Hidden-field behavior is never required for
  runtime correctness.
- Source rollback ignores new IDs and retains valid old layout/density values.

## 6. Performance and Evidence

- Zero new dependency, entry, chunk, request, media, font, image analysis, interval, or
  per-layout listener.
- CSS raw delta ≤12,288 B; app JS raw delta ≤4,096 B; compressed package <950,000 B.
- Live evidence follows `live-evidence.schema.json` and the matrix in `quickstart.md`.
- A stale or mismatched preview is `SALLA PREVIEW SYNC FAILURE`, not an automatic code
  failure and never positive evidence.
