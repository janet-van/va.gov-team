const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeCanonicalFindings } = require('../merge');

test('mergeCanonicalFindings prefers explicit finding and retains frontmatter context', () => {
  const explicitFindings = [
    {
      source_file: 'products/demo/findings.md',
      finding_id_local: '1',
      finding_uid: 'KF-explicit',
      finding_title: 'Users struggled with the form',
      labels: {},
      service_journey_mapping: [],
      pattern_triggers: [],
    },
  ];

  const frontmatterFindings = [
    {
      source_file: 'products/demo/findings.md',
      finding_text: 'Users struggled with the form',
      finding_title: 'Users struggled with the form',
      metadata: { product: 'demo' },
      demographics_summary: { veterans: 5 },
    },
  ];

  const merged = mergeCanonicalFindings({ explicitFindings, frontmatterFindings });
  assert.equal(merged.length, 1);
  assert.equal(merged[0].source_kind, 'merged');
  assert.equal(merged[0].finding_uid, 'KF-explicit');
  assert.equal(merged[0].supporting_context_texts.length, 1);
});

test('mergeCanonicalFindings includes frontmatter-only findings', () => {
  const merged = mergeCanonicalFindings({
    explicitFindings: [],
    frontmatterFindings: [
      {
        source_file: 'teams/demo/report.md',
        finding_text: 'Veterans wanted clearer eligibility content',
        finding_title: 'Veterans wanted clearer eligibility content',
      },
    ],
  });

  assert.equal(merged.length, 1);
  assert.equal(merged[0].source_kind, 'frontmatter');
  assert.ok(merged[0].finding_uid.startsWith('KF-'));
});
