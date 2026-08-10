/**
 * HDL-05 tests: bundle budget gate (T004).
 *
 * Positive witness: the committed manifest reproduces the current post-T010
 * public/ tree (28 files / 997,774 raw / 196,600 gzip-9 in this isolated
 * preview-worktree build after the approved
 * C1 safelist scope and C5 lossless media) and the checker passes — the
 * 1,000,000 B hard cap clears by 2,226 B; manifest rows, per-file ceilings,
 * demo-media, and dependency-policy all pass.
 *
 * The add-product-toast.js ceiling is 25,606 B: +1 B over the post-C1 ceiling,
 * the exact cost of the owner-approved images/placeholder.png → .webp rename
 * inside its fallback URL literal (T010 C5, owner decision 2026-08-10).
 *
 * Negative witnesses: real synthetic trees in temporary directories prove the
 * gate actually fails — over-cap totals, per-file overage, a tree that is
 * smaller gzipped but larger raw, unregistered demo media, video containers,
 * shipped local fonts, and an unlisted dependency.
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
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  scanPublic,
  checkBudget,
  checkMedia,
  checkDependencies,
  updateManifest,
} from '../scripts/check-bundle-budget.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const SCRIPT = join(ROOT, 'scripts/check-bundle-budget.mjs');
const MANIFEST_PATH = join(ROOT, 'src/config/bundle-budget.json');
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
// Captured at load so the final guard can prove no test mutated the real manifest.
const MANIFEST_SHA_AT_LOAD = createHash('sha256').update(readFileSync(MANIFEST_PATH)).digest('hex');

const errorsOf = (findings) => findings.filter((f) => f.level === 'error');
const hasError = (findings, re) => errorsOf(findings).some((f) => re.test(f.message));

/* ------------------------------------------------------ synthetic fixtures */

