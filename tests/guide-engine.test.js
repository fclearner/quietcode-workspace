const test = require('node:test');
const assert = require('node:assert/strict');
const { generateGuide, calculateStreak, hasCompleteContent, stableDailyRotation } = require('../guide-engine');

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

test('uses a stable date seed for untouched-item rotation', () => {
  const today = stableDailyRotation('two-sum', '2026-07-21');
  assert.equal(today, stableDailyRotation('two-sum', '2026-07-21'));
  assert.notEqual(today, stableDailyRotation('two-sum', '2026-07-22'));
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

test('never recommends a completed item as new training', () => {
  const guide = generateGuide({ problems }, {
    today: '2026-07-16',
    solved: { 'array-easy': '2026-07-15' },
    attempted: { 'array-easy': '2026-07-15' },
    submissions: [{ slug: 'array-easy', kind: 'submit', passed: true, createdAt: '2026-07-15T08:00:00.000Z' }]
  });
  assert.equal(guide.profile.solvedCount, 1);
  assert.ok(guide.recommendations.every((item) => item.slug !== 'array-easy'));
});

test('excludes metadata-only entries when complete local exercises exist', () => {
  const complete = {
    ...problems[0],
    summary: '完整题面', input: '输入', output: '输出',
    templates: { javascript: '// TODO', python: '# TODO', cpp: '// TODO' }
  };
  const metadataOnly = { ...problems[1], companies: [{ name: 'A', frequency: 1000 }] };
  assert.equal(hasCompleteContent(complete), true);
  assert.equal(hasCompleteContent(metadataOnly), false);
  const guide = generateGuide({ problems: [metadataOnly, complete] }, { solved: {}, attempted: {}, submissions: [] });
  assert.deepEqual(guide.recommendations.map((item) => item.slug), [complete.slug]);
});

test('keeps the default daily queue focused and marks rotated items', () => {
  const completeProblems = Array.from({ length: 5 }, (_, index) => ({
    ...problems[0],
    slug: `complete-${index}`,
    title: `Complete ${index}`,
    summary: '完整题面', input: '输入', output: '输出',
    templates: { javascript: '// TODO', python: '# TODO', cpp: '// TODO' }
  }));
  const guide = generateGuide({ problems: completeProblems }, {
    today: '2026-07-21', solved: {}, attempted: {}, submissions: [], dailyGoal: 1
  });
  assert.equal(guide.recommendations.length, 3);
  assert.ok(guide.recommendations.every((item) => item.reason.includes('今天')));
});
