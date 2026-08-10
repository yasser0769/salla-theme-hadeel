# T011 — Final Automated Gate Outputs

> **HISTORICAL — old contract.** Literal raw-cap output is retained as evidence of what
> ran; it is not the current Salla publishing verdict.

- **Captured:** `2026-08-10T07:25:19+03:00`
- **Branch:** `codex/hdl-05-performance-bundle-ci`
- **HEAD:** `eb40134dcda5c147ff03a048ad05b3e11ba8a15b`
- **Final public measurement:** `{"files":28,"rawBytes":997743,"gzip9Bytes":196388}`

## `node --test tests/performance-bundle-ci.test.mjs`

Exit: `0`

```text
▶ committed manifest vs the real post-T010 tree (C1 + C5 applied)
  ✔ manifest covers public/ exactly: 28 files, identical POSIX-sorted paths
  ✔ current public/ metrics are 997,743 raw / 196,388 gzip-9 and match the manifest rows
  ✔ zero blocking findings on the real tree: the hard cap clears after C1 + C5
  ✔ manifest format is deterministic: 2-space JSON + trailing newline, POSIX-sorted files
✔ committed manifest vs the real post-T010 tree (C1 + C5 applied)
▶ permanent font architecture (owner decision 2026-08-09)
  ✔ zero local font files in src/ and public/ and zero @font-face / Thmanyah references
  ✔ --font-main fallback in global.scss contains no project/local font name (owner rule 2026-08-09)
  ✔ master.twig still maps --font-main to the merchant Salla theme.font (untouched contract)
  ✔ use_theme_font is preserved in twilight.json (boolean, default false) and the registry as a no-op
✔ permanent font architecture (owner decision 2026-08-09)
▶ the gate actually fails
  ✔ raw total over the hard cap fails, with total/cap/overage in the message
  ✔ gzip can never substitute: raw over cap fails even when gzip-9 is tiny
  ✔ per-file ceiling breach fails with old ceiling / new actual / overage
  ✔ a file added without --update fails as unexpected; a removed file fails as missing
  ✔ sha256 drift — same path, same size, changed content — fails with recorded/actual hashes
  ✔ demo/sample naming, video containers, and shipped fonts fail
  ✔ unregistered oversized media fails; registered media within maxBytes passes
  ✔ a dependency outside manifest.dependencies fails
  ✔ --update is deterministic: byte-identical across two consecutive runs
  ✔ --update refuses to write a ceiling above the hard cap
  ✔ CLI --json stays machine-readable on failure and exits 1
✔ the gate actually fails
▶ T010 C1 safelist: source-owned exact copy of the approved artifact
  ✔ tailwind.config.js consumes src/config/salla-safelist.txt as the safelist content source
  ✔ tailwind.config.js no longer references the node_modules full-safelist content path
  ✔ src/config/salla-safelist.txt is exactly 1,630 lines
  ✔ src/config/salla-safelist.txt has the owner-approved SHA-256 and matches the evidence artifact byte-for-byte
  ✔ reversibility: the previous full input is preserved byte-identical in evidence
✔ T010 C1 safelist: source-owned exact copy of the approved artifact
▶ T010 C5 media: source-owned exact copies of the approved evidence candidates
  ✔ shipped src assets are byte-identical to the approved candidates and match public/
  ✔ placeholder.png is gone from src, public, and the manifest registry; placeholder.webp is registered
  ✔ zero stale images/placeholder.png literals remain in theme-owned source and scripts
  ✔ payment icons preserve role=img, aria-labelledby, and a matching <title id>
✔ T010 C5 media: source-owned exact copies of the approved evidence candidates
✔ the committed manifest was not mutated by any test in this file
ℹ tests 29
ℹ suites 5
ℹ pass 29
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

Node's timing values were omitted from this transcription because they are nondeterministic; every assertion line and final count is otherwise literal.

## `node scripts/check-theme.mjs --json`

Exit: `0`

```json
{
  "errors": 0,
  "warnings": 0,
  "findings": [
    { "check": "duplicate-selectors", "level": "ok", "message": "no selector is split across component files" },
    { "check": "hardcoded-arabic", "level": "ok", "message": "no hardcoded Arabic outside src/locales" },
    { "check": "dead-classes", "level": "ok", "message": "every theme class in SCSS is rendered somewhere" },
    { "check": "css-variables", "level": "ok", "message": "every referenced custom property is defined" },
    { "check": "theme-settings", "level": "ok", "message": "every setting read by a template is declared in twilight.json" },
    { "check": "settings-registry", "level": "ok", "message": "settings registry matches twilight.json and the HDL-03 contracts (strict)" },
    { "check": "localization-a11y", "level": "ok", "message": "locale parity, direction inference, tabindex, literals, ARIA, focus, letter spacing, mirroring, and toolbar order contracts hold" },
    { "check": "bundle-budget-contract", "level": "ok", "message": "demo-media and dependency-policy gates hold (hard cap is the dedicated bundle-budget CI job, green since T010 C1+C5 on 2026-08-10)" }
  ]
}
```

## `npx webpack --mode production`

Exit: `0`

```text
[baseline-browser-mapping] The data in this module is over two months old.
Browserslist: browsers data (caniuse-lite) is 14 months old.
warn - As of Tailwind CSS v3.3, the @tailwindcss/line-clamp plugin is now included by default.
assets by path *.js 323 KiB
assets by path images/ 16.6 KiB
  assets by path images/*.png 446 bytes
  assets by path images/payment_icons/*.svg 7.91 KiB
  assets by path images/*.svg 4.06 KiB
  asset images/placeholder.webp 4.21 KiB [copied]
asset app.css 633 KiB [minimized] [big] (name: app)
WARNING in asset size limit: app.css (633 KiB)
WARNING in entrypoint size limit: app (760 KiB)
WARNING in webpack performance recommendations
webpack 5.103.0 compiled with 3 warnings in 16775 ms
```

The inherited browser-database/plugin and three webpack size warnings are retained verbatim in meaning; no dependency update was permitted in HDL-05.

## `node scripts/check-theme.mjs --build --max-errors=0`

Exit: `0`

```text
[duplicate-selectors]
    ok   no selector is split across component files
[hardcoded-arabic]
    ok   no hardcoded Arabic outside src/locales
[dead-classes]
    ok   every theme class in SCSS is rendered somewhere
[css-variables]
    ok   every referenced custom property is defined
[theme-settings]
    ok   every setting read by a template is declared in twilight.json
[settings-registry]
    ok   settings registry matches twilight.json and the HDL-03 contracts (strict)
[localization-a11y]
    ok   locale parity, direction inference, tabindex, literals, ARIA, focus, letter spacing, mirroring, and toolbar order contracts hold
[bundle-budget-contract]
    ok   demo-media and dependency-policy gates hold (hard cap is the dedicated bundle-budget CI job, green since T010 C1+C5 on 2026-08-10)
[build-sync]
    ok   public/ matches a fresh production build
0 error(s), 0 warning(s)
```

## `node scripts/check-bundle-budget.mjs`

Exit: `0`

```text
[budget]
   info  internal target exceeded (info only): raw total 997743 B > target 850000 B
   info  gzip-9 total 196388 B across 28 file(s) — informational, never a gate
[media]
   info  no fonts, video, demo/sample names, or unregistered oversized media (5 registered row(s))
[dependencies]
   info  all 32 package.json dependency name(s) are recorded in manifest.dependencies
0 error(s)
```

## `git diff --check`

Exit: `0`; stdout/stderr were empty.

## Honest boundary

These are automated/source/build gates only. Live Salla rendering, network 200 responses for the new WebP, runtime component styles under the reduced Safelist, English/LTR, and browser accessibility remain `NOT VERIFIED` until T012.
