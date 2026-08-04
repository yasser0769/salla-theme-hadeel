# Working agreement for coding agents

Hadeel is a **Salla Twilight storefront theme**, forked from `theme-raed` and restyled
after the Kalles design. It is not a standalone web app: Salla's servers render the Twig
templates, Salla's `salla-*` web components own most of the behavior, and this repo only
supplies templates, styles, a few scripts, and merchant settings.

Read `docs/salla-twilight-notes.md` before touching anything that talks to a `salla-*`
component, `salla.lang`, or `theme.settings`. It records the real API surface, read out
of `node_modules`, and the places where guessing has already cost us.

---

## Hard rules

1. **`public/` is build output.** Never hand-edit it. `webpack.config.js` sets
   `output.clean: true`, so every build wipes the directory. Change `src/`, then build.
2. **`public/` is committed and must stay in sync.** Any commit touching
   `src/assets/**` must include the rebuilt bundles from
   `npx webpack --mode production`. Development builds are rejected by CI.
3. **Never add a layer that overrides an existing layer.** No `!important` to beat your
   own rule, no stylesheet imported last to win on source order. If a rule is wrong,
   delete the rule. The current `product.scss` / `storefront-system.scss` split is what
   this rule exists to prevent — do not extend it.
4. **No hardcoded user-facing strings in any language.** Translations live in
   `src/locales/ar.json` and `src/locales/en.json`. Templates use `{{ trans('…') }}`;
   JS uses `salla.lang.get()`. Never detect the language yourself.
5. **Do not touch `package.json` or `pnpm-lock.yaml` in a fix.** Dependency changes are
   their own commit with their own reason. pnpm only — `npm install` is blocked by a
   `preinstall` guard.
6. **Say when a description is wrong.** If the task you were handed contradicts what the
   code actually does, stop and say so before changing anything. A task description is a
   claim to verify, not an instruction to execute.
7. **`salla theme preview` may be run without asking.** It is the normal development
   loop, not a privileged action. It leaves `public/` as a development build, so
   rebuild before committing — see rule 2.

---

## Definition of done

A change is not done when the code looks right. It is done when it is measured.

- [ ] `npx webpack --mode production` succeeds
- [ ] `node scripts/check-theme.mjs --build` reports no new errors
- [ ] For any visual or behavioral change: a screenshot or a DOM measurement taken
      **after** the change, with a timestamp later than the change
- [ ] Every claim in the report is traceable to output you actually saw
- [ ] If you pushed: CI is green on that commit — `gh run view $(gh run list --limit 1
      --json databaseId -q '.[0].databaseId')`. Read the **job list**, not the overall
      status. A job that fails in under 20 seconds failed at setup and verified nothing.

**Evidence rules.** Before citing a screenshot or a report, check its date against
`git log` for the files it describes. Artifacts in `output/` predate most of the current
code and are not valid evidence. A local mock-up is never evidence about the theme —
only a rendered Salla storefront is.

State "not verified" explicitly rather than implying verification you did not do.

---

## Layout

```
src/views/          Twig. layouts/master.twig sets <body> classes and CSS vars.
src/assets/styles/  SCSS, ITCSS-ordered, entry point app.scss.
src/assets/js/      Page scripts. partials/product-card.js defines <custom-salla-product-card>.
src/locales/        ar.json / en.json — the only place user-facing copy belongs.
twilight.json       Merchant settings + declared features. Settings ids must match
                    every theme.settings.get() call in the templates.
public/             Build output. Committed. Never edited by hand.
scripts/            check-theme.mjs — the repo guard, see below.
```

`master.twig` injects `--color-primary`, `--color-primary-dark`, `--color-primary-light`,
`--color-primary-reverse`, and `--font-main` from the merchant's Salla settings. Those
are the only merchant-controlled tokens; everything else must be defined in
`src/assets/styles/01-settings/`.

Body classes drive merchant customization: `hadeel-layout-*`, `hadeel-spacing-*`,
`hadeel-corners-*`, `hadeel-card-*`, `hadeel-header-*`. Each maps to a value declared in
`twilight.json`. If you add an option value, add the matching class, and vice versa.

---

## Commands

```bash
npx webpack --mode production      # build (required before committing src/assets changes)
npx webpack --mode development --watch
node scripts/check-theme.mjs       # static guard
node scripts/check-theme.mjs --build   # + verifies public/ matches src/
node scripts/css-snapshot.mjs out.txt  # normalize built app.css for before/after diffing
```

Before any non-trivial stylesheet change: snapshot, change, rebuild, snapshot, `diff`.
An empty diff proves you changed nothing; a non-empty one is the list you must justify.
`docs/how-to-work-on-this.md` explains the loop.

`scripts/check-theme.mjs` catches, in order: selectors declared in two component files,
hardcoded Arabic outside `src/locales`, theme classes styled but never rendered,
`var(--token)` with no definition, `theme.settings.get()` keys missing from
`twilight.json`, and `public/` drift. It currently reports pre-existing errors — do not
let that number grow.

---

## Regressions this repo has already shipped

Named so they are recognizable, not repeated.

**Parallel stylesheets.** `product.scss` and `storefront-system.scss` style 17 of the
same top-level selectors, and `app.scss` imports the second last on purpose so it wins.
Outcomes depend on source order and specificity accidents, so unrelated things break on
every edit. Merge, do not stack.

**Assuming a class is dead because the templates do not render it.** `product.scss` and
`chat-bots.scss` targeted `.product-single` while `master.twig` renders
`product-single-page`, so a static read said the rules were dead. They were not: Salla
injects `product-single` through the `body:classes` hook, and a live DOM read shows both
classes. The rules now use the theme's own class, which does not depend on an
undocumented platform injection — but the reasoning that got there was wrong until the
storefront was actually loaded. **`src/` is not the whole document.** Salla contributes
body classes, translations, and component markup at render time; confirm against a live
DOM before calling anything dead.

**Reimplementing Twilight.** `getKallesTranslation()` in `product-card.js` hand-rolls
what `salla.lang.getWithDefault()` already does, and reintroduced hardcoded Arabic while
doing it. `product.js:initRelatedProducts` hand-rolls a `MutationObserver` for something
`salla-products-slider::products.fetched` already announces. Check
`docs/salla-twilight-notes.md` for an existing API before building one.

**Acting on an unverified claim.** A review of this repo asserted that
`.kalles-product-dock` and `support-sticky-bar` were two sticky bars fighting each
other, and recommended deleting the dock. Reading the component showed they are
complementary — the dock is `≥768px`, the component is `<768px`. Deleting it would have
removed a working feature. Verify the claim before you execute it; that is rule 7.

**Container fork.** `.kalles-product-page > .container` hardcodes `1320px` and outranks
`body .container`, so the product page is misaligned with the header and footer and the
merchant's `layout_width` setting silently does nothing there. One container rule.

**Verification theater.** `design-qa.md` ends in `final result: passed` while every piece
of evidence in it comes from `kalles-card-preview.html` — a standalone mock-up with
different fonts and icons that shares no code with the theme. Test the thing you shipped.

**Scope creep.** A commit titled "add merchant customization controls" also upgraded
dependencies and rewrote 563 lines of `twilight.json`. One reason per commit.
