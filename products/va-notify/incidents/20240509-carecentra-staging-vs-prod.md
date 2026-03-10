# Incident Report: CareCentra Launched Notifications in Staging Instead of Production

**Date:** 2024-05-09  
**Severity:** _[TBD]_  
**Status:** Resolved  
**Incident Commander:** _[TBD]_  
**Authors:** _[TBD]_

---

## Summary

On 2024-05-09, CareCentra attempted to launch SMS and email notifications in the Staging environment instead of Production. The issue was discovered when they hit the daily send limit in Staging and reached out to VA Notify for assistance.

## Timeline

| Time (ET) | Event |
|-----------|-------|
| _[TBD]_ | CareCentra begins sending SMS and email notifications in Staging |
| _[TBD]_ | Daily send limit reached in Staging |
| _[TBD]_ | CareCentra contacts VA Notify |
| _[TBD]_ | Issue identified: notifications sent to wrong environment |

## Impact

- **Duration:** _[TBD]_
- **Affected environment:** Staging (notifications intended for Production)
- **Affected channels:** SMS and Email
- **Estimated notifications affected:** _[TBD]_
- **Business lines affected:** CareCentra

## Root Cause

CareCentra configured their notification launch against the Staging environment instead of Production.

## Resolution

Issue was identified after CareCentra hit the Staging daily send limit and contacted VA Notify. Notifications were redirected to the Production environment.

For full post-mortem details, see the [private post-mortem PR](https://github.com/department-of-veterans-affairs/va.gov-team-sensitive/pull/1672).

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| _[TBD]_ | | | |

## Lessons Learned

_[TBD: see post-mortem at https://github.com/department-of-veterans-affairs/va.gov-team-sensitive/pull/1672]_
