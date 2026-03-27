#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    runs: 3,
    baselineManifest:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json',
    thresholds:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/recalibration-thresholds.json',
    outPrefix:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/workflow-recalibration',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/workflow-recalibration-stability.json',
    strict: true,
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();

    if (key === 'repo-root' && value) options.repoRoot = path.resolve(value);
    if (key === 'runs' && value) {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed > 0) options.runs = Math.floor(parsed);
    }
    if (key === 'baseline-manifest' && value) options.baselineManifest = value;
    if (key === 'thresholds' && value) options.thresholds = value;
    if (key === 'out-prefix' && value) options.outPrefix = value;
    if (key === 'out-file' && value) options.outFile = value;
    if (key === 'strict' && value) options.strict = value !== 'false';
  }

  return options;
}

function runCommand(cwd, command) {
  execSync(command, {
    cwd,
    stdio: 'pipe',
    encoding: 'utf8',
  });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureBaselineManifest({
  repoRoot,
  baselineManifestPath,
}) {
  if (fs.existsSync(baselineManifestPath)) return;

  console.log('[stability] baseline manifest missing; generating from current artifacts');
  runCommand(
    repoRoot,
    [
      'node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/generate-recalibration-dataset.js',
      '--summary=key-finding-labels-extraction-summary.json',
      '--enrichment=key-finding-labels-extraction-enrichment.json',
      '--feedback=key-finding-labels-extraction-feedback-ingestion.json',
      '--correction=key-finding-labels-extraction-correction-application.json',
      '--out-file=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset.jsonl',
      '--manifest-file=.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json',
    ].join(' '),
  );
}

function main() {
  const options = parseArgs(process.argv);
  const repoRoot = options.repoRoot;
  const baselineManifestPath = path.resolve(repoRoot, options.baselineManifest);
  const thresholdsPath = path.resolve(repoRoot, options.thresholds);
  const outPrefix = path.resolve(repoRoot, options.outPrefix);
  const outPath = path.resolve(repoRoot, options.outFile);

  ensureBaselineManifest({
    repoRoot,
    baselineManifestPath,
  });

  const runs = [];

  for (let i = 1; i <= options.runs; i += 1) {
    console.log(`[stability] run ${i}: extraction`);
    runCommand(
      repoRoot,
      'node .github/scripts/key-finding-labels-extraction/run.js --mode=workflow --scan=full --taxonomy-mode=off --emit-legacy-taxonomy=true',
    );

    const runDataset = `${outPrefix}-dataset-run${i}.jsonl`;
    const runManifest = `${outPrefix}-dataset-manifest-run${i}.json`;
    const runTrend = `${outPrefix}-trend-check-run${i}.json`;

    console.log(`[stability] run ${i}: recalibration export`);
    runCommand(
      repoRoot,
      [
        'node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/generate-recalibration-dataset.js',
        '--summary=key-finding-labels-extraction-summary.json',
        '--enrichment=key-finding-labels-extraction-enrichment.json',
        '--feedback=key-finding-labels-extraction-feedback-ingestion.json',
        '--correction=key-finding-labels-extraction-correction-application.json',
        `--out-file=${runDataset}`,
        `--manifest-file=${runManifest}`,
      ].join(' '),
    );

    console.log(`[stability] run ${i}: trend check`);
    runCommand(
      repoRoot,
      [
        'node .github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/check-recalibration-trends.js',
        `--baseline=${baselineManifestPath}`,
        `--current=${runManifest}`,
        `--thresholds=${thresholdsPath}`,
        `--out-file=${runTrend}`,
        `--strict=${options.strict ? 'true' : 'false'}`,
      ].join(' '),
    );

    const manifest = readJson(runManifest);
    const trend = readJson(runTrend);
    runs.push({
      run: i,
      rows_total: Number(manifest.rows_total || 0),
      rows_with_corrections: Number(manifest.rows_with_corrections || 0),
      dimensions: Array.isArray(manifest.dimensions) ? manifest.dimensions : [],
      trend_passed: Boolean(trend.passed),
      trend_failed_checks: Number(trend.failed_checks || 0),
      trend_strict: Boolean(trend.strict),
      manifest_file: runManifest,
      trend_file: runTrend,
    });
  }

  const rowTotals = runs.map(run => run.rows_total);
  const uniqueRowTotals = [...new Set(rowTotals)];
  const dimensionKeys = runs.map(run => JSON.stringify(run.dimensions || []));
  const allTrendPassed = runs.every(run => run.trend_passed);

  const output = {
    generated_at: new Date().toISOString(),
    runs_requested: options.runs,
    runs_completed: runs.length,
    strict_mode: options.strict,
    all_trend_passed: allTrendPassed,
    row_totals: rowTotals,
    unique_row_totals: uniqueRowTotals,
    row_totals_consistent: uniqueRowTotals.length === 1,
    dimensions_consistent: new Set(dimensionKeys).size === 1,
    runs,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Stability report written: ${path.relative(repoRoot, outPath)}`);
}

main();
