const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyText, enrichFindings } = require('../classifier');

test('classifyText returns confidence-scored matches', () => {
  const result = classifyText({
    text: 'Veterans were frustrated and confused when they could not sign in with Login.gov',
  });

  assert.ok(Array.isArray(result.research_themes));
  assert.ok(result.research_themes.some(item => item.label === 'authentication_login'));
  assert.ok(Array.isArray(result.emotional_states));
  assert.ok(result.emotional_states.some(item => ['frustrated', 'confused'].includes(item.label)));
  assert.ok(Array.isArray(result.finding_types));
  assert.ok(result.finding_types.some(item => ['usability_issue', 'technical_problem'].includes(item.label)));
});

test('enrichFindings enriches canonical findings with suggested labels', () => {
  const findings = [
    {
      finding_uid: 'KF-1',
      finding_id_local: 'F000001',
      source_file: 'products/demo/findings.md',
      source_kind: 'explicit',
      finding_title: 'Users were confused by sign in errors',
      supporting_context_texts: [],
    },
  ];

  const enriched = enrichFindings(findings);
  assert.equal(enriched.length, 1);
  assert.equal(enriched[0].finding_uid, 'KF-1');
  assert.ok(enriched[0].suggested_labels.research_themes);
});
