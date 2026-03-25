const test = require('node:test');
const assert = require('node:assert/strict');
const {
  generateRecalibrationRows,
  buildRecalibrationManifest,
} = require('../recalibration-export');

test('generateRecalibrationRows creates deterministic rows with correction provenance', () => {
  const rows = generateRecalibrationRows({
    summary: {
      taxonomy_profile: 'enrichment-taxonomy',
      taxonomy_profile_version: '1.0.0',
    },
    enrichment: {
      findings: [
        {
          finding_uid: 'KF-2',
          finding_id_local: 'F2',
          source_file: 'teams/b/research.md',
          source_kind: 'merged',
          finding_title: 'B finding',
          supporting_context_texts: ['line 1'],
          suggested_labels: {
            research_themes: [{ label: 'help_support', confidence: 0.4 }],
          },
        },
        {
          finding_uid: 'KF-1',
          finding_id_local: 'F1',
          source_file: 'products/a/findings.md',
          source_kind: 'explicit',
          finding_title: 'A finding',
          supporting_context_texts: [],
          suggested_labels: {
            research_themes: [{ label: 'authentication_login', confidence: 0.8 }],
          },
        },
      ],
    },
    correctionApplication: {
      corrected_findings: [
        {
          finding_uid: 'KF-1',
          suggested_labels: {
            research_themes: [{ label: 'benefits_disability', confidence: 1 }],
          },
        },
        {
          finding_uid: 'KF-2',
          suggested_labels: {
            research_themes: [{ label: 'help_support', confidence: 0.4 }],
          },
        },
      ],
      change_log: [
        {
          finding_uid: 'KF-1',
          dimension: 'research_themes',
          action: 'replace',
          applied: true,
          reason: 'replaced',
        },
      ],
    },
    feedbackIngestion: { mode: 'warn', loaded: true },
  });

  assert.equal(rows.length, 2);
  assert.equal(rows[0].finding_uid, 'KF-1');
  assert.equal(rows[1].finding_uid, 'KF-2');
  assert.deepEqual(rows[0].predicted_labels, ['authentication_login']);
  assert.deepEqual(rows[0].corrected_labels, ['benefits_disability']);
  assert.equal(rows[0].has_correction, true);
  assert.deepEqual(rows[0].correction_actions, ['replace']);
});

test('buildRecalibrationManifest summarizes export rows', () => {
  const manifest = buildRecalibrationManifest({
    summary: {
      generated_at: '2026-03-27T20:00:00.000Z',
      taxonomy_profile: 'enrichment-taxonomy',
      taxonomy_profile_version: '1.0.0',
    },
    feedbackIngestion: { mode: 'warn', loaded: true },
    correctionApplication: { mode: 'apply', enabled: true },
    rows: [
      { dimension: 'research_themes', has_correction: true },
      { dimension: 'emotional_states', has_correction: false },
    ],
  });

  assert.equal(manifest.rows_total, 2);
  assert.equal(manifest.rows_with_corrections, 1);
  assert.deepEqual(manifest.dimensions, ['emotional_states', 'research_themes']);
  assert.equal(manifest.correction_application_mode, 'apply');
});
