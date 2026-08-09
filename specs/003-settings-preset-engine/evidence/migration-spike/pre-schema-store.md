# T005 — Pre-schema configured-draft save/reload behavior

**Result: VERIFIED**

**Captured at**: 2026-08-08 21:10–21:18 UTC  
**Primary branch baseline**: `codex/hdl-03-settings-preset-engine` at `5deac563f21210529124c2c0a9101ab5befde4e1`  
**Isolated preview branch**: `codex/preview-hdl-03-20260808` at `e40b0cf064ac36f97e3bb93e03fdefaa5b3d1968`  
**Store/draft**: existing configured `Demo_5`, draft `797574311`, version `100468810`  
**Salla CLI**: 3.2.45; preview worktree only

## Branch and preview identity

Before browser access, the owner selected and confirmed
`codex/preview-hdl-03-20260808` in Partners Portal. Local HEAD, upstream, and
`git ls-remote` all resolved to `e40b0cf064ac36f97e3bb93e03fdefaa5b3d1968`.

The owner-provided signed storefront URL rendered body class
`salla-draft-797574311` and the commit-specific
`#hdl03-spike-settings` marker. This proves the capture came from the isolated
Spike branch rather than the installed Raed baseline. The legacy
`theme-raed` body class is platform/theme metadata and was not used as branch
evidence.

## Before first save

The configured store existed before the eight additive `hdl03_spike_*`
settings were introduced. On the first render, every new setting read through
`theme.settings.get()` returned `null`, including fields with declared
`value`/`selected` defaults:

| Field | Editor display before save | Twig marker before save |
|---|---|---|
| Boolean default true | on | `null` |
| Boolean default false | off | `null` |
| String with default | `hdl03_spike_default_text` | `null` |
| String unset | empty | `null` |
| Items choice | option A | `null` |
| Companion mode | `follow_preset` | `null` |
| Conditioned string | `hdl03_spike_hidden_default` | `null` |

An explicit Twig fallback was honored: the unset String returned
`"hdl03_spike_fb"`, and Boolean true with fallback `false` returned `false`.
Declared editor defaults therefore do not prove stored values on an upgraded
draft.

## Explicit save and reload

The actual editor sent:

```text
POST https://api.salla.dev/admin/v2/design/settings?version_id=100468810
HTTP 200
```

The captured request contained these distinctive values:

```json
{
  "hdl03_spike_bool_true": true,
  "hdl03_spike_bool_false": true,
  "hdl03_spike_string_default": "hdl03_spike_explicit_default",
  "hdl03_spike_string_unset": "hdl03_spike_explicit_unset",
  "hdl03_spike_items_choice": ["hdl03_spike_opt_b"],
  "hdl03_spike_mode": ["custom"],
  "hdl03_spike_hidden_value": "hdl03_spike_hidden_persisted"
}
```

After a full editor reload, both Booleans remained on, both Strings retained
their exact values, Items remained option B, mode remained Custom, and the
conditioned String retained its exact value.

The signed storefront then produced these Twig return shapes:

```json
{
  "boolean_true": true,
  "boolean_false_non_default": true,
  "string_default_explicit": "hdl03_spike_explicit_default",
  "string_unset_explicit": "hdl03_spike_explicit_unset",
  "items_single_choice": "hdl03_spike_opt_b",
  "companion_mode": "custom",
  "conditioned_string": "hdl03_spike_hidden_persisted"
}
```

The Items values are arrays in the editor save request but scalar strings from
`theme.settings.get()` in Twig.

## Conclusion

T005 is verified for an existing pre-schema configured draft. New declared
defaults are visible in the editor but remain absent at Twig runtime until the
draft is saved. This directly supports `preset_engine_enabled=false` as the
mandatory migration boundary: no implementation may treat a new Follow-mode
default as evidence that an upgraded merchant enrolled.
