/**
 * HDL-03 shared resolution reference and fixture loaders for Node tests.
 *
 * This module is the pure, side-effect-free reference implementation of
 * specs/003-settings-preset-engine/contracts/preset-resolution.md. The Twig
 * resolver (T023+) must reproduce these outcomes exactly; the Node test suites
 * (T018+) compare against them.
 *
 * Node built-ins only. No runtime/theme imports, no network. Resolution never
 * mutates its inputs: a profile switch writes nothing and Custom stores are
 * read-only here, mirroring the server-rendered contract.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const PROFILE_IDS = Object.freeze(['luxury', 'modern', 'minimal', 'practical_digital']);
export const MODES = Object.freeze(['follow_preset', 'custom']);
/** Unknown profile input normalizes to `modern` (approved contract). */
export const FALLBACK_PROFILE = 'modern';
export const RESOLVED_FROM = Object.freeze(['legacy', 'custom', 'preset', 'safe_default']);
export const VALIDATION_STATES = Object.freeze(['valid', 'needs_review']);

const REPO_ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');

/* ---------------------------------------------------------- fixture loaders */

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** Canonical registry (src/config/settings-registry.json). */
export function loadRegistry(root = REPO_ROOT) {
  return readJson(join(root, 'src/config/settings-registry.json'));
}

/** Declared Twilight settings/components (twilight.json). */
export function loadTwilight(root = REPO_ROOT) {
  return readJson(join(root, 'twilight.json'));
}

/** Witness/test fixture by bare name, e.g. loadFixture('valid'). */
export function loadFixture(name, root = REPO_ROOT) {
  return readJson(join(root, 'tests/fixtures/settings-preset-engine', `${name}.json`));
}

/* ------------------------------------------------------------- derived maps */

/** profile id -> profile object, from a registry document. */
export function indexProfiles(registry) {
  return Object.fromEntries(registry.profiles.map((p) => [p.id, p]));
}

/** qualified key -> setting record, from a registry document. */
export function indexSettings(registry) {
  return new Map(registry.settings.map((s) => [s.key, s]));
}

/** The preset-aware follower records (exactly six by contract). */
export function followerSettings(registry) {
  return registry.settings.filter((s) => s.preset_support);
}

/* ----------------------------------------------------------- pure resolver */

/**
 * Resolve one preset-aware setting.
 *
 * @param {object} input
 * @param {boolean} input.engineEnabled  false forces exact legacy resolution
 * @param {string}  input.profileId      raw merchant input; validated here
 * @param {string}  input.mode           raw `follow_preset`/`custom`; validated here
 * @param {*}       input.customValue    stored merchant Custom value; never mutated
 * @param {*}       input.legacyValue    engine-disabled value; never mutated
 * @param {object}  record               registry SettingRecord for the follower
 * @param {object}  profilesById         from indexProfiles()
 * @returns {{resolved_value: *, resolved_from: string, validation_state: string}}
 */
export function resolveSetting(input, record, profilesById) {
  const { engineEnabled, profileId, mode, customValue, legacyValue } = input;
  const allowed = record.allowed_values ?? [];
  const isAllowed = (v) => allowed.includes(v);

  // Contract step 1: engine disabled -> legacy allowlist, else safe default.
  if (!engineEnabled) {
    return isAllowed(legacyValue)
      ? { resolved_value: legacyValue, resolved_from: 'legacy', validation_state: 'valid' }
      : { resolved_value: record.safe_default, resolved_from: 'safe_default', validation_state: 'needs_review' };
  }

  // Contract step 2: validate the profile; unknown input -> modern + review.
  let needsReview = false;
  let profile = profileId;
  if (!PROFILE_IDS.includes(profile)) {
    profile = FALLBACK_PROFILE;
    needsReview = true;
  }

  const customValid = isAllowed(customValue);
  const profileCandidate = () => {
    const v = profilesById[profile]?.owned_values?.[record.id];
    return isAllowed(v) ? { ok: true, value: v } : { ok: false };
  };

  // Contract step 4: valid custom + valid Custom value wins.
  if (mode === 'custom' && customValid) {
    return {
      resolved_value: customValue,
      resolved_from: 'custom',
      validation_state: needsReview ? 'needs_review' : 'valid',
    };
  }

  if (mode === 'custom') {
    // Contract step 5: invalid Custom -> review, then normalized profile.
    needsReview = true;
  } else if (!MODES.includes(mode)) {
    // Contract step 3: unknown mode -> review; preserve a valid Custom first.
    needsReview = true;
    if (customValid) {
      return { resolved_value: customValue, resolved_from: 'custom', validation_state: 'needs_review' };
    }
  }
  // mode === 'follow_preset': contract step 6 falls through to the profile.

  const candidate = profileCandidate();
  if (candidate.ok) {
    return {
      resolved_value: candidate.value,
      resolved_from: 'preset',
      validation_state: needsReview ? 'needs_review' : 'valid',
    };
  }

  // Contract step 7: missing/invalid profile candidate -> safe default + review.
  return { resolved_value: record.safe_default, resolved_from: 'safe_default', validation_state: 'needs_review' };
}

/**
 * Resolve every follower family and the emitted body classes.
 *
 * @param {object} input   { engineEnabled, profileId, modes: {id}, values: {id} }
 *                         `values[id]` is the stored Custom/legacy value for
 *                         follower `id`; `modes[id]` its raw mode.
 * @param {object} registry canonical registry document
 * @returns {{results: object, classes: string[], profile_class: string|null}}
 *   Exactly one class per family; raw input never reaches a class string.
 */
export function resolveBodyClasses(input, registry) {
  const profilesById = indexProfiles(registry);
  const results = {};
  const classes = [];
  for (const record of followerSettings(registry)) {
    const result = resolveSetting({
      engineEnabled: input.engineEnabled,
      profileId: input.profileId,
      mode: input.modes?.[record.id],
      customValue: input.values?.[record.id],
      legacyValue: input.values?.[record.id],
    }, record, profilesById);
    results[record.id] = result;
    if (record.class_prefix) classes.push(`${record.class_prefix}${result.resolved_value}`);
  }
  const profile = PROFILE_IDS.includes(input.profileId) ? input.profileId : FALLBACK_PROFILE;
  return {
    results,
    classes,
    profile_class: input.engineEnabled ? `hadeel-preset-${profile}` : null,
  };
}
