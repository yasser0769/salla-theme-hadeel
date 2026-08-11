#!/usr/bin/env node
/**
 * HDL-07 header layouts guard (T010).
 *
 * Validates the approved four-layout header foundation against the live
 * repository — specs/007-header-layouts/contracts/header-layout-contract.md:
 *   1. layout-values: twilight.json `header_layout` is exactly
 *      centered|start|transparent|commerce; legacy values/keys/default pinned
 *   2. new-settings: the seven new HDL-07 settings exist with approved types,
 *      independent safe defaults, and only the proven equality condition
 *   3. registry-parity: canonical records, class maps, and owners
 *   4. resolver-strict: master.twig extends the HDL-03 allowlist atomically,
 *      resolves logo-size/ink through strict guarded allowlists, and never
 *      interpolates raw merchant input into a class or attribute
 *   5. single-core: one header DOM/component mount; no duplicated core
 *   6. hero-confinement: the eligible-Hero marker has exactly one allowed
 *      owner; no client image analysis
 *   7. runtime-budget: one sticky controller, one scroll listener, sticky
 *      gating, zero new requests
 *   8. scss-hooks: every new non-base class value has its owning hook in
 *      storefront-system.scss; the medium logo cap preserves legacy rendering
 *
 * --strict additionally runs the fixture witness: every valid/invalid case in
 * tests/fixtures/header-layouts/settings.json must resolve to its expected
 * safe outcome, and the deliberately wrong witness_invalid case MUST be
 * rejected — an accepted witness is itself an error (the checker proves it
 * can still catch defects). The witness is reversible: T038 removes it to
 * watch the checker fail, then restores it.
 *
 * Usage:
 *   node scripts/check-header-layouts.mjs            # static contract checks
 *   node scripts/check-header-layouts.mjs --strict   # + fixture witness
 *   node scripts/check-header-layouts.mjs --json     # machine-readable
 *
 * This file is also imported by scripts/check-theme.mjs; importing it has no
 * side effects.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

import {
  HEADER_LAYOUTS,
  HEADER_LOGO_SIZES,
  HEADER_TRANSPARENT_INKS,
  NEW_SETTING_IDS,
  resolveHeaderFoundation,
  twilightSetting,
  twilightOptionValues,
  twilightDefault,
} from '../tests/helpers/header-layouts.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

const FIXTURE_PATH = 'tests/fixtures/header-layouts/settings.json';

/* ------------------------------------------------------------------ the checker */

/**
 * @param {object} opts
 * @param {string} [opts.root]    repository root
 * @param {boolean} [opts.strict] also run the fixture witness
 * @returns {{findings: Array, errors: number}}
 */
