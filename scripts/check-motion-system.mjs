#!/usr/bin/env node
/**
 * HDL-06 motion contract guard.
 *
 * Makes specs/006-motion-system/contracts/motion-contract.md executable:
 *   1. motion-settings    — twilight.json declares motion_level (calm/balanced/rich,
 *      default balanced) and motion_reduce_mobile (boolean, default true); both
 *      legacy product settings keep their exact IDs/types/options/defaults; the
 *      registry records all four with HDL-06 ownership and bilingual labels
 *   2. motion-resolver    — master.twig resolves the level against an allowlist
 *      with a balanced fallback and never interpolates a raw merchant value
 *      into a class
 *   3. motion-tokens      — 01-settings/motion.scss owns the semantic duration/
 *      easing/distance/stagger tokens, the three level profiles within their
 *      caps, the OS reduced override, and the mobile Rich cap; app.scss imports
 *      it in the settings layer
 *   4. motion-no-timer    — no recurring CTA timer: no setInterval in
 *      product.js, no animation-interval data attribute anywhere
 *   5. motion-no-anime    — no runtime animejs import, no window.anime global,
 *      no anime( call, and the partials/anime.js wrapper is gone
 *   6. motion-reveal      — data-hadeel-reveal opt-ins only in the approved
 *      noncritical Home components; never in product/cart/search templates;
 *      no SCSS hidden base state for reveal targets
 *   7. motion-timing      — raw time/timing-function literals in transition/
 *      animation declarations (outside @keyframes and the token owner),
 *      including literals hidden inside var() fallbacks, exist only as named
 *      functional exceptions documented below
 *   8. motion-utility     — no Tailwind motion utilities (transition,
 *      transition-*, duration-*, delay-*, ease-*, animate-*) in theme SCSS
 *      @apply bodies, Twig class attributes, or JS class strings: they compile
 *      raw default timing. Motion is declared with var(--motion-*) tokens in
 *      the owning stylesheet instead
 *   9. motion-scroll      — scroll-behavior: smooth is gated behind
 *      prefers-reduced-motion: no-preference
 *  10. motion-direction   — the token owner defines no physical-direction
 *      motion (translateX/left/right); reveal motion is non-directional so
 *      RTL/LTR stay identical
 *  11. motion-controller  — partials/motion.js is the shared progressive-
 *      enhancement controller (one-shot unobserve, MediaQueryList change
 *      handling, cancel-to-final-state) and app.js initializes it without a
 *      new entry
 *
 * Diagnostics: every finding carries the violated rule, the file, and the
 * expected value where applicable.
 *
 * Phase gating: every rule is tagged with the earliest HDL-06 phase that
 * enforces it (MOTION_RULE_PHASE). The active phase (MOTION_PHASE_ACTIVE = 2)
 * is what the default CLI, --strict, and the check-theme.mjs integration
 * enforce: the Phase A foundation (settings, resolver, tokens, reveal
 * confinement, smooth-scroll gating, direction) plus the phase 2 runtime-
 * adoption rules (the recurring-timer and Anime bans on the real sources,
 * raw-timing tokenization, the shared JS controller). T021 promoted phase 2
 * only after --full reported zero errors. --full predates the promotion and
 * now selects the same rule set as the default. Promoting a phase is a
 * deliberate one-line change with its own evidence, never a silent edit.
 *
 * Usage:
 *   node scripts/check-motion-system.mjs            # active-phase contract checks
 *   node scripts/check-motion-system.mjs --strict   # same checks, strict alias
 *   node scripts/check-motion-system.mjs --full     # same rule set (pre-promotion alias)
 *   node scripts/check-motion-system.mjs --json     # machine-readable
 *
 * This file is also imported by scripts/check-theme.mjs and by
 * tests/motion-system.test.mjs; importing it has no side effects.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

const TWILIGHT_PATH = 'twilight.json';
const REGISTRY_PATH = 'src/config/settings-registry.json';
const MASTER_TWIG = 'src/views/layouts/master.twig';
const APP_SCSS = 'src/assets/styles/app.scss';
const MOTION_SCSS = 'src/assets/styles/01-settings/motion.scss';
const APP_JS = 'src/assets/js/app.js';
const PRODUCT_JS = 'src/assets/js/product.js';
const BLOG_JS = 'src/assets/js/blog.js';
const MOTION_JS = 'src/assets/js/partials/motion.js';
const ANIME_JS = 'src/assets/js/partials/anime.js';
const STYLES_DIR = 'src/assets/styles';
const VIEWS_DIR = 'src/views';
const JS_DIR = 'src/assets/js';

/** The only allowed motion_level values; unknown resolves to balanced. */
export const MOTION_LEVELS = ['calm', 'balanced', 'rich'];
export const MOTION_DEFAULT_LEVEL = 'balanced';

/** Noncontinuous duration caps per profile (ms), from the approved contract. */
export const PROFILE_CAPS = { calm: 160, balanced: 240, rich: 400, reduced: 100 };

/** Reveal distance caps per profile (px). */
export const REVEAL_DISTANCE_CAPS = { calm: 0, balanced: 8, rich: 20 };

