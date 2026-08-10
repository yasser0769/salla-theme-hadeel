#!/usr/bin/env node
/**
 * HDL-05 bundle budget gate.
 *
 * Enforces the committed size contract in src/config/bundle-budget.json against
 * the built public/ tree. Node 20 built-ins only — zero npm dependencies.
 *
 * Gates:
 *   budget       — total raw bytes <= hardCapBytes (error); per-file actual <=
 *                  recorded ceilingBytes (error, reported with old/new/overage);
 *                  missing / unexpected / drifted files (error); internal target
 *                  reported as info only; gzip-9 metrics are never a gate.
 *   media        — no fonts, no video, no demo/sample basenames, and any
 *                  image/audio over 25000 B must be registered by exact path
 *                  with actual <= maxBytes. Scans src/assets/images and public/.
 *   dependencies — every dependency + devDependency name in package.json must
 *                  appear in manifest.dependencies.
 *
 * Usage:
 *   node scripts/check-bundle-budget.mjs [--root <path>] [--json] [--report]
 *   node scripts/check-bundle-budget.mjs --budget
 *   node scripts/check-bundle-budget.mjs --demo-media
 *   node scripts/check-bundle-budget.mjs --dependency-policy
 *   node scripts/check-bundle-budget.mjs --update [--json]
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { join, basename, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const SCHEMA_VERSION = 1;
const HARD_CAP_BYTES = 1_000_000;
const INTERNAL_TARGET_BYTES = 850_000;
const MEDIA_THRESHOLD_BYTES = 25_000;

/** Canonical registered functional media. Paths are public/-relative. */
const REGISTERED_MEDIA_DEFAULTS = [
  { path: 'images/placeholder.webp', reason: 'Functional placeholder preventing layout shift while product images lazy-load (design.md). Lossless WebP since T010 C5 (owner decision 2026-08-10).', maxBytes: 25_000 },
  { path: 'images/s-empty.png', reason: 'Functional empty-state illustration shipped with the theme (design.md).', maxBytes: 1024 },
  { path: 'images/s-empty-small.png', reason: 'Functional empty-state illustration shipped with the theme (design.md).', maxBytes: 1024 },
  { path: 'images/s-empty-square.png', reason: 'Functional empty-state illustration shipped with the theme (design.md).', maxBytes: 1024 },
  { path: 'images/s-empty-wide.png', reason: 'Functional empty-state illustration shipped with the theme (design.md).', maxBytes: 1024 },
];

const FONT_EXTS = new Set(['.woff', '.woff2', '.ttf', '.otf', '.eot']);
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.mpg', '.mpeg']);
const IMAGE_AUDIO_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.bmp', '.ico',
  '.mp3', '.wav', '.ogg', '.m4a',
]);
const DEMO_SAMPLE_RE = /demo|sample/i;

function pathsFor(root) {
  return {
    publicDir: join(root, 'public'),
    srcImagesDir: join(root, 'src', 'assets', 'images'),
    manifestPath: join(root, 'src', 'config', 'bundle-budget.json'),
    packagePath: join(root, 'package.json'),
    checkThemePath: join(root, 'scripts', 'check-theme.mjs'),
  };
}

/* ------------------------------------------------------------------ scanning */

/** Recursively measure every file under publicDir: raw bytes, gzip-9, sha256. */
export function scanPublic(publicDir) {
  const out = [];
  const walk = (dir, rel) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const next = rel ? `${rel}/${name}` : name;
      if (statSync(full).isDirectory()) walk(full, next);
      else {
        const buf = readFileSync(full);
        out.push({
          path: next,
          rawBytes: buf.length,
          gzip9Bytes: gzipSync(buf, { level: 9 }).length,
          sha256: createHash('sha256').update(buf).digest('hex'),
        });
      }
    }
  };
  walk(publicDir, '');
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

function readDependencyNames(packagePath) {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  return Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }).sort();
}

