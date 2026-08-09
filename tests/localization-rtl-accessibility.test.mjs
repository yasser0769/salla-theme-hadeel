/**
 * HDL-04 tests: localization, RTL/LTR parity, and accessibility contract
 * (FR-001…FR-006, T001–T006).
 *
 * Pins the source-only static contract in scripts/check-localization-a11y.mjs
 * against the shipped sources, plus independent witnesses for the specific
 * regressions HDL-04 removed. Runs offline with Node built-ins only; live
 * Salla RTL/LTR preview evidence remains a separate gate (T008).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkLocalizationA11y } from '../scripts/check-localization-a11y.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const { findings } = checkLocalizationA11y({ root: ROOT });
const errorsByRule = (rule) => findings.filter((f) => f.rule === rule && f.level === 'error');

/* ------------------------------------------------------------------ FR-001 */

describe('FR-001: locale parity and literals', () => {
  test('ar.json and en.json have exactly the same leaf keys, all non-empty', () => {
    assert.deepEqual(errorsByRule('locale-parity'), []);

    const flatten = (node, prefix, out) => {
      if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
      } else out[prefix] = node;
      return out;
    };
    const ar = flatten(JSON.parse(read('src/locales/ar.json')), '', {});
    const en = flatten(JSON.parse(read('src/locales/en.json')), '', {});
    assert.deepEqual(Object.keys(ar).sort(), Object.keys(en).sort());
    for (const leaves of [ar, en]) {
      for (const [key, value] of Object.entries(leaves)) {
        assert.ok(typeof value === 'string' && value.trim(), `${key} must be a non-empty string`);
      }
    }
  });

  test('the paired HDL-04 keys exist in both locales', () => {
    for (const file of ['src/locales/ar.json', 'src/locales/en.json']) {
      const text = read(file);
      for (const key of ['sidebar_navigation', 'close_categories', 'fixed_banner_alt']) {
        assert.ok(text.includes(`"${key}"`), `${file} must define ${key}`);
      }
    }
  });

  test('no known hardcoded accessible/visible literal survives', () => {
    assert.deepEqual(errorsByRule('hardcoded-accessible-literal'), []);

    assert.ok(!read('src/views/layouts/customer.twig').includes('aria-label="Sidebar"'));
    assert.ok(!read('src/views/pages/blog/index.twig').includes('Categories Trigger'));
    assert.ok(!read('src/views/pages/blog/single.twig').includes('alt="post image"'));
    assert.ok(!read('src/views/pages/cart.twig').includes('aria-label="Quantity"'));
    assert.ok(!read('src/views/components/home/fixed-banner.twig').includes("'fixed banner'"));
    assert.ok(!read('src/assets/js/partials/main-menu.js').includes("|| 'category'"));
    assert.ok(!read('src/views/pages/thank-you.twig').includes('your@email.com'));
  });

  test('thank-you email placeholder resolves through a paired locale key', () => {
    const thankYou = read('src/views/pages/thank-you.twig');
    assert.ok(thankYou.includes("placeholder=\"{{ trans('pages.thank_you.email_placeholder') }}\""));
    for (const file of ['src/locales/ar.json', 'src/locales/en.json']) {
      const leaves = JSON.parse(read(file));
      const value = leaves.pages?.thank_you?.email_placeholder;
      assert.ok(typeof value === 'string' && value.trim(), `${file} must define pages.thank_you.email_placeholder`);
    }
  });

  test('#blog-like is a typed, localized button with a hidden decorative icon', () => {
    assert.deepEqual(errorsByRule('disclosure-collapse-aria'), []);

    const single = read('src/views/pages/blog/single.twig');
    const button = single.match(/<button[^>]*id="blog-like"[^>]*>/)?.[0] || '';
    assert.ok(button.includes('type="button"'));
    assert.ok(button.includes("aria-label=\"{{ trans('pages.blog.kalles.like_article') }}\""));
    const icon = single.match(/<i[^>]*sicon-thumbs-up[^>]*>/)?.[0] || '';
    assert.ok(icon.includes('aria-hidden="true"'));
    for (const file of ['src/locales/ar.json', 'src/locales/en.json']) {
      const value = JSON.parse(read(file)).pages?.blog?.kalles?.like_article;
      assert.ok(typeof value === 'string' && value.trim(), `${file} must define pages.blog.kalles.like_article`);
    }
  });

  test('landing logo accessible name and alt resolve to store.name', () => {
    const landing = read('src/views/pages/landing-page.twig');
    assert.ok(!landing.includes('alt="logo"'), 'no literal alt="logo" remains');
    assert.ok(!/\{\{\s*store\.name\s*\}\}\s*logo/.test(landing), 'no "{{store.name}} logo" name remains');
    const links = landing.match(/<a href="\{\{ store\.url \}\}"[^>]*header-content-logo[^>]*>/g) || [];
    assert.ok(links.length >= 3, 'expected the three landing logo links');
    for (const link of links) assert.ok(link.includes('aria-label="{{ store.name }}"'));
    const alts = landing.match(/alt="\{\{ store\.name \}\}"/g) || [];
    assert.ok(alts.length >= 3, 'expected store.name alt on the three landing logos');
  });

  test('app.js keeps only the server-resolved translation bridge for Add to cart', () => {
    const appJs = read('src/assets/js/app.js');
    assert.ok(!/catch\s*\{[^}]*'Add to cart'/.test(appJs), 'no catch-branch Add to cart literal');
    assert.ok(
      appJs.includes("salla.lang.getWithDefault('pages.cart.add_to_cart', 'Add to cart')"),
      'the getWithDefault bridge must remain',
    );
  });
});

