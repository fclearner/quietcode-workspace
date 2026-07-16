const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../data/problems.json');
const { runCode, normalizeOutput } = require('../server');

test('curated problems start with TODO skeletons and keep answers separately', () => {
  const legacyAnswerMarkers = /const seen = new Map\(\)|const pairs =|let low = Infinity, profit = 0/;
  for (const slug of ['two-sum', 'valid-parentheses', 'best-time-to-buy-and-sell-stock']) {
    const problem = data.problems.find((item) => item.slug === slug);
    assert.ok(problem, `${slug} should exist`);
    for (const language of ['javascript', 'python', 'cpp']) assert.match(problem.templates[language], /TODO/);
    assert.doesNotMatch(problem.templates.javascript, legacyAnswerMarkers);
    assert.ok(problem.solutions.javascript.length > 30);
    assert.ok(problem.solutions.python.length > 30);
    assert.ok(problem.solutions.cpp.length > 30);
  }
});

test('starter skeletons do not pass the first example', async () => {
  for (const slug of ['two-sum', 'valid-parentheses', 'best-time-to-buy-and-sell-stock']) {
    const problem = data.problems.find((item) => item.slug === slug);
    const result = await runCode({ language: 'javascript', code: problem.templates.javascript, input: problem.examples[0].input });
    assert.notEqual(normalizeOutput(result.stdout), normalizeOutput(problem.examples[0].output), `${slug} starter must not contain the answer`);
  }
});
