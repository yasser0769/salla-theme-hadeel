# T056 — Rollback drill

## Deterministic fixture

T035 passes three rollback tests: the saved post-feature fixture contains all new IDs plus six valid legacy values; disabling the engine ignores every new ID; removing the new IDs produces the same six legacy classes byte-for-byte.

## Live draft

On owner-confirmed draft `1328326277` with local assets from preview SHA `662eca99`, engine-off rendered:

- `hadeel-layout-wide`
- `hadeel-spacing-balanced`
- `hadeel-corners-rounded`
- `hadeel-card-elevated`
- `hadeel-header-start`
- `hadeel-header-density-comfortable`

It emitted no preset/profile/source attributes. Arabic desktop and 320px home captures kept price and CTA visible and had no overflow. The draft was then restored to engine-on, Modern, all followers at Follow.

The product page has a pre-existing 28px overflow at 320px (`scrollWidth=348`) in both engine-on Modern and engine-off legacy states. This proves no HDL-03 regression, but the inherited product/layout issue remains a release risk for its owning Spec and HDL-29.

Result: **PASS for HDL-03 rollback/no-regression**.
