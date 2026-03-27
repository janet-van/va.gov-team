#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  generateRecalibrationRows,
  buildRecalibrationManifest,
} = require('../../../recalibration-export');

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    summaryFile: 'key-finding-labels-extraction-summary.json',
    enrichmentFile: 'key-finding-labels-extraction-enrichment.json',
    feedbackFile: 'key-finding-labels-extraction-feedback-ingestion.json',
    correctionFile: 'key-finding-labels-extraction-correction-application.json',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset.jsonl',
    manifestFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json',
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();

    if (key === 'repo-root' && value) options.repoRoot = path.resolve(value);
    if (key === 'summary' && value) options.summaryFile = value;
    if (key === 'enrichment' && value) options.enrichmentFile = value;
    if (key === 'feedback' && value) options.feedbackFile = value;
    if (key === 'correction' && value) options.correctionFile = value;
    if (key === 'out-file' && value) options.outFile = value;
    if (key === 'manifest-file' && value) options.manifestFile = value;
  }

  return options;
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const options = parseArgs(process.argv);
  const summaryPath = path.resolve(options.repoRoot, options.summaryFile);
  const enrichmentPath = path.resolve(options.repoRoot, options.enrichmentFile);
  const feedbackPath = path.resolve(options.repoRoot, options.feedbackFile);
  const correctionPath = path.resolve(options.repoRoot, options.correctionFile);
  const outPath = path.resolve(options.repoRoot, options.outFile);
  const manifestPath = path.resolve(options.repoRoot, options.manifestFile);

  const summary = readJsonIfExists(summaryPath);
  const enrichment = readJsonIfExists(enrichmentPath);
  const feedbackIngestion = readJsonIfExists(feedbackPath);
  const correctionApplication = readJsonIfExists(correctionPath);

  const rows = generateRecalibrationRows({
    summary,
    enrichment,
    correctionApplication,
    feedbackIngestion,
  });
  const manifest = buildRecalibrationManifest({
    summary,
    feedbackIngestion,
    correctionApplication,
    rows,
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

  const jsonl = rows.map(row => JSON.stringify(row)).join('\n');
  fs.writeFileSync(outPath, jsonl.length > 0 ? `${jsonl}\n` : '');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Recalibration dataset written: ${path.relative(options.repoRoot, outPath)}`);
  console.log(`Recalibration manifest written: ${path.relative(options.repoRoot, manifestPath)}`);
}

main();
