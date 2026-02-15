# Investigating Real 422 Errors - Form 21-4192

**Status:** 🚨 **ACTIVE INVESTIGATION**  
**Issue:** Monitoring shows users are unable to submit due to 422 errors  
**Date:** February 15, 2026  

---

## Current Situation

**Problem:** Production monitoring indicates users are encountering 422 (Unprocessable Entity) errors when attempting to submit Form 21-4192.

**Impact:** Users cannot complete form submissions, claims are blocked.

**Priority:** HIGH - Blocking user submissions

---

## Step 1: Query Datadog for Actual 422 Errors

### Find 422 Errors in Last 24 Hours

```
service:vets-api status:error "Form214192" "422"
```

**What to look for:**
- Error messages in the log details
- Field names mentioned in errors
- Frequency/pattern of errors
- Specific validation failures

### Find All Form 21-4192 Errors

```
service:vets-api status:error "Form214192"
```

**Filter by:**
- HTTP status code = 422
- Time range: Last 24 hours (or when errors started)

### Find Validation Errors Specifically

```
service:vets-api "Form214192" "ValidationErrors" OR "Validation Error"
```

---

## Step 2: Query Database for Failed Submissions

### Get Recent Failed Submissions

```sql
SELECT 
  fsa.id,
  fsa.saved_claim_id,
  fsa.form_type,
  fsa.aasm_state,
  fsa.failure_details,
  fsa.created_at,
  sc.confirmation_number
FROM form_submission_attempts fsa
JOIN saved_claims sc ON sc.id = fsa.saved_claim_id
WHERE fsa.aasm_state = 'failure'
  AND sc.form = '21-4192'
  AND fsa.created_at > NOW() - INTERVAL '24 hours'
ORDER BY fsa.created_at DESC
LIMIT 50;
```

**Look for patterns in `failure_details`:**
- What fields are mentioned?
- What validation rules are failing?
- Are there common error messages?

### Get Error Summary by Type

```sql
SELECT 
  failure_details,
  COUNT(*) as error_count,
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence
FROM form_submission_attempts
WHERE form_type = '21-4192'
  AND aasm_state = 'failure'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY failure_details
ORDER BY error_count DESC;
```

---

## Step 3: Examine Actual Request Payloads

### From Datadog Logs

1. Find a 422 error in Datadog
2. Click into the log details
3. Look for the request payload
4. Compare against expected schema

**Key questions:**
- What fields are present?
- What are the actual values?
- Are there missing required fields?
- Are there type mismatches?

### Example Analysis

If log shows:
```json
{
  "errors": [{
    "title": "Validation Error",
    "detail": "Veteran SSN is required",
    "source": {"pointer": "/veteranInformation/ssn"}
  }]
}
```

**Then we know:**
- SSN field is actually required (not optional)
- Field name: `veteranInformation.ssn`
- Error type: Missing required field

---

## Step 4: Identify Common Error Patterns

### Checklist of Things to Look For

Based on the error logs, check for:

#### Field Presence Errors
- [ ] Missing `veteranInformation.ssn`
- [ ] Missing `veteranInformation.fullName.first`
- [ ] Missing `veteranInformation.fullName.last`
- [ ] Missing `veteranInformation.dateOfBirth`
- [ ] Missing `employmentInformation.employerName`
- [ ] Missing `employmentInformation.employerEmail`
- [ ] Missing `employmentInformation.employerAddress`
- [ ] Missing `employmentInformation.typeOfWorkPerformed`
- [ ] Missing `employmentInformation.beginningDateOfEmployment`

#### Data Type Errors
- [ ] String sent where number expected
- [ ] Number sent where string expected
- [ ] Object structure mismatch

#### Format Errors
- [ ] SSN format (length, characters)
- [ ] Date format issues
- [ ] Email format issues
- [ ] Postal code format

#### Value Validation Errors
- [ ] Date logic (end before start)
- [ ] Date in future
- [ ] Invalid date values
- [ ] Negative numbers where positive required
- [ ] Out of range values

---

## Step 5: Test Locally to Reproduce

### Once You Identify the Error Pattern

Use the curl commands from **422_ERROR_TESTING_GUIDE.md** and modify them to match the actual error you found.

**Example:** If logs show "SSN length invalid":

```bash
curl -X POST https://staging-api.va.gov/v0/form214192 \
  -H 'Content-Type: application/json' \
  -H 'X-Key-Inflection: camel' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "veteranInformation": {
      "fullName": {"first": "John", "last": "Doe"},
      "ssn": "12345",
      "dateOfBirth": "1980-01-01"
    },
    "employmentInformation": {
      "employerName": "Acme Corp",
      "employerEmail": "hr@acme.com",
      "typeOfWorkPerformed": "Developer",
      "beginningDateOfEmployment": "2015-01-15"
    }
  }' -v
```

