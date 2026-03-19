const fs = require('fs');
const yaml = require('js-yaml');

const LABEL_CATEGORIES = [
  'user_groups',
  'finding_types',
  'severity_levels',
  'research_themes',
  'product_areas',
  'research_methods',
  'device_platforms',
  'journey_stages',
  'user_characteristics',
  'emotional_states',
  'life_events',
  'trust_factors',
  'channel_switching',
  'temporal_patterns',
  'design_system_patterns',
];

function collectLabelValues(value, outSet) {
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') {
        const normalized = item.trim();
        if (normalized) outSet.add(normalized);
        continue;
      }

      if (item && typeof item === 'object') {
        if (typeof item.value === 'string' && item.value.trim()) {
          outSet.add(item.value.trim());
        }
      }
    }
    return;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (normalized) outSet.add(normalized);
  }
}

function maybeCollectFromCategoryObject(node, category, outSet) {
  if (!node || typeof node !== 'object') return false;
  if (!Object.prototype.hasOwnProperty.call(node, category)) return false;

  const categoryValue = node[category];

  if (Array.isArray(categoryValue)) {
    collectLabelValues(categoryValue, outSet);
    return true;
  }

  if (categoryValue && typeof categoryValue === 'object') {
    const candidateKeys = ['labels', 'values', 'options', 'allowed_values', 'items'];
    let collected = false;

    for (const key of candidateKeys) {
      if (Object.prototype.hasOwnProperty.call(categoryValue, key)) {
        collectLabelValues(categoryValue[key], outSet);
        collected = true;
      }
    }

    if (!collected) {
      collectLabelValues(categoryValue, outSet);
    }

    return true;
  }

  if (typeof categoryValue === 'string') {
    outSet.add(categoryValue.trim());
    return true;
  }

  return false;
}

function walkForCategoryValues(node, taxonomyMap) {
  if (!node || typeof node !== 'object') return;

  for (const category of LABEL_CATEGORIES) {
    maybeCollectFromCategoryObject(node, category, taxonomyMap[category]);
  }

  if (Array.isArray(node)) {
    for (const item of node) walkForCategoryValues(item, taxonomyMap);
    return;
  }

  for (const value of Object.values(node)) {
    walkForCategoryValues(value, taxonomyMap);
  }
}

function parseTaxonomyYaml(taxonomyYamlText) {
  const parsed = yaml.load(taxonomyYamlText);
  const taxonomyMap = {};

  for (const category of LABEL_CATEGORIES) {
    taxonomyMap[category] = new Set();
  }

  walkForCategoryValues(parsed, taxonomyMap);

  return {
    sourceShape: parsed && typeof parsed === 'object' ? Object.keys(parsed).slice(0, 20) : [],
    allowedLabels: Object.fromEntries(
      Object.entries(taxonomyMap).map(([category, values]) => [
        category,
        new Set(
          Array.from(values)
            .map(value => value.trim())
            .filter(Boolean),
        ),
      ]),
    ),
  };
}

async function loadTaxonomy({ taxonomyFile = '' } = {}) {
  if (!taxonomyFile) {
    return {
      raw: '',
      taxonomyUrl: null,
      taxonomyFile: '',
      sourceShape: [],
      allowedLabels: Object.fromEntries(LABEL_CATEGORIES.map(category => [category, new Set()])),
    };
  }

  const raw = fs.readFileSync(taxonomyFile, 'utf8');
  const parsed = parseTaxonomyYaml(raw);

  return {
    raw,
    taxonomyUrl: taxonomyFile,
    taxonomyFile,
    ...parsed,
  };
}

module.exports = {
  LABEL_CATEGORIES,
  loadTaxonomy,
  parseTaxonomyYaml,
};