function makeFixture({ files = {}, images = {}, deps = ['webpack'], manifestDeps = ['webpack'], manifestExtra = {} } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'hdl05-fixture-'));
  const publicDir = join(root, 'public');
  mkdirSync(join(publicDir, 'images'), { recursive: true });
  mkdirSync(join(root, 'src', 'config'), { recursive: true });
  mkdirSync(join(root, 'src', 'assets', 'images'), { recursive: true });
  for (const [name, content] of Object.entries(files)) writeFileSync(join(publicDir, name), content);
  for (const [name, content] of Object.entries(images)) {
    writeFileSync(join(publicDir, 'images', name), content);
    writeFileSync(join(root, 'src', 'assets', 'images', name), content);
  }
  writeFileSync(join(root, 'package.json'), JSON.stringify({
    dependencies: Object.fromEntries(deps.map((d) => [d, '^1.0.0'])),
  }));
  const filesRows = scanPublic(publicDir);
  const m = {
    schemaVersion: 1,
    hardCapBytes: 1_000_000,
    internalTargetBytes: 850_000,
    dependencies: manifestDeps,
    registeredMedia: [],
    files: filesRows.map((f) => ({ ...f, ceilingBytes: f.rawBytes })),
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

describe('committed manifest vs the real post-T010 tree (C1 + C5 applied)', () => {
  const actual = scanPublic(join(ROOT, 'public'));

  test('manifest covers public/ exactly: 28 files, identical POSIX-sorted paths', () => {
    assert.equal(actual.length, 28);
    assert.deepEqual(actual.map((f) => f.path), manifest.files.map((f) => f.path));
  });

  test('current preview-worktree metrics are 997,774 raw / 196,600 gzip-9 and match the manifest rows', () => {
    const raw = actual.reduce((n, f) => n + f.rawBytes, 0);
    const gz = actual.reduce((n, f) => n + f.gzip9Bytes, 0);
    assert.equal(raw, 997_774, 'raw total');
    assert.equal(gz, 196_600, 'gzip-9 total');
    const recorded = new Map(manifest.files.map((f) => [f.path, f]));
    for (const row of actual) {
      const old = recorded.get(row.path);
      assert.equal(row.rawBytes, old.rawBytes, `${row.path} rawBytes`);
      assert.equal(row.sha256, old.sha256, `${row.path} sha256`);
    }
  });

  test('zero blocking findings on the real tree: the hard cap clears after C1 + C5', () => {
    const findings = [
      ...checkBudget(manifest, actual),
      ...checkMedia(manifest, { publicDir: join(ROOT, 'public'), srcImagesDir: join(ROOT, 'src/assets/images') }),
      ...checkDependencies(manifest, join(ROOT, 'package.json')),
    ];
    const errors = errorsOf(findings);
    assert.equal(errors.length, 0, JSON.stringify(errors, null, 2));
    const raw = actual.reduce((n, f) => n + f.rawBytes, 0);
    assert.ok(raw <= manifest.hardCapBytes,
      `raw total ${raw} must satisfy the hard cap ${manifest.hardCapBytes}`);
    assert.ok(raw > manifest.internalTargetBytes,
      'the 850,000 B internal target remains knowingly exceeded (info only)');
  });

  test('manifest format is deterministic: 2-space JSON + trailing newline, POSIX-sorted files', () => {
    const text = readFileSync(MANIFEST_PATH, 'utf8');
    assert.ok(text.endsWith('}\n'));
    assert.equal(text, JSON.stringify(JSON.parse(text), null, 2) + '\n');
    const paths = manifest.files.map((f) => f.path);
    assert.deepEqual(paths, [...paths].sort());
    assert.equal(manifest.hardCapBytes, 1_000_000);
    assert.equal(manifest.internalTargetBytes, 850_000);
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

/* ------------------------------------------- negative witnesses (fixtures) */

describe('the gate actually fails', () => {
  test('raw total over the hard cap fails, with total/cap/overage in the message', () => {
    const fx = makeFixture({ files: { 'big.css': 'x'.repeat(1_000_001) } });
    try {
      const findings = checkBudget(fx.manifest, scanPublic(fx.publicDir));
      assert.ok(hasError(findings, /hard cap breached: public\/ raw total 1000001 B > hard cap 1000000 B, overage 1 B/));
    } finally {
      fx.cleanup();
    }
  });

  test('gzip can never substitute: raw over cap fails even when gzip-9 is tiny', () => {
    const fx = makeFixture({ files: { 'compressible.css': 'a'.repeat(1_200_000) } });
    try {
      const actual = scanPublic(fx.publicDir);
      const gzipTotal = actual.reduce((s, f) => s + f.gzip9Bytes, 0);
      assert.ok(gzipTotal < 10_000, `fixture gzip should be tiny, got ${gzipTotal}`);
      const findings = checkBudget(fx.manifest, actual);
      assert.ok(hasError(findings, /hard cap breached/), 'raw over-cap must fail regardless of gzip');
    } finally {
      fx.cleanup();
    }
  });

  test('per-file ceiling breach fails with old ceiling / new actual / overage', () => {
    const fx = makeFixture({ files: { 'app.css': 'x'.repeat(1000), 'app.js': 'y'.repeat(500) } });
    try {
      writeFileSync(join(fx.publicDir, 'app.js'), 'y'.repeat(700));
      const findings = checkBudget(fx.manifest, scanPublic(fx.publicDir));
      assert.ok(hasError(findings, /ceiling breached: public\/app\.js — old ceiling 500 B, new actual 700 B, overage 200 B/));
    } finally {
      fx.cleanup();
    }
  });

  test('a file added without --update fails as unexpected; a removed file fails as missing', () => {
    const fx = makeFixture({ files: { 'app.css': 'body{}', 'old.js': 'x' } });
    try {
      writeFileSync(join(fx.publicDir, 'sneaky.js'), 'alert(1)');
      rmSync(join(fx.publicDir, 'old.js'));
      const findings = checkBudget(fx.manifest, scanPublic(fx.publicDir));
      assert.ok(hasError(findings, /unexpected file: public\/sneaky\.js/));
      assert.ok(hasError(findings, /missing file: public\/old\.js/));
    } finally {
      fx.cleanup();
    }
  });

  test('sha256 drift — same path, same size, changed content — fails with recorded/actual hashes', () => {
    const fx = makeFixture({ files: { 'app.js': 'aaaa' } });
    try {
      writeFileSync(join(fx.publicDir, 'app.js'), 'bbbb'); // same length, different bytes
      const findings = checkBudget(fx.manifest, scanPublic(fx.publicDir));
      assert.ok(hasError(findings,
        /drift: public\/app\.js — recorded 4 B \(sha256 [0-9a-f]{12}…\), actual 4 B \(sha256 [0-9a-f]{12}…\)/));
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
      // ratchet: ceilings never rise on their own
      assert.ok(second.manifest.files.every((f) => f.ceilingBytes <= f.rawBytes || f.ceilingBytes === f.rawBytes));
    } finally {
      fx.cleanup();
    }
  });

  test('--update refuses to write a ceiling above the hard cap', () => {
    const fx = makeFixture({ files: { 'huge.css': 'x'.repeat(1_100_000) } });
    try {
      rmSync(join(fx.root, 'src', 'config', 'bundle-budget.json')); // force fresh generation
      assert.throws(() => updateManifest({ root: fx.root }), /above the hard cap 1000000 B/);
    } finally {
      fx.cleanup();
    }
  });

  test('CLI --json stays machine-readable on failure and exits 1', () => {
    const fx = makeFixture({ files: { 'big.css': 'x'.repeat(1_500_000) } });
    try {
      let stdout = '';
      let code = 0;
      try {
        stdout = execFileSync(process.execPath, [SCRIPT, '--root', fx.root, '--json'], { encoding: 'utf8' });
      } catch (err) {
        code = err.status;
        stdout = err.stdout;
      }
      assert.equal(code, 1);
      const report = JSON.parse(stdout);
      assert.equal(report.ok, false);
      assert.equal(report.totals.rawBytes, 1_500_000);
      assert.ok(report.findings.some((f) => /hard cap breached/.test(f.message)));
    } finally {
      fx.cleanup();
    }
  });
});

/* ---------------- T010 C1 — owner-approved safelist scope (2026-08-10) ---- */

describe('T010 C1 safelist: source-owned exact copy of the approved artifact', () => {
  const CONFIG_PATH = join(ROOT, 'tailwind.config.js');
  const SAFELIST_PATH = join(ROOT, 'src/config/salla-safelist.txt');
  const EVIDENCE_PATH = join(ROOT, 'specs/005-performance-bundle-ci/evidence/t009-spike/safelist-launch-core-full-loyalty.txt');
  const EXPECTED_SHA256 = '833fae3b9bf4d9266d57bb6e21609a3417695b38694b5b2ef5c5c44d075ba5b8';
  const LEGACY_FULL_PATH = 'node_modules/@salla.sa/twilight-tailwind-theme/safe-list-css.txt';

  test('tailwind.config.js consumes src/config/salla-safelist.txt as the safelist content source', () => {
    const config = readFileSync(CONFIG_PATH, 'utf8');
    assert.match(config, /content:\s*\[[^\]]*'src\/config\/salla-safelist\.txt'/,
      'tailwind content sources must include src/config/salla-safelist.txt');
  });

  test('tailwind.config.js no longer references the node_modules full-safelist content path', () => {
    const config = readFileSync(CONFIG_PATH, 'utf8');
    const contentBlock = config.match(/content:\s*\[[\s\S]*?\]/)[0];
    assert.ok(!contentBlock.includes(LEGACY_FULL_PATH),
      'the node_modules full-safelist path must not remain a Tailwind content source');
  });

  test('src/config/salla-safelist.txt is exactly 1,630 lines', () => {
    const text = readFileSync(SAFELIST_PATH, 'utf8');
    const lines = text.split('\n');
    if (lines[lines.length - 1] === '') lines.pop(); // single trailing newline
    assert.equal(lines.length, 1630);
  });

  test('src/config/salla-safelist.txt has the owner-approved SHA-256 and matches the evidence artifact byte-for-byte', () => {
    const bytes = readFileSync(SAFELIST_PATH);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), EXPECTED_SHA256);
    assert.deepEqual(bytes, readFileSync(EVIDENCE_PATH),
      'the shipped safelist must be an exact copy of the approved t009-spike artifact');
  });

  test('reversibility: the previous full input is preserved byte-identical in evidence', () => {
    const baseline = readFileSync(join(ROOT, 'specs/005-performance-bundle-ci/evidence/t009-spike/safelist-full-baseline.txt'));
    assert.equal(createHash('sha256').update(baseline).digest('hex'),
      '52f1205b99071a81444f8a2fb49cc32ba1f7df9fd10e781d3b50571a2dcab2ab');
    assert.deepEqual(baseline, readFileSync(join(ROOT, LEGACY_FULL_PATH)),
      'the evidence baseline must still reproduce the node_modules full safelist exactly');
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
    assert.ok(!manifest.files.some((f) => f.path === 'images/placeholder.png'));
    assert.ok(manifest.files.some((f) => f.path === 'images/placeholder.webp' && f.rawBytes === 4310));
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

/* ------------------------------------ real-manifest mutation guard (T004) */

test('the committed manifest was not mutated by any test in this file', () => {
  const now = createHash('sha256').update(readFileSync(MANIFEST_PATH)).digest('hex');
  assert.equal(now, MANIFEST_SHA_AT_LOAD,
    'src/config/bundle-budget.json must be byte-identical to what it was when the test run started');
});
