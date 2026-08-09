# Verification Evidence Contract

Each accepted scenario must record:

- exact commit SHA and capture timestamp later than the relevant source change;
- signed Salla preview URL evidence with at least one `localhost:<CLI-reported-port>` asset (the accepted CLI 3.2.45 run reported `localhost:8000`);
- actual `<html lang>` and `dir`, viewport, DPR, and browser;
- resolved profile/source markers and exact allowlisted Hadeel body classes;
- price, availability, and primary CTA visibility on the product scenario;
- `document.documentElement.scrollWidth <= innerWidth` at 320px;
- paired screenshot and DOM JSON for the same saved/reloaded state;
- canonicalized network resource set with cache-busting query strings removed.

Required matrix:

| Scenario | Arabic RTL | English LTR | Mobile | Desktop |
|---|---:|---:|---:|---:|
| Engine disabled legacy parity | yes | yes | 320×800 | 1366×768 |
| Four profiles, all Follow | yes | yes | 320×800 | 1366×768 |
| One Custom, profile switch, save/reload | yes | yes | 320×800 | 1366×768 |
| Return only that field to Follow | yes | yes | 320×800 | 1366×768 |
| Invalid preset/mode/value fallback | critical pair | critical pair | 320×800 | 1366×768 |
| Price/availability/options/CTA | yes | yes | 320×800 | 1366×768 |

The HDL-03-attributable before/after network set difference must be empty. A demo-store URL, standalone HTML, stale artifact, or screenshot without corresponding DOM data is not evidence.
