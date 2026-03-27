#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    baseline:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json',
    current:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-dataset-manifest.json',
    thresholds:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/recalibration-thresholds.json',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-recalibration-trend-check.json',
    strict: false,
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();

    if (key === 'repo-root' && value) options.repoRoot = path.resolve(value);
    if (key === 'baseline' && value) options.baseline = value;
    if (key === 'current' && value) options.current = value;
    if (key === 'thresholds' && value) options.thresholds = value;
    if (key === 'out-file' && value) options.outFile = value;
    if (key === 'strict' && value) options.strict = value !== 'false';
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function metricValue(manifest, metric) {
  if (metric === 'rows_with_corrections_rate') {
    const rowsTotal = Number(manifest.rows_total || 0);
    const rowsWithCorrections = Number(manifest.rows_with_corrections || 0);
    if (rowsTotal <= 0) return 0;
    return rowsWithCorrections / rowsTotal;
  }
  const value = manifest[metric];
  return typeof value === 'number' ? value : Number(value);
}

function evaluateRule({ rule, baselineManifest, currentManifest }) {
  const baselineValue = metricValue(baselineManifest, rule.metric);
  const currentValue = metricValue(currentManifest, rule.metric);

  if (!Number.isFinite(baselineValue) || !Number.isFinite(currentValue)) {
    return {
      id: rule.id,
      passed: false,
      reason: 'invalid_metric',
      message: `Metric "${rule.metric}" is not numeric in manifests.`,
    };
  }

  const mode = rule.mode || 'absolute';
  if (mode === 'min') {
    const minValue = Number(rule.min_value || 0);
    return {
      id: rule.id,
      metric: rule.metric,
      mode,
      min_value: minValue,
      baseline_value: baselineValue,
      current_value: currentValue,
      passed: currentValue >= minValue,
      observed: currentValue,
    };
  }

  if (mode === 'max') {
    const maxValue = Number(rule.max_value || 0);
    return {
      id: rule.id,
      metric: rule.metric,
      mode,
      max_value: maxValue,
      baseline_value: baselineValue,
      current_value: currentValue,
      passed: currentValue <= maxValue,
      observed: currentValue,
    };
  }

  if (mode === 'absolute') {
    const maxDelta = Number(rule.max_delta || 0);
    const observed = Math.abs(currentValue - baselineValue);
    return {
      id: rule.id,
      metric: rule.metric,
      mode,
      max_delta: maxDelta,
      baseline_value: baselineValue,
      current_value: currentValue,
      observed_delta: observed,
      passed: observed <= maxDelta,
    };
  }

  if (mode === 'max_relative_drop') {
    const maxDelta = Number(rule.max_delta || 0);
    if (baselineValue <= 0) {
      return {
        id: rule.id,
        metric: rule.metric,
        mode,
        max_delta: maxDelta,
        baseline_value: baselineValue,
        current_value: currentValue,
        observed_delta: 0,
        passed: true,
        note: 'baseline_non_positive_skip',
      };
    }
    const observed = (baselineValue - currentValue) / baselineValue;
    return {
      id: rule.id,
      metric: rule.metric,
      mode,
      max_delta: maxDelta,
      baseline_value: baselineValue,
      current_value: currentValue,
      observed_delta: observed,
      passed: observed <= maxDelta,
    };
  }

  return {
    id: rule.id,
    metric: rule.metric,
    mode,
    passed: false,
    reason: 'unsupported_mode',
    message: `Unsupported rule mode "${mode}".`,
  };
}

function evaluateDimensions({ requiredDimensions = [], currentManifest = {} }) {
  const currentDimensions = Array.isArray(currentManifest.dimensions) ? currentManifest.dimensions : [];
  const missing = requiredDimensions.filter(dimension => !currentDimensions.includes(dimension));
  return {
    required: requiredDimensions,
    current: currentDimensions,
    missing,
    passed: missing.length === 0,
  };
}

function main() {
  const options = parseArgs(process.argv);
  const baselinePath = path.resolve(options.repoRoot, options.baseline);
  const currentPath = path.resolve(options.repoRoot, options.current);
  const thresholdsPath = path.resolve(options.repoRoot, options.thresholds);
  const outPath = path.resolve(options.repoRoot, options.outFile);

  const baselineManifest = readJson(baselinePath);
  const currentManifest = readJson(currentPath);
  const thresholds = readJson(thresholdsPath);

  const rules = Array.isArray(thresholds.rules) ? thresholds.rules : [];
  const ruleResults = rules.map(rule => evaluateRule({ rule, baselineManifest, currentManifest }));
  const dimensionResult = evaluateDimensions({
    requiredDimensions: Array.isArray(thresholds.required_dimensions)
      ? thresholds.required_dimensions
      : [],
    currentManifest,
  });

  const failedRules = ruleResults.filter(result => !result.passed).length;
  const failedChecks = failedRules + (dimensionResult.passed ? 0 : 1);

  const output = {
    generated_at: new Date().toISOString(),
    baseline_file: baselinePath,
    current_file: currentPath,
    thresholds_file: thresholdsPath,
    strict: options.strict,
    passed: failedChecks === 0,
    failed_checks: failedChecks,
    failed_rules: failedRules,
    dimension_check: dimensionResult,
    results: ruleResults,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Recalibration trend report written: ${path.relative(options.repoRoot, outPath)}`);
  console.log(`Failed checks: ${failedChecks}`);

  if (options.strict && failedChecks > 0) {
    process.exit(1);
  }
}

main();
