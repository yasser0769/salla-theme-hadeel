# HDL-05 Corrective Repair Evidence — 2026-08-10

- **Captured:** `2026-08-10T14:34:28+03:00`
- **Branch / HEAD:** `codex/hdl-05-performance-bundle-ci` /
  `eb40134dcda5c147ff03a048ad05b3e11ba8a15b`
- **Authority:** owner-approved correction after direct clarification from Salla Support:
  theme size is calculated after compression, excluding `node_modules`.

## Root cause and previous measurements

HDL-05 modeled Salla compliance as `sum(rawBytes(public/**)) <= 1,000,000`. That
substituted build telemetry for Salla's compressed distributable-package measurement and
drove the high-risk C1 Safelist reduction.

The pre-correction tree measured 28 files / **997,743 B raw** / **196,388 B gzip-9**.
The old result was called PASS with only 2,257 B raw margin. This verdict is
`HISTORICAL — SUPERSEDED`; the byte measurements remain telemetry.

Owner-supplied audit context also measured approximately 198,917 B for a production-
assets ZIP and 481,812 B for a conservative theme-package ZIP before this repair. Those
were audit estimates, not outputs of the new deterministic checker.

## C1 restoration

- T010 contained separable C1 and C5 changes; no broad revert was used.
- `tailwind.config.js` was restored byte-for-byte from
  `evidence/t010-c1-pre-change-tailwind.config.js`.
- Both files SHA-256:
  `e73bab577a967f3d6a4969e30a2ac8461145b139e76d5cfeced2848b2155a436`.
- C1-owned `src/config/salla-safelist.txt` was removed.
- Installed full Safelist remains byte-identical to
  `evidence/t009-spike/safelist-full-baseline.txt`.
- Corrected normalized CSS: **6,838 rules**, byte-identical to
  `evidence/t010-c1-before.css` (SHA-256
  `05dd95507248ae956dea65c50c8e71028700632771384143654f526f55b0a081`).
- Production `app.css`: **802,202 B**, SHA-256
  `8da283e0f9aa4c7b16459f1ae193bb660596bf4e9cced913fcb81be49fd14b64`.
- Regression tests pin representative Cart, Loyalty, notification, and order selectors.

## T005F retained

The permanent no-local-font architecture remains: zero WOFF/WOFF2, zero project
`@font-face`, Salla `theme.font` plus system fallback, and the existing
`use_theme_font` compatibility no-op. The package-model correction does not reverse it.

## C5 decision — KEEP

C5 is retained independently of the old raw cap. The placeholder WebP is decoded-pixel
identical to the prior PNG; the approved SVGs preserve appearance and accessible names;
CSS is unchanged; source/evidence/public hashes are pinned. The current placeholder
source and output both SHA-256 to
`401e04acb08ab1309aacd5977e8b2e5065f23e91966d84f3a2817b6bc0a96bd4`.

## Corrected package contract and measurements

`src/config/bundle-budget.json` is schema v2. It owns the compressed hard cap and the
internal target percentage. `scripts/check-bundle-budget.mjs` derives the target,
constructs a deterministic ZIP from the explicit Twilight-theme allowlist, and exposes a
separate broad repository diagnostic.

Measured after the exact Safelist restoration and production build:

| Measurement | Result |
|---|---:|
| Raw `public/` | 1,151,263 B |
| gzip-9 `public/` | 214,496 B |
| Compressed production-assets ZIP | 217,576 B |
| Raw `sallaPackageEstimate` | 2,071,195 B |
| Compressed `sallaPackageEstimate` | 475,903 B |
| Package files | 156 |
| Hard-cap usage | 47.59% |
| Remaining to 95% target | 474,097 B |
| Remaining to Salla hard cap | 524,097 B |
| Verdict | PASS |

The broad `repositoryArchiveDiagnostic` is intentionally much larger and is never
reported as Salla theme size. The exact Salla server-side manifest remains locally
unprovable; the 156-file allowlist is therefore explicitly named an estimate.

## Implementation and CI semantics

