# RFC: Migrate IAM Users & User Groups to AWS Identity Center Users/Groups and Permission Sets

**Status:** Draft

**Authors:** Kyle A. Matheny (Kyle.Matheny@va.gov)

**Last Updated:** 2026-02-11

**Target Reviewers:** OCTO, Platform Security, Platform Engineering

**Decision Needed By:** *TBD*

---

## 1) Summary

This RFC proposes migrating from long-lived **IAM Users** and **IAM User Groups** to **AWS Identity Center** users/groups with **Permission Sets** for account/role access across our AWS accounts (today we have one, but that may not be the case in the future.) 
The end state eliminates IAM User credentials for humans, centralizes identity lifecycle management, standardizes permission provisioning, and improves auditability and security posture.

---

## 2) Motivation

### Current pain points (IAM Users / Groups)

* **Long-lived credentials** (access keys) increase blast radius and operational risk.
* **Inconsistent access patterns** (manual user creation, group drift).
* **Audit complexity** (permissions are team centric, instead of application centric).
* **Permissions sprawl** (group policies not consistently aligned with least privilege).

### Why Identity Center

* Centralized human access management that is group-based, application-specific, and account scoping.
* Role-based access via Permission Sets (no more policies attached to individual users).
* Stronger controls: MFA, session-based credentials, centralized assignments, and potential for easier offboarding.
* Cleaner compliance story (who has what access to what, and why).

---

## 3) Goals

* **Eliminate IAM Users for humans** (console and CLI) in all accounts.
* Replace **IAM User Groups** with **Identity Center Groups** mapped to **Permission Sets**.
* Standardize access patterns for:
  * Admin / break-glass
  * App team scoped access (RO, and RW permission sets)
* Implement least-privilege, documented permission boundaries and assignment governance.
* Provide a migration path that minimizes disruption and includes rollback strategies.

---

## 4) Non-Goals

* Migrating **workload identities** (EC2 instance profiles, IRSA roles, Lambda roles). These remain IAM Roles.
* Replacing our IdP. Long-term using an external IdP (such as EntraID) should be considered.

---

## 5) Background / Terminology

* **IAM Users/Groups:** AWS IAM Identity objects with optional access keys and group-attached policies.
* **AWS Identity Center:** AWS-managed identity and access service enabling centralized user/group access to accounts and apps.
* **Permission Sets:** Templates that define one or more IAM policies and session settings; provisioned as roles into target accounts.
* **Assignments:** Mappings between Identity Center users/groups and accounts with permission sets.

---

## 6) Current State (As-Is)

### Human access patterns

* Humans authenticate using:
  * IAM User + password (console) and/or
  * IAM access keys (CLI / automation)
* Authorization managed via IAM Groups and attached managed/inline policies.
* User groups are based on teams or projects

### Observed risks

* Access keys exist for humans.
* Group and User policies drift and "snowflake" accounts exist.

---

## 7) Proposed State (To-Be)

### Core design

1. **All human access**: AWS Identity Center user/group membership.
2. **All account access**: Permission Sets (provisioned roles) and assignments.
3. **No IAM Users for humans** (except tightly controlled break-glass, if required—see below).
4. **Group-based access** is the default; direct user assignment is the exception and must be justified.
5. **Groups are application centric** to keep permission sets least privileged.

### Identity source

* Option A: Identity Center internal directory (fastest start, least external dependency).
* Option B: External IdP federation (recommended for enterprise lifecycle), via SAML/OIDC + SCIM provisioning.

### Permission model

* Permission Sets are the canonical "roles" for humans:
```
dsva-vagov-<application>-<env>-ro
dsva-vagov-<application>-<env>-rw
dsva-vagov-Administrator
```

### Session and access controls

* Enforce MFA (IdP-side and/or Identity Center).
* Standard session duration defaults (e.g., 1–8 hours based on role).

---

## 8) Design Details

### 8.1 Group & Permission Set Mapping

**Principle:** Group membership grants eligibility; Permission Set defines permissions; assignment scopes to accounts.

* Groups represent **applications**, not necessarily teams. The goal is to make access reviews answer: Which humans can access or modify resources for *this app* in *this env*?"
* A group grants access only through **account-scoped assignments** to permission sets (no policies attached to groups).
* A person working on multiple apps joins multiple application groups; we avoid "mega groups" like `developers` that accumulate broad permissions.


**Governance rules**

* Default to **group-based assignments**; direct user assignments require an exception (ticket + time-bound).
* Each group must have a description containing:
  * An **owner** (app owner / service team) and a backup owner
  * A **membership policy** (who can be added and under what conditions)
* Access changes are handled as:
  * Join/leave application group
  * Create/update a permission set

**When a team-centric group is acceptable**

* Only for clearly shared/platform responsibilities that are not application-specific (e.g., `dsva-vagov-platform-admin`), and still scoped via assignments.

### 8.2 Policy strategy for Permission Sets

Permission Set policies can be composed of:

* AWS-managed policies (quick start, but often too broad).
* Customer-managed policies (preferred for least privilege and stability).

**Recommendation**

* Use customer-managed policy with versioning and peer review.
* Start with a small number of foundational permission sets.
* Attach **permission boundaries** to the provisioned roles.

### 8.3 Break-glass access

We need an emergency access method if Identity Center (or IdP) is unavailable.

Two common patterns:

1. **VAEC has root credentials** and can break-glass at any time as-is.
2. **Minimal number of IAM Users** (last resort), with MFA and strict monitoring.

