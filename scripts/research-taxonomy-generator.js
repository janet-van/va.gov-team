#!/usr/bin/env node

/**
 * Research Findings Taxonomy Generator
 *
 * Scans all research findings reports in /products and /teams directories,
 * extracts key findings from YAML frontmatter, analyzes each finding using
 * keyword-based classification, and generates:
 *
 * 1. A structured JSON dataset with taxonomy-labeled findings (ML pipeline input)
 * 2. A comprehensive markdown taxonomy report for researchers
 *
 * Usage:
 *   node scripts/research-taxonomy-generator.js
 *
 * Output:
 *   reports/research-taxonomy/taxonomy-data.json
 *   reports/research-taxonomy/taxonomy-report.md
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

// A finding is considered a strong match when it hits 30% of a label's keywords.
// This factor controls the denominator in confidence scoring: a lower value makes
// it easier to reach high confidence (fewer keyword matches needed), while a higher
// value requires more matches. The floor of 1 prevents division issues when a label
// has very few keywords (e.g., 2 keywords × 0.3 = 0.6, floored to 1).
const CONFIDENCE_DENOMINATOR_FACTOR = 0.3;

// ─── Taxonomy Definitions ───────────────────────────────────────────────────
// These are the taxonomy dimensions used to classify each key finding.
// Each dimension has a set of labels with associated keyword patterns.

const TAXONOMY = {
  finding_types: {
    usability_issue: [
      'difficult', 'struggle', 'confusion', 'confusing', 'confused', 'unclear',
      'hard to', 'couldn\'t find', 'didn\'t understand', 'misunderstood',
      'unintuitive', 'not intuitive', 'challenging', 'problematic', 'obstacle',
      'barrier', 'friction', 'cumbersome', 'tedious', 'frustrat'
    ],
    accessibility_barrier: [
      'screen reader', 'assistive technology', 'keyboard', 'magnification',
      'zoom', 'contrast', 'alt text', 'aria', 'voiceover', 'jaws', 'nvda',
      'blind', 'visually impaired', 'hearing', 'deaf', 'cognitive disability',
      'a11y', 'accessibility', 'accessible', 'inaccessible', 'wcag',
      'low vision', 'speech input', 'captions'
    ],
    positive_finding: [
      'easy', 'intuitive', 'clear', 'straightforward', 'successful',
      'understood', 'appreciated', 'liked', 'preferred', 'helpful',
      'confident', 'positive', 'well-received', 'excellent', 'effective',
      'efficient', 'satisfied', 'comfortable', 'familiar'
    ],
    content_issue: [
      'wording', 'language', 'terminology', 'jargon', 'plain language',
      'label', 'text', 'copy', 'content', 'readability', 'verbose',
      'ambiguous', 'vague', 'misleading', 'inconsistent terminology'
    ],
    navigation_issue: [
      'navigate', 'navigation', 'find', 'findability', 'wayfinding',
      'lost', 'path', 'breadcrumb', 'menu', 'link', 'back button',
      'where to go', 'search', 'locate', 'discover'
    ],
    trust_issue: [
      'trust', 'distrust', 'skeptic', 'credib', 'legitimacy', 'scam',
      'suspicious', 'concern about', 'worried', 'uncertainty', 'doubt',
      'reliable', 'unreliable', 'verify', 'confirmation'
    ],
    unmet_need: [
      'need', 'want', 'wish', 'expect', 'desire', 'missing', 'lack',
      'gap', 'insufficient', 'inadequate', 'require', 'hoped for',
      'looking for', 'would like'
    ],
    mental_model_mismatch: [
      'expected', 'assumption', 'mental model', 'preconception',
      'prior experience', 'familiar with', 'thought it would',
      'anticipated', 'presumed', 'didn\'t expect'
    ],
    process_issue: [
      'process', 'workflow', 'steps', 'step', 'long', 'lengthy',
      'time-consuming', 'repetitive', 'redundant', 'duplicate',
      'bureaucratic', 'complicated process', 'too many'
    ],
    emotional_response: [
      'anxious', 'anxiety', 'stressed', 'stress', 'overwhelmed',
      'frustrated', 'frustration', 'angry', 'upset', 'fear',
      'worried', 'relief', 'happy', 'satisfied', 'empowered'
    ]
  },

  product_areas: {
    health_care: [
      'health', 'medical', 'clinic', 'hospital', 'appointment', 'medication',
      'prescription', 'pharmacy', 'doctor', 'provider', 'care', 'copay',
      'myhealthevet', 'secure messaging', 'health record', 'lab', 'vaccine'
    ],
    benefits_claims: [
      'claim', 'benefit', 'compensation', 'disability', 'pension', 'appeal',
      'decision review', 'supplemental claim', 'higher-level review',
      'notice of disagreement', 'rating', '526', 'evidence', 'c&p exam'
    ],
    education: [
      'education', 'gi bill', 'school', 'tuition', 'enrollment', 'stem',
      'vet tec', 'yellow ribbon', 'post-9/11', 'chapter 33', 'training'
    ],
    housing: [
      'home loan', 'mortgage', 'coe', 'certificate of eligibility', 'housing',
      'homeless', 'hud-vash', 'adapted housing'
    ],
    debt_financial: [
      'debt', 'overpayment', 'payment', 'financial', 'copay', 'waiver',
      'dispute', 'repayment', 'balance', 'fsr', 'financial status report'
    ],
    identity_auth: [
      'sign in', 'login', 'identity', 'authentication', 'verification',
      'id.me', 'login.gov', 'ds logon', 'mfa', 'password', 'credential',
      'account', 'profile', 'sso', 'single sign-on'
    ],
    records_documents: [
      'dd-214', 'record', 'document', 'letter', 'certificate', 'download',
      'print', 'efolder', 'file', 'upload', 'evidence'
    ],
    memorial_burial: [
      'burial', 'memorial', 'medallion', 'headstone', 'cemetery',
      'pre-need', 'survivor', 'death', 'dependent indemnity'
    ],
    caregiver: [
      'caregiver', 'caregiving', 'family member', 'dependent',
      'stipend', '10-10cg', 'primary caregiver', 'secondary caregiver'
    ],
    facilities: [
      'facility', 'location', 'va center', 'vet center', 'vamc',
      'clinic', 'hospital', 'facility locator', 'directions', 'hours'
    ],
    mobile_app: [
      'mobile app', 'va health and benefits', 'native app', 'app store',
      'push notification', 'biometric'
    ],
    forms: [
      'form', 'application', 'submit', 'submission', 'pdf', 'digital form',
      'paper form', 'fillable', 'save in progress', 'prefill'
    ],
    search: [
      'search', 'find a form', 'site search', 'resources and support',
      'typeahead', 'filter', 'sort'
    ],
    appointments: [
      'appointment', 'scheduling', 'vaos', 'telehealth', 'video connect',
      'check-in', 'travel reimbursement'
    ],
    notifications: [
      'notification', 'alert', 'email', 'text message', 'sms', 'va notify',
      'reminder', 'status update'
    ],
    representative: [
      'representative', 'vso', 'attorney', 'claims agent', 'power of attorney',
      'accredited', 'advocate'
    ]
  },

  user_groups: {
    veterans: [
      'veteran', 'vets', 'service-connected', 'former military'
    ],
    service_members: [
      'service member', 'active duty', 'transitioning', 'bdd',
      'benefits delivery at discharge', 'pre-discharge'
    ],
    caregivers: [
      'caregiver', 'family caregiver', 'primary caregiver', 'secondary caregiver'
    ],
    dependents: [
      'dependent', 'spouse', 'child', 'family member', 'survivor',
      'surviving spouse'
    ],
    assistive_tech_users: [
      'screen reader', 'assistive technology', 'at user', 'blind',
      'visually impaired', 'magnification', 'zoom', 'voiceover',
      'jaws', 'nvda', 'keyboard only', 'speech input'
    ],
    cognitive_disability: [
      'cognitive', 'tbi', 'traumatic brain injury', 'ptsd', 'memory',
      'attention', 'learning disability', 'cognitive consideration'
    ],
    older_veterans: [
      'older veteran', 'elderly', 'aging', '65+', 'senior',
      'limited technology', 'not tech savvy'
    ],
    rural_veterans: [
      'rural', 'remote area', 'limited internet', 'travel distance',
      'far from va'
    ],
    mobile_users: [
      'mobile', 'smartphone', 'phone', 'small screen', 'touch',
      'mobile device'
    ],
    low_digital_literacy: [
      'low digital literacy', 'not comfortable', 'unfamiliar with',
      'technology challenged', 'first time', 'not tech savvy',
      'digital literacy'
    ],
    lgbtq_plus: [
      'lgbtq', 'transgender', 'nonbinary', 'gender identity',
      'sexual orientation', 'two-spirit'
    ],
    minority_veterans: [
      'black veteran', 'hispanic', 'latino', 'asian', 'native american',
      'pacific islander', 'underrepresented', 'minority'
    ],
    homeless_veterans: [
      'homeless', 'housing insecurity', 'unhoused', 'shelter'
    ]
  },

  research_themes: {
    navigation_wayfinding: [
      'navigate', 'navigation', 'wayfinding', 'find', 'findability',
      'information architecture', 'menu', 'breadcrumb', 'path'
    ],
    form_completion: [
      'form', 'complete', 'fill', 'submit', 'save in progress',
      'prefill', 'review', 'edit', 'input', 'field'
    ],
    content_comprehension: [
      'understand', 'comprehension', 'readability', 'plain language',
      'terminology', 'jargon', 'clear', 'clarity', 'wording'
    ],
    error_handling: [
      'error', 'mistake', 'wrong', 'fail', 'failure', 'recover',
      'correction', 'validation', 'alert'
    ],
    mobile_experience: [
      'mobile', 'responsive', 'smartphone', 'touch', 'small screen',
      'portrait', 'landscape'
    ],
    sign_in_authentication: [
      'sign in', 'login', 'authentication', 'password', 'credential',
      'mfa', 'identity verification'
    ],
    status_tracking: [
      'status', 'track', 'progress', 'timeline', 'update', 'where is',
      'check status', 'pending'
    ],
    information_seeking: [
      'search', 'look for', 'find information', 'research', 'discover',
      'browse', 'explore'
    ],
    task_completion: [
      'complete', 'finish', 'accomplish', 'task', 'goal', 'objective',
      'success rate', 'abandonment'
    ],
    notification_communication: [
      'notification', 'email', 'text', 'letter', 'communication',
      'alert', 'reminder', 'update'
    ],
    personalization: [
      'personalize', 'my va', 'dashboard', 'profile', 'preference',
      'customiz', 'tailor', 'relevant'
    ],
    cross_channel: [
      'phone', 'in-person', 'call center', 'paper', 'online',
      'digital', 'channel', 'omnichannel'
    ],
    data_privacy: [
      'privacy', 'security', 'data', 'personal information', 'pii',
      'sharing', 'consent', 'permission'
    ]
  },

  veteran_journey_stages: {
    discovering_benefits: [
      'discover', 'learn about', 'awareness', 'eligibility', 'qualify',
      'entitled', 'first time', 'new to'
    ],
    applying_for_benefits: [
      'apply', 'application', 'submit', 'filing', 'claim', 'enroll',
      'register', 'sign up'
    ],
    managing_benefits: [
      'manage', 'check status', 'track', 'update', 'renew', 'maintain',
      'ongoing', 'recurring'
    ],
    resolving_issues: [
      'resolve', 'dispute', 'appeal', 'complaint', 'issue', 'problem',
      'escalate', 'fix', 'correct'
    ],
    transitioning: [
      'transition', 'separating', 'discharge', 'civilian', 'bdd',
      'pre-discharge', 'ets'
    ]
  },

  severity_indicators: {
    critical: [
      'cannot', 'unable', 'blocked', 'prevent', 'impossible', 'fail completely',
      'abandon', 'give up', 'all participants', 'everyone', '100%',
      'no one could', 'security', 'safety'
    ],
    high: [
      'most participants', 'majority', 'significant', 'many', 'frequently',
      'often', 'consistently', 'repeatedly', 'widespread'
    ],
    medium: [
      'some participants', 'several', 'mixed', 'sometimes', 'occasionally',
      'few participants', 'a few'
    ],
    low: [
      'one participant', 'minor', 'slight', 'rare', 'infrequent',
      'edge case', 'small number', 'uncommon'
    ]
  },

  emotional_states: {
    frustrated: ['frustrat', 'annoyed', 'irritat', 'fed up', 'exasperat'],
    confused: ['confus', 'uncertain', 'unsure', 'unclear', 'bewildered', 'puzzl'],
    anxious: ['anxious', 'anxiety', 'worried', 'nervous', 'stressed', 'concern'],
    overwhelmed: ['overwhelm', 'too much', 'information overload', 'complex', 'daunting'],
    satisfied: ['satisfied', 'happy', 'pleased', 'content', 'delighted'],
    empowered: ['empower', 'confident', 'in control', 'capable', 'autonomous'],
    distrustful: ['distrust', 'skeptic', 'suspicious', 'doubt', 'don\'t believe']
  }
};

// ─── Keyword Extraction ─────────────────────────────────────────────────────

/**
 * Classify a finding by matching its text against taxonomy keyword patterns.
 * Returns an object with labels for each taxonomy dimension.
 */
