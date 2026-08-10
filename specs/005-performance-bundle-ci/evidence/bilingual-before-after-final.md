# HDL-05 Home-only bilingual before/after network comparison

All rows use the same Salla store (`dev-f5vbpgh2dnmmvhzp`), Home route, 15 rendered products, Chrome,
the localhost development server, cache disabled, and no throttling. Draft IDs differ because Salla
creates a draft per branch; each row proves its own owner-confirmed draft plus branch/SHA and local
asset origin.

| Language | Viewport | Baseline draft / SHA | After draft / SHA | Local requests | Baseline local bytes | After local bytes | Delta |
|---|---:|---|---|---:|---:|---:|---:|
| Arabic RTL | 390×844 | `77842079` / `86c53092…` | `999707124` / `a9e9ab0c…` | 6 → 6 | 1,686,422 | 1,491,006 | −195,416 |
| English LTR | 1366×768 | `1779563474` / `86c53092…` | `999707124` / `a9e9ab0c…` | 6 → 6 | 1,686,422 | 1,491,006 | −195,416 |

The request set is identical in both languages and both builds: `app.css`, `product-card.js`,
`app.js`, `main-menu.js`, `add-product-toast.js`, and `home.js`. The development CSS response falls
from 1,028,350 to 832,933 bytes (−195,417); `add-product-toast.js` increases by one byte for the
approved `.png` → `.webp` fallback literal; all other local response sizes are unchanged. Net local
saving is therefore 195,416 bytes. External Salla/CDN/telemetry totals are not used to attribute the
theme saving because they varied independently between captures.

Both Arabic and English retained the expected direction, 15 products, and zero horizontal overflow.
The post-change same-list transition from 15 to 16 products emitted zero theme-local requests and is
recorded in `live/draft-999707124-after/same-list-two-counts.json`.

Evidence sources:

- Arabic baseline: `live/draft-77842079-baseline/`
- English baseline: `live/draft-1779563474-baseline/`
- Arabic/English after and same-list two-count: `live/draft-999707124-after/`

This closes only the Home portion of the bilingual comparison. It does **not** close HDL-05 T012:
Product and Collection still need saved before/after network captures in both required locale/viewport
rows, and FR-004 still needs two rendered product counts on one actual Collection route. The Home
`Latest Products` 15 → 16 transition is supplemental evidence only. Separately recorded
Lighthouse/CWV, authenticated Loyalty, customer/account, and integrated fallback rows remain owned by
the follow-up register and HDL-29 release gate.
