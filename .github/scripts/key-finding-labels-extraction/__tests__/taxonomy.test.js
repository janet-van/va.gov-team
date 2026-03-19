const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTaxonomyYaml } = require('../taxonomy');

test('taxonomy parser extracts value fields from metadata_labels schema', () => {
  const yml = `
metadata_labels:
  finding_types:
    labels:
      - value: usability_issue
        description: something
      - value: unmet_need
  severity_levels:
    labels:
      - value: high
      - value: medium
`;

  const result = parseTaxonomyYaml(yml);
  assert.ok(result.allowedLabels.finding_types.has('usability_issue'));
  assert.ok(result.allowedLabels.finding_types.has('unmet_need'));
  assert.ok(result.allowedLabels.severity_levels.has('high'));
  assert.ok(!result.allowedLabels.finding_types.has('something'));
});

test('taxonomy parser supports array-style category values', () => {
  const yml = `
finding_types:
  - usability_issue
severity_levels:
  - high
`;

  const result = parseTaxonomyYaml(yml);
  assert.ok(result.allowedLabels.finding_types.has('usability_issue'));
  assert.ok(result.allowedLabels.severity_levels.has('high'));
});
