# Incident Report: API Degradation Due to Client Notification Spike

**Date:** 2024-10-22  
**Severity:** High  
**Status:** Resolved  
**Incident Commander:**  
**Authors:** Kyle MacMillan

---

## Summary

On 2024-10-22, a client bug resulted in an extra 400,000–500,000 notification requests being sent in a short time span. The surge in requests per second caused a degraded state for VA Notify, with P50 response times climbing from ~65ms to over 650ms (10x normal). Degradation was observed for approximately 4 hours on 2024-10-22 and again on 2024-10-23, with conditions returning to normal throughout the day each time.

## Timeline

| Time (ET) | Event |
|-----------|-------|
| 2024-10-22 | Degradation first observed; P50 latency climbed from ~65ms to over 650ms |
| 2024-10-23 | Degradation recurred; concern raised with the client |
| 2024-10-23 | Client returned to expected notification request volume; service restored to normal |

## Impact

- **Duration:** ~4 hours of degradation across 2024-10-22 and 2024-10-23 (~2 days total to resolve)
- **Affected channels:** All SMS, Email, and Push requests at the API level (initial ingestion, API latency)
- **Estimated notifications affected:** 400,000–500,000 excess requests
- **Business lines affected:** All VA Notify clients

## Root Cause

A client had a bug that caused it to send an extra 400,000–500,000 notification requests in a short time span. The sustained increase in requests per second (reaching approximately 220 requests/second) exceeded the database's capacity, leading to degraded response times for the VA Notify API. The API itself could withstand the load, but the database could not.

## Resolution

The issue was resolved on 2024-10-23 after raising the concern with the client. The client returned to an expected level of notification requests, and service returned to normal.

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Set up [anomaly detection monitor](https://vanotify.ddog-gov.com/monitors/238103) to catch similar spikes | VA Notify team | — | Complete (monitor existed but did not behave as expected) |
| [Turn on RDS Performance Insights](https://github.com/department-of-veterans-affairs/vanotify-infra/releases/tag/v1.9.15) to better understand database slowdowns | VA Notify team | — | Complete |

## Lessons Learned

[Anomaly detection was set up](https://vanotify.ddog-gov.com/monitors/238103) to monitor for scenarios such as this, but it did not behave as expected. The team was aware that the database would struggle under heavier loads but was not sure of the exact threshold. It is now known that degradation can start to appear with a sustained 220 requests per second — the API is capable of withstanding it, but the database is not. [RDS Performance Insights has been enabled](https://github.com/department-of-veterans-affairs/vanotify-infra/releases/tag/v1.9.15) to better understand where database slowdowns are occurring and to inform future capacity planning work.
