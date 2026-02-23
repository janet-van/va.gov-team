---
title: Research Findings
product: "Check-in"
team: "Check-in Experience Team"
office: "Office of the CTO - Digital Experience (OCTO-DE)"
date: Not specified
researchers:
- Not specified
research_goals:
- "Not specified - goals not explicitly stated in report"
methodology:
- Not specified
devices_used:
  desktop: 0
  tablet: 0
  smartphone: 0
  assistive_technology: 0
participants_total: 0
demographics:
  veterans: 0
  service_members: 0
  caregivers: 0
  dependents: 0
  VA_staff: 0
  age:
    "25-34": 0
    "35-44": 0
    "45-54": 0
    "55-64": 0
    65+: 0
    unknown: 0
  education:
    high_school: 0
    some_college: 0
    associates: 0
    bachelors: 0
    masters: 0
    doctorate: 0
    unknown: 0
  location:
    urban: 0
    rural: 0
    unknown: 0
  race:
    white: 0
    black: 0
    hispanic: 0
    biracial: 0
    asian: 0
    native: 0
  disability:
    cognitive: 0
    AT_beginner: 0
    AT_advanced: 0
    screen_reader_desktop: 0
    screen_reader_mobile: 0
    magnification_zoom: 0
    speech_input: 0
    hearing_aids: 0
    sighted_keyboard: 0
    captions: 0
key_findings:
- "Not specified - key findings not explicitly listed in report"
recommendations:
- Ensure voice overs can tell users that the page is loading when transitioning between pages.
- "Multiple appointment use case: when a user is late for their appointment:"
kpi_alignment: []
outcomes:
  user: Not specified
  business: Not specified
opportunity_areas: []
further_research_needed: []
underserved_groups_missing: []
secondary_research: []
synthesis_tools_used: []
tags:
- "AUD: Veterans"
- Accessibility
- "BNFT: Healthcare"
- "DSC: Form"
- "Initiative: Toxic Exposure"
- "MHV: Appointments"
- "PRDT: Check-in"
- "PRDT: Search"
---

Recommendations
===

**Pre-check-in**

Ensure voice overs can tell users that the page is loading when transitioning between pages. 
https://github.com/department-of-veterans-affairs/va.gov-team/issues/35471
Ensure the same when a user submits information too. 
On specific pages where relevant, edit the line on the appointments and intro page so that “Your appointment is on” is one line, and then “date” is the second line. This helps reduce swiping. 
https://github.com/department-of-veterans-affairs/va.gov-team/issues/35472


**Day of check-in**

Multiple appointment use case: when a user is late for their appointment:
Ensure appropriate screen reader behavior, where it starts at H1 
Add messaging on appointment details page that lets them know they can still scroll down to check-in to remaining / upcoming appointments. Perhaps this should be an aria tag, so it’s only read for screen-readers. Question: Why did her voiceover immediately read that message and not the H1 and the paragraph immediately below the H1? 
https://github.com/department-of-veterans-affairs/va.gov-team/issues/35473


For multiple appointments and confirmation page: Edit the line on the appointments and intro page so that “Your appointment is on” is one line, and then “date” is the second line. This helps reduce swiping. 


General observations
===
These questions may be helpful when we do the holistic, end-to-end pre-check-in and check-in user testing: 
Is it clear to veterans what the purpose of pre-check-in is? 
How do they distinguish between pre-check-in and check-in? 


