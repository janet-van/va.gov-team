const fs = require('fs');
const path = require('path');
const { loadProfileByName } = require('./taxonomy-profiles');
const { mapLegacyLabelToEnrichment } = require('./taxonomy-profile-mapping');

function formatDimensionName(name) {
  return String(name || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function roundConfidence(value) {
  return Math.round(Number(value || 0) * 1000) / 1000;
}

function buildReverseLabelMap({ legacyProfile, enrichmentProfile }) {
  const reverse = new Map();

  for (const [legacyDimension, labels] of Object.entries(legacyProfile.dimensions || {})) {
    for (const legacyLabel of Object.keys(labels || {})) {
      const targets = mapLegacyLabelToEnrichment({
        legacyDimension,
        legacyLabel,
        enrichmentProfile,
      });

      for (const target of targets) {
        const key = `${target.dimension}:${target.label}`;
        if (!reverse.has(key)) reverse.set(key, []);
        reverse.get(key).push({ dimension: legacyDimension, label: legacyLabel });
      }
    }
  }

  return reverse;
}

function mapEnrichedLabelsToLegacy({ suggestedLabels, reverseLabelMap }) {
  const byLegacyKey = new Map();

  for (const [dimension, labels] of Object.entries(suggestedLabels || {})) {
    for (const labelObj of labels || []) {
      const sourceKey = `${dimension}:${labelObj.label}`;
      const targets = reverseLabelMap.get(sourceKey) || [];
      for (const target of targets) {
        const legacyKey = `${target.dimension}:${target.label}`;
        const prev = byLegacyKey.get(legacyKey);
        const nextConfidence = roundConfidence(labelObj.confidence);
        if (!prev || nextConfidence > prev.confidence) {
          byLegacyKey.set(legacyKey, {
            dimension: target.dimension,
            label: target.label,
            confidence: nextConfidence,
          });
        }
      }
    }
  }

  const taxonomyLabels = {};
  for (const value of byLegacyKey.values()) {
    if (!taxonomyLabels[value.dimension]) taxonomyLabels[value.dimension] = [];
    taxonomyLabels[value.dimension].push({
      label: value.label,
      confidence: value.confidence,
    });
  }

  for (const dimension of Object.keys(taxonomyLabels)) {
    taxonomyLabels[dimension] = taxonomyLabels[dimension].sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return a.label.localeCompare(b.label);
    });
  }

  return taxonomyLabels;
}

function buildReportsFromCanonical({
  canonicalFindings,
  enrichmentFindings,
  legacyProfile = loadProfileByName({ profileName: 'legacy-taxonomy' }),
  enrichmentProfile = loadProfileByName({ profileName: 'enrichment-taxonomy' }),
}) {
  const reverseLabelMap = buildReverseLabelMap({ legacyProfile, enrichmentProfile });
  const enrichmentByUid = new Map();
  for (const enriched of enrichmentFindings || []) {
    enrichmentByUid.set(enriched.finding_uid, enriched);
  }

  const byFile = new Map();
  for (const finding of canonicalFindings || []) {
    if (!byFile.has(finding.source_file)) {
      byFile.set(finding.source_file, {
        file_path: finding.source_file,
        source_folder: finding.source_file.startsWith('products/') ? 'products' : 'teams',
        metadata: finding.metadata || {
          title: null,
          product: null,
          team: null,
          date: null,
          methodology: [],
          participants_total: null,
          existing_tags: [],
        },
        demographics_summary: finding.demographics_summary || null,
        findings_count: 0,
        classified_findings: [],
      });
    }

    const report = byFile.get(finding.source_file);
    const enriched = enrichmentByUid.get(finding.finding_uid);
    const taxonomyLabels = mapEnrichedLabelsToLegacy({
      suggestedLabels: (enriched && enriched.suggested_labels) || {},
      reverseLabelMap,
    });

    report.classified_findings.push({
      finding_id: report.classified_findings.length + 1,
      finding_text: finding.finding_title,
      taxonomy_labels: taxonomyLabels,
    });
    report.findings_count += 1;
  }

  return Array.from(byFile.values()).sort((a, b) => a.file_path.localeCompare(b.file_path));
}

