const crypto = require('crypto');

function normalizeForId(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function buildFindingMergeKey({ sourceFile, findingTitle }) {
  return `${normalizeForId(sourceFile)}|${normalizeForId(findingTitle)}`;
}

function generateDeterministicFindingId({ sourceFile, findingTitle }) {
  const seed = buildFindingMergeKey({ sourceFile, findingTitle });
  const digest = crypto.createHash('sha1').update(seed).digest('hex');

  // Keep legacy-looking numeric IDs while remaining deterministic.
  const bucket = Number.parseInt(digest.slice(0, 12), 16) % 1000000;
  return `F${String(bucket).padStart(6, '0')}`;
}

function generateDeterministicFindingUid({ sourceFile, findingIdLocal, findingTitle }) {
  const seed = [
    normalizeForId(sourceFile),
    normalizeForId(findingIdLocal),
    normalizeForId(findingTitle),
  ].join('|');
  const digest = crypto.createHash('sha1').update(seed).digest('hex');
  return `KF-${digest.slice(0, 12)}`;
}

module.exports = {
  buildFindingMergeKey,
  generateDeterministicFindingId,
  generateDeterministicFindingUid,
};
