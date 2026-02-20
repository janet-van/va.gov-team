#!/usr/bin/env node

/**
 * Component Catalog Usage Analysis Script
 * 
 * This script analyzes the usage of design system components and patterns
 * across VA.gov forms documentation in this repository.
 * 
 * Note: This analyzes documentation in va.gov-team repo, not actual code in vets-website.
 * For code analysis, you would need to run this against the vets-website repository.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Design System Components to track
const COMPONENTS = [
  'va-accordion',
  'va-additional-info',
  'va-breadcrumbs',
  'va-button',
  'va-button-destructive',
  'va-calendar-event',
  'va-card-status',
  'va-combo-box',
  'va-file-input',
  'va-link',
  'va-maintenance-banner',
  'va-modal',
  'va-search-filter',
  'va-segmented-button',
  'va-select',
  'va-sidenav',
  'va-sort',
  'va-tabs',
  'va-tag-status',
  'va-telephone-input'
];

// Form System Widgets and Components
const FORM_WIDGETS = [
  'ArrayField',
  'ObjectField',
  'FieldTemplate',
  'DateWidget',
  'PhoneNumberWidget',
  'SSNWidget',
  'SelectWidget',
  'RadioWidget',
  'CheckboxWidget',
  'CurrencyWidget',
  'EmailWidget',
  'TextWidget',
  'YesNoWidget',
  'AutosuggestField',
  'FileField',
  'FullNameField'
];

// Form System Components
const FORM_COMPONENTS = [
  'FormApp',
  'FormPage',
  'FormNav',
  'ReviewPage',
  'SaveStatus',
  'SchemaForm',
  'PrefillMessage',
  'FormTitle',
  'SaveInProgressIntro',
  'SubmitButtons'
];

// Form Patterns
const FORM_PATTERNS = [
  'Service History',
  'Prefill',
  'Multiple Responses',
  'Name and Date of Birth',
  'Address',
  'Phone and Email',
  'Housing Status',
  'Identification Information',
  'Relationship to Veteran'
];

/**
 * Search for a pattern in files using grep
 */
function searchPattern(pattern, directory, filePattern = '*') {
  try {
    // Escape special regex characters for grep
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Use grep to search recursively, ignoring node_modules and .git
    const cmd = `grep -r -i --include="${filePattern}" "${escapedPattern}" ${directory} 2>/dev/null | wc -l`;
    const result = execSync(cmd, { encoding: 'utf-8', cwd: process.cwd() });
    return parseInt(result.trim()) || 0;
  } catch (error) {
    // grep returns non-zero exit code when no matches found
    return 0;
  }
}

/**
 * Search for component in specific form-related directories
 */
