#!/usr/bin/env node
/**
 * Hadeel theme guard.
 *
 * Catches the regression classes that repeatedly shipped in this repo:
 *   1. the same selector styled in two component files that fight over source order
 *   2. hardcoded Arabic strings in JS (translations must come from src/locales)
 *   3. theme classes styled in SCSS that no template ever renders (dead / drifted)
 *   4. var(--token) references with no definition and no fallback
 *   5. theme.settings.get(...) keys that twilight.json never declares
 *   6. public/ out of sync with src/  (only with --build)
 *
 * Usage:
 *   node scripts/check-theme.mjs                # static checks
 *   node scripts/check-theme.mjs --build        # also rebuild and diff public/
 *   node scripts/check-theme.mjs --json         # machine-readable output
 *   node scripts/check-theme.mjs --max-errors=N # ratchet: pass while errors <= N
 *
 * The repo starts with a known backlog of errors. CI pins --max-errors to that
 * number so the count can only go down. Lower the pin whenever you clear some.
 */

import { readFileSync, readdirSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, relative, extname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import process from 'node:process';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const argv = process.argv.slice(2);
const args = new Set(argv);
const WANT_BUILD = args.has('--build');
const AS_JSON = args.has('--json');
const MAX_ERRORS = Number(
  argv.find((a) => a.startsWith('--max-errors='))?.split('=')[1] ?? 0
);

/* ------------------------------------------------------------------ config */

/** CSS custom properties owned by third parties or injected at runtime. */
const EXTERNAL_CSS_VARS = new Set([
  '--font-main', '--color-primary', '--color-primary-dark',
  '--color-primary-light', '--color-primary-reverse', // master.twig inline <style>
  '--animate-duration', '--animate-delay', '--animate-repeat', // animate.css
  '--tw-text-opacity', '--tw-bg-opacity', '--tw-border-opacity', // tailwind
  '--mm-spn-item-height', '--mm-spn-item-indent', '--mm-spn-line-height', // mmenu-light
]);

/** Class prefixes worth policing. Everything else is Tailwind or Twilight. */
const THEME_CLASS_PREFIXES = ['kalles-', 'hadeel-', 'store-header', 'store-footer',
  'main-nav', 'announcement-bar', 'header-action', 'header-icon', 'header-account',
  'header-cart', 'header-user', 'products-index', 'filters-'];

const SRC = join(ROOT, 'src');
const STYLES = join(SRC, 'assets/styles');

/* ------------------------------------------------------------------ helpers */

function walk(dir, exts) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, exts));
    else if (exts.includes(extname(name))) out.push(full);
  }
  return out;
}

const read = (p) => readFileSync(p, 'utf8');
const rel = (p) => relative(ROOT, p);

/** Strip Twig `{# … #}` + HTML `<!-- … -->`, or JS `/* … *\/` + `// …`. */
function stripComments(text, kind) {
  if (kind === 'twig') {
    return text.replace(/\{#[\s\S]*?#\}/g, '').replace(/<!--[\s\S]*?-->/g, '');
  }
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** Blank out SCSS comments while preserving line numbers, for line-accurate reports. */
function blankComments(text) {
  const keepNewlines = (m) => m.replace(/[^\n]/g, ' ');
  return text.replace(/\/\*[\s\S]*?\*\//g, keepNewlines).replace(/\/\/[^\n]*/g, keepNewlines);
}

const findings = [];
const note = (check, level, message, where) =>
  findings.push({ check, level, message, where });

/* --------------------------------------------------- 1. duplicate selectors */

/** Remove nested `{ … }` blocks so only a rule's own declarations remain. */
function ownDeclarations(body) {
  let out = '';
  let depth = 0;
  for (const ch of body) {
    if (ch === '{') { depth++; continue; }
    if (ch === '}') { depth = Math.max(0, depth - 1); continue; }
    if (depth === 0) out += ch;
  }
  return out;
}

/**
 * Top-level selectors that carry at least one declaration of their own.
 *
 * Two exclusions, both deliberate:
 *   - nested SCSS, because a nested rule is scoped by its parent and cannot collide
 *     across files the same way;
 *   - rules whose body is only nested children (`.s-block { &__title { … } }`), because
 *     they contribute nothing to the cascade for `.s-block` itself. Flagging those
 *     produced findings with no possible fix.
 */
function topLevelSelectors(text) {
  const out = new Set();
  let depth = 0;
  let buf = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) {
        const sel = buf.replace(/\/\*[\s\S]*?\*\//g, '').trim();
        if (sel && !sel.startsWith('@') && !sel.startsWith('//')) {
          const body = text.slice(i + 1, matchingBrace(text, i + 1));
          if (/[\w-]\s*:/.test(ownDeclarations(body))) {
            for (const part of sel.split(',')) {
              const p = part.trim().replace(/\s+/g, ' ');
              if (p && p.includes('.') && p.length < 160) out.add(p);
            }
          }
        }
      }
      depth++;
      buf = '';
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1);
      buf = '';
    } else if (depth === 0) {
      buf += ch;
    }
  }
  return out;
}

function matchingBrace(text, start) {
  let depth = 1;
  let i = start;
  while (i < text.length && depth > 0) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
    i++;
  }
  return i - 1;
}

