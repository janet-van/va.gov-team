const test = require('node:test');
const assert = require('node:assert/strict');
const {
  extractFrontmatter,
  isPlaceholderFinding,
  extractDemographicsSummary,
  parseFrontmatterFindingsFromContent,
} = require('../frontmatter-parser');

test('extractFrontmatter parses YAML frontmatter when present', () => {
  const content = `---\ntitle: Demo\nkey_findings:\n  - A valid finding text\n---\nBody`;
  const parsed = extractFrontmatter(content);
  assert.equal(parsed.title, 'Demo');
  assert.equal(parsed.key_findings.length, 1);
});

test('isPlaceholderFinding identifies template placeholders', () => {
  assert.equal(isPlaceholderFinding('finding 1'), true);
  assert.equal(isPlaceholderFinding('This is real'), false);
});

test('extractDemographicsSummary summarizes AT and location fields', () => {
  const summary = extractDemographicsSummary({
    demographics: {
      veterans: 5,
      disability: {
        screen_reader_desktop: 1,
        cognitive: 2,
      },
      location: {
        rural: 2,
      },
    },
  });

  assert.equal(summary.veterans, 5);
  assert.equal(summary.assistive_tech_participants, 1);
  assert.equal(summary.cognitive_disability_participants, 2);
  assert.equal(summary.rural_participants, 2);
});

test('parseFrontmatterFindingsFromContent filters placeholders and returns warnings', () => {
  const content = `---
key_findings:
  - finding 1
  - Veterans reported the form was confusing and hard to complete.
title: Study
product: debt
---
# body`;

  const result = parseFrontmatterFindingsFromContent(content, 'products/debt/findings.md');
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].finding_title.includes('Veterans reported'), true);
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].code, 'FRONTMATTER_PLACEHOLDER_KEY_FINDING');
  assert.equal(result.stats.has_frontmatter, true);
  assert.equal(result.stats.has_key_findings_array, true);
  assert.equal(result.stats.valid_findings, 1);
  assert.equal(result.stats.placeholder_skipped, 1);
});

test('parseFrontmatterFindingsFromContent reports stats when frontmatter is missing', () => {
  const result = parseFrontmatterFindingsFromContent('# no frontmatter', 'products/debt/findings.md');
  assert.equal(result.findings.length, 0);
  assert.equal(result.stats.has_frontmatter, false);
  assert.equal(result.stats.has_key_findings_array, false);
  assert.equal(result.stats.valid_findings, 0);
});
