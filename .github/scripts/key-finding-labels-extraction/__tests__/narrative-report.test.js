const test = require('node:test');
const assert = require('node:assert/strict');
const { generateNarrativeReport } = require('../narrative-report');

test('generateNarrativeReport renders key sections', () => {
  const markdown = generateNarrativeReport({
    summary: {
      generated_at: '2026-01-01T00:00:00.000Z',
      files_scanned: 10,
      blocks_found: 5,
    },
    enrichmentFindings: [{}, {}],
    portfolio: {
      label_frequency: { 'research_themes:navigation_wayfinding': 4 },
      cross_product_patterns: [{ theme: 'navigation_wayfinding', product_count: 3 }],
      underserved_groups_analysis: {
        veterans: { products_without_coverage: 2 },
      },
      assistive_tech_coverage: {
        reports_including_at_users: 1,
        total_reports: 2,
        at_coverage_percentage: 50,
        reports_including_cognitive_disability: 1,
      },
    },
  });

  assert.ok(markdown.includes('## Summary'));
  assert.ok(markdown.includes('## Top Suggested Labels'));
  assert.ok(markdown.includes('## Assistive Technology Coverage'));
});
