# Incident Report: VEText Inbound Message Routing Failure Due to Token Overwrite

**Date:** 2022-07-13  
**Severity:** _[TBD]_  
**Status:** Resolved  
**Incident Commander:** _[TBD]_  
**Authors:** _[TBD]_

---

## Summary

On 2022-07-13, inbound messages from Veterans could not be routed to VEText due to a token being overwritten during a Production deployment. Only 1 message was stuck in the queue attempting retries during this time. Reported by Rob from VEText. The issue was resolved the same day within minutes of being reported.

## Timeline

| Time (ET) | Event |
|-----------|-------|
| _[TBD]_ | Portal deployed to Production (Infra and Portal repos) |
| _[TBD]_ | Terraform scripts ran and overwrote SSM parameter store token with a newly generated key |
| _[TBD]_ | Issue reported by Rob from VEText |
| _[TBD]_ | Token updated in parameter store; incident resolved |

## Impact

- **Duration:** Same day; resolved within minutes of being reported
- **Affected channels:** Public Endpoint - Reverse Proxy, inbound message routing to VEText (Production)
- **Estimated notifications affected:** 1 message stuck in queue attempting retries
- **Business lines affected:** VEText live use cases

## Root Cause

Portal was deployed to Production (Infra and Portal repos). This update included Terraform changes to update the supporting ALBs in AWS. When deploying the Infra repo and running the updated Terraform scripts, the changes intended to prevent updates to the SSM parameter store key were not included in the deployment. As a result, Terraform overwrote the key with a newly generated key, breaking inbound message routing to VEText.

## Resolution

Updated the token in the SSM parameter store to restore inbound message routing.

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Review each other's deployment plans cross-team to call out potential issues and areas requiring validation | | | |
| Manually validate tokens on Staging and Prod after deployments until confidence is established that code will not overwrite tokens | | | |
| Rework deployment procedures for all repos to include better detail in release notes | | | |

## Lessons Learned

1. We need to review each other's deployment plans cross-team since we share repos to ensure we call out any potential issues and areas that require validation.
2. We need to manually validate this on Staging and Prod until we are confident the code will not overwrite our tokens.
3. We are in the process of reworking the deployment procedures for all repos to include better detail in release notes to fully understand what has been deployed to which environment. When this is completed, we will be able to better track changes across all environments for all teams and only deploy releases that have validated code from lower environments.
