function sortedUnique(values) {
  return Array.from(new Set(values || [])).sort((a, b) => String(a).localeCompare(String(b)));
}

function toDimensionLabelMap(finding) {
  const result = {};
  for (const [dimension, labels] of Object.entries((finding && finding.suggested_labels) || {})) {
    if (!Array.isArray(labels)) continue;
    result[dimension] = sortedUnique(
      labels.map(item => item && item.label).filter(Boolean),
    );
  }
  return result;
}

function buildCorrectionIndex(changeLog = []) {
  const map = new Map();
  for (const change of changeLog || []) {
    if (!change || !change.finding_uid || !change.dimension) continue;
    const key = `${change.finding_uid}::${change.dimension}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(change);
  }
  return map;
}

function compareRows(a, b) {
  if (a.finding_uid !== b.finding_uid) return a.finding_uid.localeCompare(b.finding_uid);
  if (a.dimension !== b.dimension) return a.dimension.localeCompare(b.dimension);
  return 0;
}

function generateRecalibrationRows({
  summary = {},
  enrichment = {},
  correctionApplication = {},
  feedbackIngestion = {},
} = {}) {
  const enrichmentFindings = Array.isArray(enrichment.findings) ? enrichment.findings : [];
  const correctedFindings = Array.isArray(correctionApplication.corrected_findings)
    ? correctionApplication.corrected_findings
    : enrichmentFindings;
  const correctionIndex = buildCorrectionIndex(correctionApplication.change_log || []);
  const correctedByUid = new Map(correctedFindings.map(item => [item.finding_uid, item]));
  const rows = [];

  for (const finding of enrichmentFindings) {
    const corrected = correctedByUid.get(finding.finding_uid) || finding;
    const predicted = toDimensionLabelMap(finding);
    const correctedLabels = toDimensionLabelMap(corrected);
    const dimensions = sortedUnique([
      ...Object.keys(predicted),
      ...Object.keys(correctedLabels),
    ]);
    const sourceText = [finding.finding_title, ...(finding.supporting_context_texts || [])]
      .map(item => String(item || '').trim())
      .filter(Boolean)
      .join('\n');

    for (const dimension of dimensions) {
      const key = `${finding.finding_uid}::${dimension}`;
      const changes = correctionIndex.get(key) || [];
      rows.push({
        schema_version: '1.0.0',
        finding_uid: finding.finding_uid,
        finding_id_local: finding.finding_id_local || null,
        taxonomy_profile: summary.taxonomy_profile || null,
        taxonomy_profile_version: summary.taxonomy_profile_version || null,
        source_file: finding.source_file || null,
        source_kind: finding.source_kind || null,
        dimension,
        input_text: sourceText,
        predicted_labels: predicted[dimension] || [],
        corrected_labels: correctedLabels[dimension] || [],
        has_correction: changes.some(change => change.applied),
        correction_actions: changes
          .filter(change => change.applied)
          .map(change => change.action)
          .sort((a, b) => String(a).localeCompare(String(b))),
        correction_reasons: changes
          .map(change => change.reason)
          .filter(Boolean)
          .sort((a, b) => String(a).localeCompare(String(b))),
      });
    }
  }

  rows.sort(compareRows);
  return rows;
}

function buildRecalibrationManifest({
  summary = {},
  feedbackIngestion = {},
  correctionApplication = {},
  rows = [],
} = {}) {
  const dimensions = sortedUnique(rows.map(row => row.dimension));
  const rowsWithCorrections = rows.filter(row => row.has_correction).length;
  return {
    artifact_schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    source_summary_generated_at: summary.generated_at || null,
    taxonomy_profile: summary.taxonomy_profile || null,
    taxonomy_profile_version: summary.taxonomy_profile_version || null,
    feedback_mode: feedbackIngestion.mode || 'off',
    feedback_loaded: Boolean(feedbackIngestion.loaded),
    correction_application_mode: correctionApplication.mode || 'off',
    correction_application_enabled: Boolean(correctionApplication.enabled),
    rows_total: rows.length,
    rows_with_corrections: rowsWithCorrections,
    dimensions,
  };
}

module.exports = {
  generateRecalibrationRows,
  buildRecalibrationManifest,
};