/** Semantic tokens the contract requires the token owner to define. */
export const REQUIRED_TOKENS = [
  '--motion-duration-feedback',
  '--motion-duration-ui',
  '--motion-duration-reveal',
  '--motion-stagger',
  '--motion-easing-standard',
  '--motion-easing-exit',
  '--motion-easing-emphasized',
  '--motion-distance-sm',
  '--motion-distance-md',
  '--motion-distance-lg',
  '--motion-duration-reduced',
  '--motion-distance-reduced',
];

/** Home components approved for explicit noncritical reveal opt-in (FR-017). */
export const REVEAL_ALLOWLIST = [
  'src/views/components/home/fixed-banner.twig',
  'src/views/components/home/brands.twig',
  'src/views/components/home/custom-testimonials.twig',
];

/**
 * Rule → earliest HDL-06 phase that enforces it. Both phases are active:
 * T021 promoted MOTION_PHASE_ACTIVE to 2 after the raw-timing migration
 * landed and --full reported zero errors, so the default CLI, --strict, and
 * check-theme.mjs enforce every rule below.
 */
export const MOTION_RULE_PHASE = {
  'motion-settings': 1,
  'motion-resolver': 1,
  'motion-tokens': 1,
  'motion-no-timer': 2,
  'motion-no-anime': 2,
  'motion-reveal': 1,
  'motion-timing': 2,
  'motion-utility': 2,
  'motion-scroll': 1,
  'motion-direction': 1,
  'motion-controller': 2,
};

/** The phase the default CLI, --strict, and check-theme.mjs enforce. */
export const MOTION_PHASE_ACTIVE = 2;

/**
 * Safe motion_level normalization — the single reference semantics the Twig
 * resolver in layouts/master.twig mirrors: allowlisted strings pass through
 * verbatim; everything else (unknown strings, wrong case, arrays, booleans,
 * numbers, null/undefined) falls back to the balanced default. A raw merchant
 * value never reaches a class name.
 */
export function resolveMotionLevel(raw) {
  return typeof raw === 'string' && MOTION_LEVELS.includes(raw) ? raw : MOTION_DEFAULT_LEVEL;
}

/**
 * Fail-closed boolean normalization for motion_reduce_mobile: only the four
 * exact enrolled truthy shapes count; anything else is false. Mirrors the
 * `is same as` chain in master.twig — Twig `in`/`==` are loose and would
 * coerce unexpected raw types.
 */
export function normalizeMotionReduceMobile(raw) {
  return raw === true || raw === 'true' || raw === 1 || raw === '1';
}

/**
 * Named functional timing exceptions (contract: "raw time/distance literals
 * require a named functional exception in the static guard"). Each entry is
 * file + selector substring + the raw literal + reason. Everything else in the
 * scanned layers must consume semantic tokens from 01-settings/motion.scss.
 */
export const NAMED_TIMING_EXCEPTIONS = [
  {
    file: 'src/assets/styles/02-generic/common.scss',
    selector: 'animation: loader',
    literal: '1s',
    reason: 'functional continuous loading spinner; the reduced-motion contract stops it in the same owner file',
  },
  {
    file: 'src/assets/styles/04-components/product.scss',
    selector: 'stroke-dashoffset',
    literal: '1s',
    reason: 'functional SVG ring progress transition tied to a loading/state indicator, not decorative motion',
  },
  {
    file: 'src/assets/styles/04-components/product-card.scss',
    selector: 'stroke-dashoffset',
    literal: '1s',
    reason: 'functional SVG ring progress transition tied to a loading/state indicator, not decorative motion',
  },
  {
    file: 'src/assets/styles/04-components/cart.scss',
    selector: 'width',
    literal: '0.5s',
    reason: 'functional progress/state width transition driven by cart state, not decorative spatial motion',
  },
  {
    file: 'src/assets/styles/04-components/add-product-toast.scss',
    selector: 'width',
    literal: '250ms',
    reason: 'functional free-shipping progress bar width driven by cart state, not decorative spatial motion',
  },
];

/**
 * Named platform/functional exceptions for banned Tailwind motion utilities.
 * Empty on purpose: every utility usage so far was migrated to token-driven
 * declarations in its existing owner. Add an entry only when a platform-owned
 * contract genuinely forces the utility, with file + exact token + reason.
 */
export const NAMED_UTILITY_EXCEPTIONS = [];

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