function generateTaxonomyAnalysisFromReports({
  reports,
  legacyProfile = loadProfileByName({ profileName: 'legacy-taxonomy' }),
}) {
  const analysis = {
    label_frequency: {},
    product_coverage: {},
    user_group_coverage: {},
    cross_product_patterns: [],
    underserved_groups_analysis: {},
    assistive_tech_coverage: {},
  };

  const labelCounts = {};
  const productFindings = {};
  const userGroupFindings = {};

  for (const report of reports || []) {
    const product = (report.metadata && report.metadata.product) || 'Unknown';
    if (!productFindings[product]) productFindings[product] = [];

    for (const finding of report.classified_findings || []) {
      productFindings[product].push(finding);
      for (const [dimension, labels] of Object.entries(finding.taxonomy_labels || {})) {
        if (!labelCounts[dimension]) labelCounts[dimension] = {};
        for (const labelObj of labels || []) {
          labelCounts[dimension][labelObj.label] = (labelCounts[dimension][labelObj.label] || 0) + 1;
          if (dimension === 'user_groups') {
            if (!userGroupFindings[labelObj.label]) userGroupFindings[labelObj.label] = [];
            userGroupFindings[labelObj.label].push({ product });
          }
        }
      }
    }
  }

  analysis.label_frequency = labelCounts;

  for (const [product, findings] of Object.entries(productFindings)) {
    const themes = new Set();
    const userGroups = new Set();
    const findingTypes = new Set();
    for (const finding of findings) {
      for (const label of finding.taxonomy_labels.research_themes || []) themes.add(label.label);
      for (const label of finding.taxonomy_labels.user_groups || []) userGroups.add(label.label);
      for (const label of finding.taxonomy_labels.finding_types || []) findingTypes.add(label.label);
    }
    analysis.product_coverage[product] = {
      total_findings: findings.length,
      themes: [...themes].sort(),
      user_groups_studied: [...userGroups].sort(),
      finding_types: [...findingTypes].sort(),
    };
  }

  for (const [group, items] of Object.entries(userGroupFindings)) {
    const products = new Set(items.map(item => item.product));
    analysis.user_group_coverage[group] = {
      total_findings: items.length,
      products_studied: [...products].sort(),
    };
  }

  const themeProducts = {};
  for (const [product, coverage] of Object.entries(analysis.product_coverage)) {
    for (const theme of coverage.themes || []) {
      if (!themeProducts[theme]) themeProducts[theme] = new Set();
      themeProducts[theme].add(product);
    }
  }
  analysis.cross_product_patterns = Object.entries(themeProducts)
    .filter(([, products]) => products.size > 2)
    .map(([theme, products]) => ({
      theme,
      products_affected: [...products].sort(),
      product_count: products.size,
    }))
    .sort((a, b) => b.product_count - a.product_count || a.theme.localeCompare(b.theme));

  const allProducts = Object.keys(analysis.product_coverage);
  const allUserGroups = Object.keys((legacyProfile.dimensions && legacyProfile.dimensions.user_groups) || {});
  for (const group of allUserGroups) {
    const studied = analysis.user_group_coverage[group];
    const productsStudied = studied ? studied.products_studied : [];
    const productsNotStudied = allProducts.filter(product => !productsStudied.includes(product));
    analysis.underserved_groups_analysis[group] = {
      total_studies_including_group: studied ? studied.total_findings : 0,
      products_with_coverage: productsStudied.length,
      products_without_coverage: productsNotStudied.length,
      gap_products: productsNotStudied.slice(0, 10),
    };
  }

  let totalReportsWithAT = 0;
  let totalReportsWithCognitive = 0;
  const productsWithAT = new Set();
  for (const report of reports || []) {
    const product = (report.metadata && report.metadata.product) || 'Unknown';
    const demo = report.demographics_summary;
    if (!demo) continue;
    if (demo.assistive_tech_participants && demo.assistive_tech_participants > 0) {
      totalReportsWithAT += 1;
      productsWithAT.add(product);
    }
    if (demo.cognitive_disability_participants && demo.cognitive_disability_participants > 0) {
      totalReportsWithCognitive += 1;
    }
  }
  analysis.assistive_tech_coverage = {
    reports_including_at_users: totalReportsWithAT,
    reports_including_cognitive_disability: totalReportsWithCognitive,
    total_reports: reports.length,
    at_coverage_percentage:
      reports.length > 0 ? Math.round((totalReportsWithAT / reports.length) * 100) : 0,
    products_with_at_testing: [...productsWithAT].sort(),
  };

  return analysis;
}

function buildLegacyTaxonomyData({
  generatedAt,
  filesScanned,
  reports,
  legacyProfile = loadProfileByName({ profileName: 'legacy-taxonomy' }),
  skipped = {},
}) {
  const totalKeyFindings = reports.reduce((sum, report) => sum + (report.findings_count || 0), 0);
  const taxonomyAnalysis = generateTaxonomyAnalysisFromReports({
    reports,
    legacyProfile,
  });

  return {
    generated_at: generatedAt,
    summary: {
      total_reports_scanned: filesScanned,
      reports_with_findings: reports.length,
      total_key_findings: totalKeyFindings,
      skipped: {
        no_frontmatter: skipped.no_frontmatter || 0,
        no_key_findings: skipped.no_key_findings || 0,
        placeholder_only: skipped.placeholder_only || 0,
      },
    },
    taxonomy_definition: legacyProfile.dimensions,
    taxonomy_analysis: taxonomyAnalysis,
    reports,
  };
}

