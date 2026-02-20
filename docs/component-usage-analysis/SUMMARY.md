# Component Catalog Usage Analysis - Summary

## Quick Reference

**Analysis Date:** February 20, 2026  
**Repository:** va.gov-team (documentation repository)  
**Total Items Analyzed:** 55 catalog items  
**Total References Found:** 99

## Key Findings

### Most Used Items (Top 10)

1. **Address** - 35 references
   - Form pattern for collecting addresses
   - Most commonly referenced pattern across forms

2. **Prefill** - 25 references
   - Pattern for pre-filling form data from user profile
   - Critical for improving user experience

3. **Service History** - 22 references
   - Pattern for collecting military service information
   - Essential for veteran-specific forms

4. **Identification Information** - 4 references
5. **SchemaForm** - 3 references
6. **Name and Date of Birth** - 2 references
7. **Phone and Email** - 2 references
8. **va-accordion** - 1 reference
9. **va-telephone-input** - 1 reference
10. **ReviewPage** - 1 reference

### Component Categories

| Category | Items Analyzed | Items With References | Total References |
|----------|----------------|----------------------|------------------|
| Design System Components | 20 | 2 (10%) | 2 |
| Form Widgets | 16 | 0 (0%) | 0 |
| Form System Components | 10 | 3 (30%) | 5 |
| Form Patterns | 9 | 7 (78%) | 92 |

### Key Insights

1. **Form Patterns Dominate Usage** - 92 out of 99 references (93%) are to form patterns rather than individual components. This suggests:
   - Patterns are well-documented in this repository
   - Teams reference patterns more than individual components in documentation
   - Component-level details may be documented elsewhere (e.g., vets-website)

2. **Low Design System Component References** - Only 2 references to web components suggests:
   - Design system components are primarily documented in their own directories
   - Form documentation focuses on patterns rather than implementation details
   - Actual component usage is in code repositories, not documentation

3. **Zero Widget References** - No references to form widgets indicates:
   - Widgets are implementation details not typically mentioned in product documentation
   - Widget documentation lives in technical documentation
   - Teams may be using components through patterns rather than directly

4. **Form System Components** - Low reference counts for core components like FormApp, FormPage suggests:
   - These are infrastructure components
   - Teams use them but don't reference them in documentation
   - May be abstracted away from product teams

## Recommendations

### For Design System Team

1. **Improve Pattern Documentation**
   - Patterns are clearly valuable and well-referenced
   - Continue investing in pattern documentation
   - Consider creating more reusable patterns

2. **Component Adoption**
   - Low component references suggest need for:
     - Better component documentation in form context
     - More examples showing component usage in forms
     - Integration guides for new components

3. **Widget Visibility**
   - Consider whether widgets need better documentation
   - Create examples showing when to use each widget
   - Link pattern documentation to underlying widgets

### For VFS Teams

1. **Use Patterns First**
   - Patterns are the preferred abstraction
   - Check pattern library before building custom solutions
   - Contribute new patterns when building common functionality

2. **Reference Patterns in Documentation**
   - Document which patterns your forms use
   - Link to pattern documentation
   - Share learnings and edge cases

### For Platform Teams

1. **Documentation Strategy**
   - Pattern-focused documentation is working well
   - Consider whether component-level documentation should live elsewhere
   - Ensure clear path from pattern → implementation

2. **Cross-Repository Analysis**
   - Run similar analysis on vets-website for code usage
   - Compare documentation references to actual code usage
   - Identify gaps between documentation and implementation

## Files Generated

1. **Markdown Report:** `component-usage-report-2026-02-20.md`
   - Detailed tables of all components
   - Sample file locations
   - Full methodology

2. **JSON Data:** `component-usage-data-2026-02-20.json`
   - Machine-readable format
   - Complete file location lists
   - Can be used for automation

3. **README:** `README.md`
   - How to run the analysis
   - Understanding results
   - Use cases and updates

## Next Steps

1. ✅ Complete initial analysis
2. ✅ Generate reports
3. ✅ Document methodology
4. 🔄 Share with Design System Team
5. 📋 Plan for vets-website code analysis
6. 📋 Establish regular reporting cadence

## How to Update

To run a new analysis:

```bash
cd /path/to/va.gov-team
node scripts/analyze-component-usage.js
```

Reports will be generated with current date stamp.

## Questions?

- Slack: [#platform-design-system](https://dsva.slack.com/channels/platform-design-system)
- Team: [Design and Forms Systems Team](../../teams/digital-experience/design-forms-systems/README.md)
