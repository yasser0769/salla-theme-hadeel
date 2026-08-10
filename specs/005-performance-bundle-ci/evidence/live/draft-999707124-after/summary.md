# HDL-05 post-C1/C5 comparison capture — draft 999707124

- Captured: 2026-08-10 12:34–12:38 +03
- Owner-confirmed branch: `codex/preview-hdl-05-20260810`
- Proven preview SHA before browser open: `a9e9ab0c11eeafe1bf0024b8aad2342eef4ec3b9`
- Owner-confirmed draft: `999707124`
- Store: `dev-f5vbpgh2dnmmvhzp` (`اختيارات ياسر`)
- Browser: Chrome; 390×844 Arabic mobile and 1366×768 English desktop

## Identity

The published draft `app.css` was downloaded through Chrome and matched both the primary and preview
worktree production file exactly: 648,682 bytes, SHA-256
`6f54a8213fc13066b8ca4e1cd1e50b989439c260ce8617591f7458c2af75b48b`.

The CLI was run only inside the temporary after worktree with `--browser chrome`; it created draft
`50585072` instead of owner-confirmed draft `999707124`. This is a **SALLA PREVIEW SYNC FAILURE**, not
a code failure. The confirmed draft was rebound to the proven worktree's localhost server. The live
body class `salla-draft-999707124` and six localhost theme assets proved draft/source identity.

## Bilingual post-change network

English home at 1366×768 rendered `lang=en`, `dir=ltr`, 15 products, and no overflow. Arabic home at
390×844 rendered `lang=ar`, `dir=rtl`, the same 15 products, and no overflow. Each cold/cache-disabled
capture loaded the same six theme-local URLs totaling 1,491,006 encoded bytes; all returned 200. The
development `app.css` was 832,933 encoded bytes in both languages.

The earlier proven Arabic baseline on the same store/different owner-confirmed baseline draft loaded
the same six local URLs totaling 1,686,422 encoded bytes, including baseline development `app.css` at
1,028,350 bytes. The 195,416-byte local saving equals the 195,417-byte CSS response reduction plus
the one-byte `add-product-toast.js` increase. This Arabic comparison is same store, route class,
viewport, product count, local-server build mode, and cache policy.

Genuine English **before** evidence is still missing because English was enabled only after the
baseline capture. No Arabic-as-English or cross-store row is claimed.

## Same product list at two counts

On the same English home route and the same `Latest Products` list, the visible `Load more` control
increased the list from 15 to 16 unique product IDs. The interaction emitted six responses / 35,388
encoded bytes: product API/preflight, a single new product image, ticketing assets, and Salla
telemetry. It emitted **zero theme-local responses and zero theme-local bytes**. No catalogue data was
mutated, and the page remained overflow-free. See `same-list-two-counts.json`.

This closes the strict two-count request-scaling blocker with an actual rendered product-list state
transition. T012 remains open only for the genuine English baseline network capture.
