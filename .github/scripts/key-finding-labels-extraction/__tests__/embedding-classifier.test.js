const test = require('node:test');
const assert = require('node:assert/strict');
const { createEmbeddingClassifier, classifyWithEmbeddingStub } = require('../embedding-classifier');

test('createEmbeddingClassifier returns disabled classifier for off mode', () => {
  const classifier = createEmbeddingClassifier({ mode: 'off' });
  assert.equal(classifier.mode, 'off');
  assert.equal(classifier.enabled, false);
  assert.deepEqual(classifier.classify('anything'), {});
});

test('classifyWithEmbeddingStub returns dimension matches for overlapping tokens', () => {
  const result = classifyWithEmbeddingStub({
    text: 'Users were confused during sign in and login steps',
    taxonomy: {
      finding_types: {
        usability_issue: ['confused', 'struggle'],
      },
      research_themes: {
        authentication_login: ['sign in', 'login', 'password'],
      },
    },
  });

  assert.ok(Array.isArray(result.finding_types));
  assert.ok(result.finding_types.some(item => item.label === 'usability_issue'));
  assert.ok(Array.isArray(result.research_themes));
  assert.ok(result.research_themes.some(item => item.label === 'authentication_login'));
});

test('createEmbeddingClassifier throws for unsupported mode', () => {
  assert.throws(() => createEmbeddingClassifier({ mode: 'local-transformer' }), /Unsupported embedding mode/);
});
