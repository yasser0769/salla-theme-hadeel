/**
 * HDL-07 header layouts — contract tests (T009 foundation, refined by T019).
 *
 * Scope: settings parity (twilight.json ↔ registry ↔ master.twig resolver),
 * strict allowlists with legacy `centered|start` preservation, one header core,
 * visibility-control declarations with independent safe defaults, eligible-Hero
 * marker confinement, no duplicate listeners/requests — plus the Lean T016–T018
 * implementation contracts: transparent Top/Scrolled gating, commerce two-row
 * grid with one wide search trigger, real-Boolean sticky serialization, the
 * single rAF-bounded controller, and shared-mobile safety.
 *
 * Run: node --test tests/header-layouts.test.mjs
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  HEADER_LAYOUTS,
  HEADER_LOGO_SIZES,
  HEADER_TRANSPARENT_INKS,
  NEW_SETTING_IDS,
  loadRegistry,
  loadTwilight,
  resolveHeaderFoundation,
  twilightSetting,
  twilightOptionValues,
  twilightDefault,
} from './helpers/header-layouts.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));

const twilight = loadTwilight();
const registry = loadRegistry();
const byKey = new Map(registry.settings.map((s) => [s.key, s]));
const masterTwig = read('src/views/layouts/master.twig');
const masterCode = masterTwig.replace(/\{#[\s\S]*?#\}/g, ''); // executed code only
const headerTwig = read('src/views/components/header/header.twig');
const enhancedSliderTwig = read('src/views/components/home/enhanced-slider.twig');
const appJs = read('src/assets/js/app.js');
const mainMenuJs = read('src/assets/js/partials/main-menu.js');
const storefrontScss = read('src/assets/styles/04-components/storefront-system.scss');
const fixture = readJson('tests/fixtures/header-layouts/settings.json');

/* --------------------------------------- settings parity: twilight.json */

describe('settings parity — twilight.json declarations (T012)', () => {
  test('header_layout declares exactly centered|start|transparent|commerce, legacy values first and unchanged', () => {
    const entry = twilightSetting(twilight, 'header_layout');
    assert.ok(entry, 'header_layout must be declared');
    assert.deepEqual(twilightOptionValues(entry), [...HEADER_LAYOUTS]);
    // Legacy preservation: the two existing options keep value, key, and label.
    const [centered, start] = entry.options;
    assert.equal(centered.value, 'centered');
    assert.equal(centered.key, '7e42b803-77d9-4312-bc85-afc7722ebf73');
    assert.equal(start.value, 'start');
    assert.equal(start.key, '631700e4-3180-4ac6-a744-f4dba5da7dd6');
    assert.equal(twilightDefault(entry), 'centered', 'declared default must stay centered');
  });

  test('the seven new HDL-07 settings exist with approved types and independent safe defaults', () => {
    const expected = {
      header_transparent_home: { type: 'boolean', def: true },
      header_show_search: { type: 'boolean', def: true },
      header_show_account: { type: 'boolean', def: true },
      header_show_menu: { type: 'boolean', def: true },
      header_show_cart: { type: 'boolean', def: true },
      header_logo_size: { type: 'items', def: 'medium' },
      header_transparent_ink: { type: 'items', def: 'auto' },
    };
    for (const id of NEW_SETTING_IDS) {
      const entry = twilightSetting(twilight, id);
      assert.ok(entry, `${id} must be declared in twilight.json`);
      assert.equal(entry.type, expected[id].type, `${id} type`);
      assert.equal(twilightDefault(entry), expected[id].def, `${id} safe default`);
    }
    assert.deepEqual(twilightOptionValues(twilightSetting(twilight, 'header_logo_size')), [...HEADER_LOGO_SIZES]);
    assert.deepEqual(twilightOptionValues(twilightSetting(twilight, 'header_transparent_ink')), [...HEADER_TRANSPARENT_INKS]);
  });

  test('transparent-only controls use the proven equality condition on header_layout=transparent', () => {
    for (const id of ['header_transparent_home', 'header_transparent_ink']) {
      const entry = twilightSetting(twilight, id);
      assert.ok(entry, `${id} must be declared`);
      assert.deepEqual(entry.conditions, [
        { id: 'header_layout', operation: '=', value: 'transparent' },
      ], `${id} must reuse the HDL-03-proven equality condition shape only`);
    }
  });

  test('existing header settings are untouched (sticky, wishlist, density, more menu)', () => {
    assert.equal(twilightDefault(twilightSetting(twilight, 'header_is_sticky')), true);
    assert.equal(twilightDefault(twilightSetting(twilight, 'header_show_wishlist')), true);
    assert.equal(twilightDefault(twilightSetting(twilight, 'enable_more_menu')), true);
    assert.deepEqual(twilightOptionValues(twilightSetting(twilight, 'header_density')), ['compact', 'comfortable']);
    assert.equal(twilightDefault(twilightSetting(twilight, 'header_density')), 'comfortable');
  });
});

