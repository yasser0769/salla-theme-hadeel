# How to work on this theme

Written for the person directing the work, not for the agent. `AGENTS.md` is the rulebook
an agent reads; this is why those rules exist and how to run the loop yourself.

The short version: **the quality of the work is decided by what you can measure, not by
how good the instructions were.** The previous round of fixes on this repo had a detailed
ten-stage brief and still made things worse, because nothing in the loop could tell the
difference between "fixed" and "claimed fixed."

---

## 1. Ask for the harness before the fix

The instinct is to say "fix the product page." The better first request is "build me
something that can prove the product page is fixed."

This repo now has two:

```bash
node scripts/check-theme.mjs --build   # rules that must never be broken
node scripts/css-snapshot.mjs out.txt  # what the built CSS actually contains
```

The second one is the interesting one. Restyling 4,000 lines of SCSS is normally
unverifiable without opening a browser on every page. `css-snapshot` turns the built
`app.css` into one sorted line per rule, so you can do this:

```bash
node scripts/css-snapshot.mjs before.txt
# … refactor …
npx webpack --mode production
node scripts/css-snapshot.mjs after.txt
diff before.txt after.txt
```

An empty diff proves the refactor changed nothing. A non-empty diff is the exact list of
what changed — and now the conversation is "justify these 39 lines," which is a question
that has a right answer, instead of "does it still look OK," which is a question that
gets guessed at.

That consolidation removed 142 rules and added 39. Every one was named in the commit
message. That is the standard to hold work to.

**Ask for this whenever a change is too big to eyeball.** It usually takes 20 minutes to
build and saves the entire review.

---

## 2. Treat every claim as a claim, including your own

The brief you hand over is not ground truth. Two examples from this repo:

- A review said `.kalles-product-meta` and `.kalles-product-share` were in the template
  but not rendering, citing a screenshot. The screenshot was taken at 19:29; those blocks
  were added to the template at 00:20 the next day. The evidence predated the code.
- A review said `.kalles-product-dock` and `support-sticky-bar` were two sticky bars
  fighting, and recommended deleting the dock. Reading the component showed one runs
  below 768px and the other at or above it. Deleting the dock would have removed a
  working feature to fix a problem that did not exist.

Both were caught by reading the actual source instead of trusting the description. That
is now rule 7 in `AGENTS.md`: **say when a description is wrong, before changing
anything.** When an agent pushes back on your brief, that is the rule working.

The rule cuts both ways. A third claim — that `.product-single` was a dead class because
no template rendered it — survived the source review and was only caught when the
storefront finally loaded: Salla injects that class through its `body:classes` hook. The
change built on it was harmless, the reasoning was not. **Reading `src/` tells you what
the theme contributes, not what the page contains.**

Practical habit: before accepting a screenshot or report as evidence, check its date
against `git log` for the files it describes. And before calling anything dead, look at
a rendered DOM.

---

## 3. Make "done" mean something

"Done" is not "the code looks right." In this repo it means:

- [ ] `npx webpack --mode production` succeeds
- [ ] `node scripts/check-theme.mjs --build` is clean
- [ ] For anything visual: a measurement or screenshot taken *after* the change
- [ ] Every claim traceable to output someone actually saw

If a step could not be done, the report says "not verified" in those words. An agent that
says "not verified" is more useful than one that says "done" and is wrong, and you should
reward the first out loud so you keep getting it.

---

## 4. Use a ratchet, not a cleanup sprint

When the guard first ran it found 31 errors. The wrong move is to demand zero immediately
— that turns into a giant risky change. The right move is to pin the number:

```yaml
run: node scripts/check-theme.mjs --max-errors=31
```

Now the count can only go down. Each piece of work lowers it, CI enforces the new floor,
and nothing regresses while you make progress. This repo is at 0 now, and the flag is
still spelled out in CI so raising it requires an explicit, visible decision.

Same idea applies to anything you inherit: bundle size, `!important` count, type errors.
Pin it, then lower it.

---

## 5. Fix causes, and let the fix tell you what else is broken

Consolidating the two stylesheets was framed as tidying. It surfaced real bugs that
nobody had reported:

- `footer_is_dark` did nothing. One file painted the footer dark, the other painted it
  light afterwards, unconditionally.
- The product page pinned its container to 1320px while the rest of the store used 1410px
  — so it never lined up with the header, and `layout_width` had no effect there.
- A checked radio's border colour read `var(--color-main)`, which nothing defines, so the
  rule had never applied in the history of the theme.
- The sticky bar was positioned at 640px while the component switches itself at 767px and
  the body already reserved space at 767px, so 641–767px got 134px of dead space under
  the page.

None of these were on any list. They fell out of putting each selector under one owner.
That is the argument for fixing structure rather than patching symptoms: symptom patches
hide the next bug, structural fixes expose it.

The counter-example is in the git history: a commit titled "repair product actions"
whose actual content was re-adding hardcoded Arabic strings that an earlier commit had
removed. It made a symptom go away and undid a real fix.

---

## 6. One reason per commit

A commit here titled "add merchant customization controls" also upgraded dependencies and
rewrote 563 lines of `twilight.json`. When something in that commit breaks, you cannot
revert it, because reverting takes three unrelated things with it.

Write the commit message as an explanation, not a label. The message for the stylesheet
consolidation lists every behaviour change and the measured before/after. If you cannot
write that paragraph, the commit is doing too much.

---

## 7. Reach for the platform before writing your own

Twilight already provides most of what gets hand-rolled here:

| Hand-rolled | Already existed |
|---|---|
| `getKallesTranslation()` with language sniffing | `salla.lang.getWithDefault(key, default)` — used by 25 Twilight components |
| `MutationObserver` watching for product cards | `salla-products-slider::products.fetched` event |
| Custom mobile sticky bar | `support-sticky-bar` on `salla-add-product-button` |

`docs/salla-twilight-notes.md` records what is actually there, read out of
`node_modules`, along with which internals are private and will break. Check it before
building something — and add to it when you learn something new, so the next session
starts ahead.

---

## 8. What is still open

Three things this round could not close, listed so they do not get quietly forgotten:

1. **No live verification.** Every change here is verified statically — build, guard, CSS
   diff. Nothing has been rendered on a real Salla storefront since 2026-07-29. Before
   launch, run one preview pass over: product page (desktop + mobile), a product with
   required options, category, home, cart, and an English/LTR store. That is stage 1 and
   stage 9 of `FIX-PROMPT-V2.md`.
2. **The fake account icon.** The header hides Salla's real trigger with `opacity: 0` and
   paints an SVG over it. `salla-user-menu` exposes no slot for the trigger, so there is
   no clean fix — it is documented as a known liability. If Salla renames
   `.s-user-menu-trigger`, the account button goes invisible.
3. **`form.scss` targets `div.absolute`**, a Tailwind utility used as a structural hook.
   The build expands that one selector into 113 rules. It is pre-existing and harmless
   today, but it is dead weight in every page load and worth unpicking.

---

## The loop, in one place

1. State what you want changed.
2. Ask what would prove it worked. Build that first if it does not exist.
3. Take a baseline measurement.
4. Make the change.
5. Diff against the baseline and justify every difference.
6. Commit with the reasoning and the numbers in the message.
7. Lower the ratchet.

Step 2 is the one everybody skips, and it is the one that decides everything else.
