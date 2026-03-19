const test = require('node:test');
const assert = require('node:assert/strict');
const { aggregateFindings } = require('../aggregator');

test('aggregator returns pattern, journey and cooccurrence counts', () => {
  const findings = [
    {
      pattern_triggers: ['Pattern A'],
      service_journey_mapping: ['Journey 1'],
      labels: {
        finding_types: ['usability_issue'],
        severity_levels: ['high'],
        research_themes: [],
        product_areas: [],
        journey_stages: [],
        user_characteristics: [],
        emotional_states: [],
        life_events: [],
        trust_factors: [],
        channel_switching: [],
        temporal_patterns: [],
        design_system_patterns: [],
      },
    },
    {
      pattern_triggers: ['Pattern A', 'Pattern B'],
      service_journey_mapping: ['Journey 1', 'Journey 2'],
      labels: {
        finding_types: ['unmet_need'],
        severity_levels: ['medium'],
        research_themes: [],
        product_areas: [],
        journey_stages: [],
        user_characteristics: [],
        emotional_states: [],
        life_events: [],
        trust_factors: [],
        channel_switching: [],
        temporal_patterns: [],
        design_system_patterns: [],
      },
    },
  ];

  const result = aggregateFindings(findings);
  assert.equal(result.pattern_trigger_counts['Pattern A'], 2);
  assert.equal(result.service_journey_counts['Journey 1'], 2);
  assert.equal(result.label_counts['finding_types:usability_issue'], 1);
  assert.ok(Object.keys(result.label_cooccurrence_counts).length > 0);
});
