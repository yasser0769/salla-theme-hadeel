# Quickstart: Reproducing and Validating the HDL-01 Baseline Report

**Feature**: `HDL-01` · **Date**: 2026-08-08 · **Baseline commit**: `66b7b69e`  
**Deliverable**: `specs/001-baseline-evidence/baseline-report.md`  
**Plan**: [plan.md](plan.md) · **Research**: [research.md](research.md) · **Data model**: [data-model.md](data-model.md)

This is a **validation and reproduction guide**, not an implementation guide. It answers two
questions with runnable commands:

1. **Reproduce** — does re-running the commands at `66b7b69e` still yield the numbers the report
   states? (`spec.md` §11: every number must be reproducible by any agent.)
2. **Validate** — does the report satisfy every rule in [data-model.md](data-model.md), and did
   HDL-01 really change nothing outside its allowed files?

> **Two commands are dangerous to this feature and are replaced below.** A bare
> `npx webpack --mode production` **wipes and rewrites `public/`** (`webpack.config.js:25-29`,
> `output.clean: true`), and `salla theme preview` leaves `public/` as a **development build**
> (`docs/salla-twilight-notes.md` §6). Both would dirty the directory HDL-01 promises not to
> touch. Use the safe forms in §2.3 and skip the preview entirely (research.md R-003, R-006).

---

## 1. Prerequisites

```bash
cd /Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel

# 1.1 You must be on the exact baseline commit — every number below is pinned to it.
git rev-parse HEAD
# expect: 66b7b69e3117235c8a614a0502de21ca928e227e

# 1.2 The upstream remote must exist for the relationship-baseline checks.
git remote -v | grep upstream
# expect: upstream  https://github.com/SallaApp/theme-raed.git (fetch)
```

| Requirement | Baseline value | Notes |
|---|---|---|
| Node | `v26.5.0` | pnpm only — `npm install` is blocked by a `preinstall` guard (`AGENTS.md` rule 5) |
| pnpm | `10.33.0` | Do **not** run `pnpm install` — it may touch `pnpm-lock.yaml` |
| `node_modules/` | present | Required by webpack and the guard; if absent, restore it in a separate, non-HDL-01 change |
| Working tree | clean under `src/`, `public/`, `twilight.json` | Verify with §5 **before** you start |

If `git rev-parse HEAD` differs from the baseline, the report is **stale** and must be
re-measured with a new header SHA — never patched in place (data-model.md §Report lifecycle).

---

## 2. Reproduce every number

### 2.1 Static guard — FR-003

```bash
node scripts/check-theme.mjs --json
```

**Expect**: `0` errors, `0` warnings; all five static checks `ok`
(`duplicate-selectors`, `hardcoded-arabic`, `dead-classes`, `css-variables`, `theme-settings`).

> **Discrepancy to record, not fix**: `AGENTS.md` says the guard "currently reports pre-existing
> errors". It does not, at this commit. Execution is the truth (FR-003, research.md R-008). The
> practical consequence: the error budget here is **zero**, so any error you see is new.

### 2.2 Build-sync guard — FR-003

```bash
node scripts/check-theme.mjs --build --json
```

**Expect**: `0` errors, `0` warnings, and `build-sync` = `public/ matches a fresh production build`.

**Safe by design**: this builds into `mkdtempSync(tmpdir(), 'hadeel-build-')` via `--output-path`
(`scripts/check-theme.mjs:319-321`) and only hashes the result against `public/`. It never writes
to `public/`.

### 2.3 Production build stats — FR-003 (safe form)

```bash
BUILD_TMP="$(mktemp -d)"
npx webpack --mode production --output-path "$BUILD_TMP"
rm -rf "$BUILD_TMP"
```

**Expect**: success; `app.css` ≈ 784 KiB, `app.js` ≈ 125 KiB, `app` entrypoint ≈ 909 KiB;
**3** webpack performance warnings. Baseline run at this SHA completed in **22.437s** (timing
varies by machine — the report cites the recorded run, and the byte figures are what must match).

**Never** run it without `--output-path` during HDL-01.

### 2.4 Bundle measurements — FR-004

