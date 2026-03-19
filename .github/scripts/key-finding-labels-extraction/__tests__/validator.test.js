const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateFindingShape,
  validateTaxonomyValues,
  validateDuplicateFindingIds,
  validateDuplicateFindingUids,
} = require('../validator');

const taxonomy = {
  allowedLabels: {
    finding_types: new Set(['usability_issue', 'unmet_need']),
    severity_levels: new Set(['critical', 'high', 'medium', 'low', 'enhancement']),
    research_themes: new Set(['navigation_wayfinding']),
    product_areas: new Set(['health_care']),
    journey_stages: new Set(['application']),
    user_characteristics: new Set(['first_time_user']),
    emotional_states: new Set(['confused']),
    life_events: new Set(['health_crisis']),
    trust_factors: new Set(['confirmation_needed']),
    channel_switching: new Set(['digital_to_phone']),
    temporal_patterns: new Set(['recurring_issue']),
    design_system_patterns: new Set(['error_messaging']),
  },
};

test('validator catches missing required fields', () => {
  const finding = {
    finding_title: '',
    labels: {},
  };

  const result = validateFindingShape({ file: 'x.md', finding });
  assert.ok(result.errors.some(e => e.code === 'MISSING_FINDING_ID'));
  assert.ok(result.errors.some(e => e.code === 'MISSING_FINDING_TITLE'));
  assert.ok(result.errors.some(e => e.code === 'MISSING_FINDING_TYPES'));
  assert.ok(result.errors.some(e => e.code === 'MISSING_SEVERITY_LEVEL'));
});

test('validator enforces severity cardinality', () => {
  const finding = {
    finding_id: 1,
    finding_title: 'A',
    labels: {
      finding_types: ['usability_issue'],
      severity_levels: ['high', 'low'],
    },
    service_journey_mapping: ['Apply'],
    pattern_triggers: ['X'],
  };

  const result = validateFindingShape({ file: 'x.md', finding });
  assert.ok(result.errors.some(e => e.code === 'MULTIPLE_SEVERITY_LEVELS'));
});

test('validator catches unknown taxonomy values', () => {
  const finding = {
    finding_id: 1,
    finding_title: 'A',
    labels: {
      finding_types: ['not_in_taxonomy'],
      severity_levels: ['high'],
    },
  };

  const result = validateTaxonomyValues({ file: 'x.md', finding, taxonomy });
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].code, 'UNKNOWN_TAXONOMY_VALUE');
});

test('validator catches duplicate finding ids within a file', () => {
  const findings = [
    { source_file: 'a.md', finding_id: 1 },
    { source_file: 'a.md', finding_id: 1 },
    { source_file: 'b.md', finding_id: 1 },
  ];

  const result = validateDuplicateFindingIds(findings);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].code, 'DUPLICATE_FINDING_ID_IN_FILE');
});

test('validator catches duplicate finding uids globally', () => {
  const findings = [
    { finding_uid: 'KF-abc123', source_file: 'a.md' },
    { finding_uid: 'KF-abc123', source_file: 'b.md' },
  ];

  const result = validateDuplicateFindingUids(findings);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].code, 'DUPLICATE_FINDING_UID');
});
