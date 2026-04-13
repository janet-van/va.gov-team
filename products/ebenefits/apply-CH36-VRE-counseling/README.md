# Apply for Personalized Career Planning & Guidance (CH36)
- Launched May 10, 2021
- GitHub Label: [vsa-ebenefits](https://github.com/department-of-veterans-affairs/va.gov-team/#workspaces/vft-59c95ae5fda7577a9b3184f8/board?labels=vsa-ebenefits&repos=133843125&showPipelineDescriptions=false)
- Slack channel: [#vsa-ebenefits](https://dsva.slack.com/channels/vsa-ebenefits)
- Staging EBN link: https://sqa.eauth.va.gov/ebenefits/vre
- Form: https://www.vba.va.gov/pubs/forms/VBA-28-8832-ARE.pdf
- (staging) VA.gov link (unauth landing page): https://staging.va.gov/careers-employment/education-and-career-counseling/
- (staging) VA.gov link (tool page): https://staging.va.gov/careers-employment/education-and-career-counseling/apply-career-guidance-form-28-8832/introduction
- (prod) VA.gov link (unauth landing page): https://www.va.gov/careers-employment/education-and-career-counseling/
- (prod) VA.gov link (tool page): https://www.va.gov/careers-employment/education-and-career-counseling/apply-career-guidance-form-28-8832/introduction
- Current prototype: https://preview.uxpin.com/2dbde8d15bf667f5c584fe4a8a6d011cf9f0a14d#/pages/130194084

### Table of Contents

# Executive Summary
- [Abstract](#abstract)
- [User Problem Statement](#user-problem-statement)
- [Solution Goals](#solution-goals)
- [Assumptions](#assumptions)
- [Requirements and Constraints](#requirements-and-constraints)
- [Discovery Takeaways](#discovery-takeaways)
- [Solution Approach](#solution-approach)
- [Value Propositions](#value-propositions)
- [KPIs-OKRs](#kpis-okrs)

# Implementation Information
- [Status](#status)
- [Solution Narrative](#solution-narrative)
- [Team](#team)
- [Resources and Documentation](#resources-and-documentation)
- [Screenshots](#screenshots)

---

# Executive Summary

## Abstract

Veterans and related claimants can apply for "Chapter 36" benefits, or Education and Career Counseling benefits, through the OTED (Office of Transition and Economic Development). This is a very simple application for which we should attempt to prefill all possible fields.

## User Problem Statement

eBenefits, in its current legacy state, is no longer the best version of what can be provided to Veterans, their dependents and caregivers, so that they can quickly and easily apply and obtain the benefits they deserve.

## Solution Goals

### User Goals

- **Veterans:** Apply for Education/ Career Counseling at the VA.

### Business Goals

- Deprecate eBenefits, meet OTED office goals of better online submissions

## Assumptions

- Product will submit form to Central Mail, no other BE integration
- LOA3 users may be able to apply with one click

## Requirements and Constraints

- Application should be available for all users: UNAUTH, LOA1, and LOA3
- Excerpt from systems requirement doc: In response to the receipt of a 28-1900 - The system will display and check the following: Veteran or IDES (yes/no), service connected disability rating percentages and conditions (if 10% or more continue eligibility check); discharge other than dishonorable (continue eligibility check); served on or after September 16th 1940 (if yes to all four, Veteran is eligible to participate in an evaluation for chapter 31).

## Solution Approach

- Translate form to VA.gov, prefill logged in user info, submit to Central Mail. Current EBN functionality involves clicking a single button.

## Value Propositions

### User Value

I can apply for CH36 benefits quickly and without mailing in a form or visiting a RO.

### Business Value

1. Sunset EBN
2. Increase CH36 applications

### KPIs-OKRs
#### KPIs
`Note: GA dashboard - https://analytics.google.com/analytics/web/?authuser=0#/dashboard/qKVD06_mTkyUhH52RYq0Vg/a50123418w177519031p176188361/`
- Conversion rate
  - Wizard-specific
    - % of people who land on wizard and start the application (Acquisition)
    - % of skips in the wizard
    - number of referrals to another form
  - % of people who abandon form (Abandonment Rate) (Activitation)
    - where is the abandonment?
  - % of people who complete the form
  - number of people who complete the form
- Customer satisfaction
  - form has an increasing score value (Medallia?)
- Product Health
  - number of successful submissions
  - number of failed submissisons

##### Baseline KPIs
tbd

#### OKRs
1. Improve abandonment/conversion rate

2. Improve time to complete

--
## Go-to-Market
_How will Veterans find this product? How will they know it exists?_

- Comms isn't controlled by this team but discoverability may be a lever to pull
- Perhaps at account log-in/creation

---

## Results and Recommendations
### Results
- TBD after launch

### Recommendations
- TBD after launch
---

# Implementation Info

## Status

**March 24, 2020**
- Kickoff with platform

## Solution Narrative
- TBD

## Team
- VA Executive Sponsor `*`:
- VA Policy Expert(s):
- VA Digital Strategist(s) `*`:
- DEPO Product Lead: **Steve Kovacs** - steven.kovacs@va.gov
- Product Manager: **Jason Wolf** - jwolf@governmentcio.com
- Designer: **James Adams** - jadams@governmentcio.com
- Frontend: **Jesse Cohn** - jesse.cohn@adhocteam.us
- Frontend: **Micah Chiang** - micah@adhocteam.us
- Backend: **Kathleen Crawford** - kcrawford@governmentcio.com
- Backend: **Derek Dyer** - ddyer@governmentcio.com

`*` = approval required for launch

## Resources and Documentation

- [Discovery](https://github.com/department-of-veterans-affairs/va.gov-team/tree/master/products/ebenefits/apply-CH36-VRE-counseling/discovery)
- [Research and Design](https://github.com/department-of-veterans-affairs/va.gov-team/tree/master/products/ebenefits/apply-CH36-VRE-counseling/research-design)

## NOTES

Form 8832: https://www.vba.va.gov/pubs/forms/VBA-28-8832-ARE.pdf

## eBenefts Screenshot

![Apply for CH36 on EBN](screenshot.png)


<!-- WARNING: This is a template meant to be copied and then modified. Please DO NOT MODIFY directly or MOVE this file. -->
# Product Outline Template
*Iterating on a product? Have a new feature? Check out the [Initiative Brief Template.](https://github.com/department-of-veterans-affairs/va.gov-team/blob/master/platform/product-management/initiative-brief-template.md)*

---

## Overview
*After you've explored the problem and through testing / hypothesis have identified the ideal solution, write up one sentence describing the solution you'll be creating.*

## Problem Statement
*In a couple of sentences, describe the Who, What, Why, and Where of the challenge / pain point you seek to address. [Here's a sample problem statement definition activity you can try on your team to help generate this](https://www.atlassian.com/team-playbook/plays/problem-framing)*

*Follow your problem description up with a "How might we... _______" statement re-framing that challenge as an opportunity. Don't hint too much at what the solution might be, you should have enough of a focal point here to guide your ideas, but plenty of freedom to think laterally and innovatively as you experiment and prototype later.*
 
## Desired User Outcomes

- *Why would a user want to use this?*
- *With this problem solved, what should users be able to do/achieve that they couldn't before?*

## Undesired User Outcomes


## Desired Business Outcomes

- *Why would your business want this to exist?*
- *With this problem solved, what should your business be able to do/achieve that they couldn't before?*

## Undesired Business Outcomes


---
## Measuring Success


### Key Performance Indicators (KPIs)
* *What data (qual or quant) will you look at to understand if your initial set of functionality is meeting your desired user and business outcomes, and not bringing about the undesired outcomes?*
* _What are the most important metrics that track with this product/initiative's success?_
* _Include links to Domo or Google Analytics Dashboards/Reports_
* _**Limit 5-6 KPIs per product**__

| Category | Ease of use | Service completion | Trust/Satisfaction | Health |
|----------|-------------|--------------------|--------------------|--------|
| KPI      |             |                    |                    |        |
| KPI      |             |                    |                    |        |

#### Baseline KPI Values
* _Baseline values for those most critical metrics. These may come from other systems other than VA.gov e.g. eBenefits._

### Objectives and Key results (OKRs)
_What are the measurable targets you're aiming for that delivers value for Veterans?_

- Objective:
  - Key result: 
  - Key result: 


---

## Assumptions
- *Include indication of which assumption you think is most risky. Your Solution Approach (next section) should describe how you'll validate that assumption w/your initial set of functionality*

## Solution Approach

- *What are you going to build now, and why have you decided to start there?*
- *Why this solution / approach over other solutions / approaches?*
- *What have you explicitly decided to not include in this initial set of functionality, and why?*
- *How will the solution / approach evolve after this initial build (knowing that this will likely change as you learn from users along the way)?*
- *Does your solution include the VA Health and Benefits mobile application? Explain why or why not.*

### Supporting research

- *Is this work supported by user research?* 
  - *If this work **is supported by user research**, please cite the user research by providing links to our [VA.gov research repo](https://github.com/department-of-veterans-affairs/va.gov-research-repository)*
  - *If this work is **not supported by existing user research**, will this work include user research?*
    - *If this work **will include user research**, please briefly state what you hope to learn from that research.*
    - *If this work **does not cite nor include user research**, please state why and be prepared to defend your decision.*

### Initiatives
*Include initiatives (iterations, new features, etc.) to improve this product. See the [Initiative Brief Template](https://github.com/department-of-veterans-affairs/va.gov-team/blob/master/teams/vsa/product/initiative-brief-template.md)*

- Initiative | [Link to Initiative Brief](#)

--- 

## Launch Strategy
- *How are Veterans and others using this product going to know it exists?*
- *What marketing, outreach, or communications are necessary for this product to be successful?*
- [Link to Release Plan](https://github.com/department-of-veterans-affairs/va.gov-team/blob/master/platform/product-management/release-plan-template.md)

## Launch Dates
- *Target Launch Date*
  - tbd
- *Actual Launch Date* 
  - tbd
- *What date will you evaluate impact after launch (and when do you expect to have your Impact Review)?*
  - tbd

---

## Solution Narrative

### Current Status

### Key Decisions

---
   
## Screenshots

### Before

### After

---

#### Communications

<details>

- Team Name: 
- GitHub Label: 
- Slack channel: 
- Product POCs:
- Stakeholders: 

</details>

#### Team Members

<details>
 
 - DEPO Lead: 
 - PM: 
 - Engineering:
 - Research/Design: 
 
</details>


#### Stakeholders

<details>
 
_What offices/departments are critical to make this initiative successful?_
 
</details>