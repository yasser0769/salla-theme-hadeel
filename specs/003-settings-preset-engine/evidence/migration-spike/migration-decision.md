# T008 — Search for a supported fresh-versus-existing marker

**Result: NO SUPPORTED MARKER FOUND / NOT VERIFIED**

**Captured at**: 2026-08-08 UTC
**Commit**: `5deac563f21210529124c2c0a9101ab5befde4e1` (branch `codex/hdl-03-settings-preset-engine`)

## Question

Does Salla expose any supported metadata that distinguishes a pre-existing
(configured) merchant draft from a fresh installation — e.g. an install-version
field, a stored-versus-default marker, a schema version, or a
setting-existence API? (research.md R-002; plan.md Feasibility row
"Can the theme distinguish old and new installations…")

## Evidence searched

1. **Captured CLI/platform state in this session** (exact commands):

   ```bash
   salla --version          # 3.2.45
   salla theme list         # 1 theme: ID 224400990 "Hadeel" (development)
   salla store list         # 10 demo stores (names/URLs; IDs truncated by CLI)
   salla theme preview --store Demo_5 --without-editor --only-link
   ```

   The preview attempt exposed only the pre-flight checks (`twilight.json`
   found, GitHub linked, theme ID exists, folder linked) and a commit gate. It
   surfaced **no** install-age, stored-vs-default, or schema-version metadata.
   No signed preview URL or rendered draft state was captured, because the
   session was blocked at the commit gate (see `pre-schema-store.md`).

2. **Local platform reference** (`docs/salla-twilight-notes.md` §4 and plan.md
   Feasibility table, both predating and unchanged by this session):

   - `theme.settings.get(id, fallback)` is a render-time read; its fallback is
     not migration metadata.
   - `theme.settings.set()` is an in-render global-variable helper in pinned
     Twilight/Raed source — not a persistence API and not a marker.
   - No install-version or stored-vs-default API is documented locally or in
     the official docs referenced by research.md R-002
     (docs.salla.dev Twilight JSON and theme-setup pages).

3. **Public docs**: as recorded in plan.md/research.md (verified during Phase 0
   planning on 2026-08-08): no official Salla documentation of an
   installation-age, stored-versus-default, schema-version, or
   setting-existence API was found. No new doc evidence was retrievable in this
   session beyond that record, and none was observed in captured CLI state.

## Evidence-backed conclusion

**No supported fresh-versus-existing marker was verified from public
documentation or from any captured platform state in this session.** The theme
cannot distinguish "merchant values saved before the HDL-03 schema" from
"fresh-install defaults" through any documented or observed API. This result is
consistent with, and does not go beyond, plan.md: "Not confirmed … explicit
opt-in enable switch defaults off."

Consequence (binding for T009 and all later phases): automatic migration is
prohibited; `preset_engine_enabled=false` is the mandatory compatibility
boundary. Nothing in this file infers platform behavior beyond the cited
evidence.

## Isolated-preview follow-up evidence

The owner-authorized temporary branch `codex/preview-hdl-03-20260808` was verified locally and remotely at `e40b0cf064ac36f97e3bb93e03fdefaa5b3d1968`. Its SHA-specific Twig marker did not appear in the Chrome preview; the storefront instead rendered body class `theme-raed` with no localhost resources. This is recorded as `SALLA PREVIEW SYNC FAILURE`, not as evidence for an installation marker. The negative platform/API conclusion and disabled-by-default compatibility boundary remain unchanged.
