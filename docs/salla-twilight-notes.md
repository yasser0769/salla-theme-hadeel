# Salla / Twilight reference for this theme

Everything below was read out of
`node_modules/@salla.sa/twilight-components/dist/collection/components/` and
`node_modules/@salla.sa/twilight/types/` at the versions pinned in `package.json`
(`@salla.sa/twilight*` `^2.14.531`). It is not from documentation or memory.

**Re-verify before relying on any of it.** These are vendored internals, not a public
contract. Salla can change them in a patch release. The point of this file is to stop
agents from *inventing* an API when a real one exists — not to freeze the real one.

---

## 1. The rendering model

Salla renders the Twig templates server-side. `salla-*` elements are Stencil web
components loaded by Salla's own runtime, **not** bundled by this repo's webpack.

They use Stencil **scoped** encapsulation, not shadow DOM. Two consequences:

- Theme CSS *can* reach `.s-slider-container`, `.s-button-btn`, `.s-user-menu-trigger`
  and friends. That is why the theme does it everywhere.
- Those class names are private. When one is renamed upstream, the theme silently loses
  a style — or, worse, keeps a hack that depended on it. Prefer a documented slot or
  attribute over reaching into internals, and when you must reach in, leave a comment
  saying what breaks if the class disappears.

`<script>` order in `master.twig` matters: `product-card.js` is loaded in `<head>` with
`defer` and `data-cfasync="false"` because `salla-products-slider` checks
`customElements.get('custom-salla-product-card')` while it renders.

---

## 2. Translations — the API that already exists

`salla.lang` (types at `node_modules/@salla.sa/twilight/types/lib/lang.d.ts`) extends
`lang.js`:

```ts
get(key, replacements?, locale?): string   // returns the KEY itself when missing
has(key, locale?): boolean
onLoaded(callback?): Promise<void>
translationsLoaded: boolean
```

Plus a runtime extension that the typings do not list but **25 Twilight components use**:

```js
salla.lang.getWithDefault('pages.products.kalles.quick_view', 'Quick view')
```

Verified callers include `salla-quantity-input`, `salla-product-options`, and
`salla-delivery-promise`. Use it. If you want a typed path instead:

```js
salla.lang.has(key) ? salla.lang.get(key) : 'English default'
```

**Rules.**

- Read translations inside `salla.lang.onLoaded(() => …)`. Before that, `get()` returns
  the key.
- Defaults passed to `getWithDefault` are **English only**. Arabic comes from
  `src/locales/ar.json`, never from a literal in code.
- Never branch on `document.documentElement.dir`, `document.documentElement.lang`, or
  `user.language_code` to pick a string. An RTL store is not necessarily an Arabic store.
- `src/locales/*.json` are merged by Salla at theme-publish time. A key you just added
  may not resolve in a preview build of an older published version. That is a
  **deployment** condition, not a bug to patch around with a hardcoded fallback —
  confirm it in the console before drawing conclusions.

---

## 3. Components used by this theme

56 `salla-*` tags appear in `src/`. These are the ones with behavior worth knowing.

### `salla-add-product-button`

Attributes: `product-id`, `product-status`, `product-type`, `quantity`, `channels`,
`donating-amount`, `has-pre-order`, `notify-options-availability`, `quick-buy`,
`subscribed-options`, `support-sticky-bar`.

- **It already implements the mobile sticky purchase bar.** `support-sticky-bar` plus
  `type="submit"` registers a `(min-width: 768px)` media listener and renders the button
  in sticky mode when that query does **not** match — i.e. below 768px only.
  The theme's own `.kalles-product-dock` shows at `≥768px`, so the two are
  complementary, not duplicates. What is broken is the boundary: the theme positions
  `.sticky-product-bar` at `max-width: 640px` while the component switches at `767px`
  and the body padding compensates at `767px`. Keep all three on one number.
