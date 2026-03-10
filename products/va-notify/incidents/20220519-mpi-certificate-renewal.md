# Incident Report: MPI Certificate Renewal Broke API Integration

**Date:** 2022-05-19 (incident occurred); 2022-05-25 (noticed)  
**Severity:** Medium  
**Status:** Resolved  
**Incident Commander:** _[TBD]_  
**Authors:** Dave

---

## Summary

On 2022-05-19, MPI renewed the certificates used for the VA Notify API integration without notifying the team. The issue was noticed on 2022-05-25 when a unit test for the MPI integration began failing. The error was: "MPI returned RequestException while querying for FHIR identifier". This prevented code from being committed to main in the API repo and blocked Staging testing for Strike team's 10-10 EZ in-progress notification and MHV push notifications.

## Timeline

| Time (ET) | Event |
|-----------|-------|
| 2022-05-19 | MPI renewed certificates in lower environments |
| 2022-05-25 | Issue noticed; unit test failing for MPI integration (user flow test with ICN) |
| 2022-05-25 | Reached out in #vsp-identity Slack channel |
| 2022-05-25 | Submitted Lower Environment Trouble Ticket (LETT) |
| 2022-06-02 | Certificates updated and fix deployed; production certificate change proactively addressed |

## Impact

- **Duration:** Approximately one week (2022-05-25 to 2022-06-02)
- **Affected channels:** API (Staging)
- **Estimated notifications affected:** _[TBD]_
- **Business lines affected:** Strike team (10-10 EZ in-progress notification), MHV (push notifications)

## Root Cause

MPI renewed the certificates used for the VA Notify API integration in lower environments on 2022-05-19. The team was not notified of the change, causing the MPI integration to fail with a `RequestException` when querying for FHIR identifiers.

## Resolution

Reached out in the #vsp-identity Slack channel. The identity team instructed the VA Notify team to submit a [Lower Environment Trouble Ticket (LETT)](https://dvagov.sharepoint.com/sites/OITEPMOIAM/Lists/IAM%20Environment%20Tasks/active.aspx). After submitting the [ticket](https://dvagov.sharepoint.com/sites/OITEPMOIAM/Lists/IAM%20Environment%20Tasks/Task/displayifs.aspx?List=2c2c3e9b%2D7e31%2D4548%2Db32b%2D6ab7b2cf7aee&ID=2807&Web=27f8cd5a%2D08fa%2D4fd9%2Da487%2D0c20f7da7076), the IAM team confirmed that certificates were updated on 5/19 in lower environments. VA Notify updated the certificates and deployed the fix. Production certificates were scheduled to change on 6/2, which the team was able to proactively address.

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add Kyle and Jesse to the VANotify inbox to monitor technical emails | | | Completed |
| Have IAM team add VA Notify Admin email group to their mailing list | Beverly | | Completed |
| Document MPI certificate dependency as part of certificate tracking | | | Completed |

## Lessons Learned

1. Added Kyle and Jesse to the VANotify inbox to help monitor technical emails.
2. Beverly had the IAM team add the VA Notify Admin email group to their mailing list.
3. We will document this dependency as part of our certificate tracking.
4. Now we know that MPI, SSOi, and IAM are all managed by the identity team and know where to go to escalate issues.
