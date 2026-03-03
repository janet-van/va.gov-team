# Refillability vs. Renewability Specification: Data Mapping Comparison

## Overview

This document analyzes how the [Oracle Health Refillability Specification](oracle_health_refillability_spec.md) and the [Oracle Health Renewability Specification](oracle_health_renewability_spec.md) map the same underlying FHIR data differently to reach their respective eligibility decisions.

Both specifications use the same source data model — `MedicationRequest`, `MedicationDispense`, and related FHIR resources — but apply different logic and ordering to determine whether a medication is eligible for **refill** vs. **renewal**.

---

## Side-by-Side Gate Comparison

| Gate | Refillability                                                                  | Renewability                                                                      |
| ---- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 1    | Medication Classification: must be VA Prescription AND not DoD                 | `MedicationRequest.status == 'active'`                                            |
| 2    | `MedicationRequest.status == 'active'`                                         | Medication Classification: must be VA Prescription                                |
| 3    | `validityPeriod.end` exists AND current date ≤ `validityPeriod.end`               | `MedicationDispense` count > 0                                                |
| 4    | Refills remaining > 0                                                          | `validityPeriod.end` must exist                                                   |
| 5    | Rx# assigned by pharmacy                                                       | Current date ≤ `validityPeriod.end` + 120 days (within renewal window)            |
| 6    | `MedicationDispense` count > 0                                                 | Refills remaining == 0 OR prescription is expired                                 |
| 7    | Most recent `MedicationDispense.status` NOT `preparation`/`in-progress`/`on-hold` | No pending `Task` (web/mobile refill request) AND no `MedicationDispense.status` of `in-progress`/`preparation` |
| 8    | No pending `Task` resource (refill_status != 'submitted')                      | _(no gate 8)_                                                                     |

---

## Key Differences in Data Mapping

### 1. Gate Order: Classification vs. Status

The two specs prioritize their first eligibility check differently:

- **Refillability** checks **medication classification** first (Gate 1), then **MedicationRequest status** (Gate 2).
- **Renewability** checks **MedicationRequest status** first (Gate 1), then **medication classification** (Gate 2).

Both use the same data fields (`MedicationRequest.category`, `intent`, `reportedBoolean`, `MedicationRequest.status`), but the order in which these fields are evaluated produces different early-exit behavior: a non-VA medication fails refillability before its status is checked, while a non-active prescription fails renewability before its category is checked.

---

### 2. Expiration Logic Is Inverted

This is the most significant difference. The two specs treat the `validityPeriod.end` field in opposite ways:

| Field                                          | Refillability                          | Renewability                                          |
| ---------------------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| `MedicationRequest.dispenseRequest.validityPeriod.end` | Must exist AND current date ≤ end date | Must exist; current date may be up to 120 days past end date |

- **Refillability** requires the prescription to be **not expired** — an expired prescription cannot be refilled.
- **Renewability** permits **recently expired** prescriptions — those expired within the last 120 days are still renewable.

The renewability spec also separates the existence check (`validityPeriod.end` must exist — Gate 4) from the window check (within 120 days — Gate 5), treating them as distinct data validations. The refillability spec combines both concerns into a single gate (Gate 3).

---

### 3. Refills Remaining Logic Is Inverted

The refills remaining calculation uses the same formula in both specs:

```
refills_remaining = numberOfRepeatsAllowed - max(completed_dispenses - 1, 0)
```

However, the eligibility condition it maps to is opposite:

| Refills Remaining | Refillability        | Renewability                                        |
| ----------------- | -------------------- | --------------------------------------------------- |
| > 0               | ✓ Passes (refillable) | ✗ Fails (should refill instead, unless expired)    |
| == 0              | ✗ Fails (not refillable) | ✓ Passes (renewal path)                        |

For renewability, the spec adds an important override: a prescription that **is expired** passes Gate 6 regardless of refills remaining, because refills cannot be processed on an expired prescription.

---

### 4. Rx# Gate: Present in Refillability Only

