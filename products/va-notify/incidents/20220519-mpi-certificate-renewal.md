# Incident Report: MPI Certificate Renewal

**Date of Incident:** 2022-05-19 (Noticed: 2022-05-25)  
**Severity:** Medium  
**Status:** Resolved  
**Reporter:** Dave  
**Resolution Date:** 2022-06-02  

---

## Summary

On 2022-05-19, MPI renewed their certificates used for the VA Notify API integration. The team was not notified of this change. The issue was noticed on 2022-05-25 when a unit test for the MPI integration began failing. On Staging, this prevented Strike team from testing their 10-10 EZ in progress notification and prevented MHV from testing push notifications.

## Timeline

| Date | Event |
|------|-------|
| 2022-05-19 | MPI renewed certificates in lower environments; incident begins |
| 2022-05-25 | Issue noticed — unit test failing for MPI integration (ICN user flow) |
| 2022-05-25 | Error observed: "MPI returned RequestException while querying for FHIR identifier" |
| ~2022-05-25 | Team reached out in #vsp-identity channel |
| ~2022-05-25 | Lower Environment Trouble Ticket submitted; identity team reached out via email |
| ~2022-06-01 | Certificates updated in lower environments and deployed |
| 2022-06-02 | Proactively updated Production certificates ahead of MPI's scheduled Production change |

## Impact

- **Duration:** ~1 week (2022-05-25 to 2022-06-02)
- **Environment affected:** Staging
- **System affected:** API
- **Affected channels:** Push notifications, in-progress notifications
- **Business lines affected:** Strike team (10-10 EZ in progress notification), MHV (push notifications)
- **Users impacted:** Unable to commit code to main in the API repo due to failing unit test; Staging testing blocked for Strike team and MHV

## Root Cause

MPI renewed their certificates used for the VA Notify API integration. The team was not aware of the certificate renewal or notified in advance. This caused the MPI integration to fail with: `MPI returned RequestException while querying for FHIR identifier`.

## Resolution

Reached out in the #vsp-identity channel. The identity team instructed the team to submit a Lower Environment Trouble Ticket. They followed up via email and confirmed that certificates were updated on 5/19 in the lower environments. The team updated the certificates and deployed the fix. Since Production was scheduled to change on 6/2, the team was able to proactively address that one day in advance.

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add Kyle and Jesse to the VANotify inbox to monitor technical emails | Team | | Completed |
| Have IAM team add the VA Notify Admin email group to their mailing list | Beverly | | Completed |
| Document MPI/SSOi/IAM certificate dependency as part of certificate tracking | Team | | Completed |

## Lessons Learned

1. Added Kyle and Jesse to the VANotify inbox to help monitor technical emails.
2. Beverly had the IAM team add the VA Notify Admin email group to their mailing list.
3. We will document this dependency as part of our certificate tracking.
4. Now we know that MPI, SSOi, and IAM are all managed by the identity team and know where to go to escalate issues.
