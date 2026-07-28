const test = require('node:test');
const assert = require('node:assert/strict');
const { getHiddenTests, getHiddenTestCount } = require('../hidden-tests');
const { judgeCode, normalizeOutput } = require('../server');

const programs = {
  'two-sum': String.raw`const fs=require('fs');const lines=fs.readFileSync(0,'utf8').trim().split(/\n/);const nums=lines[0].split(/\s+/).map(Number);const target=Number(lines[1]);const seen=new Map();for(let i=0;i<nums.length;i++){if(seen.has(target-nums[i])){console.log(seen.get(target-nums[i]),i);break}seen.set(nums[i],i)}`,
  'valid-parentheses': `const s=require('fs').readFileSync(0,'utf8').trim();const pairs={')':'(',']':'[','}':'{'};const stack=[];let valid=true;for(const c of s){if('([{'.includes(c))stack.push(c);else if(stack.pop()!==pairs[c]){valid=false;break}}console.log(valid&&stack.length===0?'true':'false')`,
  'best-time-to-buy-and-sell-stock': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\s+/).map(Number);let low=Infinity,best=0;for(const x of a){low=Math.min(low,x);best=Math.max(best,x-low)}console.log(best)`,
  'lru-cache': String.raw`const lines=require('fs').readFileSync(0,'utf8').trim().split(/\n/);const capacity=Number(lines[0]),cache=new Map(),out=[];for(const line of lines.slice(1)){const [op,k,v]=line.split(/\s+/),key=Number(k);if(op==='get'){if(!cache.has(key))out.push(-1);else{const value=cache.get(key);cache.delete(key);cache.set(key,value);out.push(value)}}else{if(cache.has(key))cache.delete(key);cache.set(key,Number(v));if(cache.size>capacity)cache.delete(cache.keys().next().value)}}console.log(out.join('\n'))`,
  'design-hashset': String.raw`const lines=require('fs').readFileSync(0,'utf8').trim().split(/\n/),present=new Uint8Array(1000001),out=[];for(const line of lines){const [op,text]=line.split(/\s+/),key=Number(text);if(op==='add')present[key]=1;else if(op==='remove')present[key]=0;else out.push(present[key]?'true':'false')}console.log(out.join('\n'))`,
  'longest-substring-without-repeating-characters': String.raw`const s=require('fs').readFileSync(0,'utf8').replace(/\r?\n$/,'');const last=new Map();let left=0,best=0;for(let right=0;right<s.length;right++){if(last.has(s[right]))left=Math.max(left,last.get(s[right])+1);last.set(s[right],right);best=Math.max(best,right-left+1)}console.log(best)`,
  'maximum-subarray': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\s+/).map(Number);let current=a[0],best=a[0];for(let i=1;i<a.length;i++){current=Math.max(a[i],current+a[i]);best=Math.max(best,current)}console.log(best)`,
  'merge-intervals': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\n/).map(x=>x.split(/\s+/).map(Number)).sort((x,y)=>x[0]-y[0]||x[1]-y[1]),out=[];for(const x of a){const last=out.at(-1);if(!last||x[0]>last[1])out.push(x.slice());else last[1]=Math.max(last[1],x[1])}console.log(out.map(x=>x.join(' ')).join('\n'))`,
  'container-with-most-water': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\s+/).map(Number);let l=0,r=a.length-1,best=0;while(l<r){best=Math.max(best,Math.min(a[l],a[r])*(r-l));if(a[l]<=a[r])l++;else r--}console.log(best)`,
  'trapping-rain-water': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\s+/).map(Number);let l=0,r=a.length-1,lm=0,rm=0,water=0;while(l<r){if(a[l]<=a[r]){lm=Math.max(lm,a[l]);water+=lm-a[l++]}else{rm=Math.max(rm,a[r]);water+=rm-a[r--]}}console.log(water)`,
  'daily-temperatures': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\s+/).map(Number),answer=Array(a.length).fill(0),stack=[];for(let i=0;i<a.length;i++){while(stack.length&&a[i]>a[stack.at(-1)]){const j=stack.pop();answer[j]=i-j}stack.push(i)}console.log(answer.join(' '))`,
  'largest-rectangle-in-histogram': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\s+/).map(Number),stack=[];let best=0;for(let r=0;r<=a.length;r++){const current=r===a.length?0:a[r];while(stack.length&&a[stack.at(-1)]>current){const height=a[stack.pop()],left=stack.length?stack.at(-1)+1:0;best=Math.max(best,height*(r-left))}stack.push(r)}console.log(best)`,
  'sliding-window-maximum': String.raw`const lines=require('fs').readFileSync(0,'utf8').trim().split(/\n/),a=lines[0].split(/\s+/).map(Number),k=Number(lines[1]),deque=[],answer=[];let head=0;for(let r=0;r<a.length;r++){while(head<deque.length&&deque[head]<=r-k)head++;while(deque.length>head&&a[deque.at(-1)]<=a[r])deque.pop();deque.push(r);if(r>=k-1)answer.push(a[deque[head]])}console.log(answer.join(' '))`,
  'minimum-window-substring': String.raw`const lines=require('fs').readFileSync(0,'utf8').split(/\r?\n/),s=lines[0]||'',t=lines[1]||'',need=new Map();for(const c of t)need.set(c,(need.get(c)||0)+1);let missing=t.length,left=0,start=0,length=Infinity;for(let right=0;right<s.length;right++){const c=s[right];if((need.get(c)||0)>0)missing--;need.set(c,(need.get(c)||0)-1);while(missing===0){if(right-left+1<length){start=left;length=right-left+1}const removed=s[left++];need.set(removed,(need.get(removed)||0)+1);if(need.get(removed)>0)missing++}}console.log(length===Infinity?'':s.slice(start,start+length))`,
  'remove-k-digits': String.raw`const lines=require('fs').readFileSync(0,'utf8').trim().split(/\n/),num=lines[0],stack=[];let k=Number(lines[1]);for(const d of num){while(k>0&&stack.length&&stack.at(-1)>d){stack.pop();k--}stack.push(d)}while(k-->0)stack.pop();console.log(stack.join('').replace(/^0+/,'')||'0')`,
  'next-greater-element-ii': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\s+/).map(Number),answer=Array(a.length).fill(-1),stack=[];for(let i=0;i<a.length*2;i++){const current=i%a.length;while(stack.length&&a[stack.at(-1)]<a[current])answer[stack.pop()]=a[current];if(i<a.length)stack.push(current)}console.log(answer.join(' '))`,
  'sum-of-subarray-minimums': String.raw`const a=require('fs').readFileSync(0,'utf8').trim().split(/\s+/).map(Number),stack=[];let answer=0;for(let r=0;r<=a.length;r++){const current=r===a.length?-1:a[r];while(stack.length&&a[stack.at(-1)]>=current){const middle=stack.pop(),left=stack.length?stack.at(-1):-1;answer=(answer+a[middle]*(middle-left)*(r-middle))%1000000007}stack.push(r)}console.log(answer)`
};

