const yaml = require('js-yaml');

const BLOCK_PATTERNS = [
  {
    kind: 'key-finding-labels',
    regex: /```yaml\s+key-finding-labels[^\n]*\n([\s\S]*?)\n```/g,
  },
  {
    kind: 'legacy-labels',
    regex: /(?:\*\*Labels:\*\*|Labels:)\s*\n```yaml\s*\n([\s\S]*?)\n```/g,
  },
];

function normalizeLegacyFindingShape(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;

  if (data.finding_title && data.labels) return data;

  const keys = Object.keys(data);
  if (keys.length !== 1) return data;

  const candidateTitle = keys[0];
  const candidatePayload = data[candidateTitle];

  if (!/^Finding\s+\d+\s*:/i.test(candidateTitle)) return data;
  if (!candidatePayload || typeof candidatePayload !== 'object' || Array.isArray(candidatePayload)) return data;

  return {
    finding_title: candidateTitle.trim(),
    labels: candidatePayload,
  };
}

function extractMatches(content) {
  const matches = [];

  for (const { kind, regex } of BLOCK_PATTERNS) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        kind,
        index: match.index,
        raw: match[1],
      });
    }
  }

  matches.sort((a, b) => a.index - b.index);
  return matches;
}

function preprocessLegacyRaw(raw) {
  const lines = raw.split('\n');
  const firstNonEmptyIndex = lines.findIndex(line => line.trim().length > 0);
  if (firstNonEmptyIndex < 0) return raw;

  const firstLine = lines[firstNonEmptyIndex].trim();
  if (!/^Finding\s+\d+\s*:/i.test(firstLine)) return raw;

  let rewritten = `"${firstLine.replace(/"/g, '\\"')}":\n`;
  for (let i = firstNonEmptyIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (/^\s/.test(line)) {
      rewritten += `${line}\n`;
    } else {
      rewritten += `  ${line}\n`;
    }
  }

  return rewritten.trimEnd();
}

function parseLabelBlocksFromContent(content, filePath) {
  const parsedBlocks = [];
  const matches = extractMatches(content);
  let blockIndex = 0;

  for (const match of matches) {
    blockIndex += 1;
    const raw = match.kind === 'legacy-labels' ? preprocessLegacyRaw(match.raw) : match.raw;
    const styleWarnings = [];

    if (match.kind === 'legacy-labels') {
      styleWarnings.push({
        file: filePath,
        finding_id: null,
        code: 'LEGACY_LABELS_BLOCK',
        message: `Block ${blockIndex} parsed from legacy Labels section (non key-finding-labels fence).`,
      });
    }

    const firstNonEmptyLine = raw
      .split('\n')
      .find(line => line.trim().length > 0);

    if (firstNonEmptyLine && /^\s+/.test(firstNonEmptyLine)) {
      styleWarnings.push({
        file: filePath,
        finding_id: null,
        code: 'STYLE_INDENTED_BLOCK',
        message: `Block ${blockIndex} starts with indented top-level YAML keys.`,
      });
    }

    try {
      const parsed = yaml.load(raw);
      const wrapped = Boolean(
        parsed &&
          typeof parsed === 'object' &&
          !Array.isArray(parsed) &&
          parsed['key-finding-labels'] &&
          typeof parsed['key-finding-labels'] === 'object',
      );

      if (wrapped) {
        styleWarnings.push({
          file: filePath,
          finding_id: null,
          code: 'STYLE_WRAPPED_BLOCK',
          message: `Block ${blockIndex} uses the optional key-finding-labels wrapper.`,
        });
      }

      const baseData = wrapped ? parsed['key-finding-labels'] : parsed;
      const data = normalizeLegacyFindingShape(baseData);

      parsedBlocks.push({
        file: filePath,
        blockIndex,
        raw,
        wrapped,
        kind: match.kind,
        data,
        parseError: null,
        styleWarnings,
      });
    } catch (error) {
      parsedBlocks.push({
        file: filePath,
        blockIndex,
        raw,
        wrapped: false,
        kind: match.kind,
        data: null,
        parseError: {
          file: filePath,
          finding_id: null,
          code: 'MALFORMED_YAML',
          message: `Block ${blockIndex} has invalid YAML: ${error.message}`,
        },
        styleWarnings,
      });
    }
  }

  return parsedBlocks;
}

module.exports = {
  parseLabelBlocksFromContent,
};
