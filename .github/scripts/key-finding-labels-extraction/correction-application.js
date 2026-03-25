function cloneLabelsByDimension(labelsByDimension) {
  const cloned = {};
  for (const [dimension, labels] of Object.entries(labelsByDimension || {})) {
    if (!Array.isArray(labels)) continue;
    cloned[dimension] = labels.map(item => ({ ...item }));
  }
  return cloned;
}

function sortLabels(labels) {
  return [...labels].sort((a, b) => {
    const aConfidence = Number(a.confidence || 0);
    const bConfidence = Number(b.confidence || 0);
    if (bConfidence !== aConfidence) return bConfidence - aConfidence;
    return String(a.label || '').localeCompare(String(b.label || ''));
  });
}

function normalizeDimensionLabels(labels) {
  return sortLabels(
    (labels || []).filter(
      item => item && typeof item.label === 'string' && item.label.trim().length > 0,
    ),
  );
}

function toCorrectionOrderKey(correction, index) {
  return [
    String(correction.finding_uid || ''),
    String(correction.dimension || ''),
    String(correction.action || ''),
    String(correction.label || ''),
    String(correction.replaced_label || ''),
    String(index).padStart(8, '0'),
  ].join('|');
}

function applyCorrectionToLabels({
  labelsByDimension,
  correction,
  findingUid,
}) {
  const result = {
    applied: false,
    reason: '',
    dimension: correction.dimension,
    action: correction.action,
  };

  const current = normalizeDimensionLabels(labelsByDimension[correction.dimension] || []);
  const existingByLabel = new Map(current.map(item => [item.label, item]));
  const targetLabel = correction.label;
  const replacementSourceLabel = correction.replaced_label;

  if (correction.action === 'add') {
    if (existingByLabel.has(targetLabel)) {
      result.reason = 'already_present';
      return result;
    }
    const next = normalizeDimensionLabels([
      ...current,
      {
        label: targetLabel,
        confidence: 1,
        correction_source: 'review_feedback',
      },
    ]);
    labelsByDimension[correction.dimension] = next;
    result.applied = true;
    result.reason = 'added';
    return result;
  }

  if (correction.action === 'remove') {
    if (!existingByLabel.has(targetLabel)) {
      result.reason = 'label_missing';
      return result;
    }
    const next = current.filter(item => item.label !== targetLabel);
    if (next.length === 0) {
      delete labelsByDimension[correction.dimension];
    } else {
      labelsByDimension[correction.dimension] = next;
    }
    result.applied = true;
    result.reason = 'removed';
    return result;
  }

  if (correction.action === 'replace') {
    if (!replacementSourceLabel) {
      result.reason = 'missing_replaced_label';
      return result;
    }
    if (!existingByLabel.has(replacementSourceLabel)) {
      result.reason = 'replaced_label_missing';
      return result;
    }
    const withoutSource = current.filter(item => item.label !== replacementSourceLabel);
    const hasTarget = withoutSource.some(item => item.label === targetLabel);
    const next = hasTarget
      ? withoutSource
      : [
          ...withoutSource,
          {
            label: targetLabel,
            confidence: 1,
            correction_source: 'review_feedback',
          },
        ];
    labelsByDimension[correction.dimension] = normalizeDimensionLabels(next);
    result.applied = true;
    result.reason = 'replaced';
    return result;
  }

  result.reason = 'unsupported_action';
  return result;
}

function applyCorrectionsToEnrichment({
  enrichmentFindings = [],
  feedbackIngestion = {},
  mode = 'off',
} = {}) {
  const enabled = mode === 'apply';
  const loaded = Boolean(feedbackIngestion && feedbackIngestion.loaded);
  const corrections = Array.isArray(feedbackIngestion && feedbackIngestion.corrections)
    ? feedbackIngestion.corrections
    : [];

  if (!enabled || !loaded || corrections.length === 0) {
    return {
      artifact_schema_version: '1.0.0',
      mode,
      enabled,
      feedback_loaded: loaded,
      corrections_total: corrections.length,
      corrections_applied: 0,
      corrections_ignored: corrections.length,
      findings_touched: 0,
      dimension_changes: {},
      corrected_findings: enrichmentFindings.map(finding => ({ ...finding })),
      change_log: [],
    };
  }

  const sortedCorrections = corrections
    .map((correction, index) => ({ ...correction, __index: index }))
    .sort((a, b) => toCorrectionOrderKey(a, a.__index).localeCompare(toCorrectionOrderKey(b, b.__index)));
  const byFindingUid = new Map(enrichmentFindings.map(finding => [finding.finding_uid, finding]));
  const correctedByUid = new Map();
  const touchedFindings = new Set();
  const dimensionChanges = {};
  const changeLog = [];
  let appliedCount = 0;
  let ignoredCount = 0;

  for (const correction of sortedCorrections) {
    const findingUid = correction.finding_uid;
    const finding = byFindingUid.get(findingUid);

    if (!finding) {
      ignoredCount += 1;
      changeLog.push({
        finding_uid: findingUid,
        correction_index: correction.__index,
        applied: false,
        reason: 'finding_not_found',
        action: correction.action,
        dimension: correction.dimension,
        label: correction.label,
        replaced_label: correction.replaced_label || null,
      });
      continue;
    }

    const corrected = correctedByUid.get(findingUid) || {
      ...finding,
      suggested_labels: cloneLabelsByDimension(finding.suggested_labels || {}),
    };
    const result = applyCorrectionToLabels({
      labelsByDimension: corrected.suggested_labels,
      correction,
      findingUid,
    });
    correctedByUid.set(findingUid, corrected);

    if (result.applied) {
      appliedCount += 1;
      touchedFindings.add(findingUid);
      dimensionChanges[result.dimension] = (dimensionChanges[result.dimension] || 0) + 1;
    } else {
      ignoredCount += 1;
    }

    changeLog.push({
      finding_uid: findingUid,
      correction_index: correction.__index,
      applied: result.applied,
      reason: result.reason,
      action: correction.action,
      dimension: correction.dimension,
      label: correction.label,
      replaced_label: correction.replaced_label || null,
    });
  }

  const correctedFindings = enrichmentFindings.map(finding => {
    const corrected = correctedByUid.get(finding.finding_uid);
    if (!corrected) return { ...finding };
    return {
      ...corrected,
      correction_applied: true,
    };
  });

  return {
    artifact_schema_version: '1.0.0',
    mode,
    enabled,
    feedback_loaded: loaded,
    corrections_total: corrections.length,
    corrections_applied: appliedCount,
    corrections_ignored: ignoredCount,
    findings_touched: touchedFindings.size,
    dimension_changes: dimensionChanges,
    corrected_findings: correctedFindings,
    change_log: changeLog,
  };
}

module.exports = {
  applyCorrectionsToEnrichment,
};