```bash
# Comparable-to-Salla number: raw byte total of public/
find public -type f -exec stat -f "%z" {} \; | awk '{s+=$1} END {print s}'
# expect: 1557969

find public -type f | wc -l          # expect: 33
du -sk public/                       # expect: 1604 (block allocation, NOT the payload)

# Largest assets
find public -type f -exec stat -f "%z %N" {} \; | sort -rn | head -8
# expect: 802732 public/app.css
#         128388 public/app.js
#          79160 public/images/fonts/thmanyah/thmanyahsans-Bold.woff2
#          79064 ... Medium.woff2   77776 ... Regular.woff2
#          77112 ... Black.woff2    72380 ... Light.woff2
#          56127 public/product.js

# Font block total
find public/images/fonts -type f -exec stat -f "%z" {} \; | awk '{s+=$1} END {print s}'
# expect: 385492   (24.7% of public/)
```

Ceiling comparison (`docs/building-a-salla-theme.md:27`, public themes 1 MB max):
1,557,969 B = **148.6%** of 1 MiB, or **155.8%** of 1 MB(10⁶). Overage under either reading;
the exact margin is `needs-salla-confirmation` (research.md R-004).

> On Linux, replace `stat -f "%z"` with `stat -c "%s"`. The byte totals are identical; only the
> `stat` syntax is BSD/GNU specific.

### 2.5 Source-to-output mapping — FR-002

```bash
sed -n '11,24p' webpack.config.js                        # the 12 entries — the mapping authority
find public -maxdepth 1 -type f \( -name "*.js" -o -name "*.css" \) \
  -exec stat -f "%z %N" {} \; | sort -rn                 # 13 outputs with sizes
```

**Expect**: 12 entries → 13 outputs (`app` emits both `app.css` and `app.js`).
Twig templates and `src/locales/*.json` produce **no** `public/` output — Salla renders Twig
server-side and merges locales at publish time. The report must state that reason, not leave a
blank cell (data-model.md R2.1).

### 2.6 Inventory counts and exhaustive FR-001 source keys

```bash
find src/views/pages -name "*.twig" | wc -l        # 21
find src/views/components -name "*.twig" | wc -l   # 22
find src/assets/js -name "*.js" | wc -l            # 24
find src/assets/styles -name "*.scss" | wc -l      # 42
grep -rhoE '<salla-[a-z0-9-]+' src/ | sort -u | wc -l   # 58 distinct salla-* tags

node -e "const j=require('./twilight.json');console.log('settings',(j.settings||[]).length,'components',(j.components||[]).length)"
# expect: settings 45 components 7      (45 = 8 static + 37 interactive)

node -e "const c=o=>Object.values(o).reduce((n,v)=>n+(typeof v==='object'&&v?c(v):1),0);\
console.log('ar',c(require('./src/locales/ar.json')),'en',c(require('./src/locales/en.json')))"
# expect: ar 86 en 86    (parity, zero missing on either side)

# Canonical keys for the exhaustive FR-001 register (87 total)
find src/views/pages -type f -name "*.twig" | sort | sed 's#^#page:#'                    # 21
find src/views/components -type f -name "*.twig" | sort | sed 's#^#component-template:#' # 22
node -e "const j=require('./twilight.json');console.log(j.components.map(x=>'custom-component:'+x.path).sort().join('\\n'))" # 7
node -e "const j=require('./twilight.json');console.log(j.settings.filter(x=>x.type!=='static').map(x=>'setting:'+x.id).sort().join('\\n'))" # 37
node -e "const j=require('./twilight.json');console.log(j.settings.filter(x=>x.type==='static').length)" # 8 excluded structural rows
```

The report MUST contain each canonical key exactly once, with non-empty state, source location,
and responsibility owner. `type != "static"` is the objective important-setting rule; the eight
static title/separator records are counted and their exclusion is explained.

### 2.7 Branch inventory

```bash
git branch -r --format='%(refname:short) %(objectname:short)'
git rev-list --left-right --count origin/master...HEAD      # expect: 0    38
git rev-list --left-right --count upstream/master...HEAD     # expect: 3333 97

for b in $(git branch -r --format='%(refname:short)'); do
  printf '%-70s ' "$b"
  git merge-base --is-ancestor "$b" HEAD 2>/dev/null && echo "contained-in-HEAD" || echo "pending/diverged"
done
```

