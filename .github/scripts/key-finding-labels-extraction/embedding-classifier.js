function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function tokenize(value) {
  return normalize(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function classifyWithEmbeddingStub({ text, taxonomy, maxLabelsPerDimension = 5 }) {
  const textTokens = new Set(tokenize(text));
  const output = {};

  for (const [dimension, labels] of Object.entries(taxonomy || {})) {
    const matches = [];

    for (const [label, keywords] of Object.entries(labels || {})) {
      let overlap = 0;
      let keywordTokenCount = 0;
      const matchedKeywords = [];

      for (const keyword of keywords || []) {
        const kwTokens = tokenize(keyword);
        if (!kwTokens.length) continue;
        keywordTokenCount += kwTokens.length;

        const tokenHit = kwTokens.some(token => textTokens.has(token));
        if (tokenHit) {
          overlap += 1;
          matchedKeywords.push(keyword);
        }
      }

      if (!overlap) continue;

      const confidence = Math.min(
        overlap / Math.max(Math.ceil((keywords || []).length * 0.5), 1),
        1,
      );
      matches.push({
        label,
        confidence: Math.round(confidence * 1000) / 1000,
        signal: 'embedding_stub',
        matched_keywords: matchedKeywords.sort(),
        keyword_token_count: keywordTokenCount,
      });
    }

    if (matches.length > 0) {
      output[dimension] = matches
        .sort((a, b) => b.confidence - a.confidence || a.label.localeCompare(b.label))
        .slice(0, maxLabelsPerDimension);
    }
  }

  return output;
}

function createEmbeddingClassifier({
  mode = 'off',
  taxonomy = {},
  maxLabelsPerDimension = 5,
} = {}) {
  if (mode === 'off') {
    return {
      mode: 'off',
      enabled: false,
      classify() {
        return {};
      },
    };
  }

  if (mode === 'stub') {
    return {
      mode: 'stub',
      enabled: true,
      classify(text) {
        return classifyWithEmbeddingStub({
          text,
          taxonomy,
          maxLabelsPerDimension,
        });
      },
    };
  }

  throw new Error(`Unsupported embedding mode: ${mode}`);
}

module.exports = {
  classifyWithEmbeddingStub,
  createEmbeddingClassifier,
};