function searchInForms(pattern) {
  const formsDirectories = [
    'products/**/forms',
    'products/**/form-*',
    'products/**/*-form*',
    'platform/forms*',
    'platform/design/design-system',
    'teams/**/forms*'
  ];
  
  let totalCount = 0;
  const locations = [];
  
  for (const dir of formsDirectories) {
    try {
      // Escape pattern for shell
      const escapedPattern = pattern.replace(/'/g, "'\\''");
      const cmd = `find . -path "./${dir}" -type f \\( -name "*.md" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" \\) -exec grep -l -i "${escapedPattern}" {} \\; 2>/dev/null | head -20`;
      const result = execSync(cmd, { encoding: 'utf-8', cwd: process.cwd() });
      const files = result.trim().split('\n').filter(f => f.length > 0);
      
      if (files.length > 0) {
        totalCount += files.length;
        locations.push(...files);
      }
    } catch (error) {
      // No matches in this directory pattern
    }
  }
  
  return { count: totalCount, locations: locations.slice(0, 10) };
}

/**
 * Main analysis function
 */
function analyzeComponentUsage() {
  console.log('Starting Component Catalog Usage Analysis...\n');
  console.log('Analyzing components in VA.gov forms documentation...\n');
  
  const results = {
    components: {},
    widgets: {},
    formComponents: {},
    patterns: {},
    timestamp: new Date().toISOString(),
    summary: {
      totalComponents: 0,
      totalUsages: 0,
      mostUsed: [],
      leastUsed: []
    }
  };
  
  // Analyze Design System Components
  console.log('Analyzing Design System Components...');
  for (const component of COMPONENTS) {
    const result = searchInForms(component);
    results.components[component] = {
      count: result.count,
      sampleLocations: result.locations
    };
    results.summary.totalUsages += result.count;
    console.log(`  ${component}: ${result.count} references`);
  }
  
  // Analyze Form Widgets
  console.log('\nAnalyzing Form Widgets...');
  for (const widget of FORM_WIDGETS) {
    const result = searchInForms(widget);
    results.widgets[widget] = {
      count: result.count,
      sampleLocations: result.locations
    };
    results.summary.totalUsages += result.count;
    console.log(`  ${widget}: ${result.count} references`);
  }
  
  // Analyze Form Components
  console.log('\nAnalyzing Form Components...');
  for (const component of FORM_COMPONENTS) {
    const result = searchInForms(component);
    results.formComponents[component] = {
      count: result.count,
      sampleLocations: result.locations
    };
    results.summary.totalUsages += result.count;
    console.log(`  ${component}: ${result.count} references`);
  }
  
  // Analyze Form Patterns
  console.log('\nAnalyzing Form Patterns...');
  for (const pattern of FORM_PATTERNS) {
    const result = searchInForms(pattern);
    results.patterns[pattern] = {
      count: result.count,
      sampleLocations: result.locations
    };
    results.summary.totalUsages += result.count;
    console.log(`  ${pattern}: ${result.count} references`);
  }
  
  // Calculate summary statistics
  const allItems = [
    ...Object.entries(results.components),
    ...Object.entries(results.widgets),
    ...Object.entries(results.formComponents),
    ...Object.entries(results.patterns)
  ];
  
  results.summary.totalComponents = allItems.length;
  
  // Sort by usage count
  const sortedByUsage = allItems.sort((a, b) => b[1].count - a[1].count);
  results.summary.mostUsed = sortedByUsage.slice(0, 10).map(([name, data]) => ({
    name,
    count: data.count
  }));
  
  results.summary.leastUsed = sortedByUsage.slice(-10).map(([name, data]) => ({
    name,
    count: data.count
  }));
  
  return results;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results) {
  let report = `# Component Catalog Usage Analysis Report\n\n`;
  report += `**Generated:** ${new Date(results.timestamp).toLocaleString()}\n\n`;
  report += `## Executive Summary\n\n`;
  report += `- **Total Catalog Items Analyzed:** ${results.summary.totalComponents}\n`;
  report += `- **Total References Found:** ${results.summary.totalUsages}\n`;
  report += `- **Analysis Scope:** VA.gov-team repository documentation\n\n`;
  
  report += `> **Note:** This analysis counts references in documentation files (*.md, *.js, *.jsx, *.json, *.yml, *.yaml) within the va.gov-team repository. For actual code usage statistics, a similar analysis should be run on the vets-website repository.\n\n`;
  
  // Most Used Components
  report += `## Top 10 Most Referenced Items\n\n`;
  report += `| Rank | Name | References |\n`;
  report += `|------|------|------------|\n`;
  results.summary.mostUsed.forEach((item, idx) => {
    report += `| ${idx + 1} | ${item.name} | ${item.count} |\n`;
  });
  
  report += `\n## Detailed Breakdown\n\n`;
  
  // Design System Components
  report += `### Design System Components (${COMPONENTS.length} total)\n\n`;
  report += `| Component | References | Sample Locations |\n`;
  report += `|-----------|------------|------------------|\n`;
  Object.entries(results.components).sort((a, b) => b[1].count - a[1].count).forEach(([name, data]) => {
    const locations = data.sampleLocations.length > 0 
      ? data.sampleLocations.slice(0, 3).join('<br>') 
      : 'N/A';
    report += `| ${name} | ${data.count} | ${locations} |\n`;
  });
  
  // Form Widgets
  report += `\n### Form Widgets (${FORM_WIDGETS.length} total)\n\n`;
  report += `| Widget | References | Sample Locations |\n`;
  report += `|--------|------------|------------------|\n`;
  Object.entries(results.widgets).sort((a, b) => b[1].count - a[1].count).forEach(([name, data]) => {
    const locations = data.sampleLocations.length > 0 
      ? data.sampleLocations.slice(0, 3).join('<br>') 
      : 'N/A';
    report += `| ${name} | ${data.count} | ${locations} |\n`;
  });
  
  // Form Components
  report += `\n### Form System Components (${FORM_COMPONENTS.length} total)\n\n`;
  report += `| Component | References | Sample Locations |\n`;
  report += `|-----------|------------|------------------|\n`;
  Object.entries(results.formComponents).sort((a, b) => b[1].count - a[1].count).forEach(([name, data]) => {
    const locations = data.sampleLocations.length > 0 
      ? data.sampleLocations.slice(0, 3).join('<br>') 
      : 'N/A';
    report += `| ${name} | ${data.count} | ${locations} |\n`;
  });
  
  // Form Patterns
  report += `\n### Form Patterns (${FORM_PATTERNS.length} total)\n\n`;
  report += `| Pattern | References | Sample Locations |\n`;
  report += `|---------|------------|------------------|\n`;
  Object.entries(results.patterns).sort((a, b) => b[1].count - a[1].count).forEach(([name, data]) => {
    const locations = data.sampleLocations.length > 0 
      ? data.sampleLocations.slice(0, 3).join('<br>') 
      : 'N/A';
    report += `| ${name} | ${data.count} | ${locations} |\n`;
  });
  
  // Least Used Components
  report += `\n## Least Referenced Items\n\n`;
  report += `The following items have the fewest references in the documentation:\n\n`;
  report += `| Name | References |\n`;
  report += `|------|------------|\n`;
  results.summary.leastUsed.forEach((item) => {
    report += `| ${item.name} | ${item.count} |\n`;
  });
  
  report += `\n## Methodology\n\n`;
  report += `This analysis was performed by:\n`;
  report += `1. Identifying all design system components, form widgets, form components, and form patterns from the catalog\n`;
  report += `2. Searching for references to each item across form-related documentation in the va.gov-team repository\n`;
  report += `3. Counting occurrences in files within form-related directories\n`;
  report += `4. Capturing sample file locations where components are referenced\n`;
  report += `\n`;
  report += `**Search Paths:**\n`;
  report += `- products/**/forms\n`;
  report += `- products/**/form-*\n`;
  report += `- products/**/*-form*\n`;
  report += `- platform/forms*\n`;
  report += `- platform/design/design-system\n`;
  report += `- teams/**/forms*\n`;
  report += `\n`;
  report += `**File Types Analyzed:**\n`;
  report += `- Markdown (*.md)\n`;
  report += `- JavaScript (*.js, *.jsx)\n`;
  report += `- Configuration (*.json, *.yml, *.yaml)\n`;
  
  return report;
}

// Run the analysis
console.log('Component Catalog Usage Analysis\n');
console.log('='.repeat(80) + '\n');

const results = analyzeComponentUsage();

console.log('\n' + '='.repeat(80));
console.log('Analysis Complete!\n');

// Generate reports
const markdownReport = generateMarkdownReport(results);
const jsonOutput = JSON.stringify(results, null, 2);

// Save reports
const reportDir = path.join(process.cwd(), 'docs', 'component-usage-analysis');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp = new Date().toISOString().split('T')[0];
const markdownPath = path.join(reportDir, `component-usage-report-${timestamp}.md`);
const jsonPath = path.join(reportDir, `component-usage-data-${timestamp}.json`);

fs.writeFileSync(markdownPath, markdownReport);
fs.writeFileSync(jsonPath, jsonOutput);

console.log(`\nReports saved:`);
console.log(`  Markdown: ${markdownPath}`);
console.log(`  JSON: ${jsonPath}`);
console.log('\nSummary:');
console.log(`  Total catalog items analyzed: ${results.summary.totalComponents}`);
console.log(`  Total references found: ${results.summary.totalUsages}`);
console.log(`\nTop 5 most referenced items:`);
results.summary.mostUsed.slice(0, 5).forEach((item, idx) => {
  console.log(`  ${idx + 1}. ${item.name}: ${item.count} references`);
});
