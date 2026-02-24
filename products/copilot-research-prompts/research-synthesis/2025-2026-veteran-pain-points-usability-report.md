# Veteran Digital Experience Pain Points Report

**Period Reviewed:** January 2025 – February 2026
**Sources:** Usability studies and research findings in `/products` and `/teams` folders
**Total Studies Analyzed:** 35 research findings reports (usability tests, tree tests, generative interviews, A/B tests, and desk research)
**Date Generated:** February 2026

---

## Executive Summary

Analysis of 35 research studies conducted across VA.gov and the Health and Benefits mobile app between January 2025 and February 2026 reveals **10 recurring categories** of tasks where Veterans experience confusion, frustration, or failure. Form completion, health care task management, and information findability are the most frequently observed pain points, each appearing in 7 or more separate studies. The findings below synthesize pain points, affected products, and representative Veteran quotes.

### Pain Points at a Glance

```
Studies Referencing Each Pain Point Category
═══════════════════════════════════════════════════════════════════════
Form Completion & Navigation     ████████████████████  10 studies
Health Care Task Management      ████████████████      8 studies
Navigation & Information         ███████████████       7+ studies
  Architecture (IA)
Terminology & Jargon Confusion   ███████████████       7+ studies
Alert & Notification Blindness   ██████████████        7 studies
Accessibility & Assistive Tech   ████████████          6 studies
Dependent Management             ██████████            5 studies
Save in Progress & Session Mgmt  ████████              4 studies
Benefits Discovery & Eligibility ████████              4 studies
Financial Info & Payments        ██████                3+ studies
═══════════════════════════════════════════════════════════════════════
```

---

## Table of Contents

