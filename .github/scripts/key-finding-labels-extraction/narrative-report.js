function topEntries(objectMap, limit = 10) {
  return Object.entries(objectMap || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function toBulletList(entries) {
  if (entries.length === 0) return ['- none'];
  return entries.map(([key, count]) => `- ${key}: ${count}`);
}

function generateNarrativeReport({ summary, portfolio, enrichmentFindings }) {
  const lines = [];

  lines.push('# Key Finding Enrichment and Portfolio Report');
  lines.push('');
  lines.push(`Generated: ${summary.generated_at}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Canonical findings enriched: ${enrichmentFindings.length}`);
  lines.push(`- Reports scanned: ${summary.files_scanned}`);
  lines.push(`- Label blocks found: ${summary.blocks_found}`);
  lines.push('');

  lines.push('## Top Suggested Labels');
  lines.push('');
  lines.push(...toBulletList(topEntries(portfolio.label_frequency, 15)));
  lines.push('');

  lines.push('## Cross Product Patterns');
  lines.push('');
  if (!Array.isArray(portfolio.cross_product_patterns) || portfolio.cross_product_patterns.length === 0) {
    lines.push('- none');
  } else {
    for (const item of portfolio.cross_product_patterns.slice(0, 10)) {
      lines.push(`- ${item.theme}: ${item.product_count} products`);
    }
  }
  lines.push('');

  lines.push('## Underserved Group Signals');
  lines.push('');
  const underserved = Object.entries(portfolio.underserved_groups_analysis || {})
    .sort((a, b) => b[1].products_without_coverage - a[1].products_without_coverage)
    .slice(0, 10);

  if (underserved.length === 0) {
    lines.push('- none');
  } else {
    for (const [group, info] of underserved) {
      lines.push(`- ${group}: ${info.products_without_coverage} products without coverage`);
    }
  }

  lines.push('');
  lines.push('## Assistive Technology Coverage');
  lines.push('');
  lines.push(
    `- Reports with AT participants: ${portfolio.assistive_tech_coverage.reports_including_at_users}/${portfolio.assistive_tech_coverage.total_reports} (${portfolio.assistive_tech_coverage.at_coverage_percentage}%)`,
  );
  lines.push(
    `- Reports with cognitive disability participants: ${portfolio.assistive_tech_coverage.reports_including_cognitive_disability}`,
  );

  lines.push('');
  return lines.join('\n');
}

module.exports = {
  generateNarrativeReport,
};
