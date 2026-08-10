<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.0.1
- Amendment rationale: Owner-approved correction after direct clarification from Salla Support
  that public-theme size is evaluated on the compressed distributable theme package excluding
  node_modules, not on raw public/ bytes.
- Modified principles:
  - V. Performance, Bundle Size, and Accessibility Are Release Gates (corrected publishing-size
    measurement, separated package compliance from build/runtime telemetry, changed the internal
    compressed-package target from 85% to 95%, and prohibited feature removal driven solely by the
    superseded raw-byte model)
- Added sections: None
- Removed sections: None
- Migration impact: HDL-05 Spec, Plan, Tasks, bundle configuration/checker/tests/CI, agent guidance,
  project status, historical-evidence labels, and C1 Safelist follow-ups require synchronization.
- Deferred items: Salla's exact server-side package manifest remains an engineering certainty issue
  for HDL-05; it does not change the confirmed compressed-package measurement rule.
-->

# Hadeel Theme Constitution

## Core Principles

### I. Conversion First, Merchant Freedom Second, Visual Polish Third

Every product, design, and engineering decision MUST use this priority order:

1. Improve customer clarity, purchase completion, and merchant revenue potential.
2. Give merchants meaningful customization and the ability to create visibly different stores.
3. Add visual polish, motion, and delight without harming the first two priorities.

A feature MUST NOT obscure price, availability, product options, primary actions, navigation,
or checkout progression for decorative reasons. Merchant settings MUST present safe, useful
basic controls first and place granular controls behind clearly named advanced options. Every
new option MUST solve a real merchant or customer use case; options MUST NOT be added merely
to increase the apparent feature count.

### II. One Salla-Native Theme, One Shared Core

Hadeel MUST remain one public Salla Twilight theme with one shared implementation for global
behaviors such as navigation, search, cart, product cards, product purchasing, localization,
and responsive behavior. Presets and visual personalities MUST reuse that core rather than
forking it into separate themes or duplicated implementations.

Visual configuration MUST live inside the theme through `twilight.json`, Twig templates,
styles, page scripts, and component fields. A separate Salla app MAY be introduced only when
a requirement genuinely needs external data, server-side processing, OAuth/API access,
recurring billing, advanced analytics, experimentation, or another capability that cannot be
reliably delivered by a storefront theme. An app MUST NOT be required for ordinary visual
customization.

Documented Salla/Twilight APIs and `salla-*` components MUST be preferred over custom
reimplementations. Any platform behavior that is not confirmed by official documentation,
installed package APIs, or a rendered-storefront spike MUST be marked as a feasibility spike;
it MUST NOT be treated as an implementation fact.

### III. Components by Responsibility, Variants by Presentation

A merchant-facing component MUST be defined by its purpose, content model, and behavior—not
by a cosmetic layout name. When multiple designs use substantially the same data and behavior,
they MUST be implemented as variants of one component. A separate component is justified only
when its purpose, required data, interaction model, or lifecycle differs materially.

Internal Twig partials, style modules, and scripts MAY be split for maintainability, but they
MUST share contracts and tokens. Presets MUST be composed from design tokens, defaults, body
classes, CSS variables, and reusable variants. They MUST NOT be implemented by copying complete
Twig, CSS, or JavaScript trees.

Global settings belong in theme settings; content and layout controls that apply to one section
belong in that component's fields. Related advanced fields MUST be conditionally revealed where
Salla supports it. Each setting ID MUST have one clear meaning and one documented owner.

### IV. Mobile-First, Arabic-First, Complete RTL/LTR Parity

Every customer-facing feature MUST be designed and accepted on mobile before desktop. Desktop
enhancements MUST NOT compensate for a weak mobile flow. Important components MUST provide
mobile-specific controls when column count, size, spacing, order, visibility, or interaction
needs genuinely differ from desktop.

Arabic and RTL are first-class requirements, not later adaptations. Every feature MUST work in
Arabic/RTL and English/LTR, including icon direction, drawers, sliders, menus, text alignment,
long labels, product options, price presentation, and keyboard/focus order. Language and
direction MUST come from Salla's localization/runtime facilities; custom language detection is
forbidden.

Typography controls MUST be safe for Arabic. Hadeel MUST use Salla's merchant font selection as
the primary font source. Font size, supported weight, and line height MAY be configurable within
safe ranges. Letter spacing MUST NOT be a default Arabic control and MUST never break Arabic
joining or readability.

