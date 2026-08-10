/**
 * HDL-05 tests: compressed publishing package, build telemetry, and policy
 * gates. The tests deliberately prove that raw public/ size is not Salla's
 * publishing gate and that the deterministic package estimate is.
 *
 * Permanent architecture witness: zero local fonts and zero @font-face in
 * src/ and public/, with use_theme_font preserved as a deprecated no-op
 * (owner decision dated 2026-08-09).
 *
 * Node built-ins only; no network, no webpack build. Committed public/ and
 * src/config/ are only ever read — every mutation happens under tmpdir().
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  scanPublic,
  scanPackageEstimate,
  scanRepositoryArchiveDiagnostic,
  buildDeterministicZip,
  evaluatePublishingCompliance,
  checkPackageBudget,
  checkMedia,
  checkDependencies,
  updateManifest,
} from '../scripts/check-bundle-budget.mjs';
// Imported for the pure tree comparator only; check-theme.mjs is main-guarded,
// so this import never runs the guard or exits the test process.
import { diffBuildTrees } from '../scripts/check-theme.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const SCRIPT = join(ROOT, 'scripts/check-bundle-budget.mjs');
const MANIFEST_PATH = join(ROOT, 'src/config/bundle-budget.json');
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
// Captured at load so the final guard can prove no test mutated the real manifest.
const MANIFEST_SHA_AT_LOAD = createHash('sha256').update(readFileSync(MANIFEST_PATH)).digest('hex');

const errorsOf = (findings) => findings.filter((f) => f.level === 'error');
const warningsOf = (findings) => findings.filter((f) => f.level === 'warning');
const hasError = (findings, re) => errorsOf(findings).some((f) => re.test(f.message));

/* ------------------------------------------------------ synthetic fixtures */

