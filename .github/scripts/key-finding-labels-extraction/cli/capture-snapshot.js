#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    contractPath:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/contract.json',
    outFile:
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/baseline/latest-snapshot.json',
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.join('=').trim();

    if (key === 'repo-root' && value) options.repoRoot = path.resolve(value);
    if (key === 'contract' && value) options.contractPath = value;
    if (key === 'out-file' && value) options.outFile = value;
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256(contentBuffer) {
  return crypto.createHash('sha256').update(contentBuffer).digest('hex');
}

function h2Sections(markdownText) {
  return markdownText
    .split('\n')
    .map(line => line.match(/^##\s+(.+?)\s*$/))
    .filter(Boolean)
    .map(match => match[1].trim());
}

function snapshotFile(repoRoot, fileSpec) {
  const abs = path.resolve(repoRoot, fileSpec.path);
  const exists = fs.existsSync(abs);

  const base = {
    path: fileSpec.path,
    type: fileSpec.type,
    exists,
  };

  if (!exists) return base;

  const content = fs.readFileSync(abs);
  const stat = fs.statSync(abs);
  const result = {
    ...base,
    size_bytes: stat.size,
    sha256: sha256(content),
  };

  if (fileSpec.type === 'json') {
    try {
      const parsed = JSON.parse(content.toString('utf8'));
      result.top_level_keys =
        parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? Object.keys(parsed).sort()
          : [];

      if (fileSpec.path === 'reports/research-taxonomy/taxonomy-data.json') {
        const summary = parsed.summary || {};
        result.summary_metrics = {
          total_reports_scanned: summary.total_reports_scanned ?? null,
          reports_with_findings: summary.reports_with_findings ?? null,
          total_key_findings: summary.total_key_findings ?? null,
        };
      }

      if (fileSpec.path === 'key-finding-labels-extraction-summary.json') {
        result.summary_metrics = {
          files_scanned: parsed.files_scanned ?? null,
          valid_findings: parsed.valid_findings ?? null,
          error_count: parsed.error_count ?? null,
          warning_count: parsed.warning_count ?? null,
        };
      }
    } catch (error) {
      result.parse_error = error.message;
    }
  }

  if (fileSpec.type === 'markdown') {
    const text = content.toString('utf8');
    result.h2_sections = h2Sections(text);
    result.line_count = text.split('\n').length;
  }

  return result;
}

function main() {
  const options = parseArgs(process.argv);
  const contractPath = path.resolve(options.repoRoot, options.contractPath);
  const outPath = path.resolve(options.repoRoot, options.outFile);
  const contract = readJson(contractPath);

  const snapshot = {
    generated_at: new Date().toISOString(),
    repo_root: options.repoRoot,
    contract_file: contractPath,
    families: {},
  };

  const families = contract.artifact_families || {};
  for (const [familyName, familySpec] of Object.entries(families)) {
    const required = familySpec.required_files || [];
    snapshot.families[familyName] = required.map(fileSpec =>
      snapshotFile(options.repoRoot, fileSpec),
    );
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Snapshot written: ${path.relative(options.repoRoot, outPath)}`);
}

main();
