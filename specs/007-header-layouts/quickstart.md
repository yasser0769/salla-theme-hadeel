# HDL-07 Validation Quickstart

## 1. Capture the clean baseline

From the primary HDL-07 branch, before source edits:

```bash
node scripts/check-theme.mjs --json
node scripts/check-bundle-budget.mjs --budget
node scripts/css-snapshot.mjs /tmp/hdl07-before.css.txt
wc -c public/app.css public/app.js
git status --short --branch
```

Expected baseline on 2026-08-11: guard 0 errors/0 warnings; app CSS 799,430 B;
app JS 116,474 B; compressed package estimate 478,773 B. The existing 3-byte
`checkout.js` raw-ratchet warning is telemetry and is unrelated to HDL-07; do not hide or
expand it.

## 2. Run deterministic contracts

```bash
node --test tests/header-layouts.test.mjs
node --test tests/settings-preset-engine.test.mjs
node --test tests/localization-rtl-accessibility.test.mjs
node --test tests/performance-budget.test.mjs
node --test tests/motion-system.test.mjs
node scripts/check-header-layouts.mjs --strict
node scripts/check-theme.mjs --json
```

The HDL-07 suite must prove the four-value allowlist, exact legacy output for
`centered|start`, invalid-input fallback, one header/menu/cart core, conditional controls,
eligible-Hero marker confinement, shared mobile structure, logical order, focus names,
no duplicated listener/request, and registry/Twig/SCSS parity. Witness at least one
deliberately broken fixture fail before accepting the new checker, then restore it and
record the passing run.

## 3. Build, snapshot, and enforce budgets

```bash
npx webpack --mode production
node scripts/check-theme.mjs --build --json
node scripts/check-bundle-budget.mjs --budget
node scripts/css-snapshot.mjs /tmp/hdl07-after.css.txt
diff -u /tmp/hdl07-before.css.txt /tmp/hdl07-after.css.txt
wc -c public/app.css public/app.js
git diff --check
```

Justify every normalized CSS delta. Block if app CSS grows by more than 12,288 raw bytes,
app JS by more than 4,096 raw bytes, another bundle grows without direct HDL-07 cause,
the compressed package reaches 950,000 B, or any dependency/entry/chunk/media/font is
added. A preview/watch run leaves development output; always rebuild production afterward.

## 4. Create an isolated preview checkpoint

Never run Salla Preview from the primary working tree. Create a temporary preview
worktree/branch from the exact reviewed implementation SHA. Permit CLI commit/push only
inside that temporary branch. Record local branch, local SHA, upstream SHA, and remote
SHA before the browser opens.

Tell Yasser the exact preview branch and SHA and stop until he confirms that branch in
Partners Portal. Then run with the browser explicit:

```bash
salla theme preview --store <StoreName> --without-editor --browser chrome
```

Use the owner-provided signed storefront/editor link and require a commit-specific DOM
marker plus localhost preview assets to match. If Salla renders another branch/version,
record `SALLA PREVIEW SYNC FAILURE`; do not call the implementation failed, do not use the
page as positive evidence, and do not mutate/commit/push the primary branch for the CLI.

## 5. Rendered matrix

Use identical content/state within each RTL/LTR pair:

1. Arabic Mobile RTL — 390×844 and 320×800 stress.
2. English Mobile LTR — 390×844 and 320×800 stress.
3. Arabic Desktop RTL — 1366×768.
4. English Desktop LTR — 1366×768.

Capture:

- all four layouts at Top and Scrolled;
- transparent with eligible dark-overlaid Hero, unsafe/light Hero, and no Hero;
- menu open and search open, including side, Escape/close, and focus return;
- long logo/store-name fallback, crowded multi-level navigation and More;
- hidden search/account/wishlist combinations without empty grid/focus gaps;
- Sticky on/off with header/main rectangles and no visible jump;
- collection/product/cart commerce visibility and no regression;
- remaining HDL-04 Arabic/English runtime items carried to this checkpoint.

For each point, save a full screenshot and a JSON record valid against
`contracts/live-evidence.schema.json`. Record actual `html.lang/dir`, resolved body
classes, first main element and Hero markers, computed header surface/ink/position,
control rectangles and accessible names, visual/tab order, focus visibility/return,
overflow widths, and canonicalized resource URLs. Artifact timestamps must be later than
the last relevant source change.

Run Lighthouse on home, collection, product, and cart at minimum in Arabic mobile and
English desktop. Target accessibility ≥95 and no material performance regression. Record
platform-owned exceptions by exact selector/component and evidence; do not silently waive.

## 6. Rollback drill and final gates

1. Save a fixture containing the five new setting IDs and each new layout value.
2. Disable/revert only the HDL-07 resolver/layout/controller changes in a disposable
   test context and rebuild.
3. Prove old `centered|start`, density, Sticky, wishlist, preset mode, menu, account,
   search, and cart behavior still resolve through the legacy path while new IDs are
   ignored.
4. Restore the reviewed implementation and rerun:

```bash
npx webpack --mode production
node --test tests/header-layouts.test.mjs
node scripts/check-header-layouts.mjs --strict
node scripts/check-theme.mjs --build --json
node scripts/check-bundle-budget.mjs --budget
git diff --check
```

Do not mark HDL-07 complete until deterministic gates pass, rendered evidence matches
the exact SHA, independent review passes, and Yasser accepts the result at the manual
Salla checkpoint.