function makeFixture({ files = {}, images = {}, deps = ['webpack'], manifestDeps = ['webpack'], manifestExtra = {} } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'hdl05-fixture-'));
  const publicDir = join(root, 'public');
  mkdirSync(join(publicDir, 'images'), { recursive: true });
  mkdirSync(join(root, 'src', 'config'), { recursive: true });
  mkdirSync(join(root, 'src', 'assets', 'images'), { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(dirname(join(publicDir, name)), { recursive: true });
    writeFileSync(join(publicDir, name), content);
  }
  for (const [name, content] of Object.entries(images)) {
    writeFileSync(join(publicDir, 'images', name), content);
    writeFileSync(join(root, 'src', 'assets', 'images', name), content);
  }
  writeFileSync(join(root, 'package.json'), JSON.stringify({
    dependencies: Object.fromEntries(deps.map((d) => [d, '^1.0.0'])),
  }));
  const filesRows = scanPublic(publicDir);
  const packageContract = { certainty: 'estimate', include: ['public/**'], exclude: ['**/.DS_Store'] };
  const packageFiles = scanPackageEstimate(root, packageContract);
  const m = {
    schemaVersion: 2,
    sallaCompressedHardCapBytes: 1_000_000,
    internalCompressedTargetPercent: 95,
    sallaPackageEstimate: { ...packageContract, files: packageFiles },
    repositoryArchiveDiagnostic: { exclude: ['.git/**', 'node_modules/**', '**/*.zip'] },
    buildTelemetry: {
      publicRawBytesPolicy: 'telemetry-warning-only',
      gzip9Policy: 'telemetry-only',
      perFileCeilingsPolicy: 'telemetry-warning-only',
    },
    dependencies: manifestDeps,
    registeredMedia: [],
    files: filesRows.map((f) => ({ ...f, path: `public/${f.path}`, ceilingBytes: f.rawBytes })),
    ...manifestExtra,
  };
  writeFileSync(join(root, 'src', 'config', 'bundle-budget.json'), JSON.stringify(m, null, 2) + '\n');
  return { root, publicDir, manifest: m, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const mediaArgs = (fx) => ({
  publicDir: join(fx.root, 'public'),
  srcImagesDir: join(fx.root, 'src', 'assets', 'images'),
});

/* ------------------------------------------- real-tree positive witnesses */

describe('committed compressed-package contract vs the restored full-Safelist tree', () => {
  const actual = scanPublic(join(ROOT, 'public'));

  test('manifest covers public/ exactly with identical POSIX-sorted paths', () => {
    assert.deepEqual(actual.map((f) => `public/${f.path}`), manifest.files.map((f) => f.path));
  });

  test('current public/ raw/gzip rows match the committed telemetry manifest', () => {
    const recorded = new Map(manifest.files.map((f) => [f.path, f]));
    for (const row of actual) {
      const old = recorded.get(`public/${row.path}`);
      assert.equal(row.rawBytes, old.rawBytes, `${row.path} rawBytes`);
      assert.equal(row.sha256, old.sha256, `${row.path} sha256`);
    }
  });

  test('compressed package passes even though raw public/ exceeds 1,000,000 B', () => {
    const actualPackage = scanPackageEstimate(ROOT, manifest.sallaPackageEstimate);
    const result = checkPackageBudget(manifest, { root: ROOT, actualPublic: actual, actualPackage });
    const findings = [
      ...result.findings,
      ...checkMedia(manifest, { publicDir: join(ROOT, 'public'), srcImagesDir: join(ROOT, 'src/assets/images') }),
      ...checkDependencies(manifest, join(ROOT, 'package.json')),
    ];
    assert.equal(errorsOf(findings).length, 0, JSON.stringify(errorsOf(findings), null, 2));
    const raw = actual.reduce((n, f) => n + f.rawBytes, 0);
    assert.ok(raw > 1_000_000, `fixture requires raw public/ > 1 MB, got ${raw}`);
    assert.equal(result.compliance.verdict, 'PASS');
  });

  test('manifest format and package manifest are deterministic and use the corrected numeric authority', () => {
    const text = readFileSync(MANIFEST_PATH, 'utf8');
    assert.ok(text.endsWith('}\n'));
    assert.equal(text, JSON.stringify(JSON.parse(text), null, 2) + '\n');
    const paths = manifest.files.map((f) => f.path);
    assert.deepEqual(paths, [...paths].sort());
    const packagePaths = manifest.sallaPackageEstimate.files.map((f) => f.path);
    assert.deepEqual(packagePaths, [...packagePaths].sort());
    assert.equal(manifest.sallaCompressedHardCapBytes, 1_000_000);
    assert.equal(manifest.internalCompressedTargetPercent, 95);
    assert.equal(manifest.hardCapBytes, undefined);
    assert.equal(manifest.internalTargetBytes, undefined);
  });
});

describe('permanent font architecture (owner decision 2026-08-09)', () => {
  const walkAll = (dir) => {
    const out = [];
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) out.push(...walkAll(full));
      else out.push(full);
    }
    return out;
  };

  test('zero local font files in src/ and public/ and zero @font-face / Thmanyah references', () => {
    const files = [...walkAll(join(ROOT, 'src')), ...walkAll(join(ROOT, 'public'))];
    assert.deepEqual(files.filter((f) => /\.(woff2?|ttf|otf|eot)$/i.test(f)), []);
    const text = files.filter((f) => /\.(css|scss|twig|js|json)$/.test(f))
      .map((f) => readFileSync(f, 'utf8')).join('\n');
    assert.ok(!/@font-face/i.test(text), '@font-face found');
    assert.ok(!/thmanyah/i.test(text), 'Thmanyah reference found');
  });

  test('--font-main fallback in global.scss contains no project/local font name (owner rule 2026-08-09)', () => {
    const scss = readFileSync(join(ROOT, 'src/assets/styles/01-settings/global.scss'), 'utf8');
    const decl = scss.match(/--font-main:\s*([^;]+);/);
    assert.ok(decl, '--font-main declaration missing from global.scss');
    const value = decl[1];
    // project/local font names are permanently banned from the fallback
    assert.ok(!/dinnext/i.test(value), 'DINNextLTArabic must never re-enter the --font-main fallback');
    assert.ok(!/thmanyah/i.test(value), 'Thmanyah must never re-enter the --font-main fallback');
    // the fallback must terminate in a generic family so it always resolves
    assert.match(value, /sans-serif\s*$/, '--font-main fallback must end in a generic family');
    // every quoted identifier must be a safe OS/system font name — never a project font
    const quoted = [...value.matchAll(/"([^"]+)"|'([^']+)'/g)].map((m) => m[1] ?? m[2]);
    const SAFE_SYSTEM_NAMES = new Set(['Segoe UI', 'Helvetica Neue', 'Arial']);
    for (const name of quoted) {
      assert.ok(SAFE_SYSTEM_NAMES.has(name), `non-system font name in --font-main fallback: "${name}"`);
    }
  });

  test('master.twig still maps --font-main to the merchant Salla theme.font (untouched contract)', () => {
    const twig = readFileSync(join(ROOT, 'src/views/layouts/master.twig'), 'utf8');
    assert.match(twig, /--font-main:\s*'\{\{\s*theme\.font\.name\s*\}\}';/,
      'master.twig must keep injecting the merchant\'s Salla theme.font.name as --font-main');
  });

  test('use_theme_font is preserved in twilight.json (boolean, default false) and the registry as a no-op', () => {
    const twilight = JSON.parse(readFileSync(join(ROOT, 'twilight.json'), 'utf8'));
    const stack = [twilight];
    let field = null;
    while (stack.length && !field) {
      const node = stack.pop();
      if (Array.isArray(node)) { stack.push(...node); continue; }
      if (node && typeof node === 'object') {
        if (node.id === 'use_theme_font') field = node;
        else stack.push(...Object.values(node));
      }
    }
    assert.ok(field, 'use_theme_font missing from twilight.json');
    assert.equal(field.type, 'boolean', 'use_theme_font must remain a boolean setting');
    assert.equal(field.value, false, 'use_theme_font default (value) must remain false');
    const registry = readFileSync(join(ROOT, 'src/config/settings-registry.json'), 'utf8');
    assert.match(registry, /global::use_theme_font/);
    assert.match(registry, /[Dd]eprecated compatibility no-op/);
  });
});

