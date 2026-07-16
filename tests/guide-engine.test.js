const test = require('node:test');
const assert = require('node:assert/strict');
const { generateGuide, calculateStreak } = require('../guide-engine');

const problems = [
  { slug: 'array-easy', title: 'Array Easy', difficulty: 'easy', acceptance: 60, topics: ['Array'], companies: [{ name: 'A', frequency: 80 }], examples: [{ input: '1', output: '1' }] },
  { slug: 'array-medium', title: 'Array Medium', difficulty: 'medium', acceptance: 45, topics: ['Array', 'Hash Table'], companies: [{ name: 'A', frequency: 90 }], examples: [] },
  { slug: 'tree-medium', title: 'Tree Medium', difficulty: 'medium', acceptance: 50, topics: ['Tree'], companies: [{ name: 'B', frequency: 70 }], examples: [] },
  { slug: 'dp-hard', title: 'DP Hard', difficulty: 'hard', acceptance: 30, topics: ['Dynamic Programming'], companies: [{ name: 'C', frequency: 100 }], examples: [] }
];

test('calculates consecutive practice days', () => {
  assert.equal(calculateStreak(['2026-07-14', '2026-07-15', '2026-07-16'], '2026-07-16'), 3);
  assert.equal(calculateStreak(['2026-07-14', '2026-07-15'], '2026-07-16'), 2);
});

test('starts a new learner with an easy locally testable recommendation', () => {
  const guide = generateGuide({ problems }, { today: '2026-07-16', solved: {}, attempted: {}, submissions: [] });
  assert.equal(guide.profile.targetDifficulty, 'easy');
  assert.equal(guide.recommendations[0].slug, 'array-easy');
  assert.match(guide.message, /足够的练习记录/);
});

test('prioritizes an attempted weakness and explains why', () => {
  const guide = generateGuide({ problems }, {
    today: '2026-07-16',
    solved: {},
    attempted: { 'array-medium': '2026-07-16' },
    submissions: [{ slug: 'array-medium', kind: 'submit', passed: false, createdAt: '2026-07-16T08:00:00.000Z' }]
  });
  assert.equal(guide.recommendations[0].slug, 'array-medium');
  assert.equal(guide.recommendations[0].mode, 'retry');
  assert.equal(guide.weakTopics[0].topic, 'Array');
  assert.match(guide.message, /遇到了阻力/);
});
