/**
 * HDL-03 tests: US1 safe preset start (T018–T020), US2 persistent Custom
 * overrides (T027–T029), US3 safe migration/fallback (T033–T035), and US4
 * complete maintainable registry (T039–T043).
 *
 * These tests pin the pure resolution reference (tests/helpers/…) against the
 * canonical registry and the shipped Twig resolver maps. They run offline with
 * Node built-ins only; live Salla preview evidence remains a separate gate.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { checkSettingsRegistry, checkTwigClassEmission, checkSettingsGroups } from '../scripts/check-settings-registry.mjs';
import {
  PROFILE_IDS,
  MODES,
  FALLBACK_PROFILE,
  loadRegistry,
  loadTwilight,
  loadFixture,
  indexProfiles,
  followerSettings,
  resolveSetting,
  resolveBodyClasses,
} from './helpers/settings-preset-engine.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const registry = loadRegistry();
const profilesById = indexProfiles(registry);
const followers = followerSettings(registry);
const followerIds = followers.map((f) => f.id);

const modesFollow = Object.fromEntries(followerIds.map((id) => [id, 'follow_preset']));

function cartesian(lists) {
  return lists.reduce((acc, list) => acc.flatMap((a) => list.map((v) => [...a, v])), [[]]);
}

/* ------------------------------------------------------------------- T018 */

describe('T018 US1: engine-off legacy parity', () => {
  test('all 648 class combinations resolve byte-identically', () => {
    const combos = cartesian(followers.map((f) => f.allowed_values));
    // 3×3×3×3×4×2 = 648: HDL-07 extended header_layout with transparent|commerce;
    // the legacy 3×3×3×3×2×2 = 324 space is a strict subset and resolves identically.
    assert.equal(combos.length, 648, 'expected 3×3×3×3×4×2 = 648 combinations');
    for (const combo of combos) {
      const values = Object.fromEntries(followerIds.map((id, i) => [id, combo[i]]));
      const out = resolveBodyClasses({
        engineEnabled: false, profileId: FALLBACK_PROFILE, modes: modesFollow, values,
      }, registry);
      assert.equal(out.profile_class, null, 'engine off must not emit a preset class');
      assert.deepEqual(
        out.classes,
        followers.map((f, i) => `${f.class_prefix}${combo[i]}`),
        `engine-off classes must equal the legacy interpolation for ${JSON.stringify(values)}`,
      );
      for (const [i, f] of followers.entries()) {
        assert.deepEqual(out.results[f.id], {
          resolved_value: combo[i], resolved_from: 'legacy', validation_state: 'valid',
        });
      }
    }
  });

  test('invalid legacy values fall back to the documented safe default with needs_review', () => {
    for (const f of followers) {
      const out = resolveSetting({
        engineEnabled: false, profileId: FALLBACK_PROFILE, mode: 'follow_preset',
        customValue: 'corrupted', legacyValue: 'corrupted',
      }, f, profilesById);
      assert.deepEqual(out, {
        resolved_value: f.safe_default, resolved_from: 'safe_default', validation_state: 'needs_review',
      }, `${f.id}: invalid legacy input must never reach a class`);
      assert.ok(f.allowed_values.includes(out.resolved_value));
    }
  });

  test('engine off ignores the new engine controls entirely (null or garbage)', () => {
    const values = {
      layout_width: 'compact', section_spacing: 'spacious', corner_style: 'rounded',
      product_card_style: 'elevated', header_layout: 'start', header_density: 'compact',
    };
    const baseline = resolveBodyClasses({ engineEnabled: false, profileId: 'modern', modes: modesFollow, values }, registry);
    for (const noise of [
      { profileId: null, modes: {} },
      { profileId: 'luxury', modes: Object.fromEntries(followerIds.map((id) => [id, 'custom'])) },
      { profileId: 'garbage', modes: Object.fromEntries(followerIds.map((id) => [id, 'garbage'])) },
    ]) {
      const out = resolveBodyClasses({ engineEnabled: false, ...noise, values }, registry);
      assert.deepEqual(out, baseline, 'engine off must reproduce legacy output regardless of new-control state');
    }
  });
});

/* ------------------------------------------------------------------- T019 */

describe('T019 US1: profiles, determinism, one class per family', () => {
  test('all four profiles resolve every follower from the approved bootstrap map', () => {
    assert.deepEqual([...PROFILE_IDS], ['luxury', 'modern', 'minimal', 'practical_digital']);
    for (const profileId of PROFILE_IDS) {
      const out = resolveBodyClasses({
        engineEnabled: true, profileId, modes: modesFollow, values: {},
      }, registry);
      const owned = profilesById[profileId].owned_values;
      for (const f of followers) {
        assert.deepEqual(out.results[f.id], {
          resolved_value: owned[f.id], resolved_from: 'preset', validation_state: 'valid',
        }, `${profileId}.${f.id}`);
      }
      assert.equal(out.profile_class, `hadeel-preset-${profileId}`);
      assert.deepEqual(out.classes, followers.map((f) => `${f.class_prefix}${owned[f.id]}`));
    }
  });

  test('resolution is deterministic and idempotent', () => {
    for (const profileId of PROFILE_IDS) {
      const input = { engineEnabled: true, profileId, modes: modesFollow, values: {} };
      const first = resolveBodyClasses(input, registry);
      const second = resolveBodyClasses(input, registry);
      assert.deepEqual(second, first, `${profileId}: same inputs must give same outputs`);
      // Idempotence: feeding the resolved values back as stored values with
      // Follow modes changes nothing and accumulates no classes.
      const reapplied = resolveBodyClasses({
        engineEnabled: true, profileId,
        modes: modesFollow,
        values: Object.fromEntries(followers.map((f) => [f.id, first.results[f.id].resolved_value])),
      }, registry);
      assert.deepEqual(reapplied, first, `${profileId}: re-application must be a no-op`);
      assert.equal(new Set(first.classes).size, first.classes.length, 'no accumulated duplicate classes');
    }
  });

  test('exactly one allowlisted class per family', () => {
    for (const profileId of PROFILE_IDS) {
      const out = resolveBodyClasses({ engineEnabled: true, profileId, modes: modesFollow, values: {} }, registry);
      assert.equal(out.classes.length, followers.length);
      for (const f of followers) {
        const matches = out.classes.filter((c) => f.allowed_values.some((v) => c === `${f.class_prefix}${v}`));
        assert.equal(matches.length, 1, `${f.id}: exactly one allowlisted ${f.class_prefix}* class`);
      }
    }
  });

  test('unknown profile normalizes to modern with needs_review (contract step 2)', () => {
    for (const raw of [null, '', 'garbage']) {
      const out = resolveSetting({
        engineEnabled: true, profileId: raw, mode: 'follow_preset', customValue: null,
      }, followers[0], profilesById);
      assert.equal(out.resolved_value, profilesById[FALLBACK_PROFILE].owned_values[followers[0].id]);
      assert.equal(out.validation_state, 'needs_review', `raw profile ${JSON.stringify(raw)} must be flagged`);
    }
  });

  test('shipped Twig resolver maps match the canonical registry', () => {
    // The resolver ships inline in master.twig: Salla server rendering does
    // not package a new top-level src/views/partials/ directory (live-preview
    // failure on owner-confirmed draft 1402312628), so parity is pinned here.
    const twig = readFileSync(join(ROOT, 'src/views/layouts/master.twig'), 'utf8');
    const grab = (name) => {
      const m = twig.match(new RegExp(`\\{%\\s*set ${name} = (\\{.*?\\})\\s*%\\}`));
      assert.ok(m, `master.twig resolver block must define ${name}`);
      return JSON.parse(m[1]);
    };
    const twigAllowed = grab('hadeel_allowed');
    const twigSafe = grab('hadeel_safe');
    const twigProfiles = grab('hadeel_profiles');
    for (const f of followers) {
      assert.deepEqual(twigAllowed[f.id], f.allowed_values, `${f.id} allowlist drift`);
      assert.equal(twigSafe[f.id], f.safe_default, `${f.id} safe-default drift`);
    }
    assert.deepEqual(Object.keys(twigAllowed).sort(), followerIds.sort());
    assert.deepEqual(Object.keys(twigProfiles).sort(), [...PROFILE_IDS].sort());
    for (const p of registry.profiles) {
      assert.deepEqual(twigProfiles[p.id], p.owned_values, `profile ${p.id} map drift between twig and registry`);
    }
  });
});

/* ------------------------------------------------------------------- T020 */

