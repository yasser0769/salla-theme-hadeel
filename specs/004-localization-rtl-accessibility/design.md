# Design Handoff: HDL-04 — Localization, RTL/LTR, and Accessibility

**Design gate type**: واجهة مرئية كاملة
**Status**: Revision 1 — Approved for Implementation
**Figma file**: https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled
**Figma page**: `01 · Cover` — reused HDL-02 approved system artifacts
**Design revision**: 1
**Design review model**: GPT-5.6 Sol High (Claude Opus 5 High unavailable at this safe boundary)
**Owner approval**: Approved — `APPROVE HDL-04 REV 1`

## Lean design decision

HDL-04 does not create a parallel QA board or rebuild HDL-02 foundations. Revision 1 reuses the
already approved HDL-02 Revision 2 artifacts because they are the exact visual contract required
here: Arabic/mobile first, four direction/device frames with identical content and state, logical
ordering, focus order, mixed-direction content, commerce prices, overlays, and mirroring rules.

Figma proves design intent only. DOM order, screen-reader names, contrast, reflow, Lighthouse,
runtime translations, and live Salla RTL/LTR parity remain implementation and storefront evidence.

## Approval nodes

| Review item | Device / direction / state | Node | Direct link |
|---|---|---|---|
| Complete parity matrix | Responsive / bidirectional / Revision 2 | `398:2` | [Open matrix](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-2) |
| Arabic mobile | 390px / RTL / same semantic state | `398:5` | [Open frame](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-5) |
| English mobile | 390px / LTR / same semantic state | `398:6` | [Open frame](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-6) |
| Arabic desktop | Desktop / RTL / same semantic state | `398:7` | [Open frame](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-7) |
| English desktop | Desktop / LTR / same semantic state | `398:8` | [Open frame](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-8) |
| What mirrors / does not / why | Direction QA | `398:9` | [Open rules](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-9) |
| State coverage matrix | Responsive / bidirectional | `391:96` | [Open coverage](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=391-96) |

## Reused shared state families

| Family | Covered states | Node |
|---|---|---|
| Button | Default, Hover, Focus, Disabled | [`384:37`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=384-37) |
| Form Control | Input/Select × Default, Focus, Error, Disabled × RTL/LTR | [`384:61`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=384-61) |
| Product Price | Regular, Sale, Sold-out, Free; bidi-isolated currency | [`386:15`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=386-15) |
| Product Card Skeleton | Loading, Default, Sold-out × RTL/LTR | [`386:49`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=386-49) |
| Overlay Shell | Drawer/Modal × RTL/LTR × Ready, Loading, Error | [`386:129`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=386-129) |
| Header Navigation | Mobile/Desktop × RTL/LTR × Default/Search open | [`389:61`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-61) |
| Tabs / Accordion | Default, Active, Focus, Disabled × RTL/LTR | [`389:105`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-105) |
| Feedback State | Loading, Empty, Error × RTL/LTR | [`389:137`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-137) |

## Approval review scope

- Same content and state in Arabic mobile RTL, English mobile LTR, Arabic desktop RTL, and English desktop LTR.
- Real item-order and alignment changes—not language replacement inside one unchanged layout.
- Logical start/end spacing; start-side Drawer/Menu; Breadcrumb/Back; Carousel/Previous/Next/Pagination.
- Directional icons mirror; logo, product media, photography, Search, Cart, Play, and Check do not.
- Button/Input/Select/Tab parity, `Focus/01…08`, and visible focus intent.
- Long and mixed Arabic/English runs, isolated price/currency/numbers/SKU/URL, and applicable loading/empty/error/disabled/sold-out states.
- No new merchant setting: Salla font selection remains primary; direction and bidi rules are fixed quality behavior.

## Design approval checklist

- [x] Mobile Arabic/RTL complete.
- [x] Desktop Arabic/RTL complete.
- [x] Critical English/LTR parity complete.
- [x] Loading, empty, error, disabled, sold-out, and long-content coverage recorded where applicable.
- [x] Focus order, directional behavior, and non-mirroring exceptions annotated.
- [x] Existing HDL-02 components and foundations reused; no parallel library or board created.
- [x] Runtime-only checks are not misrepresented as Figma evidence.
- [x] Owner wrote `APPROVE HDL-04 REV 1`.

## Approval

**Owner statement**: `APPROVE HDL-04 REV 1` — Approved for Implementation
**Approved by**: Yasser
**Date**: 2026-08-09
**Revision**: 1
