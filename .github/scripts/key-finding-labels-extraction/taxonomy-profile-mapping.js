const { loadProfileByName } = require('./taxonomy-profiles');

const REQUIRED_LEGACY_DIMENSIONS = [
  'finding_types',
  'product_areas',
  'user_groups',
  'research_themes',
  'veteran_journey_stages',
  'severity_indicators',
  'emotional_states',
];

const LEGACY_TO_ENRICHMENT_DIMENSION_MAP = {
  finding_types: 'finding_types',
  product_areas: 'product_areas',
  user_groups: 'user_groups',
  research_themes: 'research_themes',
  veteran_journey_stages: 'journey_stages',
  severity_indicators: 'severity_levels',
  emotional_states: 'emotional_states',
};

// Explicit drift mappings where labels do not match by name.
// Shape: `${legacyDimension}:${legacyLabel}` -> [{ dimension, label }]
const LEGACY_TO_ENRICHMENT_LABEL_MAP = {
  'finding_types:positive_finding': [{ dimension: 'finding_types', label: 'positive_feedback' }],
  'finding_types:content_issue': [{ dimension: 'finding_types', label: 'content_confusion' }],
  'finding_types:navigation_issue': [{ dimension: 'research_themes', label: 'navigation_wayfinding' }],
  'finding_types:trust_issue': [{ dimension: 'research_themes', label: 'trust_credibility' }],
  'finding_types:mental_model_mismatch': [{ dimension: 'finding_types', label: 'behavioral_pattern' }],
  'finding_types:process_issue': [{ dimension: 'finding_types', label: 'workflow_insight' }],
  'finding_types:emotional_response': [{ dimension: 'research_themes', label: 'pain_points' }],

  'product_areas:benefits_claims': [{ dimension: 'product_areas', label: 'claims_appeals' }],
  'product_areas:debt_financial': [{ dimension: 'product_areas', label: 'benefits' }],
  'product_areas:identity_auth': [{ dimension: 'research_themes', label: 'authentication_login' }],
  'product_areas:memorial_burial': [{ dimension: 'product_areas', label: 'benefits' }],
  'product_areas:caregiver': [{ dimension: 'user_groups', label: 'caregivers' }],
  'product_areas:forms': [{ dimension: 'research_themes', label: 'form_completion' }],
  'product_areas:search': [{ dimension: 'research_themes', label: 'help_support' }],
  'product_areas:notifications': [{ dimension: 'research_themes', label: 'help_support' }],

  'user_groups:assistive_tech_users': [{ dimension: 'user_groups', label: 'cognitive_considerations' }],
  'user_groups:cognitive_disability': [{ dimension: 'user_groups', label: 'cognitive_considerations' }],
  'user_groups:older_veterans': [{ dimension: 'user_groups', label: 'veterans' }],
  'user_groups:rural_veterans': [{ dimension: 'user_groups', label: 'rural_location' }],
  'user_groups:mobile_users': [{ dimension: 'research_themes', label: 'mobile_experience' }],
  'user_groups:lgbtq_plus': [{ dimension: 'user_groups', label: 'veterans' }],
  'user_groups:minority_veterans': [{ dimension: 'user_groups', label: 'veterans' }],
  'user_groups:homeless_veterans': [{ dimension: 'user_groups', label: 'veterans' }],

  'research_themes:sign_in_authentication': [{ dimension: 'research_themes', label: 'authentication_login' }],
  'research_themes:status_tracking': [{ dimension: 'journey_stages', label: 'waiting_period' }],
  'research_themes:information_seeking': [{ dimension: 'research_themes', label: 'help_support' }],
  'research_themes:error_handling': [{ dimension: 'finding_types', label: 'technical_problem' }],
  'research_themes:notification_communication': [{ dimension: 'research_themes', label: 'help_support' }],
  'research_themes:personalization': [{ dimension: 'product_areas', label: 'profile_account' }],
  'research_themes:cross_channel': [{ dimension: 'research_themes', label: 'help_support' }],
  'research_themes:data_privacy': [{ dimension: 'research_themes', label: 'trust_credibility' }],

  'veteran_journey_stages:discovering_benefits': [{ dimension: 'journey_stages', label: 'discovery' }],
  'veteran_journey_stages:applying_for_benefits': [{ dimension: 'journey_stages', label: 'application' }],
  'veteran_journey_stages:managing_benefits': [{ dimension: 'journey_stages', label: 'ongoing_management' }],
  'veteran_journey_stages:resolving_issues': [{ dimension: 'journey_stages', label: 'appeal' }],
  'veteran_journey_stages:transitioning': [{ dimension: 'journey_stages', label: 'life_change_update' }],

  'emotional_states:satisfied': [{ dimension: 'emotional_states', label: 'confident' }],
  'emotional_states:distrustful': [{ dimension: 'emotional_states', label: 'skeptical' }],
};

