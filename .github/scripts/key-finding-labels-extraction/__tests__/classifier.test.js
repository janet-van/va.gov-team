const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyText, fuseSuggestedLabels, enrichFindings } = require('../classifier');

test('classifyText returns confidence-scored matches', () => {
  const result = classifyText({
    text: 'Veterans were frustrated and confused when they could not sign in with Login.gov',
  });

  assert.ok(Array.isArray(result.research_themes));
  assert.ok(result.research_themes.some(item => item.label === 'authentication_login'));
  assert.ok(Array.isArray(result.emotional_states));
  assert.ok(result.emotional_states.some(item => ['frustrated', 'confused'].includes(item.label)));
  assert.ok(Array.isArray(result.finding_types));
  assert.ok(result.finding_types.some(item => ['usability_issue', 'technical_problem'].includes(item.label)));
});

test('enrichFindings enriches canonical findings with suggested labels', () => {
  const findings = [
    {
      finding_uid: 'KF-1',
      finding_id_local: 'F000001',
      source_file: 'products/demo/findings.md',
      source_kind: 'explicit',
      finding_title: 'Users were confused by sign in errors',
      supporting_context_texts: [],
    },
  ];

  const enriched = enrichFindings(findings);
  assert.equal(enriched.length, 1);
  assert.equal(enriched[0].finding_uid, 'KF-1');
  assert.ok(enriched[0].suggested_labels.research_themes);
  assert.ok(enriched[0].classification_engine);
  assert.equal(enriched[0].classification_engine.fusion_mode, 'rules_only');
  assert.equal(enriched[0].classification_engine.embedding_enabled, false);
});

test('enrichFindings includes embedding suggestions when embedding mode is enabled', () => {
  const findings = [
    {
      finding_uid: 'KF-2',
      finding_id_local: 'F000002',
      source_file: 'products/demo/findings.md',
      source_kind: 'explicit',
      finding_title: 'Veterans were confused during sign in',
      supporting_context_texts: ['Login was hard to find.'],
    },
  ];

  const embeddingClassifier = {
    mode: 'stub',
    enabled: true,
    classify() {
      return {
        research_themes: [{ label: 'authentication_login', confidence: 0.8 }],
      };
    },
  };

  const enriched = enrichFindings(findings, {
    embeddingClassifier,
    embeddingWeight: 0.42,
  });
  assert.equal(enriched.length, 1);
  assert.ok(enriched[0].embedding_suggestions.research_themes);
  assert.equal(enriched[0].classification_engine.embedding_mode, 'stub');
  assert.equal(enriched[0].classification_engine.embedding_enabled, true);
  assert.equal(enriched[0].classification_engine.embedding_weight, 0.42);
});

test('fuseSuggestedLabels combines rule and embedding scores with threshold filtering', () => {
  const fused = fuseSuggestedLabels({
    ruleSuggestedLabels: {
      research_themes: [
        { label: 'authentication_login', confidence: 0.6 },
        { label: 'help_support', confidence: 0.2 },
      ],
    },
    embeddingSuggestions: {
      research_themes: [
        { label: 'authentication_login', confidence: 0.9 },
        { label: 'help_support', confidence: 0.7 },
      ],
    },
    embeddingWeight: 0.5,
    fusionThreshold: 0.45,
  });

  assert.ok(Array.isArray(fused.research_themes));
  assert.ok(fused.research_themes.some(item => item.label === 'authentication_login'));
  assert.ok(fused.research_themes.some(item => item.label === 'help_support'));
  const auth = fused.research_themes.find(item => item.label === 'authentication_login');
  assert.equal(auth.confidence, 0.75);
});

test('enrichFindings applies weighted fusion when fusionMode=weighted', () => {
  const findings = [
    {
      finding_uid: 'KF-3',
      finding_id_local: 'F000003',
      source_file: 'products/demo/findings.md',
      source_kind: 'explicit',
      finding_title: 'Veterans were confused during sign in',
      supporting_context_texts: [],
    },
  ];

  const embeddingClassifier = {
    mode: 'stub',
    enabled: true,
    classify() {
      return {
        research_themes: [{ label: 'authentication_login', confidence: 0.9 }],
      };
    },
  };

  const enriched = enrichFindings(findings, {
    embeddingClassifier,
    fusionMode: 'weighted',
    fusionThreshold: 0.1,
    embeddingWeight: 0.5,
  });

  assert.equal(enriched[0].classification_engine.fusion_mode, 'weighted');
  assert.ok(enriched[0].rule_suggested_labels.research_themes);
  assert.ok(enriched[0].suggested_labels.research_themes);
  assert.ok(
    enriched[0].suggested_labels.research_themes.some(
      item => item.label === 'authentication_login',
    ),
  );
});
