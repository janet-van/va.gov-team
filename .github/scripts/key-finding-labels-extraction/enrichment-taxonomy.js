const { loadProfileByName } = require('./taxonomy-profiles');

const profile = loadProfileByName({ profileName: 'enrichment-taxonomy' });
const ENRICHMENT_TAXONOMY = profile.dimensions;
const CONFIDENCE_DENOMINATOR_FACTOR = profile.confidence_denominator_factor;

function validateEnrichmentTaxonomy(taxonomy) {
  if (!taxonomy || typeof taxonomy !== 'object' || Array.isArray(taxonomy)) {
    throw new Error('enrichment taxonomy must be an object');
  }
}

module.exports = {
  CONFIDENCE_DENOMINATOR_FACTOR,
  ENRICHMENT_TAXONOMY,
  validateEnrichmentTaxonomy,
};
