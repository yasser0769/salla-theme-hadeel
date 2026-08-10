/**
 * HDL-06 shared motion controller (T015/T025) — the single runtime owner of
 * theme-driven motion.
 *
 * Contract: specs/006-motion-system/contracts/motion-contract.md
 * Guard:    scripts/check-motion-system.mjs (rule motion-controller) and
 *           tests/motion-system.test.mjs pin this behavior.
 *
 * Rules of this file:
 * - Progressive enhancement: every motion is optional. With JavaScript absent,
 *   WAAPI absent, IntersectionObserver absent, or `window.matchMedia` absent
 *   (or a legacy MediaQueryList exposing only addListener/removeListener,
 *   e.g. older Safari), content and actions are already fully available —
 *   nothing here hides, gates, or crashes anything.
 * - Timings come from the computed `--motion-*` tokens owned by
 *   `01-settings/motion.scss`; this file never duplicates the profile table
 *   (no per-level values, no raw durations of its own).
 * - The OS `prefers-reduced-motion: reduce` preference outranks the merchant
 *   level at load and mid-session: active theme-owned animations are finished
 *   to their final state and no new nonessential motion starts (FR-004/005).
 * - Motion is non-directional (fade/scale/vertical distance), so RTL and LTR
 *   behave identically (FR-011).
 * - No recurring timers, no attention loops, no third-party animation engine.
 *   The only timeout is the one-shot CSS-class feedback cleanup derived from
 *   the computed animation duration/delay when WAAPI handles are unavailable.
 *
 * One instance is exposed as `window.hadeelMotion` so the separately built
 * page bundles (product, blog, loyalty, …) can share the live reduced-motion
 * state and the tracked-animation registry without importing this module.
 * The class itself is exported only so the offline behavioral tests can drive
 * it with mocks; runtime code must go through `initHadeelMotion()`.
 */

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
const REVEAL_SELECTOR = '[data-hadeel-reveal]';

export class HadeelMotion {
  constructor() {
    /** Theme-owned animations in flight, so reduce can settle them (FR-005). */
    this.activeAnimations = new Set();
    /** Reveal targets that already fired — reveal is exactly once, ever. */
    this.revealedTargets = new WeakSet();
    this.revealObserver = null;
    this.onReduceChange = this.onReduceChange.bind(this);

    // No matchMedia, or a MediaQueryList without addEventListener, must never
    // crash the page — motion simply stays at the non-reduced default.
    this.reducedMotionQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia(REDUCE_QUERY)
      : null;
    this.reduced = !!this.reducedMotionQuery?.matches;
    this.legacyQueryListener = false;
    if (this.reducedMotionQuery) {
      if (typeof this.reducedMotionQuery.addEventListener === 'function') {
        this.reducedMotionQuery.addEventListener('change', this.onReduceChange);
      } else if (typeof this.reducedMotionQuery.addListener === 'function') {
        this.legacyQueryListener = true;
        this.reducedMotionQuery.addListener(this.onReduceChange);
      }
    }
    if (!this.reduced) this.initReveal();
  }

  /**
   * Live reduced-motion state for separate bundles. Read it at the moment an
   * effect would start — never cache it — so a mid-session OS change wins.
   */
  get prefersReducedMotion() {
    return this.reduced;
  }

  /**
   * One semantic token from the computed style of the token owner scope.
   * Falls back to the document element when body is unavailable, and to an
   * empty string when getComputedStyle itself is unavailable.
   */
  token(name, element) {
    const target = element || document.body || document.documentElement;
    if (!target || typeof window.getComputedStyle !== 'function') return '';
    return window.getComputedStyle(target).getPropertyValue(name).trim();
  }

  durationMs(name, fallback = 0) {
    const match = this.token(name).match(/^(\d+(?:\.\d+)?)(ms|s)$/);
    if (!match) return fallback;
    return match[2] === 's' ? Number(match[1]) * 1000 : Number(match[1]);
  }

  distancePx(name, fallback = 0) {
    const match = this.token(name).match(/^(\d+(?:\.\d+)?)px$/);
    return match ? Number(match[1]) : fallback;
  }

  /** Longest time in a computed CSS time-list property (e.g. `0.2s, 100ms`). */
  computedDurationMs(element, property) {
    const values = this.token(property, element).split(',').map((part) => {
      const match = part.trim().match(/^(\d+(?:\.\d+)?)(ms|s)$/);
      if (!match) return 0;
      return match[2] === 's' ? Number(match[1]) * 1000 : Number(match[1]);
    });
    return Math.max(0, ...values);
  }

  supportsWaapi(element) {
    return typeof element?.animate === 'function';
  }

  /**
   * Register a theme-owned animation until it settles. Implementations
   * without `Animation.finished` release through finish/cancel events; one
   * without either is still tracked so a live reduce can settle it.
   */
  track(animation) {
    this.activeAnimations.add(animation);
    const release = () => this.activeAnimations.delete(animation);
    if (animation.finished && typeof animation.finished.then === 'function') {
      animation.finished.then(release, release);
    } else if (typeof animation.addEventListener === 'function') {
      const done = () => {
        animation.removeEventListener('finish', done);
        animation.removeEventListener('cancel', done);
        release();
      };
      animation.addEventListener('finish', done);
      animation.addEventListener('cancel', done);
    }
    return animation;
  }