/* ------------------------------------------------------------------ FR-002 */

describe('FR-002: runtime direction, no custom inference', () => {
  test('no DOM language/direction inference in theme JS', () => {
    assert.deepEqual(errorsByRule('direction-inference'), []);
  });

  test('quick view inherits the root direction', () => {
    const card = read('src/assets/js/partials/product-card.js');
    assert.ok(!card.includes('document.documentElement.dir'));
    assert.ok(!/kalles-quick-view"\s+dir=/.test(card), 'quick view must not pin its own dir');
  });

  test('main-menu reads direction from salla.config theme.is_rtl', () => {
    const menu = read('src/assets/js/partials/main-menu.js');
    assert.ok(!menu.includes('getComputedStyle(strip).direction'));
    assert.ok(menu.includes("salla.config.get('theme.is_rtl', true)"), 'Arabic-safe default true');
  });

  test('main-menu localization initializes after salla.lang.onLoaded', () => {
    const menu = read('src/assets/js/partials/main-menu.js');
    const onLoaded = menu.indexOf('salla.lang.onLoaded()');
    const label = menu.indexOf("getWithDefault('pages.products.kalles.category'");
    assert.ok(onLoaded !== -1 && label > onLoaded, 'category fallback must initialize after onLoaded');
  });
});

/* ----------------------------------------------------------- FR-003/FR-004 */

describe('FR-003/FR-004: toolbar order and directional mirroring', () => {
  test('toolbar DOM reads filter → density → sort with no CSS direction overrides', () => {
    assert.deepEqual(errorsByRule('toolbar-order'), []);

    const twig = read('src/views/pages/product/index.twig');
    const filter = twig.indexOf('collection-toolbar__filter');
    const density = twig.indexOf('collection-toolbar__density');
    const sort = twig.indexOf('collection-toolbar__sort');
    assert.ok(filter !== -1 && density !== -1 && sort !== -1);
    assert.ok(filter < density && density < sort, 'filter before density before sort');
  });

  test('toolbar select padding is logical and justify positions are logical', () => {
    const scss = read('src/assets/styles/04-components/collection.scss');
    const select = scss.match(/\.collection-toolbar__sort select \{[\s\S]*?\}/)?.[0] || '';
    assert.ok(select.includes('padding-inline: 16px 40px'), 'logical select padding');
    assert.ok(!/\bdirection\s*:\s*(ltr|rtl)/.test(scss), 'no direction overrides remain');
    const filterRule = scss.match(/\.collection-toolbar__filter \{\n  height: 40px;[\s\S]*?\n\}/)?.[0] || '';
    const sortRule = scss.match(/^\.collection-toolbar__sort \{[\s\S]*?\n\}/m)?.[0] || '';
    assert.ok(filterRule.includes('justify-self: start'));
    assert.ok(sortRule.includes('justify-self: end'));
  });

  test('thank-you illustration is not mirrored', () => {
    assert.ok(!/(?:rtl|ltr):-?scale-x/.test(read('src/views/pages/thank-you.twig')));
  });

  test('availability select-branch link uses logical spacing/motion and hides its glyph', () => {
    assert.deepEqual(errorsByRule('disclosure-collapse-aria'), []);

    const single = read('src/views/pages/product/single.twig');
    const link = (single.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) || [])
      .find((block) => block.includes('pages.products.select_branch')) || '';
    assert.ok(link, 'select-branch link must exist');
    assert.match(link.match(/<a[^>]*>/)?.[0] || '', /\bwith-arrow\b/,
      'link needs with-arrow so the native ltr.scss glyph remap applies in LTR');
    const arrow = link.match(/<span[^>]*sicon-keyboard_arrow_left[^>]*>/)?.[0] || '';
    assert.ok(arrow, 'select-branch arrow must exist');
    const arrowTokens = (arrow.match(/class="([^"]*)"/)?.[1] || '').split(/\s+/);
    assert.ok(!arrowTokens.some((t) => /^(mr|ml)-\d/.test(t)), 'no physical mr-2');
    assert.ok(arrow.includes('rtl:mr-2 ltr:ml-2'), 'logical rtl:/ltr: spacing');
    assert.ok(!arrowTokens.some((t) => /^group-hover:-?translate-x-\d/.test(t)), 'no fixed -translate-x hover');
    assert.ok(arrow.includes('rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1'), 'per-direction hover motion');
    assert.ok(arrow.includes('aria-hidden="true"'));

    const ltrScss = read('src/assets/styles/02-generic/ltr.scss');
    assert.match(ltrScss, /sicon-keyboard_arrow_left:before/, 'native ltr.scss glyph remap preserved');
  });

  test('only sicon-arrow-left mirrors, and only in LTR', () => {
    assert.deepEqual(errorsByRule('directional-mirroring'), []);

    const scss = read('src/assets/styles/04-components/storefront-system.scss');
    for (const owner of ['.home-slider__cta', '.s-block__display-all', '.kalles-quick-view__details']) {
      const rule = scss.match(new RegExp(`${owner.replace(/[.*]/g, '\\$&')}[^{]*\\{[\\s\\S]*?\\n\\}`))?.[0] || '';
      assert.ok(rule.includes("[dir='ltr']"), `${owner} must scope mirroring to LTR`);
      assert.ok(rule.includes('.sicon-arrow-left'), `${owner} must mirror only the arrow`);
    }
  });
});

