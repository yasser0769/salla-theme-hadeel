# HDL-05 Corrective Stale-Rule Scan — 2026-08-10

Repository-wide searches covered `1 MB`, `1MB`, `1000000`, `1,000,000`, `850000`,
`850,000`, `85%`, `950000`, `950,000`, `95%`, `hardCapBytes`,
`internalTargetBytes`, `bundle-budget`, `public/`, `gzip`, `rawBytes`, `compressed`,
`C1-LAUNCH`, `HIGH RISK`, `Safelist`, `997743`, and `997,743`.

## Classification

| Classification | Meaningful remaining locations | Disposition |
|---|---|---|
| `CURRENT` | Constitution v1.0.1; `AGENTS.md`; HDL-05 Spec/Plan; `bundle-budget.json`; checker; tests; CI; current docs | Compressed `sallaPackageEstimate` is the publishing gate; 95% is derived from the configured hard cap; raw/gzip/runtime are independent. |
| `HISTORICAL` | HDL-01 baseline artifacts; HDL-05 T001–T013 tasks; old runtime-log entries; T005F/T009/T010/T011/T013 evidence | Measurements and execution facts retained. Every old raw-1MB verdict is covered by a prominent historical/superseded notice. |
| `SUPERSEDED` | Old 85% target; raw `public/ <= 1 MB`; C1 high-risk acceptance and its C1-only proof/rollback debt | Explicitly superseded in the governing Spec, Tasks, combined review, follow-up register, historical evidence, and runtime state. |
| `INCORRECT` | None after correction | Zero active hits. |

Unrelated `85%` hits in normalized CSS snapshots are CSS flex-basis declarations, not
bundle policy. Numeric fixture/test hits intentionally exercise the current boundary
contract. `hardCapBytes` and `internalTargetBytes` inside checker return objects are derived
runtime result names; the persisted numeric authority is only
`sallaCompressedHardCapBytes` plus `internalCompressedTargetPercent`.

## Required result

`STALE RAW-1MB ACTIVE RULES: 0`

`STALE 85% ACTIVE TARGETS: 0`