**Expect**: 10 remote refs total. The symbolic `origin`/`origin-HEAD` alias resolves to
`origin/master` and is **not separate work**. `origin/codex/product-buy-button-options` at `66b7b69e` (**identical to HEAD** — same
commit, not separate work); `origin/codex/figma-product-collection` `14fbe512` (**contained**);
5 `dependabot/*` branches **pending**; `upstream/master` `3bd09f11` **diverged, unrelated**.
Work-state totals must reconcile with `spec.md` §11: 2 merged/identical, 5 pending, 1 diverged;
the comparator and its symbolic alias are reference rows.

### 2.8 Theme Raed relationship baseline — the five items

```bash
git rev-list --max-parents=0 HEAD
# 8bf2ce6fab2d8939f344e620203bb6638b80b161

git cat-file -p 8bf2ce6fab2d8939f344e620203bb6638b80b161 | head -1
# tree 9d9056896ba11ead6f6a108857c1e6f7aca4bad9

git cat-file -p dc902f62775f25bf98f67b76da93eb098b1e207d | head -1
# tree 9d9056896ba11ead6f6a108857c1e6f7aca4bad9      <- identical => exact snapshot base

git merge-base upstream/master HEAD || echo "no merge-base (exit $?) — unrelated histories"
```

Both facts are reported **together**: tree equality proves the snapshot origin; the absent
merge-base explains why `git merge-base` finds nothing. Reporting either alone misleads
(research.md R-007).

Similarity **signals** for item 3 (signals only — no verdicts, no feature-by-feature analysis):

```bash
grep -n "theme-raed" src/views/layouts/master.twig      # line 97: body class `theme-raed`
rg -c 'raed/preview-images' twilight.json                       # 6 inherited preview assets
grep -ci "raed" README.md                                # 14 references
```

> **STOP condition.** These commands establish *signals*. Do **not** extend them into a
> file-by-file or feature-by-feature diff against `upstream/master`. `DECISION HDL-01` forbids it
> in HDL-01 and assigns the full distinctness audit to the blocking gate `HDL-29-FR-011`. If you
> find yourself wanting the diff, that is the signal to log — not the analysis to run.

---

## 3. Salla preview — deliberately not run

**Not applicable to HDL-01** (`spec.md` §10). No `src/` or `public/` change exists to verify, and
a preview session would leave `public/` as a development build with an eval banner that CI rejects
(`docs/salla-twilight-notes.md` §6), dirtying the very directory this feature must not touch.

Record instead: Salla CLI `3.2.45` authenticated; theme `224400990` `Hadeel`, status
`development`; preview capability **available but not invoked**.

```bash
salla theme list        # read-only; optional, only to refresh the availability status
```

The full preview requirement returns the moment any source file changes — and such a change
belongs to its owning spec, not to HDL-01.

---

## 4. Validate the report

Run these against `specs/001-baseline-evidence/baseline-report.md` once it exists. Rule IDs refer
to [data-model.md](data-model.md).

```bash
R=specs/001-baseline-evidence/baseline-report.md
```

