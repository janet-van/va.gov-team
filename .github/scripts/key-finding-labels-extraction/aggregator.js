const { LABEL_CATEGORIES } = require('./taxonomy');

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function toObjectSortedByCount(map) {
  return Object.fromEntries(
    Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  );
}

function aggregateFindings(findings) {
  const byPattern = new Map();
  const byServiceJourney = new Map();
  const byLabel = new Map();
  const labelCooccurrence = new Map();

  for (const finding of findings) {
    for (const pattern of finding.pattern_triggers) {
      increment(byPattern, pattern);
    }

    for (const journey of finding.service_journey_mapping) {
      increment(byServiceJourney, journey);
    }

    const flattened = [];

    for (const category of LABEL_CATEGORIES) {
      const values = finding.labels[category] || [];
      for (const value of values) {
        const key = `${category}:${value}`;
        flattened.push(key);
        increment(byLabel, key);
      }
    }

    const unique = Array.from(new Set(flattened)).sort();
    for (let i = 0; i < unique.length; i += 1) {
      for (let j = i + 1; j < unique.length; j += 1) {
        increment(labelCooccurrence, `${unique[i]} | ${unique[j]}`);
      }
    }
  }

  return {
    pattern_trigger_counts: toObjectSortedByCount(byPattern),
    service_journey_counts: toObjectSortedByCount(byServiceJourney),
    label_counts: toObjectSortedByCount(byLabel),
    label_cooccurrence_counts: toObjectSortedByCount(labelCooccurrence),
  };
}

module.exports = {
  aggregateFindings,
};
