const { glob } = require("glob");

const RESEARCH_FILE_PATTERNS = [
  /.*[Ff]indings\.md$/,
  /.*[Rr]eport\.md$/,
  /.*[Ii]nsights\.md$/,
  /.*[Rr]esearch-[Ff]indings\.md$/,
  /.*[Rr]esearch-[Rr]eport\.md$/,
  /.*[Rr]esearch-[Ii]nsights\.md$/,
  /.*[Uu]ser-[Rr]esearch-[Ff]indings\.md$/,
  /.*[Uu]ser-[Rr]esearch-[Rr]eport\.md$/,
  /.*[Ss]tudy-[Ff]indings\.md$/,
  /.*[Ss]tudy-[Rr]eport\.md$/,
];

function isResearchReportPath(filePath) {
  return RESEARCH_FILE_PATTERNS.some((pattern) => pattern.test(filePath));
}

async function findResearchReportFiles(roots = ["products", "teams"]) {
  const allFiles = [];
  for (const root of roots) {
    const files = await glob(`${root}/**/*.md`, {
      nodir: true,
      nocase: true,
    });
    allFiles.push(...files);
  }

  return Array.from(new Set(allFiles)).filter(isResearchReportPath).sort();
}

module.exports = {
  findResearchReportFiles,
  isResearchReportPath,
};