/* ---------------------- corrected compressed-package publishing contract */

describe('Salla compressed publishing verdict boundaries', () => {
  test('A: raw package >1,000,000 B and compressed package <1,000,000 B passes', () => {
    const bytes = Buffer.alloc(1_200_000, 0x61);
    const zip = buildDeterministicZip([{ path: 'public/app.css', bytes }]);
    assert.ok(bytes.length > 1_000_000);
    assert.ok(zip.length < 1_000_000);
    assert.equal(evaluatePublishingCompliance(zip.length).verdict, 'PASS');
  });

  test('B: raw may look acceptable while ZIP overhead pushes compressed package over cap, so it fails', () => {
    const entries = Array.from({ length: 10_000 }, (_, index) => {
      const digest = createHash('sha256').update(String(index)).digest();
      return { path: `public/f-${String(index).padStart(5, '0')}.bin`, bytes: Buffer.concat([digest, digest]) };
    });
    const raw = entries.reduce((sum, row) => sum + row.bytes.length, 0);
    const zip = buildDeterministicZip(entries);
    assert.ok(raw < 1_000_000, `raw fixture must remain below cap, got ${raw}`);
    assert.ok(zip.length > 1_000_000, `ZIP fixture must exceed cap, got ${zip.length}`);
    assert.equal(evaluatePublishingCompliance(zip.length).verdict, 'FAIL');
  });

  test('C/D/E: <=950,000 PASS; 950,001–1,000,000 warning; >1,000,000 FAIL', () => {
    assert.equal(evaluatePublishingCompliance(950_000).verdict, 'PASS');
    assert.equal(evaluatePublishingCompliance(950_001).verdict, 'PASS WITH HEADROOM WARNING');
    assert.equal(evaluatePublishingCompliance(1_000_000).verdict, 'PASS WITH HEADROOM WARNING');
    assert.equal(evaluatePublishingCompliance(1_000_001).verdict, 'FAIL');
  });

  test('deterministic ZIP output is byte-identical regardless of input order', () => {
    const entries = [
      { path: 'twilight.json', bytes: Buffer.from('{}\n') },
      { path: 'public/app.css', bytes: Buffer.from('body{}') },
    ];
    const first = buildDeterministicZip(entries);
    const second = buildDeterministicZip([...entries].reverse());
    assert.deepEqual(first, second);
    assert.equal(first.subarray(0, 4).toString('hex'), '504b0304');
  });
});