**Recommendation:** Prefer an extremely limited set of IAM Users.

### 8.4 Account Bootstrapping and/or Baseline

New [and existing] accounts must be "Identity Center ready":

* Identity Center enabled.
* Baseline permission sets assigned.
* Central logging and monitoring enabled.

### 8.5 CLI Workflow

Target workflow for engineers and developers:

* Use `aws sso login` + named profiles (or tooling wrapper) to obtain short-lived credentials.
* Prefer role assumption via SSO-provisioned roles; no static access keys for humans.

(CI/CD automation should use OIDC federation to IAM Roles and not human SSO.)

---

## 9) Migration Plan

### Phase 0 — Discovery and Inventory

* Enumerate:
  * All IAM Users and last-used dates
  * All IAM Groups and attached policies
  * Access keys usage (humans vs automation)
  * Cross-account role assumption patterns
* Classify identities (personas):
  * Human interactive
  * Automation
  * Application

**Deliverable:** "IAM Identity Inventory" + rough mapping to permission sets.

### Phase 1 — Establish Identity Center Foundation

* Enable Identity Center.
* Configure identity source (internal directory).
* Create initial Identity Center groups aligned to applications and personas.
* Define baseline permission sets and policies.
* Assign to pilot accounts (non-prod first).

**Exit criteria:** Pilot users can access target accounts with SSO and perform required tasks.

### Phase 2 — Pilot Migration (Non-Prod)

* Select one platform team + one app team.
* Migrate their access from IAM User/Group to Identity Center groups + assignments.
* Validate:
  * Console access
  * CLI access
  * Day-to-day workflows (EKS, Terraform, etc.)
* Audit SSO role usage (via a dashboard, or other aggregated view).

**Exit criteria:** Pilot teams operate without IAM Users; no production impact.

### Phase 3 — Broad Rollout

* Migrate remaining non-prod accounts first, then prod accounts.
* Convert group-by-group:
  * Create/validate equivalent permission set
  * Assign group to accounts
  * User validation window
  * Disable IAM user console access (password reset)
  * Deactivate and delete access keys (after verification)
  * Delete unused IAM groups once no longer referenced

**Exit criteria:** All human users use Identity Center; IAM users removed/disabled.

### Phase 4 — Cleanup and Guardrails

* SCPs / preventive controls to block creation of IAM Users (except break-glass path).
* Continuous compliance checks (Config rules, periodic reports).
* Document onboarding/offboarding runbooks.

---

## 10) Backwards Compatibility & Rollback

### Rollback strategy (per phase)

* Phase 1–2: Keep IAM users active while piloting; rollback is simply reverting users to IAM workflows (logging in using IAM User instead of Identity Center).
* Phase 3: Use a controlled rollback:
  * If user blocked, temporarily re-enable IAM user.
  * Root cause, then re-migrate.

**Important:** Rollback should be the exception; minimize dual-running duration to reduce confusion.

---

## 11) Security, Compliance, and Audit

### Security improvements

* Eliminates long-lived user access keys for humans.
* Centralized MFA enforcement and session-based credentials.
* Reduced blast radius via tightly-scoped assignments.
* Easier least-privilege reviews of permission sets vs ad hoc group policies.

### Audit and logging

* Ensure CloudTrail captures SSO role sessions and API calls with clear identity attribution.
* Monitor:
  * High-privilege role assumptions
  * Break-glass usage
  * Permission set changes and assignments

### Controls / Guardrails

* Use Permission Boundaries to restrict IAM user creation and access key creation.
* Require peer review for changes to permission sets/policies.

---

## 12) Risks and Mitigations

| Risk                             | Impact      | Mitigation                                                          |
| -------------------------------- | ----------- | ------------------------------------------------------------------- |
| Policy mismatch blocks workflows | Medium-High | Pilot, staged rollout, pre-validation with real tasks               |
| Confusion during dual-running    | Medium-Low  | Keep dual-running short; clear cutover dates/communication          |
| SSO outage                       | High        | Break-glass + runbooks                                              |
| Over-broad permission sets       | High        | Least privilege reviews, customer-managed policy library, approvals |
| Account drift                    | Medium      | IaC for policies/permission sets + periodic audits                  |

---

## 13) Testing Plan

* Pre-migration tests:
  * Enumerate required actions per application, per persona.
  * Test in non-prod with representative workloads.
  * Support workflows + runbooks
* Post-migration validation:
  * Console + CLI access
  * Terraform plans/applies (where applicable)

---

## 14) Operational Plan

### Ownership

* Identity Center configuration: Platform Infrastructure Team (IST)
* Permission sets and policies: Platform IST + Security review
* Group lifecycle: Platform IST + OCTO

### Runbooks

* Onboarding: add user > group membership > verify account access
* Offboarding: remove user > verify no assignments > verify access revoked
* Emergency access: break-glass invocation and logging

---

## Appendix A: Suggested Baseline Permission Sets

* **Read-Only**: broad read-only across approved services, per application, per persona.
* **Read-Write**: read-only + write, per application, per persona.
* **Administrator**: full admin, limited to a small group.
* **Support**: limited access to Support for Identity Center requests

---

## Appendix B: Decommission Checklist for an IAM User

1. Confirm user has Identity Center access and can perform required tasks.
2. Disable console password.
3. Deactivate access keys (observe for breakage).
4. Remove from IAM groups.
5. Delete access keys after validation window.
6. Delete IAM user.
7. Document completion (ticket/change record).