describe('T020 US1: profiles never own commerce, content, color, or font', () => {
  test('every profile owns exactly the six follower keys, nothing else', () => {
    for (const p of registry.profiles) {
      assert.deepEqual(Object.keys(p.owned_values).sort(), [...followerIds].sort(), `${p.id} ownership drift`);
    }
  });

  test('no profile key touches color/font/content/order/price/availability/options/purchase', () => {
    const forbidden = /color|font|content|order|price|availability|stock|option|cart|purchase|checkout|payment|installment/i;
    for (const p of registry.profiles) {
      for (const key of Object.keys(p.owned_values)) {
        assert.ok(!forbidden.test(key), `${p.id} must not own ${key}`);
      }
    }
    const twilight = loadTwilight();
    const commerceGlobals = [
      'use_theme_font', 'announcement_text', 'announcement_style',
      'product_installment_enabled', 'sticky_add_to_cart', 'enable_add_product_toast',
      'show_tags', 'product_add_to_cart_animation',
    ];
    const byKey = new Map(registry.settings.map((s) => [s.key, s]));
    for (const id of commerceGlobals) {
      assert.equal(byKey.get(`global::${id}`).preset_support, false, `${id} must never follow a preset`);
    }
    assert.ok(twilight.settings.every((s) => !String(s.id).match(/color|price/i)), 'sanity: no color/price global exists to be captured');
  });

  test('deferred final-identity owners are HDL-24…27 and profiles carry versions', () => {
    const expected = { luxury: 'HDL-24', modern: 'HDL-25', minimal: 'HDL-26', practical_digital: 'HDL-27' };
    for (const p of registry.profiles) {
      assert.equal(p.deferred_values.final_visual_identity, expected[p.id]);
      assert.ok(Number.isInteger(p.version) && p.version >= 1);
    }
  });
});

/* ------------------------------------------------------------------- T027 */

describe('T027 US2: valid Custom wins; invalid Custom never reaches a class', () => {
  test('a valid Custom value wins over every profile for every follower', () => {
    for (const f of followers) {
      for (const profileId of PROFILE_IDS) {
        const owned = profilesById[profileId].owned_values[f.id];
        const customValue = f.allowed_values.find((v) => v !== owned);
        assert.ok(customValue, `${f.id}: allowlist must hold a value distinct from the ${profileId} map`);
        const out = resolveSetting({
          engineEnabled: true, profileId, mode: 'custom', customValue,
        }, f, profilesById);
        assert.deepEqual(out, {
          resolved_value: customValue, resolved_from: 'custom', validation_state: 'valid',
        }, `${profileId}.${f.id}: valid Custom must beat the preset map (contract step 4)`);
      }
    }
  });

  test('an invalid Custom value can never reach a class, in any mode or profile', () => {
    const garbage = [
      'garbage', 'WIDE', '', ' hadeel-x', 'hadeel-layout-wide', 'wide ',
      'wide;position:fixed', '<script>', null, undefined, 0, 1, true, ['wide'], { value: 'wide' },
    ];
    const rawModes = ['custom', 'follow_preset', 'garbage', null, undefined];
    for (const f of followers) {
      for (const profileId of PROFILE_IDS) {
        for (const mode of rawModes) {
          for (const bad of garbage) {
            const out = resolveSetting({
              engineEnabled: true, profileId, mode, customValue: bad,
            }, f, profilesById);
            assert.ok(
              f.allowed_values.includes(out.resolved_value),
              `${profileId}.${f.id} mode=${JSON.stringify(mode)} custom=${JSON.stringify(bad)}: ` +
              `resolved value ${JSON.stringify(out.resolved_value)} must be allowlisted`,
            );
            const cls = `${f.class_prefix}${out.resolved_value}`;
            assert.ok(
              f.allowed_values.some((v) => cls === `${f.class_prefix}${v}`),
              `${f.id}: emitted class ${cls} must be exactly prefix + allowlisted value`,
            );
          }
        }
      }
    }
  });

  test('a valid Custom also wins for an unknown mode, before any fallback (contract step 3)', () => {
    const f = followers.find((r) => r.id === 'product_card_style');
    for (const profileId of PROFILE_IDS) {
      for (const rawMode of [null, undefined, '', 'garbage', 'CUSTOM']) {
        const out = resolveSetting({
          engineEnabled: true, profileId, mode: rawMode, customValue: 'bordered',
        }, f, profilesById);
        assert.deepEqual(out, {
          resolved_value: 'bordered', resolved_from: 'custom', validation_state: 'needs_review',
        }, `${profileId} mode=${JSON.stringify(rawMode)}: valid Custom must be preserved first`);
      }
    }
  });
});

/* ------------------------------------------------------------------- T028 */

describe('T028 US2: Custom survives profile switches and serialization/reload', () => {
  test('one Custom survives a luxury -> modern switch while the followers change', () => {
    const values = { product_card_style: 'bordered' };
    const modes = { ...modesFollow, product_card_style: 'custom' };
    const luxury = resolveBodyClasses({ engineEnabled: true, profileId: 'luxury', modes, values }, registry);
    const modern = resolveBodyClasses({ engineEnabled: true, profileId: 'modern', modes, values }, registry);

    const stable = { resolved_value: 'bordered', resolved_from: 'custom', validation_state: 'valid' };
    assert.deepEqual(luxury.results.product_card_style, stable);
    assert.deepEqual(modern.results.product_card_style, stable, 'profile switch must not touch a Custom field');

    const changed = followers.filter(
      (f) => f.id !== 'product_card_style'
        && luxury.results[f.id].resolved_value !== modern.results[f.id].resolved_value,
    );
    assert.ok(changed.length >= 1, 'at least one follower must change with the profile');
    for (const f of followers) {
      if (f.id === 'product_card_style') continue;
      for (const out of [luxury, modern]) {
        assert.equal(out.results[f.id].resolved_from, 'preset', `${f.id} must follow the preset`);
        assert.equal(out.results[f.id].validation_state, 'valid');
      }
    }
  });

  test('multiple Customs survive switches across all four profiles; only followers move', () => {
    const values = { product_card_style: 'bordered', corner_style: 'rounded', header_layout: 'start' };
    const customIds = Object.keys(values);
    const modes = { ...modesFollow, ...Object.fromEntries(customIds.map((id) => [id, 'custom'])) };
    const runs = PROFILE_IDS.map((profileId) => resolveBodyClasses(
      { engineEnabled: true, profileId, modes, values }, registry,
    ));
    for (const [i, profileId] of PROFILE_IDS.entries()) {
      for (const id of customIds) {
        assert.deepEqual(runs[i].results[id], {
          resolved_value: values[id], resolved_from: 'custom', validation_state: 'valid',
        }, `${profileId}.${id}: Custom must be stable across every profile`);
      }
      for (const f of followers) {
        if (customIds.includes(f.id)) continue;
        assert.deepEqual(runs[i].results[f.id], {
          resolved_value: profilesById[profileId].owned_values[f.id],
          resolved_from: 'preset',
          validation_state: 'valid',
        }, `${profileId}.${f.id}: follower must track the profile map`);
      }
    }
  });

  test('a JSON serialize/reload round-trip preserves the store and the resolution byte-for-byte', () => {
    const store = {
      values: { product_card_style: 'bordered', section_spacing: 'compact' },
      modes: { ...modesFollow, product_card_style: 'custom', section_spacing: 'custom' },
    };
    const reloaded = JSON.parse(JSON.stringify(store));
    assert.deepEqual(reloaded, store, 'save/reload must not alter the persisted store');
    for (const profileId of PROFILE_IDS) {
      const before = resolveBodyClasses({ engineEnabled: true, profileId, ...store }, registry);
      const after = resolveBodyClasses({ engineEnabled: true, profileId, ...reloaded }, registry);
      assert.deepEqual(after, before, `${profileId}: reload must not change resolution`);
    }
  });
});

/* ------------------------------------------------------------------- T029 */

