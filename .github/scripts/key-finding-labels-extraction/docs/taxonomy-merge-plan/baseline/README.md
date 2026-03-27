# Baseline and Gate Tooling

This folder holds gate configs plus optional generated baseline artifacts.

## Keep These Files
- `contract.json`
- `tolerance.json`
- `metric-thresholds.json`
- `recalibration-thresholds.json`

## Common Local Commands
Run from repo root.

1. Generate fresh extraction artifacts:
```bash
node .github/scripts/key-finding-labels-extraction/run.js \
  --mode=local \
  --scan=full \
  --emit-legacy-taxonomy=true
```

2. Contract and determinism checks:
```bash
node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/check-contract.js
node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/capture-snapshot.js
node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/compare-snapshots.js \
  --baseline=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-snapshot.json \
  --current=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-snapshot.json
```

3. Recalibration export and trend gate:
```bash
node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/generate-recalibration-dataset.js \
  --summary=key-finding-labels-extraction-summary.json \
  --enrichment=key-finding-labels-extraction-enrichment.json \
  --feedback=key-finding-labels-extraction-feedback-ingestion.json \
  --correction=key-finding-labels-extraction-correction-application.json \
  --out-file=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset.jsonl \
  --manifest-file=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json

node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/check-recalibration-trends.js \
  --baseline=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json \
  --current=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json \
  --thresholds=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/recalibration-thresholds.json \
  --out-file=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-trend-check.json \
  --strict=true
```

4. Retune recalibration thresholds from a baseline manifest:
```bash
node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/tune-recalibration-thresholds.js \
  --baseline-manifest=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json \
  --out-file=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/recalibration-thresholds.json
```

5. Run a multi-run stability cycle (strict trend gate):
```bash
node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/run-recalibration-stability-cycle.js \
  --runs=3 \
  --strict=true \
  --out-file=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/workflow-recalibration-stability.json
```

## Cleanup Note
Generated `latest-*` and `workflow-*` files in this folder are local run artifacts and are ignored by `.gitignore`.
