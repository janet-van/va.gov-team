const fs = require('fs');
const path = require('path');

const FEEDBACK_SCHEMA_VERSION = '1.0.0';
const SUPPORTED_ACTIONS = new Set(['add', 'remove', 'replace']);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toIssue({
  severity = 'error',
  code,
  message,
  correctionIndex = null,
}) {
  return {
    severity,
    code,
    message,
    correction_index: correctionIndex,
  };
}

function isIsoDateString(value) {
  if (typeof value !== 'string' || value.trim().length === 0) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function normalizeCorrection(rawCorrection) {
  return {
    review_id:
      typeof rawCorrection.review_id === 'string' && rawCorrection.review_id.trim().length > 0
        ? rawCorrection.review_id.trim()
        : null,
    finding_uid: String(rawCorrection.finding_uid || '').trim(),
    action: String(rawCorrection.action || '').trim(),
    dimension: String(rawCorrection.dimension || '').trim(),
    label: String(rawCorrection.label || '').trim(),
    replaced_label:
      typeof rawCorrection.replaced_label === 'string' && rawCorrection.replaced_label.trim().length > 0
        ? rawCorrection.replaced_label.trim()
        : null,
    reviewer:
      typeof rawCorrection.reviewer === 'string' && rawCorrection.reviewer.trim().length > 0
        ? rawCorrection.reviewer.trim()
        : null,
    reviewed_at:
      typeof rawCorrection.reviewed_at === 'string' && rawCorrection.reviewed_at.trim().length > 0
        ? rawCorrection.reviewed_at.trim()
        : null,
    notes:
      typeof rawCorrection.notes === 'string' && rawCorrection.notes.trim().length > 0
        ? rawCorrection.notes.trim()
        : null,
  };
}

function validateFeedbackDataset(dataset, { allowedDimensions = [] } = {}) {
  const errors = [];
  const warnings = [];
  const corrections = [];
  const dimensions = new Set(allowedDimensions || []);
  const dimensionCounts = {};
  const actionCounts = {};

  if (!isPlainObject(dataset)) {
    return {
      valid: false,
      schema_version: null,
      corrections: [],
      errors: [toIssue({ code: 'FEEDBACK_INVALID_ROOT', message: 'Feedback payload must be a JSON object.' })],
      warnings: [],
      summary: {
        records_total: 0,
        records_valid: 0,
        records_invalid: 0,
        dimensions: {},
        actions: {},
      },
    };
  }

  const schemaVersion = dataset.schema_version;
  if (schemaVersion !== FEEDBACK_SCHEMA_VERSION) {
    errors.push(
      toIssue({
        code: 'FEEDBACK_SCHEMA_VERSION_UNSUPPORTED',
        message: `Unsupported schema_version "${String(schemaVersion)}". Expected "${FEEDBACK_SCHEMA_VERSION}".`,
      }),
    );
  }

  if (!Array.isArray(dataset.corrections)) {
    errors.push(
      toIssue({
        code: 'FEEDBACK_CORRECTIONS_NOT_ARRAY',
        message: 'The "corrections" field must be an array.',
      }),
    );
  } else {
    for (const [index, rawCorrection] of dataset.corrections.entries()) {
      if (!isPlainObject(rawCorrection)) {
        errors.push(
          toIssue({
            code: 'FEEDBACK_CORRECTION_INVALID',
            message: 'Each correction must be an object.',
            correctionIndex: index,
          }),
        );
        continue;
      }

      const correction = normalizeCorrection(rawCorrection);
      let isValid = true;

      if (!correction.finding_uid) {
        errors.push(
          toIssue({
            code: 'FEEDBACK_MISSING_FINDING_UID',
            message: 'Correction is missing finding_uid.',
            correctionIndex: index,
          }),
        );
        isValid = false;
      }

      if (!SUPPORTED_ACTIONS.has(correction.action)) {
        errors.push(
          toIssue({
            code: 'FEEDBACK_INVALID_ACTION',
            message: `Unsupported correction action "${correction.action}".`,
            correctionIndex: index,
          }),
        );
        isValid = false;
      }

      if (!correction.dimension) {
        errors.push(
          toIssue({
            code: 'FEEDBACK_MISSING_DIMENSION',
            message: 'Correction is missing dimension.',
            correctionIndex: index,
          }),
        );
        isValid = false;
      } else if (dimensions.size > 0 && !dimensions.has(correction.dimension)) {
        errors.push(
          toIssue({
            code: 'FEEDBACK_UNKNOWN_DIMENSION',
            message: `Dimension "${correction.dimension}" is not in active taxonomy profile.`,
            correctionIndex: index,
          }),
        );
        isValid = false;
      }

      if (!correction.label) {
        errors.push(
          toIssue({
            code: 'FEEDBACK_MISSING_LABEL',
            message: 'Correction is missing label.',
            correctionIndex: index,
          }),
        );
        isValid = false;
      }

      if (correction.action === 'replace' && !correction.replaced_label) {
        errors.push(
          toIssue({
            code: 'FEEDBACK_REPLACE_MISSING_REPLACED_LABEL',
            message: 'Correction action "replace" requires replaced_label.',
            correctionIndex: index,
          }),
        );
        isValid = false;
      }

      if (correction.reviewed_at && !isIsoDateString(correction.reviewed_at)) {
        warnings.push(
          toIssue({
            severity: 'warning',
            code: 'FEEDBACK_REVIEWED_AT_NON_ISO',
            message: 'reviewed_at is not a valid ISO-like date string.',
            correctionIndex: index,
          }),
        );
      }

      if (!isValid) continue;
      corrections.push(correction);
      dimensionCounts[correction.dimension] = (dimensionCounts[correction.dimension] || 0) + 1;
      actionCounts[correction.action] = (actionCounts[correction.action] || 0) + 1;
    }
  }

  return {
    valid: errors.length === 0,
    schema_version: schemaVersion || null,
    corrections,
    errors,
    warnings,
    summary: {
      records_total: Array.isArray(dataset.corrections) ? dataset.corrections.length : 0,
      records_valid: corrections.length,
      records_invalid: Array.isArray(dataset.corrections)
        ? dataset.corrections.length - corrections.length
        : 0,
      dimensions: dimensionCounts,
      actions: actionCounts,
    },
  };
}

function buildEmptyIngestionResult({ mode, filePath }) {
  return {
    mode,
    enabled: false,
    loaded: false,
    source_file: filePath || null,
    schema_version: null,
    corrections: [],
    summary: {
      records_total: 0,
      records_valid: 0,
      records_invalid: 0,
      dimensions: {},
      actions: {},
    },
    errors: [],
    warnings: [],
  };
}

function loadReviewFeedback({
  filePath = '',
  mode = 'off',
  allowedDimensions = [],
} = {}) {
  if (mode === 'off') {
    return buildEmptyIngestionResult({ mode, filePath });
  }

  if (!filePath) {
    const result = buildEmptyIngestionResult({ mode, filePath });
    result.errors.push(
      toIssue({
        code: 'FEEDBACK_FILE_REQUIRED',
        message: `Mode "${mode}" requires --review-feedback-file.`,
      }),
    );
    if (mode === 'strict') {
      throw new Error(result.errors.map(issue => issue.message).join(' '));
    }
    result.enabled = true;
    return result;
  }

  const absolutePath = path.resolve(filePath);
  const base = {
    mode,
    enabled: true,
    loaded: false,
    source_file: absolutePath,
    schema_version: null,
    corrections: [],
    summary: {
      records_total: 0,
      records_valid: 0,
      records_invalid: 0,
      dimensions: {},
      actions: {},
    },
    errors: [],
    warnings: [],
  };

  if (!fs.existsSync(absolutePath)) {
    base.errors.push(
      toIssue({
        code: 'FEEDBACK_FILE_NOT_FOUND',
        message: `Feedback file not found: ${absolutePath}`,
      }),
    );
    if (mode === 'strict') {
      throw new Error(base.errors[0].message);
    }
    return base;
  }

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  } catch (error) {
    base.errors.push(
      toIssue({
        code: 'FEEDBACK_JSON_PARSE_ERROR',
        message: `Feedback file is not valid JSON: ${error.message}`,
      }),
    );
    if (mode === 'strict') {
      throw new Error(base.errors[0].message);
    }
    return base;
  }

  const validated = validateFeedbackDataset(payload, { allowedDimensions });
  const result = {
    ...base,
    loaded: validated.errors.length === 0,
    schema_version: validated.schema_version,
    corrections: validated.corrections,
    summary: validated.summary,
    errors: validated.errors,
    warnings: validated.warnings,
  };

  if (mode === 'strict' && validated.errors.length > 0) {
    throw new Error(
      `Feedback ingestion failed (${validated.errors.length} errors).`,
    );
  }

  return result;
}

module.exports = {
  FEEDBACK_SCHEMA_VERSION,
  SUPPORTED_ACTIONS,
  validateFeedbackDataset,
  loadReviewFeedback,
};
