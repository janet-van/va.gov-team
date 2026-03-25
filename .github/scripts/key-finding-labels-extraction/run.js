#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { findResearchReportFiles } = require('./finder');
const { findFrontmatterResearchFiles } = require('./frontmatter-finder');
const { parseFrontmatterFindingsFromContent } = require('./frontmatter-parser');
const { parseLabelBlocksFromContent } = require('./parser');
const {
  generateDeterministicFindingId,
  generateDeterministicFindingUid,
} = require('./deterministic-id');
const { loadTaxonomy, LABEL_CATEGORIES } = require('./taxonomy');
const { loadProfileByName, DEFAULT_PROFILE_NAME } = require('./taxonomy-profiles');
const { normalizeFinding } = require('./normalizer');
const {
  validateParsedBlocks,
  validateFindingShape,
  validateTaxonomyValues,
  validateDuplicateFindingIds,
  validateDuplicateFindingUids,
} = require('./validator');
const { aggregateFindings } = require('./aggregator');
const { mergeCanonicalFindings } = require('./merge');
const { enrichFindings } = require('./classifier');
const { createEmbeddingClassifier } = require('./embedding-classifier');
const { evaluateAdjudicationPolicy } = require('./adjudication-policy');
const { loadReviewFeedback } = require('./review-feedback-ingestion');
const { applyCorrectionsToEnrichment } = require('./correction-application');
const { generatePortfolioAnalysis } = require('./portfolio-analysis');
const { generateNarrativeReport } = require('./narrative-report');
const { writeArtifacts } = require('./reporter');
const {
  buildReportsFromCanonical,
  buildLegacyTaxonomyData,
  buildLegacyTaxonomyReport,
  writeLegacyTaxonomyArtifacts,
} = require('./legacy-taxonomy-adapter');

function parseArgs(argv) {
  const options = {
    mode: 'local',
    scan: 'full',
    outDir: '.',
    taxonomyFile: '',
    taxonomyMode: 'off',
    taxonomyProfile: DEFAULT_PROFILE_NAME,
    emitLegacyTaxonomy: false,
    embeddingMode: 'off',
    embeddingWeight: 0.35,
    fusionMode: 'rules_only',
    fusionThreshold: 0.25,
    llmAdjudicationMode: 'off',
    llmLowConfidenceThreshold: 0.45,
    llmLowMarginThreshold: 0.12,
    llmEmbeddingDisagreementThreshold: 0.25,
    llmMinTriggeredDimensions: 1,
    reviewFeedbackMode: 'off',
    reviewFeedbackFile: '',
    correctionApplicationMode: 'off',
    roots: ['products', 'teams'],
  };

  for (const arg of argv.slice(2)) {
    if (!arg.startsWith('--')) continue;
    const [rawKey, ...rawValue] = arg.slice(2).split('=');
    const key = rawKey.trim();
    const value = rawValue.join('=').trim();

    if (key === 'mode' && value) options.mode = value;
    if (key === 'scan' && value) options.scan = value;
    if (key === 'out-dir' && value) options.outDir = value;
    if (key === 'taxonomy-file' && value) options.taxonomyFile = value;
    if (key === 'taxonomy-mode' && value) options.taxonomyMode = value;
    if (key === 'taxonomy-profile' && value) options.taxonomyProfile = value;
    if (key === 'emit-legacy-taxonomy' && value) options.emitLegacyTaxonomy = value === 'true';
    if (key === 'embedding-mode' && value) options.embeddingMode = value;
    if (key === 'embedding-weight' && value) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) options.embeddingWeight = parsed;
    }
    if (key === 'fusion-mode' && value) options.fusionMode = value;
    if (key === 'fusion-threshold' && value) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) options.fusionThreshold = parsed;
    }
    if (key === 'llm-adjudication-mode' && value) options.llmAdjudicationMode = value;
    if (key === 'llm-low-confidence-threshold' && value) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) options.llmLowConfidenceThreshold = parsed;
    }
    if (key === 'llm-low-margin-threshold' && value) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) options.llmLowMarginThreshold = parsed;
    }
    if (key === 'llm-embedding-disagreement-threshold' && value) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) options.llmEmbeddingDisagreementThreshold = parsed;
    }
    if (key === 'llm-min-triggered-dimensions' && value) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) options.llmMinTriggeredDimensions = parsed;
    }
    if (key === 'review-feedback-mode' && value) options.reviewFeedbackMode = value;
    if (key === 'review-feedback-file' && value) options.reviewFeedbackFile = value;
    if (key === 'correction-application-mode' && value) options.correctionApplicationMode = value;
    if (key === 'roots' && value) {
      options.roots = value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }
  }

  return options;
}

