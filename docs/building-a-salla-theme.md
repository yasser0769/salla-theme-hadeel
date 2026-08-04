# Building a Salla theme

A practical guide to building a Twilight theme from scratch, written after rebuilding
one. Three kinds of statement appear here and they are labelled, because mixing them is
how the last round of work on this repo went wrong:

- **[docs]** — from Salla's official documentation, linked at the bottom.
- **[measured]** — verified in this repo or against a live preview, with the number.
- **[unverified]** — believed but not proven. Treat as a question, not a fact.

---

## Part 1 — Decide before you write code

**1. Read the publication requirements first, not last. [docs]**
Salla reviews themes by hand. The first criterion is *uniqueness from Theme Raed* — in
the code, in the visual identity, and in "cohesive look and feel across all templates".
A lightly restyled Raed is rejected. This shapes the architecture, so it cannot be
retrofitted.

**2. Pick one industry. [docs]**
Fashion, Health & Beauty, Digital Products, Electronics, Food & Drink, Jewellery &
Accessories, Books & Arts, Home Supplies, Cars & Hardware, Charities, Sports & Toys.
Required at publication; the design should serve it.

**3. Set a size budget on day one. [docs] + [measured]**
Public themes: **1 MB max.** Private themes: **2 MB.**
This repo right now: `public/` is **1.5 MB**, of which `app.css` alone is **768 KB**.
See Part 6 — the breakdown is not what you would guess.

**4. Public or private?** [docs]
Public goes to the marketplace, minimum SAR 250. Private serves one store at 2 MB. Both
go through Salla's review **on every update**, so plan releases, not daily pushes.

---

## Part 2 — Foundations

**5. Starting from Theme Raed is fine; keeping it is not.**
Every inherited file you leave in place is debt you pay at review, under the uniqueness
criterion. In this repo the inherited leftovers — a removed top navbar, its CSS
variables, four unrendered header classes — were still shipping months later.

**6. `twilight.json` is the theme's contract with the platform. [docs]**
It declares the name, the `features` the theme supports, the `settings` a merchant can
change, and any custom `components`. This repo declares 17 features. Each one is a
promise that must have a template and styles behind it.

**7. Delete what you are not using immediately.**
Dead code does not stay harmlessly dead. It gets edited, resurrected by a specificity
accident, or trusted as a working reference.

---

## Part 3 — A design system, before any page

**8. One token layer, in `01-settings/`.** Spacing, radii, control heights, colours.
Component files consume tokens; they never hardcode values.

**9. One file owns each selector.**
The single highest-value rule here. When two stylesheets style the same selector, the
winner is decided by import order, and the result stops being predictable. This repo had
**17 such collisions [measured]**, and one of them silently disabled the merchant's
`footer_is_dark` setting — nobody noticed until the files were merged.

**10. The merchant's colour and font are not yours.**
`master.twig` injects `--color-primary` and `--font-main` from Salla's settings.
Declaring the `color` and `fonts` features and then hardcoding either is a contradiction
the merchant cannot resolve. Verified live: the demo store's primary is `#aed8e0` and its
font is Tajawal, and both flow through correctly [measured].

**11. `!important` only to beat an inline style**, which in practice means Swiper and
some Twilight internals — with a comment saying so. Otherwise it is a specificity war
you started with yourself.

---

## Part 4 — Templates

**12. `master.twig` provides four blocks — `styles`, `head`, `content`, `scripts` — and
the `head:start` / `head` / `head:end` hooks. [docs]** Pages inherit with
`{% extends "layouts.master" %}`.

**13. Cover the whole route map.** `index`, `product/single`, `product/index`, `cart`,
`thank-you`, `blog/*`, `brands/*`, `customer/*`, `page-single`, `loyalty`. One missing
page is a broken storefront.

**14. `src/` is not the whole document.**
Salla contributes body classes, translations, and component markup at render time. This
repo assumed `.product-single` was a dead class because no template rendered it; a live
DOM read showed Salla injects it through the `body:classes` hook, at index 2, right
where the hook expands [measured]. **Never call anything dead without looking at a
rendered page.**

---

