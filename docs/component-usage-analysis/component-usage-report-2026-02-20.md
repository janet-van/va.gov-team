# Component Catalog Usage Analysis Report

**Generated:** 2/20/2026, 11:04:12 PM

## Executive Summary

- **Total Catalog Items Analyzed:** 55
- **Total References Found:** 99
- **Analysis Scope:** VA.gov-team repository documentation

> **Note:** This analysis counts references in documentation files (*.md, *.js, *.jsx, *.json, *.yml, *.yaml) within the va.gov-team repository. For actual code usage statistics, a similar analysis should be run on the vets-website repository.

## Top 10 Most Referenced Items

| Rank | Name | References |
|------|------|------------|
| 1 | Address | 35 |
| 2 | Prefill | 25 |
| 3 | Service History | 22 |
| 4 | Identification Information | 4 |
| 5 | SchemaForm | 3 |
| 6 | Name and Date of Birth | 2 |
| 7 | Phone and Email | 2 |
| 8 | va-accordion | 1 |
| 9 | va-telephone-input | 1 |
| 10 | ReviewPage | 1 |

## Detailed Breakdown

### Design System Components (20 total)

| Component | References | Sample Locations |
|-----------|------------|------------------|
| va-accordion | 1 | ./products/health-care/champva/va-forms-design-content.md |
| va-telephone-input | 1 | ./products/platform/design-system/components/form-control-components/onblur-validation/design-decision-log.md |
| va-additional-info | 0 | N/A |
| va-breadcrumbs | 0 | N/A |
| va-button | 0 | N/A |
| va-button-destructive | 0 | N/A |
| va-calendar-event | 0 | N/A |
| va-card-status | 0 | N/A |
| va-combo-box | 0 | N/A |
| va-file-input | 0 | N/A |
| va-link | 0 | N/A |
| va-maintenance-banner | 0 | N/A |
| va-modal | 0 | N/A |
| va-search-filter | 0 | N/A |
| va-segmented-button | 0 | N/A |
| va-select | 0 | N/A |
| va-sidenav | 0 | N/A |
| va-sort | 0 | N/A |
| va-tabs | 0 | N/A |
| va-tag-status | 0 | N/A |

### Form Widgets (16 total)

| Widget | References | Sample Locations |
|--------|------------|------------------|
| ArrayField | 0 | N/A |
| ObjectField | 0 | N/A |
| FieldTemplate | 0 | N/A |
| DateWidget | 0 | N/A |
| PhoneNumberWidget | 0 | N/A |
| SSNWidget | 0 | N/A |
| SelectWidget | 0 | N/A |
| RadioWidget | 0 | N/A |
| CheckboxWidget | 0 | N/A |
| CurrencyWidget | 0 | N/A |
| EmailWidget | 0 | N/A |
| TextWidget | 0 | N/A |
| YesNoWidget | 0 | N/A |
| AutosuggestField | 0 | N/A |
| FileField | 0 | N/A |
| FullNameField | 0 | N/A |

### Form System Components (10 total)

| Component | References | Sample Locations |
|-----------|------------|------------------|
| SchemaForm | 3 | ./products/identity-personalization/profile/forms-discovery/Discovery-Formik_New-forms-system-migration.md<br>./teams/_archive/vsa/engineering/forms-system/list_loop_v2_contact_info.md<br>./teams/_archive/vsa/engineering/forms-system/list_loop_v2_add_item.md |
| ReviewPage | 1 | ./teams/_archive/vsa/engineering/forms-system/list_loop_v2_add_item.md |
| FormTitle | 1 | ./products/identity-personalization/my-va/engineering-docs/frontend/benefit-applications-and-forms.md |
| FormApp | 0 | N/A |
| FormPage | 0 | N/A |
| FormNav | 0 | N/A |
| SaveStatus | 0 | N/A |
| PrefillMessage | 0 | N/A |
| SaveInProgressIntro | 0 | N/A |
| SubmitButtons | 0 | N/A |

### Form Patterns (9 total)

| Pattern | References | Sample Locations |
|---------|------------|------------------|
| Address | 35 | ./products/find-a-va-form/initiatives/2021-01-mvp/form-detail-landing-pages/status-and-decisions.md<br>./products/education-careers/application/1990/design/form-outline.md<br>./products/information-architecture/ia-design-docs/form-digitization-21-4138.md |
| Prefill | 25 | ./products/decision-reviews/form-data-fields.md<br>./products/authenticated-patterns/Patterns/smart-forms/README.md<br>./products/authenticated-patterns/Engineering/#261-codify-prefill-within-forms-system.md |
| Service History | 22 | ./products/education-careers/application/1990/design/form-outline.md<br>./products/content/content-patterns-and-standards/form-intro-pages.md<br>./products/my-education-benefits/education-benefits-form/product-outline.md |
| Identification Information | 4 | ./products/information-architecture/ia-design-docs/form-digitization-21-4138.md<br>./products/content/content-patterns-and-standards/form-standards/terms.md<br>./products/content/content-patterns-and-standards/form-standards/punctuation.md |
| Name and Date of Birth | 2 | ./products/information-architecture/ia-design-docs/form-digitization-21-4138.md<br>./products/content/content-patterns-and-standards/form-standards/terms.md |
| Phone and Email | 2 | ./products/information-architecture/ia-design-docs/form-digitization-21-4138.md<br>./products/health-care/application/health-update-form/10-10EZR Form/10-10EZR-application-content.md |
| Multiple Responses | 1 | ./products/health-care/application/health-update-form/10-10EZR Form/10-10EZR-ErrorMatrix.md |
| Relationship to Veteran | 1 | ./products/accredited-representation-management/product-documentation/appoint-a-representative/required-form-fields.md |
| Housing Status | 0 | N/A |

## Least Referenced Items

The following items have the fewest references in the documentation:

| Name | References |
|------|------------|
| FileField | 0 |
| FullNameField | 0 |
| FormApp | 0 |
| FormPage | 0 |
| FormNav | 0 |
| SaveStatus | 0 |
| PrefillMessage | 0 |
| SaveInProgressIntro | 0 |
| SubmitButtons | 0 |
| Housing Status | 0 |

## Methodology

This analysis was performed by:
1. Identifying all design system components, form widgets, form components, and form patterns from the catalog
2. Searching for references to each item across form-related documentation in the va.gov-team repository
3. Counting occurrences in files within form-related directories
4. Capturing sample file locations where components are referenced

**Search Paths:**
- products/**/forms
- products/**/form-*
- products/**/*-form*
- platform/forms*
- platform/design/design-system
- teams/**/forms*

**File Types Analyzed:**
- Markdown (*.md)
- JavaScript (*.js, *.jsx)
- Configuration (*.json, *.yml, *.yaml)