function checkDuplicateSelectors() {
  const files = walk(join(STYLES, '04-components'), ['.scss']);
  const owner = new Map(); // selector -> [file, …]
  for (const f of files) {
    for (const sel of topLevelSelectors(read(f))) {
      if (!owner.has(sel)) owner.set(sel, []);
      owner.get(sel).push(rel(f));
    }
  }
  let dupes = 0;
  for (const [sel, files_] of owner) {
    if (files_.length < 2) continue;
    dupes++;
    note('duplicate-selectors', 'error',
      `"${sel}" is declared at top level in ${files_.length} component files; the winner depends on import order in app.scss`,
      files_.join(' + '));
  }
  if (!dupes) note('duplicate-selectors', 'ok', 'no selector is split across component files');
}

/* ------------------------------------------------------ 2. hardcoded Arabic */

const ARABIC = /[؀-ۿ]/;

function checkHardcodedArabic() {
  const jsFiles = walk(join(SRC, 'assets/js'), ['.js']);
  const twigFiles = walk(join(SRC, 'views'), ['.twig']);
  let hits = 0;

  for (const f of jsFiles) {
    stripComments(read(f), 'js').split('\n').forEach((line, i) => {
      if (!ARABIC.test(line)) return;
      hits++;
      note('hardcoded-arabic', 'error',
        `Arabic literal in JS — use salla.lang.get() with a key from src/locales: ${line.trim().slice(0, 90)}`,
        `${rel(f)}:${i + 1}`);
    });
  }

  for (const f of twigFiles) {
    stripComments(read(f), 'twig').split('\n').forEach((line, i) => {
      if (!ARABIC.test(line)) return;
      // trans()/pluralize() arguments are keys, not literals; numbers filter is fine.
      if (/\btrans\(|\bpluralize\(|\|\s*number\b/.test(line)) return;
      hits++;
      note('hardcoded-arabic', 'error',
        `Arabic literal in template — use {{ trans('…') }}: ${line.trim().slice(0, 90)}`,
        `${rel(f)}:${i + 1}`);
    });
  }

  if (!hits) note('hardcoded-arabic', 'ok', 'no hardcoded Arabic outside src/locales');
}

/* ---------------------------------------------------------- 3. dead classes */

function checkDeadClasses() {
  const scss = walk(STYLES, ['.scss']).map(read).join('\n');
  const markupFiles = [...walk(join(SRC, 'views'), ['.twig']),
                       ...walk(join(SRC, 'assets/js'), ['.js'])];
  const markup = markupFiles.map(read).join('\n');

  // Classes assembled by interpolation, e.g. `hadeel-layout-{{ … }}` or `s-${x}`.
  const dynamicPrefixes = [...markup.matchAll(/([a-z][a-z0-9-]*-)(?:\{\{|\$\{)/g)]
    .map((m) => m[1]);

  const styled = new Set();
  for (const m of scss.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
    const cls = m[1];
    if (THEME_CLASS_PREFIXES.some((p) => cls.startsWith(p))) styled.add(cls);
  }

  const dead = [...styled].filter((cls) =>
    !markup.includes(cls) && !dynamicPrefixes.some((p) => cls.startsWith(p))).sort();

  if (!dead.length) {
    note('dead-classes', 'ok', 'every theme class in SCSS is rendered somewhere');
    return;
  }
  for (const cls of dead) {
    note('dead-classes', 'error',
      `.${cls} is styled but never rendered — either dead weight or a renamed class the CSS never followed`,
      'src/assets/styles');
  }
}

/* ------------------------------------------------------- 4. dangling tokens */

function checkCssVariables() {
  const files = [...walk(STYLES, ['.scss']), ...walk(join(SRC, 'views'), ['.twig'])];
  const defined = new Set(EXTERNAL_CSS_VARS);
  const refs = []; // {name, hasFallback, where}

  for (const f of files) {
    // Comments blanked so a rule explaining a removed token is not read as a use of it.
    const text = extname(f) === '.scss' ? blankComments(read(f)) : read(f);
    for (const m of text.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) defined.add(m[1]);
    text.split('\n').forEach((line, i) => {
      for (const m of line.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*(,?)/g)) {
        refs.push({ name: m[1], hasFallback: m[2] === ',', where: `${rel(f)}:${i + 1}` });
      }
    });
  }

  let bad = 0;
  const reported = new Set();
  for (const r of refs) {
    if (defined.has(r.name) || reported.has(r.name + r.hasFallback)) continue;
    reported.add(r.name + r.hasFallback);
    bad++;
    note('css-variables', r.hasFallback ? 'warn' : 'error',
      r.hasFallback
        ? `var(${r.name}, …) has no definition — the fallback is always what renders, so the token is decorative`
        : `var(${r.name}) has no definition and no fallback — the declaration is dropped at runtime`,
      r.where);
  }
  if (!bad) note('css-variables', 'ok', 'every referenced custom property is defined');
}

/* ------------------------------------------------------- 5. theme settings */

function collectSettingIds(node, out) {
  if (Array.isArray(node)) { node.forEach((n) => collectSettingIds(n, out)); return; }
  if (node && typeof node === 'object') {
    if (typeof node.id === 'string' && typeof node.type === 'string') out.add(node.id);
    Object.values(node).forEach((v) => collectSettingIds(v, out));
  }
}

function checkThemeSettings() {
  const twilight = JSON.parse(read(join(ROOT, 'twilight.json')));
  const declared = new Set();
  collectSettingIds(twilight.settings ?? [], declared);

  const files = [...walk(join(SRC, 'views'), ['.twig']), ...walk(join(SRC, 'assets/js'), ['.js'])];
  const used = new Map();
  for (const f of files) {
    for (const m of read(f).matchAll(/theme\.settings\.(?:get|set)\(\s*['"]([^'"]+)['"]/g)) {
      if (!used.has(m[1])) used.set(m[1], rel(f));
    }
  }

  let bad = 0;
  for (const [key, where] of used) {
    // `placeholder` is set at runtime by master.twig; doc examples are not settings.
    if (declared.has(key) || key === 'placeholder' || key === 'my_var') continue;
    bad++;
    note('theme-settings', 'error',
      `theme.settings.get('${key}') is read but twilight.json declares no such setting — the merchant can never change it`,
      where);
  }
  if (!bad) note('theme-settings', 'ok', 'every setting read by a template is declared in twilight.json');
}

/* ---------------------------------------------------------- 6. build sync */

function sha(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function checkBuildSync() {
  const publicDir = join(ROOT, 'public');
  const tmp = mkdtempSync(join(tmpdir(), 'hadeel-build-'));
  try {
    execFileSync('npx', ['webpack', '--mode', 'production', '--output-path', tmp],
      { cwd: ROOT, stdio: 'pipe' });
    const fresh = readdirSync(tmp).filter((f) => /\.(js|css)$/.test(f) && !f.endsWith('.LICENSE.txt'));
    let drift = 0;
    for (const name of fresh) {
      const committed = join(publicDir, name);
      let same = false;
      try { same = sha(committed) === sha(join(tmp, name)); } catch { same = false; }
      if (!same) {
        drift++;
        note('build-sync', 'error',
          `public/${name} does not match a fresh production build of src/ — the storefront is serving stale assets`,
          `public/${basename(name)}`);
      }
    }
    if (!drift) note('build-sync', 'ok', 'public/ matches a fresh production build');
  } catch (err) {
    note('build-sync', 'error', `production build failed: ${String(err.message).slice(0, 200)}`, 'webpack');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/* -------------------------------------------------------------- run + report */

checkDuplicateSelectors();
checkHardcodedArabic();
checkDeadClasses();
checkCssVariables();
checkThemeSettings();
if (WANT_BUILD) checkBuildSync();

const errors = findings.filter((f) => f.level === 'error');
const warns = findings.filter((f) => f.level === 'warn');

if (AS_JSON) {
  console.log(JSON.stringify({ errors: errors.length, warnings: warns.length, findings }, null, 2));
} else {
  const icon = { ok: '  ok  ', warn: ' warn ', error: 'FAILED' };
  let current = '';
  for (const f of findings) {
    if (f.check !== current) { current = f.check; console.log(`\n[${current}]`); }
    console.log(`  ${icon[f.level]} ${f.message}${f.where ? `\n         ${f.where}` : ''}`);
  }
  console.log(`\n${errors.length} error(s), ${warns.length} warning(s)`);
  if (MAX_ERRORS) console.log(`budget: ${MAX_ERRORS}`);
  if (!WANT_BUILD) console.log('note: build sync not checked — rerun with --build');
  if (errors.length > MAX_ERRORS) {
    console.log(`\nover budget by ${errors.length - MAX_ERRORS}`);
  } else if (MAX_ERRORS && errors.length < MAX_ERRORS) {
    console.log(`\nunder budget — lower --max-errors to ${errors.length} to lock it in`);
  }
}

process.exit(errors.length > MAX_ERRORS ? 1 : 0);
