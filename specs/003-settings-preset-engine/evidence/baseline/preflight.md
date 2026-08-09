# T004 — Preflight result (HDL-03)

**Captured at**: 2026-08-08T19:56–20:00 UTC
**Commit**: `5deac563f21210529124c2c0a9101ab5befde4e1` (branch `codex/hdl-03-settings-preset-engine`)
**Node**: v26.5.0 · **Salla CLI**: 3.2.45

## Guard

Command:

```bash
node scripts/check-theme.mjs --build --json
```

Exit code `0`. Exact output:

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
    { "check": "build-sync", "level": "ok", "message": "public/ matches a fresh production build" }
  ]
}
```

Result: **no pre-existing guard errors** (0 errors, 0 warnings). Raw output SHA-256:
`2ab6f5c2d6b57db523a77b509e873c59e2b9dc484c2ad04cef25fe5f6afbc763` (see `manifest.json`).

## Dependency / protected-file state

Command:

```bash
git status --porcelain -- package.json pnpm-lock.yaml twilight.json src public .vscode/settings.json
git diff --stat HEAD -- package.json pnpm-lock.yaml
```

Observed:

- `package.json`: clean (no output, no diff).
- `pnpm-lock.yaml`: clean (no output, no diff).
- `twilight.json`, `src/`, `public/`: clean.
- `.vscode/settings.json`: shows ` M` — this modification **predates this session**
  (present in the initial `git status --porcelain` before any HDL-03 action). It was
  not created or touched by T001–T009 work and is left untouched per instructions.

## Salla CLI availability

```bash
which salla   # /usr/local/bin/salla
salla --version   # 3.2.45
salla theme list
```

`theme list` output (trimmed): one theme — ID `224400990`, name `Hadeel`, status `development`.

## Decision

Preflight PASS: guard clean, production baseline committed and in sync with `src/`,
no dependency changes. Proceed to Phase 2 migration/editor Spike (T005–T009).
