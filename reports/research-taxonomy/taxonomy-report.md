# Research Findings Taxonomy Report

> Auto-generated taxonomy analysis of research findings across VA.gov products and teams.
> Generated: 2026-03-09T15:15:53.308Z

## Purpose

This report provides a taxonomy-based classification of all key findings from research
studies across the VA.gov ecosystem. It enables researchers and product managers to:

- **Mine cross-project insights** — Find related findings across different products
- **Identify coverage gaps** — See which user groups or themes lack research
- **Detect patterns** — Discover recurring themes that span multiple products
- **Plan future research** — Prioritize studies based on identified gaps
- **Feed ML pipelines** — Use the companion `taxonomy-data.json` for automated pattern recognition

## How to Use This Report

| Question | Where to Look |
|----------|---------------|
| "How much do we know about usability challenges for feature Y?" | [Product Coverage Analysis](#product-coverage-analysis) |
| "Have we studied this feature with assistive technology users?" | [Assistive Technology Coverage](#assistive-technology-coverage) |
| "Do people who use feature X also use feature Y?" | [Cross-Product Patterns](#cross-product-patterns) |
| "What user groups are we missing in our research?" | [Underserved Groups Gap Analysis](#underserved-groups-gap-analysis) |
| "What are the most common finding types?" | [Label Frequency Analysis](#label-frequency-analysis) |

---

## Summary

| Metric | Count |
|--------|-------|
| Total files scanned | 487 |
| Reports with classified findings | 331 |
| Total key findings analyzed | 3060 |
| Files skipped (no frontmatter) | 89 |
| Files skipped (no key_findings) | 1 |
| Files skipped (placeholder data) | 66 |

---

## Taxonomy Dimensions

Each key finding is classified across these dimensions:

| Dimension | Description | Labels |
|-----------|-------------|--------|
| **finding_types** | What kind of finding is this? | usability_issue, accessibility_barrier, positive_finding, content_issue, navigation_issue, trust_issue, unmet_need, mental_model_mismatch, process_issue, emotional_response |
| **product_areas** | Which product area does it relate to? | health_care, benefits_claims, education, housing, debt_financial, identity_auth, records_documents, memorial_burial, caregiver, facilities, mobile_app, forms, search, appointments, notifications, representative |
| **user_groups** | Which user populations are involved? | veterans, service_members, caregivers, dependents, assistive_tech_users, cognitive_disability, older_veterans, rural_veterans, mobile_users, low_digital_literacy, lgbtq_plus, minority_veterans, homeless_veterans |
| **research_themes** | What UX theme does it address? | navigation_wayfinding, form_completion, content_comprehension, error_handling, mobile_experience, sign_in_authentication, status_tracking, information_seeking, task_completion, notification_communication, personalization, cross_channel, data_privacy |
| **veteran_journey_stages** | Where in the veteran journey? | discovering_benefits, applying_for_benefits, managing_benefits, resolving_issues, transitioning |
| **severity_indicators** | How severe is the issue? | critical, high, medium, low |
| **emotional_states** | What emotional response was observed? | frustrated, confused, anxious, overwhelmed, satisfied, empowered, distrustful |

---

## Label Frequency Analysis

How often each taxonomy label appears across all classified findings.

### Finding Types

| Label | Count |
|-------|-------|
| unmet_need | 810 |
| positive_finding | 669 |
| navigation_issue | 558 |
| usability_issue | 431 |
| process_issue | 307 |
| content_issue | 286 |
| trust_issue | 156 |
| mental_model_mismatch | 153 |
| accessibility_barrier | 109 |
| emotional_response | 64 |

### Product Areas

| Label | Count |
|-------|-------|
| health_care | 798 |
| forms | 757 |
| benefits_claims | 492 |
| records_documents | 366 |
| appointments | 322 |
| facilities | 246 |
| identity_auth | 216 |
| notifications | 215 |
| search | 207 |
| representative | 190 |
| education | 139 |
| caregiver | 127 |
| debt_financial | 100 |
| memorial_burial | 19 |
| mobile_app | 11 |
| housing | 9 |

### Research Themes

| Label | Count |
|-------|-------|
| form_completion | 923 |
| notification_communication | 376 |
| navigation_wayfinding | 347 |
| content_comprehension | 324 |
| task_completion | 246 |
| status_tracking | 223 |
| cross_channel | 220 |
| personalization | 191 |
| information_seeking | 176 |
| data_privacy | 110 |
| error_handling | 108 |
| sign_in_authentication | 81 |
| mobile_experience | 59 |

### Severity Indicators

| Label | Count |
|-------|-------|
| high | 512 |
| medium | 255 |
| critical | 234 |
| low | 49 |

### Emotional States

| Label | Count |
|-------|-------|
| confused | 301 |
| satisfied | 101 |
| anxious | 61 |
| frustrated | 46 |
| overwhelmed | 46 |
| empowered | 20 |
| distrustful | 11 |

### Veteran Journey Stages

| Label | Count |
|-------|-------|
| applying_for_benefits | 363 |
| resolving_issues | 193 |
| managing_benefits | 142 |
| discovering_benefits | 92 |
| transitioning | 62 |

### User Groups

| Label | Count |
|-------|-------|
| veterans | 800 |
| mobile_users | 129 |
| dependents | 101 |
| assistive_tech_users | 71 |
| older_veterans | 47 |
| caregivers | 40 |
| cognitive_disability | 28 |
| service_members | 28 |
| low_digital_literacy | 10 |
| lgbtq_plus | 7 |
| homeless_veterans | 2 |
| minority_veterans | 1 |
| rural_veterans | 1 |

---

## Cross-Product Patterns

Research themes that appear across 3 or more products, indicating systemic patterns.

### Form Completion (166 products)

Products affected:
- Digital Dispute Form
- Mobile app One VA Debt Letter
- Accredited Representative Management
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- Authenticated Experience Design Patterns
- Benefit Letters
- Burial Benefits
- 10-10CG Caregiver Application
- _...and 156 more_

### Content Comprehension (117 products)

Products affected:
- Digital Dispute Form
- Find a Representative
- Accredited Representative Management
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- Authenticated Experience Design Patterns
- Benefit Letters
- Burial Benefits
- VA Health and Benefits App - Pre-Need Burial Eligibility
- _...and 107 more_

### Navigation Wayfinding (109 products)

Products affected:
- Digital Dispute Form
- Find a Representative
- Accredited Representative Management
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- Certificate of Eligibility (COE)
- Benefit Letters
- Burial Benefits
- 10-10CG Caregiver Application
- _...and 99 more_

### Notification Communication (108 products)

Products affected:
- Accredited Representative Management
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- Certificate of Eligibility (COE)
- Benefit Letters
- VA Health and Benefits App - Pre-Need Burial Eligibility
- 10-10CG Caregiver Application
- Claim Appeal Status
- Claim Status Tool
- _...and 98 more_

### Task Completion (98 products)

Products affected:
- Find a Representative
- Accredited Representative Management
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- Certificate of Eligibility (COE)
- VA Health and Benefits App - Pre-Need Burial Eligibility
- 10-10CG Caregiver Application
- Claim Status Tool
- Debt Portal
- _...and 88 more_

### Status Tracking (92 products)

Products affected:
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- Certificate of Eligibility (COE)
- 10-10CG Caregiver Application
- Claim Appeal Status
- Claim Status Tool
- Claim and Appeal Status
- VHA Debt Portal Payment History
- Combined VA Debt Portal
- _...and 82 more_

### Cross Channel (86 products)

Products affected:
- Digital Dispute Form
- Find a Representative
- Accredited Representative Management
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- Benefit Letters
- VA Health and Benefits App - Pre-Need Burial Eligibility
- 10-10CG Caregiver Application
- Caregiver 10-10CG
- _...and 76 more_

### Information Seeking (64 products)

Products affected:
- Find a Representative
- Accredited Representative Management
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- 10-10CG Caregiver Application
- Caregiver 10-10CG
- 10-10CG
- Claim Status Tool
- Mobile App Debt Portal: Overpayments and Copayments
- _...and 54 more_

### Personalization (63 products)

Products affected:
- Mobile app One VA Debt Letter
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- Benefit Letters
- Claim Status Tool
- Combined FSR / Enhanced Financial Status Report
- Decision Reviews - Notice of Disagreement
- Dependent Verification
- Dependents
- _...and 53 more_

### Error Handling (56 products)

Products affected:
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Authenticated Experience Design Patterns
- Benefit Letters
- Burial Benefits
- 10-10CG Caregiver Application
- Claim Appeal Status
- Claim Status Tool
- Decision Reviews - Supplemental Claims
- Dependents
- _...and 46 more_

### Data Privacy (53 products)

Products affected:
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- Accredited Representative Portal
- Caregiver 10-10CG
- Combined VA Debt Portal
- Dependent Verification
- Dependents
- Disability Compensation (Form 526EZ)
- Disability Benefits Crew
- Automated Benefits Delivery, Virtual Regional Office (ABD-VRO)
- _...and 43 more_

### Sign In Authentication (38 products)

Products affected:
- Accredited Representative Portal
- 10-10CG Caregiver Application
- Disability Compensation (Form 526EZ)
- Vocational Rehabilitation & Employment (VR&E)
- Facility Locator
- VAMC (VA Medical Center)
- 1095-B Tax Form
- Health Care Application (10-10EZ)
- Form 10-10EZ (Health Care Application)
- VA Online Scheduling (VAOS)
- _...and 28 more_

### Mobile Experience (38 products)

Products affected:
- Accredited Representative Portal
- Mobile App Debt Portal: Overpayments and Copayments
- Combined VA Debt Portal
- Decision Reviews
- Disability Compensation (Form 526EZ)
- Disability Benefits - 526EZ
- Facility Locator
- VAMC Facilities
- Find a VA form
- VA Online Scheduling (VAOS)
- _...and 28 more_

---

## Product Coverage Analysis

Research coverage by product, showing which themes and user groups have been studied.

| Product | Findings | Themes Studied | User Groups Studied |
|---------|----------|----------------|---------------------|
| Facility Locator | 156 | content_comprehension, information_seeking, form_completion, cross_channel, navigation_wayfinding, task_completion, data_privacy, notification_communication, error_handling, status_tracking, mobile_experience, sign_in_authentication, personalization | veterans, assistive_tech_users, mobile_users, rural_veterans, service_members, cognitive_disability |
| VA Online Scheduling (VAOS) | 116 | information_seeking, personalization, navigation_wayfinding, form_completion, task_completion, content_comprehension, cross_channel, notification_communication, status_tracking, mobile_experience, sign_in_authentication, data_privacy, error_handling | veterans, assistive_tech_users, mobile_users, older_veterans |
| Modernized Check-In Experience | 109 | status_tracking, content_comprehension, form_completion, cross_channel, task_completion, notification_communication, error_handling, navigation_wayfinding, data_privacy, personalization | mobile_users, caregivers, veterans, cognitive_disability |
| VA.gov Profile | 106 | personalization, data_privacy, status_tracking, notification_communication, form_completion, information_seeking, sign_in_authentication, error_handling, content_comprehension, mobile_experience, task_completion, navigation_wayfinding, cross_channel | veterans, mobile_users, dependents, assistive_tech_users, lgbtq_plus, service_members, older_veterans |
| My VA | 95 | information_seeking, task_completion, form_completion, notification_communication, personalization, navigation_wayfinding, status_tracking, content_comprehension, sign_in_authentication, cross_channel, mobile_experience, error_handling, data_privacy | veterans, assistive_tech_users, older_veterans, mobile_users, service_members, cognitive_disability |
| Dependents | 91 | content_comprehension, personalization, form_completion, notification_communication, navigation_wayfinding, status_tracking, cross_channel, data_privacy, task_completion, information_seeking, error_handling | dependents, veterans, older_veterans, mobile_users, cognitive_disability |
| Accredited Representative Portal (ARP) | 90 | form_completion, cross_channel, data_privacy, navigation_wayfinding, error_handling, task_completion, notification_communication, status_tracking, personalization, content_comprehension, information_seeking | veterans, assistive_tech_users, dependents, older_veterans, cognitive_disability |
| My HealtheVet on VA.gov | 68 | navigation_wayfinding, form_completion, content_comprehension, error_handling, information_seeking, task_completion, status_tracking, notification_communication, mobile_experience | dependents, veterans, assistive_tech_users, mobile_users |
| Claim Status Tool | 55 | status_tracking, content_comprehension, notification_communication, cross_channel, form_completion, navigation_wayfinding, task_completion, information_seeking, personalization, error_handling | veterans, mobile_users |
| Check-in Experience | 49 | notification_communication, status_tracking, error_handling, content_comprehension, cross_channel, form_completion, mobile_experience, task_completion, personalization, sign_in_authentication | veterans, mobile_users |
| My VA 3.0, Profile | 48 | task_completion, form_completion, content_comprehension, status_tracking, personalization, notification_communication, error_handling, navigation_wayfinding, cross_channel | older_veterans, dependents, veterans, mobile_users |
| My HealtheVet Account Creation | 44 | content_comprehension, form_completion, status_tracking, navigation_wayfinding, notification_communication, sign_in_authentication, task_completion, data_privacy | veterans |
| MHV on VA.gov - Medications | 41 | form_completion, notification_communication, status_tracking, navigation_wayfinding, information_seeking, personalization, cross_channel | assistive_tech_users, cognitive_disability, mobile_users |
| 10-10CG Caregiver Application | 40 | form_completion, error_handling, information_seeking, notification_communication, cross_channel, task_completion, status_tracking, navigation_wayfinding, content_comprehension, sign_in_authentication | caregivers, veterans |
| Vet Centers | 40 | navigation_wayfinding, personalization, notification_communication, form_completion, error_handling, status_tracking, information_seeking | veterans, service_members, older_veterans |
| Accredited Representative Portal | 39 | notification_communication, form_completion, task_completion, information_seeking, personalization, data_privacy, content_comprehension, cross_channel, sign_in_authentication, status_tracking, navigation_wayfinding, mobile_experience | veterans, older_veterans, mobile_users |
| Veteran Transition Support (VTS) | 39 | personalization, form_completion, cross_channel, data_privacy, navigation_wayfinding, information_seeking, task_completion, content_comprehension, notification_communication, mobile_experience, status_tracking | veterans, service_members, older_veterans, mobile_users |
| Facilities | 37 | task_completion, content_comprehension, form_completion, cross_channel, navigation_wayfinding, information_seeking, personalization, status_tracking | veterans, cognitive_disability |
| Medications | 37 | navigation_wayfinding, information_seeking, form_completion, task_completion, status_tracking, content_comprehension, notification_communication, error_handling | low_digital_literacy, assistive_tech_users, older_veterans |
| My HealtheVet on VA.gov - Medications | 35 | form_completion, information_seeking, navigation_wayfinding, content_comprehension, personalization, notification_communication, status_tracking | assistive_tech_users, dependents, cognitive_disability |
| Health Care Check-in | 31 | cross_channel, form_completion, navigation_wayfinding, status_tracking, notification_communication, error_handling, content_comprehension, task_completion, sign_in_authentication | low_digital_literacy, veterans |
| Check-in | 31 | cross_channel, status_tracking, notification_communication, form_completion, task_completion, mobile_experience, data_privacy, sign_in_authentication, content_comprehension | veterans, mobile_users |
| Medical Records | 30 | data_privacy, information_seeking, form_completion, navigation_wayfinding, status_tracking, content_comprehension, personalization, task_completion | older_veterans, dependents, assistive_tech_users |
| Health Care Application (10-10EZ) | 29 | form_completion, notification_communication, error_handling, status_tracking, sign_in_authentication, navigation_wayfinding, cross_channel, content_comprehension, personalization | _none_ |
| VA Online Scheduling | 28 | status_tracking, navigation_wayfinding, form_completion, task_completion, cross_channel, notification_communication, sign_in_authentication, content_comprehension, mobile_experience | veterans, mobile_users, older_veterans |
| Patient Check In | 28 | form_completion, data_privacy, mobile_experience, cross_channel, navigation_wayfinding, content_comprehension, task_completion | veterans, mobile_users |
| After-Visit Summary (AVS) for My HealtheVet on VA.gov | 28 | cross_channel, form_completion, data_privacy, task_completion, content_comprehension, navigation_wayfinding, error_handling, personalization, status_tracking, notification_communication | veterans, caregivers, older_veterans, mobile_users, low_digital_literacy |
| Accredited Representative Management | 26 | form_completion, cross_channel, navigation_wayfinding, information_seeking, content_comprehension, task_completion, notification_communication | veterans, minority_veterans, low_digital_literacy |
| 10-10EZ Health Care Application | 26 | navigation_wayfinding, form_completion, notification_communication, error_handling, status_tracking, personalization, information_seeking, task_completion | veterans |
| VA Health Appointment Check-in | 23 | information_seeking, task_completion, form_completion, status_tracking, notification_communication, personalization, cross_channel, navigation_wayfinding, error_handling, mobile_experience, sign_in_authentication | older_veterans, veterans, mobile_users, assistive_tech_users |
| Claim Appeal Status | 22 | content_comprehension, notification_communication, error_handling, form_completion, status_tracking, cross_channel | veterans, older_veterans |
| Disability Compensation (Form 526EZ) | 22 | form_completion, navigation_wayfinding, sign_in_authentication, cross_channel, task_completion, error_handling, status_tracking, notification_communication, data_privacy, mobile_experience | veterans, cognitive_disability, mobile_users |
| Accredited Representative Management (ARM) | 21 | error_handling, information_seeking, cross_channel, notification_communication, personalization, form_completion, navigation_wayfinding, data_privacy, content_comprehension, task_completion, status_tracking | veterans, mobile_users |
| My VA 3.0 | 21 | navigation_wayfinding, content_comprehension, form_completion, status_tracking, cross_channel, mobile_experience, task_completion, data_privacy, notification_communication, personalization, information_seeking | mobile_users, older_veterans |
| COVID-19 Chatbot | 20 | navigation_wayfinding, form_completion, notification_communication, personalization, content_comprehension, error_handling | veterans, older_veterans |
| COVID-19 Vaccine Trial Enrollment | 20 | information_seeking, form_completion, data_privacy, task_completion | veterans, lgbtq_plus, cognitive_disability |
| Secure Messaging | 20 | information_seeking, data_privacy, notification_communication, content_comprehension, cross_channel, error_handling | mobile_users, older_veterans, veterans |
| VA Form 21P-527EZ Veterans Pension Benefits | 20 | error_handling, form_completion, sign_in_authentication, notification_communication, content_comprehension, status_tracking | veterans, service_members, dependents, older_veterans |
| VA Mobile App | 20 | form_completion, mobile_experience, task_completion, notification_communication, navigation_wayfinding, content_comprehension, personalization, status_tracking | mobile_users |
| VA Health & Benefits Mobile App | 18 | navigation_wayfinding, form_completion, error_handling, content_comprehension, status_tracking, mobile_experience, task_completion | veterans, older_veterans, mobile_users, assistive_tech_users |
| _...152 more products_ | | | |

---

## Assistive Technology Coverage

Of **331** research reports analyzed:

- **60** reports (18%) included assistive technology users
- **104** reports included participants with cognitive disabilities

### Products with AT Testing

- Digital Dispute Form
- Accredited Representative Management (ARM)
- Benefit Letters
- VA Health and Benefits App - Pre-Need Burial Eligibility
- 10-10CG
- Claim Status Tool
- Debt Portal
- VHA Debt Portal Payment History
- Combined VA Debt Portal
- Notice of Disagreement
- Decision Reviews
- Disability Benefits - 526EZ
- Facility Locator
- Find a VA form
- Harassment Reporting Landing Page
- Sitewide Header and Footer
- Health Care Application (10-10EZ)
- 10-10EZ Health Care Application
- VA Online Scheduling (VAOS)
- VA Online Scheduling
- CHAMPVA Application Form 10-10d
- VA Forms 10-10d/10-7959c Application for CHAMPVA Benefits (with Other Health Insurance Certification)
- Health Care Check-in
- Check-in Experience
- My HealtheVet on VA.gov
- Medical Records
- MHV on VA.gov - Medications
- My HealtheVet on VA.gov - Medications
- Medications
- My HealtheVet (MHV) on VA.gov
- Secure Messaging (My HealtheVet on VA.gov)
- My HealtheVet on VA.gov - Secure Messaging
- Foreign Medical Program (FMP) Registration Form 10-7959f-1
- VA.gov Home Page
- My VA
- VA.gov Profile
- VA.gov Profile - Personal Health Care Contacts
- Sign in
- Terms of Use
- VA Form 21P-534EZ
- VA.gov Home Page / Public Websites
- Financial Status Report (FSR) - Streamlined Waiver Path
- Streamlined Waiver
- VA Health & Benefits Mobile App
- VA Mobile App - Accessibility
- VA Mobile App
- Discharge Upgrade Wizard
- Virtual Agent (Chatbot)
- Accessibility Feedback Process
- Application for Burial Benefits (VA Form 21P-530)
- Veteran Facing Forms

---

## Underserved Groups Gap Analysis

Shows which user groups have the least research coverage, helping prioritize inclusive research.

| User Group | Findings Mentioning Group | Products With Coverage | Products Without Coverage |
|------------|--------------------------|------------------------|---------------------------|
| Rural Veterans | 1 | 1 | 191 |
| Minority Veterans | 1 | 1 | 191 |
| Homeless Veterans | 2 | 2 | 190 |
| Lgbtq Plus | 7 | 2 | 190 |
| Low Digital Literacy | 10 | 10 | 182 |
| Service Members | 28 | 11 | 181 |
| Cognitive Disability | 28 | 21 | 171 |
| Caregivers | 40 | 16 | 176 |
| Older Veterans | 47 | 37 | 155 |
| Assistive Tech Users | 71 | 27 | 165 |
| Dependents | 101 | 25 | 167 |
| Mobile Users | 129 | 62 | 130 |
| Veterans | 800 | 116 | 76 |

### Largest Coverage Gaps

**Rural Veterans** — 1 findings across 1 products

Products without coverage for this group:
- Digital Dispute Form
- Mobile app One VA Debt Letter
- Find a Representative
- Accredited Representative Management
- Accredited Representative Management (ARM)
- _...and 5 more_

**Minority Veterans** — 1 findings across 1 products

Products without coverage for this group:
- Digital Dispute Form
- Mobile app One VA Debt Letter
- Find a Representative
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- _...and 5 more_

**Homeless Veterans** — 2 findings across 2 products

Products without coverage for this group:
- Digital Dispute Form
- Mobile app One VA Debt Letter
- Find a Representative
- Accredited Representative Management
- Accredited Representative Management (ARM)
- _...and 5 more_

**Lgbtq Plus** — 7 findings across 2 products

Products without coverage for this group:
- Digital Dispute Form
- Mobile app One VA Debt Letter
- Find a Representative
- Accredited Representative Management
- Accredited Representative Management (ARM)
- _...and 5 more_

**Low Digital Literacy** — 10 findings across 10 products

Products without coverage for this group:
- Digital Dispute Form
- Mobile app One VA Debt Letter
- Find a Representative
- Accredited Representative Management (ARM)
- Accredited Representative Portal (ARP)
- _...and 5 more_

---

## ML Pipeline Integration

The companion file `taxonomy-data.json` contains structured data for machine learning pipelines.

### Data Schema

Each finding in the JSON has this structure:

```json
{
  "finding_id": 1,
  "finding_text": "The full text of the key finding",
  "taxonomy_labels": {
    "finding_types": [{"label": "usability_issue", "confidence": 0.8}],
    "product_areas": [{"label": "health_care", "confidence": 0.6}],
    "user_groups": [{"label": "veterans", "confidence": 0.9}],
    "research_themes": [{"label": "form_completion", "confidence": 0.7}],
    "veteran_journey_stages": [{"label": "applying_for_benefits", "confidence": 0.5}],
    "severity_indicators": [{"label": "high", "confidence": 0.6}],
    "emotional_states": [{"label": "frustrated", "confidence": 0.4}]
  }
}
```

### Pattern Recognition Use Cases

| Use Case | JSON Query Approach |
|----------|---------------------|
| Find all usability issues for a product | Filter by `product_areas` + `finding_types: usability_issue` |
| Find accessibility findings | Filter by `finding_types: accessibility_barrier` or `user_groups: assistive_tech_users` |
| Cross-product theme analysis | Group by `research_themes`, count across `product_areas` |
| User group gap detection | For each product, check which `user_groups` have zero findings |
| Severity trending | Group by `severity_indicators` over time (using report `date`) |
| Emotional pattern detection | Filter by `emotional_states` to find pain points |

---

## Methodology

### How Findings Are Classified

1. **Scanning**: All markdown files in `/products` and `/teams` matching research findings
   naming patterns are identified (e.g., `*findings*`, `*research-report*`).
2. **Extraction**: YAML frontmatter is parsed and `key_findings` arrays are extracted.
3. **Classification**: Each finding is matched against keyword patterns for each taxonomy
   dimension. A confidence score (0-1) is calculated based on the proportion of matched keywords.
4. **Aggregation**: Labels are aggregated across all findings to generate frequency counts,
   cross-product patterns, and gap analyses.

### Confidence Scoring

- Each taxonomy label has a set of keyword patterns
- Confidence = (matched keywords) / (30% of total keywords for that label)
- Capped at 1.0; higher values indicate stronger matches
- Only labels with at least 1 keyword match are included

### Limitations

- Keyword-based classification cannot capture nuance or context the way human reviewers can
- Findings without YAML frontmatter `key_findings` are not included
- Placeholder/template data is filtered out but some edge cases may slip through
- Confidence scores are heuristic-based, not from a trained ML model

### Relationship to Existing Taxonomy Systems

This taxonomy extends the existing label systems in the repository:

| System | File | Relationship |
|--------|------|-------------|
| Research Repository Labels | `platform/research/research-labels.md` | Study-level metadata (audiences, products, methods) |
| Master Taxonomy | `platform/research/sharing-research/master-taxonomy.md` | Design system components and patterns |
| OCTO Metadata Labels | `platform/research/copilot-prompts/research-report/add-metadata-labels-to-findings-prompt.md` | Per-finding labels (applied manually via Copilot) |
| **This Taxonomy** | `reports/research-taxonomy/` | **Automated per-finding classification across all studies** |

### Regenerating This Report

```bash
node scripts/research-taxonomy-generator.js
```
