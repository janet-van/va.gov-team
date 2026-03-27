#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    baselineManifest:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/recalibration-thresholds.json',
    minRowsRatio: 0.5,
    minRowsFloor: 0,
    maxRelativeDrop: 0.5,
    correctionRateMaxDelta: 0.25,
    includeRequiredDimensions: true,
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();

    if (key === 'repo-root' && value) options.repoRoot = path.resolve(value);
    if (key === 'baseline-manifest' && value) options.baselineManifest = value;
    if (key === 'out-file' && value) options.outFile = value;
    if (key === 'min-rows-ratio' && value) options.minRowsRatio = Number(value);
    if (key === 'min-rows-floor' && value) options.minRowsFloor = Number(value);
    if (key === 'max-relative-drop' && value) options.maxRelativeDrop = Number(value);
    if (key === 'correction-rate-max-delta' && value) {
      options.correctionRateMaxDelta = Number(value);
    }
    if (key === 'include-required-dimensions' && value) {
      options.includeRequiredDimensions = value !== 'false';
    }
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function clamp01(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < 0) return 0;
  if (parsed > 1) return 1;
  return parsed;
}

function main() {
  const options = parseArgs(process.argv);
  const baselinePath = path.resolve(options.repoRoot, options.baselineManifest);
  const outPath = path.resolve(options.repoRoot, options.outFile);
  const baseline = readJson(baselinePath);

  const rowsTotal = Number(baseline.rows_total || 0);
  const minRowsRatio = clamp01(options.minRowsRatio, 0.5);
  const minRowsFloor = Math.max(0, Number.isFinite(options.minRowsFloor) ? options.minRowsFloor : 0);
  const minRowsValue = Math.max(minRowsFloor, Math.floor(rowsTotal * minRowsRatio));
  const maxRelativeDrop = clamp01(options.maxRelativeDrop, 0.5);
  const correctionRateMaxDelta = clamp01(options.correctionRateMaxDelta, 0.25);

  const thresholds = {
    rules: [
      {
        id: 'rows_total_minimum',
        metric: 'rows_total',
        mode: 'min',
        min_value: minRowsValue,
      },
      {
        id: 'rows_total_relative_drop',
        metric: 'rows_total',
        mode: 'max_relative_drop',
        max_delta: maxRelativeDrop,
      },
      {
        id: 'rows_with_corrections_rate_delta',
        metric: 'rows_with_corrections_rate',
        mode: 'absolute',
        max_delta: correctionRateMaxDelta,
      },
    ],
    required_dimensions:
      options.includeRequiredDimensions && Array.isArray(baseline.dimensions)
        ? [...baseline.dimensions].sort((a, b) => String(a).localeCompare(String(b)))
        : [],
    tuned_from: {
      baseline_manifest: baselinePath,
      baseline_generated_at: baseline.generated_at || null,
      rows_total: rowsTotal,
      min_rows_ratio: minRowsRatio,
      min_rows_floor: minRowsFloor,
      max_relative_drop: maxRelativeDrop,
      correction_rate_max_delta: correctionRateMaxDelta,
    },
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(thresholds, null, 2)}\n`);
  console.log(`Recalibration thresholds tuned: ${path.relative(options.repoRoot, outPath)}`);
  console.log(`rows_total baseline=${rowsTotal}, rows_total_minimum=${minRowsValue}`);
}

main();