function findMappedDimension(legacyDimension) {
  return LEGACY_TO_ENRICHMENT_DIMENSION_MAP[legacyDimension] || null;
}

function mapLegacyLabelToEnrichment({ legacyDimension, legacyLabel, enrichmentProfile }) {
  const explicit = LEGACY_TO_ENRICHMENT_LABEL_MAP[`${legacyDimension}:${legacyLabel}`];
  if (explicit && explicit.length > 0) return explicit;

  const mappedDimension = findMappedDimension(legacyDimension);
  if (!mappedDimension) return [];

  const dimensionLabels = (enrichmentProfile && enrichmentProfile.dimensions[mappedDimension]) || null;
  if (dimensionLabels && Object.prototype.hasOwnProperty.call(dimensionLabels, legacyLabel)) {
    return [{ dimension: mappedDimension, label: legacyLabel }];
  }

  return [];
}

function validateLegacyToEnrichmentMapping({
  legacyProfile = loadProfileByName({ profileName: 'legacy-taxonomy' }),
  enrichmentProfile = loadProfileByName({ profileName: 'enrichment-taxonomy' }),
  requiredDimensions = REQUIRED_LEGACY_DIMENSIONS,
} = {}) {
  const issues = [];

  for (const legacyDimension of requiredDimensions) {
    const mappedDimension = findMappedDimension(legacyDimension);
    if (!mappedDimension) {
      issues.push({
        code: 'MISSING_DIMENSION_MAPPING',
        message: `Missing mapped target dimension for ${legacyDimension}`,
      });
      continue;
    }

    if (!enrichmentProfile.dimensions[mappedDimension]) {
      issues.push({
        code: 'TARGET_DIMENSION_NOT_FOUND',
        message: `Mapped target dimension ${mappedDimension} for ${legacyDimension} is not present in enrichment profile`,
      });
      continue;
    }

    const legacyLabels = Object.keys(legacyProfile.dimensions[legacyDimension] || {});
    for (const legacyLabel of legacyLabels) {
      const targets = mapLegacyLabelToEnrichment({
        legacyDimension,
        legacyLabel,
        enrichmentProfile,
      });

      if (!targets.length) {
        issues.push({
          code: 'MISSING_LABEL_MAPPING',
          message: `No target mapping found for ${legacyDimension}:${legacyLabel}`,
        });
        continue;
      }

      for (const target of targets) {
        const targetDimension = enrichmentProfile.dimensions[target.dimension];
        if (!targetDimension) {
          issues.push({
            code: 'INVALID_TARGET_DIMENSION',
            message: `Mapped target dimension ${target.dimension} not found for ${legacyDimension}:${legacyLabel}`,
          });
          continue;
        }

        if (!Object.prototype.hasOwnProperty.call(targetDimension, target.label)) {
          issues.push({
            code: 'INVALID_TARGET_LABEL',
            message: `Mapped target label ${target.dimension}:${target.label} not found for ${legacyDimension}:${legacyLabel}`,
          });
        }
      }
    }
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

module.exports = {
  REQUIRED_LEGACY_DIMENSIONS,
  LEGACY_TO_ENRICHMENT_DIMENSION_MAP,
  LEGACY_TO_ENRICHMENT_LABEL_MAP,
  findMappedDimension,
  mapLegacyLabelToEnrichment,
  validateLegacyToEnrichmentMapping,
};
