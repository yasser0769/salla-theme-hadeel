# T058 — Final traceability

Figma Revision 1 is owner-approved (`APPROVE HDL-03 REV 1`). The implementation is not owner-accepted yet.

| Contract | Tasks/tests | Figma | Source | Evidence |
|---|---|---|---|---|
| FR-001 Basic before Advanced | T021–T022, T026 | `418:65` | `twilight.json` | `tests/us1.md`, live editor drafts 1328326277 and 772906207 |
| FR-002–004 one core, four profiles, complete maps | T010–T020 | `418:66` | `src/config/settings-registry.json`, `master.twig` | `automated.md`, `profiles/` |
| FR-005–007 Follow/Custom persistence and scoped return | T027–T032 | `422:80`, `422:101`, `422:129`, `425:3` | `twilight.json`, `master.twig` | `custom-switch/`, `return-follow/`, `tests/us2.md` |
| FR-008–011 complete scoped bilingual registry and stable IDs | T010–T017, T039–T044 | `418:65` | registry + strict checker | `contracts/foundation.md`, `tests/us4.md`, `automated.md` |
| FR-012 fail-safe + Needs Review | T033–T038 plus Final Review regression tests | `418:70` | `master.twig` | `tests/us3.md`, 48-test final run |
| FR-013 no runtime app/request | T020, T031, T047, T054 | `418:70` | server-rendered Twig only | `bundle-network.md` |
| FR-014 content/order unchanged | T020, T050–T051 | `418:66` | profile maps own six settings only | identical-content live captures |
| FR-015–016 owned settings and class allowlist | T013–T016, T039–T043 | `418:65`, `418:70` | registry/checker/Twig | strict checker + invalid witness |
| FR-017 commerce/320 no-regression | T048, T050, T053, T056 | critical-path nodes | no CSS/JS delta | home pass; commerce visible; product overflow identical engine on/off but the absolute 320px acceptance condition remains open |

Story coverage: US1 = tests T018–T020 plus the four-profile live bilingual
matrix; US2 = T027–T032 plus Luxury → Modern Custom and return-to-Follow in
Arabic and English; US3 = T033–T038 plus live engine-off rollback; US4 =
T039–T044 plus the strict final guard. Exact final-source English smoke at
`058153ba` covers the four profiles, Custom persistence, return to Follow,
legacy mode, and product commerce after removal of the temporary Spike.

T006 is complete as a fresh-draft before/after-first-save capture, explicitly
not a fresh-install claim. T007 is complete as a concluded Spike: option
removal/re-addition is not verified and is not relied on. All 60 tasks now have
evidence or an explicit bounded result. Final Review still cannot PASS
HDL-03-FR-017 because the product route overflows at exact 320px; one English
mobile product-card image link was also focused fully off-screen. Owner
acceptance is pending.
