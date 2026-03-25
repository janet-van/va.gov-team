const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  buildReportsFromCanonical,
  buildLegacyTaxonomyData,
  buildLegacyTaxonomyReport,
  writeLegacyTaxonomyArtifacts,
} = require('../legacy-taxonomy-adapter');

test('buildReportsFromCanonical creates report entries with classified findings', () => {
  const canonicalFindings = [
    {
      finding_uid: 'KF-a',
      source_file: 'products/demo/findings.md',
      finding_title: 'Users were confused about sign in',
      metadata: { product: 'demo', title: 'demo report' },
      demographics_summary: { veterans: 2 },
    },
  ];
  const enrichmentFindings = [
    {
      finding_uid: 'KF-a',
      suggested_labels: {
        research_themes: [{ label: 'authentication_login', confidence: 0.9 }],
      },
    },
  ];

  const reports = buildReportsFromCanonical({ canonicalFindings, enrichmentFindings });
  assert.equal(reports.length, 1);
  assert.equal(reports[0].file_path, 'products/demo/findings.md');
  assert.equal(reports[0].findings_count, 1);
  assert.equal(reports[0].classified_findings.length, 1);
  assert.ok(reports[0].classified_findings[0].taxonomy_labels.research_themes);
  assert.ok(
    reports[0].classified_findings[0].taxonomy_labels.research_themes.some(
      item => item.label === 'sign_in_authentication',
    ),
  );
});

test('buildLegacyTaxonomyData returns legacy top-level contract shape', () => {
  const data = buildLegacyTaxonomyData({
    generatedAt: '2026-03-27T00:00:00.000Z',
    filesScanned: 10,
    reports: [
      {
        findings_count: 2,
      },
    ],
    skipped: {
      no_frontmatter: 3,
      no_key_findings: 1,
      placeholder_only: 2,
    },
  });

  assert.equal(data.generated_at, '2026-03-27T00:00:00.000Z');
  assert.equal(data.summary.total_reports_scanned, 10);
  assert.equal(data.summary.total_key_findings, 2);
  assert.equal(data.summary.skipped.no_frontmatter, 3);
  assert.equal(data.summary.skipped.no_key_findings, 1);
  assert.equal(data.summary.skipped.placeholder_only, 2);
  assert.ok(data.taxonomy_definition.finding_types);
  assert.ok(data.taxonomy_analysis);
  assert.ok(Array.isArray(data.reports));
});

test('buildLegacyTaxonomyReport includes required section headings', () => {
  const report = buildLegacyTaxonomyReport({
    summary: {},
    taxonomy_definition: {},
    taxonomy_analysis: {},
  });

  const required = [
    '## Summary',
    '## Taxonomy Dimensions',
    '## Label Frequency Analysis',
    '## Cross-Product Patterns',
    '## Product Coverage Analysis',
    '## Assistive Technology Coverage',
    '## Underserved Groups Gap Analysis',
    '## Methodology',
  ];

  for (const heading of required) {
    assert.ok(report.includes(heading));
  }
});

test('writeLegacyTaxonomyArtifacts writes files under reports/research-taxonomy', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacy-tax-adapter-'));
  try {
    const files = writeLegacyTaxonomyArtifacts({
      outDir: tmpDir,
      data: { generated_at: 'x' },
      markdown: '# demo',
    });
    assert.equal(files.length, 2);
    assert.ok(fs.existsSync(path.join(tmpDir, 'reports', 'research-taxonomy', 'taxonomy-data.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'reports', 'research-taxonomy', 'taxonomy-report.md')));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
