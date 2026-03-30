const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

test('generate-drift-report script writes consolidated markdown report', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-report-'));
  const thresholdPath = path.join(tmpDir, 'threshold.json');
  const determinismPath = path.join(tmpDir, 'determinism.json');
  const feedbackPath = path.join(tmpDir, 'feedback-scorecard.json');
  const outPath = path.join(tmpDir, 'drift.md');

  fs.writeFileSync(thresholdPath, `${JSON.stringify({ passed: true, failed_checks: 0 }, null, 2)}\n`);
  fs.writeFileSync(
    determinismPath,
    `${JSON.stringify({ passed: false, failed_checks: 2 }, null, 2)}\n`,
  );
  fs.writeFileSync(
    feedbackPath,
    `${JSON.stringify(
      {
        feedback_loaded: true,
        corrections_total: 3,
        correction_rate_vs_findings: 0.5,
        corrections_by_action: { add: 1, replace: 2 },
        corrections_by_dimension: { research_themes: 3 },
      },
      null,
      2,
    )}\n`,
  );

  execFileSync(
    process.execPath,
    [
      '.github/scripts/key-finding-labels-extraction/cli/generate-drift-report.js',
      `--threshold=${thresholdPath}`,
      `--determinism=${determinismPath}`,
      `--feedback-scorecard=${feedbackPath}`,
      `--out-file=${outPath}`,
    ],
    { cwd: path.resolve(__dirname, '..', '..', '..', '..'), stdio: 'pipe' },
  );

  const report = fs.readFileSync(outPath, 'utf8');
  assert.match(report, /# Taxonomy Drift Report/);
  assert.match(report, /Threshold checks: PASS/);
  assert.match(report, /Determinism checks: FAIL/);
  assert.match(report, /Corrections total: 3/);
  assert.match(report, /research_themes: 3/);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