/* ------------------------------------- settings parity: canonical registry */

describe('settings parity — src/config/settings-registry.json (T013)', () => {
  test('header_layout record gains exactly the two new values and keeps safe defaults', () => {
    const rec = byKey.get('global::header_layout');
    assert.ok(rec);
    assert.deepEqual(rec.allowed_values, [...HEADER_LAYOUTS]);
    assert.equal(rec.declared_default, 'centered');
    assert.equal(rec.safe_default, 'centered');
    assert.equal(rec.class_prefix, 'hadeel-header-');
    assert.equal(rec.owner_spec, 'HDL-07');
  });

  test('every new HDL-07 field has a qualified record with owner, labels, and safe default', () => {
    const expected = {
      'global::header_transparent_home': { type: 'boolean', def: true },
      'global::header_show_search': { type: 'boolean', def: true },
      'global::header_show_account': { type: 'boolean', def: true },
      'global::header_show_menu': { type: 'boolean', def: true },
      'global::header_show_cart': { type: 'boolean', def: true },
      'global::header_logo_size': { type: 'items', def: 'medium' },
      'global::header_transparent_ink': { type: 'items', def: 'auto' },
    };
    for (const [key, exp] of Object.entries(expected)) {
      const rec = byKey.get(key);
      assert.ok(rec, `${key} must be registered`);
      assert.equal(rec.scope, 'global');
      assert.equal(rec.owner_spec, 'HDL-07', `${key} owner`);
      assert.equal(rec.type, exp.type, `${key} type`);
      assert.equal(rec.declared_default, exp.def, `${key} declared default`);
      assert.equal(rec.safe_default, exp.def, `${key} safe default`);
      assert.ok(rec.label_ar && rec.label_en, `${key} bilingual labels`);
      assert.equal(rec.preset_support, false, `${key} is not preset-aware`);
      assert.equal(rec.mode_setting, null, `${key} has no mode setting`);
    }
  });

  test('logo-size and ink class maps are explicit and safe', () => {
    const logo = byKey.get('global::header_logo_size');
    assert.ok(logo);
    assert.deepEqual(logo.allowed_values, [...HEADER_LOGO_SIZES]);
    assert.equal(logo.class_prefix, 'hadeel-header-logo-');
    const ink = byKey.get('global::header_transparent_ink');
    assert.ok(ink);
    assert.deepEqual(ink.allowed_values, [...HEADER_TRANSPARENT_INKS]);
    assert.equal(ink.class_prefix, null, 'ink resolves to a data attribute, never a class');
  });
});

/* ----------------------------------------- resolver: master.twig (T014) */

