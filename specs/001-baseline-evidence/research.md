# Phase 0 Research: HDL-01 — Baseline, Existing-Capability Map, and Evidence

**Feature**: `HDL-01` · **Branch**: `codex/hdl-01-baseline-evidence` · **Date**: 2026-08-08  
**Baseline commit**: `66b7b69e3117235c8a614a0502de21ca928e227e`  
**Plan**: [plan.md](plan.md) · **Spec**: [spec.md](spec.md) · **Design**: [design.md](design.md)

**Status: all NEEDS CLARIFICATION resolved. Zero open items.**

The `spec.md` Clarify session of 2026-08-08 closed every product-level question, and the single
`NEEDS_OWNER_DECISION` item was closed by `DECISION HDL-01` (Yasser, 2026-08-08,
`docs/spec-kit/DECISION-LOG.md`). What remained for Phase 0 were **planning** unknowns —
deliverable shape, measurement method, classification rule, document language, and two
Salla-side facts that cannot be confirmed locally. Each is decided below.

Two items (R-004, R-006) end in an *unconfirmed platform fact* rather than a confirmed one.
Per Constitution II, an unconfirmed platform behavior must be labelled and given a safe
fallback rather than assumed — both are, and neither blocks the plan.

---

## R-001 — No `contracts/` directory for HDL-01

**Decision**: Do **not** create `specs/001-baseline-evidence/contracts/`. Record the omission
explicitly in `plan.md` §Project Structure and here, so it reads as a decision rather than an
oversight.

**Rationale**: The Phase 1 workflow creates contracts only when the feature exposes an interface
to users or other systems, and says to skip when the work is purely internal. HDL-01 exposes
nothing on any of the surfaces this repository actually has:

| Possible interface surface | HDL-01 contribution |
|---|---|
| Public/JS API or exported module | none — no file under `src/assets/js/` is touched |
| CLI command or script | none — no file under `scripts/` is added or changed |
| Merchant setting (`twilight.json`) | none — `spec.md` §6; settings are owned by HDL-03 |
| Locale key (`src/locales/*.json`) | none — `spec.md` §12; report is internal, adds no customer-facing string |
| Template / DOM contract | none — no Twig file is touched; no class or attribute is introduced |
| `salla-*` component usage | none — the 58 tags in `src/` are inventoried, never called |
| HTTP endpoint / network call | none — zero requests added |
| Machine-readable output for another tool | none — the deliverable is human-read Markdown |

The deliverable is one internal document read by the owner and by later agents. A contract file
would describe nothing, and an empty `contracts/` directory would be a false signal that some
interface exists.

**Alternatives considered**:
- *Write a schema for the report's tables* — rejected: the report's structure is already
  specified in [data-model.md](data-model.md), which is the workflow's designated place for it.
  A parallel schema would be a second source of truth for the same rules.
- *Emit a machine-readable `baseline.json` alongside the report* — rejected twice over: it would
  be a second deliverable artifact, violating the "exactly one final report artifact" constraint,
  and it would genuinely create an external interface, which would then require `contracts/`.
- *Create an empty `contracts/` with a README explaining the skip* — rejected: an extra file and
  directory to state something that belongs in the plan, and it dilutes "exactly one artifact".

---

## R-002 — One primary classification per roadmap row, with recorded divergence

**Decision**: Assign each of the 29 `ROADMAP.md` rows **exactly one** classification from
`Existing — Audit & Polish` / `Build` / `Spike` / `Deferred`, using this ordered rule:

1. **Spike** — the row's *core* capability depends on Salla behavior that is unconfirmed and
   must be resolved before the row can be planned at all.
2. **Existing — Audit & Polish** — a responsible implementation of the row's *core* capability is
   present in `src/` at `66b7b69e`.
3. **Build** — otherwise.
4. **Deferred** — only where a governing artifact already places the row outside the current
   release. (No row is expected to qualify at baseline; `ROADMAP.md` marks all 29 as in-scope,
   and the report must not invent a deferral.)

