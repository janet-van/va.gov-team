# VA.gov Research Repository Summary: Scheduling and MSA

**Date:** February 10, 2026  
**Purpose:** Comprehensive overview of existing research on scheduling and Medical Support Assistant (MSA) topics

---

## Executive Summary

The VA.gov team repository contains extensive research documentation on two key healthcare areas:
1. **Appointment Scheduling** - Primarily focused on VA Online Scheduling (VAOS)
2. **MSA Interactions** - Medical Support Assistant workflows, particularly related to eCheck-in

This document provides a roadmap to the research resources available in the repository.

---

## 1. Scheduling Research

### Primary Location
**`/products/health-care/appointments/va-online-scheduling/research/`**

This directory contains research spanning from 2017 to 2025, documenting the evolution of VA's online appointment scheduling system.

### Key Research Studies

#### Recent Studies (2023-2025)
- **2025-10 DOLE Act Appointment Scheduling Preferences** - Latest research on scheduling preferences
- **2025-09 PACT SUD UAT** - User acceptance testing for substance use disorder scheduling
- **2025-05 OH Scheduling VAHB** - Oracle Health scheduling for VA Health Benefits
- **2024-08 Appointment Details Card Sort** - Information architecture for appointment details
- **2024-05 OH Scheduling** - Oracle Health system integration research

#### Major Research Themes (2019-2023)
- **2023-10 Appointment Details Redesign** - Improving appointment information display
- **2023-09 Scheduling Staff Research** - Staff workflows and pain points
- **2023-02 Appointment List Usability (Screen Reader)** - Accessibility testing
- **2022-12 Provider-Based Multi-Modality Scheduling Discovery** - Multiple appointment types
- **2022-01 MHV and VAOS Appointments List Discovery** - Integration with My HealtheVet
- **2021-11 Request Clarification Research** - Appointment request process improvements
- **2020-12 Vaccine Scheduling Interviews** - COVID-19 vaccine scheduling
- **2020-05 Express Care Research** - Same-day care scheduling
- **2019-09 Usability Testing New VAOS UX** - Major redesign usability testing

### Key Research Findings

#### Clinic Selection Challenges
- Veterans face **40+ clinic options** with confusing backend system names
- Solution: Limiting self-schedule to **previously-used clinics** per type of care
- Standardization issues across VA facilities remain a persistent challenge

#### Self-Scheduling Preferences
- Veterans value the ability to schedule appointments online
- Key requirements: clear calendar UI, simple appointment details, familiar clinic names
- Research validated approach through **8 Veterans** in remote moderated testing

#### Staff Workflows
- Scheduling clerks face complexity in clinic selection and appointment routing
- Direct scheduling vs. request workflows require different support tools
- Staff interviews revealed gaps in system training and documentation

### Research Methodology
Studies typically include:
- Research plans with clear objectives and hypotheses
- Conversation guides for moderated sessions
- Findings reports with actionable recommendations
- Slide decks for stakeholder presentations

---

## 2. MSA (Medical Support Assistant) Research

### Primary Location
**`/products/health-care/checkin/research/`**

### What is MSA?
**Medical Support Assistant** - VA healthcare staff who assist with patient check-in, appointment verification, and administrative tasks at clinic front desks.

### Key Research Studies

#### 2024 MSA eCheck-in Research (Primary Studies)

**Study 1: Check in with an MSA after eCheck-in Unmoderated Survey**
- **Location:** `/products/health-care/checkin/research/2024-10 Check in with an MSA after eCheck-in Unmoderated Survey/`
- **Participants:** 44 Veterans across age cohorts (18-75+)
- **Method:** A/B testing of two UI versions
- **Focus:** Post-eCheck-in staff interaction requirements

**Key Findings:**
- **75%** understood the content about checking in with staff
- **21%** expressed frustration about perceived redundancy
- **85%** would still use eCheck-in despite staff check-in requirement
- **50%** mentioned Wi-Fi connectivity issues inside facilities

**Study 2: Check in with an MSA after eCheck-in Experiment (In-Person UAT)**
- **Location:** `/products/health-care/checkin/research/2024-10 Check in with an MSA after eCheck-in experiment in-person UAT with Veterans and clinic staff/`
- **Method:** On-site testing at VA facilities
- **Focus:** Whether removing automatic "CHECKED-IN" status improves clinic operations

**Problem Statement:**
Staff confusion exists between "checked in remotely" vs. "physically present in waiting room"

#### Related MSA Research

**Travel Reimbursement Studies**
- **2024-02 In-Person Travel Reimbursement Research (Oracle Health)**
- **2023-11 Past Appointments Travel Reimbursement Generative Study**
- **2022-12 Travel Reimbursement Staff Interviews at Wilkes-Barre**
- **2022-12 Travel Reimbursement Veteran Intercept at Wilkes-Barre**