export function checkHeaderLayouts({ root = ROOT, strict = false } = {}) {
  const findings = [];
  const note = (rule, level, message, where, extra) =>
    findings.push({ rule, level, message, where, ...(extra ?? {}) });
  const error = (rule, message, where, extra) => note(rule, 'error', message, where, extra);

  const read = (p) => readFileSync(join(root, p), 'utf8');
  const readJson = (p) => JSON.parse(read(p));

  const twilight = readJson('twilight.json');
  const registry = readJson('src/config/settings-registry.json');
  const byKey = new Map(registry.settings.map((s) => [s.key, s]));
  const masterTwig = read('src/views/layouts/master.twig');
  const masterCode = masterTwig.replace(/\{#[\s\S]*?#\}/g, '');
  const headerTwig = read('src/views/components/header/header.twig');
  const appJs = read('src/assets/js/app.js');
  const mainMenuJs = read('src/assets/js/partials/main-menu.js');
  const storefrontScss = read('src/assets/styles/04-components/storefront-system.scss');

  /* 1 — layout-values */
  let lvBad = 0;
  const layoutEntry = twilightSetting(twilight, 'header_layout');
  if (!layoutEntry) {
    lvBad++;
    error('layout-values', 'header_layout is not declared in twilight.json', 'twilight.json#/settings');
  } else {
    const values = twilightOptionValues(layoutEntry);
    if (JSON.stringify(values) !== JSON.stringify([...HEADER_LAYOUTS])) {
      lvBad++;
      error('layout-values',
        `header_layout options are ${JSON.stringify(values)} — exactly centered|start|transparent|commerce is approved`,
        'twilight.json#header_layout', { expected: JSON.stringify(HEADER_LAYOUTS) });
    } else {
      // Legacy keys/labels pinned: the two existing options are immutable.
      const [centered, start] = layoutEntry.options;
      if (centered.key !== '7e42b803-77d9-4312-bc85-afc7722ebf73' || centered.label !== 'الشعار في المنتصف') {
        lvBad++;
        error('layout-values', 'the legacy centered option key/label changed — existing merchant meaning is immutable',
          'twilight.json#header_layout');
      }
      if (start.key !== '631700e4-3180-4ac6-a744-f4dba5da7dd6' || start.label !== 'الشعار في بداية الصف') {
        lvBad++;
        error('layout-values', 'the legacy start option key/label changed — existing merchant meaning is immutable',
          'twilight.json#header_layout');
      }
    }
    if (twilightDefault(layoutEntry) !== 'centered') {
      lvBad++;
      error('layout-values', 'header_layout declared default must stay centered', 'twilight.json#header_layout');
    }
  }
  if (!lvBad) note('layout-values', 'ok',
    'header_layout is exactly centered|start|transparent|commerce; legacy values, keys, labels, and the centered default are pinned');

  /* 2 — new-settings */
  let nsBad = 0;
  const expectedNew = {
    header_transparent_home: { type: 'boolean', def: true, condition: true },
    header_show_search: { type: 'boolean', def: true, condition: false },
    header_show_account: { type: 'boolean', def: true, condition: false },
    header_show_menu: { type: 'boolean', def: true, condition: false },
    header_show_cart: { type: 'boolean', def: true, condition: false },
    header_logo_size: { type: 'items', def: 'medium', condition: false, values: HEADER_LOGO_SIZES },
    header_transparent_ink: { type: 'items', def: 'auto', condition: true, values: HEADER_TRANSPARENT_INKS },
  };
  for (const id of NEW_SETTING_IDS) {
    const exp = expectedNew[id];
    const entry = twilightSetting(twilight, id);
    if (!entry) {
      nsBad++;
      error('new-settings', `${id} is not declared in twilight.json`, `twilight.json#${id}`);
      continue;
    }
    if (entry.type !== exp.type) { nsBad++; error('new-settings', `${id} type is "${entry.type}"`, `twilight.json#${id}`, { expected: exp.type }); }
    if (twilightDefault(entry) !== exp.def) { nsBad++; error('new-settings', `${id} default is ${JSON.stringify(twilightDefault(entry))} — new controls need independent safe defaults`, `twilight.json#${id}`, { expected: JSON.stringify(exp.def) }); }
    if (exp.values && JSON.stringify(twilightOptionValues(entry)) !== JSON.stringify([...exp.values])) {
      nsBad++;
      error('new-settings', `${id} options drift`, `twilight.json#${id}`, { expected: JSON.stringify(exp.values) });
    }
    const conditions = entry.conditions ?? null;
    if (exp.condition) {
      if (JSON.stringify(conditions) !== JSON.stringify([{ id: 'header_layout', operation: '=', value: 'transparent' }])) {
        nsBad++;
        error('new-settings',
          `${id} must use exactly the HDL-03-proven equality condition on header_layout=transparent`,
          `twilight.json#${id}`, { expected: '[{"id":"header_layout","operation":"=","value":"transparent"}]' });
      }
    } else if (conditions) {
      nsBad++;
      error('new-settings', `${id} must not declare editor conditions (runtime correctness never depends on hiding)`, `twilight.json#${id}`);
    }
  }
  if (!nsBad) note('new-settings', 'ok',
    'seven new settings declared with approved types, independent safe defaults, and only the proven equality condition');

  /* 3 — registry-parity */
  let rpBad = 0;
  const layoutRec = byKey.get('global::header_layout');
  if (!layoutRec || JSON.stringify(layoutRec.allowed_values) !== JSON.stringify([...HEADER_LAYOUTS])) {
    rpBad++;
    error('registry-parity', 'global::header_layout allowed_values must be exactly the four approved layouts',
      'global::header_layout', { expected: JSON.stringify(HEADER_LAYOUTS) });
  } else if (layoutRec.safe_default !== 'centered' || layoutRec.declared_default !== 'centered') {
    rpBad++;
    error('registry-parity', 'global::header_layout defaults must stay centered', 'global::header_layout');
  }
  for (const id of NEW_SETTING_IDS) {
    const rec = byKey.get(`global::${id}`);
    if (!rec) { rpBad++; error('registry-parity', `global::${id} is missing from the registry`, `global::${id}`); continue; }
    if (rec.owner_spec !== 'HDL-07') { rpBad++; error('registry-parity', `owner_spec is ${rec.owner_spec}`, rec.key, { expected: 'HDL-07' }); }
    if (rec.preset_support || rec.mode_setting !== null) { rpBad++; error('registry-parity', 'new HDL-07 settings are independent globals, not preset followers', rec.key); }
    if (!rec.label_ar || !rec.label_en) { rpBad++; error('registry-parity', 'bilingual registry labels are required', rec.key); }
  }
  const logoRec = byKey.get('global::header_logo_size');
  if (logoRec && logoRec.class_prefix !== 'hadeel-header-logo-') {
    rpBad++;
    error('registry-parity', 'logo-size class map must be hadeel-header-logo-', 'global::header_logo_size');
  }
  const inkRec = byKey.get('global::header_transparent_ink');
  if (inkRec && inkRec.class_prefix !== null) {
    rpBad++;
    error('registry-parity', 'ink resolves to a data attribute — class_prefix must be null', 'global::header_transparent_ink');
  }
  if (!rpBad) note('registry-parity', 'ok',
    'registry records match the approved values, owners, defaults, and class/attribute maps');

  /* 4 — resolver-strict */
  let rsBad = 0;
  const grabMap = (name) => {
    const m = masterCode.match(new RegExp(`\\{%\\s*set ${name} = (\\{.*?\\})\\s*%\\}`));
    try { return m ? JSON.parse(m[1]) : null; } catch { return null; }
  };
  const twigAllowed = grabMap('hadeel_allowed');
  if (!twigAllowed || JSON.stringify(twigAllowed.header_layout) !== JSON.stringify([...HEADER_LAYOUTS])) {
    rsBad++;
    error('resolver-strict', 'master.twig hadeel_allowed.header_layout must be exactly the four approved layouts',
      'src/views/layouts/master.twig', { expected: JSON.stringify(HEADER_LAYOUTS) });
  }
  const twigSafe = grabMap('hadeel_safe');
  if (!twigSafe || twigSafe.header_layout !== 'centered') {
    rsBad++;
    error('resolver-strict', 'master.twig hadeel_safe.header_layout must stay centered', 'src/views/layouts/master.twig');
  }
  const twigProfiles = grabMap('hadeel_profiles');
  const legacyProfileLayouts = { luxury: 'centered', modern: 'centered', minimal: 'centered', practical_digital: 'start' };
  for (const [profile, layout] of Object.entries(legacyProfileLayouts)) {
    if (!twigProfiles || twigProfiles[profile]?.header_layout !== layout) {
      rsBad++;
      error('resolver-strict', `profile ${profile}.header_layout must stay ${layout} — no new preset mappings in HDL-07`,
        'src/views/layouts/master.twig');
    }
  }
  for (const [variable, list, fallback] of [
    ['hadeel_header_logo_size', 'hadeel_header_logo_sizes', 'medium'],
    ['hadeel_header_ink', 'hadeel_header_inks', 'auto'],
  ]) {
    const guarded = new RegExp(
      `${variable} = \\(${variable}_raw is not iterable and ${variable}_raw is same as\\(${variable}_raw ~ ''\\) and ${variable}_raw in ${list}\\) \\? ${variable}_raw : '${fallback}'`);
    if (!guarded.test(masterCode)) {
      rsBad++;
      error('resolver-strict',
        `${variable} must resolve through the strict guarded allowlist (iterable guard + self-cast identity + allowlist) with a ${fallback} fallback`,
        'src/views/layouts/master.twig');
    }
  }
  if (!/hadeel_header_transparent_home = hadeel_header_transparent_home_raw is same as\(true\) or hadeel_header_transparent_home_raw is same as\('true'\) or hadeel_header_transparent_home_raw is same as\(1\) or hadeel_header_transparent_home_raw is same as\('1'\)/.test(masterCode)) {
    rsBad++;
    error('resolver-strict', 'transparent-home must resolve through the four enrolled boolean shapes only (fail-closed)',
      'src/views/layouts/master.twig');
  }
  if (!masterCode.includes('hadeel-header-logo-{{ hadeel_header_logo_size }}')) {
    rsBad++;
    error('resolver-strict', 'the body must emit exactly one hadeel-header-logo-{resolved} class', 'src/views/layouts/master.twig');
  }
  if (!masterCode.includes('data-hadeel-header-ink="{{ hadeel_header_ink }}"')) {
    rsBad++;
    error('resolver-strict', 'the body must emit data-hadeel-header-ink from the resolved variable', 'src/views/layouts/master.twig');
  }
  if (/hadeel-header-logo-\{\{\s*theme\.settings\.get/.test(masterCode) || /data-hadeel-header-ink="\{\{\s*theme\.settings\.get/.test(masterCode)) {
    rsBad++;
    error('resolver-strict', 'raw theme.settings.get must never be interpolated into a logo class or ink attribute',
      'src/views/layouts/master.twig');
  }
  if (masterCode.split('hadeel-header-{{ hadeel_resolved.header_layout }}').length - 1 !== 1) {
    rsBad++;
    error('resolver-strict', 'exactly one hadeel-header-{layout} class emission is allowed', 'src/views/layouts/master.twig');
  }
  if (!rsBad) note('resolver-strict', 'ok',
    'the resolver extends the allowlist atomically, preserves legacy maps/defaults, and never interpolates raw input');

  /* 5 — single-core */
  let scBad = 0;
  const count = (s, needle) => s.split(needle).length - 1;
  for (const [needle, what] of [
    ['class="store-header"', '.store-header'],
    ['id="mainnav"', '#mainnav'],
    ['main-nav-shell"', '.main-nav-shell'],
    ['class="navbar-brand"', '.navbar-brand'],
    ['<custom-main-menu>', 'custom-main-menu'],
    ['<salla-cart-summary', 'salla-cart-summary'],
  ]) {
    if (count(headerTwig, needle) !== 1) {
      scBad++;
      error('single-core', `header.twig must render exactly one ${what} (found ${count(headerTwig, needle)})`,
        'src/views/components/header/header.twig');
    }
  }
  if (count(masterCode, "{% component 'header.header' %}") !== 1) {
    scBad++;
    error('single-core', 'master.twig must mount the header component exactly once', 'src/views/layouts/master.twig');
  }
  if (!scBad) note('single-core', 'ok', 'one header DOM and one component mount — no duplicated core per layout');

  /* 6 — hero-confinement */
  let hcBad = 0;
  const viewFiles = [
    'src/views/layouts/master.twig',
    'src/views/components/header/header.twig',
    'src/views/pages/index.twig',
  ];
  for (const v of viewFiles) {
    if (read(v).includes('data-hadeel-header-hero')) {
      hcBad++;
      error('hero-confinement', `${v} must not emit the eligible-Hero marker — enhanced-slider.twig is the only approved owner`, v);
    }
  }
  for (const [name, src] of [['app.js', appJs], ['main-menu.js', mainMenuJs]]) {
    if (/getImageData|\bcanvas\b|luminance|brightness/i.test(src)) {
      hcBad++;
      error('hero-confinement', `${name} must not analyze images — contrast is a server marker or merchant choice`,
        `src/assets/js/${name}`);
    }
  }
  if (!hcBad) note('hero-confinement', 'ok',
    'the eligibility marker is confined to its one approved owner; no client image analysis exists');

  /* 7 — runtime-budget */
  let rbBad = 0;
  if (count(appJs, 'initiateStickyMenu() {') !== 1 || count(appJs, 'this.initiateStickyMenu()') !== 1) {
    rbBad++;
    error('runtime-budget', 'exactly one sticky controller definition and one call — no second controller per layout',
      'src/assets/js/app.js');
  }
  if (!/if \(header_is_sticky\) \{\s*this\.initiateStickyMenu\(\);?\s*\}/.test(appJs)) {
    rbBad++;
    error('runtime-budget', 'the sticky controller must stay gated on header_is_sticky (false adds no scroll observer)',
      'src/assets/js/app.js');
  }
  if (count(appJs, "addEventListener('scroll'") !== 1) {
    rbBad++;
    error('runtime-budget', `exactly one scroll listener is allowed in app.js (found ${count(appJs, "addEventListener('scroll'")})`,
      'src/assets/js/app.js');
  }
  for (const [name, src] of [['app.js', appJs], ['main-menu.js', mainMenuJs]]) {
    if (src.includes('fetch(') || src.includes('XMLHttpRequest')) {
      rbBad++;
      error('runtime-budget', `${name} must not add network requests for header layouts`, `src/assets/js/${name}`);
    }
  }
  if (!rbBad) note('runtime-budget', 'ok',
    'one shared sticky controller, one passive scroll listener, sticky gating, zero header requests');

  /* 8 — scss-hooks */
  let shBad = 0;
  for (const cls of [
    '.hadeel-header-transparent',
    '.hadeel-header-commerce',
    '.hadeel-header-logo-small',
    '.hadeel-header-logo-medium',
    '.hadeel-header-logo-large',
  ]) {
    if (!storefrontScss.includes(cls)) {
      shBad++;
      error('scss-hooks', `${cls} has no owning hook in storefront-system.scss`, 'src/assets/styles/04-components/storefront-system.scss');
    }
  }
  const mediumHook = storefrontScss.match(/\.hadeel-header-logo-medium \.navbar-brand img \{[^}]*\}/);
  if (mediumHook && !mediumHook[0].includes('max-height: 52px')) {
    shBad++;
    error('scss-hooks', 'the medium logo cap must stay 52px so the default preserves pre-HDL-07 rendering',
      'src/assets/styles/04-components/storefront-system.scss');
  }
  if (!shBad) note('scss-hooks', 'ok',
    'every new class value has its owning hook; the medium logo cap preserves legacy rendering');

  /* 9 — strict fixture witness */
  if (strict) {
    const fixture = readJson(FIXTURE_PATH);
    let fwBad = 0;
    for (const section of ['valid', 'invalid']) {
      for (const c of fixture[section] ?? []) {
        const out = resolveHeaderFoundation(c.raw);
        const mismatches = ['layout', 'logo_size', 'ink', 'transparent_home']
          .filter((k) => out[k] !== c.expected[k]);
        if (mismatches.length) {
          fwBad++;
          error('witness', `${section} case "${c.id}" resolved ${mismatches.map((k) => `${k}=${JSON.stringify(out[k])}`).join(', ')}`,
            `${FIXTURE_PATH}#${c.id}`, { expected: JSON.stringify(c.expected) });
        }
        for (const cls of out.classes) {
          if (!/^hadeel-header-(logo-)?(centered|start|transparent|commerce|small|medium|large)$/.test(cls)) {
            fwBad++;
            error('witness', `${section} case "${c.id}" emitted a non-allowlisted class "${cls}"`, `${FIXTURE_PATH}#${c.id}`);
          }
        }
      }
    }
    if (!fwBad) note('witness', 'ok',
      `all ${(fixture.valid?.length ?? 0) + (fixture.invalid?.length ?? 0)} valid/invalid fixture cases resolve to their safe expected outcomes`);
    let witnessRejected = 0;
    for (const c of fixture.witness_invalid ?? []) {
      const out = resolveHeaderFoundation(c.raw);
      const matches = ['layout', 'logo_size', 'ink', 'transparent_home']
        .every((k) => out[k] === c.expected[k]);
      if (matches) {
        error('witness',
          `witness case "${c.id}" was NOT rejected — raw input reached the resolved output and the checker can no longer prove it catches defects`,
          `${FIXTURE_PATH}#${c.id}`);
      } else {
        witnessRejected++;
      }
    }
    if (witnessRejected) note('witness', 'ok',
      `the deliberately invalid witness (${witnessRejected} case(s)) is rejected as required`);
  }

  return { findings, errors: findings.filter((f) => f.level === 'error').length };
}

/* -------------------------------------------------------------------- CLI */

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const asJson = argv.includes('--json');

  const { findings, errors } = checkHeaderLayouts({ root: ROOT, strict });

  if (asJson) {
    console.log(JSON.stringify({ errors, findings }, null, 2));
  } else {
    const icon = { ok: '  ok  ', warn: ' warn ', error: 'FAILED' };
    let current = '';
    for (const f of findings) {
      if (f.rule !== current) { current = f.rule; console.log(`\n[${current}]`); }
      console.log(`  ${icon[f.level]} ${f.message}${f.where ? `\n         ${f.where}` : ''}${f.expected !== undefined ? `\n         expected: ${f.expected}` : ''}`);
    }
    console.log(`\n${errors} error(s)`);
    if (!strict) console.log('note: fixture witness not checked — rerun with --strict');
  }
  process.exit(errors ? 1 : 0);
}
