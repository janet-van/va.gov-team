const test = require('node:test');
const assert = require('node:assert/strict');
const { loadProfileByName } = require('../taxonomy-profiles');
const {
  findMappedDimension,
  mapLegacyLabelToEnrichment,
  validateLegacyToEnrichmentMapping,
} = require('../taxonomy-profile-mapping');

test('findMappedDimension maps required legacy dimensions', () => {
  assert.equal(findMappedDimension('finding_types'), 'finding_types');
  assert.equal(findMappedDimension('veteran_journey_stages'), 'journey_stages');
  assert.equal(findMappedDimension('severity_indicators'), 'severity_levels');
});

test('mapLegacyLabelToEnrichment uses explicit drift map for renamed labels', () => {
  const enrichment = loadProfileByName({ profileName: 'enrichment-taxonomy' });
  const mapped = mapLegacyLabelToEnrichment({
    legacyDimension: 'finding_types',
    legacyLabel: 'positive_finding',
    enrichmentProfile: enrichment,
  });

  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].dimension, 'finding_types');
  assert.equal(mapped[0].label, 'positive_feedback');
});

test('mapLegacyLabelToEnrichment falls back to same-name mapping when valid', () => {
  const enrichment = loadProfileByName({ profileName: 'enrichment-taxonomy' });
  const mapped = mapLegacyLabelToEnrichment({
    legacyDimension: 'finding_types',
    legacyLabel: 'usability_issue',
    enrichmentProfile: enrichment,
  });

  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].dimension, 'finding_types');
  assert.equal(mapped[0].label, 'usability_issue');
});

test('validateLegacyToEnrichmentMapping passes for required dimensions', () => {
  const result = validateLegacyToEnrichmentMapping();
  assert.equal(result.passed, true);
  assert.equal(result.issues.length, 0);
});
