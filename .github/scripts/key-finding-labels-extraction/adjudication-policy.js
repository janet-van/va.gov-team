function toLabelsByDimension(finding) {
  return finding && finding.suggested_labels && typeof finding.suggested_labels === 'object'
    ? finding.suggested_labels
    : {};
}

function getTopTwo(labels) {
  if (!Array.isArray(labels) || labels.length === 0) return { top: null, second: null };
  const sorted = [...labels].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  return {
    top: sorted[0] || null,
    second: sorted[1] || null,
  };
}

function buildDimensionTrigger({
  dimension,
  labels,
  embeddingLabels,
  lowConfidenceThreshold,
  lowMarginThreshold,
  embeddingDisagreementThreshold,
}) {
  const trigger = {
    dimension,
    reasons: [],
    top_label: null,
    top_confidence: null,
    margin: null,
    embedding_top_label: null,
    embedding_top_confidence: null,
  };

  const { top, second } = getTopTwo(labels);
  if (!top) {
    trigger.reasons.push('no_labels');
    return trigger;
  }

  trigger.top_label = top.label;
  trigger.top_confidence = Number(top.confidence || 0);
  if (second) {
    trigger.margin = Number((top.confidence || 0) - (second.confidence || 0));
  } else {
    trigger.margin = 1;
  }

  if (trigger.top_confidence < lowConfidenceThreshold) {
    trigger.reasons.push('low_confidence');
  }
  if (trigger.margin < lowMarginThreshold) {
    trigger.reasons.push('low_margin');
  }

  const embeddingTop = getTopTwo(embeddingLabels || []).top;
  if (embeddingTop) {
    trigger.embedding_top_label = embeddingTop.label;
    trigger.embedding_top_confidence = Number(embeddingTop.confidence || 0);
    const confidenceDelta = Math.abs(trigger.top_confidence - trigger.embedding_top_confidence);

    if (
      trigger.top_label !== embeddingTop.label &&
      confidenceDelta <= embeddingDisagreementThreshold
    ) {
      trigger.reasons.push('embedding_disagreement');
    }
  }

  return trigger;
}

function evaluateAdjudicationPolicy(
  enrichmentFindings,
  {
    mode = 'off',
    lowConfidenceThreshold = 0.45,
    lowMarginThreshold = 0.12,
    embeddingDisagreementThreshold = 0.25,
    minTriggeredDimensions = 1,
  } = {},
) {
  if (mode === 'off') {
    return {
      mode: 'off',
      enabled: false,
      total_findings: enrichmentFindings.length,
      findings_flagged: 0,
      flagged_findings: [],
    };
  }

  if (mode !== 'policy') {
    throw new Error(`Unsupported adjudication mode: ${mode}`);
  }

  const flagged = [];

  for (const finding of enrichmentFindings) {
    const labelsByDimension = toLabelsByDimension(finding);
    const embeddingByDimension = finding.embedding_suggestions || {};
    const triggers = [];

    for (const [dimension, labels] of Object.entries(labelsByDimension)) {
      const trigger = buildDimensionTrigger({
        dimension,
        labels,
        embeddingLabels: embeddingByDimension[dimension] || [],
        lowConfidenceThreshold,
        lowMarginThreshold,
        embeddingDisagreementThreshold,
      });
      if (trigger.reasons.length > 0) {
        triggers.push(trigger);
      }
    }

    if (triggers.length >= minTriggeredDimensions) {
      flagged.push({
        finding_uid: finding.finding_uid,
        source_file: finding.source_file,
        finding_title: finding.finding_title,
        trigger_count: triggers.length,
        triggers,
      });
    }
  }

  return {
    mode: 'policy',
    enabled: true,
    total_findings: enrichmentFindings.length,
    findings_flagged: flagged.length,
    flagged_findings: flagged,
  };
}

module.exports = {
  evaluateAdjudicationPolicy,
  buildDimensionTrigger,
};
