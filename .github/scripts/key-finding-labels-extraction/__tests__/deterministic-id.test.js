const test = require('node:test');
const assert = require('node:assert/strict');
const {
  generateDeterministicFindingId,
  generateDeterministicFindingUid,
} = require('../deterministic-id');

test('deterministic id is stable for same input', () => {
  const id1 = generateDeterministicFindingId({
    sourceFile: 'products/a/research/findings.md',
    findingTitle: 'Veterans struggle to find forms',
  });

  const id2 = generateDeterministicFindingId({
    sourceFile: 'products/a/research/findings.md',
    findingTitle: 'Veterans struggle to find forms',
  });

  assert.equal(id1, id2);
  assert.match(id1, /^F\d{6}$/);
});

test('deterministic id changes when source/title changes', () => {
  const id1 = generateDeterministicFindingId({
    sourceFile: 'products/a/research/findings.md',
    findingTitle: 'A',
  });
  const id2 = generateDeterministicFindingId({
    sourceFile: 'products/a/research/findings.md',
    findingTitle: 'B',
  });

  assert.notEqual(id1, id2);
});

test('deterministic uid is stable and includes local id dimension', () => {
  const uid1 = generateDeterministicFindingUid({
    sourceFile: 'products/a/research/findings.md',
    findingIdLocal: '1',
    findingTitle: 'Veterans struggle to find forms',
  });
  const uid2 = generateDeterministicFindingUid({
    sourceFile: 'products/a/research/findings.md',
    findingIdLocal: '1',
    findingTitle: 'Veterans struggle to find forms',
  });
  const uid3 = generateDeterministicFindingUid({
    sourceFile: 'products/a/research/findings.md',
    findingIdLocal: '2',
    findingTitle: 'Veterans struggle to find forms',
  });

  assert.equal(uid1, uid2);
  assert.match(uid1, /^KF-[a-f0-9]{12}$/);
  assert.notEqual(uid1, uid3);
});
