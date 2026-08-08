# Quickstart: Validate HDL-02 Revision 2

**Feature**: HDL-02 · **Date**: 2026-08-08
**Approved design**: [design.md](design.md) · **Contract**: [visual-spec-handoff.md](contracts/visual-spec-handoff.md)

This guide validates the design-governance implementation. It does not claim that the current
rendered theme implements the Figma specimens.

## 1. Preconditions

```bash
cd /Users/yasseralshihri/Desktop/Projects/salla-theme-hadeel
git branch --show-current
# expect: codex/hdl-02-figma-design-system

git rev-parse HEAD
# planning baseline: 9e22771b21e85ea3b4aee847946ad4574683d02d
```

Confirm the approved record:

```bash
grep -F '**Owner statement**: `APPROVE HDL-02 REV 2`' specs/002-figma-design-system/design.md
grep -F '**Design revision**: 2' specs/002-figma-design-system/design.md
grep -F '**Status**: Approved for Implementation — Revision 2' specs/002-figma-design-system/design.md
```

## 2. Validate direct design references

Open these direct links and confirm each resolves to the named Revision 2 object:

- Root `381:3`
- QA matrix `398:2`
- Arabic Mobile RTL `398:5`
- English Mobile LTR `398:6`
- Arabic Desktop RTL `398:7`
- English Desktop LTR `398:8`

The full URLs are intentionally maintained once in `design.md`; do not duplicate or hand-edit a
second registry. Verify in Figma that the page still has one top-level root, nine component sets,
88 variants, and the four paired frames. If a node is missing or intent changed, stop and reopen
the revision gate.

## 3. Deterministic repository checks

```bash
FEATURE_DIR=specs/002-figma-design-system

# No placeholders or unresolved planning clarifications.
rg -n 'NEEDS CLARIFICATION|\[FEATURE\]|\[HDL-XX\]|\bTBD\b' \
  "$FEATURE_DIR/plan.md" "$FEATURE_DIR/research.md" \
  "$FEATURE_DIR/data-model.md" "$FEATURE_DIR/contracts" \
  "$FEATURE_DIR/design-system-report.md"
# expect: no output (owned future values may say “owned Spike”, never bare TBD)

# Approval and direct parity nodes occur in the evidence packet.
for value in 'APPROVE HDL-02 REV 2' '398:5' '398:6' '398:7' '398:8'; do
  grep -F "$value" "$FEATURE_DIR/design-system-report.md"
done

# Exactly nine component families and the declared total.
grep -c '^| HDL-02/Shared/' "$FEATURE_DIR/design-system-report.md"
# expect: 9
grep -F 'variant_total = 88' "$FEATURE_DIR/design-system-report.md"

# JSON and lifecycle status remain synchronized.
node - <<'NODE'
const index = require('./docs/spec-kit/spec-index.json');
const row = index.features.find(x => x.id === 'HDL-02');
if (!row || !['planning', 'implementing', 'qa', 'done'].includes(row.status)) process.exit(1);
console.log(row.status);
NODE
```

## 4. Prove zero theme-source impact

Capture the source scope before Kimi implementation and compare it after the report is written:

```bash
git status --porcelain -- src public twilight.json package.json pnpm-lock.yaml
# expect: no output

git diff -- src public twilight.json package.json pnpm-lock.yaml
# expect: no output

node scripts/check-theme.mjs --build
# expect: no new errors, no new warnings, build-sync ok
```

Production build and live Salla preview are `N/A — no source change`. If either source-scope
command produces output, the plan is invalid: stop, move the runtime change to its owning spec,
and apply the full production-build plus rendered-preview gate there.

## 5. Review the evidence packet

The final report must prove:

- current revision = 2 and Revision 1 = Superseded;
- 8 collections, 150 variables, 18 text styles, 5 effects;
- 9 unique component sets and `variant_total = 88`;
- direct four-frame device/direction parity and the mirrors/non-mirrors rationale;
- all settings decisions are confirmed evidence, Fixed, or owned Spike;
- exact owner approval and reopen/supersede lifecycle;
- no Code Connect/version-history claim beyond actual tool capability;
- no rendered-storefront, accessibility score, or runtime behavior claim;
- zero theme source, bundle, network, and runtime impact.

## 6. Completion gate

HDL-02 may enter final review only when all checks above pass and an independent reviewer finds
zero blocking contradiction among `spec.md`, `design.md`, `plan.md`, `tasks.md`, the contract,
and `design-system-report.md`. Final owner acceptance remains a separate Human Gate after that
review.