async function runExtraction(options) {
  if (options.scan !== 'full') {
    throw new Error(`Unsupported scan mode: ${options.scan}`);
  }

  const taxonomyProfile = loadProfileByName({
    profileName: options.taxonomyProfile || DEFAULT_PROFILE_NAME,
  });
  const embeddingClassifier = createEmbeddingClassifier({
    mode: options.embeddingMode || 'off',
    taxonomy: taxonomyProfile.dimensions,
  });
  const feedbackIngestion = loadReviewFeedback({
    mode: options.reviewFeedbackMode || 'off',
    filePath: options.reviewFeedbackFile || '',
    allowedDimensions: Object.keys(taxonomyProfile.dimensions || {}),
  });

  let taxonomy = null;
  let taxonomyLoadWarning = null;
  if (options.taxonomyMode === 'warn') {
    try {
      taxonomy = await loadTaxonomy({
        taxonomyFile: options.taxonomyFile,
      });
    } catch (error) {
      taxonomyLoadWarning = `Taxonomy could not be loaded: ${error.message}`;
    }
  }

  const files = await findResearchReportFiles(options.roots);
  const frontmatterFiles = await findFrontmatterResearchFiles(options.roots);
  const allFiles = Array.from(new Set([...files, ...frontmatterFiles])).sort();
  const parsedBlocks = [];
  const frontmatterFindings = [];
  const frontmatterWarnings = [];
  let filesWithBlocks = 0;
  let filesWithFrontmatterFindings = 0;
  let skippedNoFrontmatter = 0;
  let skippedNoFindings = 0;
  let skippedPlaceholderOnly = 0;

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');

    const blocks = parseLabelBlocksFromContent(content, file);
    if (blocks.length > 0) filesWithBlocks += 1;
    parsedBlocks.push(...blocks);

    const frontmatterResult = parseFrontmatterFindingsFromContent(content, file);
    frontmatterFindings.push(...frontmatterResult.findings);
    frontmatterWarnings.push(...frontmatterResult.warnings);
    const stats = frontmatterResult.stats || {
      has_frontmatter: false,
      has_key_findings_array: false,
      valid_findings: 0,
    };
    if (!stats.has_frontmatter) {
      skippedNoFrontmatter += 1;
    } else if (!stats.has_key_findings_array) {
      skippedNoFindings += 1;
    } else if (stats.valid_findings === 0) {
      skippedPlaceholderOnly += 1;
    }
    if (frontmatterResult.findings.length > 0) {
      filesWithFrontmatterFindings += 1;
    }
  }

  const validation = validateParsedBlocks(parsedBlocks);
  validation.warnings.push(...frontmatterWarnings);

  const normalizedFindings = [];

  for (const block of parsedBlocks) {
    if (block.parseError || !block.data || typeof block.data !== 'object' || Array.isArray(block.data)) {
      continue;
    }

    if ((!block.data.finding_id && block.data.finding_id !== 0) && block.data.finding_title) {
      const generatedId = generateDeterministicFindingId({
        sourceFile: block.file,
        findingTitle: block.data.finding_title,
      });
      block.data.finding_id = generatedId;
      validation.warnings.push({
        file: block.file,
        finding_id: generatedId,
        code: 'GENERATED_FINDING_ID',
        message: 'finding_id was missing and was generated deterministically from source_file + finding_title',
      });
    }

    if (block.data.finding_title && (block.data.finding_id || block.data.finding_id === 0)) {
      block.data.finding_uid = generateDeterministicFindingUid({
        sourceFile: block.file,
        findingIdLocal: block.data.finding_id,
        findingTitle: block.data.finding_title,
      });
    }

    const shapeValidation = validateFindingShape({ file: block.file, finding: block.data });
    validation.errors.push(...shapeValidation.errors);
    validation.warnings.push(...shapeValidation.warnings);

    if (taxonomy) {
      const taxonomyValidation = validateTaxonomyValues({
        file: block.file,
        finding: block.data,
        taxonomy,
      });
      validation.warnings.push(...taxonomyValidation.warnings);
    }

    const normalized = normalizeFinding({
      sourceFile: block.file,
      data: block.data,
    });

    normalizedFindings.push(normalized);
  }

  const duplicateValidation = validateDuplicateFindingIds(normalizedFindings);
  validation.errors.push(...duplicateValidation.errors);
  const duplicateUidValidation = validateDuplicateFindingUids(normalizedFindings);
  validation.errors.push(...duplicateUidValidation.errors);

  const errorKeySet = new Set(
    validation.errors.map(issue => `${issue.file}|${String(issue.finding_id)}|${issue.code}|${issue.message}`),
  );

  const validFindings = normalizedFindings.filter(finding => {
    const findingError = validation.errors.some(issue => {
      if (issue.file !== finding.source_file) return false;
      if (issue.finding_id === null || issue.finding_id === undefined) return false;
      return String(issue.finding_id) === String(finding.finding_id_local);
    });

    const duplicateUidError = validation.errors.some(issue => {
      if (issue.code !== 'DUPLICATE_FINDING_UID') return false;
      return String(issue.finding_id) === String(finding.finding_uid);
    });

    return !findingError && !duplicateUidError;
  });

  const patterns = aggregateFindings(validFindings);
  const canonicalFindings = mergeCanonicalFindings({
    explicitFindings: validFindings,
    frontmatterFindings,
  });
  const enrichmentFindings = enrichFindings(canonicalFindings, {
    taxonomy: taxonomyProfile.dimensions,
    confidenceDenominatorFactor: taxonomyProfile.confidence_denominator_factor,
    embeddingClassifier,
    embeddingWeight: options.embeddingWeight,
    fusionMode: options.fusionMode,
    fusionThreshold: options.fusionThreshold,
  });
  const portfolio = generatePortfolioAnalysis({
    enrichmentFindings,
    canonicalFindings,
    taxonomyDimensions: taxonomyProfile.dimensions,
  });
  const adjudication = evaluateAdjudicationPolicy(enrichmentFindings, {
    mode: options.llmAdjudicationMode,
    lowConfidenceThreshold: options.llmLowConfidenceThreshold,
    lowMarginThreshold: options.llmLowMarginThreshold,
    embeddingDisagreementThreshold: options.llmEmbeddingDisagreementThreshold,
    minTriggeredDimensions: options.llmMinTriggeredDimensions,
  });
  const correctionApplication = applyCorrectionsToEnrichment({
    enrichmentFindings,
    feedbackIngestion,
    mode: options.correctionApplicationMode || 'off',
  });

  for (const issue of feedbackIngestion.errors) {
    validation.warnings.push({
      file: feedbackIngestion.source_file || '_workflow',
      finding_id: null,
      code: issue.code,
      message: issue.message,
    });
  }
  for (const issue of feedbackIngestion.warnings) {
    validation.warnings.push({
      file: feedbackIngestion.source_file || '_workflow',
      finding_id: null,
      code: issue.code,
      message: issue.message,
    });
  }
  const narrativeReport = generateNarrativeReport({
    summary: {
      generated_at: new Date().toISOString(),
      files_scanned: allFiles.length,
      blocks_found: parsedBlocks.length,
    },
    portfolio,
    enrichmentFindings,
  });

  const uniqueLabelsUsed = new Set();
  const uniqueCategoriesUsed = new Set();
  for (const finding of validFindings) {
    for (const category of LABEL_CATEGORIES) {
      const values = finding.labels[category] || [];
      if (values.length > 0) uniqueCategoriesUsed.add(category);
      for (const value of values) {
        uniqueLabelsUsed.add(`${category}:${value}`);
      }
    }
  }

  const summary = {
    artifact_schema_version: '2.0.0',
    generated_at: new Date().toISOString(),
    mode: options.mode,
    scan: options.scan,
    taxonomy_mode: options.taxonomyMode,
    taxonomy_source: taxonomy ? taxonomy.taxonomyUrl : null,
    taxonomy_loaded: Boolean(taxonomy),
    taxonomy_profile: taxonomyProfile.profile_id,
    taxonomy_profile_version: taxonomyProfile.profile_version,
    embedding_mode: embeddingClassifier.mode,
    embedding_enabled: embeddingClassifier.enabled,
    embedding_weight: Number(options.embeddingWeight),
    fusion_mode: options.fusionMode,
    fusion_threshold: Number(options.fusionThreshold),
    llm_adjudication_mode: options.llmAdjudicationMode,
    llm_adjudication_enabled: adjudication.enabled,
    llm_adjudication_findings_flagged: adjudication.findings_flagged,
    review_feedback_mode: feedbackIngestion.mode,
    review_feedback_enabled: feedbackIngestion.enabled,
    review_feedback_loaded: feedbackIngestion.loaded,
    review_feedback_records_ingested: feedbackIngestion.summary.records_valid,
    review_feedback_error_count: feedbackIngestion.errors.length,
    correction_application_mode: correctionApplication.mode,
    correction_application_enabled: correctionApplication.enabled,
    corrections_applied: correctionApplication.corrections_applied,
    corrections_ignored: correctionApplication.corrections_ignored,
    correction_findings_touched: correctionApplication.findings_touched,
    legacy_taxonomy_emitted: Boolean(options.emitLegacyTaxonomy),
    files_scanned: allFiles.length,
    files_with_label_blocks: filesWithBlocks,
    files_with_frontmatter_findings: filesWithFrontmatterFindings,
    blocks_found: parsedBlocks.length,
    frontmatter_findings: frontmatterFindings.length,
    valid_findings: validFindings.length,
    canonical_findings: canonicalFindings.length,
    enrichment_findings: enrichmentFindings.length,
    error_count: errorKeySet.size,
    warning_count: validation.warnings.length,
    unique_label_categories: uniqueCategoriesUsed.size,
    unique_labels: uniqueLabelsUsed.size,
  };

  if (taxonomyLoadWarning) {
    validation.warnings.push({
      file: '_workflow',
      finding_id: null,
      code: 'TAXONOMY_LOAD_FAILED',
      message: `${taxonomyLoadWarning} (schema validation still executed)`,
    });
  }

  const artifactResult = writeArtifacts({
    summary,
    findings: validFindings,
    validation,
    patterns,
    enrichment: {
      artifact_schema_version: '1.0.0',
      findings: enrichmentFindings,
    },
    portfolio,
    adjudication,
    feedbackIngestion,
    correctionApplication,
    narrativeReport,
    outDir: options.outDir || '.',
  });

  const allArtifactFiles = [...artifactResult.files];

  if (options.emitLegacyTaxonomy) {
    const legacyProfile = loadProfileByName({ profileName: 'legacy-taxonomy' });
    const reports = buildReportsFromCanonical({
      canonicalFindings,
      enrichmentFindings,
      legacyProfile,
      enrichmentProfile: taxonomyProfile,
    });
    const legacyData = buildLegacyTaxonomyData({
      generatedAt: summary.generated_at,
      filesScanned: summary.files_scanned,
      reports,
      legacyProfile,
      skipped: {
        no_frontmatter: skippedNoFrontmatter,
        no_key_findings: skippedNoFindings,
        placeholder_only: skippedPlaceholderOnly,
      },
    });
    const legacyReport = buildLegacyTaxonomyReport(legacyData);
    const legacyFiles = writeLegacyTaxonomyArtifacts({
      outDir: options.outDir || '.',
      data: legacyData,
      markdown: legacyReport,
    });
    allArtifactFiles.push(...legacyFiles);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const summaryMd = fs.readFileSync(artifactResult.stepSummaryFile, 'utf8');
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMd);
  }

  return {
    summary,
    validation,
    artifacts: allArtifactFiles,
  };
}