function loadManifest(manifestPath) {
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

function totalsOf(files) {
  return files.reduce(
    (acc, f) => ({ rawBytes: acc.rawBytes + f.rawBytes, gzip9Bytes: acc.gzip9Bytes + f.gzip9Bytes }),
    { rawBytes: 0, gzip9Bytes: 0 },
  );
}

function finding(gate, level, message) {
  return { gate, level, message };
}

/* -------------------------------------------------------------------- budget */

export function checkBudget(manifest, actualFiles) {
  const findings = [];
  const recorded = new Map(manifest.files.map((f) => [f.path, f]));
  const actual = new Map(actualFiles.map((f) => [f.path, f]));

  for (const path of recorded.keys()) {
    if (!actual.has(path)) {
      findings.push(finding('budget', 'error',
        `missing file: public/${path} is recorded in the manifest but absent from the build — rebuild and rerun --update`));
    }
  }
  for (const path of actual.keys()) {
    if (!recorded.has(path)) {
      findings.push(finding('budget', 'error',
        `unexpected file: public/${path} is built but has no manifest row — rerun --update after a production build`));
    }
  }
  for (const [path, oldRow] of recorded) {
    const newRow = actual.get(path);
    if (!newRow) continue;
    if (newRow.rawBytes !== oldRow.rawBytes || newRow.sha256 !== oldRow.sha256) {
      findings.push(finding('budget', 'error',
        `drift: public/${path} — recorded ${oldRow.rawBytes} B (sha256 ${oldRow.sha256.slice(0, 12)}…), ` +
        `actual ${newRow.rawBytes} B (sha256 ${newRow.sha256.slice(0, 12)}…)`));
    }
    if (newRow.rawBytes > oldRow.ceilingBytes) {
      findings.push(finding('budget', 'error',
        `ceiling breached: public/${path} — old ceiling ${oldRow.ceilingBytes} B, new actual ${newRow.rawBytes} B, ` +
        `overage ${newRow.rawBytes - oldRow.ceilingBytes} B`));
    }
  }

  const total = totalsOf(actualFiles);
  if (total.rawBytes > manifest.hardCapBytes) {
    findings.push(finding('budget', 'error',
      `hard cap breached: public/ raw total ${total.rawBytes} B > hard cap ${manifest.hardCapBytes} B, ` +
      `overage ${total.rawBytes - manifest.hardCapBytes} B (gzip ${total.gzip9Bytes} B is informational and cannot satisfy this gate)`));
  }
  findings.push(finding('budget', 'info',
    total.rawBytes > manifest.internalTargetBytes
      ? `internal target exceeded (info only): raw total ${total.rawBytes} B > target ${manifest.internalTargetBytes} B`
      : `internal target met: raw total ${total.rawBytes} B <= target ${manifest.internalTargetBytes} B`));
  findings.push(finding('budget', 'info',
    `gzip-9 total ${total.gzip9Bytes} B across ${actualFiles.length} file(s) — informational, never a gate`));
  return findings;
}

/* --------------------------------------------------------------------- media */

export function checkMedia(manifest, { publicDir, srcImagesDir }) {
  const findings = [];
  const registered = new Map(manifest.registeredMedia.map((m) => [m.path, m]));
  const roots = [
    { dir: publicDir, label: 'public', toPublicPath: (rel) => rel },
    { dir: srcImagesDir, label: 'src/assets/images', toPublicPath: (rel) => `images/${rel}` },
  ];
  for (const { dir, label, toPublicPath } of roots) {
    if (!existsSync(dir)) continue;
    const walk = (current, rel) => {
      for (const name of readdirSync(current)) {
        const full = join(current, name);
        const next = rel ? `${rel}/${name}` : name;
        if (statSync(full).isDirectory()) { walk(full, next); continue; }
        const ext = extname(name).toLowerCase();
        const where = `${label}/${next}`;
        if (FONT_EXTS.has(ext)) {
          findings.push(finding('media', 'error', `local font shipped: ${where} — fonts may not ship in the theme bundle`));
          continue;
        }
        if (VIDEO_EXTS.has(ext)) {
          findings.push(finding('media', 'error', `video shipped: ${where} — demo/preview video may not ship in the theme bundle`));
          continue;
        }
        if (DEMO_SAMPLE_RE.test(basename(name))) {
          findings.push(finding('media', 'error', `demo/sample basename: ${where} — demo or sample media may not ship`));
          continue;
        }
        if (!IMAGE_AUDIO_EXTS.has(ext)) continue;
        const size = statSync(full).size;
        if (size <= MEDIA_THRESHOLD_BYTES) continue;
        const publicPath = toPublicPath(next);
        const row = registered.get(publicPath);
        if (!row) {
          findings.push(finding('media', 'error',
            `unregistered oversized media: ${where} — ${size} B > ${MEDIA_THRESHOLD_BYTES} B with no registeredMedia row for ${publicPath}`));
        } else if (size > row.maxBytes) {
          findings.push(finding('media', 'error',
            `registered media over maxBytes: ${where} — actual ${size} B > maxBytes ${row.maxBytes} B (${publicPath})`));
        }
      }
    };
    walk(dir, '');
  }
  if (!findings.some((f) => f.level === 'error')) {
    findings.push(finding('media', 'info',
      `no fonts, video, demo/sample names, or unregistered oversized media (${registered.size} registered row(s))`));
  }
  return findings;
}

/* -------------------------------------------------------------- dependencies */

export function checkDependencies(manifest, packagePath) {
  const findings = [];
  const allowed = new Set(manifest.dependencies);
  const names = readDependencyNames(packagePath);
  for (const name of names) {
    if (!allowed.has(name)) {
      findings.push(finding('dependencies', 'error',
        `dependency absent from manifest.dependencies: "${name}" — update the manifest in its own commit`));
    }
  }
  if (!findings.some((f) => f.level === 'error')) {
    findings.push(finding('dependencies', 'info',
      `all ${names.length} package.json dependency name(s) are recorded in manifest.dependencies`));
  }
  return findings;
}

/* -------------------------------------------------------------------- update */

/** Current git HEAD sha for generatedFromSha; 'unknown' outside a git repo. */
function currentGitSha(root) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Regenerate the manifest from the current public/ tree. Runs
 * check-theme.mjs --build --json first when that script exists (output
 * captured, never leaked to stdout) and refuses on failure. Per-file ceilings
 * ratchet down only: existing ceiling = min(old, actual), new file = actual;
 * any ceiling above the hard cap is rejected.
 */
export function updateManifest({ root = process.cwd() } = {}) {
  const { publicDir, manifestPath, packagePath, checkThemePath } = pathsFor(root);

  if (existsSync(checkThemePath)) {
    try {
      execFileSync(process.execPath, [checkThemePath, '--build', '--json'], {
        cwd: root,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (err) {
      throw new Error(
        `refusing --update: check-theme.mjs --build failed (exit ${err.status ?? 'unknown'}) — ` +
        'public/ is not in sync with a fresh production build of src/. Fix the build first, then rerun --update.');
    }
  }

  const previous = existsSync(manifestPath) ? loadManifest(manifestPath) : null;
  const previousFiles = new Map((previous?.files ?? []).map((f) => [f.path, f]));
  const previousMedia = new Map((previous?.registeredMedia ?? []).map((m) => [m.path, m]));

  const hardCapBytes = previous?.hardCapBytes ?? HARD_CAP_BYTES;
  const files = scanPublic(publicDir).map((row) => {
    const prev = previousFiles.get(row.path);
    const ceilingBytes = prev ? Math.min(prev.ceilingBytes, row.rawBytes) : row.rawBytes;
    if (ceilingBytes > hardCapBytes) {
      throw new Error(
        `refusing --update: ceiling for public/${row.path} would be ${ceilingBytes} B, above the hard cap ${hardCapBytes} B`);
    }
    return {
      path: row.path,
      rawBytes: row.rawBytes,
      gzip9Bytes: row.gzip9Bytes,
      sha256: row.sha256,
      ceilingBytes,
    };
  });

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    generatedFromSha: currentGitSha(root),
    hardCapBytes,
    internalTargetBytes: previous?.internalTargetBytes ?? INTERNAL_TARGET_BYTES,
    dependencies: previous?.dependencies ?? readDependencyNames(packagePath),
    registeredMedia: REGISTERED_MEDIA_DEFAULTS.map((def) => ({
      path: def.path,
      reason: previousMedia.get(def.path)?.reason ?? def.reason,
      maxBytes: def.maxBytes,
    })),
    files,
  };

  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  const updated = !existsSync(manifestPath) || readFileSync(manifestPath, 'utf8') !== serialized;
  writeFileSync(manifestPath, serialized);
  return { manifest, manifestPath, updated };
}

/* ----------------------------------------------------------------------- CLI */

function parseArgs(argv) {
  const flags = { root: process.cwd(), update: false, json: false, report: false, gates: ['budget', 'media', 'dependencies'] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') {
      i += 1;
      if (!argv[i]) throw new Error('--root requires a path');
      flags.root = resolve(argv[i]);
    } else if (arg.startsWith('--root=')) {
      flags.root = resolve(arg.slice('--root='.length));
    } else if (arg === '--update') flags.update = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === '--report') flags.report = true;
    else if (arg === '--check') { /* default: all gates */ }
    else if (arg === '--budget') flags.gates = ['budget'];
    else if (arg === '--demo-media') flags.gates = ['media'];
    else if (arg === '--dependency-policy') flags.gates = ['dependencies'];
    else throw new Error(`unknown argument: ${arg}`);
  }
  return flags;
}

function printHuman(findings, { report = false, manifest = null, actualFiles = [] } = {}) {
  const icon = { info: ' info ', error: 'FAILED' };
  let current = '';
  for (const f of findings) {
    if (f.gate !== current) { current = f.gate; console.log(`\n[${current}]`); }
    console.log(`  ${icon[f.level] ?? f.level} ${f.message}`);
  }
  if (report && manifest) {
    console.log('\n[report]');
    console.log('  path                                   raw (B)   gzip-9 (B)  ceiling (B)  headroom (B)');
    const ceilings = new Map(manifest.files.map((f) => [f.path, f.ceilingBytes]));
    for (const f of actualFiles) {
      const ceiling = ceilings.get(f.path) ?? 0;
      console.log(
        `  ${f.path.padEnd(38)} ${String(f.rawBytes).padStart(9)} ${String(f.gzip9Bytes).padStart(12)} ` +
        `${String(ceiling).padStart(12)} ${String(ceiling - f.rawBytes).padStart(13)}`);
    }
    const total = totalsOf(actualFiles);
    console.log(`  ${'TOTAL'.padEnd(38)} ${String(total.rawBytes).padStart(9)} ${String(total.gzip9Bytes).padStart(12)}`);
    console.log(`  hard cap ${manifest.hardCapBytes} B · internal target ${manifest.internalTargetBytes} B`);
  }
  const errors = findings.filter((f) => f.level === 'error').length;
  console.log(`\n${errors} error(s)`);
}

export function runCli(argv = process.argv.slice(2)) {
  const flags = parseArgs(argv);
  const root = flags.root;
  const { publicDir, srcImagesDir, manifestPath, packagePath } = pathsFor(root);

  if (flags.update) {
    const { manifest, updated } = updateManifest({ root });
    const total = totalsOf(manifest.files);
    if (flags.json) {
      process.stdout.write(`${JSON.stringify({
        ok: true,
        updated,
        totals: { files: manifest.files.length, rawBytes: total.rawBytes, gzip9Bytes: total.gzip9Bytes },
        manifestPath,
      }, null, 2)}\n`);
    } else {
      console.log(`bundle-budget.json ${updated ? 'updated' : 'unchanged'}: ${manifest.files.length} files, ` +
        `${total.rawBytes} B raw, ${total.gzip9Bytes} B gzip-9 — ${manifestPath}`);
    }
    return 0;
  }

  const findings = [];
  let manifest = null;
  let actualFiles = [];
  if (!existsSync(manifestPath)) {
    findings.push(finding('budget', 'error', `missing manifest: ${manifestPath} — run --update to create it`));
  } else {
    manifest = loadManifest(manifestPath);
    if (flags.gates.includes('budget') || flags.gates.includes('media')) {
      actualFiles = scanPublic(publicDir);
    }
    if (flags.gates.includes('budget')) findings.push(...checkBudget(manifest, actualFiles));
    if (flags.gates.includes('media')) findings.push(...checkMedia(manifest, { publicDir, srcImagesDir }));
    if (flags.gates.includes('dependencies')) findings.push(...checkDependencies(manifest, packagePath));
  }

  const errors = findings.filter((f) => f.level === 'error').length;
  if (flags.json) {
    const total = totalsOf(actualFiles);
    process.stdout.write(`${JSON.stringify({
      ok: errors === 0,
      errors,
      totals: { files: actualFiles.length, rawBytes: total.rawBytes, gzip9Bytes: total.gzip9Bytes },
      findings,
    }, null, 2)}\n`);
  } else {
    printHuman(findings, { report: flags.report, manifest, actualFiles });
  }
  return errors === 0 ? 0 : 1;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const wantsJson = process.argv.slice(2).includes('--json');
  try {
    process.exit(runCli(process.argv.slice(2)));
  } catch (err) {
    if (wantsJson) process.stdout.write(`${JSON.stringify({ ok: false, error: err.message }, null, 2)}\n`);
    else console.error(`check-bundle-budget: ${err.message}`);
    process.exit(1);
  }
}
