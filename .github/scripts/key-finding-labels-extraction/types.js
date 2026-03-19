/**
 * @typedef {Object} ValidationIssue
 * @property {string} file
 * @property {string|number|null} finding_id
 * @property {string} code
 * @property {string} message
 */

/**
 * @typedef {Object} ParsedBlock
 * @property {string} file
 * @property {number} blockIndex
 * @property {string} raw
 * @property {Object|null} data
 * @property {boolean} wrapped
 */

/**
 * @typedef {Object} NormalizedFinding
 * @property {string} source_file
 * @property {string|number} finding_id_local
 * @property {string} finding_uid
 * @property {string} finding_title
 * @property {Record<string, string[]>} labels
 * @property {string[]} service_journey_mapping
 * @property {string[]} pattern_triggers
 */

module.exports = {};
