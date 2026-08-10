#!/usr/bin/env node
/**
 * HDL-05 publishing-package and bundle telemetry checker.
 *
 * Salla publishing compliance is evaluated only against the deterministic
 * compressed distributable-theme estimate. Raw public/, gzip-9, and per-file
 * ceilings remain engineering telemetry and never substitute for that gate.
 *
 * The exact server-side Salla manifest is not exposed locally. The committed
 * allowlist therefore produces `sallaPackageEstimate`; the broader
 * `repositoryArchiveDiagnostic` is reported separately and is never a
 * publishing verdict.
 */

import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { deflateRawSync, gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { basename, extname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const SCHEMA_VERSION = 2;
const SALLA_COMPRESSED_HARD_CAP_BYTES = 1_000_000;
const INTERNAL_COMPRESSED_TARGET_PERCENT = 95;
const MEDIA_THRESHOLD_BYTES = 25_000;

const PACKAGE_INCLUDE_DEFAULTS = [
  'package.json',
  'pnpm-lock.yaml',
  'postcss.config.js',
  'tailwind.config.js',
  'twilight.json',
  'webpack.config.js',
  'public/**',
  'src/assets/**',
  'src/locales/**',
  'src/views/**',
];

const PACKAGE_EXCLUDE_DEFAULTS = [
  '**/.DS_Store',
  '**/*.log',
  '**/*.zip',
];

const REPOSITORY_DIAGNOSTIC_EXCLUDE_DEFAULTS = [
  '.git/**',
  'node_modules/**',
  '.worktrees/**',
  '**/.DS_Store',
  '**/*.log',
  '**/*.zip',
  '**/.cache/**',
  '**/coverage/**',
];

const CORRECTIVE_RAW_CEILING_INCREASES = {
  'public/app.css': {
    maxBytes: 802_202,
    reason: '2026-08-10 corrective restoration of the exact pre-C1 full Salla/Twilight Safelist; raw size is telemetry, and the compressed package remains compliant.',
  },
};

const REGISTERED_MEDIA_DEFAULTS = [
  { path: 'images/placeholder.webp', reason: 'Functional placeholder preventing layout shift while product images lazy-load (design.md). Lossless WebP retained after the 2026-08-10 C5 audit.', maxBytes: 25_000 },
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

function posixPath(path) {
  return path.split(sep).join('/');
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function finding(gate, level, message) {
  return { gate, level, message };
}

function totalsOf(files) {
  return files.reduce(
    (acc, file) => ({
      rawBytes: acc.rawBytes + file.rawBytes,
      gzip9Bytes: acc.gzip9Bytes + (file.gzip9Bytes ?? 0),
    }),
    { rawBytes: 0, gzip9Bytes: 0 },
  );
}

function readDependencyNames(packagePath) {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  return Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }).sort();
}

function loadManifest(manifestPath) {
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

function patternMatches(path, pattern) {
  if (pattern.startsWith('**/') && pattern.endsWith('/**')) {
    const segment = pattern.slice(3, -3);
    return path === segment || path.startsWith(`${segment}/`) || path.includes(`/${segment}/`);
  }
  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3);
    return path === prefix || path.startsWith(`${prefix}/`);
  }
  if (pattern.startsWith('**/*.')) return path.endsWith(pattern.slice(4));
  if (pattern.startsWith('**/')) return basename(path) === pattern.slice(3);
  return path === pattern;
}

function excluded(path, patterns) {
  return patterns.some((pattern) => patternMatches(path, pattern));
}

function walkFiles(root, start, { excludes = [] } = {}) {
  const absoluteStart = join(root, start);
  if (!existsSync(absoluteStart)) return [];
  const out = [];
  const walk = (absolute, rel) => {
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error(`package input must not contain symlinks: ${rel}`);
    if (stat.isDirectory()) {
      for (const name of readdirSync(absolute).sort()) {
        const next = rel ? `${rel}/${name}` : name;
        if (!excluded(next, excludes)) walk(join(absolute, name), next);
      }
      return;
    }
    if (!excluded(rel, excludes)) out.push(rel);
  };
  walk(absoluteStart, start);
  return out;
}

function rowsForPaths(root, paths, { gzip = false } = {}) {
  return [...new Set(paths)].sort().map((path) => {
    const bytes = readFileSync(join(root, path));
    return {
      path,
      rawBytes: bytes.length,
      ...(gzip ? { gzip9Bytes: gzipSync(bytes, { level: 9 }).length } : {}),
      sha256: sha256(bytes),
    };
  });
}

/** Recursively measure every built file under public/. */
export function scanPublic(publicDir) {
  const root = resolve(publicDir, '..');
  const publicName = basename(publicDir);
  return rowsForPaths(publicDir, walkFiles(root, publicName).map((p) => p.slice(publicName.length + 1)), { gzip: true });
}

/** Resolve the explicit distributable-theme allowlist. */
export function scanPackageEstimate(root, contract) {
  const includes = contract.include ?? PACKAGE_INCLUDE_DEFAULTS;
  const excludes = contract.exclude ?? PACKAGE_EXCLUDE_DEFAULTS;
  const paths = [];
  for (const include of includes) {
    if (include.endsWith('/**')) {
      const start = include.slice(0, -3);
      paths.push(...walkFiles(root, start, { excludes }));
      continue;
    }
    if (!existsSync(join(root, include))) throw new Error(`required package input missing: ${include}`);
    if (!excluded(include, excludes)) paths.push(include);
  }
  return rowsForPaths(root, paths);
}

/** Broad repository archive diagnostic; never used for publishing compliance. */
export function scanRepositoryArchiveDiagnostic(root, excludes = REPOSITORY_DIAGNOSTIC_EXCLUDE_DEFAULTS) {
  const paths = [];
  for (const name of readdirSync(root).sort()) {
    if (!excluded(name, excludes)) paths.push(...walkFiles(root, name, { excludes }));
  }
  return rowsForPaths(root, paths);
}

/* ---------------------------------------------------------- deterministic ZIP */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let k = 0; k < 8; k += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[n] = value >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Build a valid byte-deterministic ZIP with fixed metadata and deflate level 9. */
export function buildDeterministicZip(entries) {
  const ordered = entries.map((entry) => ({
    path: posixPath(entry.path),
    bytes: Buffer.isBuffer(entry.bytes) ? entry.bytes : Buffer.from(entry.bytes),
  })).sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const seen = new Set();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const entry of ordered) {
    if (!entry.path || entry.path.startsWith('/') || entry.path.split('/').includes('..')) {
      throw new Error(`unsafe ZIP entry path: ${entry.path}`);
    }
    if (seen.has(entry.path)) throw new Error(`duplicate ZIP entry path: ${entry.path}`);
    seen.add(entry.path);
    const name = Buffer.from(entry.path, 'utf8');
    const compressed = deflateRawSync(entry.bytes, { level: 9 });
    const checksum = crc32(entry.bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.bytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(33, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(entry.bytes.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE((0o100644 * 0x10000) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += local.length + name.length + compressed.length;
  }
  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(ordered.length, 8);
  end.writeUInt16LE(ordered.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, ...centrals, end]);
}

function zipMeasurement(root, rows) {
  const rawBytes = rows.reduce((sum, row) => sum + row.rawBytes, 0);
  const archive = buildDeterministicZip(rows.map((row) => ({ path: row.path, bytes: readFileSync(join(root, row.path)) })));
  return {
    files: rows.length,
    rawBytes,
    compressedBytes: archive.length,
    sha256: sha256(archive),
  };
}

export function evaluatePublishingCompliance(
  compressedBytes,
  hardCapBytes = SALLA_COMPRESSED_HARD_CAP_BYTES,
  internalTargetPercent = INTERNAL_COMPRESSED_TARGET_PERCENT,
) {
  const internalTargetBytes = Math.floor(hardCapBytes * internalTargetPercent / 100);
  const usagePercent = compressedBytes / hardCapBytes * 100;
  let verdict = 'PASS';
  if (compressedBytes > hardCapBytes) verdict = 'FAIL';
  else if (compressedBytes > internalTargetBytes) verdict = 'PASS WITH HEADROOM WARNING';
  return {
    verdict,
    compressedBytes,
    hardCapBytes,
    internalTargetPercent,
    internalTargetBytes,
    usagePercent,
    remainingToInternalTargetBytes: internalTargetBytes - compressedBytes,
    remainingToHardCapBytes: hardCapBytes - compressedBytes,
  };
}

/* -------------------------------------------------------------- package gate */

function compareRows(recordedRows, actualRows, label) {
  const findings = [];
  const recorded = new Map(recordedRows.map((row) => [row.path, row]));
  const actual = new Map(actualRows.map((row) => [row.path, row]));
  for (const path of recorded.keys()) {
    if (!actual.has(path)) findings.push(finding(label, 'error', `missing file: ${path} is recorded but absent — rebuild and rerun --update`));
  }
  for (const path of actual.keys()) {
    if (!recorded.has(path)) findings.push(finding(label, 'error', `unexpected file: ${path} is not recorded — rerun --update after verification`));
  }
  for (const [path, oldRow] of recorded) {
    const row = actual.get(path);
    if (!row) continue;
    if (row.rawBytes !== oldRow.rawBytes || row.sha256 !== oldRow.sha256) {
      findings.push(finding(label, 'error',
        `drift: ${path} — recorded ${oldRow.rawBytes} B (sha256 ${oldRow.sha256.slice(0, 12)}…), ` +
        `actual ${row.rawBytes} B (sha256 ${row.sha256.slice(0, 12)}…)`));
    }
  }
  return findings;
}

export function checkPackageBudget(manifest, { root, actualPublic, actualPackage }) {
  const findings = [];
  findings.push(...compareRows(manifest.files, actualPublic.map((row) => ({ ...row, path: `public/${row.path}` })), 'build-telemetry'));
  findings.push(...compareRows(manifest.sallaPackageEstimate.files, actualPackage, 'publishing'));

  const recordedPublic = new Map(manifest.files.map((row) => [row.path, row]));
  for (const row of actualPublic) {
    const old = recordedPublic.get(`public/${row.path}`) ?? recordedPublic.get(row.path);
    if (old && row.rawBytes > old.ceilingBytes) {
      findings.push(finding('build-telemetry', 'warning',
        `raw per-file ratchet exceeded: public/${row.path} — ceiling ${old.ceilingBytes} B, actual ${row.rawBytes} B, ` +
        `growth ${row.rawBytes - old.ceilingBytes} B; telemetry only, not Salla publishing compliance`));
    }
  }

  const packageMeasurement = zipMeasurement(root, actualPackage);
  const publicMeasurement = zipMeasurement(root, actualPublic.map((row) => ({ ...row, path: `public/${row.path}` })));
  const compliance = evaluatePublishingCompliance(
    packageMeasurement.compressedBytes,
    manifest.sallaCompressedHardCapBytes,
    manifest.internalCompressedTargetPercent,
  );
  const verdictLevel = compliance.verdict === 'FAIL' ? 'error' : compliance.verdict.includes('WARNING') ? 'warning' : 'info';
  findings.push(finding('publishing', 'info',
    `Salla package model: sallaPackageEstimate (${actualPackage.length} allowlisted files; exact server-side manifest not locally provable)`));
  findings.push(finding('publishing', 'info', `Raw theme package: ${packageMeasurement.rawBytes} B`));
  findings.push(finding('publishing', verdictLevel,
    `Compressed theme package: ${packageMeasurement.compressedBytes} / ${compliance.hardCapBytes} B — ${compliance.verdict}`));
  findings.push(finding('publishing', 'info', `Usage: ${compliance.usagePercent.toFixed(2)}%`));
  findings.push(finding('publishing', 'info',
    `Internal target: ${compliance.internalTargetBytes} B (${compliance.internalTargetPercent}% of current Salla hard cap)`));
  findings.push(finding('publishing', compliance.remainingToInternalTargetBytes < 0 ? 'warning' : 'info',
    compliance.remainingToInternalTargetBytes < 0
      ? `Internal ${compliance.internalTargetPercent}% target exceeded by: ${-compliance.remainingToInternalTargetBytes} B`
      : `Remaining to internal target: ${compliance.remainingToInternalTargetBytes} B`));
  findings.push(finding('publishing', compliance.remainingToHardCapBytes < 0 ? 'error' : 'info',
    compliance.remainingToHardCapBytes < 0
      ? `Salla hard cap exceeded by: ${-compliance.remainingToHardCapBytes} B`
      : `Remaining to Salla hard cap: ${compliance.remainingToHardCapBytes} B`));

  const publicTotals = totalsOf(actualPublic);
  findings.push(finding('build-telemetry', 'info',
    `public/: ${publicTotals.rawBytes} B raw / ${publicTotals.gzip9Bytes} B gzip-9 / ` +
    `${publicMeasurement.compressedBytes} B deterministic ZIP — telemetry only`));
  return { findings, packageMeasurement, publicMeasurement, compliance };
}

/* --------------------------------------------------------------------- media */

export function checkMedia(manifest, { publicDir, srcImagesDir }) {
  const findings = [];
  const registered = new Map(manifest.registeredMedia.map((media) => [media.path, media]));
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
          findings.push(finding('media', 'error', `local font shipped: ${where} — local fonts may not ship`));
          continue;
        }
        if (VIDEO_EXTS.has(ext)) {
          findings.push(finding('media', 'error', `video shipped: ${where} — demo/preview video may not ship`));
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
        if (!row) findings.push(finding('media', 'error',
          `unregistered oversized media: ${where} — ${size} B > ${MEDIA_THRESHOLD_BYTES} B with no registeredMedia row for ${publicPath}`));
        else if (size > row.maxBytes) findings.push(finding('media', 'error',
          `registered media over maxBytes: ${where} — actual ${size} B > maxBytes ${row.maxBytes} B (${publicPath})`));
      }
    };
    walk(dir, '');
  }
  if (!findings.some((row) => row.level === 'error')) findings.push(finding('media', 'info',
    `no fonts, video, demo/sample names, or unregistered oversized media (${registered.size} registered row(s))`));
  return findings;
}