describe('T029 US2: per-field return to Follow is scoped and lossless', () => {
  test('returning one field to Follow re-follows only that field and leaves other Customs intact', () => {
    const values = { product_card_style: 'bordered', corner_style: 'rounded' };
    const modesCustom = { ...modesFollow, product_card_style: 'custom', corner_style: 'custom' };
    const modesReturned = { ...modesCustom, product_card_style: 'follow_preset' };
    const before = resolveBodyClasses({ engineEnabled: true, profileId: 'luxury', modes: modesCustom, values }, registry);
    const after = resolveBodyClasses({ engineEnabled: true, profileId: 'luxury', modes: modesReturned, values }, registry);

    assert.deepEqual(after.results.product_card_style, {
      resolved_value: profilesById.luxury.owned_values.product_card_style,
      resolved_from: 'preset',
      validation_state: 'valid',
    }, 'the returned field must resolve from the profile map again');
    assert.notEqual(
      after.results.product_card_style.resolved_value,
      before.results.product_card_style.resolved_value,
      'the returned field must actually change (luxury map differs from the stored Custom)',
    );
    for (const f of followers) {
      if (f.id === 'product_card_style') continue;
      assert.deepEqual(after.results[f.id], before.results[f.id], `${f.id} must be untouched by the return`);
    }
  });

  test('the stored Custom value survives return-to-Follow and wins again on explicit re-selection', () => {
    const values = { product_card_style: 'bordered' };
    const snapshot = JSON.stringify(values);

    const returned = resolveBodyClasses({ engineEnabled: true, profileId: 'modern', modes: modesFollow, values }, registry);
    assert.equal(returned.results.product_card_style.resolved_from, 'preset');
    assert.equal(JSON.stringify(values), snapshot, 'resolution must never delete the stored Custom value');

    const reselected = resolveBodyClasses({
      engineEnabled: true, profileId: 'modern',
      modes: { ...modesFollow, product_card_style: 'custom' }, values,
    }, registry);
    assert.deepEqual(reselected.results.product_card_style, {
      resolved_value: 'bordered', resolved_from: 'custom', validation_state: 'valid',
    }, 're-selecting Custom must restore the exact stored value');
    assert.equal(JSON.stringify(values), snapshot, 'store bytes must be identical after the full round trip');
  });
});

/* ------------------------------------------------------------------- T033 */

describe('T033 US3: exact fallback precedence on invalid data', () => {
  test('missing, null, empty, or unknown profile resolves through the modern map with needs_review', () => {
    for (const raw of [undefined, null, '', 'garbage', 'LUXURY', ' modern', 0, true]) {
      const out = resolveBodyClasses({ engineEnabled: true, profileId: raw, modes: modesFollow, values: {} }, registry);
      assert.equal(out.profile_class, `hadeel-preset-${FALLBACK_PROFILE}`, `raw=${JSON.stringify(raw)}`);
      for (const f of followers) {
        assert.deepEqual(out.results[f.id], {
          resolved_value: profilesById[FALLBACK_PROFILE].owned_values[f.id],
          resolved_from: 'preset',
          validation_state: 'needs_review',
        }, `raw profile ${JSON.stringify(raw)} must flag needs_review for ${f.id}`);
        assert.ok(f.allowed_values.includes(out.results[f.id].resolved_value));
      }
    }
  });

  test('unknown mode flags needs_review: valid Custom preserved first, otherwise the normalized profile value', () => {
    const f = followers.find((r) => r.id === 'product_card_style');
    for (const rawMode of [null, undefined, '', 'garbage', 'CUSTOM', 'follow']) {
      const kept = resolveSetting({
        engineEnabled: true, profileId: 'luxury', mode: rawMode, customValue: 'bordered',
      }, f, profilesById);
      assert.deepEqual(kept, {
        resolved_value: 'bordered', resolved_from: 'custom', validation_state: 'needs_review',
      }, `mode=${JSON.stringify(rawMode)}: valid Custom must be preserved before fallback`);

      const dropped = resolveSetting({
        engineEnabled: true, profileId: 'luxury', mode: rawMode, customValue: 'broken',
      }, f, profilesById);
      assert.deepEqual(dropped, {
        resolved_value: profilesById.luxury.owned_values.product_card_style,
        resolved_from: 'preset',
        validation_state: 'needs_review',
      }, `mode=${JSON.stringify(rawMode)}: invalid Custom must fall to the normalized profile value`);
    }
  });

  test('invalid legacy value (engine off) falls to the safe default; invalid Custom (engine on) falls to the profile value', () => {
    for (const f of followers) {
      const legacy = resolveSetting({
        engineEnabled: false, profileId: 'luxury', mode: 'custom', customValue: 'trash', legacyValue: 'trash',
      }, f, profilesById);
      assert.deepEqual(legacy, {
        resolved_value: f.safe_default, resolved_from: 'safe_default', validation_state: 'needs_review',
      }, `${f.id}: engine off + invalid legacy value -> safe default (contract step 1)`);

      const custom = resolveSetting({
        engineEnabled: true, profileId: 'minimal', mode: 'custom', customValue: 'trash',
      }, f, profilesById);
      assert.deepEqual(custom, {
        resolved_value: profilesById.minimal.owned_values[f.id],
        resolved_from: 'preset',
        validation_state: 'needs_review',
      }, `${f.id}: custom mode + invalid Custom -> profile value (contract step 5)`);

      const ignored = resolveSetting({
        engineEnabled: true, profileId: 'minimal', mode: 'follow_preset', customValue: 'trash',
      }, f, profilesById);
      assert.deepEqual(ignored, {
        resolved_value: profilesById.minimal.owned_values[f.id],
        resolved_from: 'preset',
        validation_state: 'valid',
      }, `${f.id}: follow mode must ignore the stored value entirely (contract step 6)`);
    }
  });

  test('a missing or invalid profile map entry falls to the safe default with needs_review (contract step 7)', () => {
    const broken = JSON.parse(JSON.stringify(registry));
    const luxury = broken.profiles.find((p) => p.id === 'luxury');
    delete luxury.owned_values.header_layout; // missing map entry
    luxury.owned_values.corner_style = 'diagonal'; // present but not allowlisted
    const brokenProfiles = indexProfiles(broken);
    const byId = new Map(followerSettings(broken).map((f) => [f.id, f]));

    const missing = resolveSetting({
      engineEnabled: true, profileId: 'luxury', mode: 'follow_preset', customValue: null,
    }, byId.get('header_layout'), brokenProfiles);
    assert.deepEqual(missing, {
      resolved_value: byId.get('header_layout').safe_default,
      resolved_from: 'safe_default',
      validation_state: 'needs_review',
    });

    const invalid = resolveSetting({
      engineEnabled: true, profileId: 'luxury', mode: 'follow_preset', customValue: null,
    }, byId.get('corner_style'), brokenProfiles);
    assert.deepEqual(invalid, {
      resolved_value: byId.get('corner_style').safe_default,
      resolved_from: 'safe_default',
      validation_state: 'needs_review',
    });

    const untouched = resolveSetting({
      engineEnabled: true, profileId: 'luxury', mode: 'follow_preset', customValue: null,
    }, byId.get('layout_width'), brokenProfiles);
    assert.deepEqual(untouched, {
      resolved_value: 'wide', resolved_from: 'preset', validation_state: 'valid',
    }, 'a broken sibling map entry must not affect intact entries');
  });

  test('precedence: a valid Custom beats the profile fallback even when the profile itself is unknown', () => {
    const f = followers.find((r) => r.id === 'product_card_style');
    const out = resolveSetting({
      engineEnabled: true, profileId: 'garbage', mode: 'custom', customValue: 'bordered',
    }, f, profilesById);
    assert.deepEqual(out, {
      resolved_value: 'bordered', resolved_from: 'custom', validation_state: 'needs_review',
    }, 'Custom wins; the unknown profile still flags needs_review');
  });
});

/* ------------------------------------------------------------------- T034 */