- Its inner element is always `<salla-button type="button">` wired to
  `addProductToCart()` — the surrounding `<form onsubmit>` is not the path taken. Calling
  `form.requestSubmit()` from your own control (as `product.js` does for the dock)
  **bypasses** the component's out-of-stock, notify-availability, and required-options
  handling.
- Slotted content becomes `passedLabel = host.innerHTML`, so passing markup as the label
  works, but the component overwrites it via `btn.setText()` on re-render.
- Rendering a bare `salla-add-product-button` **without** a `salla-product-options`
  sibling for a product that has required options will fail at add-to-cart time. This is
  the current quick-view bug in `product-card.js:openQuickView`.

### `salla-products-slider`

- Fetches on `componentWillLoad`, not on scroll — hiding the section does not prevent
  the request.
- `render()` returns nothing when `canRender()` is false (source invalid, or related
  products disabled by the merchant). But when the fetch succeeds with **zero** products,
  it still renders the `salla-slider` with `block-title` and arrows around an empty
  items slot. That is the "title and arrows, no products" gap on the product page.
- **Emits `salla-products-slider::products.fetched` with the product array.** Listen to
  this to show/hide the section. It is cheaper and more reliable than the
  `MutationObserver` currently in `product.js:initRelatedProducts`.
- Renders `custom-salla-product-card` by default (`productCardComponent`), passing
  `product` as a **property**, plus `source` and `source-value` attributes.
- Filter or replace items with
  `salla.hooks.registerHook('salla-products-slider', 'beforeAppendItems', async (ctx) => { ctx.items = … })`.

### `salla-slider`

Slots: default, `items`, `thumbs`.

Methods (all async): `slideTo`, `slideNext`, `slidePrev`, `slideToLoop`, `slideReset`,
`update`, `updateSize`, `updateSlides`, `updateAutoHeight`, `sliderInstance`,
`thumbsSliderInstance`, `thumbsSliderUpdate`, `getSlides`, `getThumbsSlides`.

Backed by Swiper, which **computes slide width and height in JavaScript**. Forcing those
from CSS — the `width: 100% !important; height: 106px !important` on
`.s-slider-thumbs-container .swiper-slide` in `product.scss` — fights the layout engine
and breaks thumbnail scrolling. Size the container, or call `updateSize()` after your
own layout change.

### `salla-quantity-input`

Slots: `increment-button`, `decrement-button`.
Methods: `setValue(value, fireChangeEvent = true)`, `increase()`, `decrease()`.
Reads current value from the `quantity` property.

### `salla-modal`

Slots: `footer`, `loading`.
Methods: `open()`, `close()`, `loading()`, `stopLoading()`, `setTitle()`.
Attributes used here: `width`, `position`, `is-closable`, `no-padding`.
Await `customElements.whenDefined('salla-modal')` before calling `open()` on a modal you
just created.

### `salla-product-options`

Methods worth knowing before hand-rolling validation: `getSelectedOptions()`,
`getSelectedOptionsData()`, `hasOutOfStockOption()`, `reportValidity()`,
`validateAndScroll()`, `enableUserInitiatedValidation()`, `enterCartMode()`.
Emits `product-options::change`.

### `salla-cart-summary`

Slot: `icon` — this is the supported way to replace the cart glyph, and the header uses
it correctly. Method: `animateToCart()`.

### `salla-user-menu`

Slot: **`login-btn` only.** There is no slot for the trigger or the avatar; the trigger
is a fixed HTML template containing `.s-user-menu-trigger-avatar`. The header currently
sets `.s-user-menu-trigger { opacity: 0 }` and paints a decorative SVG on top with
`pointer-events: none`. If Salla renames that class, the account button becomes
invisible while staying clickable. Restyle the real trigger instead when possible, and
if you keep the overlay, treat it as a known liability.

### Components that render nothing when empty

`salla-trust-badges`, `salla-installment`, `salla-metadata`, `salla-offer`,
`salla-comments`. An empty area on the page is usually a merchant with nothing
configured — **not** CSS hiding the block. Confirm which one before "fixing" it.

---

## 4. Theme settings