/** Blank SCSS/JS comments while preserving line numbers. */
function blankComments(text) {
  const keepNewlines = (m) => m.replace(/[^\n]/g, ' ');
  return text.replace(/\/\*[\s\S]*?\*\//g, keepNewlines).replace(/\/\/[^\n]*/g, keepNewlines);
}

/** Remove @keyframes blocks (their bodies define effect shape, not timing contract). */
function stripKeyframes(text) {
  let out = '';
  let i = 0;
  const re = /@(-webkit-)?keyframes[^{]*\{/g;
  let m;
  let last = 0;
  while ((m = re.exec(text))) {
    out += text.slice(last, m.index);
    let depth = 1;
    i = re.lastIndex;
    while (i < text.length && depth > 0) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      out += '\n'.repeat(text[i] === '\n' ? 1 : 0);
      i++;
    }
    last = i;
    re.lastIndex = i;
  }
  out += text.slice(last);
  return out;
}

/**
 * Raw time/timing-function literals in transition/animation declarations.
 * Pure and exported so the witness tests can prove the scan catches defects.
 *
 * Detects longhands and shorthands (vendor-prefixed included) at any
 * indentation and anywhere on a line, reports every raw nonzero time and raw
 * easing function/keyword, and ignores @keyframes bodies, zero/none, and
 * var(--motion-*) token consumption. Diagnostics keep the 1-based line, the
 * property, the matched literals, and the full declaration text.
 *
 * @param {string} scss comment-blanked SCSS source
 * @returns {Array<{line:number, property:string, literal:string, declaration:string}>}
 */
export function findRawTimings(scss) {
  const text = stripKeyframes(scss);
  const out = [];
  const lines = text.split('\n');
  const decl = /(?:^|[;{])\s*((?:-webkit-)?(?:transition|animation)(?:-duration|-delay|-timing-function)?)\s*:\s*([^;{}]+)/g;
  for (let n = 0; n < lines.length; n++) {
    let m;
    decl.lastIndex = 0;
    while ((m = decl.exec(lines[n]))) {
      const property = m[1];
      const rawValue = m[2];
      // The whole value is scanned, including var() fallbacks: a raw literal
      // hidden in var(--motion-*, 200ms) is still a raw timing choice. Token
      // names themselves carry no time/easing literal, so plain var(--motion-*)
      // consumption stays clean.
      const literals = [];
      for (const t of rawValue.matchAll(/(?:\d+(?:\.\d+)?|\.\d+)m?s\b/g)) {
        // A bare `0`/`0s` is "no motion", not a timing choice.
        if (!/^0(?:\.0+)?m?s$/.test(t[0])) literals.push(t[0]);
      }
      for (const c of rawValue.matchAll(/cubic-bezier\([^)]*\)|steps?\([^)]*\)|step-(?:start|end)\b/g)) literals.push(c[0]);
      for (const e of rawValue.matchAll(/\b(ease-in-out|ease-in|ease-out|ease|linear)\b/g)) literals.push(e[0]);
      if (literals.length) {
        out.push({ line: n + 1, property, literal: literals.join(' '), declaration: `${property}: ${rawValue.trim()}` });
      }
    }
  }
  return out;
}

/**
 * Banned Tailwind motion utilities. `transition`/`transition-*` (except
 * `transition-none`) compile Tailwind's default raw 150ms/cubic-bezier timing
 * even with no duration class; `duration-*`/`delay-*`/`ease-*`/`animate-*`
 * (except `animate-none`) carry raw timing directly. Theme sources must
 * declare motion with var(--motion-*) tokens in the owning stylesheet.
 */
const BANNED_MOTION_UTILITY = /^(?:transition(?:-(?:all|colors|opacity|shadow|transform|height)|-\[[^\]]*\])?|duration-(?:\d+|\[[^\]]*\])|delay-(?:\d+|\[[^\]]*\])|ease-(?:linear|in|out|in-out|elastic|\[[^\]]*\])|animate-(?!none\b)[\w-]+)$/;

function bannedMotionUtility(token) {
  // Strip variant prefixes (hover:, lg:, rtl:, …); the utility is the last segment.
  const name = token.slice(token.lastIndexOf(':') + 1);
  if (name === 'transition-none' || name === 'animate-none') return null;
  return BANNED_MOTION_UTILITY.test(name) ? name : null;
}

/**
 * Tailwind motion utilities in theme sources. Pure and exported for witness
 * tests. `kind` selects the carrier: 'scss' scans @apply bodies, 'twig' scans
 * class attributes, 'js' scans string literals.
 *
 * @param {string} text comment-blanked source
 * @param {'scss'|'twig'|'js'} kind
 * @returns {Array<{line:number, token:string}>}
 */
export function findMotionUtilities(text, kind) {
  const out = [];
  const lineAt = (index) => text.slice(0, index).split('\n').length;
  const carriers = [];
  if (kind === 'scss') {
    // The trailing semicolon is optional (Sass tolerates its absence before
    // `}`), and the body must never spill past a brace into another rule.
    carriers.push(/@apply\s+([^;{}]+);?/g);
  } else if (kind === 'twig') {
    carriers.push(/\bclass\s*=\s*"([^"]*)"/g, /\bclass\s*=\s*'([^']*)'/g);
  } else {
    carriers.push(/'([^']*)'|"([^"]*)"|`([\s\S]*?)`/g);
  }
  for (const re of carriers) {
    let m;
    while ((m = re.exec(text))) {
      const body = m[1] ?? m[2] ?? m[3] ?? '';
      for (const token of body.split(/\s+/)) {
        if (!token) continue;
        const banned = bannedMotionUtility(token);
        if (banned) out.push({ line: lineAt(m.index), token: banned });
      }
    }
  }
  out.sort((a, b) => a.line - b.line);
  return out;
}

