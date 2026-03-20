const { glob } = require("glob");

const RESEARCH_GLOB_SUFFIXES = [
  '**/*findings*.md',
  '**/*research-report*.md',
  '**/*report*.md',
];

async function findResearchReportFiles(roots = ["products", "teams"]) {
  const allFiles = new Set();
  for (const root of roots) {
    for (const suffix of RESEARCH_GLOB_SUFFIXES) {
      const files = await glob(`${root}/${suffix}`, {
        nodir: true,
        nocase: true,
        ignore: ['**/node_modules/**', '**/template*', '**/*template*'],
      });
      files.forEach(file => allFiles.add(file));
    }
  }

  return Array.from(allFiles).sort();
}

module.exports = {
  findResearchReportFiles,
};
