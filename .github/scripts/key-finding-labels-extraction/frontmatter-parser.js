const yaml = require('js-yaml');

const PLACEHOLDER_VALUES = [
  'product name',
  'team name',
  'goal 1',
  'goal 2',
  'finding 1',
  'finding 2',
  'method 1',
  'method 2',
  'yyyy-mm-dd',
  'yyyy-mm',
  'researcher/designer 1',
  'researcher/designer 2',
  '[study]',
  'x',
];

function extractFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  try {
    return yaml.load(match[1]);
  } catch (error) {
    return null;
  }
}

function isPlaceholderFinding(value) {
  if (typeof value !== 'string') return false;
  const normalized = value.toLowerCase().trim();
  return PLACEHOLDER_VALUES.includes(normalized);
}

function extractDemographicsSummary(frontmatter) {
  const demo = frontmatter && frontmatter.demographics;
  if (!demo || typeof demo !== 'object') return null;

  const summary = {};
  for (const key of ['veterans', 'service_members', 'caregivers', 'dependents']) {
    if (typeof demo[key] === 'number') summary[key] = demo[key];
  }

  const disability = demo.disability;
  if (disability && typeof disability === 'object') {
    const atCount =
      (disability.screen_reader_desktop || 0) +
      (disability.screen_reader_mobile || 0) +
      (disability.magnification_zoom || 0) +
      (disability.speech_input || 0) +
      (disability.sighted_keyboard || 0);

    if (atCount > 0) summary.assistive_tech_participants = atCount;
    if (typeof disability.cognitive === 'number') {
      summary.cognitive_disability_participants = disability.cognitive;
    }
  }

  const location = demo.location;
  if (location && typeof location === 'object') {
    if (typeof location.rural === 'number') summary.rural_participants = location.rural;
    if (typeof location.urban === 'number') summary.urban_participants = location.urban;
  }

  return Object.keys(summary).length > 0 ? summary : null;
}

function parseFrontmatterFindingsFromContent(content, filePath) {
  const warnings = [];
  const frontmatter = extractFrontmatter(content);

  if (!frontmatter || typeof frontmatter !== 'object') {
    return { findings: [], warnings, metadata: null, demographicsSummary: null };
  }

  const keyFindings = Array.isArray(frontmatter.key_findings) ? frontmatter.key_findings : [];
  const findings = [];

  keyFindings.forEach((value, index) => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) return;

    if (isPlaceholderFinding(text) || text.length < 10) {
      warnings.push({
        file: filePath,
        finding_id: null,
        code: 'FRONTMATTER_PLACEHOLDER_KEY_FINDING',
        message: `frontmatter key_findings[${index}] skipped as placeholder/template content`,
      });
      return;
    }

    findings.push({
      source_file: filePath,
      finding_text: text,
      finding_title: text,
      metadata: {
        title: frontmatter.title || null,
        product: frontmatter.product || null,
        team: frontmatter.team || null,
        date: frontmatter.date || null,
        methodology: Array.isArray(frontmatter.methodology) ? frontmatter.methodology : [],
        participants_total: frontmatter.participants_total || null,
        existing_tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      },
      demographics_summary: extractDemographicsSummary(frontmatter),
    });
  });

  return {
    findings,
    warnings,
    metadata: {
      title: frontmatter.title || null,
      product: frontmatter.product || null,
      team: frontmatter.team || null,
      date: frontmatter.date || null,
    },
    demographicsSummary: extractDemographicsSummary(frontmatter),
  };
}

module.exports = {
  extractFrontmatter,
  isPlaceholderFinding,
  extractDemographicsSummary,
  parseFrontmatterFindingsFromContent,
};
