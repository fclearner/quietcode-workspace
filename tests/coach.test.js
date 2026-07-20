const test = require('node:test');
const assert = require('node:assert/strict');
const { localCoach } = require('../server');

test('local coach works without Codex and returns a minimal topic hint', () => {
  const result = localCoach({
    message: '我没思路，只给一个提示',
    context: { title: 'Two Sum', topics: ['Array', 'Hash Table'], code: '// TODO', solved: false },
    history: []
  });
  assert.equal(result.provider, 'local');
  assert.match(result.answer, /补数|见过/);
  assert.doesNotMatch(result.answer, /function twoSum|完整答案/);
});

test('local coach diagnoses hidden-case failures without revealing the case', () => {
  const result = localCoach({
    message: '为什么失败了',
    context: { title: 'LRU Cache', topics: ['Hash Table', 'Doubly-Linked List'], code: 'class LRUCache {}', lastResult: '隐藏用例未通过。' }
  });
  assert.match(result.answer, /边界|容量为 1/);
  assert.match(result.answer, /双向链表/);
});

test('local coach validates empty questions', () => {
  assert.throws(() => localCoach({ message: '   ' }), /请输入/);
});
