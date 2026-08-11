# HDL-07 Bundle Baseline — T007 (pre-change)

**Captured at**: 2026-08-10T22:01:50Z (UTC), before any Phase-1 source edit.
**Branch/SHA**: `codex/hdl-07-header-layouts` @ `e261352d8e3796f0e30ca3663de121368764d901`

## Production bundle sizes

```bash
wc -c public/app.css public/app.js
```

| File | Raw bytes | HDL-07 cap (plan.md) | Headroom |
|---|---:|---:|---:|
| `public/app.css` | 799,430 | ≤ 811,718 (+12,288) | 12,288 |
| `public/app.js` | 116,474 | ≤ 120,570 (+4,096) | 4,096 |

No other bundle may grow for HDL-07 without architecture review. New
dependencies/entries/chunks/media/fonts: **zero** allowed.

## Compressed package gate

```bash
node scripts/check-bundle-budget.mjs --budget
```

- Compressed theme package: 478,773 / 1,000,000 B — PASS (47.88%).
- Internal target: 950,000 B; remaining 471,227 B.
- Pre-existing telemetry WARN kept visible (not hidden, not expanded):
  `public/checkout.js` raw ratchet +3 B over its 11,727 B ceiling.

## Normalized CSS snapshot

```bash
node scripts/css-snapshot.mjs /tmp/hdl07-before.css.txt
# -> 6772 rules
```

The pre-change normalized snapshot lives at `/tmp/hdl07-before.css.txt`
(6772 rules). The post-change snapshot (T041) is diffed against it with
`diff -u`; every non-empty delta line must be justified in
`evidence/css-delta.md`.

## Guard baseline

`node scripts/check-theme.mjs --json` → exit 0, `errors: 0, warnings: 0`.
Phase-1 output must keep this at 0/0.
