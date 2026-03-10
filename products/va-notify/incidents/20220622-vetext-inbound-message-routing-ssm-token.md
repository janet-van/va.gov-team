# Incident Report: VEText Inbound Message Routing SSM Token Overwrite

**Date:** 2022-06-22 (Reported: 2022-06-27)  
**Severity:** _[TBD]_  
**Status:** Resolved  
**Incident Commander:** _[TBD]_  
**Authors:** _[TBD]_

---

## Summary

On 2022-06-22, the Check-in Experience team was not receiving responses to their texts because VEText was not receiving inbound messages. The issue was reported on 2022-06-27 by Shawn Adams from Check-in Experience (on Staging). The root cause was that a Terraform change to protect SSM tokens from being overwritten was not merged prior to the planned production deployment, causing the token in parameter store to be overwritten. Both Staging and Production environments were affected.

## Timeline

| Time (ET) | Event |
|-----------|-------|
| 2022-06-22 | Deployment to Production; SSM token overwritten due to missing Terraform change |
| 2022-06-27 | Issue reported by Shawn Adams (Check-in Experience) on Staging |
| 2022-06-27 | Token updated in parameter store (SSM); protective Terraform code merged |
| 2022-06-27 | Incident resolved (~2 hours after report) |

## Impact

- **Duration:** 2022-06-22 to 2022-06-27 (5 days undetected; ~2 hours to resolve after report)
- **Affected environments:** Staging and Production
- **Affected systems:** Public Endpoint - Reverse Proxy, inbound message routing to VEText
- **Estimated notifications affected:** _[TBD]_
- **Business lines affected:** Check-in Experience (VEText)
- **Users impacted:** Check-in Experience team was not receiving responses to texts; VEText was not receiving inbound messages.

## Root Cause

Code written in Terraform to ensure tokens are not overwritten in SSM (parameter store) was not merged prior to the planned deployment to Production on 2022-06-22. As a result, the SSM token was overwritten during deployment, breaking inbound message routing to VEText.

## Resolution

Updated the token in parameter store (SSM) and merged the missing Terraform code to prevent token overwrites going forward.

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Follow deployment process to prevent merging issues | | | Completed |
| Add post-deployment validation for inbound message routing | | | Completed |

## Lessons Learned

1. Follow the deployment process so we don't have merging issues.
2. Validate inbound message routing post-deployment.
