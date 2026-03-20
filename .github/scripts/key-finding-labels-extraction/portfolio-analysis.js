const { ENRICHMENT_TAXONOMY } = require('./enrichment-taxonomy');

function inferProduct(sourceFile, metadata) {
  if (metadata && metadata.product) return String(metadata.product).trim();

  const parts = String(sourceFile || '').split('/').filter(Boolean);
  if (parts[0] === 'products' && parts[1]) return parts[1];
  if (parts[0] === 'teams' && parts[1]) return `team:${parts[1]}`;
  return 'unknown';
}

function addToSetMap(map, key, value) {
  if (!map.has(key)) map.set(key, new Set());
  if (value !== undefined && value !== null && value !== '') {
    map.get(key).add(value);
  }
}

function toSortedObjectOfCounts(map) {
  return Object.fromEntries(
    Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  );
}

function generatePortfolioAnalysis({ enrichmentFindings, canonicalFindings }) {
  const labelFrequency = new Map();
  const productCoverageMap = new Map();
  const userGroupCoverageMap = new Map();
  const themeToProducts = new Map();

  let reportsWithAT = 0;
  let reportsWithCognitive = 0;
  const productsWithATTesting = new Set();
  const reportKeySeen = new Set();

  for (const finding of enrichmentFindings) {
    const product = inferProduct(finding.source_file, finding.metadata);

    if (!productCoverageMap.has(product)) {
      productCoverageMap.set(product, {
        total_findings: 0,
        themes: new Set(),
        user_groups_studied: new Set(),
        finding_types: new Set(),
      });
    }

    const productEntry = productCoverageMap.get(product);
    productEntry.total_findings += 1;

    for (const [dimension, labels] of Object.entries(finding.suggested_labels || {})) {
      for (const labelObj of labels) {
        const key = `${dimension}:${labelObj.label}`;
        labelFrequency.set(key, (labelFrequency.get(key) || 0) + 1);

        if (dimension === 'research_themes') {
          productEntry.themes.add(labelObj.label);
          addToSetMap(themeToProducts, labelObj.label, product);
        }

        if (dimension === 'user_groups') {
          productEntry.user_groups_studied.add(labelObj.label);
          addToSetMap(userGroupCoverageMap, labelObj.label, product);
        }

        if (dimension === 'finding_types') {
          productEntry.finding_types.add(labelObj.label);
        }
      }
    }
  }

  for (const finding of canonicalFindings) {
    const reportKey = finding.source_file;
    if (reportKeySeen.has(reportKey)) continue;
    reportKeySeen.add(reportKey);

    const demo = finding.demographics_summary;
    if (!demo) continue;

    const product = inferProduct(finding.source_file, finding.metadata);

    if (demo.assistive_tech_participants && demo.assistive_tech_participants > 0) {
      reportsWithAT += 1;
      productsWithATTesting.add(product);
    }

    if (demo.cognitive_disability_participants && demo.cognitive_disability_participants > 0) {
      reportsWithCognitive += 1;
    }
  }

  const allProducts = Array.from(productCoverageMap.keys()).sort();
  const userGroupLabels = Object.keys(ENRICHMENT_TAXONOMY.user_groups || {});

  const underservedGroupsAnalysis = {};
  for (const group of userGroupLabels) {
    const productsStudied = Array.from(userGroupCoverageMap.get(group) || []).sort();
    const productsWithoutCoverage = allProducts.filter(product => !productsStudied.includes(product));

    underservedGroupsAnalysis[group] = {
      total_studies_including_group: productsStudied.length,
      products_with_coverage: productsStudied.length,
      products_without_coverage: productsWithoutCoverage.length,
      gap_products: productsWithoutCoverage.slice(0, 10),
    };
  }

  const productCoverage = {};
  for (const [product, entry] of productCoverageMap.entries()) {
    productCoverage[product] = {
      total_findings: entry.total_findings,
      themes: Array.from(entry.themes).sort(),
      user_groups_studied: Array.from(entry.user_groups_studied).sort(),
      finding_types: Array.from(entry.finding_types).sort(),
    };
  }

  const userGroupCoverage = {};
  for (const group of userGroupLabels) {
    const productsStudied = Array.from(userGroupCoverageMap.get(group) || []).sort();
    userGroupCoverage[group] = {
      total_findings: productsStudied.length,
      products_studied: productsStudied,
    };
  }

  const crossProductPatterns = Array.from(themeToProducts.entries())
    .filter(([, products]) => products.size > 2)
    .map(([theme, products]) => ({
      theme,
      products_affected: Array.from(products).sort(),
      product_count: products.size,
    }))
    .sort((a, b) => b.product_count - a.product_count || a.theme.localeCompare(b.theme));

  return {
    artifact_schema_version: '1.0.0',
    label_frequency: toSortedObjectOfCounts(labelFrequency),
    product_coverage: productCoverage,
    user_group_coverage: userGroupCoverage,
    cross_product_patterns: crossProductPatterns,
    underserved_groups_analysis: underservedGroupsAnalysis,
    assistive_tech_coverage: {
      reports_including_at_users: reportsWithAT,
      reports_including_cognitive_disability: reportsWithCognitive,
      total_reports: reportKeySeen.size,
      at_coverage_percentage:
        reportKeySeen.size > 0 ? Math.round((reportsWithAT / reportKeySeen.size) * 100) : 0,
      products_with_at_testing: Array.from(productsWithATTesting).sort(),
    },
  };
}

module.exports = {
  generatePortfolioAnalysis,
};
