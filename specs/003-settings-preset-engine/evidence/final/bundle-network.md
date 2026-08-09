# T047/T054 — Bundle and network no-regression

Baseline: `5deac563f21210529124c2c0a9101ab5befde4e1`. Final preview source: temporary branch `codex/preview-hdl-03-20260808` at `662eca99d68c9a946b4ae241485571bc92a8ca93`.

## Bundle comparison

| Measure | Baseline | Final | Delta |
|---|---:|---:|---:|
| Public files | 33 | 33 | 0 |
| Public raw bytes | 1,557,969 | 1,557,969 | 0 |
| `app.css` raw | 802,732 | 802,732 | 0 |
| `app.css` SHA-256 | `e0660428…188fe0` | `e0660428…188fe0` | identical |
| `app.js` raw | 128,388 | 128,388 | 0 |
| `app.js` SHA-256 | `1aa5fbde…84247f` | `1aa5fbde…84247f` | identical |
| Normalized CSS rules | 6,839 | 6,839 | 0 |
| CSS snapshot bytes | 938,636 | 938,636 | 0 |
| CSS snapshot SHA-256 | `70e1bbbd…45b838` | `70e1bbbd…45b838` | identical |

Canonical `gzip -9 -n` sizes are 103,977 bytes for `app.css` and 36,869 bytes for `app.js`. The baseline manifest used gzip with filename/mtime headers (105,052 / 36,981), so raw SHA equality—not the non-deterministic header—is authoritative.

`git diff --name-only -- public src/assets webpack.config.js package.json pnpm-lock.yaml` returned no paths. Therefore dependencies, webpack entries/chunks, asset sources, and built output are unchanged.

## Live network comparison

Sixteen accepted home-route DOM captures (four profiles × mobile/desktop, Luxury/Modern Custom, return-to-Follow, and engine-off legacy) were canonicalized by removing query/fragment data. Relative to `profiles/ar-luxury-desktop-1366x768.json`, every capture had:

- `network_added: []`
- `network_removed: []`
- `local_added: []`
- `local_removed: []`

Every accepted home capture loaded exactly six local assets from CLI-reported port 8000: `product-card.js`, `main-menu.js`, `add-product-toast.js`, `app.css`, `app.js`, and `home.js`. The product route substituted `product.js` for `home.js`, as expected for the route; engine-on and engine-off product captures used the identical six-asset set.

Result: **PASS — zero HDL-03-attributable bundle or runtime network delta**.
