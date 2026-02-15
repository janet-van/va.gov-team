# Form 21-4192: 422 Error Schema Mismatch Analysis

**Form:** 21-4192 (Request for Employment Information in Connection with Claim for Disability Benefits)  
**Environment:** Staging (https://staging.va.gov)  
**API Endpoint:** POST /v0/form214192  
**Document Version:** 1.0  
**Last Updated:** February 15, 2026  

---

## Executive Summary

This document identifies potential schema mismatches that can cause HTTP 422 (Unprocessable Entity) errors when submitting Form 21-4192. These errors occur when the frontend sends data that doesn't match the backend validation schema.

**Key Finding:** Based on the test plan and endpoint documentation, there are several critical schema validation points where mismatches commonly occur:

1. **SSN Format Mismatch** - Most common 422 error
2. **Date Format Issues** - Second most common
3. **Required Field Violations**
4. **Data Type Mismatches**
5. **Nested Object Structure Issues**

---

## Understanding 422 Errors

**HTTP 422 Unprocessable Entity:**
- The request was well-formed but contains semantic errors
- The server understands the request but cannot process it due to schema validation failures
- Different from 400 (Bad Request) which indicates malformed syntax

**Expected Error Response Format:**
```json
{
  "errors": [
    {
      "title": "Validation Error",
      "detail": "Specific field error message",
      "status": "422",
      "source": {
        "pointer": "/data/attributes/fieldName"
      }
    }
  ]
}
```

---

## Schema Mismatch Scenarios

### 1. SSN Format Mismatch (MOST COMMON)

**Issue:** Frontend sends SSN with dashes, backend expects no dashes

**Test Case Reference:** TC-4192-VAL-002

**Correct Schema:**
```json
{
  "veteranInformation": {
    "ssn": "123456789"  // ✅ Correct: 9 digits, no dashes
  }
}
```

**Common Mismatch Scenarios:**

#### Scenario A: SSN with Dashes
```json
{
  "veteranInformation": {
    "ssn": "123-45-6789"  // ❌ WRONG: Contains dashes
  }
}
```

**Expected 422 Response:**
```json
{
  "errors": [{
    "title": "Validation Error",
    "detail": "SSN must be 9 digits with no dashes or special characters",
    "status": "422",
    "source": {
      "pointer": "/data/attributes/veteranInformation/ssn"
    }
  }]
}
```

#### Scenario B: SSN with Letters
```json
{
  "veteranInformation": {
    "ssn": "12A456789"  // ❌ WRONG: Contains letters
  }
}
```

#### Scenario C: SSN Wrong Length
```json
{
  "veteranInformation": {
    "ssn": "12345"  // ❌ WRONG: Too short
  }
}
```

**How to Reproduce:**
1. Navigate to veteran information page
2. Enter SSN with format: "123-45-6789"
3. Click Continue through to submission
4. Submit form
5. Observe 422 error in Network tab (DevTools)

**Root Cause:** Frontend validation allows dashes but backend strips/validates differently, or frontend doesn't validate properly before submission.

---

### 2. Date of Birth Format Mismatch

**Issue:** Inconsistent date format between frontend and backend

**Test Case Reference:** TC-4192-VAL-004

**Correct Schema:**
```json
{
  "veteranInformation": {
    "dateOfBirth": "1980-01-01"  // ✅ Correct: YYYY-MM-DD format (ISO 8601)
  }
}
```

**Common Mismatch Scenarios:**

#### Scenario A: MM/DD/YYYY Format
```json
{
  "veteranInformation": {
    "dateOfBirth": "01/01/1980"  // ❌ WRONG: US format, not ISO
  }
}
```

#### Scenario B: Invalid Date
```json
{
  "veteranInformation": {
    "dateOfBirth": "1980-13-32"  // ❌ WRONG: Invalid month/day
  }
}
```

#### Scenario C: Future Date
```json
{
  "veteranInformation": {
    "dateOfBirth": "2030-01-01"  // ❌ WRONG: Future date
  }
}
```

**Expected 422 Response:**
```json
{
  "errors": [{
    "title": "Validation Error",
    "detail": "Date of birth must be in YYYY-MM-DD format and cannot be in the future",
    "status": "422",
    "source": {
      "pointer": "/data/attributes/veteranInformation/dateOfBirth"
    }
  }]
}
```

**How to Reproduce:**
1. Fill form to veteran information page
2. Use browser console to modify date format:
   ```javascript
   // In browser console after filling date picker
   const dateInput = document.querySelector('[name*="dateOfBirth"]');
   dateInput.value = '01/01/1980'; // Force wrong format
   ```
3. Submit form
4. Observe 422 error

---

### 3. Employment Date Logic Mismatch

**Issue:** Ending date before beginning date, or dates in the future

**Test Case Reference:** TC-4192-VAL-004

**Correct Schema:**
```json
{
  "employmentInformation": {
    "beginningDateOfEmployment": "2015-01-15",  // ✅ Earlier date
    "endingDateOfEmployment": "2023-06-30"      // ✅ Later date
  }
}
```

**Mismatch Scenario:**
```json
{
  "employmentInformation": {
    "beginningDateOfEmployment": "2023-06-30",  // ❌ WRONG: After end date
    "endingDateOfEmployment": "2015-01-15"      // ❌ WRONG: Before start date
  }
}
```

**Expected 422 Response:**
```json
{
  "errors": [{
    "title": "Validation Error",
    "detail": "Ending date must be after beginning date",
    "status": "422",
    "source": {
      "pointer": "/data/attributes/employmentInformation"
    }
  }]
}
```

**How to Reproduce:**
1. Fill employment details page
2. Enter beginning date: "06/30/2023"
3. Enter ending date: "01/15/2015" (earlier)
4. Submit form
5. Observe 422 error

---

### 4. Missing Required Fields

**Issue:** Required fields are null, undefined, or empty strings

**Test Case Reference:** TC-4192-VAL-001

**Required Fields per Schema:**
```json
{
  "veteranInformation": {
    "fullName": {
      "first": "REQUIRED",
      "last": "REQUIRED"
      // middle is optional
    },
    "ssn": "REQUIRED (or vaFileNumber)",
    "dateOfBirth": "REQUIRED"
  },
  "employmentInformation": {
    "employerName": "REQUIRED",
    "employerAddress": "REQUIRED",
    "employerEmail": "REQUIRED",
    "typeOfWorkPerformed": "REQUIRED",
    "beginningDateOfEmployment": "REQUIRED"
  }
}
```

**Mismatch Scenarios:**

#### Scenario A: Empty String
```json
{
  "veteranInformation": {
    "fullName": {
      "first": "",  // ❌ WRONG: Empty string
      "last": "Doe"
    }
  }
}
```

#### Scenario B: Null Value
```json
{
  "veteranInformation": {
    "fullName": {
      "first": null,  // ❌ WRONG: Null
      "last": "Doe"
    }
  }
}
```

#### Scenario C: Missing Property
```json
{
  "veteranInformation": {
    "fullName": {
      // "first" property completely missing  ❌ WRONG
      "last": "Doe"
    }
  }
}
```

**Expected 422 Response:**
```json
{
  "errors": [{
    "title": "Validation Error",
    "detail": "Veteran first name is required",
    "status": "422",
    "source": {
      "pointer": "/data/attributes/veteranInformation/fullName/first"
    }
  }]
}
```

**How to Reproduce:**
1. Fill form but leave veteran first name blank
2. Use browser console to bypass frontend validation:
   ```javascript
   // Bypass frontend validation
   document.querySelector('form').noValidate = true;
   ```
3. Submit form
4. Observe 422 error

---

### 5. Email Format Validation

**Issue:** Invalid email format

**Test Case Reference:** TC-4192-VAL-003

**Correct Schema:**
```json
{
  "employmentInformation": {
    "employerEmail": "hr@acme.com"  // ✅ Valid email format
  }
}
```

**Mismatch Scenarios:**

#### Scenario A: Missing Domain
```json
{
  "employmentInformation": {
    "employerEmail": "test@"  // ❌ WRONG: No domain
  }
}
```

#### Scenario B: Invalid Format
```json
{
  "employmentInformation": {
    "employerEmail": "not-an-email"  // ❌ WRONG: No @ symbol
  }
}
```

#### Scenario C: Special Characters
```json
{
  "employmentInformation": {
    "employerEmail": "test@domain..com"  // ❌ WRONG: Double dots
  }
}
```

**Expected 422 Response:**
```json
{
  "errors": [{
    "title": "Validation Error",
    "detail": "Please enter a valid email address",
    "status": "422",
    "source": {
      "pointer": "/data/attributes/employmentInformation/employerEmail"
    }
  }]
}
```

**How to Reproduce:**
1. Navigate to employer information page
2. Enter invalid email: "invalid-email"
3. Bypass frontend validation if needed
4. Submit form
5. Observe 422 error

---

### 6. Numeric Field Type Mismatch

**Issue:** Numeric fields sent as strings or non-numeric values

**Test Case Reference:** TC-4192-VAL-005

**Correct Schema:**
```json
{
  "employmentInformation": {
    "amountEarnedLast12MonthsOfEmployment": 75000,  // ✅ Number type
    "hoursWorkedDaily": 8,                           // ✅ Number type
    "hoursWorkedWeekly": 40,                         // ✅ Number type
    "lastPaymentGrossAmount": 6250                   // ✅ Number type
  }
}
```

**Mismatch Scenarios:**

#### Scenario A: String Instead of Number
```json
{
  "employmentInformation": {
    "amountEarnedLast12MonthsOfEmployment": "75000",  // ❌ WRONG: String, not number
    "hoursWorkedDaily": "8"                            // ❌ WRONG: String, not number
  }
}
```

#### Scenario B: Negative Numbers
```json
{
  "employmentInformation": {
    "hoursWorkedDaily": -5  // ❌ WRONG: Negative value
  }
}
```

#### Scenario C: Non-Numeric Characters
```json
{
  "employmentInformation": {
    "amountEarnedLast12MonthsOfEmployment": "abc"  // ❌ WRONG: Letters
  }
}
```

**Expected 422 Response:**
```json
{
  "errors": [{
    "title": "Validation Error",
    "detail": "Amount earned must be a valid positive number",
    "status": "422",
    "source": {
      "pointer": "/data/attributes/employmentInformation/amountEarnedLast12MonthsOfEmployment"
    }
  }]
}
```

**How to Reproduce:**
1. Fill employment details page
2. Use browser console to force string type:
   ```javascript
   // Force string type on numeric field
   const amountInput = document.querySelector('[name*="amountEarned"]');
   Object.defineProperty(amountInput, 'value', {
     get: () => "75000",  // Return string instead of number
     configurable: true
   });
   ```
3. Submit form
4. Observe 422 error

---

### 7. Nested Object Structure Mismatch

**Issue:** Incorrect nesting or missing nested objects

**Correct Schema:**
```json
{
  "veteranInformation": {
    "fullName": {           // ✅ Correctly nested object
      "first": "John",
      "middle": "M",
      "last": "Doe"
    },
    "address": {            // ✅ Correctly nested object
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345"
    }
  }
}
```

**Mismatch Scenarios:**

#### Scenario A: Flat Structure Instead of Nested
```json
{
  "veteranInformation": {
    "firstName": "John",     // ❌ WRONG: Should be fullName.first
    "lastName": "Doe",       // ❌ WRONG: Should be fullName.last
    "street": "123 Main St"  // ❌ WRONG: Should be address.street
  }
}
```

#### Scenario B: Missing Nested Object
```json
{
  "veteranInformation": {
    "fullName": "John Doe"  // ❌ WRONG: Should be object with first/last
  }
}
```

**Expected 422 Response:**
```json
{
  "errors": [{
    "title": "Schema Validation Error",
    "detail": "Expected object at veteranInformation.fullName but received string",
    "status": "422",
    "source": {
      "pointer": "/data/attributes/veteranInformation/fullName"
    }
  }]
}
```

**How to Reproduce:**
1. Use API testing tool (Postman/curl) to send incorrect structure
2. POST to staging endpoint with flat structure
3. Observe 422 error

---

### 8. Optional vs Required Field Confusion

**Issue:** Treating optional fields as required or vice versa

**Optional Fields (per Test Plan):**
```json
{
  "veteranInformation": {
    "fullName": {
      "middle": "OPTIONAL"  // Middle name can be omitted
    },
    "address": "OPTIONAL"   // Entire address is optional
  },
  "employmentInformation": {
    "timeLostLast12MonthsOfEmployment": "OPTIONAL",
    "concessions": "OPTIONAL"
  }
}
```

**Mismatch Scenario:** Backend expects optional field to be completely omitted, but frontend sends empty string or null:

```json
{
  "veteranInformation": {
    "fullName": {
      "first": "John",
      "middle": "",         // ❌ Potential issue: empty string vs omitted
      "last": "Doe"
    }
  }
}
```

**Better Approach:**
```json
{
  "veteranInformation": {
    "fullName": {
      "first": "John",
      // middle omitted entirely ✅
      "last": "Doe"
    }
  }
}
```

**How to Reproduce:**
1. Fill form with only required fields
2. Check if optional fields send null/"" vs completely omitted
3. Compare frontend submission payload vs backend expected schema

---

## Testing Strategy to Reproduce 422 Errors

### Method 1: Browser DevTools (Easiest)

1. **Open Form in Staging:**
   - Navigate to: `https://staging.va.gov/disability/eligibility/special-claims/unemployability/submit-employment-information-form-21-4192/introduction`

2. **Fill Form Partially:**
   - Go through form pages normally

3. **Open Browser DevTools:**
   - Press F12 or Right-click → Inspect
   - Go to Network tab
   - Filter by "Fetch/XHR"

4. **Modify Form Data Before Submission:**
   ```javascript
   // In Console tab, before clicking Submit
   
   // Example: Force SSN with dashes
   const form = document.querySelector('form');
   const formData = new FormData(form);
   
   // Intercept the form submission
   const originalFetch = window.fetch;
   window.fetch = function(...args) {
     if (args[0].includes('form214192')) {
       console.log('Intercepted form submission');
       const body = JSON.parse(args[1].body);
       
       // Modify to cause 422 error
       body.veteranInformation.ssn = '123-45-6789';  // Add dashes
       
       args[1].body = JSON.stringify(body);
     }
     return originalFetch.apply(this, args);
   };
   ```

5. **Submit Form:**
   - Click final Submit button
   - Watch Network tab for 422 response

6. **Inspect Response:**
   - Click on the failed request
   - Go to Response tab
   - Read error details

---

### Method 2: Direct API Testing with Postman/curl

1. **Get Valid Form Data:**
   ```bash
   # Use test data from TEST_PLAN.md
   cat > valid_form214192.json << 'EOF'
   {
     "veteranInformation": {
       "fullName": {
         "first": "John",
         "middle": "M",
         "last": "Doe"
       },
       "ssn": "123456789",
       "dateOfBirth": "1980-01-01"
     },
     "employmentInformation": {
       "employerName": "Acme Corporation",
       "employerAddress": {
         "street": "456 Business Ave",
         "city": "Commerce City",
         "state": "CA",
         "postalCode": "54321"
       },
       "employerEmail": "hr@acme.com",
       "typeOfWorkPerformed": "Software Developer",
       "beginningDateOfEmployment": "2015-01-15"
     }
   }
   EOF
   ```

2. **Test Valid Submission (Baseline):**
   ```bash
   curl -X POST https://staging-api.va.gov/v0/form214192 \
     -H 'Content-Type: application/json' \
     -H 'X-Key-Inflection: camel' \
     -d @valid_form214192.json \
     -v
   ```

3. **Modify to Cause 422 (SSN with dashes):**
   ```bash
   # Create invalid version
   cat valid_form214192.json | \
     jq '.veteranInformation.ssn = "123-45-6789"' > \
     invalid_ssn.json
   
   curl -X POST https://staging-api.va.gov/v0/form214192 \
     -H 'Content-Type: application/json' \
     -H 'X-Key-Inflection: camel' \
     -d @invalid_ssn.json \
     -v
   ```

4. **Test Other Scenarios:**
   ```bash
   # Invalid date format
   cat valid_form214192.json | \
     jq '.veteranInformation.dateOfBirth = "01/01/1980"' > \
     invalid_date.json
   
   # Missing required field
   cat valid_form214192.json | \
     jq 'del(.veteranInformation.fullName.first)' > \
     missing_field.json
   
   # Invalid email
   cat valid_form214192.json | \
     jq '.employmentInformation.employerEmail = "not-an-email"' > \
     invalid_email.json
   ```

---

### Method 3: Frontend Code Inspection

**Recommended Approach:**

1. **Clone vets-website repository** (form frontend)
2. **Locate form 21-4192 configuration:**
   - Path: `src/applications/21-4192/`
   - Config file: `config/form.js`
   - Schema file: `config/schema.js`

3. **Compare Frontend Schema vs Backend:**
   - Frontend: `src/applications/21-4192/config/schema.js`
   - Backend: Look for `vets-api/app/controllers/v0/form214192_controller.rb`
   - Look for validation in: `vets-api/app/models/saved_claim/form214192.rb`

4. **Identify Mismatches:**
   - Different validation rules
   - Different field names (camelCase vs snake_case)
   - Different data types
   - Different required/optional status

---

## Common Schema Mismatch Locations Summary

| Field | Expected Format | Common Mistake | Test Case |
|-------|----------------|----------------|-----------|
| `veteranInformation.ssn` | `"123456789"` (string, 9 digits) | `"123-45-6789"` (with dashes) | TC-4192-VAL-002 |
| `veteranInformation.dateOfBirth` | `"1980-01-01"` (YYYY-MM-DD) | `"01/01/1980"` (MM/DD/YYYY) | TC-4192-VAL-004 |
| `employmentInformation.beginningDateOfEmployment` | `"2015-01-15"` (YYYY-MM-DD) | Future date or wrong format | TC-4192-VAL-004 |
| `employmentInformation.endingDateOfEmployment` | `"2023-06-30"` (YYYY-MM-DD) | Before beginning date | TC-4192-VAL-004 |
| `employmentInformation.employerEmail` | `"hr@acme.com"` (valid email) | `"invalid-email"` (no @) | TC-4192-VAL-003 |
| `employmentInformation.amountEarnedLast12MonthsOfEmployment` | `75000` (number) | `"75000"` (string) | TC-4192-VAL-005 |
| `veteranInformation.fullName.first` | `"John"` (non-empty string) | `""` or `null` | TC-4192-VAL-001 |
| `veteranInformation.fullName` | Object with first/last | String or flat structure | N/A |

---

## Expected Backend Validation Rules

Based on documentation review, the backend likely validates:

### 1. Type Validation
- All string fields must be strings
- All numeric fields must be numbers (not stringified numbers)
- All date fields must be ISO 8601 strings (YYYY-MM-DD)
- Nested objects must be objects (not strings or arrays)

### 2. Format Validation
- SSN: Exactly 9 digits, no dashes, no letters
- Email: Valid email format per RFC 5322
- Dates: ISO 8601 format, valid calendar dates
- Postal codes: Valid US format (5 digits or 5+4)
- Phone: Valid US phone format

### 3. Range Validation
- Dates cannot be in the future (except where appropriate)
- Employment ending date must be >= beginning date
- Numeric amounts must be positive
- Hours worked must be reasonable (e.g., 0-24 daily, 0-168 weekly)

### 4. Required Fields
- See section 4 above for complete list
- All required fields must be present and non-empty

### 5. Length Validation
- String fields likely have maximum lengths
- Text areas may have character limits
- Names may have reasonable length constraints

---

## Debugging Tips

### Viewing the 422 Error Details

**In Browser DevTools:**
1. Network tab → Find failed request
2. Click on it
3. Go to "Response" sub-tab
4. Look for JSON error details

**Example Error Response:**
```json
{
  "errors": [
    {
      "title": "Validation Error",
      "detail": "SSN must be 9 digits with no dashes",
      "status": "422",
      "source": {
        "pointer": "/data/attributes/veteranInformation/ssn"
      }
    }
  ]
}
```

**Key Fields to Check:**
- `detail`: Human-readable error message
- `source.pointer`: JSON path to the problematic field
- Multiple errors may be returned in the array

---

### Common Frontend-Backend Mismatches

**1. Key Inflection:**
- Frontend might use camelCase: `veteranInformation`
- Backend might expect snake_case: `veteran_information`
- Check `X-Key-Inflection: camel` header

**2. Data Type Serialization:**
- JavaScript numbers might stringify during JSON serialization
- Check `JSON.stringify()` behavior in form submission code

**3. Null vs Undefined vs Empty String:**
- Frontend: `undefined` field (omitted from object)
- Backend: May expect `null` or may reject empty strings
- Test with Postman to isolate the issue

**4. Date Picker Output:**
- Different date pickers output different formats
- Check browser console for actual value being submitted

---

## Actionable Next Steps

To identify the exact schema mismatch causing your 422 error:

1. **Reproduce the Error:**
   - Follow Method 1 (Browser DevTools) above
   - Submit form with intentionally malformed data

2. **Capture the Request Payload:**
   - In Network tab, right-click failed request
   - Copy → Copy as curl
   - Or copy the request payload JSON

3. **Capture the Response:**
   - Copy the 422 error response JSON
   - Note the `source.pointer` field

4. **Identify the Mismatch:**
   - Compare request field format vs response error
   - Check field in table above
   - Verify against TEST_PLAN.md schema

5. **Fix the Issue:**
   - If frontend bug: Fix validation or transformation
   - If backend bug: Update validation rules
   - If documentation issue: Update this document

---

## Related Documentation

- **Test Plan:** [TEST_PLAN.md](./TEST_PLAN.md) - Complete test cases including validation scenarios
- **Endpoint Monitoring:** [endpoint-monitoring.md](./collaboration-cycle/endpoint-monitoring.md) - API documentation
- **QA Standards:** [qa-standards.md](./collaboration-cycle/qa-standards.md) - Quality assurance standards
- **Silent Failures:** [qa7-silent-failures.md](./collaboration-cycle/qa7-silent-failures.md) - Failure handling

---

## Contact Information

**Team:** Aquia (Benefits Intake Optimization)  
**Slack Channel:** `#benefits-optimization-aquia`

For questions about schema validation or 422 errors, contact the team via Slack.

---

**Document Prepared By:** Engineering Analysis  
**Date:** February 15, 2026  
**Version:** 1.0