- `package-budget` gates compressed package size and manifest drift.
- Raw/gzip/public-ZIP/per-file values are INFO/WARN telemetry.
- `demo-media`, `dependency-policy`, and `bundle-tests` remain independent jobs.
- Tests cover deterministic output, package exclusions, manifest contamination/drift,
  PASS/WARN/FAIL boundaries, raw-over-1MB PASS, compressed-over-cap FAIL, C1 restoration,
  C5, fonts, media, dependencies, and full build-tree sync.

## Downstream cleanup and genuine remaining risks

C1-only supporting-route, preset, Loyalty, and rollback obligations are marked
`SUPERSEDED` in `follow-up-register.md`. Genuine independent risks remain: inherited
product-route overflow, integrated C5 media states when routes become available, and
throttled Lighthouse/Core Web Vitals at HDL-29. The exact server package manifest should
replace the estimate if Salla exposes it later.

## Verification status

### Command matrix

| Command | Result |
|---|---|
| `npx webpack --mode production` | PASS; three inherited Webpack/browser-data warnings |
| `node --test tests/settings-preset-engine.test.mjs` | PASS — 73/73 |
| `node --test tests/localization-rtl-accessibility.test.mjs` | PASS — 24/24 |
| `node --test tests/performance-bundle-ci.test.mjs` | PASS — 39/39 |
| `node scripts/check-theme.mjs --build --max-errors=0` | PASS — 0 errors / 0 warnings / 28-file build sync |
| `node scripts/check-bundle-budget.mjs --package-budget --report` | PASS — 475,903 / 1,000,000 B |
| `node scripts/check-bundle-budget.mjs --demo-media` | PASS — 0 errors |
| `node scripts/check-bundle-budget.mjs --dependency-policy` | PASS — 32 dependencies allowlisted |
| two consecutive `node scripts/check-bundle-budget.mjs --update` runs | PASS — unchanged SHA-256 `4977760e972a4430a6e4d2c46b75fbb0ecef7f3edce32ae1984d6850ec9a9928` |
| `git diff --check` | PASS |
| local font / `@font-face` scan | PASS — no matches |

The repository-wide result and classification are in
`evidence/corrective-stale-rule-scan.md`: stale raw-1MB active rules 0; stale 85% active
targets 0. Package tests prove `specs/`, `tests/`, `node_modules/`, logs, and prior ZIPs
cannot contaminate `sallaPackageEstimate`.

### Fresh rendered evidence

The Salla CLI created draft `1750125155` from this exact uncommitted working tree after
the CLI's commit prompt was explicitly declined. At `2026-08-10T11:41:43.524Z`, the
rendered home DOM reported `lang=ar`, `dir=rtl`, body class `salla-draft-1750125155`,
15 product cards, the expected six theme assets from `http://localhost:8000`, and no
horizontal overflow (`scrollWidth = clientWidth = 1170`). A viewport screenshot was
visually inspected. The preview was stopped and `public/` was rebuilt in production
afterward. English/LTR and product/collection reruns for this exact corrective draft are
**NOT VERIFIED**; prior T012 rows remain useful runtime evidence but are not misrepresented
as post-repair captures.

### Affected source-of-truth paths

- Policy/guidance: Constitution, root `AGENTS.md`, build documentation, and `MANIFEST.md`.
- Enforcement: bundle config/checker, theme guard wording, tests, CI, restored Tailwind
  input, and rebuilt `public/`.
- Feature truth: HDL-05 Spec/Input/Plan/Tasks/Design/follow-up/evidence plus the combined
  Spec review.
- Project state: ROADMAP, machine-readable Spec index, and append-only night-run state.
- Historical classification: HDL-01 bundle artifacts and the two HDL-03 active release-rule
  references. HDL-23/24/25/26/27/29 files contained no active C1-only clause, so they were
  not edited; the follow-up register is the minimal cleanup point.
- Reusable Spec Kit templates contained no raw-1MB rule and required no edit.

### Independent corrective review

The read-only reviewer first returned two active-Spec blockers: obsolete candidate/C1
language and a 95%-as-hard-maximum clause. After focused corrections it found one further
stale Arabic-only/pending-Safelist edge-case clause. The clause and synchronized combined
Spec were corrected without changing historical evidence. Final focused re-review:

`STATUS: PASS`

`BLOCKERS: 0`
