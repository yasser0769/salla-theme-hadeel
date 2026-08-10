/**
 * HDL-06 Phase A (foundation) contract tests — T005/T008.
 *
 * Pins the executable motion contract (scripts/check-motion-system.mjs)
 * against the repository: safe normalization/fallback, the motion settings
 * contract, exactly one allowlisted body class + data value, semantic token
 * presence/caps/reduced-motion override, the recurring-CTA-timer and
 * runtime-Anime bans (helper-level teeth plus repo-wide enforcement — the
 * active phase is 2 since T021), the raw-timing scanner teeth and the
 * tokenized owner files, critical-content reveal confinement, and the
 * deliberately broken witness fixture that proves the guard still catches
 * defects.
 *
 * Offline, Node built-ins only; live Salla preview evidence is a separate gate.
 *
 * Runtime Phase B review remediation adds dependency-free behavioral tests
 * that drive the real HadeelMotion class through small window/document/
 * animation mocks: absent/legacy matchMedia, exactly-once reveal across
 * reduce toggles, finished-less animation tracking, live reduce settling,
 * and shared CSS-class feedback registration/cleanup.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import {
  checkMotionSystem,
  resolveMotionLevel,
  normalizeMotionReduceMobile,
  findBannedJs,
  findRecurringTimers,
  findRawTimings,
  findMotionUtilities,
  MOTION_LEVELS,
  MOTION_DEFAULT_LEVEL,
  PROFILE_CAPS,
  REVEAL_DISTANCE_CAPS,
  REQUIRED_TOKENS,
  REVEAL_ALLOWLIST,
  NAMED_TIMING_EXCEPTIONS,
  MOTION_PHASE_ACTIVE,
} from '../scripts/check-motion-system.mjs';
import { HadeelMotion } from '../src/assets/js/partials/motion.js';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const WITNESS = join(ROOT, 'tests/fixtures/motion-system/broken');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
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

/** Extract the balanced body of the first block whose selector matches. */
function blockBody(text, selectorRe) {
  const m = text.match(selectorRe);
  if (!m) return null;
  const start = text.indexOf('{', m.index);
  let depth = 1;
  let i = start + 1;
  while (i < text.length && depth > 0) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
    i++;
  }
  return text.slice(start + 1, i - 1);
}

const tokenMs = (block, token) => {
  const m = block.match(new RegExp(`${token}\\s*:\\s*(\\d+(?:\\.\\d+)?)(ms|s)\\b`));
  return m ? (m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1])) : null;
};
const tokenPx = (block, token) => {
  const m = block.match(new RegExp(`${token}\\s*:\\s*(\\d+(?:\\.\\d+)?)px\\b`));
  return m ? Number(m[1]) : null;
};

/* --------------------------- safe normalization / fallback (T005, T008) */

describe('safe normalization and fallback (reference resolver semantics)', () => {
  test('every allowlisted level passes through verbatim', () => {
    for (const level of MOTION_LEVELS) {
      assert.equal(resolveMotionLevel(level), level);
    }
    assert.equal(MOTION_DEFAULT_LEVEL, 'balanced');
  });

  test('unknown, mistyped, and malformed values fall back to balanced', () => {
    const junk = [
      'CALM', 'Rich ', ' balanced', 'extreme', 'none', '', '0', '1',
      'balanced\nhadeel-evil', "balanced' onclick='x", null, undefined,
      0, 1, 2, true, false, ['rich'], ['calm', 'rich'], { level: 'rich' }, NaN,
    ];
    for (const raw of junk) {
      assert.equal(resolveMotionLevel(raw), 'balanced',
        `${JSON.stringify(raw)} must never reach a class — expected balanced`);
    }
  });

  test('motion_reduce_mobile normalization is fail-closed to the four enrolled shapes', () => {
    for (const truthy of [true, 'true', 1, '1']) {
      assert.equal(normalizeMotionReduceMobile(truthy), true);
    }
    for (const falsy of [false, 'false', 0, '0', 'yes', 'on', 2, null, undefined, [], {}, 'TRUE']) {
      assert.equal(normalizeMotionReduceMobile(falsy), false,
        `${JSON.stringify(falsy)} must not enable mobile reduction`);
    }
  });
});

/* -------------------------------------- motion settings contract (T009/T010) */

describe('motion settings contract (twilight.json + registry)', () => {
  const twilight = readJson('twilight.json');
  const byId = new Map(twilight.settings.map((s) => [s.id, s]));
  const registry = readJson('src/config/settings-registry.json');
  const byKey = new Map(registry.settings.map((s) => [s.key, s]));

  test('motion_level is an items setting with exactly calm/balanced/rich, default balanced', () => {
    const s = byId.get('motion_level');
    assert.ok(s, 'motion_level must be declared');
    assert.equal(s.type, 'items');
    assert.deepEqual(s.options.map((o) => o.value), ['calm', 'balanced', 'rich']);
    assert.equal(s.selected?.[0]?.value, 'balanced');
  });

  test('motion_reduce_mobile is a boolean setting defaulting to true', () => {
    const s = byId.get('motion_reduce_mobile');
    assert.ok(s, 'motion_reduce_mobile must be declared');
    assert.equal(s.type, 'boolean');
    assert.equal(s.value, true);
  });

  test('static-motion-title opens the motion settings group', () => {
    const s = byId.get('static-motion-title');
    assert.ok(s, 'static-motion-title must be declared');
    assert.equal(s.type, 'static');
    assert.equal(s.format, 'title');
  });

  test('both legacy product settings keep id, type, options, and stored default', () => {
    const anim = byId.get('product_add_to_cart_animation');
    assert.ok(anim, 'legacy animation setting must remain');
    assert.equal(anim.type, 'items');
    assert.deepEqual(anim.options.map((o) => o.value),
      ['none', 'bounce', 'tada', 'swing', 'flash', 'fade-in', 'heart-beat', 'shake']);
    assert.equal(anim.selected?.[0]?.value, 'tada');
    const interval = byId.get('product_add_to_cart_animation_interval');
    assert.ok(interval, 'legacy interval setting must remain (compatibility no-op)');
    assert.equal(interval.type, 'number');
    assert.equal(interval.value, 6);
  });

  test('the three new settings are registered with HDL-06 ownership and bilingual labels', () => {
    const expectations = [
      ['global::static-motion-title', 'structural'],
      ['global::motion_level', 'basic'],
      ['global::motion_reduce_mobile', 'advanced'],
    ];
    for (const [key, tier] of expectations) {
      const rec = byKey.get(key);
      assert.ok(rec, `${key} must be registered`);
      assert.equal(rec.owner_spec, 'HDL-06');
      assert.equal(rec.tier, tier);
      assert.ok(rec.label_ar && rec.label_en, `${key} needs Arabic and English labels`);
    }
    assert.deepEqual(byKey.get('global::motion_level').allowed_values, ['calm', 'balanced', 'rich']);
    assert.equal(byKey.get('global::motion_level').safe_default, 'balanced');
  });
});

/* ------------------- one allowlisted body class + data value (T011) */