**Verify:** Does it produce the same 422 error?

---

## Step 6: Document Actual Error

### Create Error Report

Once you've identified the actual error, document:

1. **Error Pattern:** What exactly causes the 422?
2. **Frequency:** How often does it occur?
3. **User Impact:** What percentage of submissions fail?
4. **Request Example:** Sample payload that fails
5. **Response Example:** Actual 422 response received
6. **Root Cause:** Why is this happening?

### Example Error Report Template

```markdown
## Error #1: Missing SSN Field

**Frequency:** 15 occurrences in last 24 hours (5% of submissions)

**Request Payload:**
{
  "veteranInformation": {
    "fullName": {"first": "John", "last": "Doe"},
    // SSN field completely missing
    "dateOfBirth": "1980-01-01"
  }
}

**Response:**
HTTP 422
{
  "errors": [{
    "title": "Validation Error",
    "detail": "Veteran SSN is required",
    "source": {"pointer": "/veteranInformation/ssn"}
  }]
}

**Root Cause:** Frontend form allows progression without SSN entered

**Fix Needed:** Add SSN required validation on frontend
```

---

## Step 7: Immediate Actions

### While Investigating

1. **Monitor impact:**
   - Track error rate in real-time
   - Assess user impact percentage
   - Check if increasing or stable

2. **Communicate:**
   - Alert team in #benefits-optimization-aquia
   - Update stakeholders on investigation status
   - Provide ETA for fix

3. **Triage:**
   - If error rate > 10%: URGENT
   - If blocking all submissions: CRITICAL
   - If affecting specific user cohort: HIGH

### Quick Wins

If you find the error is:

**Missing required fields:**
- Add frontend validation immediately
- Deploy as hotfix

**Format issues (SSN, dates, email):**
- Add format validation on frontend
- Consider backend normalization

**Data type mismatches:**
- Fix type coercion in frontend
- Ensure proper JSON serialization

---

## Step 8: Validation Fix Workflow

Once you identify the actual 422 error:

1. **Add frontend validation** for that specific field/case
2. **Test locally** to ensure it prevents the error
3. **Deploy to staging**
4. **Verify in staging** that error no longer occurs
5. **Deploy to production**
6. **Monitor** to confirm error rate drops

---

## Monitoring During Investigation

### Real-Time Monitoring

**Datadog Dashboard:**
- Monitor error rate: `sum:api.form214192.failure{*}`
- Track submissions: `sum:api.form214192.success{*}`
- Calculate error %: `failures / (success + failures)`

**Alert if:**
- Error rate > 5%
- Zero successful submissions in last hour
- Spike in 422 errors

---

## Contact and Escalation

**Team:** Aquia (Benefits Intake Optimization)  
**Slack:** `#benefits-optimization-aquia`  
**Escalation:** Product Owner if error rate > 10% or blocking all submissions

**On-Call Rotation:** Check PagerDuty for current on-call engineer

---

## Investigation Log

### Template for Updates

**[Timestamp] - [Your Name]**
- Action taken:
- Findings:
- Next steps:

---

### Investigation Updates

**[2026-02-15 02:00 UTC] - Investigation Started**
- Monitoring shows 422 errors blocking user submissions
- Beginning Datadog and database analysis
- No specific error pattern identified yet

**[Add your updates below as investigation progresses]**

---

## Appendix: Common 422 Error Patterns

Based on typical form validation failures:

### Pattern 1: Missing Required Field
```
"detail": "[Field] is required"
```
**Fix:** Add required field validation on frontend

### Pattern 2: Invalid Format
```
"detail": "[Field] must be in [format] format"
```
**Fix:** Add format validation/transformation

### Pattern 3: Data Type Mismatch
```
"detail": "[Field] must be a [type]"
```
**Fix:** Ensure proper type coercion

### Pattern 4: Value Validation
```
"detail": "[Field] must be [condition]"
```
**Fix:** Add business logic validation

---

## Related Documentation

- **[422_ERROR_TESTING_GUIDE.md](./422_ERROR_TESTING_GUIDE.md)** - Curl commands for testing
- **[endpoint-monitoring.md](./collaboration-cycle/endpoint-monitoring.md)** - Monitoring setup
- **[VALIDATION_SUMMARY.md](./VALIDATION_SUMMARY.md)** - Validation requirements

---

**Status:** 🔍 IN PROGRESS  
**Last Updated:** February 15, 2026  
**Next Review:** After identifying actual error patterns