Each row additionally carries the `spec-index.json` value and a **divergence flag** where the
two differ.

**Rationale**: `HDL-01-FR-001` and `spec.md` §11 both require exactly one classification per row
("كل صف يأخذ تصنيفًا واحدًا فقط"), but `docs/spec-kit/spec-index.json` currently carries
**compound** values for 18 of 29 rows: 15 × `Existing — Audit & Polish + Build` and
3 × `Existing — Audit & Polish + Build + Spike`. The two cannot both be satisfied literally.

Constitution §Governance sets precedence: constitution → **owner-approved spec and recorded
clarifications** → plan → tasks → ad-hoc instructions. `spec.md` is owner-approved; `spec-index.json`
is a generated index. **FR-001 wins.** The divergence is real information rather than noise —
it is exactly the "documentation contradicts runtime/spec" class that FR-003 says to record as an
open discrepancy and *not* fix inside HDL-01. Since HDL-01 may not modify `spec-index.json` or
`ROADMAP.md`, recording it with a proposed owner is the only compliant handling.

The "core capability" qualifier is what makes a single value honest. Most rows legitimately mix
audit and build work — that is why the index went compound. The primary classification answers
the question the classification exists to answer (Constitution VII: *may this row start building
before it audits what exists?*), and the divergence column preserves the nuance.

**Alternatives considered**:
- *Adopt the compound values* — rejected: directly violates FR-001 and `spec.md` §11, and would
  make the success criterion "29 rows with one classification" unachievable.
- *Correct `spec-index.json` to single values* — rejected: modifies a file outside HDL-01's
  permitted set and breaks "no changes to any other file".
- *Classify by counting sub-items* — rejected: not reproducible from a named command, and
  `spec.md` §11 requires every classification to be reproducible.

---

## R-003 — Measure the production build without rewriting `public/`

**Decision**: For the report's build evidence, cite the production build **already executed at
this exact commit** (2026-08-08, recorded in `.specify/.runtime/hadeel-night-run.md` 16:52 +03:
succeeded in 22.437s, `app.css` 784 KiB, `app.js` 125 KiB, `app` entrypoint 909 KiB, three
performance warnings). For **re-verification**, use:

```bash
node scripts/check-theme.mjs --build --json                     # safe as-is
npx webpack --mode production --output-path "$(mktemp -d)"      # stats without touching public/
```

State the substitution openly in the report's method section.

**Rationale**: `webpack.config.js:25-29` sets `output.clean: true` on `public()`. A bare
`npx webpack --mode production` therefore **deletes and rewrites all 33 files in `public/`**.
Even when the result is byte-identical, that is a write to a path HDL-01 has committed not to
touch, and it would show as filesystem churn during a feature whose central claim is zero source
impact. Running it would be self-defeating.

The safe form is not an invention — `scripts/check-theme.mjs:319-321` already does exactly this,
building into `mkdtempSync(join(tmpdir(), 'hadeel-build-'))` via `--output-path` and comparing
hashes against `public/`. So `--build` both proves the build succeeds and proves `public/`
matches it, without writing to `public/`. That single command satisfies most of FR-003.

The cited build is valid evidence under `AGENTS.md` §Evidence rules: it was run at `66b7b69e`,
which is still `HEAD`, and its result is independently corroborated by the `--build` guard
reporting `public/ matches a fresh production build`. It is not a stale artifact from `output/`.

**Alternatives considered**:
- *Run the bare production build and rely on byte-identical output* — rejected: writes to
  `public/`, and a mid-run interruption would leave the tree dirty and the guard red.
- *Skip the webpack numbers and report only the guard* — rejected: FR-003 names
  `npx webpack --mode production` explicitly and requires its warnings and timing verbatim.
- *Report the numbers without any re-run path* — rejected: `spec.md` §11 requires every number to
  be reproducible by any agent.

---

## R-004 — `public/` total is the comparable bundle number; Salla's method is unconfirmed

