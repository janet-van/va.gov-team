const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runExtraction } = require('../run');

test('integration: mixed fixture corpus produces expected outputs', async () => {
  const fixtureRoot = path.resolve(__dirname, '..', '__fixtures__');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kfl-extract-'));
  const cwd = process.cwd();

  try {
    fs.mkdirSync(path.join(tmpDir, 'products', 'alpha', 'research'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'teams', 'beta', 'research'), { recursive: true });

    fs.copyFileSync(
      path.join(fixtureRoot, 'reports', 'valid-unwrapped.md'),
      path.join(tmpDir, 'products', 'alpha', 'research', 'findings.md'),
    );
    fs.copyFileSync(
      path.join(fixtureRoot, 'reports', 'valid-wrapped.md'),
      path.join(tmpDir, 'teams', 'beta', 'research', 'report.md'),
    );
    fs.copyFileSync(
      path.join(fixtureRoot, 'reports', 'malformed.md'),
      path.join(tmpDir, 'products', 'alpha', 'research', 'research-findings.md'),
    );
    fs.copyFileSync(
      path.join(fixtureRoot, 'reports', 'invalid-taxonomy.md'),
      path.join(tmpDir, 'teams', 'beta', 'research', 'research-report.md'),
    );
    fs.copyFileSync(
      path.join(fixtureRoot, 'reports', 'duplicate-id.md'),
      path.join(tmpDir, 'products', 'alpha', 'research', 'study-report.md'),
    );
    fs.copyFileSync(
      path.join(fixtureRoot, 'reports', 'missing-id.md'),
      path.join(tmpDir, 'teams', 'beta', 'research', 'missing-id-report.md'),
    );
    fs.copyFileSync(
      path.join(fixtureRoot, 'reports', 'frontmatter-only.md'),
      path.join(tmpDir, 'products', 'alpha', 'research', 'frontmatter-report.md'),
    );

    process.chdir(tmpDir);

    const result = await runExtraction({
      mode: 'local',
      scan: 'full',
      taxonomyMode: 'warn',
      taxonomyFile: path.join(fixtureRoot, 'taxonomy.yml'),
      taxonomyUrl: '',
      emitLegacyTaxonomy: true,
      outDir: '.',
    });

    assert.equal(result.summary.files_scanned, 7);
    assert.equal(result.summary.blocks_found, 7);
    assert.ok(result.summary.error_count > 0);
    assert.ok(result.summary.canonical_findings > result.summary.valid_findings);
    assert.ok(result.validation.warnings.some(w => w.code === 'GENERATED_FINDING_ID'));
    assert.ok(result.validation.warnings.some(w => w.code === 'FRONTMATTER_PLACEHOLDER_KEY_FINDING'));

    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-summary.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-findings.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-validation.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-patterns.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-enrichment.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-portfolio.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-adjudication.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-feedback-ingestion.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-correction-application.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-report.md')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'reports', 'research-taxonomy', 'taxonomy-data.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'reports', 'research-taxonomy', 'taxonomy-report.md')));

    const legacyTaxonomyData = JSON.parse(
      fs.readFileSync(
        path.join(tmpDir, 'reports', 'research-taxonomy', 'taxonomy-data.json'),
        'utf8',
      ),
    );
    assert.equal(legacyTaxonomyData.summary.skipped.no_frontmatter, 6);
    assert.equal(legacyTaxonomyData.summary.skipped.no_key_findings, 0);
    assert.equal(legacyTaxonomyData.summary.skipped.placeholder_only, 0);
  } finally {
    process.chdir(cwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
