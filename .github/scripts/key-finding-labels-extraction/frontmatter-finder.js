const { findResearchReportFiles } = require('./finder');

async function findFrontmatterResearchFiles(roots = ['products', 'teams']) {
  return findResearchReportFiles(roots);
}

module.exports = {
  findFrontmatterResearchFiles,
};