## Part 5 — Do not rebuild what Twilight already does

**15. Read `node_modules/@salla.sa/twilight-components/` before writing logic.**
Three things were hand-rolled in this repo that already existed:

| Hand-rolled | Already provided |
|---|---|
| A translation helper that sniffed the page language | `salla.lang.getWithDefault(key, default)` — used by 25 Twilight components |
| A `MutationObserver` watching for product cards | the `salla-products-slider::products.fetched` event |
| A custom mobile sticky bar | `support-sticky-bar` on `salla-add-product-button` |

**16. Style Salla's components; do not replace them.**
Use documented slots where they exist (`salla-cart-summary` exposes `icon`). Where you
must reach into private class names, leave a comment saying what breaks if they change.
This repo hides the real account trigger with `opacity: 0` and paints an SVG over it,
because `salla-user-menu` exposes no slot for it — documented as a known liability
rather than pretended away.

**17. Give custom components many fields. [docs]**
An explicit review criterion: merchants must not be able to make two different themes
look identical through settings. Settings should give the theme character, not just
toggle things off.

---

## Part 6 — Where the weight actually is

`app.css` is 768 KB. Broken down by origin [measured]:

| Weight | Share | What it is |
|---|---|---|
| 522 KB | 68% | **Twilight component styles (`.s-*`)** |
| 100 KB | 13% | rules inside media queries |
| 79 KB | 10% | base reset and un-classified |
| 37 KB | 5% | Tailwind utilities |
| **21 KB** | **3%** | **this theme's own CSS** |
| 9 KB | 1% | third-party widgets, fonts, keyframes |

**Your own code is not the problem.** Two thirds of the file is Salla's own component
CSS, pulled in through `node_modules/@salla.sa/twilight-tailwind-theme/safe-list-css.txt`
(2,493 lines) which is listed in `tailwind.config.js` `content`.

And it is **not removable wholesale**: a live product page loads exactly three
stylesheets — the theme's `app.css`, Google Fonts, and Salla's icon font [measured].
Salla does not serve component CSS separately. Shipping it is the platform contract.

**The reducible part:** ~160 KB of `.s-*` rules belong to component groups with no
matching `salla-*` tag anywhere in `src/` — the heaviest being `.s-bullet-delivery-*`
(28 KB), `.s-block-*` (20 KB), `.s-basket-gap-*` (9 KB), `.s-searchable-dropdown-*`
(9 KB).

**Treat that 160 KB as an upper bound, not a delete list. [unverified]** Twilight
components render other components internally, so a group with no tag in `src/` may
still appear at runtime. Each candidate needs checking against the component source
before its safelist entries are trimmed. Getting this wrong ships an unstyled component
to a page you never tested.

---

## Part 7 — Internationalisation

**18. No hardcoded strings, in any language.** All copy in `src/locales/*.json`, read
through `{{ trans() }}` and `salla.lang.get()`.

**19. Never infer language from `dir` or `lang`.** An RTL store is not necessarily an
Arabic store. This mistake was made twice in this repo.

**20. Logical properties only** — `inset-inline-*`, `margin-inline-*`,
`padding-inline-*` — so the layout flips itself for LTR stores.

---

## Part 8 — The development loop [measured]

**21. One command runs everything:**

```bash
salla theme preview --store <StoreName> --without-editor
```

It starts webpack in watch mode, serves built assets on `http://localhost:8002`, and
pushes hot reloads over `ws://localhost:8003`.

**22. No git push per edit.** `ThemeWatcher` uploads changed `.twig` and `.json` files
one at a time via the hidden `salla theme sync` command. Proven by writing a unique
attribute into `single.twig` and finding it in the previewed DOM with `HEAD` still equal
to `origin/master` and zero commits in between.

**23. There is no local storefront.** Twig renders on Salla's servers against real store
data. You need a connection and a demo store, always. `salla theme dev` does not help —
it is for React themes.

**23b. A dead demo store still appears in `salla store list`. [measured]**
On 2026-08-04 a preview reached the point of creating draft `764214058`, then every
request to the store returned `HTTP 410 نطاق المتجر غير موجود` — including Salla's own
signed URL. The store (`Zaboon`) was still listed by the CLI; only its storefront domain
was gone. Nine other stores on the same account answered `200`.