async function main() {
  try {
    const options = parseArgs(process.argv);
    const repoCwd = process.cwd();
    options.outDir = options.outDir ? path.resolve(repoCwd, options.outDir) : repoCwd;
    if (options.taxonomyFile) options.taxonomyFile = path.resolve(repoCwd, options.taxonomyFile);
    if (options.reviewFeedbackFile) {
      options.reviewFeedbackFile = path.resolve(repoCwd, options.reviewFeedbackFile);
    }

    const result = await runExtraction(options);

    console.log('Key finding labels extraction complete');
    console.log(`Files scanned: ${result.summary.files_scanned}`);
    console.log(`Files with frontmatter findings: ${result.summary.files_with_frontmatter_findings}`);
    console.log(`Blocks found: ${result.summary.blocks_found}`);
    console.log(`Frontmatter findings: ${result.summary.frontmatter_findings}`);
    console.log(`Valid findings: ${result.summary.valid_findings}`);
    console.log(`Canonical findings: ${result.summary.canonical_findings}`);
    console.log(`Enrichment findings: ${result.summary.enrichment_findings}`);
    console.log(`Errors: ${result.summary.error_count}`);
    console.log(`Warnings: ${result.summary.warning_count}`);

    if (result.summary.error_count > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Extraction failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  runExtraction,
};
