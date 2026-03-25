const test = require('node:test');
const assert = require('node:assert/strict');
const { applyCorrectionsToEnrichment } = require('../correction-application');

test('applyCorrectionsToEnrichment applies add/remove/replace deterministically', () => {
  const enrichmentFindings = [
    {
      finding_uid: 'KF-1',
      finding_title: 'Title',
      suggested_labels: {
        research_themes: [
          { label: 'authentication_login', confidence: 0.6 },
          { label: 'help_support', confidence: 0.5 },
        ],
      },
    },
  ];

  const feedbackIngestion = {
    loaded: true,
    corrections: [
      {
        finding_uid: 'KF-1',
        action: 'remove',
        dimension: 'research_themes',
        label: 'help_support',
      },
      {
        finding_uid: 'KF-1',
        action: 'add',
        dimension: 'research_themes',
        label: 'benefits_education',
      },
      {
        finding_uid: 'KF-1',
        action: 'replace',
        dimension: 'research_themes',
        label: 'benefits_disability',
        replaced_label: 'authentication_login',
      },
    ],
  };

  const result = applyCorrectionsToEnrichment({
    enrichmentFindings,
    feedbackIngestion,
    mode: 'apply',
  });

  assert.equal(result.corrections_applied, 3);
  assert.equal(result.findings_touched, 1);
  assert.equal(result.dimension_changes.research_themes, 3);
  assert.ok(Array.isArray(result.change_log));
  assert.equal(result.change_log.length, 3);

  const labels = result.corrected_findings[0].suggested_labels.research_themes.map(item => item.label);
  assert.deepEqual(labels, ['benefits_disability', 'benefits_education']);
});

test('applyCorrectionsToEnrichment ignores missing findings and reports reasons', () => {
  const result = applyCorrectionsToEnrichment({
    enrichmentFindings: [],
    feedbackIngestion: {
      loaded: true,
      corrections: [
        {
          finding_uid: 'KF-missing',
          action: 'add',
          dimension: 'research_themes',
          label: 'benefits_disability',
        },
      ],
    },
    mode: 'apply',
  });

  assert.equal(result.corrections_applied, 0);
  assert.equal(result.corrections_ignored, 1);
  assert.equal(result.change_log[0].reason, 'finding_not_found');
});

test('applyCorrectionsToEnrichment returns unchanged findings when mode=off', () => {
  const enrichmentFindings = [{ finding_uid: 'KF-1', suggested_labels: {} }];

  const result = applyCorrectionsToEnrichment({
    enrichmentFindings,
    feedbackIngestion: { loaded: true, corrections: [] },
    mode: 'off',
  });

  assert.equal(result.enabled, false);
  assert.equal(result.corrected_findings.length, 1);
  assert.equal(result.corrections_applied, 0);
});
