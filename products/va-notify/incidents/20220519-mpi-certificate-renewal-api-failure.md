# Incident Report: MPI Certificate Renewal API Failure

**Date:** 2022-05-19 (noticed 2022-05-25)  
**Severity:** _[TBD]_  
**Status:** Resolved  
**Incident Commander:** _[TBD]_  
**Authors:** Dave

---

## Summary

On 2022-05-19, MPI renewed their certificates used for integration with VA Notify without prior notification. The issue was not noticed until 2022-05-25, when the error "MPI returned RequestException while querying for FHIR identifier" surfaced. This prevented code from being committed to the main branch of the API repo due to a failing unit test for the MPI integration (a user flow test with ICN). On Staging, this blocked Strike team from testing their 10-10 EZ in-progress notification and prevented MHV from testing push notifications.

## Timeline

| Time (ET) | Event |
|-----------|-------|
| 2022-05-19 | MPI renewed certificates in lower environments |
| 2022-05-25 | Issue noticed; error "MPI returned RequestException while querying for FHIR identifier" reported by Dave |
| _[TBD]_ | Reached out in vsp-identity Slack channel |
| _[TBD]_ | Lower Environment Trouble Ticket submitted |
| _[TBD]_ | Identity team confirmed certificates were updated on 5/19 in lower environments |
| _[TBD]_ | Updated certificates and deployed the fix to lower environments |
| 2022-06-02 | Production certificates updated proactively; incident resolved |

## Impact

- **Duration:** ~2 weeks (5/19 – 6/2/2022); noticed ~1 week after occurrence
- **Affected channels:** API (Staging)
- **Estimated notifications affected:** _[TBD]_
- **Business lines affected:** Strike team (10-10 EZ in-progress notification), MHV (push notifications)
- **Environment:** Staging

## Root Cause

MPI renewed their certificates used for the integration with VA Notify. The team was not notified of the change, which caused the MPI integration to fail with a `RequestException` when querying for FHIR identifiers. This also broke a unit test in the API repo that covered an MPI user flow with ICN, preventing code commits to the main branch.

## Resolution

The team reached out in the vsp-identity Slack channel. They were instructed to submit a Lower Environment Trouble Ticket. The identity team followed up via email and confirmed that certificates had been updated on 5/19 in the lower environments. VA Notify updated the certificates and deployed the fix. Production was scheduled to change on 6/2/2022, and the team was able to proactively address that update one day ahead of time.

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add Kyle and Jesse to the VANotify inbox to monitor technical emails | _[TBD]_ | _[TBD]_ | Completed |
| Beverly to have IAM team add VA Notify Admin email group to their mailing list | Beverly | _[TBD]_ | Completed |
| Document MPI certificate dependency as part of certificate tracking | _[TBD]_ | _[TBD]_ | Completed |
| Document that MPI, SSOi, and IAM are managed by the identity team for future escalation | _[TBD]_ | _[TBD]_ | Completed |

## Lessons Learned

1. Added Kyle and Jesse to the VANotify inbox to help monitor technical emails.
2. Beverly had the IAM team add the VA Notify Admin email group to their mailing list.
3. We will document this dependency as part of our certificate tracking.
4. Now we know that MPI, SSOi, and IAM are all managed by the identity team and know where to go to escalate issues.