**Decision**: The number compared against Salla's ceiling is the **published `public/` directory
total**. Record the webpack `app` entrypoint **separately**, labelled a build-tool signal and not
a platform limit. Report the raw byte total *and* the `du -sk` allocation, and the overage under
**both** MB = 10⁶ and MiB = 2²⁰. Mark the measurement-method match with Salla as **unconfirmed,
carried to HDL-05 as a Spike**.

**Rationale**: `docs/building-a-salla-theme.md:27` states the ceiling — "Public themes: **1 MB
max.** Private themes: **2 MB**" — as a property of the published theme, which is `public/` plus
the templates Salla renders, not of any webpack entrypoint. `spec.md` clarification 3 already
fixed this interpretation. Measured at `66b7b69e`:

| Measure | Value | Nature |
|---|---|---|
| `public/` raw byte total (33 files) | **1,557,969 B = 1,521.5 KiB** | comparable to the ceiling |
| `public/` `du -sk` allocation | 1,604 KiB | filesystem blocks, not payload |
| webpack `app` entrypoint (`app.css` + `app.js`) | 931,120 B = **909 KiB** | build-tool signal only |
| `app.css` | 802,732 B (51.5% of total) | largest single asset |
| 12 JS bundles combined | 330,350 B (21.2%) | — |
| 5 Thmanyah `.woff2` files | 385,492 B (24.7%) | second-largest block |

What stays unconfirmed is Salla's *method*: raw bytes or allocated blocks, decimal MB or binary
MiB, pre- or post-publish transform, and whether fonts and images count toward the same ceiling.
Nothing in the repository answers this, and inventing an answer would violate Constitution VI.

The decision is safe despite the unknown, because **every interpretation yields the same verdict**:
148.6% of 1 MiB or 155.8% of 1 MB — an overage either way, roughly 651 KiB above the 85% internal
target. So the report can state "confirmed overage, unconfirmed exact margin" without hedging the
conclusion, which is precisely the distinction FR-004 demands.

**Alternatives considered**:
- *Use the webpack entrypoint as the headline number* — rejected: it omits fonts and images and
  would understate the published payload by ~40%.
- *Use `du -sk` alone* — rejected: block allocation is machine-dependent and not reproducible
  across filesystems, breaking `spec.md` §11.
- *Ask Salla before writing the report* — rejected as a blocker: it would stall HDL-01 on an
  external response for a fact that changes no conclusion. Carried to HDL-05 instead.

---

## R-005 — Report language: Arabic-first, with identifiers left in ASCII

**Decision**: Write `baseline-report.md` **in Arabic**, matching `spec.md` and `design.md`. Keep
in Latin/ASCII, untranslated: file paths, commands, commit SHAs, tree hashes, branch names,
requirement IDs (`HDL-01-FR-003`), setting IDs, `salla-*` tag names, numbers, and units. Section
headings carry the requirement ID first so they are greppable regardless of language.

**Rationale**: User Story 1 is the owner reading the report **without opening the code**
("يفتحه ياسر دون فتح الكود"), and `spec.md`/`design.md` are already Arabic — an English report
would break that reading flow at the one document written for him. Meanwhile User Story 2 is an
agent looking up a capability's source path, so every technical token must stay copy-pasteable
and greppable. Leading each heading with its FR ID keeps the "7 of 7 named sections" success
criterion mechanically checkable with a language-independent `grep`.

This mirrors the constitution's own localization principle in spirit — Arabic is first-class,
not an afterthought — while `AGENTS.md` rule 4 (no hardcoded user-facing strings) is not engaged
at all here, because an internal spec document is not customer-facing copy and adds no locale key.

**Alternatives considered**:
- *English throughout* — rejected: breaks US1's premise and diverges from the sibling artifacts.
- *Bilingual, every section duplicated* — rejected: doubles the length of a reference document,
  and two copies of a table drift the moment one is updated.
