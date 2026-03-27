# WS9 Plan: Correction Application and Recalibration

## Aim
Apply reviewed corrections to produce measurable classifier improvements while preserving deterministic, versioned outputs.

## WS9-Slice-A: Correction Application Engine
- Scope:
  - Add module to apply feedback corrections onto enrichment suggestions by `finding_uid`.
  - Track before/after label changes per finding and dimension.
- Proposed files:
  - `.github/scripts/key-finding-labels-extraction/correction-application.js`
  - `.github/scripts/key-finding-labels-extraction/__tests__/correction-application.test.js`
- Acceptance:
  - Supports `add|remove|replace` correction actions.
  - Emits deterministic corrected label state for the same input artifacts.

## WS9-Slice-B: Recalibration Dataset Export
- Scope:
  - Export training/eval-ready JSONL from corrected findings and classifier outputs.
  - Include metadata for profile/version/source and correction provenance.
- Proposed files:
  - `.github/scripts/key-finding-labels-extraction/recalibration-export.js`
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/generate-recalibration-dataset.js`
  - `.github/scripts/key-finding-labels-extraction/__tests__/recalibration-export.test.js`
- Acceptance:
  - Schema-documented export with deterministic row ordering.
  - Can be generated from existing workflow artifacts only.

## WS9-Slice-C: Regression and Trend Gates
- Scope:
  - Add comparison command for current vs previous recalibration dataset/metrics.
  - Gate on configured precision/recall trendline thresholds per dimension.
- Proposed files:
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/check-recalibration-trends.js`
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/recalibration-thresholds.json`
- Acceptance:
  - Reports pass/fail with clear dimension-level deltas.
  - Pluggable into workflow as blocking or warning mode.

## Non-Negotiables
- Do not mutate raw ingestion artifacts.
- All corrected/recalibrated outputs must be versioned.
- Maintain compatibility with existing legacy adapter emissions.