test('keeps substantial hidden suites on the server', () => {
  assert.equal(getHiddenTestCount('two-sum'), 27);
  assert.equal(getHiddenTestCount('valid-parentheses'), 35);
  assert.equal(getHiddenTestCount('best-time-to-buy-and-sell-stock'), 30);
  assert.equal(getHiddenTestCount('lru-cache'), 25);
  assert.equal(getHiddenTestCount('design-hashset'), 25);
  assert.equal(getHiddenTestCount('longest-substring-without-repeating-characters'), 30);
  assert.equal(getHiddenTestCount('maximum-subarray'), 30);
  assert.equal(getHiddenTestCount('merge-intervals'), 30);
  assert.equal(getHiddenTestCount('container-with-most-water'), 30);
  assert.equal(getHiddenTestCount('trapping-rain-water'), 30);
  assert.equal(getHiddenTestCount('daily-temperatures'), 30);
  assert.equal(getHiddenTestCount('largest-rectangle-in-histogram'), 30);
  assert.equal(getHiddenTestCount('sliding-window-maximum'), 30);
  assert.equal(getHiddenTestCount('minimum-window-substring'), 30);
  assert.equal(getHiddenTestCount('remove-k-digits'), 30);
  assert.equal(getHiddenTestCount('next-greater-element-ii'), 30);
  assert.equal(getHiddenTestCount('sum-of-subarray-minimums'), 30);
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