function buildLegacyTaxonomyReport(data) {
  const lines = [];
  const summary = data.summary || {};
  const analysis = data.taxonomy_analysis || {};

  lines.push('# Research Findings Taxonomy Report');
  lines.push('');
  lines.push('## Purpose');
  lines.push('');
  lines.push('Auto-generated taxonomy analysis of research findings across VA.gov products and teams.');
  lines.push('');

  lines.push('## How to Use This Report');
  lines.push('');
  lines.push('| Question | Where to Look |');
  lines.push('|----------|---------------|');
  lines.push('| What findings are most common? | Label Frequency Analysis |');
  lines.push('| Which products have broad coverage? | Product Coverage Analysis |');
  lines.push('| Where are inclusivity gaps? | Underserved Groups Gap Analysis |');
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|-------|');
  lines.push(`| Total files scanned | ${summary.total_reports_scanned || 0} |`);
  lines.push(`| Reports with classified findings | ${summary.reports_with_findings || 0} |`);
  lines.push(`| Total key findings analyzed | ${summary.total_key_findings || 0} |`);
  lines.push(`| Files skipped (no frontmatter) | ${(summary.skipped && summary.skipped.no_frontmatter) || 0} |`);
  lines.push(`| Files skipped (no key_findings) | ${(summary.skipped && summary.skipped.no_key_findings) || 0} |`);
  lines.push(`| Files skipped (placeholder data) | ${(summary.skipped && summary.skipped.placeholder_only) || 0} |`);
  lines.push('');

  lines.push('## Taxonomy Dimensions');
  lines.push('');
  lines.push('| Dimension | Labels |');
  lines.push('|-----------|--------|');
  for (const [dimension, labels] of Object.entries(data.taxonomy_definition || {}).sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    lines.push(`| ${dimension} | ${Object.keys(labels || {}).join(', ')} |`);
  }
  lines.push('');

  lines.push('## Label Frequency Analysis');
  lines.push('');
  for (const [dimension, labels] of Object.entries(analysis.label_frequency || {})) {
    const sorted = Object.entries(labels || {}).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) continue;
    lines.push(`### ${formatDimensionName(dimension)}`);
    lines.push('');
    lines.push('| Label | Count |');
    lines.push('|-------|-------|');
    for (const [label, count] of sorted.slice(0, 25)) {
      lines.push(`| ${label} | ${count} |`);
    }
    lines.push('');
  }

  lines.push('## Cross-Product Patterns');
  lines.push('');
  const patterns = analysis.cross_product_patterns || [];
  if (!patterns.length) {
    lines.push('- none');
  } else {
    for (const pattern of patterns.slice(0, 10)) {
      lines.push(`- ${pattern.theme}: ${pattern.product_count} products`);
    }
  }
  lines.push('');

  lines.push('## Product Coverage Analysis');
  lines.push('');
  const productEntries = Object.entries(analysis.product_coverage || {}).sort(
    (a, b) => b[1].total_findings - a[1].total_findings,
  );
  lines.push('| Product | Findings | Themes Studied | User Groups Studied |');
  lines.push('|---------|----------|----------------|---------------------|');
  for (const [product, coverage] of productEntries.slice(0, 40)) {
    lines.push(
      `| ${product} | ${coverage.total_findings} | ${(coverage.themes || []).join(', ') || '_none_'} | ${(coverage.user_groups_studied || []).join(', ') || '_none_'} |`,
    );
  }
  lines.push('');

  lines.push('## Assistive Technology Coverage');
  lines.push('');
  const at = analysis.assistive_tech_coverage || {};
  lines.push(`- Reports with AT users: ${at.reports_including_at_users || 0}`);
  lines.push(`- Reports with cognitive disability participants: ${at.reports_including_cognitive_disability || 0}`);
  lines.push('');

  lines.push('## Underserved Groups Gap Analysis');
  lines.push('');
  const groupEntries = Object.entries(analysis.underserved_groups_analysis || {}).sort(
    (a, b) => a[1].total_studies_including_group - b[1].total_studies_including_group,
  );
  lines.push('| User Group | Findings Mentioning Group | Products With Coverage | Products Without Coverage |');
  lines.push('|------------|--------------------------|------------------------|---------------------------|');
  for (const [group, info] of groupEntries) {
    lines.push(
      `| ${formatDimensionName(group)} | ${info.total_studies_including_group} | ${info.products_with_coverage} | ${info.products_without_coverage} |`,
    );
  }
  lines.push('');

  lines.push('## Methodology');
  lines.push('');
  lines.push('- Generated from modular extraction pipeline using profile-driven taxonomy classification.');
  lines.push('- This is an adapter scaffold to preserve legacy artifact shape during migration.');
  lines.push('');

  return lines.join('\n');
}

function writeLegacyTaxonomyArtifacts({ outDir = '.', data, markdown }) {
  const outputDir = path.join(outDir, 'reports', 'research-taxonomy');
  fs.mkdirSync(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, 'taxonomy-data.json');
  const mdPath = path.join(outputDir, 'taxonomy-report.md');

  fs.writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
  fs.writeFileSync(mdPath, `${String(markdown || '').trim()}\n`);

  return [jsonPath, mdPath];
}

module.exports = {
  buildReportsFromCanonical,
  generateTaxonomyAnalysisFromReports,
  buildLegacyTaxonomyData,
  buildLegacyTaxonomyReport,
  writeLegacyTaxonomyArtifacts,
};
