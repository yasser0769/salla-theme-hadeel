# T007 — Editor contract: conditions, companion defaults, option churn, hidden values

**Result: CONCLUDED SPIKE — 3/4 behaviors live-tested; option churn not relied on**

**Captured at**: 2026-08-08 21:10–21:18 UTC  
**Preview branch**: `codex/preview-hdl-03-20260808` at `e40b0cf064ac36f97e3bb93e03fdefaa5b3d1968`  
**Store/draft**: existing configured `Demo_5`, draft `797574311`, version `100468810`

## Identity and sync

The owner confirmed the preview branch in Partners Portal before browser
access. The owner-provided signed storefront rendered both
`salla-draft-797574311` and `#hdl03-spike-settings`, so these tests are not
evidence from a stale CLI draft. Earlier CLI-generated drafts that omitted the
marker remain classified as `SALLA PREVIEW SYNC FAILURE` and were not used.

## 1. Exact global equality condition — PASS

The fixture reused the existing supported shape exactly:

```json
{
  "id": "hdl03_spike_bool_true",
  "operation": "=",
  "value": true
}
```

With Boolean true on, the conditioned String was present. Switching it off
removed both the label and input from the editor DOM. Switching it on restored
the field. No custom editor script or storefront code implemented this.

## 2. Companion-mode default — PASS with migration caveat

Before first save, the editor displayed `follow_preset`, matching the declared
`selected` option. The signed storefront simultaneously returned `null` from
`theme.settings.get('hdl03_spike_mode')`. After explicitly selecting Custom,
saving, and reloading, the editor retained Custom and Twig returned the scalar
string `"custom"`.

The declared mode default is therefore an editor presentation default on the
pre-schema draft, not proof of a stored/enrolled value. Dormancy behind
`preset_engine_enabled=false` remains mandatory.

## 3. Added/removed Items options — NOT VERIFIED

The live editor rendered options A, B, and C and persisted an explicit switch
from A to B. A second schema revision that removes/re-adds the selected option
was not yet confirmed/rendered, so option-removal fallback behavior is not
claimed. HDL-03 does not change any existing legacy option list, and runtime
resolution must reject unknown values through its allowlist.

## 4. Hidden-value persistence — PASS

The conditioned String was saved as `hdl03_spike_hidden_persisted`. After the
condition source was switched off:

- the hidden input was absent from the editor DOM;
- the next save request omitted `hdl03_spike_hidden_value` entirely;
- the settings endpoint still returned HTTP 200;
- the signed storefront continued to return the prior persisted value;
- after reload, switching the condition back on restored the field with
  `hdl03_spike_hidden_persisted` intact.

This proves that the exact tested equality condition preserves an already
saved hidden global value on this draft.

## Captured save contract

The editor submitted global settings to:

```text
POST https://api.salla.dev/admin/v2/design/settings?version_id=100468810
```

Both the full-value save and the hidden-field-omitted save returned HTTP 200.
No merchant-setting write API exists in theme code; persistence is owned by
Salla's native editor.

## Conclusion

Exact equality conditions, dormant companion defaults, and hidden-value
persistence are live-verified for the owner-confirmed draft. Option churn
remains **NOT VERIFIED** and is not relied upon: HDL-03 preserves every legacy
option list and rejects unknown values through an allowlist. The storefront
resolver remains correct even if editor visibility or future option migration
changes. This bounded result concludes T007 without claiming the untested
option-removal/re-addition behavior.
