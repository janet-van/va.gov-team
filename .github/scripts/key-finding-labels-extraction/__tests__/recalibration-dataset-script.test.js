const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

test('generate-recalibration-dataset writes jsonl and manifest outputs', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'recalibration-dataset-'));
  const summaryPath = path.join(tmpDir, 'summary.json');
  const enrichmentPath = path.join(tmpDir, 'enrichment.json');
  const feedbackPath = path.join(tmpDir, 'feedback.json');
  const correctionPath = path.join(tmpDir, 'correction.json');
  const outPath = path.join(tmpDir, 'dataset.jsonl');
  const manifestPath = path.join(tmpDir, 'manifest.json');

  fs.writeFileSync(
    summaryPath,
    `${JSON.stringify({ taxonomy_profile: 'enrichment-taxonomy', taxonomy_profile_version: '1.0.0' }, null, 2)}\n`,
  );
  fs.writeFileSync(
    enrichmentPath,
    `${JSON.stringify(
      {
        findings: [
          {
            finding_uid: 'KF-1',
            finding_title: 'Title',
            source_file: 'products/a/research.md',
            source_kind: 'explicit',
            suggested_labels: {
              research_themes: [{ label: 'authentication_login', confidence: 0.8 }],
            },
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(feedbackPath, `${JSON.stringify({ mode: 'warn', loaded: true }, null, 2)}\n`);
  fs.writeFileSync(
    correctionPath,
    `${JSON.stringify(
      {
        mode: 'apply',
        enabled: true,
        corrected_findings: [
          {
            finding_uid: 'KF-1',
            suggested_labels: {
              research_themes: [{ label: 'benefits_disability', confidence: 1 }],
            },
          },
        ],
        change_log: [
          {
            finding_uid: 'KF-1',
            dimension: 'research_themes',
            action: 'replace',
            applied: true,
            reason: 'replaced',
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  execFileSync(
    process.execPath,
    [
      '.github/scripts/key-finding-labels-extraction/cli/generate-recalibration-dataset.js',
      `--summary=${summaryPath}`,
      `--enrichment=${enrichmentPath}`,
      `--feedback=${feedbackPath}`,
      `--correction=${correctionPath}`,
      `--out-file=${outPath}`,
      `--manifest-file=${manifestPath}`,
    ],
    { cwd: path.resolve(__dirname, '..', '..', '..', '..'), stdio: 'pipe' },
  );

  const jsonl = fs.readFileSync(outPath, 'utf8').trim().split('\n');
  assert.equal(jsonl.length, 1);
  const row = JSON.parse(jsonl[0]);
  assert.equal(row.finding_uid, 'KF-1');
  assert.deepEqual(row.corrected_labels, ['benefits_disability']);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.rows_total, 1);
  assert.equal(manifest.rows_with_corrections, 1);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
