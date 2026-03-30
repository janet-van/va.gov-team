# WS9-Slice-B: Recalibration Dataset Export

## Goal
Export deterministic training/evaluation rows from existing workflow artifacts without mutating source outputs.

## Implemented Scope
- Added export module:
  - `.github/scripts/key-finding-labels-extraction/recalibration-export.js`
- Added export command:
  - `.github/scripts/key-finding-labels-extraction/cli/generate-recalibration-dataset.js`
- Added tests:
  - `__tests__/recalibration-export.test.js`
  - `__tests__/recalibration-dataset-script.test.js`
- Added workflow generation/upload of:
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset.jsonl`
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json`

## Row Contract (JSONL)
- `schema_version`
- `finding_uid`
- `finding_id_local`
- `taxonomy_profile`
- `taxonomy_profile_version`
- `source_file`
- `source_kind`
- `dimension`
- `input_text`
- `predicted_labels`
- `corrected_labels`
- `has_correction`
- `correction_actions`
- `correction_reasons`

## Acceptance Check
- Row ordering is deterministic (`finding_uid`, then `dimension`).
- Export can be generated from existing artifacts only.
- Manifest reports row totals, corrected row counts, and dimension coverage.