**Check-in Workflow Studies**
- **2023-04 Unified Check-In Experience Usability Study**
- **2022-10 ID Verification - SSN4 vs. Date of Birth Comparison**
- **2023-08 Remove QR Code from Poster Pilot**

### eCheck-in System Overview

**What Veterans Value:**
- Filing travel reimbursement claims digitally
- Avoiding wait lines at check-in desks
- Not repeating demographic information
- Ability to check in 45 minutes before appointment

**Pain Points:**
- Wi-Fi connectivity inside VA facilities (50% of participants)
- Staff unfamiliarity with eCheck-in process
- Confusion about whether physical check-in is still required

**Staff Concerns:**
- Veterans may not be physically present after completing eCheck-in
- Status tracking issues between remote and in-person check-in
- Need for better communication about Veteran location

### MSA Workstation Documentation
Visual documentation exists showing MSA workstations at various VA facilities:
- Pittsburgh University Drive Surgery location
- Staff-facing interface screenshots and workflows

---

## 3. Cross-Cutting Research

### Discovery Sprint Framework
**Location:** `/platform/research/discovery-sprints/sample-discovery-sprint-schedule.md`

Provides standardized research methodology including:
- 1-week and 2-week sprint templates
- User research booking timelines (3 weeks advance notice required)
- Structured daily activities for discovery phases

### Research Best Practices
Both scheduling and MSA research follow consistent patterns:
1. **Research Plans** - Define objectives, methods, participants
2. **Conversation Guides** - Structured interview/testing scripts
3. **Findings Reports** - Detailed analysis with quotes and data
4. **Slide Decks** - Executive summaries for stakeholders
5. **Follow-up Studies** - Iterative validation and refinement

---

## 4. Timeline Overview

### Scheduling Research Evolution
```
2017 → Initial discoverability and access studies
2019 → Major VAOS redesign and usability testing
2020 → Community care, direct scheduling, Express Care
2021 → Facilities personalization, appointment lists
2022 → MHV integration, multi-modality scheduling
2023 → Accessibility, staff workflows, appointment details
2024-2025 → Oracle Health integration, PACT SUD, DOLE Act
```

### MSA/Check-in Research Evolution
```
2022 → Travel reimbursement discovery, ID verification
2023 → Unified check-in experience, QR code optimization
2024 → MSA interaction after eCheck-in (major focus)
2025 → LoROTA standalone travel reimbursement
```

---

## 5. Research File Structure

### Typical Research Study Contains:
```
research-study-name/
├── README.md                    # Study overview
├── research-plan.md             # Detailed methodology
├── conversation-guide.md        # Interview/testing script
├── research-findings.md         # Analysis and recommendations
├── slide-deck.md or .pdf        # Stakeholder presentation
└── supporting-materials/        # Screenshots, prototypes, data
```

---

## 6. Key Stakeholder Teams

### Scheduling
- VA Online Scheduling (VAOS) team
- Oracle Health integration team
- Community Care scheduling team
- MHV (My HealtheVet) integration team

### MSA/Check-in
- Patient Check-In team
- eCheck-in product team
- Travel reimbursement team
- Clinical staff operations

---

## 7. Recommendations for Further Exploration

### For Scheduling Research
1. Review the **2023-09 Scheduling Staff Research** for staff pain points
2. Examine **2024-05 OH Scheduling** for Oracle Health integration patterns
3. Study **2020-05 Express Care Research** for same-day care insights

### For MSA Research
1. Start with **2024-10 Check in with an MSA Unmoderated Survey** findings
2. Review **2023-04 Unified Check-In Experience** for holistic workflow understanding
3. Examine travel reimbursement studies for comprehensive MSA role understanding

### For Methodology
1. Review Discovery Sprint framework for research planning
2. Study conversation guides across multiple studies for interview techniques
3. Examine findings reports for analysis and recommendation patterns

---

## 8. Quick Reference Links

### Scheduling
- Main directory: `/products/health-care/appointments/va-online-scheduling/research/`
- Themes document: `/products/health-care/appointments/va-online-scheduling/research/themes.md`
- Planning resources: `/products/health-care/appointments/va-online-scheduling/research/planning/`

### MSA/Check-in
- Main directory: `/products/health-care/checkin/research/`
- Staff-facing research: `/products/health-care/checkin/research/staff-facing/`
- Veteran-facing research: `/products/health-care/checkin/research/veteran-facing/`

### Platform Resources
- Research methodology: `/platform/research/`
- Discovery sprints: `/platform/research/discovery-sprints/`

---

## Contact & Collaboration

For questions about this research or to access additional resources:
- Review the respective product team documentation
- Check the `/teams/` directory for team-specific contact information
- Refer to the Platform Research & Design handbook for research standards

---

**Document maintained by:** VA.gov Research Repository Review  
**Last updated:** February 10, 2026
