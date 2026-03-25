const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

test('tune-recalibration-thresholds derives threshold values from baseline manifest', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tune-thresholds-'));
  const baselinePath = path.join(tmpDir, 'baseline-manifest.json');
  const outPath = path.join(tmpDir, 'thresholds.json');

  fs.writeFileSync(
    baselinePath,
    `${JSON.stringify(
      {
        generated_at: '2026-03-30T05:00:00.000Z',
        rows_total: 120,
        dimensions: ['research_themes', 'emotional_states'],
      },
      null,
      2,
    )}\n`,
  );

  execFileSync(
    process.execPath,
    [
      '.github/scripts/key-finding-labels-extraction/docs/taxonomy-merge-plan/scripts/tune-recalibration-thresholds.js',
      `--baseline-manifest=${baselinePath}`,
      `--out-file=${outPath}`,
      '--min-rows-ratio=0.4',
      '--min-rows-floor=10',
      '--max-relative-drop=0.3',
      '--correction-rate-max-delta=0.2',
      '--include-required-dimensions=true',
    ],
    { cwd: path.resolve(__dirname, '..', '..', '..', '..'), stdio: 'pipe' },
  );

  const thresholds = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  const minRule = thresholds.rules.find(rule => rule.id === 'rows_total_minimum');
  assert.equal(minRule.min_value, 48);
  assert.deepEqual(thresholds.required_dimensions, ['emotional_states', 'research_themes']);
  assert.equal(thresholds.tuned_from.rows_total, 120);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
