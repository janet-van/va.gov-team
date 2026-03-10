# Incident Report: Self Service UI Template Preview Issues

**Date:** 2022-06-15  
**Severity:** _[TBD]_  
**Status:** Resolved  
**Incident Commander:** _[TBD]_  
**Authors:** _[TBD]_

---

## Summary

On 2022-06-15, several issues were discovered in the VA Notify Self Service UI on Staging after a new portal deployment. Preview functionality on newly created templates was not working, errors were flashing between loading new templates, a typo was introduced on a Sample Template, and the Sample Template link was incorrectly showing on the SMS Template creation page. Reported by Bev.

## Timeline

| Time (ET) | Event |
|-----------|-------|
| 2022-06-15 | Issue reported by Bev |
| 2022-06-15 | Team identified missing notification-api endpoint deployment to staging |
| 2022-06-15 | notification-api staging deploy completed; unsaved template preview verified working |
| 2022-06-16 | Bug fix deployed for new template preview url param issue |
| 2022-06-16 | Incident resolved |

## Impact

- **Duration:** ~1 day
- **Affected channels:** Self Service UI (Staging)
- **Estimated notifications affected:** _[TBD]_
- **Business lines affected:** _[TBD]_
- **Users impacted:** Staging users were unable to preview newly created templates; errors flashed when loading new templates; Sample Template had a typo; Sample Template link appeared incorrectly on SMS Template creation page.

## Root Cause

When the portal was initially deployed to staging, the unsaved template preview was not working properly (in either saved templates or new templates). The portal relies on notification-api to generate the template preview and the specific endpoint that the portal uses for unsaved template changes (https://github.com/department-of-veterans-affairs/notification-api/pull/695) had not been deployed to the staging environment of notification-api. The team had failed to account for this dependency before launching the portal to staging.

After the staging notification-api deploy was completed and unsaved template changes were verified, it was discovered that new templates still could not generate previews. This was due to a bug where the template's associated `service_id` was not passed correctly as a URL param in the request. https://github.com/department-of-veterans-affairs/notification-portal/pull/64

## Resolution

Correctly formatted the URL params for the new (unsaved) template preview request.

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Create a Release Plan | | | |
| Add UX and Product review step during QA | | | |
| Thoroughly test external dependencies (e.g. notification-api requests) not testable during local development | | | |

## Lessons Learned

- Creating a Release Plan to capture environment dependencies before deploying.
- Adding an additional step of UX and Product review while in QA.
- Make sure that we are thoroughly testing external dependencies (like notification-api requests) that we are not able to test during local development.
