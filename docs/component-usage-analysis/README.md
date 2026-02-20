# Component Catalog Usage Analysis

This directory contains automated analysis of component usage across VA.gov forms documentation.

## Overview

The analysis script identifies and counts how many times each component from the Design System catalog is referenced in form-related documentation within the va.gov-team repository.

## What is Analyzed

The script analyzes four categories of catalog items:

### 1. Design System Components (20 items)
Web components from the VA Design System, including:
- `va-accordion`, `va-button`, `va-modal`, `va-select`, `va-file-input`, etc.

### 2. Form Widgets (16 items)
UI widgets used in the forms system:
- `DateWidget`, `PhoneNumberWidget`, `SelectWidget`, `RadioWidget`, etc.

### 3. Form System Components (10 items)
Core form infrastructure components:
- `FormApp`, `FormPage`, `ReviewPage`, `SchemaForm`, `PrefillMessage`, etc.

### 4. Form Patterns (9 items)
Common form patterns:
- Address, Prefill, Service History, Name and Date of Birth, etc.

## Reports Generated

Each analysis run generates two files:

1. **Markdown Report** (`component-usage-report-YYYY-MM-DD.md`)
   - Human-readable summary with tables
   - Top/least used components
   - Sample file locations for each component

2. **JSON Data** (`component-usage-data-YYYY-MM-DD.json`)
   - Machine-readable data
   - Complete list of file locations
   - Can be used for further analysis or automation

## How to Run the Analysis

### Prerequisites
- Node.js installed
- Access to the va.gov-team repository
- Unix-like environment (Linux/macOS) with `grep` and `find` commands

### Running the Script

```bash
# From the repository root
node scripts/analyze-component-usage.js
```

The script will:
1. Search for references to each catalog item
2. Count occurrences in form-related files
3. Generate reports in `docs/component-usage-analysis/`
4. Display a summary in the console

### Example Output

```
Component Catalog Usage Analysis
================================================================================

Starting Component Catalog Usage Analysis...

Analyzing Design System Components...
  va-accordion: 1 references
  va-telephone-input: 1 references
  ...

Analyzing Form Widgets...
  ArrayField: 0 references
  ...

Summary:
  Total catalog items analyzed: 55
  Total references found: 99

Top 5 most referenced items:
  1. Address: 35 references
  2. Prefill: 25 references
  3. Service History: 22 references
  4. Identification Information: 4 references
  5. SchemaForm: 3 references
```

## Understanding the Results

### High Reference Counts
Components with many references are:
- Heavily used across forms
- Well-documented
- Important for consistency

### Zero References
Components with no references may:
- Be newer additions not yet documented
- Be used only in code (vets-website), not documentation
- Need better adoption or documentation

### Important Notes

⚠️ **This analysis covers documentation only**

The va.gov-team repository contains documentation, not the actual form code. For accurate code usage statistics, run a similar analysis on the [vets-website](https://github.com/department-of-veterans-affairs/vets-website) repository.

## Search Methodology

### Directories Searched
- `products/**/forms`
- `products/**/form-*`
- `products/**/*-form*`
- `platform/forms*`
- `platform/design/design-system`
- `teams/**/forms*`

### File Types
- Markdown: `*.md`
- JavaScript: `*.js`, `*.jsx`
- Configuration: `*.json`, `*.yml`, `*.yaml`

### Search Method
Case-insensitive grep-based search across all form-related files.

## Use Cases

### For Design System Team
- Track component adoption in documentation
- Identify underutilized components
- Plan documentation improvements
- Monitor pattern usage trends

### For VFS Teams
- Understand which components are commonly used
- Find examples of component usage
- Identify available patterns for new forms

### For Platform Teams
- Assess documentation coverage
- Prioritize component improvements
- Plan deprecation strategies

## Latest Report

📊 **Most Recent Analysis:** [component-usage-report-2026-02-20.md](./component-usage-report-2026-02-20.md)

**Key Findings:**
- 55 catalog items analyzed
- 99 total references found
- Top components: Address (35), Prefill (25), Service History (22)

## Updating the Analysis

The script can be updated to:
- Add new components to track
- Change search paths
- Modify report format
- Add additional metrics

Edit `/scripts/analyze-component-usage.js` to make changes.

## Related Documentation

- [Forms System](../../products/platform/forms-system/)
- [Design System](../../products/platform/design-system/)
- [Form Patterns](../../products/platform/design-system/patterns/)
- [Component Library](../../teams/digital-experience/design-system/component_library.md)

## Questions or Issues?

For questions about this analysis:
- Slack: [#platform-design-system](https://dsva.slack.com/channels/platform-design-system)
- Team: [Design and Forms Systems Team](../../teams/digital-experience/design-forms-systems/README.md)