/* ------------------------------------------------------------------ FR-005 */

describe('FR-005: focus and accessible names', () => {
  test('the global link focus suppression is gone', () => {
    assert.deepEqual(errorsByRule('global-focus-suppression'), []);
    assert.ok(!/a\s*:focus/.test(read('src/assets/styles/02-generic/reset.scss')));
  });
});

/* ------------------------------------------------------------------ FR-006 */

describe('FR-006: letter spacing scoped to LTR', () => {
  test('every non-zero letter-spacing declaration is LTR-scoped in its owning rule', () => {
    assert.deepEqual(errorsByRule('letter-spacing-scope'), []);
    const ok = findings.find((f) => f.rule === 'letter-spacing-scope' && f.level === 'ok');
    assert.match(ok?.message || '', /all 7 non-zero letter-spacing declarations are LTR-scoped/);
  });
});

/* ----------------------------------------------------------- FR-004/005/008 */

describe('US3: disclosure and collapse ARIA contract', () => {
  test('blog categories dropdown is a plain, labelled, collapsible disclosure', () => {
    assert.deepEqual(errorsByRule('disclosure-collapse-aria'), []);

    const blog = read('src/views/pages/blog/index.twig');
    assert.ok(blog.includes('id="blog-categories-trigger"'));
    assert.ok(blog.includes('aria-controls="blog-categories-menu"'));
    assert.ok(blog.includes('aria-expanded="false"'));
    assert.ok(blog.includes('id="blog-categories-menu"'));
    assert.ok(!blog.includes('role="menu"'));
    const close = blog.match(/<button[^>]*dropdown__close[^>]*>/)?.[0] || '';
    assert.ok(close.includes('type="button"'));
    assert.ok(close.includes("trans('pages.blog.kalles.close_categories')"));
  });

  test('product note/file collapse triggers expose type, controls, and state', () => {
    const options = read('src/views/pages/partials/product/options.twig');
    const triggers = options.match(/<button[\s\S]*?btn--collapse[\s\S]*?>/g) || [];
    assert.equal(triggers.length, 2, 'note and file collapse triggers');
    for (const trigger of triggers) {
      assert.ok(trigger.includes('type="button"'));
      assert.ok(trigger.includes('aria-controls='));
      assert.ok(trigger.includes('aria-expanded="false"'));
    }
  });

  test('app.js synchronizes expanded state, Escape, focus return, and inert', () => {
    const appJs = read('src/assets/js/app.js');
    const collapse = appJs.match(/initiateCollapse\(\)\s*\{[\s\S]*?\n  \}/)?.[0] || '';
    for (const needle of ['aria-expanded', 'inert', 'Escape', 'trigger.focus()']) {
      assert.ok(collapse.includes(needle), `initiateCollapse must handle ${needle}`);
    }
    const dropdown = appJs.match(/initiateDropdowns\(\)\s*\{[\s\S]*?\n  \}/)?.[0] || '';
    for (const needle of ['aria-expanded', 'Escape', 'focus(', 'is-opened']) {
      assert.ok(dropdown.includes(needle), `initiateDropdowns must handle ${needle}`);
    }
  });

  test('initiateCollapse open state adds is-opened, not is-closed (behavioral, real helper)', async () => {
    // Load the real AppHelpers through a data: URL — the file is ESM inside a
    // non-module package, and it has no imports of its own.
    const helpersSrc = read('src/assets/js/app-helpers.js');
    const { default: AppHelpers } = await import(`data:text/javascript,${encodeURIComponent(helpersSrc)}`);

    // The exact arguments initiateCollapse passes when opening (isOpen = true).
    const appJs = read('src/assets/js/app.js');
    const collapse = appJs.match(/initiateCollapse\(\)\s*\{[\s\S]*?\n  \}/)?.[0] || '';
    const call = collapse.match(/toggleElementClassIf\(\[content, trigger\],\s*'([^']+)',\s*'([^']+)',\s*\(\)\s*=>\s*isOpen\)/);
    assert.ok(call, 'initiateCollapse must toggle classes through toggleElementClassIf');
    const [, addOnTrue, addOnFalse] = call;

    const makeEl = () => {
      const classes = new Set(['is-closed']);
      return {
        classes,
        classList: {
          add: (...c) => c.forEach((x) => classes.add(x)),
          remove: (...c) => c.forEach((x) => classes.delete(x)),
        },
      };
    };

    // Opening: callback returns true — both elements must end up is-opened.
    const content = makeEl();
    const trigger = makeEl();
    new AppHelpers().toggleElementClassIf([content, trigger], addOnTrue, addOnFalse, () => true);
    for (const el of [content, trigger]) {
      assert.ok(el.classes.has('is-opened'), `open state must add is-opened (helper adds "${addOnTrue}" on true)`);
      assert.ok(!el.classes.has('is-closed'), 'open state must remove is-closed');
    }

    // Closing: callback returns false — both elements must end up is-closed.
    new AppHelpers().toggleElementClassIf([content, trigger], addOnTrue, addOnFalse, () => false);
    for (const el of [content, trigger]) {
      assert.ok(el.classes.has('is-closed'), 'closed state must add is-closed');
      assert.ok(!el.classes.has('is-opened'), 'closed state must remove is-opened');
    }

    // The class the helper adds on open must be the one the CSS actually opens with.
    assert.match(read('src/assets/styles/02-generic/common.scss'), /\.collapse-content[\s\S]*?&\.is-opened/);
  });

  test('no positive tabindex anywhere in templates or scripts', () => {
    assert.deepEqual(errorsByRule('positive-tabindex'), []);
  });
});

/* ------------------------------------------------------------------- whole */

describe('HDL-04 contract as a whole', () => {
  test('check-localization-a11y reports zero errors', () => {
    const errors = findings.filter((f) => f.level === 'error');
    assert.deepEqual(errors, []);
  });
});
