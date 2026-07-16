const test = require('node:test');
const assert = require('node:assert/strict');
const { runCode, normalizeOutput } = require('../server');

test('normalizes trailing whitespace and CRLF', () => {
  assert.equal(normalizeOutput('hello  \r\nworld\r\n'), 'hello\nworld');
});

test('runs JavaScript with stdin', async () => {
  const result = await runCode({
    language: 'javascript',
    code: "const s=require('fs').readFileSync(0,'utf8').trim(); console.log(s.toUpperCase())",
    input: 'algolab\n'
  });
  assert.equal(result.exitCode, 0);
  assert.equal(normalizeOutput(result.stdout), 'ALGOLAB');
});

test('runs Python with stdin', async () => {
  const result = await runCode({ language: 'python', code: 'print(sum(map(int, input().split())))', input: '4 5 6\n' });
  assert.equal(result.exitCode, 0);
  assert.equal(normalizeOutput(result.stdout), '15');
});

test('runs C++17 with stdin', async (t) => {
  const result = await runCode({
    language: 'cpp',
    code: '#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b<<"\\n";}',
    input: '20 22\n'
  });
  if (result.stderr.includes('spawn g++ ENOENT')) return t.skip('g++ is not installed');
  assert.equal(result.exitCode, 0, result.stderr);
  assert.equal(normalizeOutput(result.stdout), '42');
});

test('reports syntax errors without crashing the service', async () => {
  const result = await runCode({ language: 'javascript', code: 'const = broken', input: '' });
  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /SyntaxError/);
});