/* -------------------------------------------------------------- dependencies */

export function checkDependencies(manifest, packagePath) {
  const findings = [];
  const allowed = new Set(manifest.dependencies);
  const names = readDependencyNames(packagePath);
  for (const name of names) {
    if (!allowed.has(name)) findings.push(finding('dependencies', 'error',
      `dependency absent from manifest.dependencies: "${name}" — update the allowlist in its own dependency change`));
  }
  if (!findings.some((row) => row.level === 'error')) findings.push(finding('dependencies', 'info',
    `all ${names.length} package.json dependency name(s) are recorded in manifest.dependencies`));
  return findings;
}

/* -------------------------------------------------------------------- update */

function currentGitSha(root) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return 'unknown';
  }
}

export function updateManifest({ root = process.cwd() } = {}) {
  const { publicDir, manifestPath, packagePath, checkThemePath } = pathsFor(root);
  if (existsSync(checkThemePath)) {
    try {
      execFileSync(process.execPath, [checkThemePath, '--build', '--json'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      throw new Error(`refusing --update: check-theme.mjs --build failed (exit ${error.status ?? 'unknown'}) — ` +
        'public/ is not in sync with a fresh production build of src/');
    }
  }

  const previous = existsSync(manifestPath) ? loadManifest(manifestPath) : null;
  const previousFiles = new Map((previous?.files ?? []).map((row) => [row.path.replace(/^public\//, ''), row]));
  const previousMedia = new Map((previous?.registeredMedia ?? []).map((row) => [row.path, row]));
  const approvedCeilingIncreases = previous?.buildTelemetry?.approvedCeilingIncreases ?? CORRECTIVE_RAW_CEILING_INCREASES;
  const packageContract = {
    certainty: 'estimate',
    rationale: 'Allowlist derived from the Salla Twilight base-theme structure and this repository build/runtime contract. Salla server-side packaging details are not fully reproducible locally.',
    include: previous?.sallaPackageEstimate?.include ?? PACKAGE_INCLUDE_DEFAULTS,
    exclude: previous?.sallaPackageEstimate?.exclude ?? PACKAGE_EXCLUDE_DEFAULTS,
  };
  const actualPublic = scanPublic(publicDir);
  const files = actualPublic.map((row) => {
    const old = previousFiles.get(row.path);
    const approved = approvedCeilingIncreases[`public/${row.path}`];
    const ceilingBytes = old && row.rawBytes > old.ceilingBytes && approved && row.rawBytes <= approved.maxBytes
      ? row.rawBytes
      : old ? Math.min(old.ceilingBytes, row.rawBytes) : row.rawBytes;
    return {
      path: `public/${row.path}`,
      rawBytes: row.rawBytes,
      gzip9Bytes: row.gzip9Bytes,
      sha256: row.sha256,
      ceilingBytes,
    };
  });
  const packageFiles = scanPackageEstimate(root, packageContract);
  const packageMeasurement = zipMeasurement(root, packageFiles);
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    generatedFromSha: currentGitSha(root),
    sallaCompressedHardCapBytes: previous?.sallaCompressedHardCapBytes ?? SALLA_COMPRESSED_HARD_CAP_BYTES,
    internalCompressedTargetPercent: previous?.internalCompressedTargetPercent ?? INTERNAL_COMPRESSED_TARGET_PERCENT,
    sallaPackageEstimate: {
      ...packageContract,
      files: packageFiles,
      lastMeasurement: packageMeasurement,
    },
    repositoryArchiveDiagnostic: {
      purpose: 'Broad repository-weight diagnostic only; never Salla publishing compliance.',
      exclude: previous?.repositoryArchiveDiagnostic?.exclude ?? REPOSITORY_DIAGNOSTIC_EXCLUDE_DEFAULTS,
    },
    buildTelemetry: {
      publicRawBytesPolicy: 'telemetry-warning-only',
      gzip9Policy: 'telemetry-only',
      perFileCeilingsPolicy: 'telemetry-warning-only',
      approvedCeilingIncreases,
    },
    dependencies: previous?.dependencies ?? readDependencyNames(packagePath),
    registeredMedia: REGISTERED_MEDIA_DEFAULTS.map((definition) => ({
      path: definition.path,
      reason: previousMedia.get(definition.path)?.reason ?? definition.reason,
      maxBytes: definition.maxBytes,
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
  const flags = { root: process.cwd(), update: false, json: false, report: false, gates: ['package', 'media', 'dependencies'] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') {
      index += 1;
      if (!argv[index]) throw new Error('--root requires a path');
      flags.root = resolve(argv[index]);
    } else if (arg.startsWith('--root=')) flags.root = resolve(arg.slice('--root='.length));
    else if (arg === '--update') flags.update = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === '--report') flags.report = true;
    else if (arg === '--check') { /* default */ }
    else if (arg === '--budget' || arg === '--package-budget') flags.gates = ['package'];
    else if (arg === '--demo-media') flags.gates = ['media'];
    else if (arg === '--dependency-policy') flags.gates = ['dependencies'];
    else throw new Error(`unknown argument: ${arg}`);
  }
  return flags;
}

function printHuman(findings, extra = {}) {
  const icon = { info: ' info ', warning: ' WARN ', error: 'FAILED' };
  let current = '';
  for (const row of findings) {
    if (row.gate !== current) { current = row.gate; console.log(`\n[${current}]`); }
    console.log(`  ${icon[row.level] ?? row.level} ${row.message}`);
  }
  if (extra.repositoryArchiveDiagnostic) {
    const row = extra.repositoryArchiveDiagnostic;
    console.log('\n[repository-archive-diagnostic]');
    console.log(`  info  ${row.files} files / ${row.rawBytes} B raw / ${row.compressedBytes} B ZIP — diagnostic only, not Salla theme size`);
  }
  const errors = findings.filter((row) => row.level === 'error').length;
  console.log(`\n${errors} error(s)`);
}

export function runCli(argv = process.argv.slice(2)) {
  const flags = parseArgs(argv);
  const { root } = flags;
  const { publicDir, srcImagesDir, manifestPath, packagePath } = pathsFor(root);
  if (flags.update) {
    const { manifest, updated } = updateManifest({ root });
    const actualPublic = scanPublic(publicDir);
    const publicTotals = totalsOf(actualPublic);
    const compliance = evaluatePublishingCompliance(
      manifest.sallaPackageEstimate.lastMeasurement.compressedBytes,
      manifest.sallaCompressedHardCapBytes,
      manifest.internalCompressedTargetPercent,
    );
    const result = {
      ok: compliance.verdict !== 'FAIL',
      updated,
      publishing: { ...manifest.sallaPackageEstimate.lastMeasurement, ...compliance },
      buildTelemetry: { files: actualPublic.length, ...publicTotals },
      manifestPath,
    };
    if (flags.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else console.log(`bundle-budget.json ${updated ? 'updated' : 'unchanged'}: compressed theme package ` +
      `${compliance.compressedBytes} / ${compliance.hardCapBytes} B — ${compliance.verdict}; ` +
      `public/ ${publicTotals.rawBytes} B raw (telemetry)`);
    return compliance.verdict === 'FAIL' ? 1 : 0;
  }

  if (!existsSync(manifestPath)) throw new Error(`missing manifest: ${manifestPath} — run --update`);
  const manifest = loadManifest(manifestPath);
  if (manifest.schemaVersion !== SCHEMA_VERSION) throw new Error(`manifest schemaVersion ${manifest.schemaVersion} is obsolete; run --update with schemaVersion ${SCHEMA_VERSION}`);
  const findings = [];
  let packageResult = null;
  let actualPublic = [];
  let actualPackage = [];
  if (flags.gates.includes('package') || flags.gates.includes('media')) actualPublic = scanPublic(publicDir);
  if (flags.gates.includes('package')) {
    actualPackage = scanPackageEstimate(root, manifest.sallaPackageEstimate);
    packageResult = checkPackageBudget(manifest, { root, actualPublic, actualPackage });
    findings.push(...packageResult.findings);
  }
  if (flags.gates.includes('media')) findings.push(...checkMedia(manifest, { publicDir, srcImagesDir }));
  if (flags.gates.includes('dependencies')) findings.push(...checkDependencies(manifest, packagePath));

  let repositoryArchiveDiagnostic = null;
  if (flags.report) {
    const rows = scanRepositoryArchiveDiagnostic(root, manifest.repositoryArchiveDiagnostic.exclude);
    repositoryArchiveDiagnostic = zipMeasurement(root, rows);
  }
  const errors = findings.filter((row) => row.level === 'error').length;
  const result = {
    ok: errors === 0,
    errors,
    publishing: packageResult ? { ...packageResult.packageMeasurement, ...packageResult.compliance } : null,
    buildTelemetry: packageResult ? {
      files: actualPublic.length,
      ...totalsOf(actualPublic),
      compressedPublicBytes: packageResult.publicMeasurement.compressedBytes,
    } : null,
    repositoryArchiveDiagnostic,
    findings,
  };
  if (flags.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else printHuman(findings, { repositoryArchiveDiagnostic });
  return errors === 0 ? 0 : 1;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const wantsJson = process.argv.slice(2).includes('--json');
  try {
    process.exit(runCli(process.argv.slice(2)));
  } catch (error) {
    if (wantsJson) process.stdout.write(`${JSON.stringify({ ok: false, error: error.message }, null, 2)}\n`);
    else console.error(`check-bundle-budget: ${error.message}`);
    process.exit(1);
  }
}
