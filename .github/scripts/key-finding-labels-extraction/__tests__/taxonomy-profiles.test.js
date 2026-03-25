const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
  DEFAULT_PROFILE_NAME,
  resolveProfilePath,
  loadProfileByName,
  validateProfile,
} = require('../taxonomy-profiles');

test('loadProfileByName loads default enrichment profile', () => {
  const profile = loadProfileByName();
  assert.equal(profile.profile_name, DEFAULT_PROFILE_NAME);
  assert.equal(profile.profile_id, 'enrichment-taxonomy');
  assert.ok(profile.dimensions.finding_types);
  assert.ok(profile.confidence_denominator_factor > 0);
});

test('loadProfileByName loads legacy profile', () => {
  const profile = loadProfileByName({ profileName: 'legacy-taxonomy' });
  assert.equal(profile.profile_id, 'legacy-taxonomy');
  assert.ok(profile.dimensions.product_areas);
  assert.ok(profile.dimensions.user_groups);
});

test('resolveProfilePath returns expected json path', () => {
  const resolved = resolveProfilePath({ profileName: 'enrichment-taxonomy' });
  assert.ok(resolved.endsWith(path.join('taxonomy-profiles', 'enrichment-taxonomy.json')));
});

test('validateProfile rejects invalid shape', () => {
  assert.throws(() => validateProfile(null), /must be an object/);
  assert.throws(
    () => validateProfile({ profile_id: 'x', profile_version: '1.0.0', dimensions: {} }),
    /non-empty dimensions object/,
  );
});
