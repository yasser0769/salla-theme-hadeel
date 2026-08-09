# HDL-03 engine-off evidence — draft 778615066, persisted legacy state

- Date (UTC): 2026-08-09T08:06:55Z–08:35Z
- Draft `draft-778615066` · version `192045281` · source SHA `fcbbda542b1b8dcc6747202ae616af32f4f66b1c` (localhost:8000/8001)
- Store `1736483913` / `dev-v37bn5qobfotqowz`
- Persisted state (proven by observed POST 200 + post-save reload): engine OFF; `layout_width=compact`, `section_spacing=spacious`, `corner_style=rounded`, `product_card_style=elevated`, `header_layout=start`, `header_density=compact`
- Save observation: `POST https://api.salla.dev/admin/v2/design/settings?version_id=192045281` → HTTP 200, `{"success":true,"message":"Theme settings saved successfully"}` (request payload not exposed by capture tool; sent values proven by pre-save FormData + this persisted reload state)
- Batch after save was READ-ONLY (no setting changes, no Publish)

## Editor artifacts

| Artifact | Verdict | Shows |
|---|---|---|
| `editor-engine-off-legacy-values-20260809T080655Z.png` | PASS | legacy fields: مضغوط-1200 (compact), مريحة (spacious), استدارة واضحة (rounded), بارز بظل (elevated) |
| `editor-engine-off-presets-group-20260809T080655Z.png` | PASS | group title + engine toggle OFF + inline explainer; profile/mode controls absent; next group visible; header layout «الشعار في بداية الصف» (start) |
| `editor-persisted-engine-off-20260809T080655Z.json` | PASS | full persisted state machine-readable, zero has-error |

## Storefront home (engine off) — every capture: `salla-draft-778615066` ✓, 6 localhost:8000 assets ✓, no `hadeel-preset-*` class ✓, no `data-hadeel-preset*` attrs ✓, exact six classes `hadeel-layout-compact / hadeel-spacing-spacious / hadeel-corners-rounded / hadeel-card-elevated / hadeel-header-start / hadeel-header-density-compact` ✓, scrollWidth==innerWidth==requested ✓, 15 hydrated product cards with prices/CTAs ✓

| Artifact | Verdict | Viewport | lang/dir |
|---|---|---|---|
| `home-engine-off-en-ltr-1366x768-20260809T080655Z.{png,json}` | PASS | 1366×768 dsf 1 | en/ltr |
| `home-engine-off-en-ltr-320x800-20260809T080655Z.{png,json}` | PASS | 320×800 dsf 2 | en/ltr |
| `home-engine-off-ar-rtl-320x800-20260809T080655Z.{png,json}` | PASS | 320×800 dsf 2 | ar/rtl |
| `home-engine-off-ar-rtl-1366x768-20260809T080655Z.{png,json}` | PASS | 1366×768 dsf 1 | ar/rtl |

Visual delta vs engine-on confirmed in PNGs: header logo at start edge, elevated+rounded cards, compact container.

## Product page (engine off), requested 320×800

| Artifact | Verdict | Notes |
|---|---|---|
| `product-engine-off-en-ltr-320x800-20260809T080655Z.{png,json}` | PASS with overflow FAIL caveat | draft ✓, 9 localhost assets ✓, price "174 / 349 / Save 175 AED" ✓, `salla-add-product-button` visible ("Add to cart", 266×48) ✓. **scrollWidth=401 > 320 → horizontal overflow at 320** |
| `product-engine-off-ar-rtl-320x800-20260809T080655Z.json` + `product-engine-off-ar-rtl-320x800-v2-20260809T080655Z.png` | PASS with overflow FAIL caveat | ar/rtl ✓, price "١٧٤ د.إ" ✓, button «إضافة للسلة» visible ✓ (needed settle+scrollIntoView on first paint). **scrollWidth=401 > 320 → overflow**, visually confirmed by right-edge clipping in v2 PNG |

**Overflow root cause (observed):** empty track DIVs at fixed `width:340px` inside `.details-slider.image-slider` force the mobile visual viewport to expand to 401px; fixed bars (`.sticky-product-bar`, `.mobile-toolbar`) inherit the expanded width. Home pages do NOT overflow (scrollWidth=320 exactly). JSON `no_horizontal_overflow` reads `true` only because it compares against the already-expanded viewport — the explicit `overflow_320_verdict` field records FAIL.

## Keyboard focus sequence (EN, 320×800, home [+product planned])

| Artifact | Verdict |
|---|---|
| `keyboard-tab-focus-en-ltr-320x800-FAILED-20260809T080655Z.{png,json}` | **FAIL (environment, not theme)** — 16 trusted CDP `Input.dispatchKeyEvent` Tab dispatches (rawKeyDown/keyUp + keyDown/nativeVirtualKeyCode variants, after Page.bringToFront); `document.activeElement` never left BODY. CDP keyboard does not reach page targets in this WebBridge setup (same on editor tab); CDP pointer works. Not faked; product-page sequence not attempted. |

## Caveats

1. Product-list hydration in standalone preview takes 60–120s; all accepted home captures were re-measured post-hydration (15 cards). First AR-320 measure recorded 0 cards before hydration — superseded.
2. First AR product PNG captured a home page (tab drifted back via preview session behavior); deleted; replaced by `-v2` PNG taken on the re-navigated product page.
3. `salla-add-product-button` count is 0 on home (card CTAs are custom buttons), 1 and visible on product pages.
4. Editor-embedded preview iframe renders partially unstyled at times (localhost CSS timing in iframe); accepted storefront evidence is the standalone watch tab.