- *Arabic including translated paths and commands* — rejected outright: an Arabic-transliterated
  path is not runnable and destroys reproducibility.

---

## R-006 — Salla preview is not acceptance evidence for HDL-01; availability is recorded instead

**Decision**: Do not run `salla theme preview` for HDL-01. Record instead: Salla CLI `3.2.45`
authenticated; theme `224400990` named `Hadeel`, status `development`; preview capability
available but **not invoked, because there is no source change to verify**. State plainly that
the preview requirement returns in full at the first `src/` or `public/` change, and that such a
change moves to its owning spec.

**Rationale**: Constitution VI makes a rendered Salla preview the acceptance environment for
**visual or behavioral change**. HDL-01 produces neither. `spec.md` §10 already records this as
"لا تنطبق كدليل قبول" with the availability status substituted. Running a preview would also be
actively harmful here: `docs/salla-twilight-notes.md` §6 documents that a preview session leaves
`public/` as a **development build** — `app.js` grows from ~128 KB to ~352 KB with an eval banner
that CI rejects — which would dirty exactly the directory HDL-01 promises not to touch, and would
require a rebuild to repair.

This is a scope-bounded non-application, not a weakening of the evidence chain: the report's
FR-005 evidence policy states the full preview requirement for every change type that does
produce a visual or behavioral difference.

**Alternatives considered**:
- *Run a preview anyway for completeness* — rejected: dirties `public/`, proves nothing about a
  Markdown file, and would need a production rebuild afterwards to restore the tree.
- *Declare the preview requirement waived* — rejected: it is **not applicable to this spec**,
  which is a different and much narrower statement. Waiving it would set a precedent that
  contradicts Constitution VI.

---

## R-007 — Snapshot-base evidence for the Theme Raed relationship baseline

**Decision**: Establish the origin/base item of the relationship baseline on **tree equality**,
and state the absent merge-base alongside it as a separate, non-contradictory fact. Verified at
`66b7b69e`:

```bash
git rev-list --max-parents=0 HEAD
# 8bf2ce6fab2d8939f344e620203bb6638b80b161

git cat-file -p 8bf2ce6fab2d8939f344e620203bb6638b80b161 | head -1
# tree 9d9056896ba11ead6f6a108857c1e6f7aca4bad9

git cat-file -p dc902f62775f25bf98f67b76da93eb098b1e207d | head -1
# tree 9d9056896ba11ead6f6a108857c1e6f7aca4bad9        <- identical

git merge-base upstream/master HEAD
# (no output, exit 1)  -> unrelated histories

git rev-list --left-right --count upstream/master...HEAD
# 3333    97
```

**Rationale**: `spec.md` §3 item 1 asks for provable origin *where it can be proven from
evidence*, and explicitly says to record "غير مُثبت" rather than infer. Here it **can** be
proven, just not by ancestry: identical tree hashes mean the two commits have byte-identical
working trees, so Hadeel's first commit is an exact snapshot of Theme Raed at `dc902f6`
(`2026-04-09`, `feat(CP-1114): Support Brand on Offer (#856)`).

The empty `merge-base` is a fact about *history topology*, not about *content*. Reported alone it
invites the false reading "Hadeel is unrelated to Raed" — which would understate the identity risk
that Constitution VIII and Salla's first publication criterion both turn on. Reported alone in the
other direction, tree equality without the missing merge-base would leave a reader wondering why
`git merge-base` returns nothing. Both together are the complete, honest statement, and this is
what `design.md` §Lineage already approved for Revision 1.

This satisfies the owner's "concise and reproducible" requirement in four commands, with **no
feature-by-feature comparison** anywhere in the derivation.

**Alternatives considered**:
- *Report only "no merge-base"* — rejected: technically true, materially misleading.
- *Diff the two trees file-by-file to quantify divergence* — rejected: that is the
  feature-by-feature analysis `DECISION HDL-01` forbids in HDL-01 and assigns to `HDL-29-FR-011`.