  /** Resolves when an animation settles, with or without `.finished`. */
  settled(animation) {
    if (animation.finished && typeof animation.finished.then === 'function') {
      return animation.finished.then(() => {}, () => {});
    }
    return new Promise((resolve) => {
      if (typeof animation.addEventListener !== 'function') {
        resolve();
        return;
      }
      const done = () => {
        animation.removeEventListener('finish', done);
        animation.removeEventListener('cancel', done);
        resolve();
      };
      animation.addEventListener('finish', done);
      animation.addEventListener('cancel', done);
    });
  }

  /**
   * OS reduce activated mid-session: settle every active theme-owned
   * animation at its final state (finish, never a mid-flight jump to none),
   * disarm pending reveal observation, and suppress anything new (FR-005).
   */
  onReduceChange(event) {
    this.reduced = event.matches;
    if (!this.reduced) {
      this.initReveal();
      return;
    }
    for (const animation of this.activeAnimations) {
      try {
        if (typeof animation.finish === 'function') animation.finish();
        else if (typeof animation.cancel === 'function') animation.cancel();
      } catch {
        try { animation.cancel(); } catch { /* already idle */ }
      }
    }
    this.activeAnimations.clear();
    this.revealObserver?.disconnect();
    this.revealObserver = null;
  }

  /**
   * One-shot reveal for explicit noncritical opt-ins (FR-017). Without
   * IntersectionObserver there is no reveal and no functional loss — the
   * content was never hidden. Already revealed targets are never
   * re-observed, so reduce toggles can never replay a reveal.
   */
  initReveal() {
    if (this.revealObserver || this.reduced) return;
    if (!('IntersectionObserver' in window)) return;
    const targets = Array.from(document.querySelectorAll(REVEAL_SELECTOR))
      .filter((target) => !this.revealedTargets.has(target));
    if (!targets.length) return;

    this.revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        this.revealObserver.unobserve(entry.target);
        this.reveal(entry.target);
      }
    });
    targets.forEach((target) => this.revealObserver.observe(target));
  }

  /**
   * Reveal one element, exactly once. The target is marked revealed on its
   * first intersection even when the animation is a no-op (calm and
   * OS-reduced profiles zero the reveal tokens; without WAAPI the element
   * simply stays in its already-visible final state), so it can never be
   * replayed by a later reduce toggle or re-observation.
   */
  reveal(element) {
    if (this.revealedTargets.has(element)) return;
    this.revealedTargets.add(element);
    if (this.reduced || !this.supportsWaapi(element)) return;
    const duration = this.durationMs('--motion-duration-reveal');
    const distance = this.distancePx('--motion-reveal-distance');
    if (!duration || !distance) return;
    const animation = element.animate(
      [
        { opacity: 0, transform: `translateY(${distance}px)` },
        { opacity: 1, transform: 'translateY(0px)' },
      ],
      { duration, easing: this.token('--motion-easing-standard') || 'ease' },
    );
    this.track(animation);
  }

  /**
   * Bounded post-action feedback for separate bundles (product, blog,
   * loyalty). Runs only when a real customer action already happened; it
   * never implies request success and never blocks the action. Returns the
   * tracked Animation, or null when feedback must not run.
   */
  feedback(element, keyframes = [
    { transform: 'scale(1)' },
    { transform: 'scale(1.06)' },
    { transform: 'scale(1)' },
  ]) {
    if (this.reduced || !this.supportsWaapi(element)) return null;
    const duration = this.durationMs('--motion-duration-feedback');
    if (!duration) return null;
    const animation = element.animate(keyframes, {
      duration,
      easing: this.token('--motion-easing-emphasized') || 'ease',
    });
    return this.track(animation);
  }

  /**
   * Bounded CSS-class feedback (the merchant-selected add-to-cart effect).
   * The class is restarted so rapid repeated actions retrigger cleanly, the
   * resulting CSS animations are tracked through `element.getAnimations()`
   * when supported — so a live OS reduce change finishes/cancels them like
   * every other theme-owned animation — and the class is removed once they
   * settle. Without WAAPI handles, a one-shot timer derived from the computed
   * animation-duration/delay of the class performs the cleanup. Returns the
   * tracked Animations, or null on the fallback path or when suppressed.
   */
  playClassFeedback(element, className) {
    if (this.reduced || !element?.classList) return null;
    element.classList.remove(className);
    void element.offsetWidth; // restart the effect on rapid repeated actions
    element.classList.add(className);

    const release = () => element.classList.remove(className);
    const animations = typeof element.getAnimations === 'function'
      ? element.getAnimations()
      : [];
    if (animations.length) {
      animations.forEach((animation) => this.track(animation));
      Promise.all(animations.map((animation) => this.settled(animation))).then(release);
      return animations;
    }

    const wait = this.computedDurationMs(element, 'animation-duration')
      + this.computedDurationMs(element, 'animation-delay');
    window.setTimeout(release, wait);
    return null;
  }

  destroy() {
    if (this.reducedMotionQuery) {
      if (this.legacyQueryListener) {
        this.reducedMotionQuery.removeListener(this.onReduceChange);
      } else if (typeof this.reducedMotionQuery.removeEventListener === 'function') {
        this.reducedMotionQuery.removeEventListener('change', this.onReduceChange);
      }
    }
    this.revealObserver?.disconnect();
    this.revealObserver = null;
    this.activeAnimations.clear();
  }
}

/** Create (or return) the single shared controller instance. */
export function initHadeelMotion() {
  if (!window.hadeelMotion) {
    window.hadeelMotion = new HadeelMotion();
  }
  return window.hadeelMotion;
}

export default initHadeelMotion;
