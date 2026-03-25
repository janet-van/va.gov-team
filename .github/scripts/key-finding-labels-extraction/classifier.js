const { ENRICHMENT_TAXONOMY, CONFIDENCE_DENOMINATOR_FACTOR } = require('./enrichment-taxonomy');

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function classifyText({
  text,
  taxonomy = ENRICHMENT_TAXONOMY,
  confidenceDenominatorFactor = CONFIDENCE_DENOMINATOR_FACTOR,
}) {
  const normalized = normalizeText(text);
  const suggestedLabels = {};

  for (const [dimension, labels] of Object.entries(taxonomy)) {
    const matches = [];

    for (const [label, keywords] of Object.entries(labels)) {
      const matchedKeywords = keywords.filter(keyword => normalized.includes(normalizeText(keyword)));
      if (matchedKeywords.length === 0) continue;

      const denominator = Math.max(keywords.length * confidenceDenominatorFactor, 1);
      const confidence = Math.min(matchedKeywords.length / denominator, 1);

      matches.push({
        label,
        confidence: Math.round(confidence * 1000) / 1000,
        match_count: matchedKeywords.length,
        matched_keywords: matchedKeywords.sort(),
      });
    }

    if (matches.length > 0) {
      suggestedLabels[dimension] = matches.sort((a, b) => {
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        if (b.match_count !== a.match_count) return b.match_count - a.match_count;
        return a.label.localeCompare(b.label);
      });
    }
  }

  return suggestedLabels;
}

function clamp01(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 1) return 1;
  return parsed;
}

function fuseSuggestedLabels({
  ruleSuggestedLabels = {},
  embeddingSuggestions = {},
  embeddingWeight = 0.35,
  fusionThreshold = 0.25,
  maxLabelsPerDimension = 20,
}) {
  const weight = clamp01(embeddingWeight);
  const threshold = clamp01(fusionThreshold);
  const dimensions = new Set([
    ...Object.keys(ruleSuggestedLabels || {}),
    ...Object.keys(embeddingSuggestions || {}),
  ]);
  const fused = {};

  for (const dimension of dimensions) {
    const scoreByLabel = new Map();
    const ruleLabels = ruleSuggestedLabels[dimension] || [];
    const embeddingLabels = embeddingSuggestions[dimension] || [];

    for (const item of ruleLabels) {
      const prev = scoreByLabel.get(item.label) || {
        label: item.label,
        rule_confidence: 0,
        embedding_confidence: 0,
      };
      prev.rule_confidence = Math.max(prev.rule_confidence, clamp01(item.confidence));
      scoreByLabel.set(item.label, prev);
    }

    for (const item of embeddingLabels) {
      const prev = scoreByLabel.get(item.label) || {
        label: item.label,
        rule_confidence: 0,
        embedding_confidence: 0,
      };
      prev.embedding_confidence = Math.max(prev.embedding_confidence, clamp01(item.confidence));
      scoreByLabel.set(item.label, prev);
    }

    const merged = Array.from(scoreByLabel.values())
      .map(item => {
        const confidence = (item.rule_confidence * (1 - weight)) + (item.embedding_confidence * weight);
        return {
          label: item.label,
          confidence: Math.round(confidence * 1000) / 1000,
          rule_confidence: Math.round(item.rule_confidence * 1000) / 1000,
          embedding_confidence: Math.round(item.embedding_confidence * 1000) / 1000,
          fusion_mode: 'weighted',
        };
      })
      .filter(item => item.confidence >= threshold)
      .sort((a, b) => b.confidence - a.confidence || a.label.localeCompare(b.label))
      .slice(0, maxLabelsPerDimension);

    if (merged.length > 0) {
      fused[dimension] = merged;
    }
  }

  return fused;
}

function enrichFindings(
  findings,
  {
    taxonomy = ENRICHMENT_TAXONOMY,
    confidenceDenominatorFactor = CONFIDENCE_DENOMINATOR_FACTOR,
    embeddingClassifier = null,
    embeddingWeight = 0.35,
    fusionMode = 'rules_only',
    fusionThreshold = 0.25,
  } = {},
) {
  return findings.map(finding => {
    const contextText = [
      finding.finding_title,
      ...(finding.supporting_context_texts || []),
    ]
      .map(part => String(part || '').trim())
      .filter(Boolean)
      .join('\n');

    const ruleSuggestedLabels = classifyText({
      text: contextText,
      taxonomy,
      confidenceDenominatorFactor,
    });
    const embeddingSuggestions =
      embeddingClassifier && embeddingClassifier.enabled
        ? embeddingClassifier.classify(contextText)
        : {};
    const finalSuggestedLabels =
      fusionMode === 'weighted'
        ? fuseSuggestedLabels({
            ruleSuggestedLabels,
            embeddingSuggestions,
            embeddingWeight,
            fusionThreshold,
          })
        : ruleSuggestedLabels;

    return {
      artifact_schema_version: '1.0.0',
      finding_uid: finding.finding_uid,
      finding_id_local: finding.finding_id_local,
      source_file: finding.source_file,
      source_kind: finding.source_kind,
      finding_title: finding.finding_title,
      has_explicit_labels: finding.source_kind === 'explicit' || finding.source_kind === 'merged',
      suggested_labels: finalSuggestedLabels,
      rule_suggested_labels: ruleSuggestedLabels,
      embedding_suggestions: embeddingSuggestions,
      classification_engine: {
        rules_enabled: true,
        embedding_mode: embeddingClassifier ? embeddingClassifier.mode : 'off',
        embedding_enabled: Boolean(embeddingClassifier && embeddingClassifier.enabled),
        fusion_mode: fusionMode,
        fusion_threshold: Number(fusionThreshold),
        embedding_weight: Number(embeddingWeight),
      },
      supporting_context_texts: finding.supporting_context_texts || [],
      metadata: finding.metadata || null,
      demographics_summary: finding.demographics_summary || null,
    };
  });
}

module.exports = {
  classifyText,
  fuseSuggestedLabels,
  enrichFindings,
};