- *Record origin as "unproven"* — rejected: it **is** proven; recording otherwise would be
  inaccurate and would weaken the risk record HDL-29 depends on.

---

## R-008 — Handling documentation-versus-runtime contradictions

**Decision**: Record each contradiction in an **open-discrepancy table** with the documented
claim, the measured reality, the producing command, and a **proposed** owner. Fix none of them,
and modify none of the files they live in. Known at baseline:

| # | Documented claim | Measured at `66b7b69e` | Proposed owner |
|---|---|---|---|
| 1 | `AGENTS.md`: the guard "currently reports pre-existing errors — do not let that number grow" | `node scripts/check-theme.mjs --json` → **0 errors, 0 warnings**, all five static checks `ok` | HDL-05 (owns guard/CI gates) |
| 2 | `spec-index.json`: compound classifications for 18 of 29 rows | `HDL-01-FR-001` requires exactly one per row | Governance owner (Yasser); see R-002 |
| 3 | `twilight.json` description: "ثيم أزياء" / "fashion theme" | Product Blueprint defines a **general marketplace** theme with four presets | HDL-28 (marketplace listing) — routed by `HDL-29-FR-011` if it becomes a distinctness FAIL |

**Rationale**: `HDL-01-FR-003` is explicit — where repository documentation and actual execution
disagree, **execution is the truth and the document is the recorded gap**, and it "لا يُصلَّح
داخل HDL-01". `AGENTS.md` rule 6 reinforces it: say when a description is wrong rather than
quietly acting on it. Since HDL-01 may not modify `AGENTS.md`, `spec-index.json`, or
`twilight.json`, recording with a proposed owner is the only compliant action. "Proposed" is the
right strength: HDL-01 has no authority to assign work to another spec — it surfaces the item and
the owner routes it, which is the same pattern `DECISION HDL-01` sets for HDL-29 FAILs.

Discrepancy 1 also carries a small trap worth stating in the report: an agent reading only
`AGENTS.md` might assume a nonzero error budget exists and let a new error through as
"pre-existing". At this commit the budget is **zero**, so any error is new.

**Alternatives considered**:
- *Fix `AGENTS.md` in passing — it is one sentence* — rejected: FR-003 forbids it, and
  `AGENTS.md` §Regressions names scope creep as a shipped regression of this repository.
- *Omit the discrepancies as out of scope* — rejected: FR-003 requires recording them, and
  hiding a known contradiction is the opposite of Constitution VI.

---

## Consolidated unknowns status

| Unknown from Technical Context | Status | Where resolved |
|---|---|---|
| Deliverable filename and count | **Resolved** — `baseline-report.md`, exactly one | plan.md §Project Structure |
| Whether `contracts/` is required | **Resolved** — no, no external interface | R-001 |
| Classification rule for 29 rows | **Resolved** — one primary + divergence flag | R-002 |
| How to re-measure the build safely | **Resolved** — `--output-path "$(mktemp -d)"`; guard is already safe | R-003 |
| Which number is the bundle number | **Resolved** — `public/` total; entrypoint recorded separately | R-004 |
| Salla's exact bundle measurement method | **Unconfirmed platform fact** — labelled, both interpretations reported, Spike carried to HDL-05; conclusion unaffected | R-004 |
| Report language | **Resolved** — Arabic-first, ASCII identifiers | R-005 |
| Whether a Salla preview is required | **Resolved** — not applicable to this spec; availability recorded; would dirty `public/` | R-006 |
| How to prove the Theme Raed origin | **Resolved** — tree equality + stated absent merge-base | R-007 |
| How to handle doc-vs-runtime conflicts | **Resolved** — record with proposed owner, fix nothing | R-008 |

**NEEDS CLARIFICATION: none.** The two entries marked *unconfirmed platform fact* are Salla-side
behaviors that no local evidence can settle. Constitution II requires them to be marked as spikes
rather than assumed — they are, each with a safe fallback, and neither changes any decision in
this plan.
