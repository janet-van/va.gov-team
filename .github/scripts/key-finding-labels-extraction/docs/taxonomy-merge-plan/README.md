# Taxonomy Merge and Modernization

This folder tracks the migration from the old taxonomy script to the modular extraction pipeline.

## Start Here

- Current execution status: `execution-status.md`
- Baseline tools and gate commands: `baseline/README.md`

## In Plain Language

The goal is simple:

1. Keep legacy outputs working.
2. Use one modular engine for extraction + enrichment.
3. Add quality gates so changes are safe.
4. Add feedback + recalibration so quality improves over time.

## What Is Already Done

- Legacy compatibility wrapper is in place.
- Determinism/contract/threshold checks are implemented.
- Feedback ingestion, correction application, and recalibration export are implemented.
- Recalibration trend gate is now running in strict (blocking) mode.

## How To Use This Folder

- If you need the current state: read `03-execution-status.md`.
- If you need to run checks locally: read `baseline/README.md`.
- If you need detailed implementation history: read `archive/README.md`.

## Notes

- Historical workstream docs were moved to `archive/` to keep this folder easier to scan.
