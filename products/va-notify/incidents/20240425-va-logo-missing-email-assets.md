# Incident Report: VA Logo Missing from Emails

**Date:** 2024-04-25  
**Severity:** _[TBD]_  
**Status:** Resolved  
**Incident Commander:** _[TBD]_  
**Reporter:** Jake Uhteg  
**Filed by:** Kyle MacMillan

---

## Summary

On 2024-04-25, the VA logo was not available when viewing any email from VA Notify for approximately 4 hours. This affected all emails, past and present.

## Timeline

| Time (ET) | Event |
|-----------|-------|
| _[TBD]_ | VA logo asset removed from vets-website bucket via [vets-website PR #29331](https://github.com/department-of-veterans-affairs/vets-website/pull/29331) |
| _[TBD]_ | Missing logo detected in emails |
| _[TBD]_ | [VFS support ticket](https://dsva.slack.com/archives/CBU0KDSB1/p1714066142850419) opened |
| _[TBD]_ | PR merged and out-of-cycle deploy to Production executed |
| _[TBD]_ | VA logo restored; incident resolved |

## Impact

- **Duration:** ~4 hours
- **Affected environment:** Production
- **Affected channels:** Email (all current and past emails)
- **Estimated notifications affected:** All emails — users saw alt text and/or a missing image placeholder depending on email client
- **Business lines affected:** _[TBD]_

## Root Cause

The VA was cleaning up vets-website and found the image was not used in any of their systems, so it was removed as part of [vets-website PR #29331](https://github.com/department-of-veterans-affairs/vets-website/pull/29331). The change was deployed at a later time, leading to the bucket URL being unavailable. Emails do not send the actual image — they contain links to images. The link to the VA logo image was no longer available, so users would see the alt text and/or a missing image placeholder depending on email client.

## Resolution

A [VFS support ticket](https://dsva.slack.com/archives/CBU0KDSB1/p1714066142850419) was made. After discussion it was determined that the images needed to be put back in place. That required a merged PR and out-of-cycle deploy to Production. There were delays in fixing the issue because an unrelated PR that was merged had broken the CD status checks.

**Resolution Date:** 2024-04-25  
**Time to resolution:** ~4 hours

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add synthetic monitor for S3 bucket availability | _[TBD]_ | 2024-04-25 | Completed |

## Lessons Learned

Since this is an S3 bucket VA Notify does not control, a [synthetic monitor](https://vanotify.ddog-gov.com/synthetics/details/yeu-e78-ifd?from_ts=1714401486697&to_ts=1715006286697&live=true) was immediately put in place to test the bucket every 4 hours, ensuring availability. If the bucket is unavailable it alerts in the OCTO Slack channel [#va-notify-automatic-alerts](https://dsva.slack.com/archives/G015QSLR4BU) and a PagerDuty alert is issued.
