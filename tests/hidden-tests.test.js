const test = require('node:test');
const assert = require('node:assert/strict');
const { getHiddenTests, getHiddenTestCount } = require('../hidden-tests');
const { judgeCode, normalizeOutput } = require('../server');

const programs = {
  'two-sum': String.raw`const fs=require('fs');const lines=fs.readFileSync(0,'utf8').trim().split(/\n/);const nums=lines[0].split(/\s+/).map(Number);const target=Number(lines[1]);const seen=new Map();for(let i=0;i<nums.length;i++){if(seen.has(target-nums[i])){console.log(seen.get(target-nums[i]),i);break}seen.set(nums[i],i)}`,
  'valid-parentheses': `const s=require('fs').readFileSync(0,'utf8').trim();const pairs={')':'(',']':'[','}':'{'};const stack=[];let valid=true;for(const c of s){if('([{'.includes(c))stack.push(c);else if(stack.pop()!==pairs[c]){valid=false;break}}console.log(valid&&stack.length===0?'true':'false')`,
  'best-time-to-buy-and-sell-stock': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\s+/).map(Number);let low=Infinity,best=0;for(const x of a){low=Math.min(low,x);best=Math.max(best,x-low)}console.log(best)`,
  'lru-cache': String.raw`const lines=require('fs').readFileSync(0,'utf8').trim().split(/\n/);const capacity=Number(lines[0]),cache=new Map(),out=[];for(const line of lines.slice(1)){const [op,k,v]=line.split(/\s+/),key=Number(k);if(op==='get'){if(!cache.has(key))out.push(-1);else{const value=cache.get(key);cache.delete(key);cache.set(key,value);out.push(value)}}else{if(cache.has(key))cache.delete(key);cache.set(key,Number(v));if(cache.size>capacity)cache.delete(cache.keys().next().value)}}console.log(out.join('\n'))`
};

test('keeps substantial hidden suites on the server', () => {
  assert.equal(getHiddenTestCount('two-sum'), 27);
  assert.equal(getHiddenTestCount('valid-parentheses'), 35);
  assert.equal(getHiddenTestCount('best-time-to-buy-and-sell-stock'), 30);
  assert.equal(getHiddenTestCount('lru-cache'), 25);
  assert.equal(getHiddenTestCount('unknown-problem'), 0);
});

for (const [slug, code] of Object.entries(programs)) {
  test(`${slug} reference algorithm passes every hidden case`, async () => {
    const cases = getHiddenTests(slug);
    const results = await judgeCode({ language: 'javascript', code, tests: cases });
    assert.equal(results.length, cases.length);
    results.forEach((result, index) => {
      assert.equal(result.exitCode, 0, result.stderr);
      assert.equal(normalizeOutput(result.stdout), normalizeOutput(cases[index].output), `hidden case ${index + 1}`);
    });
  });
}

test('judge stops after the first failed case', async () => {
  const cases = getHiddenTests('best-time-to-buy-and-sell-stock');
  const results = await judgeCode({ language: 'javascript', code: 'console.log(999)', tests: cases });
  assert.equal(results.length, 1);
});

test('C++ judge compiles once and evaluates multiple cases', async (t) => {
  const code = '#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b<<"\\n";}';
  const cases = [{ input: '1 2', output: '3' }, { input: '20 22', output: '42' }];
  const results = await judgeCode({ language: 'cpp', code, tests: cases });
  if (results[0]?.stderr.includes('spawn g++ ENOENT')) return t.skip('g++ is not installed');
  assert.equal(results.length, cases.length);
  results.forEach((result, index) => assert.equal(normalizeOutput(result.stdout), cases[index].output));
});
