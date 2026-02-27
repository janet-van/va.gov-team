# 21P-530a Edge Case Test Data

## Purpose
This document contains edge case test data for validating downstream services when testing the State/Tribal Organization Application for Interment Allowance (VA Form 21P-530a) on staging.

## Test Cases for Validation

### Edge Case 1: Special Characters in Name Fields
**Organization/Contact Name:** O'Brien-McDonald & Associates, Inc.
**Street Address:** 123 St. Mary's Boulevard, Suite #456
**City:** Winston-Salem
**State:** NC
**ZIP:** 27101-1234
**Phone:** (555) 123-4567

**Expected Validation:** System should accept hyphens, apostrophes, ampersands, and common punctuation in organization names and addresses.

---

### Edge Case 2: Maximum Length Fields
**Organization/Contact Name:** The Comprehensive Veterans Memorial Cemetery and Burial Services Foundation of North America
**Street Address:** 1234567890 Extraordinarily Long Street Name Avenue Building Complex Tower
**City:** Lake Chargoggagoggmanchauggagoggchaubunagungamaugg
**State:** MA
**ZIP:** 01234-5678
**Phone:** (555) 987-6543

**Expected Validation:** System should handle maximum allowed field lengths and provide appropriate error messages if exceeded.

---

### Edge Case 3: Minimum/Single Character Entries
**Organization/Contact Name:** A
**Street Address:** 1 B
**City:** X
**State:** NY
**ZIP:** 10001
**Phone:** (555) 111-1111

**Expected Validation:** System should accept minimal but valid entries or provide clear minimum requirements.

---

### Edge Case 4: Native American/Tribal Organization
**Organization/Contact Name:** Navajo Nation Veterans Cemetery Authority
**Street Address:** HC 63 Box 1
**City:** Window Rock
**State:** AZ
**ZIP:** 86515
**Phone:** (928) 555-0123

**Expected Validation:** System should properly handle tribal organization names and rural route addresses.

---

### Edge Case 5: Numeric and Special Patterns in Address
**Organization/Contact Name:** State Cemetery District 42
**Street Address:** 1000 N 1st Avenue & 2nd Street
**City:** St. Paul
**State:** MN
**ZIP:** 55101-1234
**Phone:** (651) 555-9999

**Expected Validation:** System should handle numeric patterns in organization names and multiple street identifiers.

---

### Edge Case 6: PO Box Address
**Organization/Contact Name:** Rural County Veterans Memorial Association
**Street Address:** PO Box 12345
**City:** Remote
**State:** AK
**ZIP:** 99501
**Phone:** (907) 555-2468

**Expected Validation:** System should accept PO Box as valid mailing address.

---

### Edge Case 7: International Characters (if applicable)
**Organization/Contact Name:** José María Veterans Cemetery
**Street Address:** 789 Cañon Road
**City:** Santa Fe
**State:** NM
**ZIP:** 87501
**Phone:** (505) 555-3579

**Expected Validation:** System should handle or properly reject international/accented characters based on requirements.

---

### Edge Case 8: Multiple Word State Names
**Organization/Contact Name:** West Virginia Veterans Cemetery Commission
**Street Address:** 456 Mountain View Drive
**City:** Charleston
**State:** WV
**ZIP:** 25301-2345
**Phone:** (304) 555-7890

**Expected Validation:** System should properly handle state names with multiple words in dropdown/selection fields.

---

### Edge Case 9: Territory Address
**Organization/Contact Name:** Puerto Rico Veterans Memorial Cemetery
**Street Address:** 1000 Calle Principal
**City:** San Juan
**State:** PR
**ZIP:** 00901
**Phone:** (787) 555-4321

**Expected Validation:** System should accept US territories as valid states.

---

### Edge Case 10: Leading/Trailing Spaces and Case Sensitivity
**Organization/Contact Name:**  State Veterans Cemetery Board  
**Street Address:**  123 MAIN STREET  
**City:**  anytown  
**State:** TX
**ZIP:** 75001
**Phone:** (214) 555-8888

**Expected Validation:** System should trim whitespace and handle various case patterns appropriately.

---

## Additional Validation Scenarios

### Veteran Information Section
- **Deceased Veteran Name:** Test cases with Jr., Sr., III, etc.
- **SSN/File Number:** Validation of proper format (XXX-XX-XXXX)
- **Date of Death:** Past dates, recent dates, edge of month/year boundaries
- **Place of Death:** Various formats (Hospital name, City/State, Country if overseas)

### Burial Information
- **Cemetery Name:** Various cemetery naming patterns
- **Date of Burial:** Relationship to date of death validation
- **Plot/Section Numbers:** Alphanumeric combinations

### Claimant Information
- **Relationship to Veteran:** All available options should be tested
- **Multiple Claimants:** If applicable, test with multiple parties

### Financial Information
- **Amount Requested:** Various dollar amounts including cents
- **Payment Method:** Direct deposit vs. check
- **Bank Information:** Routing and account number validation

## Testing Notes

1. Test each edge case individually first
2. Then test combinations of edge cases in a single submission
3. Verify error messages are clear and actionable
4. Confirm successful submissions generate proper confirmation
5. Validate downstream processing in Lighthouse and CMP systems
6. Check that data appears correctly in backend systems

## Expected System Behavior

- All submissions should either succeed with confirmation number OR
- Fail with clear, specific error messages indicating what needs correction
- No silent failures or unclear error states
- Proper validation should occur both client-side and server-side

## Test Execution Tracking

| Test Case | Date Tested | Tester | Result | Notes |
|-----------|-------------|---------|--------|-------|
| Edge Case 1 | | | | |
| Edge Case 2 | | | | |
| Edge Case 3 | | | | |
| Edge Case 4 | | | | |
| Edge Case 5 | | | | |
| Edge Case 6 | | | | |
| Edge Case 7 | | | | |
| Edge Case 8 | | | | |
| Edge Case 9 | | | | |
| Edge Case 10 | | | | |

## Related Links

- [Staging Form](https://staging.va.gov/forms/21p-530a/submit-state-interment-allowance-request/)
- [Production Form](https://www.va.gov/forms/21p-530a/submit-state-interment-allowance-request/)
- [21P-530a Tracker](21P-530a-tracker.md)
- [Staging Test Accounts](../../products/burials-memorials/burial-allowance/530-staging-test-accounts.md)
