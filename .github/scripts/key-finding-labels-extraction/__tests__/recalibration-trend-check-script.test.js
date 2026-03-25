const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

test('check-recalibration-trends reports failed checks when thresholds are exceeded', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'recalibration-trends-'));
  const baselinePath = path.join(tmpDir, 'baseline.json');
  const currentPath = path.join(tmpDir, 'current.json');
  const thresholdsPath = path.join(tmpDir, 'thresholds.json');
  const outPath = path.join(tmpDir, 'trend-check.json');

  fs.writeFileSync(
    baselinePath,
    `${JSON.stringify({ rows_total: 100, rows_with_corrections: 30, dimensions: ['a', 'b'] }, null, 2)}\n`,
  );
  fs.writeFileSync(
    currentPath,
    `${JSON.stringify({ rows_total: 20, rows_with_corrections: 1, dimensions: ['a'] }, null, 2)}\n`,
  );
  fs.writeFileSync(
    thresholdsPath,
    `${JSON.stringify(
      {
        rules: [
          { id: 'drop', metric: 'rows_total', mode: 'max_relative_drop', max_delta: 0.5 },
          {
            id: 'corr_rate',
            metric: 'rows_with_corrections_rate',
            mode: 'absolute',
            max_delta: 0.1,
          },
        ],
        required_dimensions: ['a', 'b'],
      },
      null,
      2,
    )}\n`,
  );

  execFileSync(
    process.execPath,
    [
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/check-recalibration-trends.js',
      `--baseline=${baselinePath}`,
      `--current=${currentPath}`,
      `--thresholds=${thresholdsPath}`,
      `--out-file=${outPath}`,
      '--strict=false',
    ],
    { cwd: path.resolve(__dirname, '..', '..', '..', '..'), stdio: 'pipe' },
  );

  const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  assert.equal(report.passed, false);
  assert.ok(report.failed_checks >= 2);
  assert.equal(report.dimension_check.passed, false);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
