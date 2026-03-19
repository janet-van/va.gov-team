const test = require('node:test');
const assert = require('node:assert/strict');
const { parseLabelBlocksFromContent } = require('../parser');

test('parser handles wrapped and unwrapped blocks', () => {
  const content = `
# Demo

\`\`\`yaml key-finding-labels
finding_id: 1
finding_title: "A"
labels:
  finding_types:
    - usability_issue
  severity_levels: high
\`\`\`

\`\`\`yaml key-finding-labels
key-finding-labels:
  finding_id: 2
  finding_title: "B"
  labels:
    finding_types:
      - unmet_need
    severity_levels: medium
\`\`\`
`;

  const blocks = parseLabelBlocksFromContent(content, 'products/demo/findings.md');
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].wrapped, false);
  assert.equal(blocks[0].data.finding_id, 1);
  assert.equal(blocks[1].wrapped, true);
  assert.equal(blocks[1].data.finding_id, 2);
});

test('parser records malformed yaml errors', () => {
  const content = `
\`\`\`yaml key-finding-labels
finding_id: 1
finding_title "bad"
\`\`\`
`;

  const blocks = parseLabelBlocksFromContent(content, 'products/demo/findings.md');
  assert.equal(blocks.length, 1);
  assert.ok(blocks[0].parseError);
  assert.equal(blocks[0].parseError.code, 'MALFORMED_YAML');
});

test('parser flags indentation style warning', () => {
  const content = `
\`\`\`yaml key-finding-labels
  finding_id: 1
  finding_title: "Indented"
  labels:
    finding_types:
      - usability_issue
    severity_levels: high
\`\`\`
`;

  const blocks = parseLabelBlocksFromContent(content, 'products/demo/findings.md');
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].styleWarnings.length, 1);
  assert.equal(blocks[0].styleWarnings[0].code, 'STYLE_INDENTED_BLOCK');
});

test('parser supports legacy Labels yaml blocks and normalizes Finding key format', () => {
  const content = `
**Labels:**
\`\`\`yaml
Finding 1: Veterans struggled to navigate
  user_groups:
    - veterans
  finding_types: usability_issue
  severity_levels: high
\`\`\`
`;

  const blocks = parseLabelBlocksFromContent(content, 'tmp/sample.md');
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].kind, 'legacy-labels');
  assert.equal(blocks[0].data.finding_title, 'Finding 1: Veterans struggled to navigate');
  assert.equal(blocks[0].data.labels.finding_types, 'usability_issue');
});
