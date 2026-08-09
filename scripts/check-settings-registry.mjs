#!/usr/bin/env node
/**
 * HDL-03 settings registry guard.
 *
 * Validates src/config/settings-registry.json against the approved contract
 * (specs/003-settings-preset-engine/contracts/settings-registry.schema.json)
 * and against the live repository:
 *   1. schema shape (hand-rolled, no dependencies — Node 20 built-ins only)
 *   2. qualified-key uniqueness; raw ids unique within the global scope only
 *   3. recursive twilight.json coverage: every global and component/nested
 *      record exists in the registry with matching type, options, and default
 *   4. owner/source/tier/label metadata present and well formed
 *   5. mode pairing: preset-aware followers declare their future *_mode key
 *   6. profile maps: exactly the four canonical profiles, allowlisted owned
 *      values, and the approved deferred-owner mapping (HDL-24…27)
 *   7. class allowlists: theme-owned class prefixes need an SCSS selector for
 *      every non-base value; non-theme prefixes (framework utilities) need the
 *      compiled class in the committed public/app.css; base variants are
 *      exactly the three approved key→default pairs (contract R-007);
 *      class_marker families are unstyled evidence markers and need no selector
 *   8. Twig interpolation parity: class prefixes and safe defaults match what
 *      the templates actually render — both legacy
 *      `prefix-{{ theme.settings.get('id') }}` interpolations and the HDL-03
 *      resolved `prefix-{{ hadeel_resolved.id }}` emissions (exactly one per
 *      follower, prefix/ID mismatches fail), plus the `hadeel-preset-{{ … }}`
 *      evidence marker class registered on global::preset_profile
 *   9. Twig setting reads: every static theme.settings.get('…') key is
 *      registered as a global record; component-scoped raw ids stay scoped
 *  10. FR-001 settings groups: only `format: title|line` static records are
 *      group boundaries (a `format: description` note never splits a group);
 *      within each group basic records precede advanced records, and the
 *      Presets group is one explicit titled group holding exactly the engine,
 *      profile, scope note, and six mode controls in canonical order
 *
 * Diagnostics: every finding carries the violated rule, the qualified registry
 * key (where), the record's twilight.json source path (source, auto-attached
 * for registered keys), and the expected value where applicable.
 *
 * --strict additionally runs the witness fixtures: the valid fixture must pass
 * and the deliberately invalid fixture must fail. An inverted witness result is
 * itself an error (the checker proves it can still catch defects).
 *
 * Usage:
 *   node scripts/check-settings-registry.mjs            # registry + coverage
 *   node scripts/check-settings-registry.mjs --strict   # + witness fixtures
 *   node scripts/check-settings-registry.mjs --json     # machine-readable
 *   node scripts/check-settings-registry.mjs --registry <path> --document-only
 *
 * This file is also imported by scripts/check-theme.mjs; importing it has no
 * side effects.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import process from 'node:process';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

const REGISTRY_PATH = 'src/config/settings-registry.json';
const TWILIGHT_PATH = 'twilight.json';
const SCHEMA_PATH = 'specs/003-settings-preset-engine/contracts/settings-registry.schema.json';
const FIXTURE_DIR = 'tests/fixtures/settings-preset-engine';

/** The six preset-aware followers fixed by the approved HDL-03 contracts. */
const FOLLOWER_IDS = [
  'layout_width', 'section_spacing', 'corner_style',
  'product_card_style', 'header_layout', 'header_density',
];

/** Canonical profile ids and their approved deferred final-identity owners. */
const PROFILE_IDS = ['luxury', 'modern', 'minimal', 'practical_digital'];
const DEFERRED_IDENTITY_OWNER = {
  luxury: 'HDL-24',
  modern: 'HDL-25',
  minimal: 'HDL-26',
  practical_digital: 'HDL-27',
};

/** Approved base variants: exact qualified key → default implemented by base CSS (R-007). */
const BASE_VARIANTS = new Map([
  ['global::product_card_style', 'minimal'],
  ['global::header_layout', 'centered'],
  ['global::header_density', 'comfortable'],
]);

/** Class prefixes owned by this theme's SCSS (others are framework utilities). */
const THEME_OWNED_PREFIX = (p) => p.startsWith('hadeel-') || p.startsWith('announcement-bar');

/* ------------------------------------------------------------------ helpers */

const read = (p) => readFileSync(p, 'utf8');
const readJson = (p) => JSON.parse(read(p));

function walk(dir, exts) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, exts));
    else if (exts.includes(extname(name))) out.push(full);
  }
  return out;
}

/* ------------------------------------------------- minimal schema validator */

