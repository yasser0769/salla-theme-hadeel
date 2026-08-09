# T060 — Repository scope and hygiene

Captured 2026-08-09 after the bilingual matrix, exact final-source smoke, and
production restoration.

## Checks

- `git diff --check`: exit 0, no output.
- `package.json`: no diff.
- `pnpm-lock.yaml`: no diff.
- `webpack.config.js`: no diff.
- `public/`: no diff after the final production rebuild.
- `src/assets/`: no diff.
- Temporary preview worktree: clean at `058153baeca2351c023674c07ca7aac941505ff5` after production rebuild; local HEAD, upstream, and remote match.

## Scoped HDL-03 implementation

Tracked feature changes are limited to the runtime resolver/guard/config surface and lifecycle records: `twilight.json`, `src/views/layouts/master.twig`, `scripts/check-theme.mjs`, `ROADMAP.md`, `docs/spec-kit/spec-index.json`, and `.specify/.runtime/hadeel-night-run.md`. New feature files are confined to `specs/003-settings-preset-engine/`, `src/config/settings-registry.json`, `scripts/check-settings-registry.mjs`, and the HDL-03 tests/fixtures/helpers.

`.vscode/settings.json` was already modified by the user before HDL-03 began. It remains excluded from every edit, build, stage, preview commit, and scoped feature diff. The broad untracked SpecKit/goal-package files predate this feature and were preserved without cleanup or staging.

Result: **PASS — scoped diff is clean; protected and unrelated files were not changed by HDL-03**.
