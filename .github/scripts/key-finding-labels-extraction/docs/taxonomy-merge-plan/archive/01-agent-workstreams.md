# Agent Workstreams

## Usage

Run workstreams in order unless explicitly marked parallelizable. Each workstream is designed to be handled by one coding agent at a time with a narrow ownership boundary.

## WS1: Output Contract Baseline

- Aim: Freeze the current behavior of both systems before merging.
- Primary scope:
  - `scripts/research-taxonomy-generator.js`
  - `.github/scripts/key-finding-labels-extraction/*`
- Tasks:
  - Capture schema snapshots for legacy and extraction outputs.
  - Build representative fixture corpus for parity tests.
  - Record baseline metrics (counts, label frequency, skip reasons).
- Deliverables:
  - Baseline schema docs.
  - Golden fixture set committed to repo.
- Acceptance:
  - Baseline run is reproducible.
  - Golden fixture corpus covers malformed YAML, frontmatter-only, explicit labels, duplicate IDs.

## WS2: Shared Taxonomy Profile Layer

- Aim: Decouple taxonomy definitions from execution logic.
- Depends on: WS1
- Tasks:
  - Introduce profile files for `legacy-taxonomy` and `enrichment-taxonomy`.
  - Add loader + validation for taxonomy profile schema.
  - Add mapping rules for naming drift across dimensions/labels.
- Deliverables:
  - Profile files + loader module + unit tests.
- Acceptance:
  - Both profiles validate.
  - Same finding can be classified under either profile with deterministic output.

## WS3: Legacy Output Adapter

- Aim: Recreate legacy `reports/research-taxonomy/*` from modular pipeline.
- Depends on: WS1, WS2
- Tasks:
  - Add adapter writer that emits `taxonomy-data.json` and `taxonomy-report.md`.
  - Preserve expected top-level shape and key section ordering.
  - Include run metadata (`schema_version`, `generated_at`, source profile).
- Deliverables:
  - Adapter module + tests + snapshot outputs.
- Acceptance:
  - Adapter output passes schema checks.
  - Golden parity is within agreed tolerance for key metrics.

## WS4: CLI Integration and Compatibility Wrapper

- Aim: Make one command path for users while preserving old entrypoint.
- Depends on: WS3
- Tasks:
  - Add CLI switches for profile + emit targets.
  - Convert `scripts/research-taxonomy-generator.js` into wrapper/orchestrator around modular pipeline.
  - Keep existing command UX stable for users.
- Deliverables:
  - Updated CLI behavior docs.
  - Wrapper integration tests.
- Acceptance:
  - Existing taxonomy script command still works.
  - One run can emit both artifact families.

## WS5: Quality and Determinism Gates

- Aim: Prevent hidden regressions during iterative modernization.
- Depends on: WS3
- Tasks:
  - Add JSON schema validation in CI.
  - Add deterministic output test (same input => same artifacts).
  - Add basic evaluation harness and thresholds.
- Deliverables:
  - CI checks + test commands + baseline score report.
- Acceptance:
  - CI fails on schema drift, nondeterministic output, or quality threshold breach.
  - Baseline gate: macro F1 >= 0.70 for priority dimensions.

## WS6: Phase 2 Hybrid Classifier

- Aim: Improve recall/precision without breaking output contracts.
- Depends on: WS5
- Tasks:
  - Add embedding classifier module behind feature flag.
  - Implement rule+embedding score fusion.
  - Add uncertainty threshold and `needs_review` routing.
- Deliverables:
  - Hybrid classifier module + eval report.
- Acceptance:
  - Macro F1 improves versus MVP baseline.
  - Legacy-compatible outputs remain valid.

## WS7: Phase 3 Selective LLM Adjudication

- Aim: Use LLMs only where deterministic methods are uncertain.
- Depends on: WS6
- Tasks:
  - Add adjudication trigger policy for ambiguous cases.
  - Enforce structured output schema for model responses.
  - Log adjudication reasons and confidence deltas.
- Deliverables:
  - LLM adjudication module + replayable tests/mocks.
- Acceptance:
  - High-risk precision targets met.
  - LLM usage remains under configured budget cap.

## WS8: Active Learning and Feedback Loop

- Aim: Convert human review feedback into measurable model improvements.
- Depends on: WS7
- Tasks:
  - Define review dataset format.
  - Add correction ingestion and periodic recalibration script.
  - Publish drift and regression reports.
- Deliverables:
  - Feedback ingestion job + periodic scorecard.
- Acceptance:
  - New corrections can be ingested without breaking schema/versioning.
  - Monthly report shows trendline on precision/recall by label family.

## WS9: Correction Application and Recalibration

- Aim: Turn reviewed corrections into corrected outputs and recalibration-ready datasets.
- Depends on: WS8
- Tasks:
  - Apply `add|remove|replace` corrections deterministically by `finding_uid`.
  - Export recalibration dataset with provenance metadata.
  - Add trend regression checks for recalibration quality gates.
- Deliverables:
  - Correction application module + export scripts + trend gate script.
- Acceptance:
  - Corrected outputs are deterministic and versioned.
  - Recalibration data generation is reproducible.
  - Trend gates report clear pass/fail with dimension-level deltas.

## Parallelization Guidance

- Can run in parallel after WS1:
  - WS2 (taxonomy profile layer) and test fixture hardening in WS1 follow-up.
- Can run in parallel after WS3:
  - WS4 (CLI wrapper) and WS5 (CI gates), then integrate.

## Non-Negotiables

- Do not remove existing artifacts until parity + schema gates are green.
- Do not change public output keys without a version bump and migration note.
- Keep workstreams small; one PR per workstream or sub-slice.