/**
 * Banned runtime patterns in theme JavaScript (Anime runtime + recurring CTA
 * timer). Pure and exported for witness tests.
 *
 * @param {string} js comment-blanked JS source
 * @returns {Array<{ban:string, line:number}>}
 */
export function findBannedJs(js) {
  const out = [];
  const bans = [
    { ban: 'animejs-import', re: /from\s+['"]animejs['"]|require\(\s*['"]animejs['"]\s*\)|import\s+['"]animejs['"]/ },
    { ban: 'anime-global', re: /window\.anime\b/ },
    { ban: 'anime-call', re: /(?<![\w.])anime\s*\(/ },
    { ban: 'anime-wrapper-import', re: /from\s+['"][^'"]*partials\/anime['"]/ },
  ];
  js.split('\n').forEach((line, i) => {
    for (const { ban, re } of bans) if (re.test(line)) out.push({ ban, line: i + 1 });
  });
  return out;
}

/**
 * Recurring timers in theme JavaScript. A periodic CTA attention loop is
 * banned by the contract (FR-013); one-shot setTimeout is not motion. Pure
 * and exported so the witness tests can prove the scan catches defects.
 *
 * @param {string} js comment-blanked JS source
 * @returns {Array<{ban:string, line:number}>}
 */
export function findRecurringTimers(js) {
  const out = [];
  js.split('\n').forEach((line, i) => {
    if (/setInterval\s*\(/.test(line)) out.push({ ban: 'set-interval', line: i + 1 });
  });
  return out;
}

/** Parse the first `NNNms`/`NNs` value of a token assignment inside a block. */
function tokenMs(block, token) {
  const m = block.match(new RegExp(`${token.replace(/-/g, '\\-')}\\s*:\\s*(\\d+(?:\\.\\d+)?)(ms|s)\\b`));
  if (!m) return null;
  return m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
}

function tokenPx(block, token) {
  const m = block.match(new RegExp(`${token.replace(/-/g, '\\-')}\\s*:\\s*(\\d+(?:\\.\\d+)?)px\\b`));
  return m ? Number(m[1]) : null;
}

/** Extract the body of the first selector block matching `selectorRe`. */
function blockBody(text, selectorRe) {
  const m = text.match(selectorRe);
  if (!m) return null;
  const start = text.indexOf('{', m.index);
  if (start < 0) return null;
  let depth = 1;
  let i = start + 1;
  while (i < text.length && depth > 0) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
    i++;
  }
  return text.slice(start + 1, i - 1);
}

/* ------------------------------------------------------------- the checker */

/**
 * @param {object} opts
 * @param {string} [opts.root] repository root
 * @param {number} [opts.phase] highest rule phase to enforce (default MOTION_PHASE_ACTIVE)
 * @returns {{findings: Array, errors: number, phase: number}}
 */
export function checkMotionSystem({ root = ROOT, phase = MOTION_PHASE_ACTIVE } = {}) {
  const findings = [];
  const note = (rule, level, message, where, extra) =>
    findings.push({ rule, level, message, where, ...(extra ?? {}) });
  const error = (rule, message, where, extra) => note(rule, 'error', message, where, extra);
  const enabled = (rule) => phase >= MOTION_RULE_PHASE[rule];

  const abs = (p) => join(root, p);

  /* ---------------------------------------------------- 1. motion-settings */
  {
    let bad = 0;
    const twilight = readJson(abs(TWILIGHT_PATH));
    const byId = new Map((twilight.settings ?? []).map((s) => [s.id, s]));

    const level = byId.get('motion_level');
    const levelValues = level?.options?.map((o) => o.value) ?? [];
    if (!level || level.type !== 'items'
      || JSON.stringify(levelValues) !== JSON.stringify(MOTION_LEVELS)
      || level.selected?.[0]?.value !== MOTION_DEFAULT_LEVEL) {
      bad++;
      error('motion-settings',
        `motion_level must be an items setting with exactly ${MOTION_LEVELS.join('/')} and default ${MOTION_DEFAULT_LEVEL}`,
        'twilight.json#motion_level', { expected: `${MOTION_LEVELS.join(', ')}; default ${MOTION_DEFAULT_LEVEL}` });
    }

    const reduceMobile = byId.get('motion_reduce_mobile');
    if (!reduceMobile || reduceMobile.type !== 'boolean' || reduceMobile.value !== true) {
      bad++;
      error('motion-settings', 'motion_reduce_mobile must be a boolean setting with default true',
        'twilight.json#motion_reduce_mobile', { expected: 'boolean, value true' });
    }

    const legacyAnim = byId.get('product_add_to_cart_animation');
    const legacyValues = legacyAnim?.options?.map((o) => o.value) ?? [];
    const expectedLegacy = ['none', 'bounce', 'tada', 'swing', 'flash', 'fade-in', 'heart-beat', 'shake'];
    if (!legacyAnim || legacyAnim.type !== 'items'
      || JSON.stringify(legacyValues) !== JSON.stringify(expectedLegacy)
      || legacyAnim.selected?.[0]?.value !== 'tada') {
      bad++;
      error('motion-settings', 'legacy product_add_to_cart_animation must keep its id, items type, eight options, and tada default',
        'twilight.json#product_add_to_cart_animation', { expected: expectedLegacy.join(', ') });
    }

    const legacyInterval = byId.get('product_add_to_cart_animation_interval');
    if (!legacyInterval || legacyInterval.type !== 'number' || legacyInterval.value !== 6) {
      bad++;
      error('motion-settings', 'legacy product_add_to_cart_animation_interval must keep its id, number type, and stored default 6 (compatibility no-op)',
        'twilight.json#product_add_to_cart_animation_interval', { expected: 'number, value 6' });
    }

    const registry = readJson(abs(REGISTRY_PATH));
    const regByKey = new Map(registry.settings.map((s) => [s.key, s]));
    const registryExpectations = [
      ['global::motion_level', 'basic'],
      ['global::motion_reduce_mobile', 'advanced'],
      ['global::product_add_to_cart_animation', 'advanced'],
      ['global::product_add_to_cart_animation_interval', 'advanced'],
    ];
    for (const [key, tier] of registryExpectations) {
      const rec = regByKey.get(key);
      if (!rec) {
        bad++;
        error('motion-settings', `registry record ${key} is missing`, key);
        continue;
      }
      if (rec.owner_spec !== 'HDL-06' || rec.tier !== tier || !rec.label_ar || !rec.label_en) {
        bad++;
        error('motion-settings',
          `registry record ${key} must be owned by HDL-06, tier ${tier}, with Arabic and English labels`,
          key, { expected: `owner_spec HDL-06, tier ${tier}, bilingual labels` });
      }
    }

    if (!bad) note('motion-settings', 'ok',
      'motion_level/motion_reduce_mobile declared with safe defaults; both legacy IDs preserved; registry records HDL-06-owned with bilingual labels');
  }

  /* ---------------------------------------------------- 2. motion-resolver */
  {
    let bad = 0;
    const twig = read(abs(MASTER_TWIG)).replace(/\{#[\s\S]*?#\}/g, '');

    if (!/hadeel_motion_levels\s*=\s*\[\s*'calm'\s*,\s*'balanced'\s*,\s*'rich'\s*\]/.test(twig)) {
      bad++;
      error('motion-resolver', 'master.twig must pin the exact motion level allowlist [calm, balanced, rich]',
        MASTER_TWIG, { expected: "hadeel_motion_levels = ['calm', 'balanced', 'rich']" });
    }
    if (!/hadeel-motion-\{\{\s*hadeel_motion_level\s*\}\}/.test(twig)) {
      bad++;
      error('motion-resolver', 'body must emit exactly one resolved hadeel-motion-{level} class from the allowlisted variable',
        MASTER_TWIG, { expected: 'hadeel-motion-{{ hadeel_motion_level }}' });
    }
    if (/hadeel-motion-\{\{\s*theme\.settings\.get/.test(twig)) {
      bad++;
      error('motion-resolver', 'raw merchant motion_level is interpolated into a class — resolve through the allowlist instead',
        MASTER_TWIG);
    }
    const fallbackCount = (twig.match(/hadeel_motion_level\s*=\s*[^%]*'balanced'/g) ?? []).length
      + (twig.match(/:\s*'balanced'/g) ?? []).length;
    if (!fallbackCount) {
      bad++;
      error('motion-resolver', "unknown motion_level values must fall back to 'balanced'", MASTER_TWIG,
        { expected: "fallback 'balanced'" });
    }
    if (!/theme\.settings\.get\('motion_reduce_mobile'/.test(twig)) {
      bad++;
      error('motion-resolver', 'master.twig must read and normalize motion_reduce_mobile', MASTER_TWIG);
    }
    if (!bad) note('motion-resolver', 'ok',
      'level resolves through the pinned allowlist with balanced fallback; no raw merchant value reaches a class; mobile-reduction state is normalized');
  }

  /* ------------------------------------------------------ 3. motion-tokens */
  {
    let bad = 0;
    if (!existsSync(abs(MOTION_SCSS))) {
      error('motion-tokens', 'token owner file is missing', MOTION_SCSS);
      bad++;
    } else {
      const text = blankComments(read(abs(MOTION_SCSS)));
      for (const token of REQUIRED_TOKENS) {
        if (!text.includes(`${token}:`)) {
          bad++;
          error('motion-tokens', `semantic token ${token} is not defined by the token owner`, MOTION_SCSS,
            { expected: `${token}: <value>` });
        }
      }
      for (const level of MOTION_LEVELS) {
        const body = blockBody(text, new RegExp(`\\.hadeel-motion-${level}\\b[^{]*\\{`));
        if (!body) {
          bad++;
          error('motion-tokens', `level profile .hadeel-motion-${level} is not defined`, MOTION_SCSS);
          continue;
        }
        const ui = tokenMs(body, '--motion-duration-ui');
        const feedback = tokenMs(body, '--motion-duration-feedback');
        const revealDistance = tokenPx(body, '--motion-reveal-distance');
        const cap = PROFILE_CAPS[level];
        if (ui === null || ui > cap) {
          bad++;
          error('motion-tokens', `.hadeel-motion-${level} UI duration ${ui}ms exceeds the ${cap}ms cap`,
            MOTION_SCSS, { expected: `--motion-duration-ui <= ${cap}ms` });
        }
        if (feedback === null || feedback > cap) {
          bad++;
          error('motion-tokens', `.hadeel-motion-${level} feedback duration ${feedback}ms exceeds the ${cap}ms cap`,
            MOTION_SCSS, { expected: `--motion-duration-feedback <= ${cap}ms` });
        }
        const distCap = REVEAL_DISTANCE_CAPS[level];
        if (revealDistance === null || revealDistance > distCap) {
          bad++;
          error('motion-tokens', `.hadeel-motion-${level} reveal distance ${revealDistance}px exceeds the ${distCap}px cap`,
            MOTION_SCSS, { expected: `--motion-reveal-distance <= ${distCap}px` });
        }
      }
      const reduced = blockBody(text, /@media\s*\(prefers-reduced-motion:\s*reduce\)[^{]*\{/);
      if (!reduced) {
        bad++;
        error('motion-tokens', 'token owner must define the global prefers-reduced-motion: reduce override', MOTION_SCSS);
      } else {
        const reducedUi = tokenMs(reduced, '--motion-duration-ui');
        if (reducedUi === null || reducedUi > PROFILE_CAPS.reduced) {
          bad++;
          error('motion-tokens', `reduced override UI duration ${reducedUi}ms exceeds the ${PROFILE_CAPS.reduced}ms cap`,
            MOTION_SCSS, { expected: `--motion-duration-ui <= ${PROFILE_CAPS.reduced}ms` });
        }
        const reducedDistance = tokenPx(reduced, '--motion-reveal-distance');
        if (reducedDistance === null || reducedDistance !== 0) {
          bad++;
          error('motion-tokens', 'reduced override must zero the reveal distance', MOTION_SCSS,
            { expected: '--motion-reveal-distance: 0px' });
        }
      }
      const mobileCap = blockBody(text, /@media\s*\(max-width:\s*767px\)[^{]*\{/);
      if (!mobileCap || !/hadeel-motion-rich/.test(text) || !/hadeel-motion-reduce-mobile/.test(text)) {
        bad++;
        error('motion-tokens', 'mobile Rich cap (hadeel-motion-rich + hadeel-motion-reduce-mobile at the mobile breakpoint) is missing',
          MOTION_SCSS, { expected: 'Rich aliased to Balanced values under the mobile media query' });
      } else {
        const cappedUi = tokenMs(mobileCap, '--motion-duration-ui');
        if (cappedUi === null || cappedUi > PROFILE_CAPS.balanced) {
          bad++;
          error('motion-tokens', `mobile Rich cap UI duration ${cappedUi}ms must not exceed the Balanced ${PROFILE_CAPS.balanced}ms cap`,
            MOTION_SCSS, { expected: `--motion-duration-ui <= ${PROFILE_CAPS.balanced}ms` });
        }
      }
    }

    const appScss = read(abs(APP_SCSS));
    const settingsImport = /01-settings\/motion/.test(appScss);
    const motionLine = appScss.split('\n').findIndex((l) => l.includes('01-settings/motion'));
    const genericLine = appScss.split('\n').findIndex((l) => l.includes('02-generic/'));
    if (!settingsImport || motionLine < 0 || (genericLine >= 0 && motionLine > genericLine)) {
      bad++;
      error('motion-tokens', 'app.scss must import 01-settings/motion inside the settings layer, before 02-generic',
        APP_SCSS, { expected: "@use './01-settings/motion' as *;" });
    }
    if (!bad) note('motion-tokens', 'ok',
      'semantic tokens, three level profiles within caps, reduced override, and mobile Rich cap are defined in one owner imported by the settings layer');
  }

  /* ----------------------------------------------------- 4. motion-no-timer */
  if (enabled('motion-no-timer')) {
    let bad = 0;
    const productJs = blankComments(read(abs(PRODUCT_JS)));
    for (const hit of findRecurringTimers(productJs)) {
      bad++;
      error('motion-no-timer', `setInterval in product.js — recurring CTA attention is forbidden`,
        `${PRODUCT_JS}:${hit.line}`);
    }
    for (const f of walk(abs(VIEWS_DIR), ['.twig'])) {
      const text = read(f).replace(/\{#[\s\S]*?#\}/g, '');
      if (text.includes('data-add-to-cart-animation-interval')) {
        bad++;
        error('motion-no-timer', 'data-add-to-cart-animation-interval is rendered — the legacy interval is a compatibility no-op with no timer',
          relative(root, f));
      }
    }
    for (const f of walk(abs(JS_DIR), ['.js'])) {
      const text = blankComments(read(f));
      if (/addToCartAnimationInterval/.test(text)) {
        bad++;
        error('motion-no-timer', 'addToCartAnimationInterval dataset is read — the legacy interval must be ignored at runtime',
          relative(root, f));
      }
    }
    if (!bad) note('motion-no-timer', 'ok',
      'no recurring CTA timer: product.js has no setInterval and the legacy interval attribute is neither rendered nor read');
  }

  /* ----------------------------------------------------- 5. motion-no-anime */
  if (enabled('motion-no-anime')) {
    let bad = 0;
    for (const f of walk(abs(JS_DIR), ['.js'])) {
      const text = blankComments(read(f));
      for (const hit of findBannedJs(text)) {
        bad++;
        error('motion-no-anime', `banned AnimeJS runtime pattern (${hit.ban})`, `${relative(root, f)}:${hit.line}`);
      }
    }
    if (existsSync(abs(ANIME_JS))) {
      bad++;
      error('motion-no-anime', 'partials/anime.js still exists — the runtime wrapper must be deleted (dependency files stay unchanged)',
        ANIME_JS);
    }
    if (!bad) note('motion-no-anime', 'ok',
      'no runtime animejs import, window.anime global, anime( call, or wrapper module');
  }

  /* ------------------------------------------------------- 6. motion-reveal */
  {
    let bad = 0;
    for (const f of walk(abs(VIEWS_DIR), ['.twig'])) {
      const text = read(f).replace(/\{#[\s\S]*?#\}/g, '');
      if (!text.includes('data-hadeel-reveal')) continue;
      const relPath = relative(root, f);
      if (!REVEAL_ALLOWLIST.includes(relPath)) {
        bad++;
        error('motion-reveal', `data-hadeel-reveal opt-in outside the approved noncritical Home components`, relPath,
          { expected: REVEAL_ALLOWLIST.join(', ') });
      }
    }
    for (const f of walk(abs(STYLES_DIR), ['.scss'])) {
      const text = blankComments(read(f));
      if (/hadeel-reveal/.test(text)) {
        bad++;
        error('motion-reveal', 'reveal must not have a CSS base state — content stays visible without JavaScript and WAAPI starts on intersection',
          relative(root, f));
      }
    }
    if (!bad) note('motion-reveal', 'ok',
      'reveal opt-ins are confined to the approved noncritical Home components with no hidden CSS base state');
  }

  /* ------------------------------------------------------- 7. motion-timing */
  if (enabled('motion-timing')) {
    let bad = 0;
    const scannedLayers = ['02-generic', '03-elements', '04-components', '05-utilities'];
    const exceptions = NAMED_TIMING_EXCEPTIONS;
    const usedExceptions = new Set();
    for (const layer of scannedLayers) {
      const dir = abs(join(STYLES_DIR, layer));
      if (!existsSync(dir)) continue;
      for (const f of walk(dir, ['.scss'])) {
        const relPath = relative(root, f);
        for (const hit of findRawTimings(blankComments(read(f)))) {
          const exception = exceptions.find((e) => e.file === relPath
            && hit.declaration.includes(e.selector) && hit.literal.includes(e.literal));
          if (exception) {
            usedExceptions.add(exception);
            continue;
          }
          bad++;
          error('motion-timing',
            `raw motion value "${hit.declaration}" — consume a semantic token from 01-settings/motion.scss or document a named functional exception`,
            `${relPath}:${hit.line}`);
        }
      }
    }
    for (const e of exceptions) {
      if (!usedExceptions.has(e)) {
        bad++;
        error('motion-timing', `named exception no longer matches any raw value (${e.file} ${e.selector} ${e.literal}) — remove it`,
          e.file);
      }
    }
    if (!bad) note('motion-timing', 'ok',
      `every raw motion value outside the token owner is a named functional exception (${exceptions.length} registered)`);
  }

  /* ------------------------------------------------------ motion-utility */
  if (enabled('motion-utility')) {
    let bad = 0;
    const targets = [
      [STYLES_DIR, '.scss', 'scss'],
      [VIEWS_DIR, '.twig', 'twig'],
      [JS_DIR, '.js', 'js'],
    ];
    const exceptions = NAMED_UTILITY_EXCEPTIONS;
    const usedExceptions = new Set();
    for (const [dir, ext, kind] of targets) {
      for (const f of walk(abs(dir), [ext])) {
        const relPath = relative(root, f);
        const text = kind === 'twig'
          ? read(f).replace(/\{#[\s\S]*?#\}/g, '')
          : blankComments(read(f));
        for (const hit of findMotionUtilities(text, kind)) {
          const exception = exceptions.find((e) => e.file === relPath && e.token === hit.token);
          if (exception) {
            usedExceptions.add(exception);
            continue;
          }
          bad++;
          error('motion-utility',
            `Tailwind motion utility "${hit.token}" compiles a raw duration/easing — remove it and declare the motion with var(--motion-*) tokens in the owning stylesheet`,
            `${relPath}:${hit.line}`);
        }
      }
    }
    for (const e of exceptions) {
      if (!usedExceptions.has(e)) {
        bad++;
        error('motion-utility', `named utility exception no longer matches any usage (${e.file} ${e.token}) — remove it`,
          e.file);
      }
    }
    if (!bad) note('motion-utility', 'ok',
      'no Tailwind transition/duration/delay/ease/animate utilities in theme SCSS, Twig class attributes, or JS class strings');
  }

  /* ------------------------------------------------------- 8. motion-scroll */
  {
    let bad = 0;
    for (const f of walk(abs(STYLES_DIR), ['.scss'])) {
      const relPath = relative(root, f);
      const lines = blankComments(read(f)).split('\n');
      let inNoPreference = 0;
      for (let n = 0; n < lines.length; n++) {
        const line = lines[n];
        if (/@media[^{]*prefers-reduced-motion:\s*no-preference[^{]*\{/.test(line)) inNoPreference++;
        if (/scroll-behavior\s*:\s*smooth/.test(line) && !inNoPreference) {
          bad++;
          error('motion-scroll', 'scroll-behavior: smooth without a prefers-reduced-motion: no-preference gate',
            `${relPath}:${n + 1}`, { expected: 'gate smooth scroll behind no-preference' });
        }
        if (inNoPreference && line.includes('}')) inNoPreference--;
      }
    }
    if (!bad) note('motion-scroll', 'ok', 'smooth scroll is gated behind prefers-reduced-motion: no-preference');
  }

  /* ---------------------------------------------------- 9. motion-direction */
  {
    let bad = 0;
    if (existsSync(abs(MOTION_SCSS))) {
      const text = blankComments(read(abs(MOTION_SCSS)));
      text.split('\n').forEach((line, i) => {
        if (/translateX\s*\(|margin-(left|right)\b|padding-(left|right)\b|\b(left|right)\s*:/.test(line)) {
          bad++;
          error('motion-direction', 'physical-direction motion in the token owner — use logical start/end or a non-directional axis',
            `${MOTION_SCSS}:${i + 1}`);
        }
      });
    }
    if (!bad) note('motion-direction', 'ok',
      'token owner defines no physical-direction motion; reveal uses a non-directional axis so RTL/LTR stay identical');
  }

  /* --------------------------------------------------- 10. motion-controller */
  if (enabled('motion-controller')) {
    let bad = 0;
    if (!existsSync(abs(MOTION_JS))) {
      bad++;
      error('motion-controller', 'shared motion controller is missing', MOTION_JS);
    } else {
      const text = blankComments(read(abs(MOTION_JS)));
      const requirements = [
        ['IntersectionObserver', 'one-shot reveal observation'],
        ['unobserve', 'reveal runs once and never re-arms'],
        ['prefers-reduced-motion', 'OS preference is tracked at runtime'],
        ['addEventListener', 'MediaQueryList change listener'],
        ['getComputedStyle', 'timings are read from computed CSS tokens, not duplicated'],
      ];
      for (const [needle, why] of requirements) {
        if (!text.includes(needle)) {
          bad++;
          error('motion-controller', `controller lacks ${needle} — ${why}`, MOTION_JS);
        }
      }
      if (!/\.finish\(\)|\.cancel\(\)/.test(text)) {
        bad++;
        error('motion-controller', 'controller must cancel active theme-owned animations to their final state on reduce',
          MOTION_JS, { expected: 'finish()/cancel() on active animations' });
      }
    }
    const appJs = blankComments(read(abs(APP_JS)));
    if (!/partials\/motion/.test(appJs)) {
      bad++;
      error('motion-controller', 'app.js must initialize the shared controller (no new entry, chunk, or request)', APP_JS);
    }
    if (!bad) note('motion-controller', 'ok',
      'shared controller reads computed tokens, observes once, tracks and cancels active motion, and is initialized from the existing app entry');
  }

  return { findings, errors: findings.filter((f) => f.level === 'error').length, phase };
}

/* -------------------------------------------------------------------- CLI */

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');
  // --strict is accepted for CLI contract parity with the other guards; the
  // motion contract has no relaxed mode. --full predates the T021 phase-2
  // promotion and now selects the same rule set as the default invocation.
  const full = argv.includes('--full');
  const phase = full ? Math.max(...Object.values(MOTION_RULE_PHASE)) : MOTION_PHASE_ACTIVE;
  const { findings, errors } = checkMotionSystem({ root: ROOT, phase });

  if (asJson) {
    console.log(JSON.stringify({ errors, phase, findings }, null, 2));
  } else {
    const icon = { ok: '  ok  ', warn: ' warn ', error: 'FAILED' };
    let current = '';
    for (const f of findings) {
      if (f.rule !== current) { current = f.rule; console.log(`\n[${current}]`); }
      console.log(`  ${icon[f.level]} ${f.message}${f.where ? `\n         ${f.where}` : ''}${f.expected !== undefined ? `\n         expected: ${f.expected}` : ''}`);
    }
    console.log(`\nphase ${phase} — ${errors} error(s)`);
  }
  process.exit(errors ? 1 : 0);
}
