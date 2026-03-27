# WS8-Slice-A: Feedback Ingestion Data Format

## Goal
Define a stable, versioned payload format for reviewed/adjudicated corrections and ingest it without changing default extraction behavior.

## Implemented Scope
- Added feedback ingestion module:
  - `.github/scripts/key-finding-labels-extraction/review-feedback-ingestion.js`
- Added validation and loading behavior:
  - schema version gate (`1.0.0`)
  - action validation (`add`, `remove`, `replace`)
  - taxonomy-dimension validation against active profile
  - mode control (`off`, `warn`, `strict`)
- Added extractor flags:
  - `--review-feedback-mode=off|warn|strict`
  - `--review-feedback-file=<path>`
- Added extraction artifact:
  - `key-finding-labels-extraction-feedback-ingestion.json`
- Added unit tests:
  - `__tests__/review-feedback-ingestion.test.js`

## Data Contract (v1.0.0)
```json
{
  "schema_version": "1.0.0",
  "corrections": [
    {
      "finding_uid": "KF-aaaaaaaaaaaa",
      "action": "replace",
      "dimension": "research_themes",
      "label": "authentication_login",
      "replaced_label": "help_support",
      "reviewer": "reviewer-id",
      "reviewed_at": "2026-03-27T10:00:00.000Z",
      "notes": "optional context"
    }
  ]
}
```

## Acceptance Check
- Feedback payload can be loaded with no effect on extraction when mode is `off`.
- Warn mode reports ingestion issues in validation warnings and still completes extraction.
- Strict mode fails extraction on malformed/unsupported feedback payload.
- Ingestion artifact is always emitted for observability.
