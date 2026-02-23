---
title: Profile 2.0 UAT Findings Research Findings
product: VA.gov Profile
team: Authenticated Experience Team
office: "Office of the CTO - Digital Experience (OCTO-DE)"
date: "2020-09-01"
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
recommendations: []
kpi_alignment: []
outcomes:
  user: Not specified
  business: Not specified
opportunity_areas: []
further_research_needed: []
underserved_groups_missing: []
secondary_research: []
synthesis_tools_used:
- Spreadsheet analysis
tags:
- "AUD: Veterans"
- "DSC: Alert Boxes"
- "DSC: Form"
- "HDW: Smartphone"
- "Initiative: Toxic Exposure"
- "PRDT: Ask VA (AVA)"
- "PRDT: Direct-deposit"
- "PRDT: Login"
- "PRDT: Profile"
- "PRDT: Search"
---

## Profile 2.0 UAT Findings

[Profile 2.0 UAT Findings Spreadsheet](https://github.com/department-of-veterans-affairs/va.gov-team/blob/master/products/identity-personalization/profile/Combine%20Profile%20and%20Account/Research/UAT/Profile%202.0%20UAT%20(1).xlsx)

## Issues

1.    [Updating phone number had a weird delay and took 3 attempts](https://github.com/department-of-veterans-affairs/va.gov-team/issues/9765)
2.    [No military branch showing up in military information section](https://github.com/department-of-veterans-affairs/va.gov-team/issues/13222)
3.    [Need to create an Error alert when we can’t verify a person is a veteran/info is not available](https://github.com/department-of-veterans-affairs/va.gov-team/issues/13224)
4.    [“Invalid date” on Military Information service dates](https://github.com/department-of-veterans-affairs/va.gov-team/issues/13130)
5.    Connected apps API issue: the frontend is expecting an empty array if the user has no apps, but for some reason there is a “404” display to users who have never connected an app.There seems to be an ID issue . User is shown “there was an issue connecting to connected apps”. This shouldn’t be shown if they have never been connected to apps (Mark Greenberg to create ticket)
6.    Users unable to update phone number to fix Direct Deposit issues if they have an international phone number ((VA Profile doesn't accept international phone numbers, and that's not something they are addressing for at least 3 months))
