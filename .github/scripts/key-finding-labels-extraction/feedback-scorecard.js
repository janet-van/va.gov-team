function indexCorrectionsByFinding(corrections) {
  const byFinding = new Map();
  for (const correction of corrections || []) {
    const uid = correction && correction.finding_uid ? correction.finding_uid : null;
    if (!uid) continue;
    if (!byFinding.has(uid)) byFinding.set(uid, []);
    byFinding.get(uid).push(correction);
  }
  return byFinding;
}

function generateFeedbackScorecard({
  feedbackIngestion = {},
  enrichment = {},
} = {}) {
  const corrections = Array.isArray(feedbackIngestion.corrections)
    ? feedbackIngestion.corrections
    : [];
  const enrichmentFindings = Array.isArray(enrichment.findings) ? enrichment.findings : [];
  const correctionsByFinding = indexCorrectionsByFinding(corrections);
  const actionCounts = {};
  const dimensionCounts = {};

  for (const correction of corrections) {
    if (correction.action) {
      actionCounts[correction.action] = (actionCounts[correction.action] || 0) + 1;
    }
    if (correction.dimension) {
      dimensionCounts[correction.dimension] = (dimensionCounts[correction.dimension] || 0) + 1;
    }
  }

  const findingsWithFeedback = correctionsByFinding.size;
  const findingsScored = enrichmentFindings.length;
  const correctionRateVsFindings = findingsScored === 0
    ? 0
    : Number((findingsWithFeedback / findingsScored).toFixed(6));

  return {
    artifact_schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    feedback_mode: feedbackIngestion.mode || 'off',
    feedback_loaded: Boolean(feedbackIngestion.loaded),
    findings_scored: findingsScored,
    findings_with_feedback: findingsWithFeedback,
    correction_rate_vs_findings: correctionRateVsFindings,
    corrections_total: corrections.length,
    corrections_by_action: actionCounts,
    corrections_by_dimension: dimensionCounts,
    feedback_errors: Array.isArray(feedbackIngestion.errors) ? feedbackIngestion.errors.length : 0,
    feedback_warnings: Array.isArray(feedbackIngestion.warnings) ? feedbackIngestion.warnings.length : 0,
  };
}

module.exports = {
  generateFeedbackScorecard,
};