describe('server resolver: exactly one allowlisted body state, never raw', () => {
  const twig = read('src/views/layouts/master.twig').replace(/\{#[\s\S]*?#\}/g, '');

  test('the level allowlist is pinned in master.twig', () => {
    assert.match(twig, /hadeel_motion_levels\s*=\s*\[\s*'calm'\s*,\s*'balanced'\s*,\s*'rich'\s*\]/);
  });

  test('exactly one hadeel-motion-{level} class interpolation is emitted', () => {
    const matches = twig.match(/hadeel-motion-\{\{\s*hadeel_motion_level\s*\}\}/g) ?? [];
    assert.equal(matches.length, 1, 'exactly one resolved motion level class');
  });

  test('a matching data-hadeel-motion value is emitted from the same resolved variable', () => {
    assert.match(twig, /data-hadeel-motion="\{\{\s*hadeel_motion_level\s*\}\}"/);
  });

  test('raw theme.settings.get is never interpolated into a motion class', () => {
    assert.ok(!/hadeel-motion-\{\{\s*theme\.settings\.get/.test(twig),
      'raw merchant value inside a class name');
  });

  test('motion_level is read exactly once, inside a {% set %} assignment', () => {
    const reads = twig.match(/theme\.settings\.get\('motion_level'/g) ?? [];
    assert.equal(reads.length, 1);
    for (const line of twig.split('\n')) {
      if (line.includes("theme.settings.get('motion_level'")) {
        assert.match(line, /\{%\s*set\s+hadeel_motion_raw\b/,
          'the raw value must be captured for allowlist resolution, never rendered');
      }
    }
  });

  test('the mobile-reduction class and data marker are conditional on the normalized boolean', () => {
    assert.match(twig, /theme\.settings\.get\('motion_reduce_mobile'/);
    assert.match(twig, /\{%\s*if\s+hadeel_motion_reduce_mobile\s*%\}\s*hadeel-motion-reduce-mobile\s*\{%\s*endif\s*%\}/);
    assert.match(twig, /\{%\s*if\s+hadeel_motion_reduce_mobile\s*%\}\s*data-hadeel-motion-reduce-mobile="true"\s*\{%\s*endif\s*%\}/);
  });
});

/* ----------------- semantic tokens: presence, caps, reduced (T012/T024a) */

describe('semantic motion tokens: presence, profile caps, reduced override', () => {
  const MOTION_SCSS = 'src/assets/styles/01-settings/motion.scss';

  test('the token owner exists and defines every required semantic token', () => {
    assert.ok(existsSync(join(ROOT, MOTION_SCSS)), 'motion.scss token owner is missing');
    const text = read(MOTION_SCSS);
    for (const token of REQUIRED_TOKENS) {
      assert.ok(text.includes(`${token}:`), `missing semantic token ${token}`);
    }
  });

  test('each level profile stays inside its duration and reveal-distance caps', () => {
    const text = read(MOTION_SCSS);
    for (const level of MOTION_LEVELS) {
      const body = blockBody(text, new RegExp(`\\.hadeel-motion-${level}\\b[^{]*\\{`));
      assert.ok(body, `.hadeel-motion-${level} profile must be defined`);
      const ui = tokenMs(body, '--motion-duration-ui');
      const feedback = tokenMs(body, '--motion-duration-feedback');
      const distance = tokenPx(body, '--motion-reveal-distance');
      assert.ok(ui !== null && ui <= PROFILE_CAPS[level],
        `${level}: UI duration ${ui}ms exceeds the ${PROFILE_CAPS[level]}ms cap`);
      assert.ok(feedback !== null && feedback <= PROFILE_CAPS[level],
        `${level}: feedback duration ${feedback}ms exceeds the ${PROFILE_CAPS[level]}ms cap`);
      assert.ok(distance !== null && distance <= REVEAL_DISTANCE_CAPS[level],
        `${level}: reveal distance ${distance}px exceeds the ${REVEAL_DISTANCE_CAPS[level]}px cap`);
    }
  });

  test('calm ships no reveal motion at all (0px distance)', () => {
    const text = read(MOTION_SCSS);
    const calm = blockBody(text, /\.hadeel-motion-calm\b[^{]*\{/);
    assert.equal(tokenPx(calm, '--motion-reveal-distance'), 0);
  });

  test('rich keeps a bounded stagger inside the 400ms cap', () => {
    const text = read(MOTION_SCSS);
    const rich = blockBody(text, /\.hadeel-motion-rich\b[^{]*\{/);
    const stagger = tokenMs(rich, '--motion-stagger');
    assert.ok(stagger !== null && stagger > 0 && stagger <= PROFILE_CAPS.rich,
      `rich stagger ${stagger}ms must be bounded within the profile cap`);
  });

  test('OS reduced motion overrides every level: <=100ms, 0px, reveal off', () => {
    const text = read(MOTION_SCSS);
    const reduced = blockBody(text, /@media\s*\(prefers-reduced-motion:\s*reduce\)[^{]*\{/);
    assert.ok(reduced, 'global prefers-reduced-motion: reduce override is missing');
    for (const level of MOTION_LEVELS) {
      assert.match(reduced, new RegExp(`\\.hadeel-motion-${level}\\b`),
        `reduced override must cover .hadeel-motion-${level}`);
    }
    const ui = tokenMs(reduced, '--motion-duration-ui');
    assert.ok(ui !== null && ui <= PROFILE_CAPS.reduced,
      `reduced UI duration ${ui}ms exceeds the ${PROFILE_CAPS.reduced}ms cap`);
    assert.equal(tokenPx(reduced, '--motion-reveal-distance'), 0);
    const revealDuration = tokenMs(reduced, '--motion-duration-reveal');
    assert.ok(revealDuration !== null && revealDuration <= PROFILE_CAPS.reduced,
      'reduced reveal duration must be inside the 100ms cap (reveal off)');
    assert.equal(tokenMs(reduced, '--motion-stagger'), 0, 'reduced motion allows no stagger');
  });

  test('mobile Rich reduction aliases Rich to Balanced values', () => {
    const text = read(MOTION_SCSS);
    const mobile = blockBody(text, /@media\s*\(max-width:\s*767px\)[^{]*\{/);
    assert.ok(mobile, 'mobile breakpoint block is missing');
    assert.match(mobile, /\.hadeel-motion-rich\.hadeel-motion-reduce-mobile\b/);
    const ui = tokenMs(mobile, '--motion-duration-ui');
    assert.ok(ui !== null && ui <= PROFILE_CAPS.balanced,
      `mobile-capped Rich UI duration ${ui}ms exceeds the Balanced cap`);
    const distance = tokenPx(mobile, '--motion-reveal-distance');
    assert.ok(distance !== null && distance <= REVEAL_DISTANCE_CAPS.balanced,
      `mobile-capped Rich reveal distance ${distance}px exceeds the Balanced cap`);
  });

  test('the token owner uses no !important and no physical-direction motion', () => {
    const text = read(MOTION_SCSS)
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    assert.ok(!/!important\b/.test(text), 'no !important — fix the rule, never stack it');
    assert.ok(!/translateX\s*\(|margin-(left|right)\b|padding-(left|right)\b|\b(left|right)\s*:/.test(text),
      'physical-direction motion breaks the logical start/end contract');
  });

  test('app.scss imports the token owner in the settings layer, before 02-generic', () => {
    const lines = read('src/assets/styles/app.scss').split('\n');
    const motionLine = lines.findIndex((l) => l.includes('01-settings/motion'));
    const genericLine = lines.findIndex((l) => l.includes('02-generic/'));
    assert.ok(motionLine >= 0, 'app.scss must @use 01-settings/motion');
    assert.ok(genericLine < 0 || motionLine < genericLine,
      'the token owner must load inside the settings layer, before generic styles');
  });

  test('smooth scroll is gated behind prefers-reduced-motion: no-preference', () => {
    const lines = read('src/assets/styles/02-generic/common.scss').split('\n');
    let gated = 0;
    for (let n = 0; n < lines.length; n++) {
      if (/@media[^{]*prefers-reduced-motion:\s*no-preference[^{]*\{/.test(lines[n])) gated++;
      if (/scroll-behavior\s*:\s*smooth/.test(lines[n])) {
        assert.ok(gated > 0, `common.scss:${n + 1} smooth scroll without a no-preference gate`);
      }
      if (gated && lines[n].includes('}')) gated--;
    }
  });
});

/* ------------------------- no periodic CTA timer (contract teeth, FR-013) */

describe('no periodic CTA timer — the scan has teeth', () => {
  test('findRecurringTimers flags setInterval and ignores one-shot timers', () => {
    const hits = findRecurringTimers('const t = window.setInterval(play, 6000);\n');
    assert.equal(hits.length, 1);
    assert.equal(hits[0].line, 1);
    assert.deepEqual(findRecurringTimers('setTimeout(done, 200);\nconst intervalSeconds = 6;\n'), []);
  });
});

/* --------------------- no runtime AnimeJS import/global (contract teeth, FR-016) */

describe('no runtime AnimeJS — the scan has teeth', () => {
  test('findBannedJs catches every banned runtime pattern', () => {
    const banned = [
      "import AnimeJS from 'animejs';",
      "const anime = require('animejs');",
      "import 'animejs';",
      'window.anime = AnimeJS;',
      'anime({ targets: el, scale: [1, 1.1] });',
      "import Anime from './partials/anime';",
    ];
    for (const line of banned) {
      assert.ok(findBannedJs(line).length >= 1, `must catch: ${line}`);
    }
  });

  test('findBannedJs leaves native and unrelated animation code alone', () => {
    const clean = [
      'el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 });',
      'const animations = new Set();',
      "import { init } from './partials/motion';",
    ];
    for (const line of clean) {
      assert.deepEqual(findBannedJs(line), [], `false positive on: ${line}`);
    }
  });
});

/* --------------------------- no critical-content reveal (FR-007/FR-017) */

describe('reveal is confined to approved noncritical Home components', () => {
  test('the allowlist holds exactly the three approved Home specimens', () => {
    assert.deepEqual(REVEAL_ALLOWLIST, [
      'src/views/components/home/fixed-banner.twig',
      'src/views/components/home/brands.twig',
      'src/views/components/home/custom-testimonials.twig',
    ]);
    for (const p of REVEAL_ALLOWLIST) {
      assert.ok(p.startsWith('src/views/components/home/'), `${p} must be a Home component`);
    }
  });

  test('no template outside the allowlist renders data-hadeel-reveal', () => {
    for (const f of walk(join(ROOT, 'src/views'), ['.twig'])) {
      const relPath = f.slice(ROOT.length + 1);
      if (REVEAL_ALLOWLIST.includes(relPath)) continue;
      const text = readFileSync(f, 'utf8').replace(/\{#[\s\S]*?#\}/g, '');
      assert.ok(!text.includes('data-hadeel-reveal'),
        `${relPath}: reveal opt-in outside the approved noncritical components`);
    }
  });

  test('no SCSS hidden base state for reveal targets (content is visible without JS)', () => {
    for (const f of walk(join(ROOT, 'src/assets/styles'), ['.scss'])) {
      const text = readFileSync(f, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
      assert.ok(!/hadeel-reveal/.test(text),
        `${f.slice(ROOT.length + 1)}: reveal must not have a CSS base state`);
    }
  });
});

/* ------------------------------ raw timing scan teeth (FR-001, T021) */

describe('raw timing scan — token consumption is enforceable', () => {
  test('findRawTimings flags raw literals and spares tokens, zero, and keyframes', () => {
    const dirty = [
      '.a { transition: opacity 300ms ease; }',
      '.b { animation: spin 1s linear infinite; }',
      '.c { transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1); }',
    ].join('\n');
    assert.equal(findRawTimings(dirty).length, 3);
    const clean = [
      '.a { transition: opacity var(--motion-duration-ui) var(--motion-easing-standard); }',
      '.b { transition: none; }',
      '.c { transition-delay: 0s; }',
      '@keyframes spin { to { transform: rotate(360deg); } }',
    ].join('\n');
    assert.deepEqual(findRawTimings(clean), []);
  });

  test('detects normally indented declarations inside nested SCSS blocks', () => {
    // The regression that hid every real declaration: the scanner must not
    // require the property to start at column 0.
    const scss = [
      '.card {',
      '  &:hover {',
      '    transition: opacity 300ms ease;',
      '  }',
      '  .icon {',
      '    animation: spin 1s linear infinite;',
      '  }',
      '}',
    ].join('\n');
    const hits = findRawTimings(scss);
    assert.equal(hits.length, 2, 'indented nested declarations must be found');
    assert.deepEqual(hits.map((h) => h.line), [3, 6]);
    assert.equal(hits[0].property, 'transition');
    assert.equal(hits[1].property, 'animation');
  });

  test('detects multiple declarations on one line and longhands', () => {
    const scss = '.a { color: red; transition: transform 0.2s ease; animation-duration: 1s; }';
    const hits = findRawTimings(scss);
    assert.equal(hits.length, 2, 'two timing declarations on the same line');
    assert.deepEqual(hits.map((h) => h.property), ['transition', 'animation-duration']);
    assert.ok(hits.every((h) => h.line === 1));
  });

  test('shorthand values report every raw time and easing literal', () => {
    const [hit] = findRawTimings('.a { transition: opacity 300ms ease, transform 0.2s ease-in 50ms; }');
    for (const literal of ['300ms', '0.2s', '50ms', 'ease', 'ease-in']) {
      assert.ok(hit.literal.includes(literal), `missing literal ${literal} in "${hit.literal}"`);
    }
    assert.equal(hit.declaration, 'transition: opacity 300ms ease, transform 0.2s ease-in 50ms');
  });

  test('leading-dot times and raw easing functions are caught', () => {
    const scss = [
      '.a { transition: transform .5s ease; }',
      '.b { animation-timing-function: cubic-bezier(.215, .61, .355, 1); }',
      '.c { animation: pulse 1s ease-in-out; }',
      '.d { transition-delay: .3s; }',
    ].join('\n');
    const hits = findRawTimings(scss);
    assert.equal(hits.length, 4);
    assert.ok(hits[0].literal.includes('.5s') && hits[0].literal.includes('ease'));
    assert.ok(hits[1].literal.includes('cubic-bezier(.215, .61, .355, 1)'));
    assert.ok(hits[2].literal.includes('1s') && hits[2].literal.includes('ease-in-out'));
    assert.ok(hits[3].literal.includes('.3s'));
  });

  test('var(--motion-*) consumption is clean, but raw literals alongside or inside the fallback are flagged', () => {
    const clean = [
      '.a { transition: opacity var(--motion-duration-ui) var(--motion-easing-standard); }',
      '.b { animation: slide var(--motion-duration-reveal) var(--motion-easing-exit) forwards; }',
    ].join('\n');
    assert.deepEqual(findRawTimings(clean), []);
    const mixed = findRawTimings('.a { transition: opacity var(--motion-duration-ui) 300ms ease; }');
    assert.equal(mixed.length, 1, 'a raw literal next to a token must still be caught');
    assert.ok(mixed[0].literal.includes('300ms'));
    assert.ok(mixed[0].literal.includes('ease'));
    assert.ok(!mixed[0].literal.includes('--motion-duration-ui'));
    const fallback = findRawTimings('.a { transition: width var(--motion-duration-ui, 200ms); }');
    assert.equal(fallback.length, 1, 'a raw fallback inside var() must be caught');
    assert.ok(fallback[0].literal.includes('200ms'));
  });

  test('@keyframes bodies, zero/none, and non-timing properties are ignored', () => {
    const clean = [
      '@keyframes bounce {',
      '  0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(.215, .61, .355, 1); }',
      '  40% { transform: translateY(-30px); animation-timing-function: cubic-bezier(.755, .05, .855, .06); }',
      '}',
      '@-webkit-keyframes spin { to { transform: rotate(360deg); } }',
      '.a { transition: none; }',
      '.b { animation: none; }',
      '.c { transition-delay: 0s; }',
      '.d { transition-duration: 0ms; }',
      '.e { transition-property: opacity; }',
      '.f { animation-name: spin; }',
    ].join('\n');
    assert.deepEqual(findRawTimings(clean), []);
  });

  test('diagnostics carry line, property, and the full declaration for actionable reports', () => {
    const scss = [
      '.x {',
      '  transition: stroke-dashoffset 1s linear;',
      '}',
    ].join('\n');
    const [hit] = findRawTimings(scss);
    assert.equal(hit.line, 2);
    assert.equal(hit.property, 'transition');
    assert.equal(hit.declaration, 'transition: stroke-dashoffset 1s linear');
    assert.ok(hit.literal.includes('1s') && hit.literal.includes('linear'));
  });

  test('broken witness: a raw-timing stylesheet fails, the tokenized twin is clean', () => {
    const broken = [
      '.loader {',
      '  &:before {',
      '    animation: loader 1s ease-in-out infinite;',
      '  }',
      '}',
      '.drawer {',
      '  transition-duration: 300ms;',
      '  transition-timing-function: ease;',
      '}',
    ].join('\n');
    assert.equal(findRawTimings(broken).length, 3, 'the witness must trip on every raw declaration');
    const fixed = broken
      .replace('1s ease-in-out', 'var(--motion-duration-ui) var(--motion-easing-emphasized)')
      .replace('300ms', 'var(--motion-duration-ui)')
      .replace('ease', 'var(--motion-easing-standard)');
    assert.deepEqual(findRawTimings(fixed), []);
  });
});

/* -------------------- Tailwind motion utility scan teeth (T021 review) ----- */

describe('motion utility scan — Tailwind timing utilities are banned', () => {
  test('findMotionUtilities catches timing/easing/transition/animate utilities in @apply bodies', () => {
    const scss = [
      '.a { @apply flex transition duration-300 hover:opacity-75; }',
      '.b { @apply transition-all duration-500; }',
      '.c { @apply transition-opacity; }',
      '.d { @apply transition-[max-height,opacity] duration-200 ease-in; }',
      '.e { @apply delay-500 ease-elastic; }',
      '.f { @apply animate-slideUpFromBottom; }',
      '.g { @apply lg:transition-transform md:duration-300; }',
    ].join('\n');
    const tokens = findMotionUtilities(scss, 'scss').map((h) => h.token);
    assert.deepEqual(tokens, [
      'transition', 'duration-300',
      'transition-all', 'duration-500',
      'transition-opacity',
      'transition-[max-height,opacity]', 'duration-200', 'ease-in',
      'delay-500', 'ease-elastic',
      'animate-slideUpFromBottom',
      'transition-transform', 'duration-300',
    ]);
  });

  test('a bare transition/transition-* utility is a violation even without an explicit duration', () => {
    for (const token of ['transition', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform', 'transition-height']) {
      const hits = findMotionUtilities(`.a { @apply flex ${token}; }`, 'scss');
      assert.equal(hits.length, 1, `${token} compiles default raw duration/easing`);
      assert.equal(hits[0].token, token);
    }
  });

  test('spares token declarations, transition-none/animate-none, and non-motion utilities', () => {
    const clean = [
      '.a { transition: opacity var(--motion-duration-ui) var(--motion-easing-standard); }',
      '.b { @apply flex opacity-50 translate-y-2 hover:shadow-default; }',
      '.c { @apply transition-none animate-none; }',
      '.d { @apply rtl:ml-5 ltr:mr-5 duration-safe-keep; }',
    ].join('\n');
    assert.deepEqual(findMotionUtilities(clean, 'scss'), []);
  });

  test('twig class attributes are scanned, including single-quoted and variant-prefixed', () => {
    const dirty = [
      `<div class="block transition-colors duration-500 hover:shadow-default">{{ x }}</div>`,
      `<div class='list-block post-entry transition-shadow duration-500'></div>`,
    ].join('\n');
    const hits = findMotionUtilities(dirty, 'twig');
    assert.deepEqual(hits.map((h) => h.token), ['transition-colors', 'duration-500', 'transition-shadow', 'duration-500']);
    assert.equal(hits[0].line, 1);
    assert.equal(hits[2].line, 2);
    const clean = `<div class="block opacity-50 {{ loop.first ? 'is-active' : '' }}"></div>`;
    assert.deepEqual(findMotionUtilities(clean, 'twig'), []);
  });

  test('js class strings are scanned; event names and property names are spared', () => {
    const dirty = "this.toggleClassIf(`${id} .modal`, 'ease-out duration-300 opacity-100', 'opacity-0', fn);";
    const hits = findMotionUtilities(dirty, 'js');
    assert.deepEqual(hits.map((h) => h.token), ['ease-out', 'duration-300']);
    const clean = [
      "el.addEventListener('transitionend', handler);",
      'const p = el.style.getPropertyValue("animation-duration");',
      "el.classList.add('is-active opacity-100 translate-y-0');",
    ].join('\n');
    assert.deepEqual(findMotionUtilities(clean, 'js'), []);
  });

  test('the broken witness fixture trips motion-utility at phase 2', () => {
    const witnessScss = readFileSync(join(WITNESS, 'src/assets/styles/02-generic/common.scss'), 'utf8');
    assert.ok(findMotionUtilities(witnessScss, 'scss').length > 0,
      'the witness must carry a banned Tailwind motion utility');
  });
});

/* ---------------------------------------- the deliberately broken witness */

describe('broken witness fixture — the guard proves it catches defects', () => {
  test('the witness fails phase 1 with errors on every active rule family', () => {
    const { findings, errors } = checkMotionSystem({ root: WITNESS, phase: 1 });
    assert.ok(errors > 0, 'the broken witness must fail');
    const rules = new Set(findings.filter((f) => f.level === 'error').map((f) => f.rule));
    for (const rule of ['motion-settings', 'motion-resolver', 'motion-tokens', 'motion-reveal', 'motion-scroll', 'motion-direction']) {
      assert.ok(rules.has(rule), `witness must trip ${rule}`);
    }
  });
});

/* ============================ Runtime Phase B (T014–T020, T023–T026) ====== */

const MOTION_JS = 'src/assets/js/partials/motion.js';
const blankJs = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/\/\/[^\n]*/g, '');

/* ---------------- shared controller: progressive enhancement (T015/T025) -- */

describe('shared motion controller contract (partials/motion.js)', () => {
  test('the controller module exists', () => {
    assert.ok(existsSync(join(ROOT, MOTION_JS)), 'partials/motion.js is missing');
  });

  const source = () => (existsSync(join(ROOT, MOTION_JS)) ? blankJs(read(MOTION_JS)) : '');

  test('timings come from getComputedStyle tokens, not a duplicated profile table', () => {
    const text = source();
    assert.match(text, /getComputedStyle/, 'controller must read computed CSS tokens');
    assert.match(text, /--motion-duration-/, 'controller must consume the semantic --motion-* tokens');
    for (const level of MOTION_LEVELS) {
      assert.ok(!new RegExp(`\\b${level}\\s*:`).test(text),
        `controller must not duplicate the ${level} profile — the token owner is motion.scss`);
    }
  });

  test('one-shot reveal: explicit data-hadeel-reveal opt-in observed once', () => {
    const text = source();
    assert.match(text, /data-hadeel-reveal/, 'reveal must be an explicit opt-in attribute');
    assert.match(text, /IntersectionObserver/, 'reveal must use IntersectionObserver');
    assert.match(text, /unobserve/, 'reveal must unobserve after firing so it never re-arms');
  });

  test('degrades safely: WAAPI and IntersectionObserver are feature-detected', () => {
    const text = source();
    assert.match(text, /'IntersectionObserver'\s+in\s+window|typeof\s+IntersectionObserver/,
      'no IntersectionObserver → no reveal, no functional loss');
    assert.match(text, /typeof\s+\w+\??\.?\w*animate\s*===\s*['"]function['"]|\.animate\s*\?\./,
      'WAAPI must be feature-detected before use');
  });

  test('active theme-owned animations are tracked and cancelled to final state on reduce', () => {
    const text = source();
    assert.match(text, /activeAnimations\s*=\s*new\s+Set/, 'active animations must be tracked');
    assert.match(text, /\.finish\(\)/, 'reduce must finish active animations to their final state');
  });

  test('live MediaQueryList change: reduce activates without a reload', () => {
    const text = source();
    assert.match(text, /matchMedia\(/, 'controller must watch the OS reduce preference');
    assert.match(text, /prefers-reduced-motion:\s*reduce/, 'the watched query must be the OS reduce preference');
    assert.match(text, /addEventListener\(\s*['"]change['"]/, 'the preference change must be live');
  });

  test('reduced motion suppresses future nonessential motion, not just active ones', () => {
    const text = source();
    assert.match(text, /prefersReducedMotion|this\.reduced\b/,
      'feedback/reveal entry points must consult the live reduced state');
  });

  test('one documented controller is exposed for separate bundles', () => {
    const text = source();
    assert.match(text, /window\.hadeelMotion\s*=/, 'window.hadeelMotion is the shared handle');
    const assignments = text.match(/window\.hadeelMotion\s*=/g) ?? [];
    assert.equal(assignments.length, 1, 'exactly one controller exposure');
  });

  test('the controller is non-directional and owns no timers or Anime runtime', () => {
    const text = source();
    assert.ok(!/translateX\s*\(/.test(text), 'reveal/feedback must not use a physical axis');
    assert.deepEqual(findRecurringTimers(text), [], 'the controller must not run timers');
    assert.deepEqual(findBannedJs(text), [], 'the controller must not touch AnimeJS');
  });
});

/* ------------- Runtime Phase B review remediation: behavioral tests ---------
 * Small dependency-free window/document/animation mocks drive the real
 * HadeelMotion class through the review findings: matchMedia absence, legacy
 * MediaQueryList listeners, exactly-once reveal across reduce toggles,
 * finished-less animation tracking, live reduce settling, and shared
 * CSS-class feedback registration/cleanup. */

const flushMicrotasks = () => new Promise((resolve) => setImmediate(resolve));

function mockMql({ matches = false, legacy = false } = {}) {
  const listeners = new Set();
  const mql = { matches, addCalls: 0, removeCalls: 0 };
  if (legacy) {
    mql.addListener = (fn) => { mql.addCalls++; listeners.add(fn); };
    mql.removeListener = (fn) => { mql.removeCalls++; listeners.delete(fn); };
  } else {
    mql.addEventListener = (type, fn) => { mql.addCalls++; listeners.add(fn); };
    mql.removeEventListener = (type, fn) => { mql.removeCalls++; listeners.delete(fn); };
  }
  mql.fire = (next) => {
    mql.matches = next;
    for (const fn of [...listeners]) fn({ matches: next });
  };
  return mql;
}

function mockAnimation({ withFinished = true, finishThrows = false } = {}) {
  const listeners = { finish: [], cancel: [] };
  const animation = {
    finishCalls: 0,
    cancelCalls: 0,
    addEventListener: (type, fn) => listeners[type].push(fn),
    removeEventListener: (type, fn) => {
      listeners[type] = listeners[type].filter((f) => f !== fn);
    },
    finish() {
      animation.finishCalls++;
      if (finishThrows) throw new Error('InvalidStateError');
      animation.resolveFinished?.();
      for (const fn of [...listeners.finish]) fn();
    },
    cancel() {
      animation.cancelCalls++;
      animation.resolveFinished?.();
      for (const fn of [...listeners.cancel]) fn();
    },
  };
  if (withFinished) {
    animation.finished = new Promise((resolve) => { animation.resolveFinished = resolve; });
  }
  return animation;
}

function mockElement({ withWaapi = true } = {}) {
  const classes = new Set();
  const element = {
    animateCalls: 0,
    offsetWidth: 0,
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
  };
  if (withWaapi) {
    element.animate = () => {
      element.animateCalls++;
      element.lastAnimation = mockAnimation();
      return element.lastAnimation;
    };
  }
  return element;
}

function installDom({
  mql = null,
  withMatchMedia = true,
  withGetComputedStyle = true,
  body = {},
  computedValues = {},
  revealTargets = [],
} = {}) {
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    IntersectionObserver: globalThis.IntersectionObserver,
  };
  const timeouts = [];
  globalThis.window = {
    setTimeout: (fn, ms) => { timeouts.push({ fn, ms }); return timeouts.length; },
  };
  if (withMatchMedia) globalThis.window.matchMedia = () => mql;
  if (withGetComputedStyle) {
    globalThis.window.getComputedStyle = () => ({
      getPropertyValue: (name) => computedValues[name] ?? '',
    });
  }
  globalThis.document = {
    body,
    documentElement: {},
    querySelectorAll: () => revealTargets,
  };
  return {
    timeouts,
    restore() {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.IntersectionObserver = previous.IntersectionObserver;
    },
  };
}

function installIntersectionObserver() {
  const instances = [];
  globalThis.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.observed = new Set();
      this.disconnectCalls = 0;
      instances.push(this);
    }
    observe(target) { this.observed.add(target); }
    unobserve(target) { this.observed.delete(target); }
    disconnect() { this.disconnectCalls++; this.observed.clear(); }
  };
  globalThis.window.IntersectionObserver = globalThis.IntersectionObserver;
  return instances;
}

describe('behavioral: progressive enhancement survives absent/legacy matchMedia', () => {
  test('no window.matchMedia: constructs, stays non-reduced, destroys cleanly', () => {
    const dom = installDom({ withMatchMedia: false });
    try {
      const controller = new HadeelMotion();
      assert.equal(controller.prefersReducedMotion, false);
      assert.doesNotThrow(() => controller.destroy());
    } finally {
      dom.restore();
    }
  });

  test('legacy MediaQueryList: addListener is installed, removeListener on destroy', () => {
    const mql = mockMql({ legacy: true });
    const dom = installDom({ mql });
    try {
      const controller = new HadeelMotion();
      assert.equal(mql.addCalls, 1);
      mql.fire(true);
      assert.equal(controller.prefersReducedMotion, true);
      controller.destroy();
      assert.equal(mql.removeCalls, 1);
      mql.fire(false);
      assert.equal(controller.prefersReducedMotion, true,
        'a removed legacy listener must never fire again');
    } finally {
      dom.restore();
    }
  });

  test('token() falls back to documentElement, then to empty without getComputedStyle', () => {
    const dom = installDom({ body: null, computedValues: { '--motion-duration-ui': '200ms' } });
    try {
      const controller = new HadeelMotion();
      assert.equal(controller.token('--motion-duration-ui'), '200ms');
      assert.equal(controller.durationMs('--motion-duration-ui', 7), 200);
    } finally {
      dom.restore();
    }
    const bare = installDom({ withGetComputedStyle: false });
    try {
      const controller = new HadeelMotion();
      assert.equal(controller.token('--motion-duration-ui'), '');
      assert.equal(controller.durationMs('--motion-duration-ui', 7), 7);
      assert.equal(controller.distancePx('--motion-reveal-distance', 3), 3);
    } finally {
      bare.restore();
    }
  });
});

describe('behavioral: reveal is exactly once across reduce false→true→false', () => {
  const REVEAL_TOKENS = {
    '--motion-duration-reveal': '200ms',
    '--motion-reveal-distance': '8px',
    '--motion-easing-standard': 'ease',
  };

  test('a revealed target is never re-observed or replayed after reduce toggles', () => {
    const mql = mockMql();
    const element = mockElement();
    const pending = mockElement();
    const dom = installDom({ mql, computedValues: REVEAL_TOKENS, revealTargets: [element, pending] });
    const instances = installIntersectionObserver();
    try {
      new HadeelMotion();
      assert.equal(instances.length, 1);
      assert.ok(instances[0].observed.has(element));
      instances[0].callback([{ isIntersecting: true, target: element }]);
      assert.equal(element.animateCalls, 1, 'first intersection reveals once');

      mql.fire(true);
      assert.equal(instances[0].disconnectCalls, 1, 'reduce disarms pending reveal');
      mql.fire(false);
      assert.equal(instances.length, 2, 'reveal re-arms when reduce lifts');
      assert.ok(!instances[1].observed.has(element),
        'an already revealed target must never be re-observed');
      assert.ok(instances[1].observed.has(pending),
        'an unrevealed target is observed again after the toggle');
      instances[1].callback([{ isIntersecting: true, target: element }]);
      assert.equal(element.animateCalls, 1, 'reveal must never replay');
    } finally {
      dom.restore();
    }
  });

  test('a no-WAAPI target is marked revealed on first intersection (no-op stays once)', () => {
    const mql = mockMql();
    const element = mockElement({ withWaapi: false });
    const dom = installDom({ mql, computedValues: REVEAL_TOKENS, revealTargets: [element] });
    const instances = installIntersectionObserver();
    try {
      new HadeelMotion();
      instances[0].callback([{ isIntersecting: true, target: element }]);
      mql.fire(true);
      mql.fire(false);
      assert.ok(!instances[1] || !instances[1].observed.has(element),
        'the no-op reveal still counts as revealed — no re-observation');
    } finally {
      dom.restore();
    }
  });
});

describe('behavioral: tracking tolerates finished-less animations; reduce settles all', () => {
  test('track() releases a finished-less animation via its finish event', () => {
    const dom = installDom({ mql: mockMql() });
    try {
      const controller = new HadeelMotion();
      const animation = mockAnimation({ withFinished: false });
      controller.track(animation);
      assert.equal(controller.activeAnimations.size, 1);
      animation.finish();
      assert.equal(controller.activeAnimations.size, 0);
    } finally {
      dom.restore();
    }
  });

  test('track() accepts an animation with neither finished nor events', () => {
    const dom = installDom({ mql: mockMql() });
    try {
      const controller = new HadeelMotion();
      const bare = { finish() {}, cancel() {} };
      assert.doesNotThrow(() => controller.track(bare));
      assert.equal(controller.activeAnimations.size, 1);
    } finally {
      dom.restore();
    }
  });

  test('a live reduce change finishes every tracked animation, cancel as fallback', () => {
    const mql = mockMql();
    const dom = installDom({ mql });
    try {
      const controller = new HadeelMotion();
      const normal = mockAnimation();
      const throwing = mockAnimation({ finishThrows: true });
      controller.track(normal);
      controller.track(throwing);
      mql.fire(true);
      assert.equal(normal.finishCalls, 1);
      assert.equal(throwing.finishCalls, 1);
      assert.equal(throwing.cancelCalls, 1, 'cancel fallback when finish() throws');
      assert.equal(controller.activeAnimations.size, 0);
      assert.equal(controller.feedback(mockElement()), null,
        'reduce suppresses new nonessential motion');
    } finally {
      dom.restore();
    }
  });
});

describe('behavioral: shared CSS-class feedback (playClassFeedback)', () => {
  test('restarts the class, tracks getAnimations(), cleans the class after completion', async () => {
    const mql = mockMql();
    const dom = installDom({ mql });
    try {
      const controller = new HadeelMotion();
      const element = mockElement();
      const animation = mockAnimation();
      element.getAnimations = () => [animation];

      const tracked = controller.playClassFeedback(element, 'fx');
      assert.ok(element.classList.contains('fx'));
      assert.deepEqual(tracked, [animation]);
      assert.equal(controller.activeAnimations.size, 1);

      animation.finish();
      await flushMicrotasks();
      assert.ok(!element.classList.contains('fx'), 'class removed once the animation settles');
      assert.equal(controller.activeAnimations.size, 0);
    } finally {
      dom.restore();
    }
  });

  test('a live reduce change settles the class feedback and cleans the class', async () => {
    const mql = mockMql();
    const dom = installDom({ mql });
    try {
      const controller = new HadeelMotion();
      const element = mockElement();
      const animation = mockAnimation();
      element.getAnimations = () => [animation];

      controller.playClassFeedback(element, 'fx');
      mql.fire(true);
      assert.equal(animation.finishCalls, 1, 'reduce finishes the class-driven animation too');
      await flushMicrotasks();
      assert.ok(!element.classList.contains('fx'));
    } finally {
      dom.restore();
    }
  });

  test('without getAnimations a one-shot timer derived from computed duration+delay cleans up', () => {
    const dom = installDom({
      mql: mockMql(),
      computedValues: { 'animation-duration': '300ms', 'animation-delay': '0.1s' },
    });
    try {
      const controller = new HadeelMotion();
      const element = mockElement(); // no getAnimations → fallback path
      const result = controller.playClassFeedback(element, 'fx');
      assert.equal(result, null);
      assert.ok(element.classList.contains('fx'));
      assert.equal(dom.timeouts.length, 1, 'exactly one one-shot timer');
      assert.equal(dom.timeouts[0].ms, 400, '300ms duration + 0.1s delay, never a raw constant');
      dom.timeouts[0].fn();
      assert.ok(!element.classList.contains('fx'));
    } finally {
      dom.restore();
    }
  });

  test('reduced motion suppresses class feedback entirely', () => {
    const dom = installDom({ mql: mockMql({ matches: true }) });
    try {
      const controller = new HadeelMotion();
      const element = mockElement();
      element.getAnimations = () => [mockAnimation()];
      assert.equal(controller.playClassFeedback(element, 'fx'), null);
      assert.ok(!element.classList.contains('fx'));
      assert.equal(dom.timeouts.length, 0);
    } finally {
      dom.restore();
    }
  });
});

/* ---------------- controller initialization without a new entry (T016) ---- */

describe('controller initialization in the existing app entry', () => {
  test('app.js imports and initializes the shared controller', () => {
    const appJs = blankJs(read('src/assets/js/app.js'));
    assert.match(appJs, /from\s+['"]\.\/partials\/motion['"]/, 'app.js must import the controller partial');
    assert.match(appJs, /initHadeelMotion\s*\(\)/, 'app.js must initialize the controller');
  });

  test('app.js keeps one entry: no dynamic import or new chunk for motion', () => {
    const appJs = blankJs(read('src/assets/js/app.js'));
    assert.ok(!/import\s*\(\s*['"][^'"]*motion/.test(appJs),
      'the controller must load inside the existing app bundle, not a lazy chunk');
  });
});

/* ---------------------- no runtime AnimeJS anywhere in src (T018/T019) ----- */

describe('no runtime AnimeJS import, global, or module in the repository', () => {
  test('no theme JS file carries a banned AnimeJS runtime pattern', () => {
    for (const f of walk(join(ROOT, 'src/assets/js'), ['.js'])) {
      const hits = findBannedJs(blankJs(readFileSync(f, 'utf8')));
      assert.deepEqual(hits, [], `${f.slice(ROOT.length + 1)}: banned AnimeJS pattern at line(s) ${hits.map((h) => h.line)}`);
    }
  });

  test('the anime wrapper module is deleted', () => {
    assert.ok(!existsSync(join(ROOT, 'src/assets/js/partials/anime.js')),
      'partials/anime.js must be deleted (dependency files stay unchanged)');
  });

  test('app.js no longer exposes the app.anime wrapper', () => {
    const appJs = blankJs(read('src/assets/js/app.js'));
    assert.ok(!/\banime\s*\(\s*selector/.test(appJs), 'the app.anime(selector) wrapper method must be removed');
  });
});

/* ------------- product: action-only feedback, no recurring timer (T017/T026) */

describe('product add-to-cart feedback is action-driven only', () => {
  const productJs = () => blankJs(read('src/assets/js/product.js'));
  const singleTwig = () => read('src/views/pages/product/single.twig');

  test('product.js has no recurring timer at all', () => {
    assert.deepEqual(findRecurringTimers(productJs()), [], 'the periodic CTA attention loop must be gone');
  });

  test('the legacy interval data attribute is neither rendered nor read', () => {
    assert.ok(!singleTwig().includes('data-add-to-cart-animation-interval'),
      'single.twig must not render the obsolete interval attribute');
    assert.ok(!/addToCartAnimationInterval/.test(productJs()),
      'product.js must not read the legacy interval dataset');
  });

  test('the merchant-selected feedback attribute is still rendered', () => {
    assert.match(singleTwig(), /data-add-to-cart-animation="\{\{\s*theme\.settings\.get\('product_add_to_cart_animation'/);
  });

  test('feedback binds to a real customer action on the theme-rendered host', () => {
    const text = productJs();
    assert.match(text, /addEventListener\(\s*['"]click['"]/, 'feedback must follow a real click/action');
    assert.ok(!/\.s-button/.test(text),
      'feedback must target the salla-add-product-button host, never private .s-button-* internals');
  });

  test('feedback does not imply cart success or failure', () => {
    const text = productJs();
    const feedbackBlock = text.match(/addEventListener\(\s*['"]click['"][\s\S]{0,600}/)?.[0] ?? '';
    assert.ok(!/success|added|onItemAdded|salla\.cart/.test(feedbackBlock),
      'the click feedback must not claim the add-to-cart request succeeded');
  });

  test('reduced motion is the shared live state, not an initial-load-only branch', () => {
    const text = productJs();
    assert.match(text, /window\.hadeelMotion\??\.?/, 'product feedback must read the shared controller state');
    assert.ok(!/matchMedia\(\s*['"]\(prefers-reduced-motion/.test(text),
      'an initial-load-only matchMedia branch misses mid-session preference changes');
  });

  test('CSS-class feedback is delegated to the shared controller, no private timer', () => {
    const text = productJs();
    assert.match(text, /window\.hadeelMotion\?\.playClassFeedback\(/,
      'class feedback must register with the shared controller so a live reduce settles it');
    const block = text.match(/initAddToCartFeedback\s*\(\)\s*\{[\s\S]{0,900}/)?.[0] ?? '';
    assert.ok(!/setTimeout|1400/.test(block),
      'no private one-shot constant or timer — cleanup derives from computed duration/delay');
  });
});

/* --------------------------- blog: native update/feedback (T018) ----------- */

describe('blog like uses native state with optional shared feedback', () => {
  const blogJs = () => blankJs(read('src/assets/js/blog.js'));

  test('blog.js carries no AnimeJS runtime pattern', () => {
    assert.deepEqual(findBannedJs(blogJs()), []);
  });

  test('the like count updates synchronously with native APIs', () => {
    const text = blogJs();
    assert.match(text, /countSpan\.(textContent|innerText)\s*=/,
      'the count must be written synchronously — Salla owns request success/failure');
  });

  test('WAAPI feedback is optional and goes through the shared controller', () => {
    assert.match(blogJs(), /window\.hadeelMotion\?\./,
      'blog feedback must be an optional call on the shared controller');
  });
});

/* ----------------- loyalty: no Anime dependency, real points (T0xx port) --- */

describe('loyalty runs without AnimeJS and never manufactures points', () => {
  const loyaltyJs = () => blankJs(read('src/assets/js/loyalty.js'));
  const loyaltyTwig = () => read('src/views/pages/loyalty.twig');

  test('loyalty.js carries no AnimeJS runtime pattern or timeline', () => {
    const text = loyaltyJs();
    assert.deepEqual(findBannedJs(text), []);
    assert.ok(!/\.timeline\s*\(/.test(text), 'the anime timeline must be gone');
  });

  test('loyalty.js never counts from zero', () => {
    assert.ok(!/innerText\s*:\s*\[\s*0/.test(loyaltyJs()),
      'counting up from 0 manufactures information — the server renders the real value');
  });

  test('loyalty.twig server-renders the real user.loyalty_points value', () => {
    assert.match(loyaltyTwig(),
      /class="count-number count-anime"\s+data-count="\{\{\s*user\.loyalty_points\s*\}\}"\s*>\s*\{\{\s*user\.loyalty_points\s*\}\}/,
      'the visible points value must be server-rendered, not 0 waiting for JS');
  });

  test('any loyalty visual feedback is optional and shared-controller based', () => {
    const text = loyaltyJs();
    if (/feedback|animate/.test(text)) {
      assert.match(text, /window\.hadeelMotion\?\./,
        'loyalty feedback must go through the shared controller, never a private animation engine');
    }
  });
});

/* ------------------- reveal opt-ins on approved specimens (T020) ----------- */

describe('explicit reveal opt-ins on the approved noncritical Home specimens', () => {
  test('each approved specimen opts in exactly once', () => {
    for (const p of REVEAL_ALLOWLIST) {
      const text = read(p).replace(/\{#[\s\S]*?#\}/g, '');
      const hits = text.match(/data-hadeel-reveal/g) ?? [];
      assert.equal(hits.length, 1, `${p} must carry exactly one data-hadeel-reveal opt-in`);
    }
  });
});

/* ====================== T022: source parity / audit (US2 evidence) ========= */

const SCSS_FILES = walk(join(ROOT, 'src/assets/styles'), ['.scss']);
const COMMON_SCSS = 'src/assets/styles/02-generic/common.scss';
const ANIMATIONS_SCSS = 'src/assets/styles/02-generic/animations.scss';
const readSrc = (p) => readFileSync(join(ROOT, p), 'utf8');

/** Split a transition value on top-level commas (parens-aware). */
function splitTransitionList(value) {
  const parts = [];
  let depth = 0;
  let buf = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(buf); buf = ''; } else buf += ch;
  }
  parts.push(buf);
  return parts.map((p) => p.trim()).filter(Boolean);
}

describe('layout-safe motion: no layout property is animated (T022)', () => {
  const LAYOUT_PROPS = new Set([
    'all', 'height', 'width', 'top', 'left', 'right', 'bottom',
    'max-height', 'max-width', 'min-height', 'min-width',
    'grid-template-rows', 'grid-template-columns', 'margin', 'padding', 'flex', 'gap',
  ]);

  test('every transition declaration animates only paint/composite-safe properties', () => {
    const offenders = [];
    const decl = /(?:^|[;{])\s*(?:-webkit-)?transition\s*:\s*([^;{}]+)/g;
    for (const f of SCSS_FILES) {
      const relPath = f.slice(ROOT.length + 1);
      const lines = blankJs(readFileSync(f, 'utf8')).split('\n');
      for (let n = 0; n < lines.length; n++) {
        let m;
        decl.lastIndex = 0;
        while ((m = decl.exec(lines[n]))) {
          const value = m[1].trim();
          if (value === 'none') continue;
          // The named functional progress exceptions (ring stroke, progress
          // widths) are allowed to transition their state property.
          if (NAMED_TIMING_EXCEPTIONS.some((e) => e.file === relPath && m[0].includes(e.selector))) continue;
          for (const segment of splitTransitionList(value)) {
            const first = segment.split(/\s+/)[0];
            // A segment starting with a time/easing/var means "all properties".
            const property = /^(var\(|[\d.]|ease|linear|cubic-bezier|steps)/.test(first) ? 'all' : first;
            if (LAYOUT_PROPS.has(property)) {
              offenders.push(`${relPath}:${n + 1} transitions "${property}" (${value})`);
            }
          }
        }
      }
    }
    assert.deepEqual(offenders, [], `layout-animating transitions:\n${offenders.join('\n')}`);
  });

  test('no bare `transition: all` or property-less transition shorthand remains', () => {
    const offenders = [];
    const decl = /(?:^|[;{])\s*transition\s*:\s*([^;{}]+)/g;
    for (const f of SCSS_FILES) {
      const relPath = f.slice(ROOT.length + 1);
      const lines = blankJs(readFileSync(f, 'utf8')).split('\n');
      for (let n = 0; n < lines.length; n++) {
        let m;
        decl.lastIndex = 0;
        while ((m = decl.exec(lines[n]))) {
          const value = m[1].trim();
          if (value === 'none') continue;
          for (const segment of splitTransitionList(value)) {
            const first = segment.split(/\s+/)[0];
            if (first === 'all' || /^(var\(|[\d.]|ease|linear)/.test(first)) {
              offenders.push(`${relPath}:${n + 1} (${value})`);
            }
          }
        }
      }
    }
    assert.deepEqual(offenders, [], `unqualified transitions:\n${offenders.join('\n')}`);
  });
});

describe('logical direction parity and no mirroring (T022, FR-011)', () => {
  test('slideInStart enters from the logical start edge: sign flips with dir, distance is a token', () => {
    const common = readSrc(COMMON_SCSS);
    assert.match(common, /--hadeel-motion-start-sign:\s*-1;/, 'LTR default sign');
    assert.match(common, /\[dir="rtl"\]\s*\{\s*--hadeel-motion-start-sign:\s*1;/, 'RTL flips the sign');
    const keyframes = blockBody(common, /@keyframes slideInStart\s*\{/);
    assert.match(keyframes, /translateX\(calc\(var\(--hadeel-motion-start-sign, -1\) \* var\(--motion-reveal-distance\)\)\)/);
    assert.ok(!/translateX\((?!calc)[^)]*[1-9][^)]*\)/.test(keyframes), 'no fixed physical offset remains');
  });

  test('toTopFromBottom moves on the vertical axis its name says, token distance', () => {
    const animations = readSrc(ANIMATIONS_SCSS);
    const keyframes = blockBody(animations, /@keyframes toTopFromBottom\s*\{/);
    assert.match(keyframes, /translateY\(var\(--motion-reveal-distance\)\)/);
    assert.ok(!/translateX/.test(keyframes), 'vertical effect must not use the X axis');
  });

  test('the physical toRightFromLeft slide is gone; its replacement is non-directional', () => {
    const all = SCSS_FILES.map((f) => readFileSync(f, 'utf8')).join('\n');
    assert.ok(!/toRightFromLeft/.test(all), 'toRightFromLeft must be fully removed');
    const keyframes = blockBody(readSrc(ANIMATIONS_SCSS), /@keyframes featureIconPop\s*\{/);
    assert.ok(keyframes, 'featureIconPop must exist');
    assert.ok(!/translate|left|right|rotate/.test(keyframes), 'scale/opacity only — nothing to mirror');
  });

  test('mirroring is never a motion effect and never touches media/logos', () => {
    // Every scaleX(-1) in the stylesheets must be a static directional-icon
    // glyph correction (arrow/truck facing the reading direction) — never an
    // animation keyframe and never an image, logo, or other media.
    for (const f of SCSS_FILES) {
      const relPath = f.slice(ROOT.length + 1);
      const text = blankJs(readFileSync(f, 'utf8'));
      const keyframes = text.match(/@(?:-webkit-)?keyframes[^{]*\{[\s\S]*?\n\}/g) ?? [];
      for (const block of keyframes) {
        assert.ok(!/scaleX\(\s*-/.test(block), `${relPath}: mirroring inside @keyframes`);
      }
      assert.ok(!/(img|picture|video|svg|logo)[^{}]*\{[^{}]*scaleX\(\s*-/.test(text),
        `${relPath}: media/logo mirroring`);
      const uses = text.match(/scaleX\(\s*-1\)/g) ?? [];
      const corrections = text.match(/sicon-[^{]*\{[^}]*scaleX\(\s*-1\)|\.flip-x\s*\{[^}]*scaleX\(\s*-1\)|nav--start i\s*\{[^}]*scaleX\(\s*-1\)/g) ?? [];
      assert.equal(uses.length, corrections.length,
        `${relPath}: scaleX(-1) outside a documented directional-icon correction`);
    }
    const twigUses = readSrc('src/views/components/header/header.twig').match(/flip-x/g) ?? [];
    assert.equal(twigUses.length, 1, 'flip-x stays confined to the directional shipping icon');
  });

  test('the branch-picker arrow keeps logical rtl/ltr variants with a token-timed transition', () => {
    const single = readSrc('src/views/pages/product/single.twig');
    assert.ok(!/transition-all/.test(single), 'the transition-all utility is removed');
    assert.match(single, /rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1/);
    assert.match(readSrc('src/assets/styles/04-components/product.scss'),
      /\.with-arrow \.sicon-keyboard_arrow_left\s*\{\s*transition: transform var\(--motion-duration-ui\)/);
  });
});

describe('hover-driven theme controls have keyboard parity (T022, FR-009)', () => {
  test('banner text reveal and feature-icon effect fire on focus-within too', () => {
    const homeBlocks = readSrc('src/assets/styles/04-components/home-blocks.scss');
    const parity = homeBlocks.match(/&:hover,\s*&:focus-within\s*\{/g) ?? [];
    assert.equal(parity.length, 2, 'both hover-only reveals need :focus-within parity');
  });

  test('product-card hover reveals already carry :focus-within (regression pin)', () => {
    const card = readSrc('src/assets/styles/04-components/product-card.scss');
    assert.match(card, /:hover\s+[^{]+,\s*[^{]*:focus-within/);
  });
});

describe('no critical content waits for a timer (T022, FR-007/FR-008)', () => {
  test('home featured-tabs switch to the final visible state immediately', () => {
    const home = blankJs(readSrc('src/assets/js/home.js'));
    assert.ok(!/setTimeout|setInterval/.test(home), 'no hide-then-fade timer');
    assert.ok(!/is-active opacity-0/.test(home), 'the active tab never starts hidden');
    assert.match(home, /'is-active opacity-100 translate-y-0'/);
  });

  test('thank-you stagger is data plus the stagger token — no raw runtime duration', () => {
    const thankyou = blankJs(readSrc('src/assets/js/thankyou.js'));
    assert.ok(!/\d+\s*ms/.test(thankyou), 'no raw millisecond value');
    assert.ok(!/animationDelay\s*=/.test(thankyou), 'no inline raw animation-delay');
    assert.match(thankyou, /setProperty\('--motion-stagger-index'/);
    assert.match(readSrc(COMMON_SCSS),
      /animation-delay:\s*calc\(var\(--motion-stagger-index, 0\) \* var\(--motion-stagger\)\)/);
  });

  test('wishlist removal is opacity-only with no forced reflow', () => {
    const wishlist = blankJs(readSrc('src/assets/js/wishlist.js'));
    assert.ok(!/offsetHeight|offsetWidth|style\.height/.test(wishlist), 'no layout read/write cycle');
    assert.match(wishlist, /transitionend/);
    const body = blockBody(readSrc(COMMON_SCSS), /\.fade-out-collapse\s*\{/);
    assert.ok(!/height/.test(body), 'no height animation or pinning');
    assert.match(body, /transition:\s*opacity var\(--motion-duration-ui\) var\(--motion-easing-exit\)/);
  });

  test('theme modal: state classes only, token-owned transition, token-derived bounded cleanup', () => {
    const appJs = blankJs(readSrc('src/assets/js/app.js'));
    const modal = appJs.match(/toggleModal\(id, isOpen\)\s*\{[\s\S]{0,1400}/)?.[0] ?? '';
    assert.ok(modal, 'toggleModal must exist');
    assert.ok(!/duration-\d|ease-out|\b350\b/.test(modal), 'no utility classes or raw constants');
    assert.match(modal, /hadeelMotion\?\.durationMs/, 'cleanup derives from the computed token');
    const common = readSrc(COMMON_SCSS);
    assert.match(common, /\.s-salla-modal-overlay\s*\{\s*transition: opacity var\(--motion-duration-ui\)/);
    assert.match(common, /\.s-salla-modal-body\s*\{\s*transition: opacity var\(--motion-duration-ui\) var\(--motion-easing-standard\), transform var\(--motion-duration-ui\)/);
  });
});

describe('migrated Twig/SCSS hooks stay consistent (T022)', () => {
  test('utility removals in templates are backed by owner rules', () => {
    const userPages = readSrc('src/assets/styles/04-components/user-pages.scss');
    for (const sel of ['.thankyou-card', '.thankyou-block a', '.order-product-link', '.post-entry']) {
      assert.ok(userPages.includes(sel), `${sel} rule must exist in user-pages.scss`);
      assert.match(userPages, new RegExp(`${sel.replace(/[.*]/g, '\\$&')}\\s*\\{\\s*transition: [^;]*var\\(--motion-duration-ui\\)`),
        `${sel} must be token-timed`);
    }
    assert.ok(!/class="[^"]*\btransition\b/.test(readSrc('src/views/pages/thank-you.twig')));
    assert.ok(!/transition-colors/.test(readSrc('src/views/pages/customer/orders/single.twig')));
    assert.ok(!/transition-shadow|duration-500/.test(readSrc('src/views/pages/blog/index.twig')));
  });
});

/* ====================== T027: reduced-motion local proof (US3) ============= */

describe('declarative reduced-motion coverage (T027, FR-004/FR-005)', () => {
  test('the loader spinner is stopped under reduce in its owner file', () => {
    const common = readSrc(COMMON_SCSS);
    const idx = common.indexOf('@media (prefers-reduced-motion: reduce)');
    assert.ok(idx > -1, 'common.scss needs a reduce block');
    assert.match(common.slice(idx), /\.loader:before\s*\{\s*animation:\s*none/);
  });

  test('add-to-cart class feedback is fully disabled under reduce', () => {
    const product = readSrc('src/assets/styles/04-components/product.scss');
    const idx = product.indexOf('@media (prefers-reduced-motion: reduce)');
    assert.ok(idx > -1);
    assert.match(product.slice(idx), /\[class\*='hadeel-atc-animation--'\]\s*\{\s*animation:\s*none/);
  });

  test('reveal distances are token-driven so reduce zeroes them (fadeInDown included)', () => {
    const animations = readSrc(ANIMATIONS_SCSS);
    assert.ok(!/translate3d\(0, -15px/.test(animations), 'raw 15px reveal distance is gone');
    assert.match(animations, /calc\(var\(--motion-reveal-distance\) \* -1\)/);
  });

  test('the stagger token is zero under reduce, so index-based stagger collapses', () => {
    const motion = readSrc('src/assets/styles/01-settings/motion.scss');
    const reduced = blockBody(motion, /@media\s*\(prefers-reduced-motion:\s*reduce\)[^{]*\{/);
    assert.match(reduced, /--motion-stagger:\s*0ms/);
    assert.match(reduced, /--motion-duration-reveal:\s*0ms/);
    assert.match(reduced, /--motion-reveal-distance:\s*0px/);
  });

  test('functional state indicators keep their meaning under reduce', () => {
    // The four progress exceptions transition a state property only (no spatial
    // motion); the toast one is additionally forced to `transition: none` under
    // reduce by its existing owner block.
    const toast = readSrc('src/assets/styles/04-components/add-product-toast.scss');
    const idx = toast.indexOf('@media (prefers-reduced-motion: reduce)');
    assert.ok(idx > -1);
    assert.match(toast.slice(idx), /transition:\s*none/);
    // No reduce block anywhere hides content or controls.
    for (const f of SCSS_FILES) {
      const text = blankJs(readFileSync(f, 'utf8'));
      for (const block of text.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\}\s*\}/g) ?? []) {
        assert.ok(!/display\s*:\s*none|visibility\s*:\s*hidden/.test(block),
          `${f.slice(ROOT.length + 1)} hides content under reduce`);
      }
    }
  });
});

/* ----------------------------------- the repository passes the active gate */

describe('repository state against the active phase', () => {
  test('the active phase enforces foundation and runtime-adoption rules (T021)', () => {
    assert.equal(MOTION_PHASE_ACTIVE, 2);
  });

  test('checkMotionSystem reports zero errors on the real repository', () => {
    const { findings, errors } = checkMotionSystem({ root: ROOT });
    assert.equal(errors, 0,
      `the active gate must be clean: ${JSON.stringify(findings.filter((f) => f.level === 'error').slice(0, 3), null, 2)}`);
  });
});
