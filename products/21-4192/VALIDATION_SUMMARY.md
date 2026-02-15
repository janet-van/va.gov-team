# Form 21-4192: Summary of 422 Error Fields and Validation Requirements

**Quick Reference Guide**  
**Last Updated:** February 15, 2026

---

## 🎯 Answer to "What fields cause 422 errors?"

### Critical Fields (Priority 1 - Fix First)

#### 1. **SSN** - `veteranInformation.ssn`
- **422 Error:** User enters `"123-45-6789"` (with dashes)
- **Backend expects:** `"123456789"` (9 digits, no dashes)
- **Frontend validation needed:** Strip dashes before submission
- **Code:**
  ```javascript
  const transformSSN = (input) => input.replace(/\D/g, '');
  ```

#### 2. **Date of Birth** - `veteranInformation.dateOfBirth`
- **422 Error:** User enters `"01/01/1980"` (US format)
- **Backend expects:** `"1980-01-01"` (ISO 8601)
- **Frontend validation needed:** Use ISO date picker, validate not future
- **Code:**
  ```javascript
  const validateDOB = (dob) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
    if (new Date(dob) > new Date()) return false;
    return true;
  };
  ```

#### 3. **Employment Dates** - `employmentInformation.beginningDateOfEmployment` & `endingDateOfEmployment`
- **422 Error:** End date before start date, or future dates
- **Backend expects:** ISO dates, end >= begin, not future
- **Frontend validation needed:** Cross-field validation
- **Code:**
  ```javascript
  const validateDates = (begin, end) => {
    if (new Date(end) < new Date(begin)) return false;
    if (new Date(begin) > new Date()) return false;
    return true;
  };
  ```

#### 4. **Required Fields** - Multiple
- **422 Error:** Empty strings `""` or `null` values
- **Backend expects:** Non-empty values
- **Fields affected:**
  - `veteranInformation.fullName.first` (required)
  - `veteranInformation.fullName.last` (required)
  - `veteranInformation.ssn` (required, or VA file number)
  - `employmentInformation.employerName` (required)
  - `employmentInformation.employerEmail` (required)
  - `employmentInformation.typeOfWorkPerformed` (required)
- **Frontend validation needed:** Check non-empty on blur and before submit

---

### Important Fields (Priority 2 - Fix Next)

#### 5. **Email** - `employmentInformation.employerEmail`
- **422 Error:** Invalid formats like `"test@"` or `"not-an-email"`
- **Backend expects:** Valid email format
- **Frontend validation needed:** Email regex validation
- **Code:**
  ```javascript
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  ```

#### 6. **Numeric Fields** - Multiple
- **422 Error:** Strings instead of numbers: `"75000"` vs `75000`
- **Backend expects:** Number type, not string
- **Fields affected:**
  - `employmentInformation.amountEarnedLast12MonthsOfEmployment`
  - `employmentInformation.hoursWorkedDaily`
  - `employmentInformation.hoursWorkedWeekly`
  - `employmentInformation.lastPaymentGrossAmount`
- **Frontend validation needed:** Convert strings to numbers before submit
- **Code:**
  ```javascript
  const transformNumeric = (data) => {
    data.amountEarnedLast12MonthsOfEmployment = 
      parseFloat(data.amountEarnedLast12MonthsOfEmployment);
    return data;
  };
  ```

---

## 🛠️ Quick Implementation Checklist

### Phase 1: Critical (Must Have)
- [ ] **SSN:** Strip dashes before submission (`input.replace(/\D/g, '')`)
- [ ] **Dates:** Ensure ISO 8601 format (`YYYY-MM-DD`)
- [ ] **Date Logic:** Validate end date >= begin date, no future dates
- [ ] **Required Fields:** Validate all required fields non-empty

### Phase 2: Important (Should Have)
- [ ] **Email:** Validate email format with regex
- [ ] **Numbers:** Convert string to number type before submission

### Phase 3: Polish (Nice to Have)
- [ ] **Optional Fields:** Remove empty optional fields before submission
- [ ] **Structure:** Ensure nested objects correct

---

## 📋 Pre-Submission Transformation Code

```javascript
// Complete pre-submission transformation
const prepareFormData = (formData) => {
  let data = { ...formData };
  
  // 1. Transform SSN (remove dashes)
  if (data.veteranInformation?.ssn) {
    data.veteranInformation.ssn = data.veteranInformation.ssn.replace(/\D/g, '');
  }
  
  // 2. Convert numeric fields from strings to numbers
  if (data.employmentInformation) {
    const emp = data.employmentInformation;
    if (emp.amountEarnedLast12MonthsOfEmployment) {
      emp.amountEarnedLast12MonthsOfEmployment = parseFloat(emp.amountEarnedLast12MonthsOfEmployment);
    }
    if (emp.hoursWorkedDaily) {
      emp.hoursWorkedDaily = parseFloat(emp.hoursWorkedDaily);
    }
    if (emp.hoursWorkedWeekly) {
      emp.hoursWorkedWeekly = parseFloat(emp.hoursWorkedWeekly);
    }
    if (emp.lastPaymentGrossAmount) {
      emp.lastPaymentGrossAmount = parseFloat(emp.lastPaymentGrossAmount);
    }
  }
  
  // 3. Remove empty optional fields
  const removeEmpty = (obj) => {
    Object.keys(obj).forEach(key => {
      if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        removeEmpty(obj[key]);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      }
    });
  };
  removeEmpty(data);
  
  return data;
};
```

---

## 📊 Quick Reference Table

| Field | Current Issue | Backend Expects | Fix Required |
|-------|--------------|-----------------|--------------|
| SSN | `"123-45-6789"` | `"123456789"` | Strip dashes |
| Date of Birth | `"01/01/1980"` | `"1980-01-01"` | ISO format |
| Employment Dates | End before begin | End >= begin | Cross-validation |
| First/Last Name | Empty string | Non-empty | Required check |
| Email | `"test@"` | Valid email | Regex validation |
| Amount Earned | `"75000"` (string) | `75000` (number) | Convert to number |
| Hours Worked | `"8"` (string) | `8` (number) | Convert to number |

---

## 🔗 Detailed Documentation

For complete implementation details, see:

1. **[FRONTEND_VALIDATION_REQUIREMENTS.md](./FRONTEND_VALIDATION_REQUIREMENTS.md)**
   - Complete validation code examples
   - Unit test examples
   - Step-by-step implementation guide

2. **[422_ERROR_ANALYSIS.md](./422_ERROR_ANALYSIS.md)**
   - Detailed error scenarios
   - How to reproduce each error
   - Testing strategies

3. **[TEST_PLAN.md](./TEST_PLAN.md)**
   - Complete test cases
   - Validation test cases (TC-4192-VAL-001 through TC-4192-VAL-005)

---

## 🚀 Getting Started

1. **Read this summary** to understand the critical issues
2. **Implement Phase 1** validations (SSN, dates, required fields)
3. **Test with curl** to verify 422 errors are prevented
4. **Implement Phase 2** validations (email, numeric)
5. **Add unit tests** for all validation rules
6. **Polish with Phase 3** (optional field handling)

---

**Team:** Aquia (Benefits Intake Optimization)  
**Slack:** `#benefits-optimization-aquia`
