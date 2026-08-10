# HDL-06 Data Model

HDL-06 has no database entities or migration. Its state is merchant configuration plus ephemeral browser state.

## MotionProfile

| Field | Type | Rules |
|---|---|---|
| `level` | enum | `calm`, `balanced`, `rich`; unknown → `balanced` |
| `durationFeedback` | CSS time | starts within 100ms; state duration ≤ level cap |
| `durationUI` | CSS time | Calm ≤160ms, Balanced ≤240ms, Rich ≤400ms |
| `easing` | CSS easing | semantic token, no component-local curve |
| `distance` | CSS length | 0–4px, 0–8px, or 0–20px by level |
| `reveal` | enum | `off`, `once`, `bounded-stagger` |

## MerchantMotionSettings

| Field | Persisted | Default | Validation |
|---|---:|---|---|
| `motion_level` | yes | `balanced` | exact enum allowlist |
| `motion_reduce_mobile` | yes | `true` | explicit boolean normalization |
| `product_add_to_cart_animation` | existing | `tada` | existing option allowlist; `none` allowed |
| `product_add_to_cart_animation_interval` | existing compatibility value | `6` | ID/type/value retained; runtime ignores it |

## RuntimeMotionState

| Field | Source | State transition |
|---|---|---|
| `osReduced` | `matchMedia('(prefers-reduced-motion: reduce)')` | updates on MediaQueryList `change` |
| `isMobileReduced` | setting + mobile media query | Rich aliases become Balanced on mobile |
| `effectiveLevel` | merchant level + OS/mobile overrides | OS reduce → reduced; mobile Rich → Balanced; otherwise merchant level |
| `activeAnimations` | theme-owned WAAPI/CSS feedback handles | created on eligible action; cancelled to final state on reduce/end |

## MotionTarget

| Field | Rules |
|---|---|
| `kind` | `feedback`, `reveal`, `overlay`, `slider`, or `decorative` |
| `directionality` | `logical` or `non-directional`; only logical movement mirrors |
| `critical` | critical targets cannot use reveal or hidden initial state |
| `revealed` | one-way `false → true`; never resets on scroll/back navigation |

## State Transitions

```text
merchant level ─┐
mobile setting ─┼─> effective profile ─> semantic CSS aliases
OS preference ──┘          │
                           ├─ reduce: cancel active nonessential motion
user action ────────────────┴─ feedback starts immediately, then final state
intersection ───────────────── reveal once, unobserve, never hide critical content
```

## Invariants

1. Critical commerce content is visible and interactive without JavaScript.
2. Changing motion state never changes DOM order, focus order, content, price, or action availability.
3. No recurring CTA timer exists.
4. Motion never changes layout dimensions; attributed CLS is `0.000`.
5. Stored legacy settings survive upgrade and rollback unchanged.
