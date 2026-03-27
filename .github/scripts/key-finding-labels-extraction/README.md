# Key Finding Labels Extraction

This workflow scans research markdown files, extracts findings, enriches them with taxonomy labels, and writes both:
- modular extraction artifacts (`key-finding-labels-extraction-*`)
- legacy compatibility artifacts (`reports/research-taxonomy/*`)

## What It Does
1. Finds research files in `products/` and `teams/`.
2. Parses:
- fenced `yaml key-finding-labels` blocks
- frontmatter `key_findings[]`
3. Normalizes and merges findings into canonical records.
4. Enriches findings with taxonomy suggestions.
5. Optionally applies review corrections.
6. Optionally emits legacy taxonomy report outputs.

## Quick Start (Local)
Run from repo root:

```bash
node .github/scripts/key-finding-labels-extraction/run.js \
  --mode=local \
  --scan=full \
  --taxonomy-mode=off \
  --emit-legacy-taxonomy=true
```

Useful local variants:

```bash
# Warning-only taxonomy value checks from a local taxonomy file
node .github/scripts/key-finding-labels-extraction/run.js \
  --mode=local \
  --scan=full \
  --taxonomy-mode=warn \
  --taxonomy-file=.github/scripts/key-finding-labels-extraction/__fixtures__/taxonomy.yml

# Limit scan roots for fast iteration
node .github/scripts/key-finding-labels-extraction/run.js \
  --mode=local \
  --scan=full \
  --roots=tmp/sample-findings-reports
```

## How GitHub Workflow Uses It
Workflow file: `.github/workflows/key-finding-labels-extraction.yml`

The workflow runs extraction, then executes gates in this order:
1. Output contract check
2. Determinism check (run twice + compare snapshots)
3. Baseline metric threshold check
4. Recalibration trend check (strict/blocking mode enabled)

It then uploads extraction, legacy, and baseline gate artifacts.

## Main Runtime Flags
- `--taxonomy-mode=off|warn`
- `--taxonomy-profile=enrichment-taxonomy|legacy-taxonomy`
- `--emit-legacy-taxonomy=true|false`
- `--embedding-mode=off|stub`
- `--fusion-mode=rules_only|weighted`
- `--llm-adjudication-mode=off|policy`
- `--review-feedback-mode=off|warn|strict`
- `--review-feedback-file=<path>`
- `--correction-application-mode=off|apply`

## Output Artifacts
- `key-finding-labels-extraction-summary.json`
- `key-finding-labels-extraction-findings.json`
- `key-finding-labels-extraction-validation.json`
- `key-finding-labels-extraction-patterns.json`
- `key-finding-labels-extraction-enrichment.json`
- `key-finding-labels-extraction-portfolio.json`
- `key-finding-labels-extraction-adjudication.json`
- `key-finding-labels-extraction-feedback-ingestion.json`
- `key-finding-labels-extraction-correction-application.json`
- `key-finding-labels-extraction-report.md`
- `key-finding-labels-extraction-step-summary.md`
- `reports/research-taxonomy/taxonomy-data.json` (when legacy emit is enabled)
- `reports/research-taxonomy/taxonomy-report.md` (when legacy emit is enabled)

## Related Docs
- Taxonomy merge/modernization docs: `.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/README.md`