describe('T034 US3: resolution never mutates merchant or registry state', () => {
  const deepFreeze = (o) => {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.freeze(o);
      for (const v of Object.values(o)) deepFreeze(v);
    }
    return o;
  };

  test('deep-frozen inputs resolve without throwing; stores serialize byte-identical before/after', () => {
    const frozenRegistry = deepFreeze(JSON.parse(JSON.stringify(registry)));
    const store = deepFreeze({
      values: { product_card_style: 'bordered', header_layout: 'start' },
      modes: { ...modesFollow, product_card_style: 'custom', header_layout: 'custom' },
    });
    const storeBefore = JSON.stringify(store);
    const registryBefore = JSON.stringify(frozenRegistry);

    const frozenRuns = [];
    for (const profileId of PROFILE_IDS) {
      // Any write attempt inside the resolver would throw on the frozen graphs.
      frozenRuns.push(resolveBodyClasses(
        deepFreeze({ engineEnabled: true, profileId, ...store }), frozenRegistry,
      ));
      frozenRuns.push(resolveBodyClasses(
        deepFreeze({ engineEnabled: false, profileId, ...store }), frozenRegistry,
      ));
    }

    assert.equal(JSON.stringify(store), storeBefore, 'merchant store bytes must be unchanged');
    assert.equal(JSON.stringify(frozenRegistry), registryBefore, 'registry bytes must be unchanged');

    // Frozen-input results equal plain-input results: freezing only guards, never changes outcomes.
    for (const [i, profileId] of PROFILE_IDS.entries()) {
      assert.deepEqual(
        frozenRuns[i * 2],
        resolveBodyClasses({ engineEnabled: true, profileId, ...store }, registry),
        `${profileId}: frozen and plain inputs must agree`,
      );
    }
  });

  test('resolution does not add, rename, or delete keys on the merchant store', () => {
    const store = {
      values: { corner_style: 'soft' },
      modes: { ...modesFollow, corner_style: 'custom' },
    };
    const keysBefore = JSON.stringify({ values: Object.keys(store.values), modes: Object.keys(store.modes) });
    for (const profileId of PROFILE_IDS) {
      resolveBodyClasses({ engineEnabled: true, profileId, ...store }, registry);
    }
    assert.equal(
      JSON.stringify({ values: Object.keys(store.values), modes: Object.keys(store.modes) }),
      keysBefore,
      'the store key set must be invariant under resolution',
    );
  });
});

/* ------------------------------------------------------------------- T035 */

describe('T035 US3: rollback — disabled engine ignores the new IDs and reproduces baseline classes', () => {
  const rollback = loadFixture('rollback');
  // The exact engine coercion used by the inline resolver in master.twig.
  const engineOn = (raw) => [true, 'true', 1, '1'].includes(raw);

  const resolveFixtureStore = (store) => resolveBodyClasses({
    engineEnabled: engineOn(store.preset_engine_enabled),
    profileId: store.preset_profile,
    modes: Object.fromEntries(followerIds.map((id) => [id, store[`${id}_mode`]])),
    values: Object.fromEntries(followerIds.map((id) => [id, store[id]])),
  }, registry);

  test('the fixture is a complete post-feature store: new IDs present, six legacy values allowlisted', () => {
    assert.equal(typeof rollback.store.preset_engine_enabled, 'boolean');
    assert.ok(rollback.store.preset_engine_enabled === false, 'rollback fixture must have the engine disabled');
    assert.ok(PROFILE_IDS.includes(rollback.store.preset_profile), 'a valid profile stays stored');
    for (const f of followers) {
      assert.ok(
        f.allowed_values.includes(rollback.store[f.id]),
        `${f.id}: stored legacy value ${JSON.stringify(rollback.store[f.id])} must be allowlisted`,
      );
      assert.ok(MODES.includes(rollback.store[`${f.id}_mode`]), `${f.id}_mode must hold a stored mode`);
    }
  });

  test('engine off ignores every new stored ID and emits exactly the six legacy classes', () => {
    const out = resolveFixtureStore(rollback.store);
    assert.equal(out.profile_class, null, 'rollback must not emit a preset class');
    const expected = followers.map((f) => `${f.class_prefix}${rollback.store[f.id]}`);
    assert.deepEqual(out.classes, expected);
    for (const f of followers) {
      assert.deepEqual(out.results[f.id], {
        resolved_value: rollback.store[f.id], resolved_from: 'legacy', validation_state: 'valid',
      }, `${f.id}: stored modes/profile must be ignored with the engine off`);
    }
  });

  test('stripping the new IDs changes nothing: baseline classes reproduce byte-for-byte', () => {
    const withNewIds = resolveFixtureStore(rollback.store);
    const stripped = resolveBodyClasses({
      engineEnabled: false,
      profileId: FALLBACK_PROFILE,
      modes: modesFollow,
      values: Object.fromEntries(followerIds.map((id) => [id, rollback.store[id]])),
    }, registry);
    assert.deepEqual(withNewIds, stripped, 'new stored IDs must be inert under rollback');

    // Pinned literal baseline snapshot for the fixture values
    // (full / compact / rounded / elevated / start / compact).
    assert.deepEqual(stripped.classes, [
      'hadeel-layout-full',
      'hadeel-spacing-compact',
      'hadeel-corners-rounded',
      'hadeel-card-elevated',
      'hadeel-header-start',
      'hadeel-header-density-compact',
    ], 'the six old values must reproduce the pre-feature classes byte-for-byte');
  });
});

/* ------------------------------------------------- US4 shared checker rig */

const INVENTORY_PATH = 'specs/003-settings-preset-engine/evidence/baseline/settings-inventory.json';
const inventory = JSON.parse(readFileSync(join(ROOT, INVENTORY_PATH), 'utf8'));
const byKey = new Map(registry.settings.map((s) => [s.key, s]));

/** Run the real checker against one isolated registry mutation (temp file). */
function runMutatedChecker(mutate, { documentOnly = true } = {}) {
  const doc = JSON.parse(JSON.stringify(registry));
  mutate(doc);
  const dir = mkdtempSync(join(tmpdir(), 'hdl03-registry-'));
  const p = join(dir, 'registry.json');
  writeFileSync(p, JSON.stringify(doc));
  try {
    return checkSettingsRegistry({ root: ROOT, registryPath: p, documentOnly });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const errorsOf = (result) => result.findings.filter((f) => f.level === 'error');

function walkFiles(dir, exts) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkFiles(full, exts));
    else if (exts.includes(extname(name))) out.push(full);
  }
  return out;
}

/* ------------------------------------------------------------------- T039 */

describe('T039 US4: all 65 global + 62 component records, legal repeated raw ids', () => {
  test('the current registry passes the full strict checker with zero errors', () => {
    const result = checkSettingsRegistry({ root: ROOT, strict: true });
    assert.equal(errorsOf(result).length, 0,
      `registry must be clean, got: ${JSON.stringify(errorsOf(result).slice(0, 3))}`);
    // 65 = 63 + the two HDL-07 menu/cart visibility records (T023 blocker fix).
    assert.equal(result.stats.globals, 65);
    assert.equal(result.stats.components, 62);
    assert.equal(result.stats.profiles, 4);
    assert.equal(result.stats.twilight_globals, 65);
    assert.equal(result.stats.twilight_components, 62);
  });

  test('all 65 current global records are registered, including the 45 baseline globals', () => {
    const globals = registry.settings.filter((s) => s.scope === 'global');
    assert.equal(globals.length, 65);
    assert.equal(inventory.counts.global_records, 45, 'baseline inventory must pin 45 globals');
    assert.equal(inventory.globals.length, 45);
    for (const base of inventory.globals) {
      const rec = byKey.get(base.key);
      assert.ok(rec, `baseline global ${base.key} must remain registered`);
      assert.equal(rec.id, base.id, `${base.key}: raw id drift`);
      assert.equal(rec.type, base.type, `${base.key}: legacy type drift (meaning is immutable)`);
      assert.equal(rec.scope, 'global');
    }
    // The twenty post-baseline additions are exactly the HDL-03 engine
    // controls, scope note, and explicit Presets group title, plus the three
    // HDL-06 motion records (group title, level, mobile reduction), plus the
    // seven HDL-07 header foundation records (transparent-home,
    // search/menu/cart/account visibility, logo size, transparent ink).
    const baselineKeys = new Set(inventory.globals.map((g) => g.key));
    const added = globals.filter((s) => !baselineKeys.has(s.key)).map((s) => s.id).sort();
    assert.deepEqual(added, [
      'corner_style_mode', 'header_density_mode', 'header_layout_mode',
      'header_logo_size', 'header_show_account', 'header_show_cart',
      'header_show_menu', 'header_show_search',
      'header_transparent_home', 'header_transparent_ink',
      'layout_width_mode', 'motion_level', 'motion_reduce_mobile',
      'preset_engine_enabled', 'preset_profile',
      'product_card_style_mode', 'section_spacing_mode', 'static-motion-title',
      'static-preset-scope-note', 'static-presets-title',
    ].sort());
  });

  test('all 62 component/nested records are registered under component-qualified keys', () => {
    const components = registry.settings.filter((s) => s.scope === 'component');
    assert.equal(components.length, 62);
    assert.equal(inventory.counts.component_nested_records, 62);
    const componentPaths = new Set(loadTwilight().components.map((c) => c.path));
    for (const base of inventory.component_records) {
      const rec = byKey.get(base.key);
      assert.ok(rec, `baseline component record ${base.key} must remain registered`);
      assert.equal(rec.id, base.id, `${base.key}: raw id drift`);
      assert.equal(rec.type, base.type, `${base.key}: type drift`);
      assert.equal(rec.scope, 'component');
    }
    for (const rec of components) {
      const [path] = rec.key.split('::');
      assert.ok(componentPaths.has(path), `${rec.key}: must be qualified by a declared component path`);
      assert.ok(rec.key.length > path.length + 2, `${rec.key}: qualified key must carry the field path`);
    }
  });

  test('legal repeated raw component ids stay distinct under qualified keys', () => {
    assert.ok(inventory.repeated_raw_component_ids.length >= 5);
    for (const { id, count } of inventory.repeated_raw_component_ids) {
      const matches = registry.settings.filter((s) => s.scope === 'component' && s.id === id);
      assert.equal(matches.length, count, `raw component id "${id}" must repeat exactly ${count} times`);
      assert.equal(new Set(matches.map((s) => s.key)).size, count, `"${id}" qualified keys must be distinct`);
    }
    // Cross-scope raw-id reuse is legal: a component record may reuse a global raw id.
    const legal = runMutatedChecker((doc) => {
      const donor = doc.settings.find((s) => s.scope === 'component' && s.id === 'title');
      doc.settings.push({ ...donor, key: 'home.fake-component::layout_width', id: 'layout_width' });
    });
    assert.deepEqual(errorsOf(legal), [], 'a component raw id colliding with a global id must stay scoped and legal');
    // A raw-id duplicate inside the global scope is not legal.
    const illegal = runMutatedChecker((doc) => {
      const donor = doc.settings.find((s) => s.key === 'global::layout_width');
      doc.settings.push({ ...donor, key: 'global::layout_width_copy' });
    });
    const errs = errorsOf(illegal);
    assert.ok(errs.some((f) => f.rule === 'uniqueness' && f.message.includes('layout_width')),
      `global raw-id duplicate must fail uniqueness, got: ${JSON.stringify(errs.slice(0, 2))}`);
  });
});

