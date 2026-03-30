# WS8-Slice-C: Periodic Drift Report Command Path

## Goal
Provide one command path that summarizes deterministic gates, threshold checks, and review feedback trend signals.

## Implemented Scope
- Added drift report command:
  - `.github/scripts/key-finding-labels-extraction/cli/generate-drift-report.js`
- Added command test:
  - `__tests__/drift-report-script.test.js`
- Added workflow step and artifact upload for:
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-drift-report.md`
- Added baseline README command documentation for drift report generation.

## Report Sections
- Gate status (threshold + determinism)
- Feedback summary (loaded, total corrections, correction rate)
- Top correction actions
- Top correction dimensions

## Acceptance Check
- Drift report command succeeds even when one or more source JSON artifacts are missing.
- Drift report output is markdown and stable in structure.
- Workflow publishes drift report artifact each run.
