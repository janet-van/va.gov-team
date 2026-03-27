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
    tolerance:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/tolerance.json',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-parity.json',
    strict: true,
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();

    if (key === 'repo-root' && value) options.repoRoot = path.resolve(value);
    if (key === 'baseline' && value) options.baseline = value;
    if (key === 'current' && value) options.current = value;
    if (key === 'tolerance' && value) options.tolerance = value;
    if (key === 'out-file' && value) options.outFile = value;
    if (key === 'strict' && value) options.strict = value !== 'false';
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toPathKey(family, filePath, fieldName) {
  return `${family}/${filePath}/${fieldName}`;
}

function withinTolerance(expected, actual, toleranceRule) {
  if (!toleranceRule) {
    return expected === actual;
  }

  const mode = toleranceRule.mode || 'absolute';
  const value = Number(toleranceRule.value || 0);
  const diff = Math.abs(actual - expected);

  if (mode === 'absolute') {
    return diff <= value;
  }

  if (mode === 'relative') {
    if (expected === 0) return diff === 0;
    return diff / Math.abs(expected) <= value;
  }

  return expected === actual;
}

function toFileMap(familyEntries) {
  const map = new Map();
  for (const entry of familyEntries || []) {
    map.set(entry.path, entry);
  }
  return map;
}

function compareArraysEqual(a, b) {
  const left = Array.isArray(a) ? [...a].sort() : [];
  const right = Array.isArray(b) ? [...b].sort() : [];
  return JSON.stringify(left) === JSON.stringify(right);
}

function compareFamily({
  familyName,
  baselineEntries,
  currentEntries,
  tolerance,
}) {
  const results = [];
  const baselineMap = toFileMap(baselineEntries);
  const currentMap = toFileMap(currentEntries);
  const allPaths = new Set([...baselineMap.keys(), ...currentMap.keys()]);

  for (const filePath of [...allPaths].sort()) {
    const base = baselineMap.get(filePath);
    const curr = currentMap.get(filePath);
    const checks = [];

    const baseExists = Boolean(base && base.exists);
    const currExists = Boolean(curr && curr.exists);

    checks.push({
      check: 'exists_parity',
      expected: baseExists,
      actual: currExists,
      passed: baseExists === currExists,
    });

    if (baseExists && currExists) {
      if (base.type === 'json' && curr.type === 'json') {
        checks.push({
          check: 'json_top_level_keys_parity',
          expected: base.top_level_keys || [],
          actual: curr.top_level_keys || [],
          passed: compareArraysEqual(base.top_level_keys, curr.top_level_keys),
        });
      }

      if (base.type === 'markdown' && curr.type === 'markdown') {
        checks.push({
          check: 'markdown_h2_parity',
          expected: base.h2_sections || [],
          actual: curr.h2_sections || [],
          passed: compareArraysEqual(base.h2_sections, curr.h2_sections),
        });
      }

      for (const metricField of ['size_bytes']) {
        if (typeof base[metricField] === 'number' && typeof curr[metricField] === 'number') {
          const key = toPathKey(familyName, filePath, metricField);
          const tolRule = tolerance.numeric_tolerances[key];
          checks.push({
            check: `numeric:${metricField}`,
            expected: base[metricField],
            actual: curr[metricField],
            tolerance: tolRule || null,
            passed: withinTolerance(base[metricField], curr[metricField], tolRule),
          });
        }
      }

      const summaryMetrics = base.summary_metrics || {};
      const currentSummaryMetrics = curr.summary_metrics || {};
      for (const metric of Object.keys(summaryMetrics)) {
        if (
          typeof summaryMetrics[metric] === 'number' &&
          typeof currentSummaryMetrics[metric] === 'number'
        ) {
          const key = toPathKey(familyName, filePath, `summary_metrics/${metric}`);
          const tolRule = tolerance.numeric_tolerances[key];
          checks.push({
            check: `numeric:summary_metrics/${metric}`,
            expected: summaryMetrics[metric],
            actual: currentSummaryMetrics[metric],
            tolerance: tolRule || null,
            passed: withinTolerance(summaryMetrics[metric], currentSummaryMetrics[metric], tolRule),
          });
        }
      }
    }

    results.push({
      path: filePath,
      passed: checks.every(c => c.passed),
      checks,
    });
  }

  return results;
}

function main() {
  const options = parseArgs(process.argv);
  const baselinePath = path.resolve(options.repoRoot, options.baseline);
  const currentPath = path.resolve(options.repoRoot, options.current);
  const tolerancePath = path.resolve(options.repoRoot, options.tolerance);
  const outPath = path.resolve(options.repoRoot, options.outFile);

  const baseline = readJson(baselinePath);
  const current = readJson(currentPath);
  const tolerance = readJson(tolerancePath);

  const families = new Set([
    ...Object.keys(baseline.families || {}),
    ...Object.keys(current.families || {}),
  ]);

  const familyResults = {};
  let failedFiles = 0;

  for (const familyName of [...families].sort()) {
    const results = compareFamily({
      familyName,
      baselineEntries: baseline.families[familyName] || [],
      currentEntries: current.families[familyName] || [],
      tolerance,
    });
    familyResults[familyName] = results;
    failedFiles += results.filter(r => !r.passed).length;
  }

  const output = {
    generated_at: new Date().toISOString(),
    baseline_file: baselinePath,
    current_file: currentPath,
    tolerance_file: tolerancePath,
    strict: options.strict,
    passed: failedFiles === 0,
    failed_files: failedFiles,
    families: familyResults,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

  console.log(`Parity report written: ${path.relative(options.repoRoot, outPath)}`);
  console.log(`Failed files: ${failedFiles}`);

  if (options.strict && failedFiles > 0) {
    process.exit(1);
  }
}

main();
