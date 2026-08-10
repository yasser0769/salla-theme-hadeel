# HDL-06 Validation Quickstart

## 1. Preconditions

- Work only on `codex/hdl-06-motion-system`.
- Do not edit `public/` by hand.
- Do not change `package.json` or `pnpm-lock.yaml` in the feature implementation commit.
- Preserve `.vscode/settings.json`, `AGENTS.md`, and unrelated untracked files.

## 2. Baseline snapshot

```bash
node scripts/check-theme.mjs --json
node scripts/check-bundle-budget.mjs --budget
node scripts/css-snapshot.mjs /tmp/hdl06-before-css.txt
```

Recorded baseline: package estimate 475,903 B compressed; `app.css` 802,202 B raw; `app.js` 129,221 B raw; aggregate 931,423 B.

## 3. Focused automated gates

```bash
node --test tests/motion-system.test.mjs
node --test tests/settings-preset-engine.test.mjs
node --test tests/localization-rtl-accessibility.test.mjs
node --test tests/performance-bundle-ci.test.mjs
node scripts/check-motion-system.mjs --strict
node scripts/check-theme.mjs --json
```

Required results: zero test failures, zero guard errors/warnings, no raw merchant motion class, no periodic CTA timer, no runtime Anime import/global, and exact settings-registry parity.

## 4. Production build and size

```bash
npx webpack --mode production
node scripts/check-theme.mjs --build --max-errors=0
node scripts/check-bundle-budget.mjs --budget
node scripts/css-snapshot.mjs /tmp/hdl06-after-css.txt
diff -u /tmp/hdl06-before-css.txt /tmp/hdl06-after-css.txt
git diff --check
```

Every CSS delta must map to the motion contract. Aggregate `app.css + app.js` must be ≤931,423 B raw, compressed package below 950,000 B, with zero new entry/chunk/request/font/media/dependency.

## 5. Preview safety gate

Do not open a browser from the primary working tree. Create an isolated preview worktree/branch only after source validation. Before browser access, report the exact temporary branch and SHA and wait for Yasser to confirm it in Partners Portal. Run Salla CLI with Chrome named explicitly. If the rendered draft is stale, record `SALLA PREVIEW SYNC FAILURE`.

## 6. Rendered evidence matrix

Use the same store, routes, content, and state:

1. Arabic Mobile RTL — 390×844.
2. English Mobile LTR — 390×844.
3. Arabic Desktop RTL — 1366×768.
4. English Desktop LTR — 1366×768.

Capture Home, Product, Collection, and Cart/overlay. For every point record:

- draft body class, local asset provenance, commit SHA, `html.lang`, and `html.dir`;
- resolved motion level and computed duration/distance tokens;
- price, availability, options, CTA, and results visible at `0ms`;
- CTA feedback begins within 100ms and has no recurring replay;
- reveal happens once only on an eligible noncritical target;
- logical motion/CTA start mirrors; media and nondirectional effects do not;
- keyboard focus order, visible focus, Drawer/Modal focus return, and scroll lock;
- `scrollWidth <= innerWidth` and motion-attributed CLS `0.000`;
- resource URL set and theme-local bytes.

## 7. Reduced-motion scenarios

- Emulate `prefers-reduced-motion: reduce` while Rich is selected: no reveal, smooth scroll, spatial motion, or CTA attention; state remains understandable.
- Change the emulation during an active theme-owned animation: it cancels to final state and no new nonessential motion starts.
- On mobile with `motion_reduce_mobile=true`, Rich uses Balanced computed aliases.
- Disable JavaScript or block the controller: critical content and purchase actions remain visible and usable.

## 8. Rollback drill

Replay saved settings containing the two new IDs and both legacy IDs against the pre-feature path. A rollback must ignore new IDs safely, preserve legacy values, emit no unknown class, and restore a production-synced `public/` build.

## Acceptance

HDL-06 can close only after independent review returns `STATUS: PASS`, `BLOCKERS: 0`, all automated gates pass, post-change Salla evidence exists, and the final result is accepted by the owner.