describe('strict resolver — src/views/layouts/master.twig (T014)', () => {
  test('the HDL-03 resolver allowlist extends header_layout with only transparent|commerce', () => {
    const m = masterCode.match(/\{%\s*set hadeel_allowed = (\{.*?\})\s*%\}/);
    assert.ok(m, 'master.twig must define hadeel_allowed');
    const allowed = JSON.parse(m[1]);
    assert.deepEqual(allowed.header_layout, [...HEADER_LAYOUTS]);
    // Legacy defaults and the other five families are untouched.
    const safe = JSON.parse(masterCode.match(/\{%\s*set hadeel_safe = (\{.*?\})\s*%\}/)[1]);
    assert.equal(safe.header_layout, 'centered');
    assert.deepEqual(allowed.header_density, ['compact', 'comfortable']);
  });

  test('preset profile maps keep their existing header_layout values (no new preset mappings)', () => {
    const profiles = JSON.parse(masterCode.match(/\{%\s*set hadeel_profiles = (\{.*?\})\s*%\}/)[1]);
    assert.equal(profiles.luxury.header_layout, 'centered');
    assert.equal(profiles.modern.header_layout, 'centered');
    assert.equal(profiles.minimal.header_layout, 'centered');
    assert.equal(profiles.practical_digital.header_layout, 'start');
  });

  test('logo-size resolution is a strict guarded allowlist with a medium fallback', () => {
    assert.ok(masterCode.includes("hadeel_header_logo_sizes = ['small', 'medium', 'large']"));
    assert.ok(masterCode.includes("theme.settings.get('header_logo_size', 'medium')"));
    const line = masterCode.match(/hadeel_header_logo_size = \((.*?)\) \? hadeel_header_logo_size_raw : 'medium'/);
    assert.ok(line, 'logo-size must resolve through a guarded ternary with medium fallback');
    assert.ok(line[1].includes('is not iterable'), 'iterable guard rejects arrays');
    assert.ok(line[1].includes('is same as(hadeel_header_logo_size_raw ~ \'\')'), 'self-cast identity rejects booleans/numbers');
    assert.ok(line[1].includes('in hadeel_header_logo_sizes'), 'allowlist membership');
  });

  test('ink resolution is a strict guarded allowlist with an auto fallback', () => {
    assert.ok(masterCode.includes("hadeel_header_inks = ['auto', 'light', 'dark']"));
    assert.ok(masterCode.includes("theme.settings.get('header_transparent_ink', 'auto')"));
    const line = masterCode.match(/hadeel_header_ink = \((.*?)\) \? hadeel_header_ink_raw : 'auto'/);
    assert.ok(line, 'ink must resolve through a guarded ternary with auto fallback');
    assert.ok(line[1].includes('is not iterable'));
    assert.ok(line[1].includes('is same as(hadeel_header_ink_raw ~ \'\')'));
    assert.ok(line[1].includes('in hadeel_header_inks'));
  });

  test('transparent-home boolean uses enrolled shapes only and fails closed', () => {
    assert.ok(masterCode.includes("theme.settings.get('header_transparent_home', true)"));
    const line = masterCode.match(/hadeel_header_transparent_home = (.*)/);
    assert.ok(line, 'transparent-home must resolve to a boolean');
    for (const shape of ['is same as(true)', "is same as('true')", 'is same as(1)', "is same as('1')"]) {
      assert.ok(line[1].includes(shape), `enrolled shape ${shape}`);
    }
  });

  test('emissions use resolved variables only — raw settings never reach a class or attribute', () => {
    assert.ok(masterCode.includes('hadeel-header-logo-{{ hadeel_header_logo_size }}'));
    assert.ok(masterCode.includes('data-hadeel-header-ink="{{ hadeel_header_ink }}"'));
    assert.ok(!/hadeel-header-logo-\{\{\s*theme\.settings\.get/.test(masterCode), 'no raw logo-size interpolation');
    assert.ok(!/data-hadeel-header-ink="\{\{\s*theme\.settings\.get/.test(masterCode), 'no raw ink interpolation');
    // Exactly one layout class emission remains.
    assert.equal(masterCode.split('hadeel-header-{{ hadeel_resolved.header_layout }}').length - 1, 1);
  });
});

/* ------------------------------------------------ SCSS foundation hooks */

describe('SCSS foundation hooks — storefront-system.scss (T014)', () => {
  test('every new non-base class value has exactly one owning hook in the existing header area', () => {
    for (const cls of [
      '.hadeel-header-transparent',
      '.hadeel-header-commerce',
      '.hadeel-header-logo-small',
      '.hadeel-header-logo-medium',
      '.hadeel-header-logo-large',
    ]) {
      assert.ok(storefrontScss.includes(cls), `${cls} must exist in storefront-system.scss`);
    }
  });

  test('logo-size medium preserves the current 52px desktop cap (legacy rendering unchanged)', () => {
    const m = storefrontScss.match(/\.hadeel-header-logo-medium \.navbar-brand img \{[^}]*\}/);
    assert.ok(m, 'medium logo hook must exist');
    assert.ok(m[0].includes('max-height: 52px'), 'medium must equal the pre-HDL-07 desktop cap');
  });
});

/* ------------------------------------------- fixture resolution contract */

describe('fixture resolution — tests/fixtures/header-layouts/settings.json (T008)', () => {
  test('helper allowlists match the contract constants', () => {
    assert.deepEqual([...HEADER_LAYOUTS], ['centered', 'start', 'transparent', 'commerce']);
    assert.deepEqual([...HEADER_LOGO_SIZES], ['small', 'medium', 'large']);
    assert.deepEqual([...HEADER_TRANSPARENT_INKS], ['auto', 'light', 'dark']);
  });

  for (const section of ['valid', 'invalid']) {
    test(`${section} cases resolve to their expected safe outcomes`, () => {
      for (const c of fixture[section]) {
        const out = resolveHeaderFoundation(c.raw);
        assert.equal(out.layout, c.expected.layout, `${c.id}: layout`);
        assert.equal(out.logo_size, c.expected.logo_size, `${c.id}: logo_size`);
        assert.equal(out.ink, c.expected.ink, `${c.id}: ink`);
        assert.equal(out.transparent_home, c.expected.transparent_home, `${c.id}: transparent_home`);
        // Raw input never reaches a class or attribute.
        for (const cls of out.classes) {
          assert.ok(/^hadeel-header-(logo-)?(centered|start|transparent|commerce|small|medium|large)$/.test(cls),
            `${c.id}: class ${cls} must be prefix + allowlisted value`);
        }
        assert.ok([...HEADER_TRANSPARENT_INKS].includes(out.attributes['data-hadeel-header-ink']));
      }
    });
  }

  test('legacy centered|start resolution is byte-identical before and after the extension', () => {
    for (const legacy of ['centered', 'start']) {
      const out = resolveHeaderFoundation({ header_layout: legacy });
      assert.deepEqual(out.classes, [`hadeel-header-${legacy}`, 'hadeel-header-logo-medium']);
    }
  });
});

/* ------------------------------------------------------------- one core */

describe('one shared header core (FR-001/FR-006)', () => {
  test('header.twig renders exactly one of each core element', () => {
    const count = (s, needle) => s.split(needle).length - 1;
    assert.equal(count(headerTwig, 'class="store-header"'), 1, 'one .store-header');
    assert.equal(count(headerTwig, 'id="mainnav"'), 1, 'one #mainnav');
    assert.equal(count(headerTwig, 'main-nav-shell"'), 1, 'one .main-nav-shell');
    assert.equal(count(headerTwig, 'class="navbar-brand"'), 1, 'one .navbar-brand');
    assert.equal(count(headerTwig, '<custom-main-menu>'), 1, 'one custom-main-menu');
    assert.equal(count(headerTwig, '<salla-cart-summary'), 1, 'one salla-cart-summary');
  });

  test('exactly ONE search control and ONE dispatch in source for every layout (T017 corrected)', () => {
    const count = (s, needle) => s.split(needle).length - 1;
    assert.equal(count(headerTwig, "salla.event.dispatch('search::open')"), 1,
      'one native search::open dispatch in source — no branch duplicates it');
    assert.equal(count(headerTwig, 'header-action--search'), 1, 'one search button keeps its existing identity');
    assert.equal(count(headerTwig, 'class="header-action__label"'), 1, 'one shared label span on that same button');
    // No commerce-layout predicate or mini-resolver in Twig: widening is CSS-only.
    for (const banned of ['hadeel_header_layout_commerce', 'hadeel_header_engine_raw', 'hadeel_header_engine_on', 'header-search-wide']) {
      assert.ok(!headerTwig.includes(banned), `header.twig must not contain ${banned}`);
    }
    assert.ok(!/theme\.settings\.get\('header_layout'/.test(headerTwig),
      'header.twig must not read the layout setting at all');
    // The sr-only store heading is unconditional — the missing-logo span is additional.
    const logoBranch = headerTwig.slice(headerTwig.indexOf('{% if store.logo %}'), headerTwig.indexOf('{% endif %}', headerTwig.indexOf('{% if store.logo %}')));
    assert.ok(!/<h[12] class="sr-only"/.test(logoBranch), 'the h1/h2 store heading must live outside the store.logo conditional');
    assert.ok(headerTwig.includes('<h1 class="sr-only">{{ store.name }}</h1>'), 'sr-only h1 preserved');
  });

  test('master.twig mounts the header component exactly once', () => {
    assert.equal(masterCode.split("{% component 'header.header' %}").length - 1, 1);
  });

  test('one menu behavior module and one sticky controller; no duplicated listeners/requests', () => {
    assert.equal(appJs.split('initiateStickyMenu() {').length - 1, 1, 'one sticky controller definition');
    assert.equal(appJs.split('this.initiateStickyMenu()').length - 1, 1, 'one sticky controller call');
    assert.ok(/if \(header_is_sticky\) \{\s*this\.initiateStickyMenu\(\);?\s*\}/.test(appJs),
      'the sticky controller stays gated on header_is_sticky — false adds no scroll observer');
    assert.equal(appJs.split("addEventListener('scroll'").length - 1, 1, 'exactly one scroll listener in app.js');
    for (const src of [appJs, mainMenuJs]) {
      assert.ok(!src.includes('fetch('), 'no new request in header runtime');
      assert.ok(!src.includes('XMLHttpRequest'), 'no new request in header runtime');
    }
  });
});

/* ------------------------------------------- eligible-Hero confinement */

describe('eligible-Hero marker confinement (FR-002/FR-003)', () => {
  test('data-hadeel-header-hero may only ever be emitted by the enhanced slider template', () => {
    const views = [
      'src/views/layouts/master.twig',
      'src/views/components/header/header.twig',
      'src/views/components/home/enhanced-slider.twig',
      'src/views/pages/index.twig',
    ];
    for (const v of views) {
      const hits = read(v).split('data-hadeel-header-hero').length - 1;
      if (v.endsWith('enhanced-slider.twig')) continue; // the one eligible owner (T018)
      assert.equal(hits, 0, `${v} must not emit the eligibility marker`);
    }
  });

  test('no client image analysis exists anywhere in the header path', () => {
    for (const src of [appJs, mainMenuJs]) {
      assert.ok(!/getImageData|\bcanvas\b|luminance|brightness/i.test(src),
        'contrast is a server-rendered marker or merchant choice — never pixel sampling');
    }
  });
});

/* ------------------------------------- transparent header (T016, FR-002/003/007) */

describe('transparent header — eligible Hero, ink safety, Top/Scrolled (T016)', () => {
  test('the enhanced slider emits the marker plus a server safe-ink marker only when every rendered slide is overlaid', () => {
    assert.ok(enhancedSliderTwig.includes('data-hadeel-header-hero'), 'eligibility marker');
    // Empty slider never counts as safe.
    assert.ok(enhancedSliderTwig.includes('component.slides|length > 0'), 'safe-ink requires at least one slide');
    assert.ok(/{% if slide\.without_overlay %}[\s\S]*?set hadeel_hero_all_overlaid = false/.test(enhancedSliderTwig),
      'one overlay-less slide withholds the safe-ink marker');
    assert.ok(enhancedSliderTwig.includes('{% if hadeel_hero_all_overlaid %} data-hadeel-header-hero-ink="light"{% endif %}'),
      'the safe-ink marker is conditional, never unconditional');
  });

  test('the Top state is a first-paint :has() gate requiring layout, setting, first-child Hero, and ink proof', () => {
    // Both gates compile to ONE :is() selector each (CSS size gate), same specificity.
    const gate = '.hadeel-header-transparent[data-hadeel-header-transparent-home="true"]:is(';
    assert.equal(storefrontScss.split(gate).length - 1, 2, 'light-ink and Top-state gates');
    for (const ink of ['light', 'dark']) {
      assert.ok(storefrontScss.includes(`[data-hadeel-header-ink="${ink}"]:has(#main-content > :first-child[data-hadeel-header-hero])`),
        `${ink} gate: layout + transparent-home + first-child Hero`);
    }
    assert.ok(storefrontScss.includes('[data-hadeel-header-ink="auto"]:has(#main-content > :first-child[data-hadeel-header-hero][data-hadeel-header-hero-ink])'),
      'auto gate: additionally requires the server safe-ink marker — no client analysis');
    // Ink variables: light resolves to white; the default stays the normal ink.
    assert.ok(storefrontScss.includes('--hadeel-header-transparent-ink: #fff'), 'light ink token');
    assert.ok(storefrontScss.includes('--hadeel-header-transparent-ink: var(--hadeel-ink)'), 'default ink token');
    // Centralized ink consumption: base controls fall back to the legacy ink.
    assert.ok(storefrontScss.includes('--hadeel-header-ink-current: var(--hadeel-header-transparent-ink)'), 'Top state sets the ink variable');
    assert.ok(storefrontScss.includes('color: var(--hadeel-header-ink-current, var(--hadeel-ink))'),
      'controls consume the gate ink with a byte-identical legacy fallback');
  });

  test('scrolled always returns to the opaque shared surface; the logo keeps a neutral plate and is never recolored', () => {
    assert.ok(/\.main-nav-container\.fixed-header,[\s\S]*?background: var\(--hadeel-surface\)/.test(storefrontScss),
      'scrolled surface reuses --hadeel-surface — HDL-07 adds no color setting');
    assert.ok(storefrontScss.includes('--hadeel-header-ink-current: var(--hadeel-ink)'),
      'scrolled resets the ink variable to normal');
    assert.ok(storefrontScss.includes('background: rgba(255, 255, 255, 0.92)'), 'neutral brand plate');
    const transparentBlock = storefrontScss.slice(
      storefrontScss.indexOf('HDL-07 transparent header'),
      storefrontScss.indexOf('--hadeel-header-commerce-search-min'));
    assert.ok(!/(?<![\w-])filter\s*:|invert\(|hue-rotate/.test(transparentBlock), 'no filter/inversion on the logo or icons');
    // The text fallback is rendered and styled.
    assert.ok(headerTwig.includes('{% if store.logo %}') && headerTwig.includes('<span class="navbar-brand__name">{{ store.name }}</span>'),
      'escaped store-name fallback when the logo is missing');
    assert.ok(storefrontScss.includes('.navbar-brand__name'), 'fallback name has an owning rule');
  });
});

/* ------------------------------------------- commerce header (T017, FR-001/006) */

describe('commerce header — two-row grid, CSS-only widening, visibility controls (T017)', () => {
  test('commerce widening is CSS-only — no Twig predicate, same button, label revealed by scope', () => {
    // The label is hidden by default and revealed only inside the commerce desktop scope.
    assert.ok(/\.header-action__label \{\s*display: none;/.test(storefrontScss), 'label hidden for every other layout and mobile');
    assert.ok(storefrontScss.includes('.hadeel-header-commerce .header-action--search .header-action__label'),
      'commerce desktop reveals the label on the same element');
    assert.ok(/\.hadeel-header-commerce \.header-action--search \{[^}]*min-width: var\(--hadeel-header-commerce-search-min\)/.test(storefrontScss),
      'the same .header-action--search widens with the registered minimum');
    assert.ok(!storefrontScss.includes('header-search-wide'), 'no second search-control class exists anywhere');
  });

  test('the two-row desktop grid reuses the shared DOM and the full-width menu row', () => {
    assert.ok(/\.hadeel-header-commerce \.main-nav-shell \{[^}]*grid-template-rows: auto auto/.test(storefrontScss),
      'two rows');
    assert.ok(/\.hadeel-header-commerce \.main-nav-shell__menu \{[^}]*grid-column: 1 \/ -1/.test(storefrontScss),
      'menu owns the full-width second row');
    assert.ok(mainMenuJs.includes("document.body.classList.contains('hadeel-header-commerce')"),
      'the shared overflow measurement accounts for the full-width commerce menu row');
  });

  test('search/menu/cart/account/wishlist visibility settings remove their controls cleanly', () => {
    assert.equal(headerTwig.split("theme.settings.get('header_show_search', true)").length - 1, 1,
      'header_show_search gates the single search control');
    assert.equal(headerTwig.split("theme.settings.get('header_show_account', true)").length - 1, 1,
      'header_show_account gates logged-in and logged-out account controls together');
    assert.equal(headerTwig.split("theme.settings.get('header_show_menu', true)").length - 1, 1,
      'header_show_menu gates the single shared menu cell');
    assert.equal(headerTwig.split("theme.settings.get('header_show_cart', true)").length - 1, 1,
      'header_show_cart gates the single native cart summary');
    assert.ok(headerTwig.includes("theme.settings.get('header_show_wishlist', true)"), 'wishlist guard preserved');
    // The menu guard wraps the ONE shared cell: desktop custom-main-menu and the
    // mobile trigger are removed together — no duplicate or orphaned trigger.
    assert.ok(
      /\{% if theme\.settings\.get\('header_show_menu', true\) %\}[\s\S]*?class="main-nav-shell__menu"[\s\S]*?<custom-main-menu><\/custom-main-menu>[\s\S]*?\{% endif %\}/.test(headerTwig),
      'the menu guard wraps the whole .main-nav-shell__menu cell');
    assert.ok(
      /\{% if theme\.settings\.get\('header_show_cart', true\) %\}[\s\S]*?<salla-cart-summary[\s\S]*?<\/salla-cart-summary>[\s\S]*?\{% endif %\}/.test(headerTwig),
      'the cart guard wraps the whole salla-cart-summary');
    // Runtime null-safety: hidden menu/cart must not break the shared controller.
    assert.ok(appJs.includes("if (!this.element(\"a[href='#mobile-menu']\"))"),
      'mobile menu loader bails when the menu is hidden — no forever polling');
    assert.ok(appJs.includes("app.element('salla-cart-summary')?.animateToCart"),
      'add-to-cart animation tolerates the hidden cart summary');
    // No hidden duplicate focusable control exists: one button, one dispatch.
    assert.equal(headerTwig.split("salla.event.dispatch('search::open')").length - 1, 1);
  });
});

/* ----------------------- shared mobile + one sticky controller (T018, FR-004) */

describe('shared mobile header and the single sticky controller (T018)', () => {
  test('sticky is serialized as a real boolean — "false" can no longer install the listener', () => {
    assert.ok(!masterCode.includes('window.header_is_sticky = "'), 'no quoted string serialization');
    assert.ok(masterCode.includes("? 'true' : 'false'"), 'enrolled-shape boolean serialization');
  });

  test('the controller measures the real shell and batches scroll state through one pending rAF', () => {
    assert.ok(appJs.includes("this.element('#mainnav .inner')"), 'measures the actual .inner shell');
    assert.ok(appJs.includes('window.requestAnimationFrame'), 'rAF batching');
    assert.ok(/let ticking = false;[\s\S]*?if \(ticking\) return;[\s\S]*?ticking = true;/.test(appJs),
      'at most one pending rAF callback');
    assert.ok(appJs.includes("{ passive: true }"), 'passive scroll listener');
  });

  test('the shared mobile shell keeps 320px safety and 44px touch targets for every layout', () => {
    assert.ok(storefrontScss.includes('grid-template-columns: 88px minmax(80px, 1fr) 88px'),
      'side columns fit two 44px targets with an 80px brand floor');
    assert.ok(/\.mobile-menu-trigger \{\s*width: 44px;\s*height: 44px;/.test(storefrontScss), '44px menu trigger');
    assert.ok(/\.header-action \{\s*width: 44px;\s*height: 44px;/.test(storefrontScss), '44px mobile actions');
    assert.ok(storefrontScss.includes('.header-action__label'),
      'the one search button stays a 44×44 icon on commerce mobile — label hidden by the shared base rule, no override needed');
    assert.ok(storefrontScss.includes('min-width: 320px'), '320px floor preserved');
  });
});
