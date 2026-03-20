const {
  generateDeterministicFindingId,
  generateDeterministicFindingUid,
  buildFindingMergeKey,
} = require('./deterministic-id');
const { LABEL_CATEGORIES } = require('./taxonomy');

function emptyLabels() {
  const labels = {};
  for (const category of LABEL_CATEGORIES) {
    labels[category] = [];
  }
  return labels;
}

function normalizeFrontmatterFinding(finding) {
  const findingIdLocal = generateDeterministicFindingId({
    sourceFile: finding.source_file,
    findingTitle: finding.finding_title,
  });

  const findingUid = generateDeterministicFindingUid({
    sourceFile: finding.source_file,
    findingIdLocal,
    findingTitle: finding.finding_title,
  });

  return {
    source_file: finding.source_file,
    finding_id_local: findingIdLocal,
    finding_uid: findingUid,
    finding_title: finding.finding_title,
    labels: emptyLabels(),
    service_journey_mapping: [],
    pattern_triggers: [],
    source_kind: 'frontmatter',
    supporting_context_texts: [finding.finding_text],
    metadata: finding.metadata || null,
    demographics_summary: finding.demographics_summary || null,
  };
}

function toCanonicalExplicitFinding(finding) {
  return {
    ...finding,
    source_kind: 'explicit',
    supporting_context_texts: [],
    metadata: null,
    demographics_summary: null,
  };
}

function mergeCanonicalFindings({ explicitFindings, frontmatterFindings }) {
  const canonicalByKey = new Map();

  for (const finding of explicitFindings) {
    const mergeKey = buildFindingMergeKey({
      sourceFile: finding.source_file,
      findingTitle: finding.finding_title,
    });

    canonicalByKey.set(mergeKey, toCanonicalExplicitFinding(finding));
  }

  for (const finding of frontmatterFindings) {
    const mergeKey = buildFindingMergeKey({
      sourceFile: finding.source_file,
      findingTitle: finding.finding_title,
    });

    const existing = canonicalByKey.get(mergeKey);
    const frontmatterNormalized = normalizeFrontmatterFinding(finding);

    if (!existing) {
      canonicalByKey.set(mergeKey, frontmatterNormalized);
      continue;
    }

    // Prefer explicit labels while preserving frontmatter context.
    const next = {
      ...existing,
      source_kind: 'merged',
      supporting_context_texts: Array.from(
        new Set([...(existing.supporting_context_texts || []), finding.finding_text]),
      ),
      metadata: existing.metadata || finding.metadata || null,
      demographics_summary: existing.demographics_summary || finding.demographics_summary || null,
    };

    canonicalByKey.set(mergeKey, next);
  }

  return Array.from(canonicalByKey.values()).sort((a, b) => {
    if (a.source_file !== b.source_file) return a.source_file.localeCompare(b.source_file);
    return String(a.finding_title).localeCompare(String(b.finding_title));
  });
}

module.exports = {
  mergeCanonicalFindings,
};
