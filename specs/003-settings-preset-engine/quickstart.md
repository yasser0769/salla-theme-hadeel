# HDL-03 Validation Quickstart

## 1. Record the baseline

```bash
git rev-parse HEAD
node scripts/check-theme.mjs --build --json
node scripts/css-snapshot.mjs /tmp/hdl03-before.css.txt
find public -type f -print0 | sort -z | xargs -0 shasum -a 256 > /tmp/hdl03-public-before.sha256
find public -type f -exec stat -f '%z %N' {} + | sort -k2 > /tmp/hdl03-public-before.bytes
```

Do not proceed if the guard introduces errors or the production baseline is not committed. Do not modify `package.json`, `pnpm-lock.yaml`, or `public/` manually.

## 2. Run the migration/editor Spike

In one pre-schema configured draft and one fresh disposable draft, capture add/default/save/reload behavior for Boolean, String, Items, unset fields, explicit default/non-default values, companion modes, and option changes. Test the exact global equality condition shape and whether hidden values survive. Record actual Twig return shapes.

If no supported fresh-versus-existing metadata exists, retain `preset_engine_enabled=false` as the mandatory compatibility boundary. Unsupported dynamic summary, Reset All, automatic migration, or editor-label localization remains Spike.

## 3. Run deterministic contracts

```bash
node scripts/check-settings-registry.mjs --strict
node --test tests/settings-preset-engine.test.mjs
node scripts/check-theme.mjs
```

The test suite must cover the 324 legacy class combinations, all four profiles and six followers, Custom persistence, per-field return to Follow, invalid inputs, idempotence, and no mutation. Before accepting the checker, witness a deliberately broken fixture fail and the corrected fixture pass.

## 4. Build and prove zero bundle delta

```bash
npx webpack --mode production
node scripts/check-theme.mjs --build --json
node scripts/css-snapshot.mjs /tmp/hdl03-after.css.txt
find public -type f -print0 | sort -z | xargs -0 shasum -a 256 > /tmp/hdl03-public-after.sha256
find public -type f -exec stat -f '%z %N' {} + | sort -k2 > /tmp/hdl03-public-after.bytes
diff -u /tmp/hdl03-before.css.txt /tmp/hdl03-after.css.txt
diff -u /tmp/hdl03-public-before.sha256 /tmp/hdl03-public-after.sha256
diff -u /tmp/hdl03-public-before.bytes /tmp/hdl03-public-after.bytes
```

All three diffs must be empty. Any public byte change blocks HDL-03 pending architecture review.

## 5. Capture rendered Salla evidence

Never run Salla Preview from the primary working tree. Create a disposable preview worktree and branch from the exact implementation SHA, install with pnpm if that worktree needs local dependencies, and permit CLI commit/push only on that temporary branch. Before accepting evidence, record and compare the local branch, local HEAD, upstream SHA, and remote branch SHA. **Before opening or reusing any browser preview, report that branch and SHA to the owner and stop until the owner confirms the branch from Partners Portal.** Do not treat a CLI-generated draft as authoritative merely because the command succeeded.

Start preview from that worktree with Chrome named explicitly. Use the signed URL containing the localhost assets port reported by the CLI (the observed CLI 3.2.45 session used port 8000; older sessions may use 8002):

```bash
salla theme preview --store <StoreName> --without-editor --browser chrome
```

After the owner confirms the branch, prefer the owner-provided signed storefront and matching editor links. Require the draft body class and a commit-specific DOM marker to agree with the intended preview commit. If the storefront renders an old branch after CLI success, or the selected branch/SHA still does not render, record `SALLA PREVIEW SYNC FAILURE`. This is a platform-sync result, not an automatic code failure, and it must not be converted into positive live evidence.

Use the same product/content/state at Arabic RTL and English LTR, 320×800 and 1366×768. After each save/reload, run in DevTools:

```js
JSON.stringify({
  captured_at: new Date().toISOString(),
  viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
  html: { lang: document.documentElement.lang, dir: document.documentElement.dir },
  preview_assets: [...performance.getEntriesByType('resource')].map(r => r.name).filter(u => /localhost:\\d+/.test(u)),
  network: [...performance.getEntriesByType('resource')].map(r => ({ url: r.name, kind: r.initiatorType, bytes: r.transferSize })),
  body_classes: [...document.body.classList].filter(c => c.startsWith('hadeel-')),
  overflow: { scrollWidth: document.documentElement.scrollWidth, innerWidth, pass: document.documentElement.scrollWidth <= innerWidth },
  commerce: {
    price: !!document.querySelector('.s-product-card-price,.kalles-product-price,salla-product-price'),
    cta: !!document.querySelector('salla-add-product-button'),
    ctaVisible: (() => {
      const e = document.querySelector('salla-add-product-button');
      return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
    })()
  }
}, null, 2)
```

Save the JSON and full-page screenshot with preview branch, commit SHA, and scenario in each filename. Require at least one localhost asset and an HDL-03 DOM marker that exists only in the expected SHA. Canonicalize network URLs by removing cache-busting query parameters; the HDL-03-attributable set difference must be empty.

## 6. Restore production output and run final gates

Preview leaves a development build in the temporary worktree, so always finish there with:

```bash
npx webpack --mode production
node scripts/check-settings-registry.mjs --strict
node --test tests/settings-preset-engine.test.mjs
node scripts/check-theme.mjs --build --json
git diff --check
```

Do not call the feature verified if live editor behavior or a required matrix point was inaccessible; record it as `not verified` and keep the relevant gate open.