function classifyFinding(findingText) {
  const text = findingText.toLowerCase();
  const labels = {};

  for (const [dimension, categories] of Object.entries(TAXONOMY)) {
    labels[dimension] = {};
    for (const [label, keywords] of Object.entries(categories)) {
      const matchCount = keywords.filter(kw => text.includes(kw.toLowerCase())).length;
      if (matchCount > 0) {
        labels[dimension][label] = {
          matched: true,
          confidence: Math.min(matchCount / Math.max(keywords.length * CONFIDENCE_DENOMINATOR_FACTOR, 1), 1.0),
          match_count: matchCount
        };
      }
    }
  }

  return labels;
}

/**
 * Extract the primary labels (highest confidence) for each dimension.
 */
function getPrimaryLabels(classifiedLabels) {
  const primary = {};
  for (const [dimension, categories] of Object.entries(classifiedLabels)) {
    const sorted = Object.entries(categories)
      .filter(([, v]) => v.matched)
      .sort((a, b) => b[1].confidence - a[1].confidence);
    if (sorted.length > 0) {
      primary[dimension] = sorted.map(([label, meta]) => ({
        label,
        confidence: Math.round(meta.confidence * 100) / 100
      }));
    }
  }
  return primary;
}

// ─── YAML Frontmatter Parsing ───────────────────────────────────────────────

