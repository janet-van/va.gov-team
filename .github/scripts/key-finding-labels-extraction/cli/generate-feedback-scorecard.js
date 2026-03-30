#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateFeedbackScorecard } = require('../feedback-scorecard');

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    feedbackFile: 'key-finding-labels-extraction-feedback-ingestion.json',
    enrichmentFile: 'key-finding-labels-extraction-enrichment.json',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-feedback-scorecard.json',
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();

    if (key === 'repo-root' && value) options.repoRoot = path.resolve(value);
    if (key === 'feedback' && value) options.feedbackFile = value;
    if (key === 'enrichment' && value) options.enrichmentFile = value;
    if (key === 'out-file' && value) options.outFile = value;
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const options = parseArgs(process.argv);
  const feedbackPath = path.resolve(options.repoRoot, options.feedbackFile);
  const enrichmentPath = path.resolve(options.repoRoot, options.enrichmentFile);
  const outPath = path.resolve(options.repoRoot, options.outFile);

  const feedback = fs.existsSync(feedbackPath) ? readJson(feedbackPath) : {};
  const enrichment = fs.existsSync(enrichmentPath) ? readJson(enrichmentPath) : {};
  const scorecard = generateFeedbackScorecard({
    feedbackIngestion: feedback,
    enrichment,
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(scorecard, null, 2)}\n`);
  console.log(`Feedback scorecard written: ${path.relative(options.repoRoot, outPath)}`);
}

main();
