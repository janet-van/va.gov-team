# WS9 Stabilization: Threshold Tuning and Mode Promotion

## Goal
Provide a concrete path to tune recalibration trend thresholds and promote trend checks from warning mode to blocking mode.

## Implemented Scope
- Added threshold tuning command:
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/tune-recalibration-thresholds.js`
- Added tuning command test:
  - `__tests__/tune-recalibration-thresholds-script.test.js`
- Updated workflow trend strictness from hardcoded value to env toggle:
  - `RECALIBRATION_TREND_STRICT` in workflow job env
  - trend check uses `--strict=${{ env.RECALIBRATION_TREND_STRICT }}`
- Refreshed representative recalibration baseline and tuned thresholds from non-zero manifest.
- Promoted workflow trend checks to blocking mode by setting:
  - `RECALIBRATION_TREND_STRICT: 'true'`

## Promotion Checklist
1. Generate representative non-zero recalibration manifest baseline.
2. Run threshold tuning command to refresh `recalibration-thresholds.json`.
3. Observe warning-mode trend reports for several runs.
4. Set `RECALIBRATION_TREND_STRICT: 'true'` when stable.

## Acceptance Check
- Tuning command writes deterministic threshold file from manifest input.
- Workflow can be switched between warning/blocking mode without script changes.
