# Form 21-4192: Actual 422 Error Testing Guide

**Form:** 21-4192 (Request for Employment Information in Connection with Claim for Disability Benefits)  
**Purpose:** Provide real curl commands to reproduce 422 errors  
**Date:** February 15, 2026  
**Status:** ⚠️ NEEDS TESTING

---

## Important Note

**User Feedback:** The theoretical scenarios documented previously did NOT produce 422 errors when tested.

This document provides curl commands that SHOULD trigger validation errors based on the API documentation, but **requires actual testing** to confirm which scenarios truly fail.

---

## Test Environment

**Staging API:** `https://staging-api.va.gov/v0/form214192`  
**Authentication:** Required (authenticated users)  
**Content-Type:** `application/json`  
**Header:** `X-Key-Inflection: camel` (for camelCase keys)

---

## Baseline: Valid Request

First, establish what a successful request looks like:

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
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
      "employerPhone": "5559876543",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15",
      "endingDateOfEmployment": "2023-06-30",
      "amountEarnedLast12MonthsOfEmployment": 75000,
      "hoursWorkedDaily": 8,
      "hoursWorkedWeekly": 40
    }
  }' \
  -v
```

**Expected Response:** HTTP 200 with confirmation number

---

## Test Scenarios to Reproduce 422 Errors

### Test 1: Completely Missing Required Field

**Hypothesis:** Missing required field should cause 422

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteranInformation": {
      "fullName": {
        "last": "Doe"
      },
      "ssn": "123456789",
      "dateOfBirth": "1980-01-01"
    },
    "employmentInformation": {
      "employerName": "Acme Corporation",
      "employerEmail": "hr@acme.com",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15"
    }
  }' \
  -v
```

**What's missing:** `veteranInformation.fullName.first`  
**Expected:** 422 error with message about missing first name

---

### Test 2: Empty String in Required Field

**Hypothesis:** Empty string in required field should cause 422

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteranInformation": {
      "fullName": {
        "first": "",
        "last": "Doe"
      },
      "ssn": "123456789",
      "dateOfBirth": "1980-01-01"
    },
    "employmentInformation": {
      "employerName": "Acme Corporation",
      "employerEmail": "hr@acme.com",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15"
    }
  }' \
  -v
```

**What's wrong:** `first` is empty string  
**Expected:** 422 error about empty first name

---

### Test 3: Invalid SSN Format (With Dashes)

**Hypothesis:** SSN with dashes might cause 422 (uncertain based on endpoint doc)

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteranInformation": {
      "fullName": {
        "first": "John",
        "last": "Doe"
      },
      "ssn": "123-45-6789",
      "dateOfBirth": "1980-01-01"
    },
    "employmentInformation": {
      "employerName": "Acme Corporation",
      "employerEmail": "hr@acme.com",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15"
    }
  }' \
  -v
```

**What's different:** SSN has dashes  
**Expected:** Unknown - endpoint doc shows example WITH dashes  
**Note:** User reported this does NOT cause 422

---

### Test 4: Invalid SSN Length

**Hypothesis:** Wrong SSN length should cause 422

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteranInformation": {
      "fullName": {
        "first": "John",
        "last": "Doe"
      },
      "ssn": "12345",
      "dateOfBirth": "1980-01-01"
    },
    "employmentInformation": {
      "employerName": "Acme Corporation",
      "employerEmail": "hr@acme.com",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15"
    }
  }' \
  -v
```

**What's wrong:** SSN only 5 digits  
**Expected:** 422 error about invalid SSN

---

### Test 5: Invalid Date Format

**Hypothesis:** Wrong date format should cause 422

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteranInformation": {
      "fullName": {
        "first": "John",
        "last": "Doe"
      },
      "ssn": "123456789",
      "dateOfBirth": "01/01/1980"
    },
    "employmentInformation": {
      "employerName": "Acme Corporation",
      "employerEmail": "hr@acme.com",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15"
    }
  }' \
  -v
```

**What's wrong:** Date in MM/DD/YYYY instead of YYYY-MM-DD  
**Expected:** 422 error about invalid date format  
**Note:** User reported this does NOT cause 422

---

### Test 6: Invalid Date (Non-existent)

**Hypothesis:** Invalid calendar date should cause 422

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteranInformation": {
      "fullName": {
        "first": "John",
        "last": "Doe"
      },
      "ssn": "123456789",
      "dateOfBirth": "1980-13-32"
    },
    "employmentInformation": {
      "employerName": "Acme Corporation",
      "employerEmail": "hr@acme.com",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15"
    }
  }' \
  -v
```

**What's wrong:** Month 13, day 32 don't exist  
**Expected:** 422 error about invalid date

---

### Test 7: Invalid Email Format

**Hypothesis:** Malformed email should cause 422

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteranInformation": {
      "fullName": {
        "first": "John",
        "last": "Doe"
      },
      "ssn": "123456789",
      "dateOfBirth": "1980-01-01"
    },
    "employmentInformation": {
      "employerName": "Acme Corporation",
      "employerEmail": "not-an-email",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15"
    }
  }' \
  -v
```

