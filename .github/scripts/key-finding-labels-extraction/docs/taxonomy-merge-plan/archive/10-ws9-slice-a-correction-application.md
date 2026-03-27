# WS9-Slice-A: Correction Application Engine

## Goal
Apply reviewed corrections (`add|remove|replace`) deterministically to enrichment outputs by `finding_uid`.

## Implemented Scope
- Added correction engine:
  - `.github/scripts/key-finding-labels-extraction/correction-application.js`
- Added CLI mode:
  - `--correction-application-mode=off|apply` (default `off`)
- Wired correction summary fields into extraction summary output:
  - `correction_application_mode`
  - `correction_application_enabled`
  - `corrections_applied`
  - `corrections_ignored`
  - `correction_findings_touched`
- Added correction artifact:
  - `key-finding-labels-extraction-correction-application.json`
- Added tests:
  - `__tests__/correction-application.test.js`
  - integration test updated for correction artifact presence

## Determinism Notes
- Corrections are applied in stable sorted order (finding, dimension, action, label, input index).
- Label arrays are re-sorted by confidence desc then label asc after each mutation.
- Existing enrichment artifact remains unchanged; corrected result is emitted via correction artifact.

## Acceptance Check
- Supports `add`, `remove`, and `replace` actions.
- Missing findings/labels produce ignored entries with explicit reasons.
- Re-running with identical inputs yields identical corrected output shape/content.