describe('package manifest, build telemetry, and policy gates', () => {
  test('raw public growth is a warning, never a Salla publishing-size error', () => {
    const fx = makeFixture({ files: { 'app.css': 'x'.repeat(1_200_000) } });
    try {
      const actualPublic = scanPublic(fx.publicDir);
      const actualPackage = scanPackageEstimate(fx.root, fx.manifest.sallaPackageEstimate);
      const result = checkPackageBudget(fx.manifest, { root: fx.root, actualPublic, actualPackage });
      assert.equal(result.compliance.verdict, 'PASS');
      assert.equal(errorsOf(result.findings).length, 0);
    } finally {
      fx.cleanup();
    }
  });

  test('per-file raw ceiling growth reports WARN while manifest byte drift still blocks', () => {
    const fx = makeFixture({ files: { 'app.js': 'y'.repeat(500) } });
    try {
      writeFileSync(join(fx.publicDir, 'app.js'), 'y'.repeat(700));
      const actualPublic = scanPublic(fx.publicDir);
      const actualPackage = scanPackageEstimate(fx.root, fx.manifest.sallaPackageEstimate);
      const result = checkPackageBudget(fx.manifest, { root: fx.root, actualPublic, actualPackage });
      assert.ok(warningsOf(result.findings).some((row) => /raw per-file ratchet exceeded/.test(row.message)));
      assert.ok(hasError(result.findings, /drift: public\/app\.js/), 'package/manifest drift remains blocking');
    } finally {
      fx.cleanup();
    }
  });

  test('package manifest drift detects an added allowlisted theme source file', () => {
    const fx = makeFixture({ files: { 'app.css': 'body{}' } });
    try {
      mkdirSync(join(fx.root, 'src/views'), { recursive: true });
      fx.manifest.sallaPackageEstimate.include.push('src/views/**');
      fx.manifest.sallaPackageEstimate.files = scanPackageEstimate(fx.root, fx.manifest.sallaPackageEstimate);
      writeFileSync(join(fx.root, 'src/views/new.twig'), '<main/>');
      const actualPackage = scanPackageEstimate(fx.root, fx.manifest.sallaPackageEstimate);
      const result = checkPackageBudget(fx.manifest, {
        root: fx.root,
        actualPublic: scanPublic(fx.publicDir),
        actualPackage,
      });
      assert.ok(hasError(result.findings, /unexpected file: src\/views\/new\.twig/));
    } finally {
      fx.cleanup();
    }
  });

  test('the distributable estimate excludes specs, tests, node_modules, logs, and ZIPs', () => {
    const fx = makeFixture({ files: { 'app.css': 'body{}' } });
    try {
      for (const rel of ['specs/005/evidence.png', 'tests/test.mjs', 'node_modules/x/index.js', 'output/debug.log', 'old.zip']) {
        mkdirSync(dirname(join(fx.root, rel)), { recursive: true });
        writeFileSync(join(fx.root, rel), 'not distributable');
      }
      const paths = scanPackageEstimate(fx.root, fx.manifest.sallaPackageEstimate).map((row) => row.path);
      for (const prefix of ['specs/', 'tests/', 'node_modules/', 'output/']) {
        assert.ok(!paths.some((path) => path.startsWith(prefix)), `${prefix} contaminated package`);
      }
      assert.ok(!paths.includes('old.zip'));
    } finally {
      fx.cleanup();
    }
  });

  test('repository archive diagnostic is broad and remains distinct from the package allowlist', () => {
    const fx = makeFixture({ files: { 'app.css': 'body{}' } });
    try {
      mkdirSync(join(fx.root, 'specs/005'), { recursive: true });
      writeFileSync(join(fx.root, 'specs/005/history.md'), 'history');
      const packagePaths = scanPackageEstimate(fx.root, fx.manifest.sallaPackageEstimate).map((row) => row.path);
      const diagnosticPaths = scanRepositoryArchiveDiagnostic(fx.root, fx.manifest.repositoryArchiveDiagnostic.exclude)
        .map((row) => row.path);
      assert.ok(!packagePaths.includes('specs/005/history.md'));
      assert.ok(diagnosticPaths.includes('specs/005/history.md'));
    } finally {
      fx.cleanup();
    }
  });

  test('demo/sample naming, video containers, and shipped fonts fail', () => {
    const fx = makeFixture({
      files: { 'app.css': 'body{}' },
      images: { 'demo-banner.svg': '<svg/>', 'clip.mp4': 'n/a', 'font.woff2': 'n/a' },
    });
    try {
      const findings = checkMedia(fx.manifest, mediaArgs(fx));
      assert.ok(hasError(findings, /demo\/sample basename: .*demo-banner\.svg/));
      assert.ok(hasError(findings, /video shipped: .*clip\.mp4/));
      assert.ok(hasError(findings, /local font shipped: .*font\.woff2/));
    } finally {
      fx.cleanup();
    }
  });

  test('unregistered oversized media fails; registered media within maxBytes passes', () => {
    const big = 'x'.repeat(26_000);
    const bad = makeFixture({ files: { 'app.css': 'body{}' }, images: { 'hero.png': big } });
    const good = makeFixture({
      files: { 'app.css': 'body{}' },
      images: { 'hero.png': big },
      manifestExtra: { registeredMedia: [{ path: 'images/hero.png', reason: 'fixture witness', maxBytes: 30_000 }] },
    });
    try {
      assert.ok(hasError(checkMedia(bad.manifest, mediaArgs(bad)),
        /unregistered oversized media: .*hero\.png — 26000 B > 25000 B/));
      assert.ok(!errorsOf(checkMedia(good.manifest, mediaArgs(good))).length);
    } finally {
      bad.cleanup();
      good.cleanup();
    }
  });

  test('a dependency outside manifest.dependencies fails', () => {
    const fx = makeFixture({ files: { 'app.css': 'body{}' }, deps: ['webpack', 'left-pad'] });
    try {
      const findings = checkDependencies(fx.manifest, join(fx.root, 'package.json'));
      assert.ok(hasError(findings, /dependency absent from manifest\.dependencies: "left-pad"/));
    } finally {
      fx.cleanup();
    }
  });

  test('--update is deterministic: byte-identical across two consecutive runs', () => {
    const fx = makeFixture({ files: { 'app.css': 'x'.repeat(1000), 'app.js': 'y'.repeat(500) } });
    try {
      const first = updateManifest({ root: fx.root });
      assert.equal(first.updated, true);
      const bytes1 = readFileSync(first.manifestPath, 'utf8');
      const second = updateManifest({ root: fx.root });
      assert.equal(second.updated, false, 'second --update must be a no-op on an unchanged tree');
      assert.equal(readFileSync(second.manifestPath, 'utf8'), bytes1);
      assert.equal(second.manifest.schemaVersion, 2);
      assert.equal(second.manifest.sallaCompressedHardCapBytes, 1_000_000);
      assert.equal(second.manifest.internalCompressedTargetPercent, 95);
      assert.ok(second.manifest.files.every((f) => f.ceilingBytes <= f.rawBytes || f.ceilingBytes === f.rawBytes));
    } finally {
      fx.cleanup();
    }
  });

  test('--update permits raw public/ above 1 MB when the compressed package passes', () => {
    const fx = makeFixture({ files: { 'huge.css': 'x'.repeat(1_100_000) } });
    try {
      const result = updateManifest({ root: fx.root });
      assert.ok(result.manifest.files.reduce((sum, row) => sum + row.rawBytes, 0) > 1_000_000);
      assert.equal(evaluatePublishingCompliance(
        result.manifest.sallaPackageEstimate.lastMeasurement.compressedBytes,
      ).verdict, 'PASS');
    } finally {
      fx.cleanup();
    }
  });

  test('CLI --json stays machine-readable and reports compressed publishing fields', () => {
    const fx = makeFixture({ files: { 'big.css': 'x'.repeat(1_500_000) } });
    try {
      const stdout = execFileSync(process.execPath, [SCRIPT, '--root', fx.root, '--json'], { encoding: 'utf8' });
      const report = JSON.parse(stdout);
      assert.equal(report.ok, true);
      assert.ok(report.buildTelemetry.rawBytes > 1_000_000);
      assert.equal(report.publishing.verdict, 'PASS');
    } finally {
      fx.cleanup();
    }
  });
});

