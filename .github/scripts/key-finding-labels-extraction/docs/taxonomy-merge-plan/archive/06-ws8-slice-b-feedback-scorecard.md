# WS8-Slice-B: Recalibration and Report Hooks

## Goal
Add executable hooks so review corrections become measurable and automation-ready.

## Implemented Scope
- Added scorecard module:
  - `.github/scripts/key-finding-labels-extraction/feedback-scorecard.js`
- Added scorecard command:
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/generate-feedback-scorecard.js`
- Added scorecard unit test:
  - `__tests__/feedback-scorecard.test.js`
- Wired workflow step and artifact upload for:
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-feedback-scorecard.json`

## Scorecard Outputs
- `findings_scored`
- `findings_with_feedback`
- `correction_rate_vs_findings`
- `corrections_total`
- `corrections_by_action`
- `corrections_by_dimension`
- feedback ingestion error/warning counts

## Acceptance Check
- Scorecard script runs with missing files gracefully (writes zeroed metrics).
- Scorecard script runs with extraction outputs and writes deterministic JSON shape.
- Workflow publishes scorecard artifact on every run.
