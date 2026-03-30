#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    thresholdFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/workflow-threshold-check.json',
    determinismFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/workflow-determinism-parity.json',
    feedbackScorecardFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-feedback-scorecard.json',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-drift-report.md',
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();

    if (key === 'repo-root' && value) options.repoRoot = path.resolve(value);
    if (key === 'threshold' && value) options.thresholdFile = value;
    if (key === 'determinism' && value) options.determinismFile = value;
    if (key === 'feedback-scorecard' && value) options.feedbackScorecardFile = value;
    if (key === 'out-file' && value) options.outFile = value;
  }

  return options;
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_error) {
    return null;
  }
}

function formatBool(value) {
  return value ? 'PASS' : 'FAIL';
}

function topEntries(obj, count = 5) {
  return Object.entries(obj || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, count);
}

function formatTopEntries(entries) {
  if (!entries.length) return '- none';
  return entries.map(([key, value]) => `- ${key}: ${value}`).join('\n');
}

function buildReport({ threshold, determinism, feedbackScorecard }) {
  const thresholdPassed = threshold ? Boolean(threshold.passed) : false;
  const thresholdFailures = threshold ? Number(threshold.failed_checks || 0) : null;
  const determinismPassed = determinism ? Boolean(determinism.passed) : false;
  const determinismFailures = determinism ? Number(determinism.failed_checks || 0) : null;
  const feedbackLoaded = feedbackScorecard ? Boolean(feedbackScorecard.feedback_loaded) : false;
  const correctionsTotal = feedbackScorecard ? Number(feedbackScorecard.corrections_total || 0) : 0;
  const correctionRate = feedbackScorecard
    ? Number(feedbackScorecard.correction_rate_vs_findings || 0)
    : 0;

  return [
    '# Taxonomy Drift Report',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    '## Gate Status',
    `- Threshold checks: ${formatBool(thresholdPassed)}${
      thresholdFailures === null ? '' : ` (failed: ${thresholdFailures})`
    }`,
    `- Determinism checks: ${formatBool(determinismPassed)}${
      determinismFailures === null ? '' : ` (failed: ${determinismFailures})`
    }`,
    '',
    '## Feedback Summary',
    `- Feedback loaded: ${feedbackLoaded}`,
    `- Corrections total: ${correctionsTotal}`,
    `- Correction rate vs findings: ${correctionRate}`,
    '',
    '## Top Correction Actions',
    formatTopEntries(topEntries(feedbackScorecard && feedbackScorecard.corrections_by_action)),
    '',
    '## Top Correction Dimensions',
    formatTopEntries(topEntries(feedbackScorecard && feedbackScorecard.corrections_by_dimension)),
    '',
    '## Notes',
    '- This report is a consolidation artifact for periodic drift review.',
    '- It does not replace detailed contract/parity artifacts.',
  ].join('\n');
}

function main() {
  const options = parseArgs(process.argv);
  const thresholdPath = path.resolve(options.repoRoot, options.thresholdFile);
  const determinismPath = path.resolve(options.repoRoot, options.determinismFile);
  const feedbackPath = path.resolve(options.repoRoot, options.feedbackScorecardFile);
  const outPath = path.resolve(options.repoRoot, options.outFile);

  const threshold = safeReadJson(thresholdPath);
  const determinism = safeReadJson(determinismPath);
  const feedbackScorecard = safeReadJson(feedbackPath);
  const report = buildReport({ threshold, determinism, feedbackScorecard });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${report}\n`);
  console.log(`Drift report written: ${path.relative(options.repoRoot, outPath)}`);
}

main();
