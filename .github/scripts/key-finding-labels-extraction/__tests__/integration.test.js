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
      path.join(tmpDir, 'teams', 'beta', 'research', 'insights.md'),
    );

    process.chdir(tmpDir);

    const result = await runExtraction({
      mode: 'local',
      scan: 'full',
      taxonomyFile: path.join(fixtureRoot, 'taxonomy.yml'),
      taxonomyUrl: '',
      outDir: '.',
    });

    assert.equal(result.summary.files_scanned, 6);
    assert.equal(result.summary.blocks_found, 7);
    assert.ok(result.summary.error_count > 0);
    assert.ok(result.validation.warnings.some(w => w.code === 'GENERATED_FINDING_ID'));

    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-summary.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-findings.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-validation.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'key-finding-labels-extraction-patterns.json')));
  } finally {
    process.chdir(cwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