/* ------------------------------------------------------------------- T040 */

describe('T040 US4: one isolated defect per rule fails with an actionable key', () => {
  test('missing owner/default/fallback/source metadata is rejected', () => {
    for (const field of ['owner_spec', 'declared_default', 'safe_default', 'source_path']) {
      const result = runMutatedChecker((doc) => {
        delete doc.settings.find((s) => s.key === 'global::layout_width')[field];
      });
      const errs = errorsOf(result);
      assert.ok(errs.some((f) => f.rule === 'schema' && f.message.includes(field)),
        `missing ${field} must fail schema validation, got: ${JSON.stringify(errs.slice(0, 2))}`);
    }
    const badOwner = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::layout_width').owner_spec = 'HDL-3';
    });
    // 'HDL-3' also breaks the schema pattern; use a schema-legal but unowned shape too.
    assert.ok(errorsOf(badOwner).length >= 1, 'a malformed owner_spec must fail');
    const wrongPath = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::layout_width').source_path = 'other.json#/settings/6';
    });
    assert.ok(errorsOf(wrongPath).some((f) => f.rule === 'metadata' && f.where === 'global::layout_width'),
      'a source_path outside twilight.json must fail metadata with the qualified key');
  });

  test('changed legacy type or options are caught as drift against twilight.json', () => {
    const typeDrift = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::layout_width').type = 'string';
    }, { documentOnly: false });
    assert.ok(errorsOf(typeDrift).some(
      (f) => f.rule === 'coverage' && f.where === 'global::layout_width' && f.message.includes('type drift'),
    ), 'legacy type change must fail coverage with the qualified key');

    const optionDrift = runMutatedChecker((doc) => {
      const rec = doc.settings.find((s) => s.key === 'global::layout_width');
      rec.allowed_values = rec.allowed_values.filter((v) => v !== 'full');
    }, { documentOnly: false });
    assert.ok(errorsOf(optionDrift).some(
      (f) => f.rule === 'coverage' && f.where === 'global::layout_width' && f.message.includes('allowed_values drift'),
    ), 'legacy option removal must fail coverage with the qualified key');
  });

  test('bad profile ids and incomplete maps are rejected', () => {
    const renamed = runMutatedChecker((doc) => { doc.profiles[0].id = 'royal'; });
    assert.ok(errorsOf(renamed).length >= 1, 'an unknown profile id must fail');
    assert.ok(errorsOf(renamed).some((f) => f.rule === 'schema' && f.message.includes('enum')),
      'profile id must be constrained to the four canonical ids');

    const dropped = runMutatedChecker((doc) => {
      delete doc.profiles.find((p) => p.id === 'modern').owned_values.layout_width;
    });
    assert.ok(errorsOf(dropped).some((f) => f.rule === 'schema' && f.message.includes('layout_width')),
      'an incomplete profile map must fail schema validation');

    const fifth = runMutatedChecker((doc) => {
      doc.profiles.push({ ...JSON.parse(JSON.stringify(doc.profiles[0])) });
    });
    assert.ok(errorsOf(fifth).length >= 1, 'a fifth profile must fail (exactly four are approved)');
  });

  test('illegal values are rejected', () => {
    const badProfileValue = runMutatedChecker((doc) => {
      doc.profiles.find((p) => p.id === 'luxury').owned_values.corner_style = 'diagonal';
    });
    assert.ok(errorsOf(badProfileValue).length >= 1, 'a non-allowlisted profile value must fail');

    const badFallback = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::corner_style').safe_default = 'diagonal';
    });
    assert.ok(errorsOf(badFallback).some(
      (f) => f.rule === 'allowlist' && f.where === 'global::corner_style',
    ), 'a safe_default outside allowed_values must fail with the qualified key');

    const badFollowerSet = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::announcement_enabled').preset_support = true;
    });
    assert.ok(errorsOf(badFollowerSet).some((f) => f.rule === 'mode-pairing'),
      'a seventh preset-aware follower must fail mode-pairing');
  });
});

/* ------------------------------------------------------------------- T041 */

describe('T041 US4: selectors for non-default class values; base_variant contract', () => {
  const THEME_OWNED = (p) => p.startsWith('hadeel-') || p.startsWith('announcement-bar');
  const scssAll = walkFiles(join(ROOT, 'src/assets/styles'), ['.scss'])
    .map((f) => readFileSync(f, 'utf8')).join('\n');
  const compiledCss = readFileSync(join(ROOT, 'public/app.css'), 'utf8');

  test('every non-default class value has an SCSS selector or a compiled CSS mapping', () => {
    const producers = registry.settings.filter((s) => s.class_prefix);
    assert.ok(producers.length >= 6, 'the six class-producing followers must be present');
    for (const rec of producers) {
      // Unstyled evidence markers (hadeel-preset-*) are pinned by the checker's
      // twig-preset-marker rule instead — they intentionally have no selector.
      if (rec.class_marker) continue;
      for (const value of rec.allowed_values) {
        if (rec.base_variant && value === rec.declared_default) continue; // implemented by base CSS
        const cls = `${rec.class_prefix}${value}`;
        if (THEME_OWNED(rec.class_prefix)) {
          assert.ok(scssAll.includes(`.${cls}`), `${rec.key}: missing SCSS selector .${cls}`);
        } else {
          const re = new RegExp(`\\.${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s,{.:>#\\[]|$)`);
          assert.ok(re.test(compiledCss), `${rec.key}: missing compiled class .${cls} in public/app.css`);
        }
      }
    }
  });

  test('base_variant is true for exactly minimal, centered, and comfortable', () => {
    const expected = new Map([
      ['global::product_card_style', 'minimal'],
      ['global::header_layout', 'centered'],
      ['global::header_density', 'comfortable'],
    ]);
    const bases = registry.settings.filter((s) => s.base_variant);
    assert.deepEqual(bases.map((s) => s.key).sort(), [...expected.keys()].sort(),
      'exactly the three contract R-007 records may be base variants');
    for (const rec of bases) {
      assert.equal(rec.declared_default, expected.get(rec.key),
        `${rec.key}: base_variant requires declared_default "${expected.get(rec.key)}"`);
    }
  });

  test('base-variant and selector defects fail loudly with the qualified key', () => {
    const droppedBase = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::product_card_style').base_variant = false;
    });
    assert.ok(errorsOf(droppedBase).some(
      (f) => f.rule === 'base-variant' && f.where === 'global::product_card_style'),
      'removing an approved base_variant must fail');

    const inventedBase = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::layout_width').base_variant = true;
    });
    assert.ok(errorsOf(inventedBase).some(
      (f) => f.rule === 'base-variant' && f.where === 'global::layout_width'),
      'an unapproved base_variant must fail');

    const missingSelector = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::layout_width').allowed_values.push('gargantuan');
    }, { documentOnly: false });
    assert.ok(errorsOf(missingSelector).some(
      (f) => f.rule === 'allowlist' && f.where === 'global::layout_width' && f.message.includes('.hadeel-layout-gargantuan')),
      'a class value with no SCSS selector must fail with the selector named');
  });
});

