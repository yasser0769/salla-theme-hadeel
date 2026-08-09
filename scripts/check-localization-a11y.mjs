#!/usr/bin/env node
/**
 * HDL-04 static contract: localization, RTL/LTR, and accessibility.
 *
 * Source-only and deterministic; Node built-ins only. Catches:
 *   1. ar/en locale leaf-key drift or empty values
 *   2. custom DOM language/direction inference in theme JS
 *   3. positive tabindex in templates or scripts
 *   4. known hardcoded accessible/visible literals that must live in src/locales
 *   5. disclosure/collapse ARIA contract regressions (blog dropdown, note/file)
 *   6. global link focus suppression (a:focus { outline: none })
 *   7. non-zero letter-spacing not scoped to LTR inside its owning rule
 *   8. mirroring of non-directional icons or utility-level scale-x flipping
 *   9. collection toolbar DOM order and CSS direction overrides
 *
 * Consumed by scripts/check-theme.mjs and tests/localization-rtl-accessibility.test.mjs.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const SRC_DIRS = {
  views: ['src', 'views'],
  js: ['src', 'assets', 'js'],
  styles: ['src', 'assets', 'styles'],
};

/** Twig `{# … #}` + HTML `<!-- … -->`, or JS `/* … *\/` + `// …` comments. */
function stripComments(text, kind) {
  if (kind === 'twig') {
    return text.replace(/\{#[\s\S]*?#\}/g, '').replace(/<!--[\s\S]*?-->/g, '');
  }
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** Blank SCSS comments while preserving offsets, for selector scanning. */
function blankComments(text) {
  const keepNewlines = (m) => m.replace(/[^\n]/g, ' ');
  return text.replace(/\/\*[\s\S]*?\*\//g, keepNewlines).replace(/\/\/[^\n]*/g, keepNewlines);
}

/**
 * Walk SCSS source, invoking `onDeclaration(segment, selectorStack)` for every
 * declaration segment with the stack of enclosing selectors (media queries
 * included). Selector text at `{`, declarations end at `;` or `}`.
 */
function scanScss(text, onDeclaration) {
  const stack = [];
  let buf = '';
  for (const ch of text) {
    if (ch === '{') {
      stack.push(buf.trim());
      buf = '';
    } else if (ch === '}') {
      if (buf.trim()) onDeclaration(buf, stack.slice());
      stack.pop();
      buf = '';
    } else if (ch === ';') {
      onDeclaration(buf + ';', stack.slice());
      buf = '';
    } else {
      buf += ch;
    }
  }
}

function flattenLeaves(node, prefix, out) {
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      flattenLeaves(value, prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out[prefix] = node;
  }
  return out;
}

export function checkLocalizationA11y({ root }) {
  const findings = [];
  const note = (rule, level, message, where) => findings.push({ rule, level, message, where });
  const read = (p) => readFileSync(p, 'utf8');
  const rel = (p) => relative(root, p);

  const walk = (dir, exts) => {
    const out = [];
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) out.push(...walk(full, exts));
      else if (exts.includes(extname(name))) out.push(full);
    }
    return out;
  };

  const viewFiles = walk(join(root, ...SRC_DIRS.views), ['.twig']);
  const jsFiles = walk(join(root, ...SRC_DIRS.js), ['.js']);
  const scssFiles = walk(join(root, ...SRC_DIRS.styles), ['.scss']);

  /* ------------------------------------------ 1. locale leaf parity (FR-001) */

  const ar = flattenLeaves(JSON.parse(read(join(root, 'src/locales/ar.json'))), '', {});
  const en = flattenLeaves(JSON.parse(read(join(root, 'src/locales/en.json'))), '', {});
  const arKeys = Object.keys(ar).sort();
  const enKeys = Object.keys(en).sort();
  let localeBad = 0;

  for (const key of arKeys.filter((k) => !(k in en))) {
    localeBad++;
    note('locale-parity', 'error', `"${key}" exists in ar.json but not en.json — every Hadeel key must be paired`, 'src/locales');
  }
  for (const key of enKeys.filter((k) => !(k in ar))) {
    localeBad++;
    note('locale-parity', 'error', `"${key}" exists in en.json but not ar.json — every Hadeel key must be paired`, 'src/locales');
  }
  for (const [file, leaves] of [['src/locales/ar.json', ar], ['src/locales/en.json', en]]) {
    for (const [key, value] of Object.entries(leaves)) {
      if (typeof value === 'string' && value.trim()) continue;
      localeBad++;
      note('locale-parity', 'error', `"${key}" is empty or not a string — locale values must never be blank`, file);
    }
  }
  if (!localeBad) note('locale-parity', 'ok', `${arKeys.length} paired, non-empty locale leaves in ar/en`);

  /* ----------------------------- 2. custom lang/dir inference (FR-002) */

  const INFERENCE = [
    [/document\.documentElement\.(dir|lang)\b/, 'document.documentElement.$1'],
    [/getComputedStyle\([^)]*\)\.direction\b/, 'getComputedStyle(…).direction'],
  ];
  let inferBad = 0;
  for (const f of jsFiles) {
    stripComments(read(f), 'js').split('\n').forEach((line, i) => {
      for (const [pattern, label] of INFERENCE) {
        if (!pattern.test(line)) continue;
        inferBad++;
        note('direction-inference', 'error',
          `${label} infers direction/language from the DOM — use Salla runtime (theme.is_rtl, inherited dir)`,
          `${rel(f)}:${i + 1}`);
      }
    });
  }
  if (!inferBad) note('direction-inference', 'ok', 'no custom DOM language/direction inference in theme JS');

  /* --------------------------------------------- 3. positive tabindex (FR-004) */

  let tabBad = 0;
  for (const f of [...viewFiles, ...jsFiles]) {
    read(f).split('\n').forEach((line, i) => {
      if (!/tabindex\s*=\s*["']\s*[1-9]/.test(line)) return;
      tabBad++;
      note('positive-tabindex', 'error',
        'positive tabindex reorders the tab sequence — DOM order must carry focus order',
        `${rel(f)}:${i + 1}`);
    });
  }
  if (!tabBad) note('positive-tabindex', 'ok', 'no positive tabindex in templates or scripts');

  /* -------------------------------- 4. known hardcoded literals (FR-001/005) */

  const FORBIDDEN = [
    [/aria-label="Sidebar"/, 'aria-label="Sidebar"'],
    [/Categories Trigger/, '"Categories Trigger"'],
    [/alt="post image"/, 'alt="post image"'],
    [/'fixed banner'/, "'fixed banner'"],
    [/aria-label="Banner /, 'aria-label="Banner …"'],
    [/\|\|\s*'category'/, "|| 'category'"],
    [/aria-label="Quantity"/, 'aria-label="Quantity"'],
    [/your@email\.com/, 'placeholder="your@email.com"'],
    [/\{\{\s*store\.name\s*\}\}\s*logo/, '{{store.name}} logo'],
    [/alt="logo"/, 'alt="logo"'],
  ];
  let literalBad = 0;
  for (const f of [...viewFiles, ...jsFiles]) {
    const kind = extname(f) === '.twig' ? 'twig' : 'js';
    stripComments(read(f), kind).split('\n').forEach((line, i) => {
      for (const [pattern, label] of FORBIDDEN) {
        if (!pattern.test(line)) continue;
        literalBad++;
        note('hardcoded-accessible-literal', 'error',
          `${label} is a theme-owned accessible/visible literal — use a paired src/locales key`,
          `${rel(f)}:${i + 1}`);
      }
    });
  }
  // The only place 'Add to cart' may appear in app.js is as the English-only
  // getWithDefault default of the server-resolved translation bridge.
  const appJs = stripComments(read(join(root, 'src/assets/js/app.js')), 'js');
  appJs.split('\n').forEach((line, i) => {
    if (!line.includes('Add to cart')) return;
    if (/getWithDefault\(\s*'pages\.cart\.add_to_cart',\s*'Add to cart'\s*\)/.test(line)) return;
    literalBad++;
    note('hardcoded-accessible-literal', 'error',
      "'Add to cart' must resolve through salla.lang.getWithDefault, never a direct literal",
      `src/assets/js/app.js:${i + 1}`);
  });
  if (!literalBad) note('hardcoded-accessible-literal', 'ok', 'no known hardcoded accessible literals');

  /* ------------------------------ 5. disclosure/collapse ARIA (FR-004/005/008) */

  let ariaBad = 0;
  const ariaNote = (message, where) => { ariaBad++; note('disclosure-collapse-aria', 'error', message, where); };

  const blogIndex = read(join(root, 'src/views/pages/blog/index.twig'));
  for (const needle of [
    ['id="blog-categories-trigger"', 'stable trigger id'],
    ['aria-controls="blog-categories-menu"', 'trigger controls the menu'],
    ['aria-expanded="false"', 'trigger starts collapsed'],
    ['id="blog-categories-menu"', 'stable menu id'],
  ]) {
    if (!blogIndex.includes(needle[0])) ariaNote(`blog categories dropdown is missing ${needle[1]} (${needle[0]})`, 'src/views/pages/blog/index.twig');
  }
  if (/role="menu"/.test(blogIndex)) ariaNote('blog categories dropdown must stay a plain disclosure — no role="menu"', 'src/views/pages/blog/index.twig');
  const closeButton = blogIndex.match(/<button[^>]*dropdown__close[^>]*>/)?.[0] || '';
  if (!/type="button"/.test(closeButton)) ariaNote('dropdown close button needs type="button"', 'src/views/pages/blog/index.twig');
  if (!/aria-label="\{\{\s*trans\(/.test(closeButton)) ariaNote('dropdown close button needs a localized aria-label', 'src/views/pages/blog/index.twig');

  const optionsTwig = read(join(root, 'src/views/pages/partials/product/options.twig'));
  const collapseTriggers = optionsTwig.match(/<button[\s\S]*?btn--collapse[\s\S]*?>/g) || [];
  if (!collapseTriggers.length) ariaNote('no .btn--collapse triggers found — the product note/file collapse is missing', 'src/views/pages/partials/product/options.twig');
  for (const trigger of collapseTriggers) {
    for (const attr of ['type="button"', 'aria-controls=', 'aria-expanded="false"']) {
      if (!trigger.includes(attr)) ariaNote(`collapse trigger is missing ${attr}: ${trigger.slice(0, 90)}`, 'src/views/pages/partials/product/options.twig');
    }
  }

  const collapseBody = appJs.match(/initiateCollapse\(\)\s*\{[\s\S]*?\n  \}/)?.[0] || '';
  for (const needle of ['aria-expanded', 'inert', 'Escape']) {
    if (!collapseBody.includes(needle)) ariaNote(`initiateCollapse must sync ${needle}`, 'src/assets/js/app.js');
  }
  // toggleElementClassIf adds its FIRST class when the callback is true; the open
  // class must be first or the panel never opens and ARIA/inert invert.
  const collapseToggle = collapseBody.match(/toggleElementClassIf\(\[content, trigger\],\s*'([^']+)',\s*'([^']+)',\s*\(\)\s*=>\s*isOpen\)/);
  if (!collapseToggle || collapseToggle[1] !== 'is-opened' || collapseToggle[2] !== 'is-closed') {
    ariaNote("initiateCollapse must call toggleElementClassIf(…, 'is-opened', 'is-closed', () => isOpen) — the helper adds its first class on true", 'src/assets/js/app.js');
  }
  const dropdownBody = appJs.match(/initiateDropdowns\(\)\s*\{[\s\S]*?\n  \}/)?.[0] || '';
  for (const needle of ['aria-expanded', 'Escape', 'focus(']) {
    if (!dropdownBody.includes(needle)) ariaNote(`initiateDropdowns must handle ${needle}`, 'src/assets/js/app.js');
  }

  // Blog like button: real button type, localized name, decorative icon hidden.
  const blogSingle = read(join(root, 'src/views/pages/blog/single.twig'));
  const likeButton = blogSingle.match(/<button[^>]*id="blog-like"[^>]*>/)?.[0] || '';
  if (!likeButton) ariaNote('the #blog-like button is missing', 'src/views/pages/blog/single.twig');
  if (!/type="button"/.test(likeButton)) ariaNote('#blog-like needs type="button" — it never submits a form', 'src/views/pages/blog/single.twig');
  if (!/aria-label="\{\{\s*trans\(/.test(likeButton)) ariaNote('#blog-like needs a localized aria-label', 'src/views/pages/blog/single.twig');
  const likeIcon = blogSingle.match(/<i[^>]*sicon-thumbs-up[^>]*>/)?.[0] || '';
  if (!/aria-hidden="true"/.test(likeIcon)) ariaNote('the decorative thumbs-up inside #blog-like needs aria-hidden="true"', 'src/views/pages/blog/single.twig');

  // Availability / select-branch link: logical spacing and motion only, and the
  // directional keyboard-arrow glyph is decorative. The native ltr.scss glyph
  // remap stays the only LTR handling for the glyph itself.
  const productSingle = read(join(root, 'src/views/pages/product/single.twig'));
  const availabilityLink = (productSingle.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) || [])
    .find((block) => block.includes('pages.products.select_branch')) || '';
  if (!availabilityLink) ariaNote('the availability select-branch link is missing', 'src/views/pages/product/single.twig');
  const branchLink = availabilityLink.match(/<a[^>]*>/)?.[0] || '';
  if (!/\bwith-arrow\b/.test(branchLink)) ariaNote('the select-branch link needs with-arrow so the native ltr.scss keyboard_arrow_left glyph remap applies in LTR', 'src/views/pages/product/single.twig');
  const branchArrow = availabilityLink.match(/<span[^>]*sicon-keyboard_arrow_left[^>]*>/)?.[0] || '';
  if (!branchArrow) ariaNote('the select-branch keyboard-arrow glyph is missing', 'src/views/pages/product/single.twig');
  const branchClasses = (branchArrow.match(/class="([^"]*)"/)?.[1] || '').split(/\s+/);
  if (branchClasses.some((t) => /^(mr|ml)-\d/.test(t))) ariaNote('select-branch arrow must use logical rtl:/ltr: spacing, not physical mr-*/ml-*', 'src/views/pages/product/single.twig');
  if (branchClasses.some((t) => /^group-hover:-?translate-x-\d/.test(t))) ariaNote('select-branch hover motion must be scoped per direction, not a fixed -translate-x', 'src/views/pages/product/single.twig');
  if (!/aria-hidden="true"/.test(branchArrow)) ariaNote('the directional select-branch glyph needs aria-hidden="true"', 'src/views/pages/product/single.twig');
  const ltrScss = blankComments(read(join(root, 'src/assets/styles/02-generic/ltr.scss')));
  if (!/sicon-keyboard_arrow_left:before[\s\S]*?content:/.test(ltrScss)) ariaNote('the native ltr.scss keyboard_arrow_left glyph remap must be preserved', 'src/assets/styles/02-generic/ltr.scss');

  // Decorative display-all/CTA arrows must not be announced.
  for (const arrowFile of ['src/views/components/home/enhanced-slider.twig',
    'src/views/components/home/fixed-products.twig', 'src/views/components/home/brands.twig']) {
    for (const icon of read(join(root, arrowFile)).match(/<i[^>]*sicon-arrow-left[^>]*>/g) || []) {
      if (!/aria-hidden="true"/.test(icon)) ariaNote('decorative sicon-arrow-left needs aria-hidden="true"', arrowFile);
    }
  }
  if (!ariaBad) note('disclosure-collapse-aria', 'ok', 'dropdown/collapse type, name, controls, expanded, Escape, and inert contract holds');

  /* -------------------------------- 6. global link focus suppression (FR-005) */

  let focusBad = 0;
  for (const f of scssFiles) {
    const text = blankComments(read(f));
    const match = text.match(/a\s*:focus[^{]*\{[^}]*outline\s*:\s*none/);
    if (!match) continue;
    focusBad++;
    note('global-focus-suppression', 'error',
      'a:focus { outline: none } suppresses the fallback focus ring for every link',
      rel(f));
  }
  if (!focusBad) note('global-focus-suppression', 'ok', 'no global link focus suppression');

  /* ------------------------------ 7. letter-spacing scoped to LTR (FR-006) */

  const LTR_SCOPE = /\[dir=['"]?ltr['"]?\]|:dir\(ltr\)/;
  let spacingBad = 0;
  let spacingCount = 0;
  for (const f of scssFiles) {
    scanScss(blankComments(read(f)), (segment, stack) => {
      const m = segment.match(/letter-spacing\s*:\s*([^;]+)/);
      if (!m) return;
      const value = m[1].trim();
      if (/^(normal|inherit|initial|unset)\b/.test(value)) return;
      if (parseFloat(value) === 0) return;
      spacingCount++;
      if (stack.some((sel) => LTR_SCOPE.test(sel))) return;
      spacingBad++;
      note('letter-spacing-scope', 'error',
        `letter-spacing: ${value} applies in every direction — scope it to LTR inside its owning rule (${stack.join(' > ') || 'top level'})`,
        rel(f));
    });
  }
  if (!spacingBad) note('letter-spacing-scope', 'ok', `all ${spacingCount} non-zero letter-spacing declarations are LTR-scoped`);

  /* ------------------------------- 8. directional mirroring rules (FR-003) */

  let mirrorBad = 0;
  for (const f of viewFiles) {
    read(f).split('\n').forEach((line, i) => {
      if (!/(?:rtl|ltr):-?scale-x/.test(line)) return;
      mirrorBad++;
      note('directional-mirroring', 'error',
        'utility-level scale-x flipping mirrors media/icons wholesale — only scoped arrow-left mirroring is allowed',
        `${rel(f)}:${i + 1}`);
    });
  }
  for (const f of scssFiles) {
    scanScss(blankComments(read(f)), (segment, stack) => {
      if (!/scaleX\(-1\)/.test(segment)) return;
      const chain = stack.join(' ');
      const badIcon = chain.match(/sicon-(?!arrow-left)[\w-]+/);
      if (!badIcon) return;
      mirrorBad++;
      note('directional-mirroring', 'error',
        `${badIcon[0]} is mirrored but is not a directional arrow — logos, media, Search, Cart, Play, and Check never mirror`,
        rel(f));
    });
  }
  if (!mirrorBad) note('directional-mirroring', 'ok', 'mirroring is limited to directional icons');

  /* ------------------------------ 9. collection toolbar order (FR-004) */

  let toolbarBad = 0;
  const productIndex = read(join(root, 'src/views/pages/product/index.twig'));
  const order = ['collection-toolbar__filter', 'collection-toolbar__density', 'collection-toolbar__sort']
    .map((cls) => productIndex.indexOf(cls));
  if (order.some((i) => i === -1)) {
    toolbarBad++;
    note('toolbar-order', 'error', 'collection toolbar is missing filter, density, or sort block', 'src/views/pages/product/index.twig');
  } else if (!(order[0] < order[1] && order[1] < order[2])) {
    toolbarBad++;
    note('toolbar-order', 'error',
      'collection toolbar DOM must read filter → density → sort so visual and focus order agree',
      'src/views/pages/product/index.twig');
  }
  const collectionScss = blankComments(read(join(root, 'src/assets/styles/04-components/collection.scss')));
  if (/direction\s*:\s*(ltr|rtl)/.test(collectionScss)) {
    toolbarBad++;
    note('toolbar-order', 'error',
      'collection.scss reverses CSS direction — order must come from the DOM, not direction overrides',
      'src/assets/styles/04-components/collection.scss');
  }
  if (!toolbarBad) note('toolbar-order', 'ok', 'toolbar DOM order is filter → density → sort with no CSS direction overrides');

  return { findings };
}

/* Standalone run: node scripts/check-localization-a11y.mjs */
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
  const { findings } = checkLocalizationA11y({ root });
  for (const f of findings) {
    const icon = { ok: '  ok  ', warn: ' warn ', error: 'FAILED' }[f.level];
    console.log(`  ${icon} [${f.rule}] ${f.message}${f.where ? ` (${f.where})` : ''}`);
  }
  const errors = findings.filter((f) => f.level === 'error').length;
  console.log(`\n${errors} error(s)`);
  process.exit(errors ? 1 : 0);
}
