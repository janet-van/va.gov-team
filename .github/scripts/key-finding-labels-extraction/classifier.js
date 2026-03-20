const { ENRICHMENT_TAXONOMY, CONFIDENCE_DENOMINATOR_FACTOR } = require('./enrichment-taxonomy');

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function classifyText({ text, taxonomy = ENRICHMENT_TAXONOMY }) {
  const normalized = normalizeText(text);
  const suggestedLabels = {};

  for (const [dimension, labels] of Object.entries(taxonomy)) {
    const matches = [];

    for (const [label, keywords] of Object.entries(labels)) {
      const matchedKeywords = keywords.filter(keyword => normalized.includes(normalizeText(keyword)));
      if (matchedKeywords.length === 0) continue;

      const denominator = Math.max(keywords.length * CONFIDENCE_DENOMINATOR_FACTOR, 1);
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

function enrichFindings(findings) {
  return findings.map(finding => {
    const contextText = [
      finding.finding_title,
      ...(finding.supporting_context_texts || []),
    ]
      .map(part => String(part || '').trim())
      .filter(Boolean)
      .join('\n');

    return {
      artifact_schema_version: '1.0.0',
      finding_uid: finding.finding_uid,
      finding_id_local: finding.finding_id_local,
      source_file: finding.source_file,
      source_kind: finding.source_kind,
      finding_title: finding.finding_title,
      has_explicit_labels: finding.source_kind === 'explicit' || finding.source_kind === 'merged',
      suggested_labels: classifyText({ text: contextText }),
      supporting_context_texts: finding.supporting_context_texts || [],
      metadata: finding.metadata || null,
      demographics_summary: finding.demographics_summary || null,
    };
  });
}

module.exports = {
  classifyText,
  enrichFindings,
};