`twilight.json` `settings[]` entries each have an `id`. Templates read them with
`theme.settings.get('id', default)`. A `get()` for an undeclared id silently returns the
default forever, and the merchant never sees a control. `scripts/check-theme.mjs` fails
the build on that mismatch.

`items`-type settings whose values become CSS classes (`layout_width`, `section_spacing`,
`corner_style`, `product_card_style`, `header_layout`, `header_density`,
`announcement_style`) must have a matching class in the SCSS for every non-default value.

`theme.settings.get()` returns strings in a `{{ }}` context. `window.imageZoom = "false"`
is truthy — compare explicitly.

Declared `features` (`fonts`, `color`, `mega-menu`, `filters`, …) are what let Salla show
the corresponding merchant controls. Declaring `color` and then hardcoding a brand color
in SCSS is a contradiction the merchant cannot resolve.

---

## 5. `custom-salla-product-card`

Defined in `src/assets/js/partials/product-card.js`, registered as
`custom-salla-product-card`, and consumed by `salla-products-slider` and
`salla-products-list`.

Contract to preserve:

- `product` arrives as a **property** (an object) from Stencil, or as a JSON `product`
  attribute. `connectedCallback` must handle both.
- Render inside `salla.lang.onLoaded()`, after `window.app.status === 'ready'` or the
  `theme::ready` event.
- Keep the `s-product-card-*` class names — Twilight and the tailwind theme style them,
  and `Helper.syncWishlistIcons` looks up `.s-product-card-wishlist-btn`.
- Escape every interpolated value with `escapeHTML()` and quote every attribute. Product
  names contain spaces and quotes.

---

## 6. The local development loop

There is **no local storefront.** Twig renders on Salla's servers against real store
data, so a preview session and a network connection are always required.
`salla theme dev` does not help — it is for React themes only.

```bash
salla theme preview --store <StoreName> --without-editor
```

That one command runs webpack in watch mode and starts two servers:

- `http://localhost:8002` serves the built `public/` assets; the previewed page loads its
  stylesheet and scripts straight from there.
- `ws://localhost:8003` pushes hot reloads.

`ThemeWatcher` (`node_modules/@salla.sa/twilight/watcher.js`, wired up in
`webpack.config.js`) watches `src/views/**/*.twig` and `src/**/*.json` and runs
`salla theme sync -f <file>` per changed file — a hidden CLI command that uploads that
one file to the draft.

**So no git push is needed per edit.** Verified empirically: a `data-hadeel-sync-probe`
attribute added to `single.twig` appeared in the previewed page's DOM with `HEAD` still
equal to `origin/master` and zero commits in between; reverting the file removed it
again. SCSS and JS arrive through `localhost:8002`; Twig and JSON arrive through `sync`.

Two things a preview session leaves behind:

1. **`public/` becomes a development build.** Watch mode uses the eval devtool, so
   `public/app.js` grows from ~128 KB to ~352 KB and carries the eval banner that CI
   rejects. Always rerun `npx webpack --mode production` before committing.
2. Ports 8002/8003 stay bound until the process is killed.

Creating the draft appears to go through the linked GitHub repository — the CLI calls
`/partners/v1/api/theme/repo?url=<owner>/<repo>`, and a preview that was failing with
`Tag <version> already exists` started working after `master` was pushed. That ordering
was observed, not isolated; keep `master` current before starting a session.

Publishing is not a CLI operation. `salla theme` offers only `create`, `dev`, `doctor`,
`preview` and `list`; going live is done from the Salla Partners dashboard.

## 7. Build

```bash
npx webpack --mode production
```

Entries are defined in `webpack.config.js`; `output.clean: true` wipes `public/` each
run. `public/` is committed, so a production build is part of any commit that touches
`src/assets/**`. `.github/workflows/verify-production-bundle.yml` rejects a bundle built
with the development eval devtool, and `node scripts/check-theme.mjs --build` verifies
that the committed bundles match a fresh build of `src/`.
