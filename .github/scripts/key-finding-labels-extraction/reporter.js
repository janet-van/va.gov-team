const fs = require('fs');
const path = require('path');

const SUMMARY_FILE = 'key-finding-labels-extraction-summary.json';
const FINDINGS_FILE = 'key-finding-labels-extraction-findings.json';
const VALIDATION_FILE = 'key-finding-labels-extraction-validation.json';
const PATTERNS_FILE = 'key-finding-labels-extraction-patterns.json';
const STEP_SUMMARY_FILE = 'key-finding-labels-extraction-step-summary.md';

function topNEntries(obj, limit = 10) {
  return Object.entries(obj || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function toMarkdownList(entries) {
  if (entries.length === 0) return '- none';
  return entries.map(([key, count]) => `- ${key}: ${count}`).join('\n');
}

function buildSummaryMarkdown({ summary, validation, patterns }) {
  const topLabels = topNEntries(patterns.label_counts, 10);

  const errorFiles = new Map();
  for (const error of validation.errors) {
    errorFiles.set(error.file, (errorFiles.get(error.file) || 0) + 1);
  }

  return [
    '# Key Finding Labels Extraction',
    '',
    `- Files scanned: ${summary.files_scanned}`,
    `- Files with label blocks: ${summary.files_with_label_blocks}`,
    `- YAML blocks found: ${summary.blocks_found}`,
    `- Valid findings: ${summary.valid_findings}`,
    `- Errors: ${summary.error_count}`,
    `- Warnings: ${summary.warning_count}`,
    `- Unique label categories used: ${summary.unique_label_categories}`,
    `- Unique labels used: ${summary.unique_labels}`,
    '',
    '## Top Labels',
    toMarkdownList(topLabels),
    '',
    '## Files with Errors',
    toMarkdownList(Array.from(errorFiles.entries())),
  ].join('\n');
}

function writeArtifacts({ summary, findings, validation, patterns, outDir = '.' }) {
  fs.mkdirSync(outDir, { recursive: true });

  const summaryPath = path.join(outDir, SUMMARY_FILE);
  const findingsPath = path.join(outDir, FINDINGS_FILE);
  const validationPath = path.join(outDir, VALIDATION_FILE);
  const patternsPath = path.join(outDir, PATTERNS_FILE);
  const stepSummaryPath = path.join(outDir, STEP_SUMMARY_FILE);

  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(findingsPath, `${JSON.stringify(findings, null, 2)}\n`);
  fs.writeFileSync(validationPath, `${JSON.stringify(validation, null, 2)}\n`);
  fs.writeFileSync(patternsPath, `${JSON.stringify(patterns, null, 2)}\n`);

  const summaryMd = buildSummaryMarkdown({ summary, validation, patterns });
  fs.writeFileSync(stepSummaryPath, `${summaryMd}\n`);

  return {
    files: [summaryPath, findingsPath, validationPath, patternsPath, stepSummaryPath],
    stepSummaryFile: stepSummaryPath,
  };
}

module.exports = {
  SUMMARY_FILE,
  FINDINGS_FILE,
  VALIDATION_FILE,
  PATTERNS_FILE,
  STEP_SUMMARY_FILE,
  writeArtifacts,
  buildSummaryMarkdown,
};
