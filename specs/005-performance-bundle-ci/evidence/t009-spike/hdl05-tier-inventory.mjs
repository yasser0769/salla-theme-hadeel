// HDL-05 spike: static safelist tier inventory (Node built-ins only)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

// This script is tracked under specs/005-performance-bundle-ci/evidence/t009-spike/.
// The corpus lives at the repository root (src/, twilight.json, tailwind.config.js,
// node_modules/@salla.sa/*), so ROOT is resolved four levels up from the script's own
// location — never from the process CWD — making the tracked copy runnable as-is.
const SCRIPT_DIR = new URL('.', import.meta.url).pathname;
const ROOT = resolve(SCRIPT_DIR, '..', '..', '..', '..');
const SAFELIST = join(ROOT, 'node_modules/@salla.sa/twilight-tailwind-theme/safe-list-css.txt');
const TEXT_EXTS = new Set(['.js', '.mjs', '.cjs', '.ts', '.json', '.twig', '.html', '.htm', '.css', '.scss', '.txt', '.md', '.vue', '.jsx', '.tsx', '.map', '.d.ts', '.yaml', '.yml', '.xml', '.svg']);

function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

function readSafe(p) {
  try { return readFileSync(p, 'utf8'); } catch { return ''; }
}

// (a) tokens
const tokens = [];
const seen = new Set();
for (const line of readFileSync(SAFELIST, 'utf8').split('\n')) {
  const t = line.trim();
  if (t && !seen.has(t)) { seen.add(t); tokens.push(t); }
}

// (b) Source 1 corpus
const corpusParts = [];
const corpusFiles = [];
function addFile(p) {
  corpusParts.push(readSafe(p));
  corpusFiles.push(p);
}
for (const p of walk(join(ROOT, 'src/views'))) if (p.endsWith('.twig')) addFile(p);
for (const p of walk(join(ROOT, 'src/assets/js'))) if (p.endsWith('.js')) addFile(p);
addFile(join(ROOT, 'twilight.json'));
addFile(join(ROOT, 'tailwind.config.js'));
for (const sub of ['dist', 'loader']) {
  for (const p of walk(join(ROOT, 'node_modules/@salla.sa/twilight-components', sub))) {
    if (TEXT_EXTS.has(extname(p))) addFile(p);
  }
}
for (const p of walk(join(ROOT, 'node_modules/@salla.sa/twilight-tailwind-theme'))) {
  if (p === SAFELIST) continue;
  if (TEXT_EXTS.has(extname(p))) addFile(p);
}
const corpus = corpusParts.join('\n');

// (c) Tier A: word-boundary-aware exact match; boundaries = non [A-Za-z0-9_-]
function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const tierA = new Set();
for (const t of tokens) {
  const re = new RegExp(`(?<![A-Za-z0-9_-])${escRe(t)}(?![A-Za-z0-9_-])`);
  if (re.test(corpus)) tierA.add(t);
}

// (d) Tier B: none machine-readable this phase — intentionally empty
const tierB = new Set();

// (e) Tier C / Tier D among non-A
const C_RE = /customer|account|profile|loyalty|wishlist|blog|comment|thank|checkout|cart|order|invoice|rating|review|otp|login|register|password|address/i;
const tierC = new Set();
const tierD = [];
for (const t of tokens) {
  if (tierA.has(t) || tierB.has(t)) continue;
  if (C_RE.test(t)) tierC.add(t);
  else tierD.push(t);
}

// (f) outputs
// Generated files stay confined to this evidence directory, never the repo root.
const conservative = tokens.filter(t => tierA.has(t) || tierC.has(t));
const tierAOnly = tokens.filter(t => tierA.has(t));
writeFileSync(join(SCRIPT_DIR, 'hdl05-safe-list-conservative.txt'), conservative.join('\n') + '\n');
writeFileSync(join(SCRIPT_DIR, 'hdl05-safe-list-tierA.txt'), tierAOnly.join('\n') + '\n');

console.log(`tokens_total=${tokens.length}`);
console.log(`tierA=${tierA.size}`);
console.log(`tierB=${tierB.size} (no machine-readable rendered-DOM evidence this phase; screenshots only)`);
console.log(`tierC=${tierC.size}`);
console.log(`tierD=${tierD.length}`);
console.log(`conservative_A_plus_C=${conservative.length}`);
console.log(`corpus_files=${corpusFiles.length}`);
console.log('tierD_examples:');
for (const t of tierD.slice(0, 30)) console.log(`  ${t}`);
