# Incident Report: Self Service UI Template Preview Issues

**Date:** 2022-06-15  
**Severity:** Low  
**Status:** Resolved  
**Incident Commander:** _[TBD]_  
**Authors:** Bev

---

## Summary

On 2022-06-15, several issues were discovered in the VA Notify Self Service UI staging environment shortly after deployment. Preview functionality for newly created templates was not working, errors were flashing during new template loading, a typo was introduced on the Sample Template, and the Sample Template link was incorrectly shown on the SMS Template creation page.

## Timeline

| Time (ET) | Event |
|-----------|-------|
| 2022-06-15 _[TBD]_ | Issues reported by Bev |
| 2022-06-15 _[TBD]_ | Team identified missing notification-api preview endpoint in staging |
| 2022-06-15 _[TBD]_ | Coordinated with Kyle to promote preview endpoint to notification-api staging |
| 2022-06-15 _[TBD]_ | Staging notification-api deploy completed; unsaved template changes verified |
| 2022-06-16 _[TBD]_ | Bug identified where service_id was not passed correctly as a URL param for new templates |
| 2022-06-16 _[TBD]_ | Fix applied — URL params for new (unsaved) template preview request corrected |

## Impact

- **Duration:** ~1 day
- **Affected channels:** Self Service UI (staging)
- **Estimated notifications affected:** N/A (staging only)
- **Business lines affected:** N/A (staging only)
- **Users impacted:** Users attempting to preview newly created templates in staging were unable to do so.

## Root Cause

When the portal was initially deployed to staging, the unsaved template preview was not working properly (in either saved templates or new templates). The portal relies on notification-api to generate the template preview, and the specific endpoint used for unsaved template changes had not been deployed to the staging environment of notification-api. The team had failed to account for this dependency before launching the portal to staging.

After coordinating with Kyle and promoting the preview endpoint to notification-api staging, the team verified that unsaved template changes worked correctly, but did not double-check that new templates could be previewed. New templates failed to generate previews due to a bug where the template's associated `service_id` was not passed correctly as a URL parameter in the request.

## Resolution

Correctly formatted the URL params for the new (unsaved) template preview request to ensure `service_id` was passed properly.

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Create a Release Plan | _[TBD]_ | _[TBD]_ | Completed |
| Add UX and Product review step during QA | _[TBD]_ | _[TBD]_ | Completed |
| Thoroughly test external dependencies (e.g., notification-api requests) that cannot be tested during local development | _[TBD]_ | _[TBD]_ | Completed |

## Lessons Learned

- Create a Release Plan to ensure all environment dependencies are accounted for before deployment.
- Add an additional step of UX and Product review while in QA.
- Make sure that external dependencies (like notification-api requests) that cannot be tested during local development are thoroughly tested in staging before sign-off.
