# T007 — The gate is real (expected-red proof)

> **HISTORICAL — evaluated under superseded raw-byte compliance model.** Raw `public/`
> remains telemetry; current Salla publishing compliance uses the compressed package checker.

All output below is literal, captured in one shell on the implementation branch.

```console
date: 2026-08-09 17:36:53 +0300
HEAD: eb40134dcda5c147ff03a048ad05b3e11ba8a15b

$ node scripts/check-bundle-budget.mjs

[budget]
  FAILED hard cap breached: public/ raw total 1172827 B > hard cap 1000000 B, overage 172827 B (gzip 227413 B is informational and cannot satisfy this gate)
   info  internal target exceeded (info only): raw total 1172827 B > target 850000 B
   info  gzip-9 total 227413 B across 28 file(s) — informational, never a gate

[media]
   info  no fonts, video, demo/sample names, or unregistered oversized media (5 registered row(s))

[dependencies]
   info  all 32 package.json dependency name(s) are recorded in manifest.dependencies

1 error(s)
exit=1

$ node scripts/check-bundle-budget.mjs --budget; (dedicated CI signal)

[budget]
  FAILED hard cap breached: public/ raw total 1172827 B > hard cap 1000000 B, overage 172827 B (gzip 227413 B is informational and cannot satisfy this gate)
   info  internal target exceeded (info only): raw total 1172827 B > target 850000 B
   info  gzip-9 total 227413 B across 28 file(s) — informational, never a gate

1 error(s)
exit=1

$ node scripts/check-bundle-budget.mjs --demo-media

[media]
   info  no fonts, video, demo/sample names, or unregistered oversized media (5 registered row(s))

0 error(s)
exit=0

$ node scripts/check-bundle-budget.mjs --dependency-policy

[dependencies]
   info  all 32 package.json dependency name(s) are recorded in manifest.dependencies

0 error(s)
exit=0

$ node scripts/check-bundle-budget.mjs --json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[\"ok\"], d[\"errors\"], d[\"totals\"])"
exit=1
valid JSON; ok=False errors=1 totals={'files': 28, 'rawBytes': 1172827, 'gzip9Bytes': 227413}

$ grep -n "continue-on-error\|if:" .github/workflows/verify-production-bundle.yml
68:  # readable on its own. None of them may be weakened: no continue-on-error,

$ node --test tests/performance-bundle-ci.test.mjs (summary)
ℹ tests 18
ℹ pass 18
ℹ fail 0
```

## No-bypass verification (FR-007, FR-011)

- **gzip cannot substitute**: proven, not asserted — the `gzip can never substitute` fixture test builds a 1,200,000 B raw / <10,000 B gzip-9 tree and the checker still fails it. The real-tree message itself states the gzip number is informational.
- **No workflow soft-fail**: `grep 'continue-on-error\|if:' .github/workflows/verify-production-bundle.yml` matches only the comment forbidding exactly that. Four independent jobs; no label/branch skip exists.
- **No exception/allowlist path**: the hard-cap comparison in `checkBudget` has no exception input; `updateManifest` refuses ceilings above the cap; the allowlist covers dependency *names* only and cannot waive bytes.
- **Negative tests** (fixtures, all passing — 18/18 above): over-cap total, per-file ceiling overage with old/new/overage, gzip-smaller-raw-larger, sha256 drift, unexpected/missing files, demo/sample naming, video containers, shipped fonts, unregistered oversized media, unlisted dependency, `--update` determinism, refusal to write a ceiling above the cap, and machine-readable `--json` on failure.
- **The red is transient and intentional** (workflow comment, plan.md): the `bundle-budget` job fails from the moment it lands because 1,172,827 B > 1,000,000 B. `.github` CI would be red at T005 — this is documented here as the expected transient state; HDL-05 cannot close until later remediation (T010, after the T009 owner decision) makes it green, per Spec §13.