### V. Performance, Bundle Size, and Accessibility Are Release Gates

Performance is a feature and a hard release gate. Every plan MUST state its expected effect on
bundle size, network requests, rendering, and interaction latency. Publishing compliance MUST use
Salla's actual measurement method for the distributable theme artifact. Under the rule confirmed
directly by Salla Support on 2026-08-10, public-theme size is evaluated on the compressed theme
package excluding `node_modules`. Hadeel's internal compressed-package target is 95% of Salla's
current public-theme compressed hard cap. A package above that internal target but within Salla's
hard cap remains publishable and MUST produce a headroom warning rather than a publishing failure.

Raw build size, gzip size, CSS and JavaScript size, per-asset growth, network transfer, request
patterns, rendering cost, Lighthouse results, and Core Web Vitals remain independent engineering
measurements. None may be substituted for Salla's compressed publishing-size measurement, and
passing package compliance MUST NOT excuse a runtime-performance regression. Bundle compliance and
runtime performance are independent release gates.

No supported feature, merchant-facing capability, Salla/Twilight state, compatibility selector,
Loyalty state, Cart state, or required Safelist coverage may be removed solely to satisfy an
incorrectly modeled raw-byte publishing limit. When a Salla platform constraint materially affects
a release gate, the authoritative project contract MUST be corrected before downstream Specs,
plans, tasks, or implementation continue using it.

New dependencies MUST be rejected unless their measurable value exceeds their bundle, runtime,
maintenance, and security cost. Existing platform components and small local implementations
MUST be preferred. Demo media MUST NOT be bundled with production assets. Page-specific behavior
MUST be loaded only where needed, and expensive content MUST be lazy-loaded where appropriate.
Per-product network request patterns are forbidden when data can be included, batched, or fetched
once.

Every release MUST meet Salla's current published Lighthouse performance and accessibility
minimums on the required pages and devices. Hadeel SHOULD target an average performance score of
at least 75 and accessibility score of at least 95 when platform behavior does not prevent it.
No accepted feature may create a material regression without explicit owner approval and a
tracked remediation task.

### VI. Evidence Over Assumptions

A task description, agent claim, old screenshot, mock-up, or code-only reading is not proof of
storefront behavior. Claims MUST be verified against the current repository, documented platform
behavior, and—when visual or behavioral—the rendered Salla storefront.

Figma is the approved visual-intent reference. GitHub is the code source of truth. A rendered
Salla preview is the acceptance environment. A visual or behavioral change is not done until a
production build and repository guard pass, and evidence captured after the change confirms the
relevant behavior. When Salla preview tooling is unreliable, the owner may start the preview
manually and provide its URL to the coding agent; this does not weaken the evidence requirement.

Any deliberate deviation from Figma MUST be documented with the platform, accessibility,
performance, responsiveness, or product reason and approved by the owner. Standalone HTML
mock-ups MAY support exploration but MUST NOT be cited as evidence that the actual theme works.

### VII. Preserve, Audit, Then Improve

Before implementing a requirement, the agent MUST inspect the existing code and classify the
work as one of:

- **Existing — Audit & Polish**: the capability exists and needs verification or refinement.
- **Build**: the capability is absent and feasible.
- **Spike**: feasibility or platform behavior is unconfirmed.
- **Deferred**: the capability is intentionally outside the current release.

Working functionality MUST NOT be rewritten merely to match a new specification structure.
Reuse, simplification, and removal of duplication are preferred over parallel layers and
override stacks. A change MUST have one primary reason; dependency upgrades, unrelated cleanup,
and broad refactors MUST be separate work unless the approved plan proves they are inseparable.

Generated build output MUST never be hand-edited. Source files are changed first, then production
assets are rebuilt and committed according to the repository working agreement. Existing
regressions MUST NOT increase, and new work MUST NOT hide pre-existing failures behind broader
exceptions.

### VIII. Independent Identity, Trustworthy Commerce, and Secure Defaults

Kalles 5 is a product, interaction, and configurability reference—not a source to copy. Hadeel
MUST NOT copy proprietary Kalles code, assets, text, demo content, or brand identity. Hadeel MUST
also remain substantively and visibly distinct from Salla Theme Raed and other marketplace
themes, with a coherent identity across home, product, collection, search, cart, content, and
customer pages.

Conversion features MUST preserve customer trust. Data presented as live, recent, scarce, or
behavioral MUST be real and sourced from an available system. Simulated data is allowed only in
clearly identified demo or preview contexts. The production theme MUST NOT fabricate customer
activity or present generated numbers as factual behavior.

