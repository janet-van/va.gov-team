# WS9-Slice-C: Recalibration Regression and Trend Gates

## Goal
Add executable trend checks for recalibration outputs with configurable blocking (`strict=true`) or warning (`strict=false`) behavior.

## Implemented Scope
- Added threshold policy:
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/recalibration-thresholds.json`
- Added trend check command:
  - `.github/scripts/key-finding-labels-extraction/cli/check-recalibration-trends.js`
- Added test:
  - `__tests__/recalibration-trend-check-script.test.js`
- Added workflow steps/artifacts:
  - Generate workflow-specific recalibration dataset + manifest.
  - Run recalibration trend check in warning mode.
  - Upload trend check artifact.

## Gate Inputs
- Baseline manifest (`latest-recalibration-dataset-manifest.json`)
- Current workflow manifest (`workflow-recalibration-dataset-manifest.json`)
- Threshold config (`recalibration-thresholds.json`)

## Gate Outputs
- `workflow-recalibration-trend-check.json` with:
  - pass/fail status
  - failed check counts
  - per-rule observations
  - required-dimension coverage check

## Acceptance Check
- Supports both warning and blocking mode through `--strict`.
- Reports deterministic JSON output schema.
- Fails only when configured thresholds are exceeded and strict mode is enabled.