/**
 * Extract YAML frontmatter from a markdown file's content.
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;
  try {
    return yaml.load(match[1]);
  } catch (e) {
    return null;
  }
}

/**
 * Check if frontmatter has placeholder/template values.
 */
function isPlaceholder(value) {
  if (typeof value !== 'string') return false;
  const placeholders = [
    'product name', 'team name', 'goal 1', 'goal 2',
    'finding 1', 'finding 2', 'method 1', 'method 2',
    'yyyy-mm-dd', 'yyyy-mm', 'researcher/designer 1',
    'researcher/designer 2', '[study]', 'x'
  ];
  return placeholders.some(p => value.toLowerCase().trim() === p);
}

// ─── Main Processing ────────────────────────────────────────────────────────

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const outputDir = path.join(repoRoot, 'reports', 'research-taxonomy');

  console.log('🔍 Scanning for research findings reports...');

  // Find all research findings files
  const patterns = [
    'products/**/*findings*.md',
    'products/**/*research-report*.md',
    'products/**/*report*.md',
    'teams/**/*findings*.md',
    'teams/**/*research-report*.md',
    'teams/**/*report*.md'
  ];

  const allFiles = new Set();
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: repoRoot,
      ignore: ['**/node_modules/**', '**/template*', '**/*template*']
    });
    files.forEach(f => allFiles.add(f));
  }

  console.log(`📄 Found ${allFiles.size} potential research files`);

  // Process each file
  const reports = [];
  let findingsCount = 0;
  let skippedNoFrontmatter = 0;
  let skippedNoFindings = 0;
  let skippedPlaceholder = 0;

  for (const filePath of [...allFiles].sort()) {
    const fullPath = path.join(repoRoot, filePath);
    let content;
    try {
      content = fs.readFileSync(fullPath, 'utf-8');
    } catch (e) {
      continue;
    }

    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) {
      skippedNoFrontmatter++;
      continue;
    }

    if (!frontmatter.key_findings || !Array.isArray(frontmatter.key_findings)) {
      skippedNoFindings++;
      continue;
    }

    // Filter out placeholder findings
    const findings = frontmatter.key_findings.filter(f =>
      typeof f === 'string' && f.trim().length > 10 && !isPlaceholder(f)
    );

    if (findings.length === 0) {
      skippedPlaceholder++;
      continue;
    }

    // Classify each finding
    const classifiedFindings = findings.map((finding, idx) => {
      const rawLabels = classifyFinding(finding);
      const primaryLabels = getPrimaryLabels(rawLabels);
      findingsCount++;
      return {
        finding_id: idx + 1,
        finding_text: finding,
        taxonomy_labels: primaryLabels
      };
    });

    // Build report entry
    const reportEntry = {
      file_path: filePath,
      source_folder: filePath.startsWith('products/') ? 'products' : 'teams',
      metadata: {
        title: frontmatter.title || null,
        product: frontmatter.product || null,
        team: frontmatter.team || null,
        date: frontmatter.date || null,
        methodology: frontmatter.methodology || [],
        participants_total: frontmatter.participants_total || null,
        existing_tags: frontmatter.tags || []
      },
      demographics_summary: extractDemographicsSummary(frontmatter),
      findings_count: classifiedFindings.length,
      classified_findings: classifiedFindings
    };

    reports.push(reportEntry);
  }

  console.log(`\n✅ Processed ${reports.length} reports with ${findingsCount} key findings`);
  console.log(`   ⏭️  Skipped: ${skippedNoFrontmatter} (no frontmatter), ${skippedNoFindings} (no key_findings), ${skippedPlaceholder} (placeholder only)`);

  // Generate aggregated taxonomy analysis
  const taxonomyAnalysis = generateTaxonomyAnalysis(reports);

  // Build final output
  const output = {
    generated_at: new Date().toISOString(),
    summary: {
      total_reports_scanned: allFiles.size,
      reports_with_findings: reports.length,
      total_key_findings: findingsCount,
      skipped: {
        no_frontmatter: skippedNoFrontmatter,
        no_key_findings: skippedNoFindings,
        placeholder_only: skippedPlaceholder
      }
    },
    taxonomy_definition: TAXONOMY,
    taxonomy_analysis: taxonomyAnalysis,
    reports
  };

  // Write JSON output
  fs.mkdirSync(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, 'taxonomy-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
  console.log(`\n📊 JSON data written to: ${path.relative(repoRoot, jsonPath)}`);

  // Generate markdown report
  const markdownReport = generateMarkdownReport(output);
  const mdPath = path.join(outputDir, 'taxonomy-report.md');
  fs.writeFileSync(mdPath, markdownReport);
  console.log(`📝 Taxonomy report written to: ${path.relative(repoRoot, mdPath)}`);
}

