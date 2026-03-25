const fs = require('fs');
const path = require('path');

const DEFAULT_PROFILE_NAME = 'enrichment-taxonomy';
const DEFAULT_CONFIDENCE_DENOMINATOR_FACTOR = 0.3;
const PROFILES_DIR = path.join(__dirname, 'taxonomy-profiles');

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateProfile(profile) {
  if (!isObject(profile)) {
    throw new Error('taxonomy profile must be an object');
  }

  if (typeof profile.profile_id !== 'string' || !profile.profile_id.trim()) {
    throw new Error('taxonomy profile requires non-empty profile_id');
  }

  if (typeof profile.profile_version !== 'string' || !profile.profile_version.trim()) {
    throw new Error('taxonomy profile requires non-empty profile_version');
  }

  if (!isObject(profile.dimensions) || Object.keys(profile.dimensions).length === 0) {
    throw new Error('taxonomy profile requires non-empty dimensions object');
  }

  if (
    profile.confidence_denominator_factor !== undefined &&
    (typeof profile.confidence_denominator_factor !== 'number' || profile.confidence_denominator_factor <= 0)
  ) {
    throw new Error('confidence_denominator_factor must be a positive number when provided');
  }

  for (const [dimension, labels] of Object.entries(profile.dimensions)) {
    if (!isObject(labels) || Object.keys(labels).length === 0) {
      throw new Error(`dimension ${dimension} must be a non-empty object of labels`);
    }

    for (const [label, keywords] of Object.entries(labels)) {
      if (!Array.isArray(keywords) || keywords.length === 0) {
        throw new Error(`dimension ${dimension}.${label} must have a non-empty keyword array`);
      }

      for (const keyword of keywords) {
        if (typeof keyword !== 'string' || !keyword.trim()) {
          throw new Error(`dimension ${dimension}.${label} has invalid keyword entry`);
        }
      }
    }
  }
}

function readProfileFile(profileFile) {
  const raw = fs.readFileSync(profileFile, 'utf8');
  const parsed = JSON.parse(raw);
  validateProfile(parsed);
  return parsed;
}

function resolveProfilePath({ profileName, profilesDir = PROFILES_DIR }) {
  return path.resolve(profilesDir, `${profileName}.json`);
}

function loadProfileByName({
  profileName = DEFAULT_PROFILE_NAME,
  profilesDir = PROFILES_DIR,
} = {}) {
  const profilePath = resolveProfilePath({ profileName, profilesDir });
  const profile = readProfileFile(profilePath);
  return {
    ...profile,
    profile_name: profileName,
    profile_path: profilePath,
    confidence_denominator_factor:
      profile.confidence_denominator_factor || DEFAULT_CONFIDENCE_DENOMINATOR_FACTOR,
  };
}

module.exports = {
  PROFILES_DIR,
  DEFAULT_PROFILE_NAME,
  DEFAULT_CONFIDENCE_DENOMINATOR_FACTOR,
  validateProfile,
  resolveProfilePath,
  loadProfileByName,
};