| # | Check | Command | Pass |
|---|---|---|---|
| V1 | Report exists, and exactly one | `ls specs/001-baseline-evidence/*.md` | Only `spec.md`, `spec-input.md`, `design.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `baseline-report.md` (+ `tasks.md` later). **One** report file (I-2) |
| V2 | Header pins the commit | `grep -c '66b7b69e3117235c8a614a0502de21ca928e227e' "$R"` | ≥ 1, full SHA-40 (R0) |
| V3 | 29/29 roadmap rows | `grep -oE 'HDL-(0[1-9]\|1[0-9]\|2[0-9])' "$R" \| sort -u \| wc -l` | `29` (R1.1) |
| V4 | 7/7 FR sections | `grep -oE 'HDL-01-FR-00[1-7]' "$R" \| sort -u \| wc -l` | `7` (R10.1) |
| V5 | One classification per row | Read the FR-001 table | No cell contains `+`; no compound values (R1.2) |
| V6 | Divergences recorded | `grep -c 'spec-index' "$R"` | ≥ 1; the 18 compound index rows are flagged, `spec-index.json` unmodified (R1.6) |
| V7 | Relationship baseline = 5 items | Read the relationship section | Exactly 5 numbered items (R8.1) |
| V8 | Prohibition stated | `grep -c 'feature-by-feature\|ميزة بميزة' "$R"` | ≥ 1, and it is a **prohibition**, not a comparison (R8.2) |
| V9 | HDL-29 referral present | `grep -c 'HDL-29-FR-011' "$R"` | ≥ 1 (R6.2) |
| V10 | Zero feature-by-feature comparisons | Manual read of the relationship section | No per-feature Raed-vs-Hadeel table anywhere (R8.3, I-7) |
| V11 | Risks: all six categories, each with owner + blocking flag | Read the FR-006 table | 6 categories present; no empty `owning_spec`; no blank blocking flag (R6.1, R6.4) |
| V12 | Every number has a command | Exhaustively audit every numeric claim | Command + SHA beside every figure (I-1); sampling is insufficient |
| V13 | Bundle: one comparable measure | Read the FR-004 section | Exactly one measure flagged comparable; entrypoint labelled build-tool signal (R4.1, R4.2) |
| V14 | Overage stated under both bases | `grep -c '148.6' "$R" && grep -c '155.8' "$R"` | Each command returns ≥ 1 (R4.3) |
| V15 | Evidence policy has the invisible-change row | `grep -c 'لا يلزم دليل بصري\|no visual evidence' "$R"` | ≥ 1 (R5.1) |
| V16 | Evidence policy has the preview-unavailable row | `grep -ci 'معاينة سلة غير متاحة\|preview unavailable' "$R"` | ≥ 1 (R5.2) |
| V17 | Branch states reconcile | Read the branch table | 2 merged/identical, 5 pending, 1 diverged (R7.4) |
| V18 | Open discrepancies fixed nowhere | Read the discrepancy table | Every row says not fixed here; named files unmodified (R9.1, R9.2) |
| V19 | Guard still green | `node scripts/check-theme.mjs --build --json` | `0` errors, `0` warnings (R3.1) |
| V20 | Zero source impact | §5 below | No entry outside the allowed set (I-3) |
| V21 | Exhaustive repository register | Generate the four canonical key sets from §2.6; extract every backticked `page:*`, `component-template:*`, `custom-component:*`, and `setting:*` key from the FR-001 register; sort both sets and run `diff -u` | Empty diff; exactly 87 unique rows = 21 + 22 + 7 + 37; no duplicate key; every row has non-empty state/source/responsibility; `static_count = 8` and exclusion reason present (R1A.1…R1A.4, I-9) |

Deterministic V21 exact-set and required-field check:

```bash
HDL01_INVENTORY_TMP=$(mktemp -d)
{
  find src/views/pages -type f -name "*.twig" | sort | sed 's#^#page:#'
  find src/views/components -type f -name "*.twig" | sort | sed 's#^#component-template:#'
  node -e "const j=require('./twilight.json');console.log(j.components.map(x=>'custom-component:'+x.path).sort().join('\\n'))"
  node -e "const j=require('./twilight.json');console.log(j.settings.filter(x=>x.type!=='static').map(x=>'setting:'+x.id).sort().join('\\n'))"
} | sort > "$HDL01_INVENTORY_TMP/expected.keys"

grep -oE '`(page|component-template|custom-component|setting):[^`]+`' "$R" \
  | tr -d '`' | sort > "$HDL01_INVENTORY_TMP/report.keys"
diff -u "$HDL01_INVENTORY_TMP/expected.keys" "$HDL01_INVENTORY_TMP/report.keys"
test "$(wc -l < "$HDL01_INVENTORY_TMP/report.keys" | tr -d ' ')" = 87
test "$(uniq -d "$HDL01_INVENTORY_TMP/report.keys" | wc -l | tr -d ' ')" = 0