1. [Form Completion & Complex Form Navigation](#1-form-completion--complex-form-navigation)
2. [Health Care Task Management](#2-health-care-task-management)
3. [Navigation & Information Architecture](#3-navigation--information-architecture)
4. [Terminology & Jargon Confusion](#4-terminology--jargon-confusion)
5. [Alert & Notification Blindness](#5-alert--notification-blindness)
6. [Accessibility & Assistive Technology Barriers](#6-accessibility--assistive-technology-barriers)
7. [Dependent Management](#7-dependent-management)
8. [Save in Progress & Session Management](#8-save-in-progress--session-management)
9. [Benefits Discovery & Eligibility Understanding](#9-benefits-discovery--eligibility-understanding)
10. [Financial Information & Payments](#10-financial-information--payments)
11. [Summary Data Tables](#summary-data-tables)
12. [Sources](#sources)

---

## 1. Form Completion & Complex Form Navigation

### Summary

Across VA.gov, Veterans consistently struggle to complete digital forms due to lengthy multi-step processes, confusing field labels, ambiguous questions, unfamiliar list-and-loop patterns, and emotionally insensitive language. Veterans often don't know exact dates, are overwhelmed by the amount of information requested, and encounter confusing edit flows. Mobile users face additional challenges with keyboards obscuring autosuggestion menus and small touch targets.

### Where Veterans Get Confused or Stuck

| Issue | Details | Studies Observing |
|-------|---------|-------------------|
| **List-and-loop patterns not understood** | Veterans don't realize they need to enter each item (e.g., income source) separately before moving on. First entry causes high anxiety; pattern only becomes clear after first completion. | 0969 Pension, Supply Reordering |
| **Date fields cause stress** | Veterans rarely know exact dates conditions started or worsened. No one notices "not required" labels. Date format expectations (MM/DD/YYYY) vary. | 526EZ Disability, 534EZ Survivors, Save in Progress |
| **Edit flows are disorienting** | After clicking "Edit," Veterans expect to land on the specific field, not restart the entire section flow. | 526EZ Disability |
| **Secondary conditions hard to add** | 3 of 7 participants asked for an increase in the underlying condition instead of adding a new secondary condition. Free-text entries like "Sciatica to the shoulder" reduce classification accuracy. | 526EZ Disability |
| **Emotionally insensitive language** | Equating death with "end of marriage" was seen as cold and disrespectful. Questions about dependent death on standalone pages caused anxiety. | 534EZ Survivors, Dependent Verification |
| **Audience ambiguity in forms** | "You" shifts meaning mid-form (claimant, caregiver, child), especially in financial sections. | 534EZ Survivors |
| **"Evidence" language triggers anxiety** | Mention of supporting "evidence" on introduction pages makes Veterans believe more documentation is needed than actually required. | 0969 Pension |
| **Expand all / Review page missed** | 6 of 7 participants missed the "Expand all" button on the review page, submitting without reviewing. | 0969 Pension |
| **Overwhelming information requirements** | Multiple participants noted forms require too much documentation. *"If veterans are going to be required to submit that much paperwork for health care many may not even bother."* | 10-10EZ Health Care, 0969 Pension |
| **Task list vs. traditional form split** | 44% prefer task list, 39.5% prefer traditional, 16.3% no preference—neither is clearly superior. Clickable element confusion persists in the task list pattern. | 10-10EZ Health Care |
| **Document upload split across pages** | Splitting upload across pages forces disorienting back-and-forth navigation. | 534EZ Survivors |
| **Mobile keyboard hides suggestions** | On smartphones, the on-screen keyboard nearly completely covers autosuggestion dropdowns. | 526EZ Disability |

### Relevant Products

- VA Form 526EZ (Disability Compensation)
- VA Form 21P-0969 (Income and Assets Statement for Pension)
- VA Form 21P-534EZ (DIC, Survivors Pension, Accrued Benefits)
- VA Form 10-10EZ (Health Care Application)
- VA Form 10-7959f-2 (FMP Claim Cover Sheet)
- VA Form 21-0538 (Dependent Verification)
- VA Form 21-686c/674 (Dependents)
- Medical Supply Reordering Tool

---

## 2. Health Care Task Management

### Summary

Veterans encounter significant friction when managing health care tasks on VA.gov and My HealtheVet, including refilling/renewing medications, messaging care teams, finding medical records, and preparing for appointments. Key issues include confusion between refill and renewal, inability to find the download function for records, unfamiliar medical terminology, and appointment reminders lacking essential practical details.

### Where Veterans Get Confused or Stuck

| Issue | Details | Studies Observing |
|-------|---------|-------------------|
| **Refill vs. renewal confusion** | 4 of 12 used the terms interchangeably. 5 of 12 didn't discover the renewal request link, trying the refill button or navigating to Secure Messaging manually instead. | Medications Renewal Flow |
| **"Active" status implies refillability** | 7 of 11 assumed "Active" meant refills were available, but no refill count was shown. | Medications Status Labels |
| **Filter not discovered** | In IPE testing, 3 of 5 screen reader users missed the filter entirely. In A/B/C testing, Veterans defaulted to scrolling rather than filtering. Open-filter design achieved 87% direct success vs. 70–73% for closed-filter with IPE hint. | Medications IPE, Medications A/B/C |
| **Long medication search times** | Average 3.5–5 minutes to find specific medications. No participant used filter successfully in the screen reader study. | Medications IPE |
| **Inactive medications add clutter** | Old, duplicate, or inactive medications overwhelm the list. *"I don't want to see all those…it's convoluted."* | Medications Renewal Flow |
| **Medical Records settings deeply confusing** | 7 of 11 rated the sharing settings task "difficult." 10 of 11 misunderstood what would be shared after opting in. All expected granular control over which records to share. | Medical Records AT Study |
| **Download function nearly impossible to find** | Only 3 of 11 independently found "Download your Medical Records." 8 of 11 expected it within individual record domains, not a separate section. | Medical Records AT Study |
| **Unfamiliar medical terminology** | None recognized "microbiology" or "surgical pathology." Only 5 of 11 found E. coli results by navigating to the correct category. | Medical Records AT Study |
| **Appointment reminders lack critical details** | Missing provider name, clinic phone number, building/floor info, parking info, and procedural requirements (fasting, etc.). *"Why do I need to call in to get such a trivial piece of information?"* | VEText Email Reminders, My VA 3.0 |
| **Secure Messaging combo box dual function missed** | Only 2 of 9 realized the combo box supported both typing and dropdown. 7 who used dropdown didn't notice typing; 2 who typed didn't see the dropdown arrow. | Secure Messaging Curated List |
| **Wrong link chosen when care team missing** | 5 of 9 selected "What to do if you can't find your care team" instead of "Update your contact list." | Secure Messaging Curated List |
| **Boilerplate text in reminders skipped** | Instructions after appointment info treated as filler. Veterans want brevity. *"Less is more."* | VEText Email Reminders |
| **No control over reminder preferences** | Veterans want to choose channels (text vs. email vs. mail) and frequency. | VEText Email Reminders |

### Relevant Products

- Medications on VA.gov (MHV)
- Medical Records on VA.gov (MHV)
- Secure Messaging on VA.gov (MHV)
- VEText Appointment Reminders
- My VA 3.0 Dashboard
- VA Online Scheduling (VAOS)

---

## 3. Navigation & Information Architecture

### Summary

Veterans frequently cannot find what they need on VA.gov. Tree tests, usability studies, and desk research consistently show that VA.gov's information architecture does not match Veterans' mental models. Key items like benefit letters, dependent tools, medical record downloads, and community care status are located in unexpected places. Veterans use many different paths (search, menus, direct links) with no single clear route.

### Where Veterans Get Confused or Stuck

| Issue | Details | Studies Observing |
|-------|---------|-------------------|
| **Community care status unfindable** | Only 37.5% success in tree test. Veterans scattered across Health Care, Secure Messages, Community Care, and Claims sections. | IA Tree Test |
| **ILER (Individual Longitudinal Exposure Record) misplaced** | Only 20.8% success. Veterans searched Health, Claims, and Disability sections; correct location was under Records. | IA Tree Test |
| **Benefit letters found via many different paths** | Veterans used keyword search, dropdown menus, Records section, or site search inconsistently. No single clear path. | Benefit Letters |
| **Confusion between benefit letters and decision letters** | Some Veterans navigated to the Claim Status Tool when looking for benefit letters. | Benefit Letters |
| **Dependent tools not where expected** | Veterans expected to find dependent tools under main menu (4 participants) or My VA hub (3 participants). | Dependent Verification |
| **674 form for student dependents extremely hard to find** | Veteran searched for "dependent" (wrong page), "student" (GI Bill page), and ultimately had to call VA. | Dependents Continuous Discovery |
| **Adding a dependent to compensation mislocated** | Only 33.3% success. Veterans looked in Benefit Applications and Family/Caregiver Benefits rather than Disability compensation. | IA Tree Test |
| **Accredited representatives placement failure** | Only 9% success in Profile Hub tree test. No clear alternative location emerged. | Profile Hub Tree Test |
| **ILER/Toxic exposure report IA mismatch** | 71% associated it with "Service history" but it was planned under "Letters and documents." | Profile Hub Tree Test |
| **"My VA" name unclear** | New users don't understand what "My VA" means. Preferred "My VA Dashboard" or "My Dashboard." | My VA 3.0, Onboarding, Desk Research |
| **Dense "Get [benefit]" pages overwhelmed users** | 8 of 8 found pages with 10+ anchor links overwhelming. 6 of 8 couldn't locate eligibility information quickly. | Veteran Onboarding |
| **Mobile sub-navigation difficulty** | Mobile users struggled navigating Profile via the sub menu, while desktop users had no issues. | Profile Desk Research |
| **Claims and appeals vs. benefits applications confusing** | Veterans frustrated these were separate sections and couldn't distinguish between them. | My VA Desk Research |

### Relevant Products

- VA.gov Information Architecture / Navigation
- VA.gov Profile Hub
- My VA Dashboard
- Benefit Letters
- Medical Records on VA.gov
- Facility Locator
- Dependents on VA Benefits
- Accredited Representation Management
- Veteran Onboarding

---

## 4. Terminology & Jargon Confusion

### Summary

VA-specific terminology, medical jargon, inconsistent labels, and legally precise but user-unfriendly language create barriers across the digital experience. Veterans encounter terms they don't recognize, labels that mean different things in different contexts, and language that does not match their mental models.

### Where Veterans Get Confused or Stuck

| Confusing Term/Label | What Veterans Expected | Studies Observing |
|----------------------|------------------------|-------------------|
| **"Benefit Summary and Service Verification Letter" vs. "Benefit Verification Letter"** | Can't distinguish between similarly named letters (6 of 11 confused) | Benefit Letters |
| **"Refill" vs. "Renewal"** | Used interchangeably; 4 of 12 saw no difference | Medications Renewal Flow |
| **"Active" medication status** | Assumed it meant refills are available | Medications Status Labels |
| **"Microbiology" / "Surgical pathology"** | Not recognized by any participants | Medical Records AT |
| **"Labile INR"** | All 5 clinicians unsure of definition in context | Medical Calculators |
| **"Evidence" (on form intro pages)** | Triggers anxiety; Veterans think they need more documentation than required | 0969 Pension |
| **"Dependent" (in financial context)** | Confused by financial support rules for dependents | 0969 Pension |
| **"Financial Services Center," "Vendor File Form," "PIV"** | All unfamiliar to participants; banks not thought of as "vendors" | FMP Claims |
| **"Military information"** | Expected personal details, demographics; "Service history" matched better | Profile Desk Research |
| **"Contact information"** | Some confused by what it includes in the profile | My VA 3.0 |
| **"Messages" vs. "Secure messaging"** | Veterans strongly prefer explicit "Secure messaging" | My VA 3.0 |
| **"Notifications" vs. "Alerts" vs. "Action items"** | Used interchangeably; Veterans interpret "notifications/alerts" as informational and "action items" as to-dos | My VA Desk Research |
| **"Update" (dependent context)** | All 6 expected to edit information inline, but it only supports add/remove | Dependent Verification |
| **"Verification" vs. "Confirmation"** | "Verification" triggers association with cumbersome identity proofing | Email Verification Research |
| **Death described as "end of marriage"** | Seen as cold and disrespectful | 534EZ Survivors |
| **Pension types (Veterans pension, military retirement, Social Security)** | Only 2 of 6 understood Veterans pension as a needs-based benefit | Pension Disability Alert |

### Relevant Products

- Benefit Letters
- Medications on VA.gov
- Medical Records on VA.gov
- VA.gov Profile
- My VA Dashboard
- Pension Forms (0969, 534EZ)
- FMP Claims
- Dependent Verification
- Disability Compensation (526EZ)
- Medical Calculators (CDS)

---

## 5. Alert & Notification Blindness

### Summary

Veterans consistently fail to notice alerts, banners, informational messages, and notifications on VA.gov. Whether presented as success alerts, warning alerts, informational banners, or in-product education hints, critical content placed in these components goes unread. This issue has been observed across multiple products and studied repeatedly without a clear solution.

### Where Veterans Get Confused or Stuck

| Issue | Details | Studies Observing |
|-------|---------|-------------------|
| **Save-in-progress alerts unseen** | 7 of 11 didn't notice the save alert on the form intro page. 7 of 11 didn't notice it on the first page. Those who read it didn't remember it later. | Save in Progress Round 1 |
| **Interstitial page ignored** | Half ignored the interstitial as an unwelcome interruption. Of those who read it, most didn't remember the auto-save message. | Save in Progress Round 2 |
| **Intent to File success alert scrolled past** | 6 of 11 immediately scrolled past the success alert. Only 1 of 20 participants interacted with the "What's an intent to file?" component. | Intent to File Study |
| **Intent to File warning alert missed** | 8 of 16 scrolled past the warning alert about the 1-year deadline. | Intent to File Study |
| **IPE hints add auditory clutter for screen readers** | All 5 screen reader users said the IPE hint added unwanted noise or was skipped entirely due to header-first navigation. | Medications IPE |
| **Dependent verification alert-to-action gap** | 9 of 10 read the alert, but only 5 clicked the verification link without prompting. Alert alone is insufficient to drive action. | Dependent Verification Picklist |
| **Verification email urgency unclear** | Some designs seemed optional, others mandatory but harsh. Veterans couldn't consistently tell if action was required. | Dependents Verification Email Design |
| **Users dismiss modals** | Modals alone are insufficient; teams need multiple touchpoints (emails, alerts, interstitials) to reach users. | Email Verification Desk Research |
| **Product tours universally rejected** | Veterans dismiss multi-step walkthroughs immediately. *"How many countless tours I've been on. You know what I do with those tours? I just click away."* | Veteran Onboarding |
| **Notification preferences buried in email** | Located in the part of email that Veterans skip, making it ineffective. | VEText Email Reminders |

### Key Insight

> Prior studies also failed to solve notification blindness with different placement/messaging approaches. The core problem is **component visibility**, not content comprehension. Veterans' learned behavior is to scroll past alerts to reach actionable content.

### Relevant Products

- VA.gov Forms Platform (Save in Progress)
- Pension Intent to File
- Medications on VA.gov (IPE)
- Dependent Verification
- Veteran Onboarding Modal
- VEText Email Reminders
- VA.gov Profile (Email Verification)

---

## 6. Accessibility & Assistive Technology Barriers

### Summary

Veterans using screen readers, screen magnifiers, voice commands, and other assistive technologies face significant and sometimes task-blocking barriers across VA.gov. Issues range from content being completely invisible to screen readers to poor focus management and non-functional interactive elements.

### Where Veterans Get Confused or Stuck

| Issue | Details | Studies Observing |
|-------|---------|-------------------|
| **Screen reader dropdown bug** | Dropdown options not announced by screen readers when navigated using only the cursor. | Medical Records AT |
| **Speechify missed critical content** | Skipped address info, blue alerts, accordion content; struggled with multi-column layouts. | Benefit Letters |
| **Map completely inaccessible** | Mapbox widget gives screen readers only facility result number—no name, address, or other data. | Facility Locator Mobile |
| **Progress bar invisible to screen readers** | Placed above H1, so screen reader users who navigate by headings never encounter it. | Save in Progress Round 1 |
| **Screen magnifier users lost controls** | Accordion "+" buttons on the right side were invisible to users with magnified views. "Continue your application" link didn't scale. | Save in Progress Round 1 |
| **Focus management failures** | Safari focus jumping to top of page; date of birth field traps; forms mode skipping instructions. | Save in Progress Rounds 1 & 2 |
| **DIC acronym read as word** | Screen readers pronounced "DIC" phonetically as a word rather than spelling it out. | 534EZ Survivors |
| **Long dropdown lists slow for AT users** | Facility type navigation lists are slow and cumbersome with assistive technology. | Facility Locator Mobile |
| **IPE adds auditory clutter** | Screen reader users said the in-product education hint added unwanted noise to dictation. | Medications IPE |
| **Sort options silent without selection** | Screen reader users couldn't hear sort options without actually selecting them. | Medications IPE |
| **Signed-in form intro identical to unsigned** | Screen reader users must listen to the entire page twice; no differentiation. | Save in Progress Round 1 |
| **No AT testing conducted** | Explicitly noted as gap in multiple studies. | Secure Messaging, 10-10EZ |

### Relevant Products

- Medical Records on VA.gov
- Benefit Letters
- Facility Locator (Mobile Map)
- VA.gov Forms Platform (Save in Progress)
- Medications on VA.gov
- VA Form 21P-534EZ
- Secure Messaging on VA.gov
- 10-10EZ Health Care Application

---

## 7. Dependent Management

### Summary

Managing dependents on VA benefits is one of the most consistently frustrating tasks for Veterans. The 8-year mandatory verification process is not understood, the transition of children turning 18 is a universal pain point, form language doesn't match Veterans' mental models, and VA processing times create overpayment anxiety. Veterans often receive conflicting information from VA call centers, compounding confusion.

### Where Veterans Get Confused or Stuck

| Issue | Details | Studies Observing |
|-------|---------|-------------------|
| **8-year verification process not understood** | 8 of 10 confused it with initial identity verification or thought it was event-based, not time-based. | Dependent Verification MVP |
| **Veterans won't act if dependents "look correct"** | 6 of 10 from email and 3 of 10 from VA.gov interpreted the ask as "just review," not requiring form submission. | Dependent Verification MVP, Picklist |
| **"Update" confused with "edit information"** | All participants expected to edit dependent details inline; actual path only supports add/remove. | Dependent Verification MVP |
| **18-year-old transition is a universal pain point** | Children auto-aged out while still in high school. Adding student dependents requires removing then re-adding. *"I had to remove him to add him—it didn't make any sense."* | All Dependents Studies |
| **674 form not adapted for high school vs. college** | Same form serves both; confusing screens for federal education benefits, identical-seeming date questions. | Continuous Discovery Round 7 |
| **"Add" chosen instead of "recertify"** | 3 of 4 chose "Add" when they needed to recertify an existing student. | Continuous Discovery Round 5 |
| **Finding the 674 form is extremely hard** | Searching "dependent" and "student" on VA.gov led to wrong pages. Veteran had to call VA. | Continuous Discovery Round 5 |
| **Overpayment distress** | Veterans fear the full overpayment amount will be deducted immediately. Overpayments accumulate during VA's slow processing. Conflicting call center guidance caused one Veteran a year of overpayment. | Continuous Discovery Rounds 1, 4, 5 |
| **Verification language triggers anxiety** | References to overpayment and paying money back caused anxiety. Veterans worried about being accused of fraud. | Continuous Discovery Round 4 |
| **Death question design emotionally problematic** | Asking "Has any of your dependents died?" on a standalone page perceived as cold and anxiety-inducing. | Dependent Verification Picklist |
| **No payment breakdown** | No visibility into how much of a payment is base vs. dependent-specific. | Continuous Discovery Round 1 |
| **Paper mail arrives months late** | Letters arrive long after the printed date. Veterans can't hold VA accountable without written records of submissions. | Continuous Discovery Round 1 |

### Relevant Products

- Dependent Verification (VA Form 21-0538)
- Add/Remove Dependents (VA Form 21-686c)
- Student Dependents (VA Form 21-674)
- My VA Dashboard (Dependents Section)
- VA.gov Profile Hub

---

## 8. Save in Progress & Session Management

### Summary

Veterans do not trust or understand that VA.gov forms save their progress automatically. This creates significant anxiety about losing work, especially for lengthy forms that may require gathering documents across multiple sessions. The "Finish later" button label is ambiguous, alerts about auto-save go unread, and the experience for returning to a form is confusing.

### Where Veterans Get Confused or Stuck

| Issue | Details | Studies Observing |
|-------|---------|-------------------|
| **Auto-save invisible** | 9 of 11 (Round 1) and 6 of 7 (Round 2) didn't know information was saved automatically. Most assumed saving happened only after clicking "Finish later" or "Submit." | Save in Progress Rounds 1 & 2 |
| **"Finish later" label ambiguous** | 4 of 11 unclear if it means "quit for a while," "skip this page," or "save and close." Suggested rename to "Save and close." | Save in Progress Round 1 |
| **Form intro page confusion on return** | Veterans expected to see form fields immediately after signing in but instead saw the intro page again. *"I wanted to fill out a form, I signed in to fill out the form, and all of a sudden, it looks like I'm right back on the same page."* | Save in Progress Round 2 |
| **Session timeout anxiety** | 6 of 11 worried about losing work if session timed out. | Save in Progress Round 1 |
| **Save functionality invisible in Discover Your Benefits** | 68% thought they'd have to retake the questionnaire. Only 25% noticed the "save link" button. | Discover Your Benefits |
| **No notification after "Finish later"** | 6 of 7 wanted email/text notification confirming their progress was saved and reminding them before data deletion. | Save in Progress Round 2 |
| **Pre-fill expectations unmet** | 3 participants expected name, address, phone to be pre-filled since they were signed in. | Save in Progress Round 2 |
| **"Every change" wording confusing** | One participant thought auto-save meant only changes to existing entries, not initial data entry. | Save in Progress Round 2 |

### Relevant Products

- VA.gov Forms Platform (Save in Progress)
- Discover Your Benefits Tool
- All VA.gov digital forms

---

## 9. Benefits Discovery & Eligibility Understanding

### Summary

Veterans—especially those newly transitioning from military service—struggle to discover what VA benefits they are eligible for. Onboarding experiences, benefits discovery tools, and benefit introduction pages often fail to provide the quick, personalized eligibility checks Veterans need before investing time in applications.

### Where Veterans Get Confused or Stuck

| Issue | Details | Studies Observing |
|-------|---------|-------------------|
| **Eligibility is a psychological prerequisite** | Veterans won't invest time in applications unless they can quickly confirm eligibility. *"I wouldn't want to go into something, find something that I'm like, oh, my God, this would be great. Come to find out I'm not eligible."* | Veteran Onboarding |
| **"Discover Your Benefits" falls short** | Veterans expected a personalized eligibility list but got another questionnaire. Goals-to-benefits disconnect: little relationship between selected goals and explored benefits. | Discover Your Benefits |
| **Pension types confused** | Only 2 of 6 understood Veterans pension as a needs-based benefit. Confused with military retirement pension and Social Security. | Pension Disability Alert |
| **Intent to File financial benefit not understood** | Most understood ITF as "notifying VA," but only 4 of 20 mentioned it sets a benefit start date. None mentioned retroactive/back payments. | Intent to File Study |
| **"Most people" language rejected** | Veterans want personalized framing, not crowd-sourced suggestions. *"I don't really care much about what most people are doing."* | Veteran Onboarding |
| **One-size-fits-all content frustrates enrolled Veterans** | Already-enrolled Veterans see irrelevant content (e.g., disability compensation shown to Veterans who already have ratings). | Veteran Onboarding, Discover Your Benefits |
| **No path to human support** | Participants looked for a help phone number and were disappointed it wasn't available. They wanted chat-to-human escalation. | Discover Your Benefits |
| **Guard/Reserves underserved** | They receive less transition support and had harder transition experiences. | Discover Your Benefits |

### Relevant Products

- Welcome to VA.gov Onboarding Modal
- Discover Your Benefits Tool
- Veterans Pension Application
- Intent to File (Pension)
- My VA Dashboard
- VA.gov Home Page (Unauthenticated)

---

## 10. Financial Information & Payments

### Summary

Veterans expect a unified view of their financial information—including compensation payments, debts, copays, and direct deposit settings—but find it fragmented across multiple systems. Separate direct deposit configurations, inconsistent payment amount formats, missing payment breakdowns, and the emotional burden of overpayments all contribute to confusion and anxiety.

### Where Veterans Get Confused or Stuck

| Issue | Details | Studies Observing |
|-------|---------|-------------------|
| **FMP vs. VBA direct deposit confusion** | 4 of 8 assumed existing disability compensation direct deposit would automatically apply to FMP claims. | FMP Claims |
| **No visibility into bank account within forms** | Veterans expected to see bank info (last 4 digits, institution name) inside the form, not in another portal. | FMP Claims |
| **No payment breakdown** | No visibility into how much of a disability payment is for base vs. dependent-specific amounts. | Dependents Continuous Discovery |
| **Payments and debts expected together** | Veterans want all financial info in one place; debts separate from medical copays. | My VA Desk Research |
| **Inconsistent payment amount formats** | Pension rate tables show annual amounts while disability tables show monthly amounts, creating confusion when comparing. | Pension Disability Alert |
| **Overpayment fear** | Veterans fear the full overpayment amount will be deducted from their next check immediately. | Dependents Studies |
| **"Dollar threshold" confusion** | Veterans tried to apply their own thresholds for what income is "worth reporting." *"Is there a chart where you can figure out if your interest is worth reporting?"* | 0969 Pension |

### Relevant Products

- FMP Claim Cover Sheet (VA Form 10-7959f-2)
- My VA Dashboard
- Combined VA Debt Portal / Payment History
- Dependents on VA Benefits
- Pension Forms (0969, 534EZ)

---

## Summary Data Tables

### Studies by Product Area

| Product Area | Number of Studies | Study Types |
|-------------|-------------------|-------------|
| Dependents Management | 6 | Usability, Generative, Design Comparison |
| Medications (MHV) | 4 | Usability, A/B/C Testing, AT-focused |
| Pension & Benefits | 4 | Usability, Unmoderated |
| My VA / Profile | 5 | Usability, Desk Research, Tree Test |
| VA.gov Forms Platform | 2 | Usability (AT-focused) |
| Health Care Applications | 2 | Unmoderated A/B, Usability |
| Medical Records (MHV) | 1 | Usability (AT-focused) |
| Secure Messaging (MHV) | 1 | Usability |
| Benefit Letters | 1 | Usability |
| Veteran Transition | 3 | Generative, Usability |
| VEText Reminders | 1 | Generative Interviews |
| Disability Compensation | 1 | Usability (Mobile) |
| Facility Locator | 1 | Moderated Interviews |
| FMP Claims | 1 | Content Comprehension |
| Supply Reordering | 1 | Unmoderated A/B |
| Clinical Decision Support | 2 | Usability (Clinician-facing) |

### Pain Point Frequency Across All Studies

| Pain Point Category | Studies Affected | Key Metric |
|---|---|---|
| Form Completion & Navigation | 10 | Most common across product areas |
| Health Care Task Management | 8 | Highest impact on daily Veteran tasks |
| Navigation & IA | 7+ | Tree test success rates as low as 9–20% |
| Terminology & Jargon | 7+ | Affects comprehension across all products |
| Alert & Notification Blindness | 7 | Repeated across studies with no clear solution yet |
| Accessibility & AT Barriers | 6 | Task-blocking issues for screen reader users |
| Dependent Management | 5 | 8-year verification universally misunderstood |
| Save in Progress | 4 | Auto-save invisible to 80%+ of users |
| Benefits Discovery & Eligibility | 4 | Eligibility is psychological prerequisite to engagement |
| Financial Info & Payments | 3+ | Fragmented systems cause confusion and anxiety |

### Cross-Cutting Observations

```
Percentage of Studies Where Each Cross-Cutting Issue Was Observed
═══════════════════════════════════════════════════════════════════════
Discoverability failures          ██████████████████████  63% (22/35)
  (links, buttons, features
  not noticed by users)

Cognitive overload                ██████████████████      51% (18/35)
  (too much info, too many
  steps, excessive content)

Mental model mismatch             █████████████████       49% (17/35)
  (system doesn't match how
  Veterans think about tasks)

Emotional/trust burden            ████████████████        46% (16/35)
  (anxiety, distress, feeling
  accused, insensitive language)

AT / accessibility gaps           ████████████            34% (12/35)
  (screen reader failures,
  mobile barriers, no AT testing)
═══════════════════════════════════════════════════════════════════════
```

---

## Sources

The following research studies were analyzed for this report (Jan 2025 – Feb 2026):

| # | Study | Date | Path |
|---|-------|------|------|
| 1 | Benefit Letters Usability | Aug 2025 | `products/benefit-letters/research/2025-06-Your-VA-benefit-letters-and-documents/` |
| 2 | Copays Usability | Oct 2025 | `products/combined_va_debt_portal/payment-history/research/2025-10-copays-usability/` |
| 3 | Dependents Verification MVP | Feb–Mar 2025 | `products/dependents/research/2025-02-dependents-verification-mvp-research/` |
| 4 | Dependents Continuous Discovery Round 1 | Aug–Sep 2025 | `products/dependents/research/2025-08-continuous-discovery-pilot/Round 1/` |
| 5 | Dependents Continuous Discovery Round 4 | 2025 | `products/dependents/research/2025-08-continuous-discovery-pilot/Round 4/` |
| 6 | Dependents Continuous Discovery Round 5 | 2025 | `products/dependents/research/2025-08-continuous-discovery-pilot/Rounds 5&6/` |
| 7 | Dependents Continuous Discovery Round 7 | 2025 | `products/dependents/research/2025-08-continuous-discovery-pilot/Round 7/` |
| 8 | Dependent Verification with Picklist | Aug 2025 | `products/dependents/research/2025-08-dependent-verification-with-picklist/` |
| 9 | 10-10EZ Task List vs. Traditional Form | Jul 2025 | `products/health-care/application/va-application/research/2025-06-Task List and Traditional Form Unmoderated/` |
| 10 | TRICARE Eligibility Usability | Jan 2026 | `products/health-care/champva/1010D/research/users/2026-01-Tricare Eligibility Usability Research/` |
| 11 | Calculator Detail Page Line Chart Testing | Sep–Oct 2025 | `products/health-care/clinical-decision-support/medical-calculators/research/2025-09-Calculator-Detail-Page-Line-Chart-Testing/` |
| 12 | Patient Details Testing (CDS) | Dec 2025 | `products/health-care/clinical-decision-support/platform/research/2025-12-Patient-Details-Testing/` |
| 13 | Medical Records AT Usability (Round 4) | Jan–Feb 2025 | `products/health-care/digital-health-modernization/mhv-to-va.gov/medical-records/research/2025-01-usability-testing-rd4-at/` |
| 14 | Medications IPE Study | Apr–May 2025 | `products/health-care/digital-health-modernization/mhv-to-va.gov/medications/research/2025-03-IPE-study/` |
| 15 | Medications IPE A/B/C Testing | Jul 2025 | `products/health-care/digital-health-modernization/mhv-to-va.gov/medications/research/2025-06-IPE-ABC-testing/` |
| 16 | Medications Renewal Flow & Status Labels | Nov 2025–Jan 2026 | `products/health-care/digital-health-modernization/mhv-to-va.gov/medications/research/2025-11-medications-messaging-and-status-labels-usability-study/` |
| 17 | Appointments & Other Tasks Tree Test | Jun–Jul 2025 | `products/health-care/digital-health-modernization/mhv-to-va.gov/overall-content-IA/2025-06-appointments-and-other-tasks-tree-test/` |
| 18 | Secure Messaging Curated List Usability | Jul 2025 | `products/health-care/digital-health-modernization/mhv-to-va.gov/secure-messaging/research/2025-06-curated-list-usability-testing/` |
| 19 | FMP Claims Direct Deposit Content Study | Oct–Nov 2025 | `products/health-care/foreign-medical-program/10-7959f-2/research/2025-10-FMP-Claims-Direct-Deposit-Content-Study/` |
| 20 | Supply Reordering Multistep Task Pattern | Feb–Apr 2025 | `products/health-care/supply-reordering-tool/research/2025-02 Multistep task pattern research/` |
| 21 | My VA Desk Research | Mar 2025 | `products/identity-personalization/my-va/research/2025-03-secondaryresearch/` |
| 22 | My VA 3.0 Phase 1 Usability | Aug 2025 | `products/identity-personalization/my-va/research/2025-08-myva3.0-phase1-usabilitytesting/` |
| 23 | Profile Desk Research | Mar 2025 | `products/identity-personalization/profile/Research/2025-03-profile-secondary-research/` |
| 24 | Email Verification Desk Research | Sep 2025 | `products/identity-personalization/profile/Research/2025-09-email-verification-desk-research/` |
| 25 | Profile Hub Tree Test | May 2025 | `products/identity-personalization/profile/Research/profile-hub/2025-05-profile-hub-tree-test/` |
| 26 | 0969 Pension Usability | Jul–Aug 2025 | `products/pension/research/2025-07 0969 Usability Study/` |
| 27 | Intent to File Unmoderated Study | Sep 2025 | `products/pension/research/2025-09 Intent to File Unmoderated Study/` |
| 28 | Pension Disability Alert | Dec 2025–Jan 2026 | `products/pension/research/2025-12 Pension Disability Alert/` |
| 29 | 534EZ Usability Study | Jan–Feb 2026 | `products/pension/research/2026-01 534EZ Usability Study/` |
| 30 | Discover Your Benefits | Jul–Aug 2025 | `products/vet-transition-support/research/2025-07-generative-and-user-testing-study/` |
| 31 | Veteran Onboarding Study | Oct–Nov 2025 | `products/veteran-onboarding/research/2025-study/` |
| 32 | VEText Email Appointment Reminders | Jan–Feb 2025 | `products/vetext/research/2025-01-VEText-MyHealtheVet-email-appointment-reminder-content-research/` |
| 33 | Save in Progress Round 1 | May 2025 | `teams/digital-experience/ADE/research/2025-05-save-in-progress/` |
| 34 | Save in Progress Round 2 | Jan 2026 | `teams/digital-experience/ADE/research/2026-01-save-in-progress-2/` |
| 35 | Disability 526EZ Condition Level | Jun–Jul 2025 | `products/disability/526ez/research/CC-Team-Research/2025-06 New or Increase at Condition Level/` |

*Note: Several files found in the search (Evidence Requests, PACT SUD UAT, Results Page 2.0) contained only blank templates with no actual research findings and were excluded from analysis.*

---

*This report was generated by analyzing publicly available research findings in the VA.gov Team repository. All quotes are from Veteran participants in the cited studies.*
