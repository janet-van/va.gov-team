# Key Finding Labels Extraction

Node-based extractor for `yaml key-finding-labels` blocks in research reports.

## Local run

```bash
node .github/scripts/key-finding-labels-extraction/run.js --mode=local --scan=full --out-dir=./.github/tmp/findings
```

Optional taxonomy file for warning-only value checks:

```bash
node .github/scripts/key-finding-labels-extraction/run.js --mode=local --scan=full --taxonomy-mode=warn --taxonomy-file=.github/scripts/key-finding-labels-extraction/__fixtures__/taxonomy.yml --out-dir=./.github/tmp/findings
```

^ still a wip as to how we can validate and log warnings for incorrect taxonomy labels or unknown taxonomy values. We may want to have a way to maintain taxonomy source of truth

Default behavior:

- `--taxonomy-mode=off` (default): schema-only hard validation, no taxonomy dependency.
- `--taxonomy-mode=warn`: load taxonomy from a local file and emit unknown-label warnings (never hard fail on unknown values).
- Missing `finding_id` values are auto-generated deterministically as `F######` using `source_file + finding_title` and logged as warnings.
- Every finding also gets a deterministic global UID `finding_uid` in the form `KF-xxxxxxxxxxxx`, generated from `source_file + finding_id_local + finding_title`. This was important so that each finding could have a deterministic id that is based on a known set of file data.

Optional custom scan roots:

```bash
node .github/scripts/key-finding-labels-extraction/run.js --mode=local --scan=full --roots=tmp/sample-findings-reports
```

## Workflow simulation

You need act installed locally first via https://github.com/nektos/act

```bash
act workflow_dispatch -W .github/workflows/key-finding-labels-extraction.yml
```

## Artifacts

- `key-finding-labels-extraction-summary.json`
- `key-finding-labels-extraction-findings.json`
- `key-finding-labels-extraction-validation.json`
- `key-finding-labels-extraction-patterns.json`
- `key-finding-labels-extraction-step-summary.md`

## TODO

- Improve findings document identification. Using a filename match misses some files. Could we leverage a small LLM model to identify? Other approaches for matching to file content?
- Review warnings, accuracy of outputs, and taxonomy sources
- Add additional triggers besides workflow_dispatch
- Move artifacts into a versioned set of files that are written as PR when action runs
- Incremental updates instead of entire repo run every time
- Convert to YAML if/when needed
- Review research finding documents that don't include yaml for an automated augmentation strategy
