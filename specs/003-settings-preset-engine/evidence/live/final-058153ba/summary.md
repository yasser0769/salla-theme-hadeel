# HDL-03 final-source live summary

**Preview branch**: `codex/preview-hdl-03-20260808`  
**Final-source SHA**: `058153baeca2351c023674c07ca7aac941505ff5`  
**Owner-confirmed draft**: `772906207`  
**Store**: `dev-v37bn5qobfotqowz`  
**Accepted root**: `smoke/`

The owner confirmed the temporary branch before browser access and supplied
the working editor draft. Local HEAD, upstream, and remote matched the exact
SHA. The only source change from the complete bilingual matrix SHA
`662eca99` is removal of the temporary migration-Spike fixture; the production
preset resolver and nine native editor fields are identical.

## Exact-source result

- English/LTR at `320×800` and `1366×768` rendered all four profiles with the
  six expected allowlisted classes and all sources marked `preset`.
- Luxury Custom → Modern after save/reload preserved the Custom corner; return
  of only that field to Follow restored the Modern profile value.
- Engine-disabled legacy mode emitted no preset class and preserved the stored
  legacy values.
- Every accepted storefront capture used six assets from `localhost:8000`.
- The temporary `hdl03` migration marker is absent from the final source.
- The editor was left enrolled in `modern` with all six fields following the
  preset.

## Commerce and responsive evidence

The product route kept price, product options, availability text, and the
primary CTA visible at desktop and mobile. Desktop had no horizontal overflow.
At `320px`, the product page measured `scrollWidth=401`; the same problem was
reproduced with the preset engine disabled in the earlier matrix, so it is an
inherited layout defect, not an HDL-03 regression. It still prevents an
unqualified PASS of absolute requirement HDL-03-FR-017.

## Preview synchronization

CLI draft `1548451294` did not expose a usable final-source watch route. The
owner-supplied draft `772906207` rendered the correct implementation. One
return-to-Follow attempt temporarily lost its draft and Hadeel classes; it was
excluded and successfully recaptured. Both events are recorded as
`SALLA PREVIEW SYNC FAILURE`, not code failures.

The latest direct editor inspection also showed `salla-draft-772906207`,
`hadeel-preset-modern`, the six expected class families, and English/LTR.
