#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    contractPath:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/contract.json',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-check.json',
    strict: true,
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();

    if (key === 'repo-root' && value) options.repoRoot = path.resolve(value);
    if (key === 'contract' && value) options.contractPath = value;
    if (key === 'out-file' && value) options.outFile = value;
    if (key === 'strict' && value) options.strict = value !== 'false';
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function extractH2Sections(markdownText) {
  const sections = [];
  const lines = markdownText.split('\n');
  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s*$/);
    if (match) sections.push(match[1].trim());
  }
  return sections;
}

function validateJsonFile(filePath, requiredKeys) {
  const issues = [];
  let parsed = null;

  try {
    parsed = readJson(filePath);
  } catch (error) {
    return {
      ok: false,
      issues: [`JSON parse failure: ${error.message}`],
      keys: [],
    };
  }

  const keys = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? Object.keys(parsed)
    : [];

  for (const key of requiredKeys || []) {
    if (!Object.prototype.hasOwnProperty.call(parsed, key)) {
      issues.push(`Missing top-level key: ${key}`);
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    keys: keys.sort(),
  };
}

function validateMarkdownFile(filePath, requiredSections) {
  const issues = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const h2 = extractH2Sections(content);

  for (const section of requiredSections || []) {
    if (!h2.includes(section)) {
      issues.push(`Missing H2 section: ${section}`);
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    h2_sections: h2,
  };
}

function validateRequiredFile(repoRoot, fileSpec) {
  const absolutePath = path.resolve(repoRoot, fileSpec.path);
  const result = {
    path: fileSpec.path,
    absolute_path: absolutePath,
    type: fileSpec.type,
    exists: fs.existsSync(absolutePath),
    ok: false,
    checks: {},
  };

  if (!result.exists) {
    result.checks.issues = ['File not found'];
    return result;
  }

  if (fileSpec.type === 'json') {
    const validation = validateJsonFile(absolutePath, fileSpec.required_top_level_keys || []);
    result.ok = validation.ok;
    result.checks = validation;
    return result;
  }

  if (fileSpec.type === 'markdown') {
    const validation = validateMarkdownFile(absolutePath, fileSpec.required_h2_sections || []);
    result.ok = validation.ok;
    result.checks = validation;
    return result;
  }

  result.ok = true;
  result.checks.issues = [];
  return result;
}

function main() {
  const options = parseArgs(process.argv);
  const contractPath = path.resolve(options.repoRoot, options.contractPath);
  const outPath = path.resolve(options.repoRoot, options.outFile);

  const contract = readJson(contractPath);
  const families = contract.artifact_families || {};
  const familyResults = {};
  let failedChecks = 0;

  for (const [familyName, familySpec] of Object.entries(families)) {
    const required = familySpec.required_files || [];
    const checks = required.map(spec => validateRequiredFile(options.repoRoot, spec));
    const failures = checks.filter(c => !c.ok).length;
    failedChecks += failures;

    familyResults[familyName] = {
      required_files: required.length,
      failed_files: failures,
      checks,
    };
  }

  const output = {
    generated_at: new Date().toISOString(),
    repo_root: options.repoRoot,
    contract_file: contractPath,
    strict: options.strict,
    failed_checks: failedChecks,
    passed: failedChecks === 0,
    families: familyResults,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

  console.log(`Contract check written: ${path.relative(options.repoRoot, outPath)}`);
  console.log(`Failed checks: ${failedChecks}`);

  if (options.strict && failedChecks > 0) {
    process.exit(1);
  }
}

main();