The listed URL is truncated in the table, but it is `demostore.salla.sa/dev-<email
prefix>`, and the email column is shown in full. Check before blaming the theme:

```bash
COLUMNS=400 salla store list
curl -s -o /dev/null -w '%{http_code}\n' -L https://demostore.salla.sa/dev-<prefix>
```

A store whose `<title>` is its own dev slug has no content configured; one with a real
title does. Pick a configured store, or the product pages render empty.

**24. A preview session leaves `public/` as a development build** — `app.js` goes from
128 KB to 352 KB with the eval devtool banner. Rebuild before committing, every time.

**25. Draft creation goes through a git tag on the linked GitHub repo. [measured]**
The CLI calls `/partners/v1/api/theme/repo?url=<owner>/<repo>`, and Salla builds the
draft from a git tag it creates on that repo. `twilight.json` has **no `version` field**
and `package.json`'s version is unrelated — **Salla holds the version counter
server-side**, and the CLI only reports what Salla decided.

**`Tag <version> already exists` means Salla's counter has run ahead of the repo.**
Every preview attempt increments Salla's version. If an attempt dies after Salla
records the version but before the tag reaches GitHub — a dropped connection is enough
— the two drift apart permanently, and every later attempt fails on the same number.

Measured on 2026-08-04: GitHub's highest tag was `1.0.43`, Salla was asking for
`1.0.47`. A gap of exactly four, matching four attempts made during a network outage.

**Diagnose from the remote, never from local tags.** Local tags go stale silently — the
same day, `git tag` showed a maximum of `1.0.38` while the remote had `1.0.43`:

```bash
git ls-remote --tags origin | sort -t/ -k3 -V | tail -5
```

**Recovery:** push the exact tag Salla is asking for, at the commit you want the draft
built from. That makes the two agree and the next preview succeeds.

```bash
git push origin master          # the draft is built from this commit
git tag 1.0.47 && git push origin 1.0.47
```

If it still refuses, raise the theme version in the Salla Partners portal past the
stuck number and tag that instead. **Do not delete a tag Salla already recorded.**

---

## Part 9 — Safety net, from day one

**26. Build the checks before you need them.** The two scripts in this repo —
`scripts/check-theme.mjs` (rules that must never break) and `scripts/css-snapshot.mjs`
(diff the built CSS before and after a refactor) — would have saved weeks had they
existed at the start. `docs/how-to-work-on-this.md` explains the loop.

**27. Use an error budget that only goes down.** `--max-errors=N` in CI. This repo went
31 → 0; the flag stays spelled out so raising it is a visible decision.

**28. "Done" means measured.** A screenshot or a DOM measurement taken after the change,
not an impression that it looks right.

---

## Part 10 — Publishing [docs]

**29. Publishing happens in the Salla Partners portal, not the CLI.** `salla theme`
offers only `create`, `dev`, `doctor`, `preview`, `list`.

**30. Prepare in advance:** at least 3 screenshots at 1366×768, a configured demo store
(category, colour, thumbnail), a price (SAR 250 minimum for public), and support contact
details. Submission asks for a theme category and a changelog.

**31. Every update goes through full review, private themes included.** Batch changes
into releases. There is a "Withdraw" button to pull a submission back and amend it.

---

## Sources

- [Twilight.json](https://docs.salla.dev/421921m0)
- [Create Salla Theme](https://docs.salla.dev/421877m0) · [Setup Themes](https://docs.salla.dev/421879m0) · [Develop a Theme](https://docs.salla.dev/421878m0)
- [Themes Master Layout](https://docs.salla.dev/421944m0) · [Components Overview](https://docs.salla.dev/422580m0)
- [Theme Publish Main Requirements](https://docs.salla.dev/doc-421886) · [Publish a Theme](https://docs.salla.dev/421880m0)

Measurements were taken on this repository at commit `3939624` and against the
`dev-zaboon` draft storefront. Re-measure before trusting them — `app.css` composition
changes with every dependency bump.
