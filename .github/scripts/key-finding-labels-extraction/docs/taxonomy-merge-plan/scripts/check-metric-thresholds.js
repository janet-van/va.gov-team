#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    baseline:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-snapshot.json',
    current:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-snapshot.json',
    thresholds:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/metric-thresholds.json',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-threshold-check.json',
    strict: true,
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

function getFamilyEntries(snapshot, familyName) {
  return (snapshot.families && snapshot.families[familyName]) || [];
}

function getEntryByPath(snapshot, familyName, artifactPath) {
  return getFamilyEntries(snapshot, familyName).find(entry => entry.path === artifactPath) || null;
}

function getMetricValue(entry, metricPath) {
  if (!entry) return undefined;
  const segments = String(metricPath || '').split('.');
  let cursor = entry;
  for (const segment of segments) {
    if (!segment) continue;
    if (!cursor || typeof cursor !== 'object' || !Object.prototype.hasOwnProperty.call(cursor, segment)) {
      return undefined;
    }
    cursor = cursor[segment];
  }
  return cursor;
}

function evaluateRule({ rule, baselineSnapshot, currentSnapshot }) {
  const baselineEntry = getEntryByPath(baselineSnapshot, rule.family, rule.path);
  const currentEntry = getEntryByPath(currentSnapshot, rule.family, rule.path);

  if (!baselineEntry || !currentEntry) {
    return {
      id: rule.id,
      passed: false,
      reason: 'missing_entry',
      message: `Missing snapshot entry for family=${rule.family} path=${rule.path}`,
    };
  }

  const baselineValue = getMetricValue(baselineEntry, rule.metric);
  const currentValue = getMetricValue(currentEntry, rule.metric);
  if (typeof baselineValue !== 'number' || typeof currentValue !== 'number') {
    return {
      id: rule.id,
      passed: false,
      reason: 'invalid_metric_type',
      message: `Metric ${rule.metric} is not numeric for ${rule.path}`,
    };
  }

  const diff = Math.abs(currentValue - baselineValue);
  const mode = rule.mode || 'absolute';
  const maxDelta = Number(rule.max_delta || 0);

  let passed = false;
  let observed = diff;
  if (mode === 'absolute') {
    passed = diff <= maxDelta;
  } else if (mode === 'relative') {
    observed = baselineValue === 0 ? (diff === 0 ? 0 : Infinity) : diff / Math.abs(baselineValue);
    passed = observed <= maxDelta;
  } else {
    return {
      id: rule.id,
      passed: false,
      reason: 'invalid_mode',
      message: `Unsupported mode: ${mode}`,
    };
  }

  return {
    id: rule.id,
    passed,
    family: rule.family,
    path: rule.path,
    metric: rule.metric,
    mode,
    max_delta: maxDelta,
    baseline_value: baselineValue,
    current_value: currentValue,
    observed_delta: observed,
  };
}

function main() {
  const options = parseArgs(process.argv);
  const baselinePath = path.resolve(options.repoRoot, options.baseline);
  const currentPath = path.resolve(options.repoRoot, options.current);
  const thresholdsPath = path.resolve(options.repoRoot, options.thresholds);
  const outPath = path.resolve(options.repoRoot, options.outFile);

  const baselineSnapshot = readJson(baselinePath);
  const currentSnapshot = readJson(currentPath);
  const thresholds = readJson(thresholdsPath);
  const rules = Array.isArray(thresholds.rules) ? thresholds.rules : [];

  const ruleResults = rules.map(rule =>
    evaluateRule({ rule, baselineSnapshot, currentSnapshot }),
  );
  const failed = ruleResults.filter(result => !result.passed);

  const output = {
    generated_at: new Date().toISOString(),
    baseline_file: baselinePath,
    current_file: currentPath,
    thresholds_file: thresholdsPath,
    strict: options.strict,
    passed: failed.length === 0,
    failed_rules: failed.length,
    results: ruleResults,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Threshold report written: ${path.relative(options.repoRoot, outPath)}`);
  console.log(`Failed rules: ${failed.length}`);

  if (options.strict && failed.length > 0) {
    process.exit(1);
  }
}

main();
