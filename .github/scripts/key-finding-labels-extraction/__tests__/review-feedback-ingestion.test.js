const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  FEEDBACK_SCHEMA_VERSION,
  validateFeedbackDataset,
  loadReviewFeedback,
} = require('../review-feedback-ingestion');

test('validateFeedbackDataset accepts valid correction payload', () => {
  const payload = {
    schema_version: FEEDBACK_SCHEMA_VERSION,
    corrections: [
      {
        finding_uid: 'KF-aaaaaaaaaaaa',
        action: 'replace',
        dimension: 'research_themes',
        label: 'authentication_login',
        replaced_label: 'help_support',
        reviewed_at: '2026-03-27T10:00:00.000Z',
      },
      {
        finding_uid: 'KF-bbbbbbbbbbbb',
        action: 'add',
        dimension: 'emotional_states',
        label: 'frustrated',
      },
    ],
  };

  const result = validateFeedbackDataset(payload, {
    allowedDimensions: ['research_themes', 'emotional_states'],
  });

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.corrections.length, 2);
  assert.equal(result.summary.records_valid, 2);
  assert.equal(result.summary.actions.replace, 1);
});

test('validateFeedbackDataset rejects unknown dimensions and invalid actions', () => {
  const payload = {
    schema_version: FEEDBACK_SCHEMA_VERSION,
    corrections: [
      {
        finding_uid: 'KF-cccccccccccc',
        action: 'keep',
        dimension: 'unknown_dimension',
        label: 'foo',
      },
    ],
  };

  const result = validateFeedbackDataset(payload, {
    allowedDimensions: ['research_themes'],
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(issue => issue.code === 'FEEDBACK_INVALID_ACTION'));
  assert.ok(result.errors.some(issue => issue.code === 'FEEDBACK_UNKNOWN_DIMENSION'));
  assert.equal(result.summary.records_invalid, 1);
});

test('loadReviewFeedback strict mode throws when payload is invalid', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'feedback-ingest-'));
  const filePath = path.join(tmpDir, 'feedback.json');

  fs.writeFileSync(
    filePath,
    `${JSON.stringify({ schema_version: '0.0.1', corrections: [] }, null, 2)}\n`,
  );

  assert.throws(
    () =>
      loadReviewFeedback({
        mode: 'strict',
        filePath,
        allowedDimensions: ['research_themes'],
      }),
    /Feedback ingestion failed/,
  );

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadReviewFeedback warn mode returns errors without throwing', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'feedback-ingest-'));
  const filePath = path.join(tmpDir, 'feedback.json');

  fs.writeFileSync(filePath, '{\n  "bad": ', 'utf8');

  const result = loadReviewFeedback({
    mode: 'warn',
    filePath,
    allowedDimensions: ['research_themes'],
  });

  assert.equal(result.enabled, true);
  assert.equal(result.loaded, false);
  assert.ok(result.errors.some(issue => issue.code === 'FEEDBACK_JSON_PARSE_ERROR'));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
