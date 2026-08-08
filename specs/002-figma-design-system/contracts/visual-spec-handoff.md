# Contract: Visual Spec Handoff

**Provider**: HDL-02 Revision 2
**Consumers**: every later Hadeel specification that adds or changes customer-visible UI
**Authority**: `spec.md` FR-001…FR-010 and approved `design.md`

## Required consumer record

Before a visual consumer may enter Plan, its `design.md` MUST contain:

1. Spec ID, Figma file/page/section, current revision, lifecycle status, and direct Node URLs.
2. A Node Registry row for every approved Frame or Component set with canonical name, kind,
   device, language/direction, states, revision, owner, approval date, and `supersedes` value.
3. Arabic Mobile RTL first, Arabic Desktop RTL, and critical English Mobile/Desktop LTR parity.
4. Applicable Default/Hover/Focus-visible/Pressed/Disabled and Loading/Empty/Error/Sold-out
   states; every omitted state has an explicit N/A reason.
5. A Settings Matrix row for every visible choice, resolving it to an existing setting,
   component field, documented platform contract, Fixed quality decision, or owned Spike.
6. The exact owner approval statement, owner name, date, and revision.

## Naming contract

- Shared foundations/components: `HDL-02/Shared/<Responsibility>/...`
- Consumer frames/components: `HDL-XX/<Responsibility>/<Viewport>/<Direction>/<State>`
- The responsibility describes purpose or behavior, not a decorative style name.
- A presentation difference with the same data/behavior is a Variant, not a forked component.

## Direction contract

- Compare identical semantics/states across Arabic/RTL and English/LTR.
- Mirror physical item order, paragraph alignment, logical start/end spacing, directional
  icon/text order, Drawer/Menu side, Breadcrumb/Back, carousel/pagination, and directional arrows.
- Do not mirror logos, product media, photography, or non-directional Search/Cart/Play/Check icons.
- Isolate prices, currency, numbers, SKUs, URLs, and mixed-language runs where needed.
- Record a logical keyboard/focus sequence; runtime DOM verification remains mandatory after code.

## Evidence and approval contract

- Figma proves intent; GitHub proves implementation; rendered Salla preview proves behavior.
- A standalone mock-up or old screenshot cannot prove storefront behavior.
- Any deliberate preview/Figma difference uses a DeviationRecord from `data-model.md` and needs
  owner approval before acceptance.
- `Approved` applies to one revision only. A material visual, behavioral, responsive,
  direction/text, Variant, or setting change moves it to `Reopened` and blocks affected Plan,
  Tasks, and implementation until a newer revision is approved.
- Missing approval data, unresolved links, unowned Spikes, or an unclassified selectable Variant
  is a hard gate failure.

## Consumer completion check

```text
[ ] shared HDL-02 foundations/components reused
[ ] canonical names and direct Node IDs recorded
[ ] four-way direction/device coverage complete or explicitly N/A
[ ] interactions, async states, and focus contract documented
[ ] settings evidence complete; unknowns are owned Spikes
[ ] exact current-revision owner approval recorded
[ ] post-implementation production build and theme guard pass
[ ] post-change rendered Salla evidence captured
[ ] deviations classified and approved or fixed
```
