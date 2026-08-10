# HDL-06 Research Decisions

## 1. One motion source of truth

**Decision**: Define semantic CSS custom properties in `src/assets/styles/01-settings/motion.scss`. JavaScript reads the resolved properties rather than duplicating timings.
**Rationale**: CSS already owns most theme motion and responds to media queries immediately.
**Alternatives considered**: JSON generation was rejected as unnecessary build machinery; scattered Sass constants would not be readable by JavaScript.

## 2. Merchant level resolution

**Decision**: Validate `motion_level` in Twig against `calm|balanced|rich`, default to `balanced`, and emit one body class/data value. Normalize `motion_reduce_mobile` explicitly.
**Rationale**: Prevents unknown class interpolation and follows HDL-03’s single resolution boundary.
**Alternatives considered**: Reading raw settings in each component was rejected as contract duplication.

## 3. Reduced motion

**Decision**: CSS `prefers-reduced-motion` supplies the global declarative override; a small JS controller listens for preference changes, cancels active theme-owned animations, and prevents new nonessential motion.
**Rationale**: Covers both initial and in-session preference changes without reload.
**Alternatives considered**: Initial-load-only checks were rejected because they fail FR-005.

## 4. One-shot reveal

**Decision**: Use IntersectionObserver plus Web Animations for explicitly opted-in noncritical nodes. Mark and unobserve after the first entry. Do not create a hidden CSS base state.
**Rationale**: Content is visible when JS is delayed, disabled, or unsupported; transform/opacity avoids layout shift.
**Alternatives considered**: A global pre-JS opacity class was rejected because it can hide commerce content and fail no-JS safety.

## 5. Periodic add-to-cart animation

**Decision**: Remove the interval entirely. The existing selected animation becomes immediate feedback after the customer’s action; cleanup occurs on `animationend` with a bounded fallback.
**Rationale**: Meets the approved trust/accessibility decision and starts feedback within 100ms without blocking Salla’s handler.
**Alternatives considered**: A longer interval or merchant toggle was rejected because automatic CTA attention remains periodic.

## 6. AnimeJS

**Decision**: Remove AnimeJS from the shipped runtime by deleting the global import/wrapper and replacing Blog’s two simple uses with direct state update plus optional WAAPI scale feedback. Retain the dependency declaration temporarily.
**Rationale**: The shared bundle pays for a library used only by a Blog counter; native capabilities cover the behavior. `AGENTS.md` requires dependency/lock changes to be a separate commit.
**Alternatives considered**: Keeping the global library fails the bundle/simplicity goal; modifying `package.json` inside the feature commit violates the working agreement.

## 7. Salla component transitions

**Decision**: Treat internal transition duration/easing of `salla-drawer`, `salla-modal`, and `salla-slider` as Platform-owned Spike. Verify rendered behavior without styling private internals.
**Rationale**: Installed component evidence exposes methods, not a public motion configuration API.
**Alternatives considered**: Private selector overrides were rejected as fragile and likely to regress focus/scroll behavior.

## 8. Mobile reduction

**Decision**: When `motion_reduce_mobile=true`, Rich resolves to Balanced aliases at the mobile breakpoint; functional Drawer/loading/error feedback remains.
**Rationale**: Reduces visual load without changing feature availability.
**Alternatives considered**: Turning all mobile motion off was rejected because it removes useful state feedback.

## 9. Evidence and preview identity

**Decision**: Use an isolated preview worktree/branch and owner-confirmed SHA before browser access. Compare the same content/state in Arabic mobile/desktop and English mobile/desktop.
**Rationale**: Salla CLI has repeatedly served stale or unrelated drafts.
**Alternatives considered**: Treating a stale draft as code failure or using standalone mockups was rejected.

## Resolved Unknowns

No `NEEDS CLARIFICATION` remains. Platform transition control stays a named Spike whose safe fallback is native Salla behavior, not an implementation blocker.
