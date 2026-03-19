const { LABEL_CATEGORIES } = require('./taxonomy');

function toStringArray(value) {
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    return value
      .map(item => String(item).trim())
      .filter(Boolean);
  }

  const normalized = String(value).trim();
  return normalized ? [normalized] : [];
}

function unique(values) {
  return Array.from(new Set(values));
}

function normalizeFinding({ sourceFile, data }) {
  const labels = data && data.labels && typeof data.labels === 'object' ? data.labels : {};
  const normalizedLabels = {};

  for (const category of LABEL_CATEGORIES) {
    normalizedLabels[category] = unique(toStringArray(labels[category]));
  }

  return {
    source_file: sourceFile,
    finding_id_local: data.finding_id,
    finding_uid: data.finding_uid,
    finding_title: String(data.finding_title || '').trim(),
    labels: normalizedLabels,
    service_journey_mapping: unique(toStringArray(data.service_journey_mapping)),
    pattern_triggers: unique(toStringArray(data.pattern_triggers)),
  };
}

module.exports = {
  normalizeFinding,
  toStringArray,
};