/* -------------------- corrective restoration of the pre-C1 full Safelist */

describe('pre-C1 Salla/Twilight Safelist restored exactly', () => {
  const CONFIG_PATH = join(ROOT, 'tailwind.config.js');
  const SAFELIST_PATH = join(ROOT, 'src/config/salla-safelist.txt');
  const CONFIG_EVIDENCE_PATH = join(ROOT, 'specs/005-performance-bundle-ci/evidence/t010-c1-pre-change-tailwind.config.js');
  const FULL_EVIDENCE_PATH = join(ROOT, 'specs/005-performance-bundle-ci/evidence/t009-spike/safelist-full-baseline.txt');
  const LEGACY_FULL_PATH = 'node_modules/@salla.sa/twilight-tailwind-theme/safe-list-css.txt';

  test('tailwind.config.js is byte-identical to the preserved pre-C1 configuration', () => {
    const config = readFileSync(CONFIG_PATH);
    assert.deepEqual(config, readFileSync(CONFIG_EVIDENCE_PATH));
    assert.equal(createHash('sha256').update(config).digest('hex'),
      'e73bab577a967f3d6a4969e30a2ac8461145b139e76d5cfeced2848b2155a436');
  });

  test('Tailwind consumes the package full Safelist and the reduced C1 source is absent', () => {
    const config = readFileSync(CONFIG_PATH, 'utf8');
    assert.ok(config.includes(`'${LEGACY_FULL_PATH}'`));
    assert.throws(() => statSync(SAFELIST_PATH), /ENOENT/);
  });

  test('the installed full Safelist matches the preserved T010 evidence byte-for-byte', () => {
    const baseline = readFileSync(FULL_EVIDENCE_PATH);
    assert.equal(createHash('sha256').update(baseline).digest('hex'),
      '52f1205b99071a81444f8a2fb49cc32ba1f7df9fd10e781d3b50571a2dcab2ab');
    assert.deepEqual(baseline, readFileSync(join(ROOT, LEGACY_FULL_PATH)),
      'the evidence baseline must still reproduce the node_modules full safelist exactly');
  });

  test('restored Cart, Loyalty, notification, and order-state compatibility selectors are present', () => {
    const full = readFileSync(join(ROOT, LEGACY_FULL_PATH), 'utf8');
    for (const selector of [
      's-bullet-delivery-cart-view',
      's-loyalty-points-history-container',
      's-notifications-container',
      's-order-cancel-content',
    ]) assert.match(full, new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'));
  });
});

/* --------------- T010 C5 — owner-approved lossless media (2026-08-10) ----- */

describe('T010 C5 media: source-owned exact copies of the approved evidence candidates', () => {
  const EVIDENCE_DIR = join(ROOT, 'specs/005-performance-bundle-ci/evidence/t009-media/optimized');
  const SRC_IMAGES = join(ROOT, 'src/assets/images');
  const PUBLIC_IMAGES = join(ROOT, 'public/images');
  const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

  // Hashes recorded in evidence/media-optimization-spike.md; the placeholder
  // candidate decodes to RGBA MD5 49a075f8c5a5ed03958ebeeb4954f459, identical
  // to the original PNG (verified with ffmpeg rgba decode on 2026-08-10).
  const CANDIDATES = [
    ['placeholder.webp', '401e04acb08ab1309aacd5977e8b2e5065f23e91966d84f3a2817b6bc0a96bd4'],
    ['check.svg', 'a3ab72d1668b6103df7646895371f47f758ffd25a5a93afdb0d7ec9e60c70112'],
    ['delivery-bro.svg', 'd3e9a655ac18868421f4707bdf1ac7b215ea0d4cdeeaa4d438629e6d9b962dfa'],
    ['payment_icons/mispay.svg', '5040db9b10ad39ac739637a4ddb5625b67317c83426f3a22c167d5338e58641c'],
    ['payment_icons/tabby.svg', '9ff888cd36e123d2eaf22b8e692384558071a6d2e67271b5848b84d2b4c3fe8c'],
    ['payment_icons/tamara.svg', 'e0490a0857da1612c994be3e045bbe09212a5c1f5e4cf9e03d60b705f14a3104'],
  ];

  test('shipped src assets are byte-identical to the approved candidates and match public/', () => {
    for (const [rel, expected] of CANDIDATES) {
      assert.equal(sha256(join(SRC_IMAGES, rel)), expected, `src ${rel} must match the evidence candidate hash`);
      assert.deepEqual(readFileSync(join(SRC_IMAGES, rel)), readFileSync(join(EVIDENCE_DIR, rel)),
        `src ${rel} must be byte-identical to evidence/t009-media/optimized`);
      assert.deepEqual(readFileSync(join(PUBLIC_IMAGES, rel)), readFileSync(join(SRC_IMAGES, rel)),
        `public ${rel} must be the build-copied src asset`);
    }
  });

  test('placeholder.png is gone from src, public, and the manifest registry; placeholder.webp is registered', () => {
    assert.throws(() => statSync(join(SRC_IMAGES, 'placeholder.png')), /ENOENT/);
    assert.throws(() => statSync(join(PUBLIC_IMAGES, 'placeholder.png')), /ENOENT/);
    statSync(join(SRC_IMAGES, 'placeholder.webp'));
    statSync(join(PUBLIC_IMAGES, 'placeholder.webp'));
    const media = manifest.registeredMedia.map((m) => m.path);
    assert.ok(media.includes('images/placeholder.webp'));
    assert.ok(!media.includes('images/placeholder.png'));
    assert.ok(!manifest.files.some((f) => f.path === 'public/images/placeholder.png'));
    assert.ok(manifest.files.some((f) => f.path === 'public/images/placeholder.webp' && f.rawBytes === 4310));
  });

  test('zero stale images/placeholder.png literals remain in theme-owned source and scripts', () => {
    const owned = [
      ...['src/views', 'src/assets/js'].flatMap((dir) =>
        execFileSync('grep', ['-rl', 'placeholder', join(ROOT, dir)], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)),
      join(ROOT, 'scripts/check-bundle-budget.mjs'),
    ];
    for (const file of owned) {
      assert.ok(!readFileSync(file, 'utf8').includes('placeholder.png'),
        `${file} must not reference images/placeholder.png`);
    }
  });

  test('payment icons preserve role=img, aria-labelledby, and a matching <title id>', () => {
    for (const rel of ['payment_icons/mispay.svg', 'payment_icons/tabby.svg', 'payment_icons/tamara.svg']) {
      const svg = readFileSync(join(SRC_IMAGES, rel), 'utf8');
      assert.match(svg, /role="img"/, `${rel} must keep role="img"`);
      const labelledby = svg.match(/aria-labelledby="([^"]+)"/);
      assert.ok(labelledby, `${rel} must keep aria-labelledby`);
      assert.ok(svg.includes(`<title id="${labelledby[1]}">`),
        `${rel} must keep a <title> whose id matches aria-labelledby`);
      assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'), `${rel} must stay a well-formed svg document`);
    }
  });
});