// ─── Demographics Summary ───────────────────────────────────────────────────

function extractDemographicsSummary(frontmatter) {
  const demo = frontmatter.demographics;
  if (!demo) return null;

  const summary = {};
  if (typeof demo.veterans === 'number') summary.veterans = demo.veterans;
  if (typeof demo.service_members === 'number') summary.service_members = demo.service_members;
  if (typeof demo.caregivers === 'number') summary.caregivers = demo.caregivers;
  if (typeof demo.dependents === 'number') summary.dependents = demo.dependents;

  const disability = demo.disability;
  if (disability) {
    const atCount = (disability.screen_reader_desktop || 0) +
                    (disability.screen_reader_mobile || 0) +
                    (disability.magnification_zoom || 0) +
                    (disability.speech_input || 0) +
                    (disability.sighted_keyboard || 0);
    if (atCount > 0) summary.assistive_tech_participants = atCount;
    if (disability.cognitive) summary.cognitive_disability_participants = disability.cognitive;
  }

  const location = demo.location;
  if (location) {
    if (typeof location.rural === 'number') summary.rural_participants = location.rural;
    if (typeof location.urban === 'number') summary.urban_participants = location.urban;
  }

  return Object.keys(summary).length > 0 ? summary : null;
}

// ─── Taxonomy Analysis ──────────────────────────────────────────────────────