# FR-001 inventory tables use columns:
# record_key | kind | source_location | current_state | responsibility_owner
awk -F'|' '
  /`(page|component-template|custom-component|setting):[^`]+`/ {
    rows++
    for (i=4; i<=6; i++) { v=$i; gsub(/^[[:space:]]+|[[:space:]]+$/, "", v); if (v=="" || v=="—") bad++ }
  }
  END { exit !(rows==87 && bad==0) }
' "$R"
grep -c 'static_count.*8' "$R"  # expect >= 1, beside the structural exclusion reason
```

---

## 5. Prove zero source impact — the decisive check

This is the check that makes HDL-01's central claim testable. Run it **before** starting and
**after** writing the report.

> **Read this first, or you will misread the result.** At `66b7b69e` the whole spec-kit bundle is
> **untracked** — `.specify/`, `.agents/`, `.claude/`, `specs/`, `ROADMAP.md`, `MANIFEST.md`,
> `README-AR.md`, `docs/spec-kit/` all show as `??`, and `.vscode/settings.json` shows as `M`.
> That is the **pre-existing** working-tree state recorded in the 16:48 +03 preflight
> (`.specify/.runtime/hadeel-night-run.md`), not something HDL-01 caused. So the test is **not**
> "`git status` is empty" — it is "**no tracked file is modified, and no untracked path appears
> that HDL-01 did not create**".

```bash
# 5.1 The decisive check: zero MODIFICATIONS to tracked source and config.
git status --porcelain -- src/ public/ package.json pnpm-lock.yaml twilight.json AGENTS.md \
  | grep -vE '^\?\?' 
# expect: NO OUTPUT AT ALL  (any M/A/D/R line here fails the feature)

# 5.2 Same, repo-wide, ignoring the pre-existing untracked spec-kit bundle.
git status --porcelain | grep -vE '^\?\? (\.specify/|\.agents/|\.claude/|specs/|ROADMAP\.md|MANIFEST\.md|README-AR\.md|docs/spec-kit/|hadeel-speckit-complete\.zip|scripts/speckit-)'
# expect: only   M .vscode/settings.json   (pre-existing, user-owned, untouched by HDL-01)

# 5.3 Inside the feature directory, only the allowed files may be new or changed.
ls specs/001-baseline-evidence/
# expect exactly: spec.md  spec-input.md  design.md  plan.md  research.md
#                 data-model.md  quickstart.md  baseline-report.md   (+ tasks.md later)

# 5.4 spec.md and design.md must be byte-identical to their pre-HDL-01 state.
#     They are untracked here, so compare against your own pre-run copies:
shasum specs/001-baseline-evidence/spec.md specs/001-baseline-evidence/design.md
# expect: identical to the values captured before implementation started

# 5.5 The runtime log must not be edited by this feature.
shasum .specify/.runtime/hadeel-night-run.md
# expect: unchanged from before implementation
```

**Expected bundle / network / source impact: 0 bytes, 0 requests, 0 tracked files modified.**

Any `M`/`A`/`D`/`R` line from 5.1, any unexpected path from 5.2, or a changed hash in 5.4/5.5
means the Definition of Done was violated. Rollback (plan.md §Rollback): restore those paths to
their `66b7b69e` state, re-run §2.2, and move the change to its owning spec — do not absorb it
into HDL-01.

> Because `specs/` is untracked as a whole, `git` cannot police edits to `spec.md`/`design.md`
> for you. Capture the 5.4 and 5.5 hashes **before** writing the report; that is the only
> mechanical guard against an accidental edit to an approved artifact.

---

## 6. Acceptance

| Gate | Condition |
|---|---|
| Reproduction | Every §2 command replayed at `66b7b69e` yields the reported value |
| Validation | V1–V21 all pass |
| Scope | §5 produces no unexpected output |
| Storefront verification | **Not applicable** — no customer-facing surface (`spec.md` §9, §10); replaced by V1–V21 |
| Owner acceptance | Yasser approves the final report (`spec.md` §10, final item) |

After acceptance, `ROADMAP.md` `HDL-01` moves to `done` with an evidence link — **that update is a
separate workflow change and is not performed by HDL-01**, which modifies no file outside its own
spec directory.