/**
 * Validates the subset of JSON Schema used by the approved contract: type,
 * enum, required, properties, additionalProperties, pattern, minLength,
 * minimum, minItems, maxItems, uniqueItems, minProperties, and local $ref.
 */
function validateSchema(doc, schema, defs, path, errors) {
  if (schema.$ref) {
    const name = schema.$ref.replace('#/$defs/', '');
    return validateSchema(doc, defs[name], defs, path, errors);
  }
  if (schema.enum && !schema.enum.some((e) => isDeepStrictEqual(e, doc))) {
    errors.push(`${path}: value ${JSON.stringify(doc)} is not in the allowed enum`);
    return;
  }
  const t = schema.type;
  if (t) {
    const types = Array.isArray(t) ? t : [t];
    const ok = types.some((one) =>
      one === 'array' ? Array.isArray(doc)
      : one === 'integer' ? Number.isInteger(doc)
      : one === 'null' ? doc === null
      : one === 'object' ? doc !== null && typeof doc === 'object' && !Array.isArray(doc)
      : typeof doc === one);
    if (!ok) {
      errors.push(`${path}: expected type ${types.join('|')}, got ${Array.isArray(doc) ? 'array' : typeof doc}`);
      return;
    }
  }
  if (typeof doc === 'string') {
    if (schema.minLength && doc.length < schema.minLength)
      errors.push(`${path}: string shorter than minLength ${schema.minLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(doc))
      errors.push(`${path}: ${JSON.stringify(doc)} does not match pattern ${schema.pattern}`);
  }
  if (typeof doc === 'number' && schema.minimum !== undefined && doc < schema.minimum)
    errors.push(`${path}: ${doc} below minimum ${schema.minimum}`);
  if (Array.isArray(doc)) {
    if (schema.minItems !== undefined && doc.length < schema.minItems)
      errors.push(`${path}: fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && doc.length > schema.maxItems)
      errors.push(`${path}: more than ${schema.maxItems} items`);
    if (schema.uniqueItems) {
      const seen = new Set(doc.map((v) => JSON.stringify(v)));
      if (seen.size !== doc.length) errors.push(`${path}: items are not unique`);
    }
    if (schema.items) doc.forEach((v, i) => validateSchema(v, schema.items, defs, `${path}[${i}]`, errors));
  }
  if (doc !== null && typeof doc === 'object' && !Array.isArray(doc)) {
    for (const req of schema.required ?? [])
      if (!(req in doc)) errors.push(`${path}: missing required property "${req}"`);
    const props = schema.properties ?? {};
    for (const [k, v] of Object.entries(doc)) {
      if (props[k]) validateSchema(v, props[k], defs, `${path}.${k}`, errors);
      else if (schema.additionalProperties === false)
        errors.push(`${path}: unexpected property "${k}"`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object')
        validateSchema(v, schema.additionalProperties, defs, `${path}.${k}`, errors);
    }
    if (schema.minProperties !== undefined && Object.keys(doc).length < schema.minProperties)
      errors.push(`${path}: fewer than ${schema.minProperties} properties`);
  }
}

/* -------------------------------------------- twilight.json recursive walk */

function twilightDefault(node) {
  if (node.type === 'items') {
    const sel = node.selected;
    if (Array.isArray(sel) && sel.length) return sel[0]?.value ?? null;
    return null;
  }
  if (node.type === 'boolean') {
    if (typeof node.selected === 'boolean') return node.selected;
    if (typeof node.value === 'boolean') return node.value;
    return null;
  }
  if (node.type === 'string' || node.type === 'number') return node.value ?? null;
  return null;
}

function twilightAllowed(node) {
  if (node.type === 'items' && Array.isArray(node.options)) return node.options.map((o) => o.value);
  if (node.type === 'boolean') return [true, false];
  return [];
}

/** Expected records derived from twilight.json: qualified key -> contract fields. */
function twilightRecords(twilight) {
  const out = new Map();
  (twilight.settings ?? []).forEach((s, i) => {
    out.set(`global::${s.id}`, {
      id: s.id, scope: 'global', type: s.type,
      allowed_values: twilightAllowed(s), declared_default: twilightDefault(s),
      source_path: `twilight.json#/settings/${i}`,
    });
  });
  for (const c of twilight.components ?? []) {
    const walkFields = (fields, prefix, parts) => {
      (fields ?? []).forEach((f, fi) => {
        const key = `${c.path}::${prefix ? `${prefix}::` : ''}${f.id}`;
        out.set(key, {
          id: f.id, scope: 'component', type: f.type,
          allowed_values: twilightAllowed(f), declared_default: twilightDefault(f),
          source_path: `twilight.json#/components/${c.path}/fields/${[...parts, fi].join('/fields/')}`,
        });
        if (Array.isArray(f.fields)) walkFields(f.fields, f.id, [...parts, fi]);
      });
    };
    walkFields(c.fields, '', []);
  }
  return out;
}

/* ----------------------------- exported FR-016 twig class emission parity */

/**
 * Validates the class families the templates actually render against the
 * canonical registry (FR-016). Pure and exported so the Node witness tests can
 * prove the parity rules have teeth on mutated templates.
 *
 * @param {string} twig               concatenated template source
 * @param {Map<string, object>} byKey qualified registry key -> record
 * @returns {Array} findings ({ rule, level, message, where, ... })
 */
export function checkTwigClassEmission(twig, byKey) {
  const findings = [];
  const error = (rule, message, where, extra) =>
    findings.push({ rule, level: 'error', message, where, ...(extra ?? {}) });

  /* Resolved interpolations: prefix-{{ hadeel_resolved.<id> }} from the master.twig resolver. */
  const RESOLVED_RE = /([a-z][a-z0-9-]*-)\{\{\s*hadeel_resolved\.([A-Za-z0-9_]+)\s*\}\}/g;
  const emitted = new Map(); // follower id -> emitted prefixes
  let resolvedBad = 0;
  for (const m of twig.matchAll(RESOLVED_RE)) {
    const [, prefix, id] = m;
    const rec = byKey.get(`global::${id}`);
    if (!rec || !rec.preset_support) {
      resolvedBad++;
      error('twig-resolved',
        `resolved class interpolation reads "${id}" which is not a registered preset-aware follower`,
        `${prefix}{hadeel_resolved.${id}}`, { expected: FOLLOWER_IDS.join(', ') });
      continue;
    }
    if (rec.class_prefix !== prefix) {
      resolvedBad++;
      error('twig-resolved',
        `twig renders "${prefix}{hadeel_resolved.${id}}" but registry class_prefix is ${JSON.stringify(rec.class_prefix)}`,
        rec.key, { expected: JSON.stringify(rec.class_prefix) });
    }
    emitted.set(id, [...(emitted.get(id) ?? []), prefix]);
  }
  for (const id of FOLLOWER_IDS) {
    const seen = emitted.get(id) ?? [];
    if (seen.length === 0) {
      resolvedBad++;
      error('twig-resolved',
        `no resolved class interpolation for follower "${id}" — an emitted family would be unrepresented`,
        `global::${id}`,
        { expected: `${byKey.get(`global::${id}`)?.class_prefix ?? ''}{{ hadeel_resolved.${id} }}` });
    } else if (seen.length > 1) {
      resolvedBad++;
      error('twig-resolved',
        `follower "${id}" is emitted ${seen.length} times — exactly one class per family`,
        `global::${id}`);
    }
  }
  if (!resolvedBad) findings.push({ rule: 'twig-resolved', level: 'ok',
    message: `all ${FOLLOWER_IDS.length} resolved class interpolations emit exactly one registered prefix; prefix/ID mismatches fail` });

  /* Preset marker class: hadeel-preset-{{ hadeel_profile }} (engine-on evidence). */
  const markerCount = [...twig.matchAll(/hadeel-preset-\{\{\s*hadeel_profile\s*\}\}/g)].length;
  const markerRec = byKey.get('global::preset_profile');
  let markerBad = 0;
  if (markerRec?.class_prefix === 'hadeel-preset-' && markerCount === 0) {
    markerBad++;
    error('twig-preset-marker',
      'registry declares the hadeel-preset- marker family but no template emits it',
      'global::preset_profile', { expected: 'hadeel-preset-{{ hadeel_profile }}' });
  }
  if (markerCount > 1) {
    markerBad++;
    error('twig-preset-marker',
      `preset marker class is emitted ${markerCount} times — exactly one is allowed`,
      'global::preset_profile');
  }
  if (markerCount >= 1) {
    if (markerRec?.class_prefix !== 'hadeel-preset-') {
      markerBad++;
      error('twig-preset-marker',
        'twig emits hadeel-preset-{{ hadeel_profile }} but global::preset_profile declares no such class_prefix',
        'global::preset_profile', { expected: '"hadeel-preset-"' });
    } else if (markerRec.class_marker !== true) {
      markerBad++;
      error('twig-preset-marker',
        'the hadeel-preset- family is an unstyled evidence marker and must declare class_marker: true',
        'global::preset_profile', { expected: 'class_marker: true' });
    }
  }
  if (!markerBad) findings.push({ rule: 'twig-preset-marker', level: 'ok',
    message: 'hadeel-preset-{{ hadeel_profile }} is emitted exactly once and registered on global::preset_profile (class_marker)' });

  return findings;
}

/* -------------------------------- exported FR-001 settings-group checks */

/** The Presets group's interactive members in canonical order (FR-001). */
const PRESETS_GROUP_MEMBERS = [
  'preset_engine_enabled', 'preset_profile',
  'layout_width_mode', 'section_spacing_mode', 'corner_style_mode',
  'product_card_style_mode', 'header_layout_mode', 'header_density_mode',
];
const PRESETS_GROUP_TITLE = 'static-presets-title';
const PRESETS_GROUP_NOTE = 'static-preset-scope-note';

/**
 * Validates the twilight.json settings grouping (FR-001). Pure and exported so
 * the Node witness tests can prove the boundary semantics and the Presets-group
 * rule on mutated setting lists.
 *
 * Boundary semantics: only static records with `format: "title"` or
 * `format: "line"` open a new visual group in the Salla settings panel; a
 * `format: "description"` static is an inline note and must never split a group.
 *
 * @param {Array} twilightSettings    the twilight.json settings array
 * @param {Map<string, object>} byKey qualified registry key -> record
 * @returns {Array} findings ({ rule, level, message, where, ... })
 */
export function checkSettingsGroups(twilightSettings, byKey) {
  const findings = [];
  const error = (rule, message, where, extra) =>
    findings.push({ rule, level: 'error', message, where, ...(extra ?? {}) });

  const isBoundary = (s) => s.type === 'static' && (s.format === 'title' || s.format === 'line');

  const segments = [];
  let current = { boundary: null, members: [], notes: [] };
  for (const s of twilightSettings ?? []) {
    if (isBoundary(s)) {
      segments.push(current);
      current = { boundary: s, members: [], notes: [] };
    } else if (s.type === 'static') {
      current.notes.push(s.id); // inline explanatory note: visible, non-splitting
    } else {
      current.members.push(s.id);
    }
  }
  segments.push(current);

  /* group-order: basic before advanced within each boundary-delimited group */
  let groupBad = 0;
  let groupCount = 0;
  for (const seg of segments) {
    if (!seg.members.length) continue;
    groupCount++;
    let advancedSeen = null;
    for (const id of seg.members) {
      const rec = byKey.get(`global::${id}`);
      if (!rec) continue; // the coverage rule reports the missing record
      if (rec.tier !== 'basic' && rec.tier !== 'advanced') {
        groupBad++;
        error('group-order', `interactive record is tiered "${rec.tier}" — only static records are structural`, rec.key, { expected: 'basic|advanced' });
        continue;
      }
      if (rec.tier === 'basic' && advancedSeen) {
        groupBad++;
        error('group-order', `basic setting appears after advanced "${advancedSeen}" inside the same settings group (FR-001)`, rec.key, { expected: 'all basic records before advanced records' });
      }
      if (rec.tier === 'advanced' && !advancedSeen) advancedSeen = id;
    }
  }
  if (!groupBad) findings.push({ rule: 'group-order', level: 'ok',
    message: `basic records precede advanced records within all ${groupCount} static-delimited settings groups (FR-001)` });

  /* presets-group: one explicit titled group for the nine engine controls */
  let pgBad = 0;
  const seg = segments.find((sg) => sg.members.includes('preset_engine_enabled'));
  if (!seg) {
    pgBad++;
    error('presets-group', 'preset engine controls are missing from twilight.json', 'global::preset_engine_enabled');
  } else {
    if (!seg.boundary || seg.boundary.format !== 'title' || seg.boundary.id !== PRESETS_GROUP_TITLE) {
      pgBad++;
      error('presets-group',
        `the Presets group must open with the explicit static title record "${PRESETS_GROUP_TITLE}"`,
        'global::preset_engine_enabled',
        { expected: `a static record { "format": "title", "id": "${PRESETS_GROUP_TITLE}" } immediately before preset_engine_enabled` });
    }
    if (JSON.stringify(seg.members) !== JSON.stringify(PRESETS_GROUP_MEMBERS)) {
      pgBad++;
      error('presets-group',
        `the Presets group must contain exactly the engine, profile, and six mode controls in canonical order — got: ${seg.members.join(', ') || '(none)'}`,
        'global::preset_engine_enabled', { expected: PRESETS_GROUP_MEMBERS.join(', ') });
    }
    if (!seg.notes.includes(PRESETS_GROUP_NOTE)) {
      pgBad++;
      error('presets-group',
        `the explanatory note "${PRESETS_GROUP_NOTE}" must live inside the Presets group (a description static never splits a group)`,
        `global::${PRESETS_GROUP_NOTE}`);
    }
  }
  if (!pgBad) findings.push({ rule: 'presets-group', level: 'ok',
    message: `the Presets group is one explicit titled group: engine, profile, scope note, and ${PRESETS_GROUP_MEMBERS.length - 2} modes (basic before advanced); no legacy control inside` });

  return findings;
}

/* ------------------------------------------------------------- the checker */

/**
 * @param {object} opts
 * @param {string} opts.root          repository root
 * @param {boolean} [opts.strict]     also run the witness fixtures
 * @param {string} [opts.registryPath] override the registry document path
 * @param {boolean} [opts.documentOnly] skip twilight/twig/scss coverage
 * @returns {{findings: Array, stats: object}}
 */
export function checkSettingsRegistry({ root = ROOT, strict = false, registryPath = null, documentOnly = false } = {}) {
  const findings = [];
  const note = (rule, level, message, where, extra) =>
    findings.push({ rule, level, message, where, ...(extra ?? {}) });
  const error = (rule, message, where, extra) => note(rule, 'error', message, where, extra);

  /** qualified key -> record; also used to auto-attach source paths to findings. */
  const byKey = new Map();

  const schema = readJson(join(root, SCHEMA_PATH));
  const registry = readJson(registryPath ?? join(root, REGISTRY_PATH));

  /* 1 — schema shape */
  const schemaErrors = [];
  validateSchema(registry, schema, schema.$defs ?? {}, '$', schemaErrors);
  for (const e of schemaErrors) error('schema', e, registryPath ?? REGISTRY_PATH);
  if (!schemaErrors.length) note('schema', 'ok', 'registry document conforms to the approved schema');
  const stats = {
    schema_errors: schemaErrors.length,
    globals: 0, components: 0, profiles: 0,
    twilight_globals: null, twilight_components: null,
  };
  if (schemaErrors.length) return finish();

  const settings = registry.settings;
  stats.globals = settings.filter((s) => s.scope === 'global').length;
  stats.components = settings.filter((s) => s.scope === 'component').length;
  stats.profiles = registry.profiles.length;

  /* 2 — qualified uniqueness + raw id uniqueness within global scope */
  let dupes = 0;
  const globalIds = new Map();
  for (const s of settings) {
    if (byKey.has(s.key)) { dupes++; error('uniqueness', `duplicate qualified key "${s.key}"`, s.key); }
    byKey.set(s.key, s);
    if (s.scope === 'global') {
      if (globalIds.has(s.id)) { dupes++; error('uniqueness', `raw id "${s.id}" declared twice in the global scope`, s.key); }
      globalIds.set(s.id, s.key);
    }
  }
  if (!dupes) note('uniqueness', 'ok', 'qualified keys are unique; raw ids are unique within the global scope');

  /* 3 — metadata: owner pattern and resolvable source path */
  let metaBad = 0;
  for (const s of settings) {
    if (!/^HDL-[0-9]{2}$/.test(s.owner_spec)) { metaBad++; error('metadata', `owner_spec "${s.owner_spec}" is not an HDL-NN id`, s.key, { expected: 'HDL-NN' }); }
    if (!s.source_path.startsWith('twilight.json#/')) { metaBad++; error('metadata', `source_path "${s.source_path}" does not point into twilight.json`, s.key, { expected: 'twilight.json#/…' }); }
  }
  if (!metaBad) note('metadata', 'ok', 'every record has an HDL-NN owner and a twilight.json source path');

  /* 4 — mode pairing */
  let modeBad = 0;
  const followers = settings.filter((s) => s.preset_support);
  for (const s of settings) {
    if (s.preset_support) {
      if (!s.override_support) { modeBad++; error('mode-pairing', 'preset_support=true requires override_support=true', s.key); }
      if (s.mode_setting !== `global::${s.id}_mode`) { modeBad++; error('mode-pairing', `mode_setting must be "global::${s.id}_mode"`, s.key, { expected: `global::${s.id}_mode` }); }
      if (s.scope !== 'global') { modeBad++; error('mode-pairing', 'only global settings may be preset-aware', s.key); }
    } else {
      if (s.override_support) { modeBad++; error('mode-pairing', 'override_support=true without preset_support', s.key); }
      if (s.mode_setting !== null) { modeBad++; error('mode-pairing', 'mode_setting must be null for non-followers', s.key); }
    }
  }
  const followerIds = followers.map((s) => s.id).sort();
  if (JSON.stringify(followerIds) !== JSON.stringify([...FOLLOWER_IDS].sort())) {
    modeBad++;
    error('mode-pairing', `preset-aware followers must be exactly ${FOLLOWER_IDS.join(', ')}`, `got: ${followerIds.join(', ') || '(none)'}`, { expected: FOLLOWER_IDS.join(', ') });
  }
  if (!modeBad) note('mode-pairing', 'ok', `six followers pair with their future *_mode keys; everything else is explicitly non-preset`);

  /* 5 — profiles */
  let profileBad = 0;
  const seenProfiles = new Set();
  for (const p of registry.profiles) {
    if (seenProfiles.has(p.id)) { profileBad++; error('profiles', `duplicate profile id "${p.id}"`, `profiles.${p.id}`); }
    seenProfiles.add(p.id);
    for (const [settingId, value] of Object.entries(p.owned_values)) {
      const rec = byKey.get(`global::${settingId}`);
      if (!rec) { profileBad++; error('profiles', `profile "${p.id}" owns unknown setting "${settingId}"`, `profiles.${p.id}`); continue; }
      if (!rec.preset_support) { profileBad++; error('profiles', `profile "${p.id}" owns "${settingId}" which is not preset-aware`, `profiles.${p.id}`); }
      if (rec.allowed_values.length && !rec.allowed_values.includes(value))
        { profileBad++; error('profiles', `profile "${p.id}" value ${JSON.stringify(value)} is not allowlisted for "${settingId}"`, `profiles.${p.id}`, { expected: JSON.stringify(rec.allowed_values) }); }
    }
    const expectedOwner = DEFERRED_IDENTITY_OWNER[p.id];
    if (expectedOwner && p.deferred_values.final_visual_identity !== expectedOwner) {
      profileBad++;
      error('profiles', `profile "${p.id}" must defer final_visual_identity to ${expectedOwner}`,
        `got: ${JSON.stringify(p.deferred_values.final_visual_identity)}`, { expected: expectedOwner });
    }
  }
  for (const id of PROFILE_IDS)
    if (!seenProfiles.has(id)) { profileBad++; error('profiles', `missing canonical profile "${id}"`, 'profiles'); }
  if (!profileBad) note('profiles', 'ok', 'four canonical profiles own allowlisted values and defer identity to HDL-24…27');

  /* 6 — class allowlists and base variants */
  let classBad = 0;
  const scss = documentOnly ? '' : walk(join(root, 'src/assets/styles'), ['.scss']).map(read).join('\n');
  // Compiled production CSS: evidence that framework-utility prefixes (e.g.
  // object-) actually produce the classes the templates may render.
  const compiledCss = documentOnly ? '' : read(join(root, 'public/app.css'));
  for (const s of settings) {
    const approvedBase = BASE_VARIANTS.get(s.key);
    if (s.base_variant) {
      if (!approvedBase) {
        classBad++;
        error('base-variant', 'base_variant=true is only approved for the three contract R-007 records', s.key);
      } else if (s.declared_default !== approvedBase) {
        classBad++;
        error('base-variant', `base_variant=true requires declared_default "${approvedBase}"`, s.key, { expected: approvedBase });
      }
    } else if (approvedBase) {
      classBad++;
      error('base-variant', `contract R-007 requires base_variant=true (default "${approvedBase}" is implemented by base CSS)`, s.key, { expected: 'base_variant: true' });
    }
    if (s.class_marker === true && !s.class_prefix) {
      classBad++;
      error('allowlist', 'class_marker=true requires a class_prefix', s.key);
    }
    if (!s.class_prefix) continue;
    if (s.type !== 'items' || !s.allowed_values.length) {
      classBad++;
      error('allowlist', `class_prefix "${s.class_prefix}" requires an items setting with a non-empty allowlist`, s.key);
      continue;
    }
    if (!s.allowed_values.includes(s.safe_default)) {
      classBad++;
      error('allowlist', `safe_default ${JSON.stringify(s.safe_default)} is not allowlisted`, s.key);
    }
    // class_marker families are unstyled evidence markers (contract: no selector required).
    if (!documentOnly && s.class_marker !== true) {
      const themeOwned = THEME_OWNED_PREFIX(s.class_prefix);
      for (const value of s.allowed_values) {
        if (s.base_variant && value === s.declared_default) continue; // base CSS implements it
        const cls = `${s.class_prefix}${value}`;
        if (themeOwned) {
          if (!scss.includes(`.${cls}`)) {
            classBad++;
            error('allowlist', `no SCSS selector ".${cls}" for a rendered class value`, s.key, { expected: `.${cls}` });
          }
        } else if (!new RegExp(`\\.${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s,{.:>#\\[]|$)`).test(compiledCss)) {
          classBad++;
          error('allowlist', `no compiled class ".${cls}" in committed public/app.css for a rendered class value`, s.key, { expected: `.${cls}` });
        }
      }
    }
  }
  // safe_default validity for every enumerable record, class-producing or not
  for (const s of settings) {
    if (s.allowed_values.length && s.safe_default !== null && !s.allowed_values.includes(s.safe_default)) {
      classBad++;
      error('allowlist', `safe_default ${JSON.stringify(s.safe_default)} is outside allowed_values`, s.key, { expected: JSON.stringify(s.allowed_values) });
    }
  }
  if (!classBad) note('allowlist', 'ok', 'class values are allowlisted; non-base variants have SCSS selectors or compiled CSS mappings; marker families need none; safe defaults are valid');

  /* 7 — coverage: recursive twilight.json parity */
  if (!documentOnly) {
    const twilightDoc = readJson(join(root, TWILIGHT_PATH));
    const expected = twilightRecords(twilightDoc);
    stats.twilight_globals = [...expected.values()].filter((r) => r.scope === 'global').length;
    stats.twilight_components = expected.size - stats.twilight_globals;
    let covBad = 0;
    for (const [key, exp] of expected) {
      const rec = byKey.get(key);
      if (!rec) { covBad++; error('coverage', 'twilight.json record is missing from the registry', key); continue; }
      if (rec.type !== exp.type) { covBad++; error('coverage', `type drift: registry "${rec.type}" vs twilight "${exp.type}"`, key, { expected: exp.type }); }
      if (JSON.stringify(rec.allowed_values) !== JSON.stringify(exp.allowed_values))
        { covBad++; error('coverage', `allowed_values drift: registry ${JSON.stringify(rec.allowed_values)} vs twilight ${JSON.stringify(exp.allowed_values)}`, key, { expected: JSON.stringify(exp.allowed_values) }); }
      if (!isDeepStrictEqual(rec.declared_default, exp.declared_default))
        { covBad++; error('coverage', `declared_default drift: registry ${JSON.stringify(rec.declared_default)} vs twilight ${JSON.stringify(exp.declared_default)}`, key, { expected: JSON.stringify(exp.declared_default) }); }
      if (rec.source_path !== exp.source_path)
        { covBad++; error('coverage', `source_path drift: registry "${rec.source_path}" vs expected "${exp.source_path}"`, key, { expected: exp.source_path }); }
    }
    for (const key of byKey.keys())
      if (!expected.has(key)) { covBad++; error('coverage', 'registry record has no twilight.json source', key); }
    if (!covBad) note('coverage', 'ok',
      `registry matches twilight.json recursively (${stats.twilight_globals} globals, ${stats.twilight_components} component/nested records)`);

    /* 7b — FR-001 settings groups: boundary semantics, order, explicit Presets group */
    for (const f of checkSettingsGroups(twilightDoc.settings, byKey)) findings.push(f);

    /* 8 — twig interpolation parity */
    const twig = walk(join(root, 'src/views'), ['.twig']).map(read).join('\n');
    const CLASS_RE = /([a-z][a-z0-9-]*-)\{\{\s*theme\.settings\.get\('([A-Za-z0-9_]+)'(?:\s*,\s*'([^']*)')?\s*\)\s*\}\}/g;
    let twigBad = 0;
    const seenInterp = new Set();
    for (const m of twig.matchAll(CLASS_RE)) {
      const [, prefix, id, fallback] = m;
      const sig = `${prefix}|${id}|${fallback ?? ''}`;
      if (seenInterp.has(sig)) continue;
      seenInterp.add(sig);
      const rec = byKey.get(`global::${id}`);
      if (!rec) { twigBad++; error('twig-parity', `class interpolation reads unregistered setting "${id}"`, `${prefix}{${id}}`); continue; }
      if (rec.class_prefix !== prefix) {
        twigBad++;
        error('twig-parity', `twig renders "${prefix}{${id}}" but registry class_prefix is ${JSON.stringify(rec.class_prefix)}`, rec.key, { expected: JSON.stringify(rec.class_prefix) });
      }
      if (fallback !== undefined && rec.safe_default !== fallback) {
        twigBad++;
        error('twig-parity', `twig fallback "${fallback}" disagrees with registry safe_default ${JSON.stringify(rec.safe_default)}`, rec.key, { expected: JSON.stringify(rec.safe_default) });
      }
    }
    if (!twigBad) note('twig-parity', 'ok', 'every twig class interpolation matches a registered prefix and safe default');

    /* 8c — resolved-class + preset-marker emission parity (FR-016) */
    for (const f of checkTwigClassEmission(twig, byKey)) findings.push(f);

    /* 8b — twig setting reads: every static theme.settings.get key is registered */
    const GET_RE = /theme\.settings\.get\(\s*'([A-Za-z0-9_]+)'/g;
    const readKeys = new Map(); // setting id -> first template that reads it
    for (const f of walk(join(root, 'src/views'), ['.twig'])) {
      // Twig comments stripped so documentation examples are not read as usage.
      const text = read(f).replace(/\{#[\s\S]*?#\}/g, '');
      for (const m of text.matchAll(GET_RE)) if (!readKeys.has(m[1])) readKeys.set(m[1], f);
    }
    let getBad = 0;
    for (const [id, file] of readKeys) {
      const key = `global::${id}`;
      if (!byKey.has(key)) {
        getBad++;
        error('twig-settings',
          `theme.settings.get('${id}') has no registered global record — a component-scoped raw id stays scoped and never satisfies a global read`,
          key, { source: relative(root, file), expected: `global::${id}` });
      }
    }
    if (!getBad) note('twig-settings', 'ok',
      `every theme.settings.get global key is declared in twilight.json and registered (${readKeys.size} keys read); component raw ids remain scoped`);
  }

  /* 9 — strict witness fixtures */
  if (strict) {
    const valid = checkDocumentOnly(join(root, FIXTURE_DIR, 'valid.json'), schema);
    if (valid.length) {
      for (const e of valid) error('witness', `valid fixture rejected: ${e}`, `${FIXTURE_DIR}/valid.json`);
    } else {
      note('witness', 'ok', 'valid fixture passes document validation');
    }
    const invalid = checkDocumentOnly(join(root, FIXTURE_DIR, 'invalid.json'), schema);
    if (!invalid.length) {
      error('witness', 'invalid fixture was NOT rejected — the checker can no longer prove it catches defects', `${FIXTURE_DIR}/invalid.json`);
    } else {
      note('witness', 'ok', `invalid fixture fails with ${invalid.length} error(s) as required`);
    }
  }

  function checkDocumentOnly(path, schemaDoc) {
    const doc = readJson(path);
    const errs = [];
    validateSchema(doc, schemaDoc, schemaDoc.$defs ?? {}, '$', errs);
    if (errs.length) return errs;
    // Re-run the document-level rules against the fixture.
    const sub = checkSettingsRegistry({ root, registryPath: path, documentOnly: true });
    return sub.findings.filter((f) => f.level === 'error').map((f) => `${f.rule}: ${f.message} (${f.where ?? ''})`);
  }

  function finish() {
    // Diagnostics: auto-attach the twilight.json source path for findings whose
    // `where` is a registered qualified key.
    for (const f of findings) {
      if (f.source === undefined && typeof f.where === 'string' && byKey.has(f.where)) {
        f.source = byKey.get(f.where).source_path;
      }
    }
    return {
      findings,
      stats,
      errors: findings.filter((f) => f.level === 'error').length,
    };
  }
  return finish();
}

/* -------------------------------------------------------------------- CLI */

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const asJson = argv.includes('--json');
  const documentOnly = argv.includes('--document-only');
  const regIdx = argv.indexOf('--registry');
  const registryPath = regIdx >= 0 ? argv[regIdx + 1] : null;

  const { findings, stats, errors } = checkSettingsRegistry({
    root: ROOT, strict, registryPath, documentOnly,
  });

  if (asJson) {
    console.log(JSON.stringify({ errors, stats, findings }, null, 2));
  } else {
    const icon = { ok: '  ok  ', warn: ' warn ', error: 'FAILED' };
    let current = '';
    for (const f of findings) {
      if (f.rule !== current) { current = f.rule; console.log(`\n[${current}]`); }
      console.log(`  ${icon[f.level]} ${f.message}${f.where ? `\n         ${f.where}` : ''}${f.source ? `\n         source: ${f.source}` : ''}${f.expected !== undefined ? `\n         expected: ${f.expected}` : ''}`);
    }
    console.log(`\nregistry: ${stats.globals} global + ${stats.components} component/nested records, ${stats.profiles} profiles`);
    console.log(`${errors} error(s)`);
    if (!strict) console.log('note: witness fixtures not checked — rerun with --strict');
  }
  process.exit(errors ? 1 : 0);
}