/* --- build-sync full-tree freshness gate (final-review blocker 3, T004) --- */

/**
 * The --build freshness gate must compare the COMPLETE fresh webpack output
 * against the committed public/ tree recursively — images, licence files, and
 * nested files included — so a stale or extra nested asset can neither pass
 * the gate nor be ratcheted into the manifest by --update. No webpack build
 * runs here: diffBuildTrees is pure, and the --update path uses a fixture
 * stub that wires the real comparator in as the freshness gate.
 */
describe('build-sync full-tree freshness gate (final-review blocker 3)', () => {
  const TREE_FILES = {
    'app.css': 'body{color:red}',
    'app.js': 'console.log(1)',
    'app.js.LICENSE.txt': 'licence text',
    'images/check.svg': '<svg>check</svg>',
    'images/payment_icons/tabby.svg': '<svg>tabby</svg>',
  };

  const writeTree = (dir, files) => {
    for (const [rel, content] of Object.entries(files)) {
      mkdirSync(join(dir, dirname(rel)), { recursive: true });
      writeFileSync(join(dir, rel), content);
    }
  };

  function makeTrees() {
    const root = mkdtempSync(join(tmpdir(), 'hdl05-buildsync-'));
    const fresh = join(root, 'fresh');
    const pub = join(root, 'public');
    writeTree(fresh, TREE_FILES);
    writeTree(pub, TREE_FILES);
    return { root, fresh, pub, cleanup: () => rmSync(root, { recursive: true, force: true }) };
  }

  test('identical trees compare clean recursively (JS, CSS, images, licences, nested paths)', () => {
    const fx = makeTrees();
    try {
      assert.deepEqual(diffBuildTrees(fx.fresh, fx.pub), []);
    } finally {
      fx.cleanup();
    }
  });

  test('a stale nested public asset (same path, different bytes) is detected as drift', () => {
    const fx = makeTrees();
    try {
      writeFileSync(join(fx.pub, 'images/payment_icons/tabby.svg'), '<svg>stale</svg>');
      assert.deepEqual(diffBuildTrees(fx.fresh, fx.pub),
        [{ path: 'images/payment_icons/tabby.svg', reason: 'drift' }]);
    } finally {
      fx.cleanup();
    }
  });

  test('an extra nested public asset the build does not produce is detected as a stale extra', () => {
    const fx = makeTrees();
    try {
      writeFileSync(join(fx.pub, 'images/stale-leftover.svg'), '<svg>old</svg>');
      assert.deepEqual(diffBuildTrees(fx.fresh, fx.pub),
        [{ path: 'images/stale-leftover.svg', reason: 'stale extra' }]);
    } finally {
      fx.cleanup();
    }
  });

  test('a licence file missing from public/ is detected; licence bytes are compared too', () => {
    const fx = makeTrees();
    try {
      rmSync(join(fx.pub, 'app.js.LICENSE.txt'));
      assert.deepEqual(diffBuildTrees(fx.fresh, fx.pub),
        [{ path: 'app.js.LICENSE.txt', reason: 'missing' }]);
      writeTree(fx.pub, { 'app.js.LICENSE.txt': 'different licence text' });
      assert.deepEqual(diffBuildTrees(fx.fresh, fx.pub),
        [{ path: 'app.js.LICENSE.txt', reason: 'drift' }]);
    } finally {
      fx.cleanup();
    }
  });

  /* --update ratchet path: the freshness gate runs the REAL comparator. */

  const CHECK_THEME_URL = pathToFileURL(join(ROOT, 'scripts/check-theme.mjs')).href;
  const FRESHNESS_STUB = `#!/usr/bin/env node
import { diffBuildTrees } from ${JSON.stringify(CHECK_THEME_URL)};
import { join } from 'node:path';
const drift = diffBuildTrees(process.env.HDL05_TEST_FRESH_DIR, join(process.cwd(), 'public'));
if (drift.length) {
  process.stderr.write(JSON.stringify({ errors: drift.length, findings: drift }));
  process.exit(1);
}
`;

  function makeRatchetFixture({ mutate }) {
    const root = mkdtempSync(join(tmpdir(), 'hdl05-ratchet-'));
    const fresh = join(root, 'fresh');
    writeTree(join(root, 'public'), TREE_FILES);
    writeTree(fresh, TREE_FILES);
    mutate(root, fresh);
    mkdirSync(join(root, 'scripts'), { recursive: true });
    writeFileSync(join(root, 'scripts', 'check-theme.mjs'), FRESHNESS_STUB);
    mkdirSync(join(root, 'src', 'config'), { recursive: true });
    writeFileSync(join(root, 'package.json'), JSON.stringify({ dependencies: {} }));
    const publicRows = scanPublic(join(root, 'public'));
    const packageContract = { certainty: 'estimate', include: ['public/**'], exclude: [] };
    const fixtureManifest = {
      schemaVersion: 2,
      sallaCompressedHardCapBytes: 1_000_000,
      internalCompressedTargetPercent: 95,
      sallaPackageEstimate: { ...packageContract, files: scanPackageEstimate(root, packageContract) },
      repositoryArchiveDiagnostic: { exclude: ['.git/**', 'node_modules/**'] },
      buildTelemetry: {},
      dependencies: [],
      registeredMedia: [],
      files: publicRows.map((row) => ({ ...row, path: `public/${row.path}`, ceilingBytes: row.rawBytes })),
    };
    writeFileSync(join(root, 'src', 'config', 'bundle-budget.json'), `${JSON.stringify(fixtureManifest, null, 2)}\n`);
    return { root, fresh, cleanup: () => rmSync(root, { recursive: true, force: true }) };
  }

  const withFreshDir = (fresh, fn) => {
    const prev = process.env.HDL05_TEST_FRESH_DIR;
    process.env.HDL05_TEST_FRESH_DIR = fresh;
    try { return fn(); } finally {
      if (prev === undefined) delete process.env.HDL05_TEST_FRESH_DIR;
      else process.env.HDL05_TEST_FRESH_DIR = prev;
    }
  };

  test('--update refuses to ratchet a stale or extra nested public asset', () => {
    const stale = makeRatchetFixture({ mutate: (root) =>
      writeFileSync(join(root, 'public', 'images', 'check.svg'), '<svg>stale</svg>') });
    const extra = makeRatchetFixture({ mutate: (root) =>
      writeFileSync(join(root, 'public', 'images', 'payment_icons', 'leftover.svg'), '<svg/>') });
    try {
      for (const fx of [stale, extra]) {
        assert.throws(
          () => withFreshDir(fx.fresh, () => updateManifest({ root: fx.root })),
          /refusing --update: check-theme\.mjs --build failed/,
          'a public/ tree that fails the full-tree freshness gate must not be ratcheted');
        assert.ok(statSync(join(fx.root, 'src', 'config', 'bundle-budget.json')).isFile(),
          'the existing manifest must remain present when freshness fails');
      }
    } finally {
      stale.cleanup();
      extra.cleanup();
    }
  });

  test('--update proceeds only when the full-tree freshness gate passes (positive control)', () => {
    const fx = makeRatchetFixture({ mutate: () => {} });
    try {
      const result = withFreshDir(fx.fresh, () => updateManifest({ root: fx.root }));
      assert.equal(result.updated, true);
      const paths = result.manifest.files.map((f) => f.path);
      assert.deepEqual(paths, Object.keys(TREE_FILES).sort().map((path) => `public/${path}`));
    } finally {
      fx.cleanup();
    }
  });
});

