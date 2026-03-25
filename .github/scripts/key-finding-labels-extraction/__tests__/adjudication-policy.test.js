const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateAdjudicationPolicy, buildDimensionTrigger } = require('../adjudication-policy');

test('evaluateAdjudicationPolicy returns disabled summary when mode=off', () => {
  const result = evaluateAdjudicationPolicy([], { mode: 'off' });
  assert.equal(result.mode, 'off');
  assert.equal(result.enabled, false);
  assert.equal(result.findings_flagged, 0);
});

test('buildDimensionTrigger flags low confidence and low margin', () => {
  const trigger = buildDimensionTrigger({
    dimension: 'research_themes',
    labels: [
      { label: 'a', confidence: 0.4 },
      { label: 'b', confidence: 0.35 },
    ],
    embeddingLabels: [],
    lowConfidenceThreshold: 0.45,
    lowMarginThreshold: 0.12,
    embeddingDisagreementThreshold: 0.25,
  });

  assert.ok(trigger.reasons.includes('low_confidence'));
  assert.ok(trigger.reasons.includes('low_margin'));
});

test('evaluateAdjudicationPolicy flags findings with trigger reasons in policy mode', () => {
  const findings = [
    {
      finding_uid: 'KF-1',
      source_file: 'products/a/findings.md',
      finding_title: 'Test finding',
      suggested_labels: {
        research_themes: [
          { label: 'authentication_login', confidence: 0.4 },
          { label: 'form_completion', confidence: 0.36 },
        ],
      },
      embedding_suggestions: {
        research_themes: [{ label: 'form_completion', confidence: 0.41 }],
      },
    },
  ];

  const result = evaluateAdjudicationPolicy(findings, {
    mode: 'policy',
    lowConfidenceThreshold: 0.45,
    lowMarginThreshold: 0.1,
    embeddingDisagreementThreshold: 0.25,
    minTriggeredDimensions: 1,
  });

  assert.equal(result.enabled, true);
  assert.equal(result.findings_flagged, 1);
  assert.equal(result.flagged_findings.length, 1);
  assert.ok(result.flagged_findings[0].triggers[0].reasons.length > 0);
});
