/**
 * HDL-07 header foundation — pure contract resolution for Node tests.
 *
 * This module is the side-effect-free reference for
 * specs/007-header-layouts/contracts/header-layout-contract.md §1 and §5.
 * The inline resolver in src/views/layouts/master.twig (T014) must reproduce
 * these outcomes exactly; tests/header-layouts.test.mjs pins the parity.
 *
 * Resolution discipline mirrors the HDL-03 resolver: strict string allowlists
 * (raw booleans, numbers, arrays, empty/whitespace-padded strings, and raw
 * CSS/HTML never reach a class or attribute), enrolled-shape booleans
 * (true/'true'/1/'1'), and fail-closed fallbacks. Inputs are never mutated.
 *
 * Node built-ins only. No runtime/theme imports, no network.
 */

import { loadRegistry, loadTwilight } from './settings-preset-engine.mjs';

export { loadRegistry, loadTwilight };

/* --------------------------------------------------- contract allowlists */

/** The four approved header layouts; centered|start keep their legacy meaning. */
export const HEADER_LAYOUTS = Object.freeze(['centered', 'start', 'transparent', 'commerce']);
/** Logo-size control (advanced); medium preserves the pre-HDL-07 rendering. */
export const HEADER_LOGO_SIZES = Object.freeze(['small', 'medium', 'large']);
/** Transparent ink control (advanced); auto fails to the normal surface when uncertain. */
export const HEADER_TRANSPARENT_INKS = Object.freeze(['auto', 'light', 'dark']);

export const SAFE_HEADER_LAYOUT = 'centered';
export const SAFE_HEADER_LOGO_SIZE = 'medium';
export const SAFE_HEADER_INK = 'auto';

/** The seven new HDL-07 global settings (menu/cart visibility added by the T023 blocker fix). */
export const NEW_SETTING_IDS = Object.freeze([
  'header_transparent_home',
  'header_show_search',
  'header_show_account',
  'header_show_menu',
  'header_show_cart',
  'header_logo_size',
  'header_transparent_ink',
]);

/* ------------------------------------------------------- pure resolution */

/**
 * Strict string-allowlist resolution (mirrors the master.twig guards: the
 * iterable/type check plus self-cast identity reject arrays, booleans, and
 * numbers before the allowlist membership test; unknown → fallback).
 */
export function resolveAllowlisted(raw, allowed, fallback) {
  return typeof raw === 'string' && allowed.includes(raw) ? raw : fallback;
}

/**
 * Enrolled-shape boolean resolution (mirrors the master.twig pattern used for
 * motion_reduce_mobile): only true/'true'/1/'1' enable; unset falls back to
 * the declared default first, and any other garbage fails closed to false.
 */
export function resolveHeaderBoolean(raw, declaredDefault = true) {
  const value = raw === undefined || raw === null ? declaredDefault : raw;
  return value === true || value === 'true' || value === 1 || value === '1';
}

/**
 * Resolve the full HDL-07 header foundation from raw merchant settings.
 *
 * @param {object} raw  raw values as theme.settings.get would return them
 * @returns {{layout: string, logo_size: string, ink: string,
 *   transparent_home: boolean, classes: string[], attributes: object}}
 *   Exactly one layout class and one logo-size class; the ink is a data
 *   attribute, never a class; raw input never reaches either.
 */
export function resolveHeaderFoundation(raw = {}) {
  const layout = resolveAllowlisted(raw.header_layout, HEADER_LAYOUTS, SAFE_HEADER_LAYOUT);
  const logoSize = resolveAllowlisted(raw.header_logo_size, HEADER_LOGO_SIZES, SAFE_HEADER_LOGO_SIZE);
  const ink = resolveAllowlisted(raw.header_transparent_ink, HEADER_TRANSPARENT_INKS, SAFE_HEADER_INK);
  const transparentHome = resolveHeaderBoolean(raw.header_transparent_home, true);
  return {
    layout,
    logo_size: logoSize,
    ink,
    transparent_home: transparentHome,
    classes: [`hadeel-header-${layout}`, `hadeel-header-logo-${logoSize}`],
    attributes: {
      'data-hadeel-header-ink': ink,
      ...(transparentHome ? { 'data-hadeel-header-transparent-home': 'true' } : {}),
    },
  };
}

/* --------------------------------------------------------- twilight views */

/** A global twilight.json settings entry by id (or null). */
export function twilightSetting(twilight, id) {
  return (twilight.settings ?? []).find((s) => s.id === id) ?? null;
}

/** Option values of an items setting, in declared order. */
export function twilightOptionValues(entry) {
  return Array.isArray(entry?.options) ? entry.options.map((o) => o.value) : [];
}

/** Declared default of a twilight setting (items → selected[0], boolean → selected/value). */
export function twilightDefault(entry) {
  if (!entry) return null;
  if (entry.type === 'items') return entry.selected?.[0]?.value ?? null;
  if (entry.type === 'boolean') {
    if (typeof entry.selected === 'boolean') return entry.selected;
    if (typeof entry.value === 'boolean') return entry.value;
  }
  return null;
}
