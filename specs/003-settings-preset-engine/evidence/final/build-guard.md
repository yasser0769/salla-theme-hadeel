# T046 — Production build and theme guard

Captured 2026-08-09 after Salla Preview was stopped.

`npx webpack --mode production` completed successfully. It reported only the inherited Browserslist/Tailwind and webpack size-budget warnings; HDL-03 added no CSS/JS asset, entry, chunk, dependency, or byte.

`node scripts/check-theme.mjs --build --json` returned exit 0 with `errors: 0` and `warnings: 0`. All seven checks were `ok`:

1. duplicate selectors
2. hardcoded Arabic
3. dead classes
4. CSS variables
5. declared theme settings
6. strict settings registry
7. production build sync

Result: **PASS**. The committed `public/` output matches a fresh production build.
