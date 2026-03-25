const test = require('node:test');
const assert = require('node:assert/strict');
const { generateFeedbackScorecard } = require('../feedback-scorecard');

test('generateFeedbackScorecard computes correction coverage metrics', () => {
  const scorecard = generateFeedbackScorecard({
    feedbackIngestion: {
      mode: 'warn',
      loaded: true,
      corrections: [
        {
          finding_uid: 'KF-1',
          action: 'replace',
          dimension: 'research_themes',
          label: 'authentication_login',
        },
        {
          finding_uid: 'KF-1',
          action: 'add',
          dimension: 'emotional_states',
          label: 'frustrated',
        },
        {
          finding_uid: 'KF-2',
          action: 'remove',
          dimension: 'research_themes',
          label: 'help_support',
        },
      ],
      errors: [],
      warnings: [{ code: 'X' }],
    },
    enrichment: {
      findings: [
        { finding_uid: 'KF-1' },
        { finding_uid: 'KF-2' },
        { finding_uid: 'KF-3' },
      ],
    },
  });

  assert.equal(scorecard.feedback_mode, 'warn');
  assert.equal(scorecard.feedback_loaded, true);
  assert.equal(scorecard.findings_scored, 3);
  assert.equal(scorecard.findings_with_feedback, 2);
  assert.equal(scorecard.correction_rate_vs_findings, 0.666667);
  assert.equal(scorecard.corrections_total, 3);
  assert.equal(scorecard.corrections_by_action.replace, 1);
  assert.equal(scorecard.corrections_by_dimension.research_themes, 2);
  assert.equal(scorecard.feedback_warnings, 1);
});