/* ------------------------------------------------------------------- T042 */

describe('T042 US4: diagnostics carry key, source path, rule, and expected value', () => {
  test('coverage diagnostics include the qualified key, source path, rule, and expected value', () => {
    const result = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::layout_width').declared_default = 'compact';
    }, { documentOnly: false });
    const f = errorsOf(result).find((x) => x.rule === 'coverage' && x.message.includes('declared_default drift'));
    assert.ok(f, 'a declared_default drift must produce a coverage finding');
    assert.equal(f.where, 'global::layout_width', 'the qualified registry key must be present');
    assert.equal(f.source, 'twilight.json#/settings/6', 'the twilight.json source path must be attached');
    assert.ok(f.expected !== undefined && f.expected.includes('wide'), 'the expected value must be present');
  });

  test('document-rule diagnostics include the qualified key, source path, rule, and expected value', () => {
    // A schema-legal but wrong source_path exercises the metadata rule itself
    // (the owner pattern is already enforced at schema level, so it cannot
    // reach this rule — the source-path prefix check is the rule's own teeth).
    const result = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::corner_style').source_path = 'other.json#/settings/8';
    });
    const f = errorsOf(result).find((x) => x.rule === 'metadata');
    assert.ok(f, 'a source_path outside twilight.json must produce a metadata finding');
    assert.equal(f.where, 'global::corner_style');
    assert.equal(f.source, 'other.json#/settings/8',
      'the source path must be attached from the registered record');
    assert.equal(f.expected, 'twilight.json#/…');
  });
});

/* ------------------------------------------------------------------- T043 */