User-facing strings MUST be localized through `src/locales/ar.json` and `src/locales/en.json`.
Unsafe raw rendering, merchant-supplied custom HTML, embedded secrets, and unreviewed third-party
scripts are forbidden. Inputs and URLs MUST be handled defensively, and security-relevant
platform rules in the repository documentation MUST be followed.

## Product and Platform Constraints

- Hadeel is a general-purpose Salla marketplace theme optimized for Arabic commerce while fully
  supporting English.
- The launch product is one theme with four polished visual presets. Presets communicate suitable
  use cases but MUST remain adaptable to other store categories.
- One launch demo SHOULD demonstrate digital subscriptions, electronic cards, codes, and other
  digital products without making the preset exclusive to that category.
- Hadeel is inspired by Kalles 5's breadth of options and layout variety, but all behavior MUST be
  adapted to Salla/Twilight capabilities and Hadeel's independent identity.
- Basic settings MUST be understandable to a non-technical merchant. Advanced settings MUST be
  grouped and conditionally revealed rather than mixed into the primary flow.
- Features that need an external app or component bundle MUST be optional extensions; the base
  theme MUST remain complete and commercially useful without them.
- Detailed counts of headers, cards, product layouts, sections, and other feature inventory belong
  in the Product Blueprint and feature specifications. They are not constitutional rules.

## Development Workflow and Quality Gates

Every non-trivial feature MUST follow this sequence:

1. **Read context**: read this constitution, `AGENTS.md`, the relevant repository documentation,
   the current implementation, and the approved Figma/Kalles references.
2. **Establish a baseline**: identify existing behavior, affected files, current build/check
   status, and valid post-change evidence.
3. **Confirm feasibility**: use official Salla documentation, installed Twilight APIs, or a small
   storefront spike. Record unknowns instead of guessing.
4. **Specify**: define user stories, merchant controls, acceptance criteria, out-of-scope items,
   mobile/desktop behavior, RTL/LTR behavior, and the work classification.
5. **Clarify**: resolve material ambiguity before technical planning.
6. **Plan**: pass a Constitution Check; document architecture, reuse, bundle/network impact,
   accessibility, localization, test coverage, and rollback considerations.
7. **Implement in an isolated branch**: keep commits focused and do not mix unrelated work.
8. **Run repository gates**:
   - `npx webpack --mode production`
   - `node scripts/check-theme.mjs --build`
   - Any feature-specific automated checks defined by the plan
9. **Verify on the rendered Salla storefront**: test relevant pages on mobile and desktop,
   Arabic RTL and English LTR, and applicable browsers. Capture evidence created after the change.
10. **Obtain owner acceptance**: the owner confirms the intended product behavior and visual
    result before the feature is treated as complete or released.

Release development MUST be incremental: a private alpha proves one complete preset and the
shared core; a private beta expands coverage and real-store testing; public V1 ships only when
all four promised presets and the shared core are polished. Features MAY be deferred to later
releases, but unfinished controls or knowingly broken variants MUST NOT be exposed as public V1
functionality.

## Governance

This constitution is the highest project-level authority for product and engineering decisions.
When instructions conflict, precedence is:

1. This constitution.
2. An owner-approved feature specification and recorded clarifications.
3. The approved implementation plan.
4. Generated tasks.
5. Ad-hoc agent instructions.

`AGENTS.md` remains the operational working agreement and MAY impose stricter
repository-specific rules, but it MUST NOT weaken or contradict this constitution. The owner,
Yasser, is the final product authority and approves constitutional amendments, intentional
exceptions, and public release readiness.

Every amendment MUST include its rationale, affected principles or sections, expected migration
impact, and any follow-up work. Constitution versions follow semantic versioning:

- **MAJOR**: a principle is removed or redefined incompatibly.
- **MINOR**: a new principle is added or an existing principle is materially expanded.
- **PATCH**: wording is clarified without changing obligations.

Any temporary exception MUST be recorded in the relevant plan under Constitution Exception,
with its owner, reason, scope, expiry condition, and remediation task. Pull requests and release
reviews MUST verify constitutional compliance. The constitution MUST be reviewed before every
public major release and whenever Salla changes a platform constraint that affects a principle
or release gate.

**Version**: 1.0.1 | **Ratified**: 2026-08-08 | **Last Amended**: 2026-08-10