/* --------------------- T009 inventory script location regression (Blocker 4) */

describe('T009 spike inventory script is reproducible from its tracked location', () => {
  const INVENTORY_DIR = join(ROOT, 'specs/005-performance-bundle-ci/evidence/t009-spike');
  const INVENTORY_SCRIPT = join(INVENTORY_DIR, 'hdl05-tier-inventory.mjs');
  const OUTPUTS = ['hdl05-safe-list-conservative.txt', 'hdl05-safe-list-tierA.txt'];

  // Regression witness: the script previously derived ROOT from its own evidence
  // directory and exited 1 looking for node_modules there. It must resolve the
  // repository root from its tracked location, reproduce the documented counts,
  // and confine generated outputs to evidence/t009-spike. Any pre-existing output
  // bytes are restored afterwards so the test never mutates the tree.
  test('exits 0, reproduces the documented tier counts, and writes outputs only inside evidence/t009-spike', () => {
    const prior = OUTPUTS.map((name) => {
      const p = join(INVENTORY_DIR, name);
      try { return { p, bytes: readFileSync(p) }; } catch { return { p, bytes: null }; }
    });
    try {
      const out = execFileSync(process.execPath, [INVENTORY_SCRIPT], { encoding: 'utf8', timeout: 180000 });
      for (const line of ['tokens_total=2494', 'tierA=2472', 'tierB=0', 'tierC=5', 'tierD=17', 'corpus_files=2358']) {
        assert.ok(out.includes(line), `inventory output is missing "${line}":\n${out}`);
      }
      for (const { p } of prior) {
        assert.ok(statSync(p).isFile(), `${p} must be written next to the script`);
      }
      for (const name of OUTPUTS) {
        assert.throws(() => statSync(join(ROOT, name)), /ENOENT/,
          `${name} must not leak into the repository root`);
      }
    } finally {
      for (const { p, bytes } of prior) {
        if (bytes === null) rmSync(p, { force: true });
        else writeFileSync(p, bytes);
      }
    }
  });
});

/* ------------------------------------ real-manifest mutation guard (T004) */

test('the committed manifest was not mutated by any test in this file', () => {
  const now = createHash('sha256').update(readFileSync(MANIFEST_PATH)).digest('hex');
  assert.equal(now, MANIFEST_SHA_AT_LOAD,
    'src/config/bundle-budget.json must be byte-identical to what it was when the test run started');
});
