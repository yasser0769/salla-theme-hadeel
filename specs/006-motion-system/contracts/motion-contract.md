# HDL-06 Motion Contract

## Server contract

- `motion_level` accepts only `calm`, `balanced`, `rich`; fallback is `balanced`.
- The body emits exactly one `hadeel-motion-{level}` class and a matching data value.
- Mobile reduction emits a fixed state only when the normalized setting is true.
- Raw merchant values are never interpolated into class names.

## Semantic token contract

The implementation defines and consumes semantic properties for:

- feedback duration;
- UI transition duration;
- reveal duration and stagger;
- standard, exit, and emphasized easing;
- small, medium, and rich logical distances;
- reduced-motion duration/distance.

Components consume aliases; raw time/distance literals require a named functional exception in the static guard. Continuous loading indicators may keep a functional cycle only when the reduced-motion contract replaces or stops it.

## Effective profiles

| Profile | UI cap | Spatial reveal | Repeat |
|---|---:|---:|---|
| Calm | 160ms | none | none |
| Balanced | 240ms | ≤8px, once | none |
| Rich | 400ms | ≤20px, bounded stagger | none |
| OS Reduced | 100ms | 0px | none |
| Mobile Rich + reduction | Balanced aliases | ≤8px, once | none |

## JavaScript contract

- Theme-owned motion is progressive enhancement.
- The controller reads computed CSS tokens; it does not duplicate the profile table.
- One-shot reveal uses explicit noncritical opt-in and IntersectionObserver.
- Active theme-owned animations are cancelled to their final state when OS reduce activates.
- Add-to-cart feedback runs only after a real customer action and never on an interval.
- Blog feedback uses native APIs; no global `window.anime` is created.

## Direction contract

- Logical start/end translation mirrors between RTL and LTR.
- Fade, scale, spinner, logos, product imagery, photography, and nondirectional icons do not mirror.
- Time, state order, DOM order, and keyboard order are identical in both directions.

## Platform boundary

Salla component internals remain native unless a public interface is proven. A measured difference is recorded with component/selector/evidence as `Platform-owned Spike` or `NOT VERIFIED`; it is not patched through an undocumented private selector.

## Failure behavior

- Unknown setting → Balanced.
- JavaScript unavailable → content and actions remain fully available with no reveal.
- WAAPI/IntersectionObserver unavailable → no reveal; no functional loss.
- Reduced preference changes mid-animation → cancel to final state and do not start new nonessential motion.
- Preview serves stale branch → `SALLA PREVIEW SYNC FAILURE`, not automatic code FAIL.
