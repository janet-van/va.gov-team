const { LABEL_CATEGORIES } = require('./taxonomy');
const { toStringArray } = require('./normalizer');

function buildIssue({ file, findingId = null, code, message }) {
  return {
    file,
    finding_id: findingId,
    code,
    message,
  };
}

function validateParsedBlocks(parsedBlocks) {
  const errors = [];
  const warnings = [];

  for (const block of parsedBlocks) {
    warnings.push(...block.styleWarnings);
    if (block.parseError) {
      errors.push(block.parseError);
    }
  }

  return { errors, warnings };
}

function validateFindingShape({ file, finding }) {
  const errors = [];
  const warnings = [];
  const findingId = finding.finding_id ?? null;

  if (!finding.finding_id && finding.finding_id !== 0) {
    errors.push(
      buildIssue({
        file,
        findingId,
        code: 'MISSING_FINDING_ID',
        message: 'Missing required field: finding_id',
      }),
    );
  }

  if (!finding.finding_title) {
    errors.push(
      buildIssue({
        file,
        findingId,
        code: 'MISSING_FINDING_TITLE',
        message: 'Missing required field: finding_title',
      }),
    );
  }

  if (!finding.labels || typeof finding.labels !== 'object' || Array.isArray(finding.labels)) {
    errors.push(
      buildIssue({
        file,
        findingId,
        code: 'MISSING_LABELS_OBJECT',
        message: 'Missing required object: labels',
      }),
    );
    return { errors, warnings };
  }

  const findingTypes = toStringArray(finding.labels.finding_types);
  if (findingTypes.length === 0) {
    errors.push(
      buildIssue({
        file,
        findingId,
        code: 'MISSING_FINDING_TYPES',
        message: 'Missing required labels field: labels.finding_types',
      }),
    );
  }

  const severities = toStringArray(finding.labels.severity_levels);
  if (severities.length === 0) {
    errors.push(
      buildIssue({
        file,
        findingId,
        code: 'MISSING_SEVERITY_LEVEL',
        message: 'Missing required labels field: labels.severity_levels',
      }),
    );
  } else if (severities.length > 1) {
    errors.push(
      buildIssue({
        file,
        findingId,
        code: 'MULTIPLE_SEVERITY_LEVELS',
        message: 'labels.severity_levels must contain exactly one value',
      }),
    );
  }

  const journey = toStringArray(finding.service_journey_mapping);
  if (journey.length === 0) {
    warnings.push(
      buildIssue({
        file,
        findingId,
        code: 'MISSING_SERVICE_JOURNEY_MAPPING',
        message: 'Missing/empty service_journey_mapping (warning only)',
      }),
    );
  }

  const patterns = toStringArray(finding.pattern_triggers);
  if (patterns.length === 0) {
    warnings.push(
      buildIssue({
        file,
        findingId,
        code: 'MISSING_PATTERN_TRIGGERS',
        message: 'Missing/empty pattern_triggers (warning only)',
      }),
    );
  }

  for (const category of LABEL_CATEGORIES) {
    if (!Object.prototype.hasOwnProperty.call(finding.labels, category)) continue;
    if (Array.isArray(finding.labels[category]) && finding.labels[category].length === 0) {
      warnings.push(
        buildIssue({
          file,
          findingId,
          code: 'EMPTY_LABEL_CATEGORY',
          message: `labels.${category} exists but is empty`,
        }),
      );
    }
  }

  for (const category of Object.keys(finding.labels)) {
    if (!LABEL_CATEGORIES.includes(category)) {
      warnings.push(
        buildIssue({
          file,
          findingId,
          code: 'UNKNOWN_LABEL_CATEGORY',
          message: `labels.${category} is not in the known category list (warning only)`,
        }),
      );
    }
  }

  return { errors, warnings };
}

function validateTaxonomyValues({ file, finding, taxonomy }) {
  const warnings = [];
  const findingId = finding.finding_id ?? null;

  if (!finding.labels || typeof finding.labels !== 'object' || Array.isArray(finding.labels)) {
    return { warnings };
  }

  for (const category of LABEL_CATEGORIES) {
    const values = toStringArray(finding.labels[category]);
    if (values.length === 0) continue;

    const allowedForCategory = taxonomy.allowedLabels[category];
    if (!allowedForCategory || allowedForCategory.size === 0) {
      continue;
    }

    for (const value of values) {
      if (!allowedForCategory.has(value)) {
        warnings.push(
          buildIssue({
            file,
            findingId,
            code: 'UNKNOWN_TAXONOMY_VALUE',
            message: `Unknown value for labels.${category}: ${value} (warning only)`,
          }),
        );
      }
    }
  }

  return { warnings };
}

function validateDuplicateFindingIds(findings) {
  const errors = [];
  const idsByFile = new Map();

  for (const finding of findings) {
    const key = finding.source_file;
    if (!idsByFile.has(key)) idsByFile.set(key, new Map());

    const map = idsByFile.get(key);
    const id = String(finding.finding_id_local);
    const next = (map.get(id) || 0) + 1;
    map.set(id, next);
  }

  for (const [file, idMap] of idsByFile.entries()) {
    for (const [id, count] of idMap.entries()) {
      if (count > 1) {
        errors.push(
          buildIssue({
            file,
            findingId: id,
            code: 'DUPLICATE_FINDING_ID_IN_FILE',
            message: `finding_id ${id} appears ${count} times in ${file}`,
          }),
        );
      }
    }
  }

  return { errors };
}

function validateDuplicateFindingUids(findings) {
  const errors = [];
  const uidCounts = new Map();

  for (const finding of findings) {
    const uid = String(finding.finding_uid || '').trim();
    if (!uid) continue;
    uidCounts.set(uid, (uidCounts.get(uid) || 0) + 1);
  }

  for (const [uid, count] of uidCounts.entries()) {
    if (count > 1) {
      errors.push(
        buildIssue({
          file: '_aggregate',
          findingId: uid,
          code: 'DUPLICATE_FINDING_UID',
          message: `finding_uid ${uid} appears ${count} times across extracted findings`,
        }),
      );
    }
  }

  return { errors };
}

module.exports = {
  validateParsedBlocks,
  validateFindingShape,
  validateTaxonomyValues,
  validateDuplicateFindingIds,
  validateDuplicateFindingUids,
};