**What's wrong:** Email missing @ symbol  
**Expected:** 422 error about invalid email  
**Note:** User reported this does NOT cause 422

---

### Test 8: Wrong Data Type (String instead of Number)

**Hypothesis:** String in numeric field might cause 422

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteranInformation": {
      "fullName": {
        "first": "John",
        "last": "Doe"
      },
      "ssn": "123456789",
      "dateOfBirth": "1980-01-01"
    },
    "employmentInformation": {
      "employerName": "Acme Corporation",
      "employerEmail": "hr@acme.com",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15",
      "amountEarnedLast12MonthsOfEmployment": "seventy-five thousand"
    }
  }' \
  -v
```

**What's wrong:** Amount is text instead of number  
**Expected:** 422 error about invalid data type

---

### Test 9: Missing Employer Address (Required Object)

**Hypothesis:** Missing required nested object should cause 422

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteranInformation": {
      "fullName": {
        "first": "John",
        "last": "Doe"
      },
      "ssn": "123456789",
      "dateOfBirth": "1980-01-01"
    },
    "employmentInformation": {
      "employerName": "Acme Corporation",
      "employerEmail": "hr@acme.com",
      "typeOfWorkPerformed": "Software Developer",
      "beginningDateOfEmployment": "2015-01-15"
    }
  }' \
  -v
```

**What's missing:** `employerAddress` object  
**Expected:** 422 error about missing employer address

---

### Test 10: Wrong Root Structure

**Hypothesis:** Incorrect top-level keys should cause 422

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{
    "veteran": {
      "firstName": "John",
      "lastName": "Doe",
      "ssn": "123456789"
    },
    "employer": {
      "name": "Acme Corporation"
    }
  }' \
  -v
```

**What's wrong:** Completely wrong structure (flat instead of nested)  
**Expected:** 422 error about schema validation

---

## Testing Instructions

### Step 1: Get Authentication Token

You'll need a valid bearer token for staging. Contact the team for:
- Test user credentials
- API key
- Authentication method

### Step 2: Test Valid Request First

```bash
# Save valid payload
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
    "employerPhone": "5559876543",
    "typeOfWorkPerformed": "Software Developer",
    "beginningDateOfEmployment": "2015-01-15",
    "endingDateOfEmployment": "2023-06-30",
    "amountEarnedLast12MonthsOfEmployment": 75000,
    "hoursWorkedDaily": 8,
    "hoursWorkedWeekly": 40
  }
}
EOF

# Test it
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d @valid_form214192.json \
  -v
```

**Expected:** HTTP 200

### Step 3: Test Each Failure Scenario

Run each test scenario above and document:
- HTTP status code
- Response body
- Error message
- Whether it matches expected behavior

### Step 4: Document Actual Results

Update this document with:
- ✅ Scenarios that DO cause 422
- ❌ Scenarios that do NOT cause 422
- Actual error responses received

---

## Results Section (To Be Filled In)

### Confirmed 422 Errors

*Test each scenario and document which ones actually fail*

| Test # | Scenario | Status Code | Causes 422? | Error Message |
|--------|----------|-------------|-------------|---------------|
| 1 | Missing required field | ??? | ??? | ??? |
| 2 | Empty string | ??? | ??? | ??? |
| 3 | SSN with dashes | ??? | ❌ (user tested) | N/A |
| 4 | Invalid SSN length | ??? | ??? | ??? |
| 5 | Wrong date format | ??? | ❌ (user tested) | N/A |
| 6 | Invalid calendar date | ??? | ??? | ??? |
| 7 | Invalid email | ??? | ❌ (user tested) | ??? |
| 8 | Wrong data type | ??? | ??? | ??? |
| 9 | Missing nested object | ??? | ??? | ??? |
| 10 | Wrong structure | ??? | ??? | ??? |

---

## Key Findings

**Based on user testing:**
- ❌ SSN with dashes (123-45-6789) does NOT cause 422
- ❌ Date in MM/DD/YYYY format does NOT cause 422
- ❌ Invalid email format does NOT cause 422

**Conclusion:** Backend validation is more permissive than documented. The API likely:
- Accepts and normalizes SSN formats
- Parses various date formats
- Has lenient email validation

**Next Steps:**
1. Test remaining scenarios to find what ACTUALLY causes 422
2. Update documentation with confirmed behaviors
3. Provide accurate frontend validation guidance

---

## Alternative: Find Real Errors from Logs

If testing is not feasible, check production/staging logs:

```bash
# Look for actual 422 errors in monitoring
# Datadog query:
service:vets-api status:error "422" "form214192"
```

Review FormSubmissionAttempt table:
```sql
SELECT 
  failure_details,
  COUNT(*) as count
FROM form_submission_attempts
WHERE form_type = '21-4192'
  AND aasm_state = 'failure'
GROUP BY failure_details
ORDER BY count DESC;
```

---

## Contact

**Team:** Aquia (Benefits Intake Optimization)  
**Slack:** `#benefits-optimization-aquia`

If you successfully reproduce 422 errors, please share:
- Exact curl command
- Response received
- Any insights about validation logic

---

**Document Status:** ⚠️ DRAFT - Requires Testing  
**Last Updated:** February 15, 2026
