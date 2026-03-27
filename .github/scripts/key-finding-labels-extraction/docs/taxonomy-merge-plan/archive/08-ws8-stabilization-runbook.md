# WS8 Stabilization Runbook

## Purpose
Operational guidance for running, reviewing, and triaging WS8 artifacts.

## Required Artifacts Per Run
- `key-finding-labels-extraction-feedback-ingestion.json`
- `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-feedback-scorecard.json`
- `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-drift-report.md`
- Existing baseline gates:
  - `workflow-threshold-check.json`
  - `workflow-determinism-parity.json`

## Recommended Cadence
1. Per workflow run:
- Confirm threshold and determinism status are PASS.
- Confirm feedback artifact is present and parseable.
2. Weekly:
- Review drift report trends for correction-rate changes by dimension.
3. Monthly:
- Snapshot scorecard trends and open recalibration issues for persistent drift.

## Operator Checks
1. Run extraction and WS8 hooks:
```bash
node .github/scripts/key-finding-labels-extraction/run.js --mode=local --scan=full --emit-legacy-taxonomy=true
node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/generate-feedback-scorecard.js
node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/generate-drift-report.js
```
2. Verify scorecard sanity:
- `corrections_total` is non-negative.
- `correction_rate_vs_findings` is between `0` and `1`.
- Top dimensions align with expected review focus.
3. Verify drift report sections exist:
- `Gate Status`
- `Feedback Summary`
- `Top Correction Actions`
- `Top Correction Dimensions`

## Escalation Criteria
- Any threshold gate failure.
- Any determinism gate failure.
- `feedback_errors > 0` in scorecard for two consecutive runs.
- Sudden correction-rate increase of >20% week-over-week.

## Handoff Notes For Coding Agents
- Keep artifact keys stable unless schema version is bumped.
- Prefer additive fields for new telemetry.
- Update `03-execution-status.md` whenever cadence/rules change.