describe('T043 US4: every theme.settings.get global key is declared and registered', () => {
  const GET_RE = /theme\.settings\.get\(\s*'([A-Za-z0-9_]+)'/g;

  function scannedGetKeys() {
    const keys = new Set();
    for (const f of walkFiles(join(ROOT, 'src/views'), ['.twig'])) {
      const text = readFileSync(f, 'utf8').replace(/\{#[\s\S]*?#\}/g, ''); // strip twig comments
      for (const m of text.matchAll(GET_RE)) keys.add(m[1]);
    }
    return keys;
  }

  test('every static theme.settings.get key in templates maps to a registered global record', () => {
    const keys = scannedGetKeys();
    assert.ok(keys.size >= 30, `expected the template setting reads to be scanned (got ${keys.size})`);
    const twilight = loadTwilight();
    const declared = new Set(twilight.settings.map((s) => s.id));
    for (const id of keys) {
      assert.ok(declared.has(id), `theme.settings.get('${id}') must be declared in twilight.json`);
      const rec = byKey.get(`global::${id}`);
      assert.ok(rec, `theme.settings.get('${id}') must be registered as global::${id}`);
      assert.equal(rec.scope, 'global');
    }
  });

  test('the checker twig-settings rule passes on the current repository', () => {
    const result = checkSettingsRegistry({ root: ROOT });
    assert.ok(!errorsOf(result).some((f) => f.rule === 'twig-settings'),
      'no unregistered theme.settings.get key may exist');
    assert.ok(result.findings.some((f) => f.rule === 'twig-settings' && f.level === 'ok'),
      'the twig-settings rule must run and report its ok line');
  });

  test('component-local duplicate raw ids remain scoped; only global duplicates fail', () => {
    // Current repository: raw component ids repeat legally across components…
    const repeats = inventory.repeated_raw_component_ids;
    assert.ok(repeats.every(({ count }) => count >= 2));
    const result = checkSettingsRegistry({ root: ROOT });
    assert.ok(!errorsOf(result).some((f) => f.rule === 'uniqueness'),
      'legal component raw-id repeats must not trip uniqueness');
    // …and reusing a global raw id inside a component stays scoped (legal).
    const scoped = runMutatedChecker((doc) => {
      const donor = doc.settings.find((s) => s.scope === 'component' && s.id === 'title');
      doc.settings.push({ ...donor, key: 'home.fake::preset_profile', id: 'preset_profile' });
    });
    assert.deepEqual(errorsOf(scoped), [],
      'a component record reusing a global raw id must remain scoped and legal');
  });
});

/* ------------------------------------- FR-012 Final Review fix (shipped Twig) */

describe('FR-012 fix: engine-off invalid legacy keeps a traceable needs_review attribute', () => {
  const twig = readFileSync(join(ROOT, 'src/views/layouts/master.twig'), 'utf8');

  test('data-hadeel-preset-review is gated only on hadeel_review, not on the engine', () => {
    for (const attr of ['data-hadeel-preset="', 'data-hadeel-preset-sources="', 'data-hadeel-preset-review="']) {
      assert.equal(twig.split(attr).length - 1, 1, `${attr} must appear exactly once in master.twig`);
    }
    // The engine-on block must carry the preset/profile/source attributes only.
    // (The marker class has its own engine-on gate; select the block with the data attributes.)
    const engineBlock = [...twig.matchAll(/\{%\s*if hadeel_engine_on\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g)]
      .map((m) => m[1])
      .find((b) => b.includes('data-hadeel-preset="'));
    assert.ok(engineBlock, 'master.twig must keep an engine-on evidence block');
    assert.ok(engineBlock.includes('data-hadeel-preset="'), 'preset attribute stays engine-on only');
    assert.ok(engineBlock.includes('data-hadeel-preset-sources="'), 'sources attribute stays engine-on only');
    assert.ok(!engineBlock.includes('data-hadeel-preset-review'),
      'the review attribute must not live inside the engine-on conditional');
    // The review attribute renders whenever the aggregated review list is non-empty,
    // which includes engine-off invalid legacy values (FR-012 / contract step 1).
    const reviewBlock = twig.match(/\{%\s*if hadeel_review\|length > 0\s*%\}(.*?)\{%\s*endif\s*%\}/s);
    assert.ok(reviewBlock, 'master.twig must gate the review attribute on hadeel_review alone');
    assert.ok(reviewBlock[1].includes('data-hadeel-preset-review="{{ hadeel_review|join(\',\') }}"'));
  });

  test('the shipped engine-off branch flags invalid legacy input into hadeel_review', () => {
    // Anchor on the outer else: the engine-on branch starts with set hadeel_mode.
    const legacyBranch = twig.match(/\{%\s*if not hadeel_engine_on\s*%\}([\s\S]*?)\{%\s*else\s*%\}\s*\{%\s*set hadeel_mode/);
    assert.ok(legacyBranch, 'the engine-off branch must exist in the shipped resolver');
    assert.ok(
      legacyBranch[1].includes("hadeel_from = 'safe_default'") && legacyBranch[1].includes('hadeel_flag = true'),
      'invalid legacy input must fall to the safe default with a review flag (contract step 1)',
    );
    assert.ok(twig.includes('hadeel_review = hadeel_review|merge([hadeel_id])'),
      'per-field flags must aggregate into hadeel_review');
  });

  test('valid engine-off output stays byte-equivalent in classes', () => {
    // The six resolved class interpolations remain present and unconditional…
    for (const f of followers) {
      assert.ok(twig.includes(`{{ hadeel_resolved.${f.id} }}`),
        `${f.class_prefix}* interpolation must remain in the class attribute`);
    }
    // …and the review state never touches the class attribute itself.
    const classAttr = twig.match(/<body id="app" class="([\s\S]*?)"/);
    assert.ok(classAttr, 'the body class attribute must exist');
    assert.ok(!classAttr[1].includes('hadeel_review'), 'review state must never alter the class attribute');
    // Reference-level proof that valid engine-off input produces an empty review
    // list (nothing rendered) while invalid input marks needs_review.
    const validValues = Object.fromEntries(followers.map((f) => [f.id, f.declared_default]));
    const valid = resolveBodyClasses({ engineEnabled: false, profileId: null, modes: {}, values: validValues }, registry);
    assert.ok(Object.values(valid.results).every((r) => r.validation_state === 'valid'),
      'valid engine-off resolution must flag nothing (attribute stays absent)');
    const invalid = resolveBodyClasses({
      engineEnabled: false, profileId: null, modes: {},
      values: { ...validValues, layout_width: 'corrupted' },
    }, registry);
    assert.equal(invalid.results.layout_width.validation_state, 'needs_review',
      'invalid engine-off legacy input must be traceable as needs_review');
  });
});

/* ------------ Final Review remediation: strict shipped Twig comparisons ------------ */

describe('shipped Twig comparisons are strict and fail closed (Final Review)', () => {
  const rawTwig = readFileSync(join(ROOT, 'src/views/layouts/master.twig'), 'utf8');
  const code = rawTwig.replace(/\{#[\s\S]*?#\}/g, ''); // strip comments: assert on executed code only

  test('engine activation uses exact is same as operands, never a loose in-list', () => {
    assert.ok(code.includes(
      "hadeel_engine_on = hadeel_engine_raw is same as(true) or hadeel_engine_raw is same as('true') or hadeel_engine_raw is same as(1) or hadeel_engine_raw is same as('1')",
    ), 'engine activation must be exactly the four enrolled shapes');
    assert.ok(!/hadeel_engine_raw\s+(not\s+)?in\s+\[/.test(code),
      'a loose `in` list must not activate the engine');
  });

  test('profile validation guards the raw type before the allowlist', () => {
    assert.ok(code.includes("hadeel_profile_ok = hadeel_profile_raw is not iterable and hadeel_profile_raw is same as(hadeel_profile_raw ~ '') and hadeel_profile_raw in hadeel_profiles|keys"));
    assert.ok(code.includes("hadeel_profile = hadeel_profile_ok ? hadeel_profile_raw : 'modern'"));
    assert.ok(code.includes('hadeel_profile_review = hadeel_engine_on and not hadeel_profile_ok'));
    assert.ok(!/hadeel_profile_raw\s+not\s+in\s/.test(code),
      'the unguarded loose `not in` profile check must be gone');
  });

  test('mode branches compare with is same as, never loose ==', () => {
    assert.ok(code.includes("hadeel_mode is same as('custom') and hadeel_custom_ok"));
    assert.ok(code.includes("hadeel_mode is same as('follow_preset')"));
    assert.ok(!/hadeel_mode\s*==/.test(code), 'loose == mode comparisons must be gone');
  });

  test('stored values are string-guarded before allowlist membership in both engine branches', () => {
    assert.ok(code.includes("hadeel_custom_ok = hadeel_stored is not iterable and hadeel_stored is same as(hadeel_stored ~ '') and hadeel_stored in hadeel_allowed[hadeel_id]"));
    const legacyBranch = code.match(/\{%\s*if not hadeel_engine_on\s*%\}([\s\S]*?)\{%\s*else\s*%\}/);
    assert.ok(legacyBranch, 'the engine-off branch must exist');
    assert.ok(legacyBranch[1].includes('{% if hadeel_custom_ok %}'),
      'the engine-off branch must reuse the guarded membership check');
    assert.ok(!/\{%\s*if hadeel_stored in /.test(code),
      'the unguarded `hadeel_stored in` check must be gone');
  });

  // JS mirrors of the shipped Twig semantics (strict, fail closed). Twig `is
  // same as` is identity without coercion; the iterable guard plus self-cast
  // identity accepts exact strings only.
  const shippedEngineOn = (raw) => raw === true || raw === 'true' || raw === 1 || raw === '1';
  const shippedScalarOk = (raw, allowed) => typeof raw === 'string' && allowed.includes(raw);

  test('reference mirror: only the four enrolled shapes activate the engine', () => {
    for (const on of [true, 'true', 1, '1']) assert.equal(shippedEngineOn(on), true);
    for (const off of [false, 0, '0', 'false', 'yes', 'TRUE', 'enabled', 'on', 2, -1, null, undefined, '', [], {}, ['true']]) {
      assert.equal(shippedEngineOn(off), false, `raw ${JSON.stringify(off)} must fail closed`);
    }
  });

  test('reference mirror: only exact allowlisted strings pass the stored-value guard', () => {
    const allowed = ['compact', 'wide', 'full'];
    for (const ok of allowed) assert.equal(shippedScalarOk(ok, allowed), true);
    for (const bad of [true, false, 0, 1, null, undefined, '', 'WIDE', ' wide', 'wide ', 'hadeel-layout-wide', [], {}, ['wide']]) {
      assert.equal(shippedScalarOk(bad, allowed), false, `raw ${JSON.stringify(bad)} must fail closed`);
    }
  });

  test('end to end: garbage engine/profile/mode/value raw types resolve to allowlisted output only', () => {
    for (const raw of ['yes', 'TRUE', 2, ['true'], { v: 1 }]) {
      const out = resolveBodyClasses({
        engineEnabled: shippedEngineOn(raw),
        profileId: raw,
        modes: { layout_width: raw },
        values: { layout_width: raw },
      }, registry);
      assert.equal(out.profile_class, null, `engine-shaped garbage ${JSON.stringify(raw)} must keep the engine off`);
      for (const f of followers) {
        assert.ok(f.allowed_values.includes(out.results[f.id].resolved_value),
          `${f.id}: resolved value must stay allowlisted for raw ${JSON.stringify(raw)}`);
      }
    }
  });
});

/* ------------ Final Review remediation: FR-016 emitted-class contract ------------ */

describe('FR-016: every emitted class family is registered and twig parity has teeth', () => {
  const twigText = readFileSync(join(ROOT, 'src/views/layouts/master.twig'), 'utf8');
  const keyIndex = new Map(registry.settings.map((s) => [s.key, s]));

  test('the shipped template passes resolved-class and marker parity, non-vacuously', () => {
    const findings = checkTwigClassEmission(twigText, keyIndex);
    assert.deepEqual(findings.filter((f) => f.level === 'error'), []);
    assert.ok(findings.some((f) => f.rule === 'twig-resolved' && f.level === 'ok'),
      'the resolved-parity rule must run');
    assert.ok(findings.some((f) => f.rule === 'twig-preset-marker' && f.level === 'ok'),
      'the marker-parity rule must run');
    // Non-vacuous: the shipped template really emits all six families plus the marker.
    const resolved = [...twigText.matchAll(/\{\{\s*hadeel_resolved\.([A-Za-z0-9_]+)\s*\}\}/g)].map((m) => m[1]);
    assert.deepEqual(resolved.sort(), [...followerIds].sort(),
      'all six follower families must be emitted through hadeel_resolved');
    assert.equal([...twigText.matchAll(/hadeel-preset-\{\{\s*hadeel_profile\s*\}\}/g)].length, 1,
      'the preset marker class must be emitted exactly once');
  });

  test('the marker class stays gated on the engine, like the data attributes', () => {
    assert.ok(
      /\{%\s*if hadeel_engine_on\s*%\}\s*hadeel-preset-\{\{\s*hadeel_profile\s*\}\}\s*\{%\s*endif\s*%\}/.test(twigText),
      'hadeel-preset-{{ hadeel_profile }} must render only while the engine is on',
    );
  });

  test('the registry represents the marker family on global::preset_profile', () => {
    const rec = byKey.get('global::preset_profile');
    assert.equal(rec.class_prefix, 'hadeel-preset-');
    assert.equal(rec.class_marker, true);
    assert.deepEqual(rec.allowed_values, [...PROFILE_IDS]);
    assert.equal(rec.safe_default, FALLBACK_PROFILE);
  });

  test('a swapped prefix fails with the follower key and the expected prefix', () => {
    const mutated = twigText.replace(
      'hadeel-layout-{{ hadeel_resolved.layout_width }}',
      'hadeel-spacing-{{ hadeel_resolved.layout_width }}',
    );
    const errs = checkTwigClassEmission(mutated, keyIndex).filter((f) => f.level === 'error');
    assert.ok(
      errs.some((f) => f.rule === 'twig-resolved' && f.where === 'global::layout_width' && f.expected === '"hadeel-layout-"'),
      `prefix/ID mismatch must fail, got: ${JSON.stringify(errs.slice(0, 2))}`,
    );
  });

  test('a non-follower id in a resolved interpolation fails', () => {
    const mutated = twigText.replace('hadeel_resolved.layout_width', 'hadeel_resolved.announcement_style');
    const errs = checkTwigClassEmission(mutated, keyIndex).filter((f) => f.level === 'error');
    assert.ok(errs.some((f) => f.rule === 'twig-resolved' && f.message.includes('announcement_style')),
      'a resolved interpolation over a non-follower setting must fail');
  });

  test('a missing family emission fails — the rule is not vacuous', () => {
    const mutated = twigText.replace('hadeel-header-{{ hadeel_resolved.header_layout }}', '');
    const errs = checkTwigClassEmission(mutated, keyIndex).filter((f) => f.level === 'error');
    assert.ok(errs.some((f) => f.rule === 'twig-resolved' && f.where === 'global::header_layout'
      && f.message.includes('no resolved class interpolation')));
  });

  test('a removed marker class fails against the registered family', () => {
    const mutated = twigText.replace('{% if hadeel_engine_on %} hadeel-preset-{{ hadeel_profile }}{% endif %}', '');
    const errs = checkTwigClassEmission(mutated, keyIndex).filter((f) => f.level === 'error');
    assert.ok(errs.some((f) => f.rule === 'twig-preset-marker' && f.where === 'global::preset_profile'));
  });

  test('registry-side marker drift fails the full checker', () => {
    const noMarker = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::preset_profile').class_marker = false;
    }, { documentOnly: false });
    assert.ok(errorsOf(noMarker).some((f) => f.rule === 'twig-preset-marker' && f.where === 'global::preset_profile'),
      'class_marker=false while the template emits the marker class must fail');

    const noPrefix = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::preset_profile').class_prefix = null;
    }, { documentOnly: false });
    assert.ok(errorsOf(noPrefix).some((f) => f.where === 'global::preset_profile'
      && (f.rule === 'twig-preset-marker' || f.rule === 'allowlist')),
      'dropping the marker class_prefix while declaring class_marker must fail');
  });
});

/* ------------ Final Review remediation: FR-001 group ordering ------------ */

describe('FR-001: Basic precedes Advanced within every twilight.json settings group', () => {
  test('the shipped ordering passes the group-order rule, non-vacuously', () => {
    const result = checkSettingsRegistry({ root: ROOT });
    const okLine = result.findings.find((f) => f.rule === 'group-order' && f.level === 'ok');
    assert.ok(okLine, 'the group-order rule must run');
    assert.ok(!errorsOf(result).some((f) => f.rule === 'group-order'));
    const groups = Number(okLine.message.match(/all (\d+) static-delimited/)?.[1]);
    assert.ok(groups >= 6, `expected the real settings groups to be measured (got ${groups})`);
  });

  test('the remediated placements are pinned to the shipped order', () => {
    const ids = loadTwilight().settings.map((s) => s.id);
    const pos = (id) => ids.indexOf(id);
    assert.ok(pos('squar_photo_bg_image_size') > pos('is_more_button_enabled'),
      'advanced squar_photo_bg_image_size closes the general identity group');
    assert.ok(pos('header_density') > pos('enable_more_menu'),
      'advanced header density closes the header group');
    assert.ok(pos('show_tags') < pos('product_add_to_cart_animation'),
      'basic show_tags precedes the advanced animation controls');
    // Registry source paths track the shipped order.
    assert.equal(byKey.get('global::show_tags').source_path, `twilight.json#/settings/${pos('show_tags')}`);
    assert.equal(byKey.get('global::header_density').source_path, `twilight.json#/settings/${pos('header_density')}`);
  });

  test('a basic record ordered after an advanced one fails with the qualified key', () => {
    const result = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::vertical_fixed_products').tier = 'advanced';
    }, { documentOnly: false });
    const errs = errorsOf(result).filter((f) => f.rule === 'group-order');
    assert.ok(errs.some((f) => f.where === 'global::is_more_button_enabled'),
      `basic-after-advanced must fail with the basic record's key, got: ${JSON.stringify(errs.slice(0, 2))}`);
  });

  test('an interactive record tiered structural fails', () => {
    const result = runMutatedChecker((doc) => {
      doc.settings.find((s) => s.key === 'global::show_tags').tier = 'structural';
    }, { documentOnly: false });
    assert.ok(errorsOf(result).some((f) => f.rule === 'group-order' && f.where === 'global::show_tags'));
  });
});

/* ------------ Final Review remediation: FR-001 explicit Presets group ------------ */

describe('FR-001: the Presets group is one explicit titled group (Final Review)', () => {
  const settingsArr = loadTwilight().settings;

  test('shipped twilight.json passes both group rules, non-vacuously', () => {
    const findings = checkSettingsGroups(settingsArr, byKey);
    assert.deepEqual(findings.filter((f) => f.level === 'error'), []);
    assert.ok(findings.some((f) => f.rule === 'group-order' && f.level === 'ok'),
      'the group-order rule must run');
    assert.ok(findings.some((f) => f.rule === 'presets-group' && f.level === 'ok'),
      'the presets-group rule must run');
    // Non-vacuous: the group is really measured — explicit title, exactly the
    // nine engine controls in canonical order, the scope note inside, and the
    // legacy home controls outside before the title.
    const ids = settingsArr.map((s) => s.id);
    const pos = (id) => ids.indexOf(id);
    assert.equal(pos('preset_engine_enabled'), pos('static-presets-title') + 1,
      'the title must open the group immediately before the engine switch');
    assert.deepEqual(
      ids.slice(pos('static-presets-title') + 1, pos('static-line1'))
        .filter((id) => id !== 'static-preset-scope-note'),
      ['preset_engine_enabled', 'preset_profile',
        'layout_width_mode', 'section_spacing_mode', 'corner_style_mode',
        'product_card_style_mode', 'header_layout_mode', 'header_density_mode'],
      'exactly the engine, profile, and six modes in canonical order inside the group',
    );
    assert.ok(
      pos('static-preset-scope-note') > pos('preset_profile')
        && pos('static-preset-scope-note') < pos('layout_width_mode'),
      'the scope note lives inside the group between the selector and the modes',
    );
    assert.ok(pos('squar_photo_bg_image_size') < pos('static-presets-title'),
      'legacy controls stay outside the Presets group');
  });

  test('a description static does not split the group; a title or line static does', () => {
    // Shipped form: the description note sits inside the group and nothing fails.
    assert.ok(!checkSettingsGroups(settingsArr, byKey).some((f) => f.level === 'error'),
      'the shipped description note must not split the Presets group');
    // Flipping the same record to a real boundary format splits the group.
    for (const boundaryFormat of ['title', 'line']) {
      const split = settingsArr.map((s) => (s.id === 'static-preset-scope-note' ? { ...s, format: boundaryFormat } : s));
      const errs = checkSettingsGroups(split, byKey).filter((f) => f.level === 'error');
      assert.ok(errs.some((f) => f.rule === 'presets-group'),
        `a format:${boundaryFormat} record inside the group must split it and fail`);
    }
  });

  test('a legacy control inside the group fails with the expected member list', () => {
    const polluted = [...settingsArr];
    const at = polluted.findIndex((s) => s.id === 'preset_profile');
    polluted.splice(at + 1, 0, { type: 'boolean', id: 'vertical_fixed_products' });
    const errs = checkSettingsGroups(polluted, byKey).filter((f) => f.level === 'error');
    assert.ok(errs.some((f) => f.rule === 'presets-group' && f.expected?.includes('preset_engine_enabled')),
      `an unrelated control inside the group must fail, got: ${JSON.stringify(errs.slice(0, 2))}`);
  });

  test('removing the explicit group title fails — an untitled preset cluster is not a group', () => {
    const noTitle = settingsArr.filter((s) => s.id !== 'static-presets-title');
    const errs = checkSettingsGroups(noTitle, byKey).filter((f) => f.level === 'error');
    assert.ok(errs.some((f) => f.rule === 'presets-group' && f.message.includes('static-presets-title')));
  });

  test('the scope note outside the group fails with its qualified key', () => {
    const note = settingsArr.find((s) => s.id === 'static-preset-scope-note');
    const moved = settingsArr.filter((s) => s.id !== 'static-preset-scope-note');
    moved.splice(moved.findIndex((s) => s.id === 'static-line1') + 1, 0, note);
    const errs = checkSettingsGroups(moved, byKey).filter((f) => f.level === 'error');
    assert.ok(errs.some((f) => f.rule === 'presets-group' && f.where === 'global::static-preset-scope-note'));
  });

  test('a mode control outside the group fails the full checker', () => {
    const moved = settingsArr.filter((s) => s.id !== 'header_density_mode');
    moved.splice(moved.findIndex((s) => s.id === 'static-line1') + 1, 0,
      settingsArr.find((s) => s.id === 'header_density_mode'));
    const errs = checkSettingsGroups(moved, byKey).filter((f) => f.level === 'error');
    assert.ok(errs.some((f) => f.rule === 'presets-group'),
      'a mode control outside the titled group must fail');
  });
});