function generateTaxonomyAnalysis(reports) {
  const analysis = {
    label_frequency: {},
    product_coverage: {},
    user_group_coverage: {},
    cross_product_patterns: [],
    underserved_groups_analysis: {},
    assistive_tech_coverage: {}
  };

  // Count label frequency across all findings
  const labelCounts = {};
  const productFindings = {};
  const userGroupFindings = {};

  for (const report of reports) {
    const product = report.metadata.product || 'Unknown';
    if (!productFindings[product]) productFindings[product] = [];

    for (const finding of report.classified_findings) {
      productFindings[product].push(finding);

      for (const [dimension, labels] of Object.entries(finding.taxonomy_labels)) {
        if (!labelCounts[dimension]) labelCounts[dimension] = {};
        for (const labelObj of labels) {
          if (!labelCounts[dimension][labelObj.label]) {
            labelCounts[dimension][labelObj.label] = 0;
          }
          labelCounts[dimension][labelObj.label]++;
        }

        // Track user group coverage
        if (dimension === 'user_groups') {
          for (const labelObj of labels) {
            if (!userGroupFindings[labelObj.label]) userGroupFindings[labelObj.label] = [];
            userGroupFindings[labelObj.label].push({
              product,
              finding: finding.finding_text.substring(0, 100),
              file: report.file_path
            });
          }
        }
      }
    }
  }

  analysis.label_frequency = labelCounts;

  // Product coverage analysis
  for (const [product, findings] of Object.entries(productFindings)) {
    const themes = new Set();
    const userGroups = new Set();
    const findingTypes = new Set();

    for (const f of findings) {
      if (f.taxonomy_labels.research_themes) {
        f.taxonomy_labels.research_themes.forEach(l => themes.add(l.label));
      }
      if (f.taxonomy_labels.user_groups) {
        f.taxonomy_labels.user_groups.forEach(l => userGroups.add(l.label));
      }
      if (f.taxonomy_labels.finding_types) {
        f.taxonomy_labels.finding_types.forEach(l => findingTypes.add(l.label));
      }
    }

    analysis.product_coverage[product] = {
      total_findings: findings.length,
      themes: [...themes],
      user_groups_studied: [...userGroups],
      finding_types: [...findingTypes]
    };
  }

  // User group coverage
  analysis.user_group_coverage = {};
  for (const [group, findings] of Object.entries(userGroupFindings)) {
    const products = new Set(findings.map(f => f.product));
    analysis.user_group_coverage[group] = {
      total_findings: findings.length,
      products_studied: [...products]
    };
  }

  // Identify cross-product patterns (themes that appear in multiple products)
  const themeProducts = {};
  for (const [product, coverage] of Object.entries(analysis.product_coverage)) {
    for (const theme of coverage.themes) {
      if (!themeProducts[theme]) themeProducts[theme] = new Set();
      themeProducts[theme].add(product);
    }
  }
  analysis.cross_product_patterns = Object.entries(themeProducts)
    .filter(([, products]) => products.size > 2)
    .map(([theme, products]) => ({
      theme,
      products_affected: [...products],
      product_count: products.size
    }))
    .sort((a, b) => b.product_count - a.product_count);

  // Underserved groups analysis
  const allProducts = Object.keys(analysis.product_coverage);
  const allUserGroups = Object.keys(TAXONOMY.user_groups);
  for (const group of allUserGroups) {
    const studied = analysis.user_group_coverage[group];
    const productsStudied = studied ? studied.products_studied : [];
    const productsNotStudied = allProducts.filter(p => !productsStudied.includes(p));
    analysis.underserved_groups_analysis[group] = {
      total_studies_including_group: studied ? studied.total_findings : 0,
      products_with_coverage: productsStudied.length,
      products_without_coverage: productsNotStudied.length,
      gap_products: productsNotStudied.slice(0, 10) // Top 10 gaps
    };
  }

  // Assistive tech coverage
  let totalReportsWithAT = 0;
  let totalReportsWithCognitive = 0;
  const productATCoverage = {};
  for (const report of reports) {
    const product = report.metadata.product || 'Unknown';
    const demo = report.demographics_summary;
    if (demo) {
      if (demo.assistive_tech_participants && demo.assistive_tech_participants > 0) {
        totalReportsWithAT++;
        productATCoverage[product] = (productATCoverage[product] || 0) + 1;
      }
      if (demo.cognitive_disability_participants && demo.cognitive_disability_participants > 0) {
        totalReportsWithCognitive++;
      }
    }
  }
  analysis.assistive_tech_coverage = {
    reports_including_at_users: totalReportsWithAT,
    reports_including_cognitive_disability: totalReportsWithCognitive,
    total_reports: reports.length,
    at_coverage_percentage: reports.length > 0
      ? Math.round((totalReportsWithAT / reports.length) * 100) : 0,
    products_with_at_testing: Object.keys(productATCoverage)
  };

  return analysis;
}

