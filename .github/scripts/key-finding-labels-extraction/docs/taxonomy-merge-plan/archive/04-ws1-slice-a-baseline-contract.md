# WS1-Slice-A: Baseline Contract and Fixture Lock

## Objective
Freeze a reproducible baseline contract for both artifact families before any merge/refactor work.

## Why This Slice Exists
WS2+ depends on stable reference behavior. Without a locked baseline, parity discussions become subjective and regressions are hard to prove.

## Scope In
- Documentation and fixture-contract definitions only.
- No production extraction logic changes.
- No taxonomy logic changes.

## Scope Out
- No classifier improvements.
- No output adapter implementation yet.
- No CI workflow rewiring yet.

## File Ownership
- Primary owner files:
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/03-execution-status.md`
  - `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/04-ws1-slice-a-baseline-contract.md`
- Allowed read-only dependencies:
  - `scripts/research-taxonomy-generator.js`
  - `.github/scripts/key-finding-labels-extraction/*.js`
  - `reports/research-taxonomy/taxonomy-data.json`
  - `reports/research-taxonomy/taxonomy-report.md`

## Required Baseline Contract (To Be Captured In Slice-B)
1. Legacy output contract
- `reports/research-taxonomy/taxonomy-data.json`
  - required top-level keys: `generated_at`, `summary`, `taxonomy_definition`, `taxonomy_analysis`, `reports`
- `reports/research-taxonomy/taxonomy-report.md`
  - required sections: Summary, Taxonomy Dimensions, Label Frequency Analysis, Cross-Product Patterns, Product Coverage Analysis, Assistive Technology Coverage, Underserved Groups Gap Analysis, Methodology

2. Extraction output contract
- `key-finding-labels-extraction-summary.json`
- `key-finding-labels-extraction-findings.json`
- `key-finding-labels-extraction-validation.json`
- `key-finding-labels-extraction-patterns.json`
- `key-finding-labels-extraction-enrichment.json`
- `key-finding-labels-extraction-portfolio.json`
- `key-finding-labels-extraction-report.md`

3. Deterministic behavior rules
- Stable sort ordering for findings and aggregate outputs.
- Stable field naming across runs.
- Explicit schema/version keys for every generated JSON artifact.

## Acceptance Criteria
1. Slice defines exact baseline artifacts and required sections/keys.
2. Scope boundaries are explicit enough for a coding agent to implement Slice-B directly.
3. No production logic changed in this slice.

## Exit Criteria For Moving To Slice-B
- A coding agent can implement baseline capture artifacts without asking for additional product decisions.
