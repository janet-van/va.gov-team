#!/usr/bin/env node

/**
 * Legacy compatibility wrapper for taxonomy report generation.
 *
 * This command preserves the historical entrypoint:
 *   node scripts/research-taxonomy-generator.js
 *
 * Internally, it delegates to the modular extraction pipeline:
 *   .github/scripts/key-finding-labels-extraction/run.js
 *
 * Output (legacy compatibility artifacts):
 *   reports/research-taxonomy/taxonomy-data.json
 *   reports/research-taxonomy/taxonomy-report.md
 */

const path = require('path');
const { runExtraction, parseArgs: parseExtractionArgs } = require('../.github/scripts/key-finding-labels-extraction/run');

function parseWrapperArgs(argv) {
  const extractionDefaults = parseExtractionArgs([process.argv0, __filename]);
  const options = {
    ...extractionDefaults,
    mode: 'legacy-wrapper',
    scan: 'full',
    emitLegacyTaxonomy: true,
    outDir: '',
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [rawKey, ...rawValue] = arg.slice(2).split('=');
    const key = rawKey.trim();
    const value = rawValue.join('=').trim();

    if (key === 'out-dir' && value) options.outDir = value;
    if (key === 'roots' && value) {
      options.roots = value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }
    if (key === 'taxonomy-profile' && value) options.taxonomyProfile = value;
    if (key === 'taxonomy-mode' && value) options.taxonomyMode = value;
    if (key === 'taxonomy-file' && value) options.taxonomyFile = value;
  }

  return options;
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const options = parseWrapperArgs(process.argv);
  options.outDir = options.outDir ? path.resolve(repoRoot, options.outDir) : repoRoot;
  if (options.taxonomyFile) options.taxonomyFile = path.resolve(repoRoot, options.taxonomyFile);

  console.log('🔍 Running taxonomy generation via modular extraction pipeline...');
  const result = await runExtraction(options);

  console.log('\n✅ Taxonomy generation complete');
  console.log(`📄 Files scanned: ${result.summary.files_scanned}`);
  console.log(`📌 Canonical findings: ${result.summary.canonical_findings}`);
  console.log(`🧠 Enrichment findings: ${result.summary.enrichment_findings}`);
  console.log(`⚠️  Errors: ${result.summary.error_count}`);
  console.log(`⚠️  Warnings: ${result.summary.warning_count}`);
  console.log('📊 Legacy taxonomy artifacts written to reports/research-taxonomy/');

  if (result.summary.error_count > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error('❌ Taxonomy generation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