// ─── Markdown Report Generation ─────────────────────────────────────────────

function generateMarkdownReport(data) {
  const { summary, taxonomy_analysis: analysis } = data;
  const lines = [];

  lines.push('# Research Findings Taxonomy Report');
  lines.push('');
  lines.push('> Auto-generated taxonomy analysis of research findings across VA.gov products and teams.');
  lines.push(`> Generated: ${data.generated_at}`);
  lines.push('');
  lines.push('## Purpose');
  lines.push('');
  lines.push('This report provides a taxonomy-based classification of all key findings from research');
  lines.push('studies across the VA.gov ecosystem. It enables researchers and product managers to:');
  lines.push('');
  lines.push('- **Mine cross-project insights** — Find related findings across different products');
  lines.push('- **Identify coverage gaps** — See which user groups or themes lack research');
  lines.push('- **Detect patterns** — Discover recurring themes that span multiple products');
  lines.push('- **Plan future research** — Prioritize studies based on identified gaps');
  lines.push('- **Feed ML pipelines** — Use the companion `taxonomy-data.json` for automated pattern recognition');
  lines.push('');
  lines.push('## How to Use This Report');
  lines.push('');
  lines.push('| Question | Where to Look |');
  lines.push('|----------|---------------|');
  lines.push('| "How much do we know about usability challenges for feature Y?" | [Product Coverage Analysis](#product-coverage-analysis) |');
  lines.push('| "Have we studied this feature with assistive technology users?" | [Assistive Technology Coverage](#assistive-technology-coverage) |');
  lines.push('| "Do people who use feature X also use feature Y?" | [Cross-Product Patterns](#cross-product-patterns) |');
  lines.push('| "What user groups are we missing in our research?" | [Underserved Groups Gap Analysis](#underserved-groups-gap-analysis) |');
  lines.push('| "What are the most common finding types?" | [Label Frequency Analysis](#label-frequency-analysis) |');
  lines.push('');

  // ─── Summary Section ────────────────────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total files scanned | ${summary.total_reports_scanned} |`);
  lines.push(`| Reports with classified findings | ${summary.reports_with_findings} |`);
  lines.push(`| Total key findings analyzed | ${summary.total_key_findings} |`);
  lines.push(`| Files skipped (no frontmatter) | ${summary.skipped.no_frontmatter} |`);
  lines.push(`| Files skipped (no key_findings) | ${summary.skipped.no_key_findings} |`);
  lines.push(`| Files skipped (placeholder data) | ${summary.skipped.placeholder_only} |`);
  lines.push('');

  // ─── Taxonomy Dimensions ────────────────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## Taxonomy Dimensions');
  lines.push('');
  lines.push('Each key finding is classified across these dimensions:');
  lines.push('');
  lines.push('| Dimension | Description | Labels |');
  lines.push('|-----------|-------------|--------|');
  lines.push(`| **finding_types** | What kind of finding is this? | ${Object.keys(TAXONOMY.finding_types).join(', ')} |`);
  lines.push(`| **product_areas** | Which product area does it relate to? | ${Object.keys(TAXONOMY.product_areas).join(', ')} |`);
  lines.push(`| **user_groups** | Which user populations are involved? | ${Object.keys(TAXONOMY.user_groups).join(', ')} |`);
  lines.push(`| **research_themes** | What UX theme does it address? | ${Object.keys(TAXONOMY.research_themes).join(', ')} |`);
  lines.push(`| **veteran_journey_stages** | Where in the veteran journey? | ${Object.keys(TAXONOMY.veteran_journey_stages).join(', ')} |`);
  lines.push(`| **severity_indicators** | How severe is the issue? | ${Object.keys(TAXONOMY.severity_indicators).join(', ')} |`);
  lines.push(`| **emotional_states** | What emotional response was observed? | ${Object.keys(TAXONOMY.emotional_states).join(', ')} |`);
  lines.push('');

  // ─── Label Frequency ────────────────────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## Label Frequency Analysis');
  lines.push('');
  lines.push('How often each taxonomy label appears across all classified findings.');
  lines.push('');

  for (const [dimension, labels] of Object.entries(analysis.label_frequency)) {
    const sorted = Object.entries(labels).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) continue;

    lines.push(`### ${formatDimensionName(dimension)}`);
    lines.push('');
    lines.push('| Label | Count |');
    lines.push('|-------|-------|');
    for (const [label, count] of sorted) {
      lines.push(`| ${label} | ${count} |`);
    }
    lines.push('');
  }

  // ─── Cross-Product Patterns ─────────────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## Cross-Product Patterns');
  lines.push('');
  lines.push('Research themes that appear across 3 or more products, indicating systemic patterns.');
  lines.push('');

  if (analysis.cross_product_patterns.length === 0) {
    lines.push('_No cross-product patterns detected with 3+ products._');
  } else {
    for (const pattern of analysis.cross_product_patterns.slice(0, 15)) {
      lines.push(`### ${formatDimensionName(pattern.theme)} (${pattern.product_count} products)`);
      lines.push('');
      lines.push('Products affected:');
      for (const p of pattern.products_affected.slice(0, 10)) {
        lines.push(`- ${p}`);
      }
      if (pattern.products_affected.length > 10) {
        lines.push(`- _...and ${pattern.products_affected.length - 10} more_`);
      }
      lines.push('');
    }
  }

  // ─── Product Coverage ───────────────────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## Product Coverage Analysis');
  lines.push('');
  lines.push('Research coverage by product, showing which themes and user groups have been studied.');
  lines.push('');

  const productEntries = Object.entries(analysis.product_coverage)
    .filter(([name]) => name !== 'Unknown' && name !== 'Product Name')
    .sort((a, b) => b[1].total_findings - a[1].total_findings);

  lines.push('| Product | Findings | Themes Studied | User Groups Studied |');
  lines.push('|---------|----------|----------------|---------------------|');
  for (const [product, coverage] of productEntries.slice(0, 40)) {
    lines.push(`| ${product} | ${coverage.total_findings} | ${coverage.themes.join(', ') || '_none_'} | ${coverage.user_groups_studied.join(', ') || '_none_'} |`);
  }
  if (productEntries.length > 40) {
    lines.push(`| _...${productEntries.length - 40} more products_ | | | |`);
  }
  lines.push('');

  // ─── Assistive Technology Coverage ──────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## Assistive Technology Coverage');
  lines.push('');
  lines.push(`Of **${analysis.assistive_tech_coverage.total_reports}** research reports analyzed:`);
  lines.push('');
  lines.push(`- **${analysis.assistive_tech_coverage.reports_including_at_users}** reports (${analysis.assistive_tech_coverage.at_coverage_percentage}%) included assistive technology users`);
  lines.push(`- **${analysis.assistive_tech_coverage.reports_including_cognitive_disability}** reports included participants with cognitive disabilities`);
  lines.push('');

  if (analysis.assistive_tech_coverage.products_with_at_testing.length > 0) {
    lines.push('### Products with AT Testing');
    lines.push('');
    for (const p of analysis.assistive_tech_coverage.products_with_at_testing) {
      lines.push(`- ${p}`);
    }
    lines.push('');
  }

  // ─── Underserved Groups Gap Analysis ────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## Underserved Groups Gap Analysis');
  lines.push('');
  lines.push('Shows which user groups have the least research coverage, helping prioritize inclusive research.');
  lines.push('');

  const groupEntries = Object.entries(analysis.underserved_groups_analysis)
    .sort((a, b) => a[1].total_studies_including_group - b[1].total_studies_including_group);

  lines.push('| User Group | Findings Mentioning Group | Products With Coverage | Products Without Coverage |');
  lines.push('|------------|--------------------------|------------------------|---------------------------|');
  for (const [group, info] of groupEntries) {
    lines.push(`| ${formatDimensionName(group)} | ${info.total_studies_including_group} | ${info.products_with_coverage} | ${info.products_without_coverage} |`);
  }
  lines.push('');

  // Show gap details for least-covered groups
  lines.push('### Largest Coverage Gaps');
  lines.push('');
  for (const [group, info] of groupEntries.slice(0, 5)) {
    if (info.gap_products.length > 0) {
      lines.push(`**${formatDimensionName(group)}** — ${info.total_studies_including_group} findings across ${info.products_with_coverage} products`);
      lines.push('');
      lines.push('Products without coverage for this group:');
      for (const p of info.gap_products.slice(0, 5)) {
        lines.push(`- ${p}`);
      }
      if (info.gap_products.length > 5) {
        lines.push(`- _...and ${info.gap_products.length - 5} more_`);
      }
      lines.push('');
    }
  }

  // ─── ML Pipeline Integration ────────────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## ML Pipeline Integration');
  lines.push('');
  lines.push('The companion file `taxonomy-data.json` contains structured data for machine learning pipelines.');
  lines.push('');
  lines.push('### Data Schema');
  lines.push('');
  lines.push('Each finding in the JSON has this structure:');
  lines.push('');
  lines.push('```json');
  lines.push('{');
  lines.push('  "finding_id": 1,');
  lines.push('  "finding_text": "The full text of the key finding",');
  lines.push('  "taxonomy_labels": {');
  lines.push('    "finding_types": [{"label": "usability_issue", "confidence": 0.8}],');
  lines.push('    "product_areas": [{"label": "health_care", "confidence": 0.6}],');
  lines.push('    "user_groups": [{"label": "veterans", "confidence": 0.9}],');
  lines.push('    "research_themes": [{"label": "form_completion", "confidence": 0.7}],');
  lines.push('    "veteran_journey_stages": [{"label": "applying_for_benefits", "confidence": 0.5}],');
  lines.push('    "severity_indicators": [{"label": "high", "confidence": 0.6}],');
  lines.push('    "emotional_states": [{"label": "frustrated", "confidence": 0.4}]');
  lines.push('  }');
  lines.push('}');
  lines.push('```');
  lines.push('');
  lines.push('### Pattern Recognition Use Cases');
  lines.push('');
  lines.push('| Use Case | JSON Query Approach |');
  lines.push('|----------|---------------------|');
  lines.push('| Find all usability issues for a product | Filter by `product_areas` + `finding_types: usability_issue` |');
  lines.push('| Find accessibility findings | Filter by `finding_types: accessibility_barrier` or `user_groups: assistive_tech_users` |');
  lines.push('| Cross-product theme analysis | Group by `research_themes`, count across `product_areas` |');
  lines.push('| User group gap detection | For each product, check which `user_groups` have zero findings |');
  lines.push('| Severity trending | Group by `severity_indicators` over time (using report `date`) |');
  lines.push('| Emotional pattern detection | Filter by `emotional_states` to find pain points |');
  lines.push('');

  // ─── Methodology ───────────────────────────────────────────────────────
  lines.push('---');
  lines.push('');
  lines.push('## Methodology');
  lines.push('');
  lines.push('### How Findings Are Classified');
  lines.push('');
  lines.push('1. **Scanning**: All markdown files in `/products` and `/teams` matching research findings');
  lines.push('   naming patterns are identified (e.g., `*findings*`, `*research-report*`).');
  lines.push('2. **Extraction**: YAML frontmatter is parsed and `key_findings` arrays are extracted.');
  lines.push('3. **Classification**: Each finding is matched against keyword patterns for each taxonomy');
  lines.push('   dimension. A confidence score (0-1) is calculated based on the proportion of matched keywords.');
  lines.push('4. **Aggregation**: Labels are aggregated across all findings to generate frequency counts,');
  lines.push('   cross-product patterns, and gap analyses.');
  lines.push('');
  lines.push('### Confidence Scoring');
  lines.push('');
  lines.push('- Each taxonomy label has a set of keyword patterns');
  lines.push('- Confidence = (matched keywords) / max(30% of total keywords for that label, 1)');
  lines.push('- The denominator is floored to 1 so that labels with very few keywords (e.g., 2) still require at least 1 match for full confidence');
  lines.push('- Capped at 1.0; higher values indicate stronger matches');
  lines.push('- Only labels with at least 1 keyword match are included');
  lines.push('');
  lines.push('### Limitations');
  lines.push('');
  lines.push('- Keyword-based classification cannot capture nuance or context the way human reviewers can');
  lines.push('- Findings without YAML frontmatter `key_findings` are not included');
  lines.push('- Placeholder/template data is filtered out but some edge cases may slip through');
  lines.push('- Confidence scores are heuristic-based, not from a trained ML model');
  lines.push('');
  lines.push('### Relationship to Existing Taxonomy Systems');
  lines.push('');
  lines.push('This taxonomy extends the existing label systems in the repository:');
  lines.push('');
  lines.push('| System | File | Relationship |');
  lines.push('|--------|------|-------------|');
  lines.push('| Research Repository Labels | `platform/research/research-labels.md` | Study-level metadata (audiences, products, methods) |');
  lines.push('| Master Taxonomy | `platform/research/sharing-research/master-taxonomy.md` | Design system components and patterns |');
  lines.push('| OCTO Metadata Labels | `platform/research/copilot-prompts/research-report/add-metadata-labels-to-findings-prompt.md` | Per-finding labels (applied manually via Copilot) |');
  lines.push('| **This Taxonomy** | `reports/research-taxonomy/` | **Automated per-finding classification across all studies** |');
  lines.push('');
  lines.push('### Regenerating This Report');
  lines.push('');
  lines.push('```bash');
  lines.push('node scripts/research-taxonomy-generator.js');
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

function formatDimensionName(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Run ────────────────────────────────────────────────────────────────────
main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