The refillability spec includes a dedicated gate (Gate 5) requiring the prescription to have been assigned an Rx# by pharmacy before it can be refilled. The renewability spec has no equivalent gate.

| Data Point           | Refillability | Renewability |
| -------------------- | ------------- | ------------ |
| Rx# assigned         | Required (Gate 5) | Not required |

This difference reflects the operational distinction: refilling requires the pharmacy to have already processed the original order and assigned a tracking number, while renewals are a new prescription request and do not depend on prior pharmacy processing of the same order.

---

### 5. Dispense History Check Appears at Different Gates

Both specs require at least one `MedicationDispense` resource, but this check occurs at different points:

- **Refillability**: Gate 6 (after Rx#, classification, status, expiration, and refills checks)
- **Renewability**: Gate 3 (before expiration and refills checks)

The underlying data field (`MedicationDispense` count) is the same, but the placement affects which prescriptions are evaluated further: renewability eliminates never-dispensed medications earlier in the flow.

---

### 6. In-Progress Dispense Check: Scope Differs

Both specs block processing when a dispense is actively in progress, but they differ in scope:

| Aspect                        | Refillability (Gate 7)                                     | Renewability (Gate 7)                                      |
| ----------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| Which dispenses are checked   | **Most recent** dispense only                              | **Any** dispense                                           |
| Blocking statuses             | `preparation`, `in-progress`, `on-hold`                   | `in-progress`, `preparation` (on-hold not listed)          |
| Data source for "pending refill" | Separate gate (Gate 8): `Task` resource with intent='order', status='requested' | Combined into Gate 7: checks for any web/mobile refill request |

Refillability uses a dedicated `Task` resource lookup to detect pending refill requests (Gate 8), while renewability folds this check into Gate 7 alongside the in-progress dispense check.

---

### 7. DoD Medication Handling

- **Refillability (Gate 1)**: Explicitly excludes DoD medications as a named condition alongside the VA Prescription requirement.
- **Renewability (Gate 2)**: Does not mention DoD medications explicitly; DoD medications would fail the VA Prescription classification check implicitly.

---

## Summary of Mapping Differences

| Data Field / Concept                          | Refillability Mapping                             | Renewability Mapping                                         |
| --------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Medication classification check position      | Gate 1 (first)                                    | Gate 2 (second)                                              |
| `MedicationRequest.status` check position     | Gate 2                                            | Gate 1 (first)                                               |
| `validityPeriod.end` existence                | Combined with expiration in Gate 3                | Separate Gate 4                                              |
| Expiration (`validityPeriod.end` vs. today)   | Must NOT be expired (Gate 3)                      | May be expired ≤ 120 days (Gate 5)                           |
| Refills remaining                             | Must be > 0 (Gate 4)                              | Must be == 0, or prescription expired (Gate 6)               |
| Rx# assigned by pharmacy                      | Required (Gate 5)                                 | Not evaluated                                                |
| `MedicationDispense` count check position     | Gate 6                                            | Gate 3                                                       |
| In-progress dispense scope                    | Most recent dispense only                         | Any dispense                                                 |
| On-hold dispense blocks                       | Yes (Gate 7)                                      | Not listed                                                   |
| Pending refill request detection              | Dedicated Gate 8: `Task` with `intent='order'`, `status='requested'` | Folded into Gate 7: any pending web/mobile refill request    |
| DoD medication exclusion                      | Explicit (Gate 1)                                 | Implicit via VA Prescription classification (Gate 2)         |
| Uncategorized medications                     | Fails Gate 1 ("any other category")               | Explicitly NOT RENEWABLE (Gate 2)                            |
| Total gate count                              | 8                                                 | 7                                                            |

---

## Related Specifications

- [Oracle Health Medications - Categorization and Filtering Specification](oracle_health_categorization_spec.md)
- [Oracle Health VA Dispensed Medications - Refillability Specification](oracle_health_refillability_spec.md)
- [Oracle Health VA Dispensed Medications - Renewability Specification](oracle_health_renewability_spec.md)
