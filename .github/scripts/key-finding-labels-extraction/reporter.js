const fs = require('fs');
const path = require('path');

const SUMMARY_FILE = 'key-finding-labels-extraction-summary.json';
const FINDINGS_FILE = 'key-finding-labels-extraction-findings.json';
const VALIDATION_FILE = 'key-finding-labels-extraction-validation.json';
const PATTERNS_FILE = 'key-finding-labels-extraction-patterns.json';
const ENRICHMENT_FILE = 'key-finding-labels-extraction-enrichment.json';
const PORTFOLIO_FILE = 'key-finding-labels-extraction-portfolio.json';
const NARRATIVE_REPORT_FILE = 'key-finding-labels-extraction-report.md';
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

function buildSummaryMarkdown({ summary, validation, patterns, enrichment, portfolio }) {
  const topLabels = topNEntries(patterns.label_counts, 10);

  const errorFiles = new Map();
  for (const error of validation.errors) {
    errorFiles.set(error.file, (errorFiles.get(error.file) || 0) + 1);
  }

  const topSuggested = topNEntries((portfolio && portfolio.label_frequency) || {}, 10);

  return [
    '# Key Finding Labels Extraction',
    '',
    `- Files scanned: ${summary.files_scanned}`,
    `- Files with label blocks: ${summary.files_with_label_blocks}`,
    `- Files with frontmatter findings: ${summary.files_with_frontmatter_findings || 0}`,
    `- YAML blocks found: ${summary.blocks_found}`,
    `- Frontmatter findings: ${summary.frontmatter_findings || 0}`,
    `- Valid findings: ${summary.valid_findings}`,
    `- Canonical findings: ${summary.canonical_findings || 0}`,
    `- Errors: ${summary.error_count}`,
    `- Warnings: ${summary.warning_count}`,
    `- Unique label categories used: ${summary.unique_label_categories}`,
    `- Unique labels used: ${summary.unique_labels}`,
    `- Canonical findings enriched: ${(enrichment && enrichment.findings && enrichment.findings.length) || 0}`,
    '',
    '## Top Labels',
    toMarkdownList(topLabels),
    '',
    '## Top Suggested Labels',
    toMarkdownList(topSuggested),
    '',
    '## Files with Errors',
    toMarkdownList(Array.from(errorFiles.entries())),
  ].join('\n');
}

function writeArtifacts({
  summary,
  findings,
  validation,
  patterns,
  enrichment = null,
  portfolio = null,
  narrativeReport = '',
  outDir = '.',
}) {
  fs.mkdirSync(outDir, { recursive: true });

  const summaryPath = path.join(outDir, SUMMARY_FILE);
  const findingsPath = path.join(outDir, FINDINGS_FILE);
  const validationPath = path.join(outDir, VALIDATION_FILE);
  const patternsPath = path.join(outDir, PATTERNS_FILE);
  const enrichmentPath = path.join(outDir, ENRICHMENT_FILE);
  const portfolioPath = path.join(outDir, PORTFOLIO_FILE);
  const narrativeReportPath = path.join(outDir, NARRATIVE_REPORT_FILE);
  const stepSummaryPath = path.join(outDir, STEP_SUMMARY_FILE);

  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(findingsPath, `${JSON.stringify(findings, null, 2)}\n`);
  fs.writeFileSync(validationPath, `${JSON.stringify(validation, null, 2)}\n`);
  fs.writeFileSync(patternsPath, `${JSON.stringify(patterns, null, 2)}\n`);
  fs.writeFileSync(enrichmentPath, `${JSON.stringify(enrichment || {}, null, 2)}\n`);
  fs.writeFileSync(portfolioPath, `${JSON.stringify(portfolio || {}, null, 2)}\n`);
  fs.writeFileSync(narrativeReportPath, `${String(narrativeReport || '').trim()}\n`);

  const summaryMd = buildSummaryMarkdown({ summary, validation, patterns, enrichment, portfolio });
  fs.writeFileSync(stepSummaryPath, `${summaryMd}\n`);

  return {
    files: [
      summaryPath,
      findingsPath,
      validationPath,
      patternsPath,
      enrichmentPath,
      portfolioPath,
      narrativeReportPath,
      stepSummaryPath,
    ],
    stepSummaryFile: stepSummaryPath,
  };
}

module.exports = {
  SUMMARY_FILE,
  FINDINGS_FILE,
  VALIDATION_FILE,
  PATTERNS_FILE,
  ENRICHMENT_FILE,
  PORTFOLIO_FILE,
  NARRATIVE_REPORT_FILE,
  STEP_SUMMARY_FILE,
  writeArtifacts,
  buildSummaryMarkdown,
};
