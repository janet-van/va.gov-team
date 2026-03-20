const test = require('node:test');
const assert = require('node:assert/strict');
const { generatePortfolioAnalysis } = require('../portfolio-analysis');

test('generatePortfolioAnalysis builds coverage and label frequency', () => {
  const enrichmentFindings = [
    {
      source_file: 'products/a/findings.md',
      metadata: { product: 'A' },
      suggested_labels: {
        research_themes: [{ label: 'navigation_wayfinding' }],
        user_groups: [{ label: 'veterans' }],
        finding_types: [{ label: 'usability_issue' }],
      },
    },
    {
      source_file: 'products/b/findings.md',
      metadata: { product: 'B' },
      suggested_labels: {
        research_themes: [{ label: 'navigation_wayfinding' }],
        user_groups: [{ label: 'veterans' }],
        finding_types: [{ label: 'technical_problem' }],
      },
    },
  ];

  const canonicalFindings = [
    {
      source_file: 'products/a/findings.md',
      metadata: { product: 'A' },
      demographics_summary: { assistive_tech_participants: 1 },
    },
  ];

  const result = generatePortfolioAnalysis({ enrichmentFindings, canonicalFindings });
  assert.equal(result.product_coverage.A.total_findings, 1);
  assert.equal(result.label_frequency['research_themes:navigation_wayfinding'], 2);
  assert.equal(result.assistive_tech_coverage.reports_including_at_users, 1);
});
