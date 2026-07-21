function validParentheses(value) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const char of value) {
    if ('([{'.includes(char)) stack.push(char);
    else if (stack.pop() !== pairs[char]) return false;
  }
  return stack.length === 0;
}

function bestStockProfit(prices) {
  let lowest = Infinity;
  let best = 0;
  for (const price of prices) {
    lowest = Math.min(lowest, price);
    best = Math.max(best, price - lowest);
  }
  return best;
}

function runLruProgram(input) {
  const lines = input.trim().split(/\n/);
  const capacity = Number(lines[0]);
  const cache = new Map();
  const output = [];
  for (const line of lines.slice(1)) {
    const [operation, keyText, valueText] = line.split(/\s+/);
    const key = Number(keyText);
    if (operation === 'get') {
      if (!cache.has(key)) output.push('-1');
      else {
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value);
        output.push(String(value));
      }
      continue;
    }
    if (cache.has(key)) cache.delete(key);
    cache.set(key, Number(valueText));
    if (cache.size > capacity) cache.delete(cache.keys().next().value);
  }
  return output.join('\n');
}

function runHashSetProgram(input) {
  const values = new Set();
  const output = [];
  for (const line of input.trim().split(/\n/)) {
    const [operation, keyText] = line.split(/\s+/);
    const key = Number(keyText);
    if (operation === 'add') values.add(key);
    else if (operation === 'remove') values.delete(key);
    else output.push(values.has(key) ? 'true' : 'false');
  }
  return output.join('\n');
}

function longestUniqueSubstring(value) {
  const last = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < value.length; right += 1) {
    if (last.has(value[right])) left = Math.max(left, last.get(value[right]) + 1);
    last.set(value[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function maximumSubarray(values) {
  let current = values[0];
  let best = values[0];
  for (let index = 1; index < values.length; index += 1) {
    current = Math.max(values[index], current + values[index]);
    best = Math.max(best, current);
  }
  return best;
}

function mergeIntervals(values) {
  const result = [];
  for (const interval of values.map((item) => item.slice()).sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
    const last = result.at(-1);
    if (!last || interval[0] > last[1]) result.push(interval);
    else last[1] = Math.max(last[1], interval[1]);
  }
  return result;
}

const twoSumCases = [
  ['1 4 6 8\n10', '1 2'],
  ['-3 4 3 90\n0', '0 2'],
  ['0 4 3 0\n0', '0 3'],
  ['-1 -2 -3 -4 -5\n-8', '2 4'],
  ['1000000000 -1000000000 3 7\n0', '0 1'],
  ['5 75 25\n100', '1 2'],
  ['2 5 5 11\n10', '1 2'],
  ['-10 -20 30 40\n30', '0 3'],
  ['8 1 2 3 4\n12', '0 4'],
  ['1 2 3 9\n10', '0 3'],
  ['4 6 1 9\n15', '1 3'],
  ['-7 2 11 15\n4', '0 2'],
  ['13 -3 6 1\n10', '0 1'],
  ['42 17 -25 8\n17', '0 2'],
  ['0 -1 2 -3 1\n-2', '3 4'],
  ['9 14 21 32 45\n77', '3 4'],
  ['6 1 -4 12\n2', '0 2'],
  ['99 2 8 16\n10', '1 2'],
  ['-100 50 25 75\n-25', '0 3'],
  ['7 0 -7 14\n0', '0 2'],
  ['3 8 12 19 21\n29', '1 4'],
  ['31 4 15 -9\n22', '0 3'],
  ['-6 -2 5 11\n9', '1 3'],
  ['18 5 -13 2\n5', '0 2'],
  ['2147483647 -2147483648 9\n-1', '0 1'],
  [`${Array.from({ length: 200 }, (_, index) => index * 3 + 1).join(' ')}\n1193`, '198 199'],
  [`${Array.from({ length: 300 }, (_, index) => index * 5 - 1000).join(' ')}\n-1995`, '0 1']
];

const parenthesesInputs = [
  '[]', '{}', '([{}])', '{[()]}', '(((())))', '([)]', '((', '))', '(()', '())', '}{',
  '[({})](())', '(){}[()]', '{([]){()}}', '[(])', '([{})', '{{{{', '[[[]]]', '([]{})',
  '({[}])', '([[[[]]]])', '(()())', '(()(()))', '())(()', '][', '{[}]', '(([]){})',
  '({})[](({}))', '((((()))))[]{}', '()()()()()', '([[[{()}]]])', '[{()}](){}',
  '('.repeat(100) + ')'.repeat(100),
  '([{'.repeat(40) + '}])'.repeat(40),
  '('.repeat(99) + ')'.repeat(98)
];

const stockInputs = [
  [1], [1, 2], [2, 1], [2, 2, 2], [1, 2, 3, 4, 5], [5, 4, 3, 2, 1],
  [3, 1, 4, 8, 7, 2, 5], [2, 1, 2, 0, 1], [2, 4, 1, 7], [10, 1, 10],
  [1, 10, 1, 11], [8, 2, 6, 1, 7], [100, 180, 260, 310, 40, 535, 695],
  [7, 6, 4, 3, 10], [9, 2, 4, 1, 5, 0, 8], [0, 0, 1], [1, 0, 0],
  [10000, 1, 9999], [5, 1, 5, 1, 5], [3, 3, 5, 0, 0, 3, 1, 4],
  [6, 1, 3, 2, 4, 7], [2, 9, 1, 8, 3, 7], [20, 18, 19, 2, 15],
  [4, 7, 2, 9, 1, 6], [1, 100000], [100000, 1], [50, 20, 30, 10, 40],
  Array.from({ length: 300 }, (_, index) => index + 1),
  Array.from({ length: 300 }, (_, index) => 300 - index),
  [...Array.from({ length: 150 }, (_, index) => 500 - index), ...Array.from({ length: 150 }, (_, index) => index * 4)]
];

const lruInputs = [
  '1\nget 1\nput 1 7\nget 1\nput 2 8\nget 1\nget 2',
  '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 1\nget 2\nget 3',
  '3\nput 1 10\nput 2 20\nput 3 30\nget 1\nput 4 40\nget 2\nget 3\nget 4',
  '2\nput 1 1\nput 1 2\nget 1\nput 2 2\nput 3 3\nget 1\nget 2\nget 3',
  '3\nget 9\nput 9 90\nput 8 80\nget 9\nput 7 70\nput 6 60\nget 8\nget 9\nget 6',
  '4\nput 1 5\nput 2 6\nput 3 7\nput 4 8\nget 1\nget 2\nput 5 9\nget 3\nget 4\nget 5',
  '1\nput 5 1\nput 5 2\nput 5 3\nget 5\nput 6 4\nget 5\nget 6',
  '2\nput 0 0\nget 0\nput 1 0\nput 2 0\nget 0\nget 1\nget 2',
  '5\nput 1 1\nput 2 4\nput 3 9\nput 4 16\nput 5 25\nget 3\nget 1\nput 6 36\nget 2\nget 5\nget 6',
  '3\nput 10 100\nput 20 200\nget 10\nput 30 300\nput 20 250\nput 40 400\nget 10\nget 20\nget 30\nget 40'
];

for (let seed = 1; seed <= 14; seed += 1) {
  const capacity = (seed % 5) + 1;
  const operations = [];
  for (let index = 0; index < 70 + seed; index += 1) {
    const key = (index * 7 + seed * 3) % 13;
    if ((index + seed) % 3 === 0) operations.push(`get ${key}`);
    else operations.push(`put ${key} ${(index * 31 + seed) % 1000}`);
  }
  operations.push(...Array.from({ length: 13 }, (_, key) => `get ${key}`));
  lruInputs.push(`${capacity}\n${operations.join('\n')}`);
}

lruInputs.push(`7\n${Array.from({ length: 1200 }, (_, index) => index % 4 === 0 ? `get ${(index * 11) % 23}` : `put ${(index * 17) % 23} ${index}`).join('\n')}`);

const hashSetInputs = [
  'contains 1\nadd 1\ncontains 1\nremove 1\ncontains 1',
  'add 0\nadd 1000000\ncontains 0\ncontains 1000000\nremove 0\ncontains 0',
  'add 7\nadd 7\ncontains 7\nremove 7\nremove 7\ncontains 7',
  'remove 42\ncontains 42\nadd 42\ncontains 42',
  'add 1\nadd 2\nadd 3\nremove 2\ncontains 1\ncontains 2\ncontains 3',
  'add 999999\ncontains 999999\ncontains 1000000\nadd 1000000\nremove 999999\ncontains 999999\ncontains 1000000',
  'add 5\nremove 5\nadd 5\ncontains 5\nremove 6\ncontains 6',
  'contains 0\ncontains 500000\ncontains 1000000',
  'add 11\nadd 22\nadd 33\nremove 11\nadd 44\ncontains 11\ncontains 22\ncontains 33\ncontains 44',
  'add 100\nadd 200\nremove 100\nremove 200\nadd 300\ncontains 100\ncontains 200\ncontains 300'
];

for (let seed = 1; seed <= 14; seed += 1) {
  const operations = [];
  for (let index = 0; index < 80 + seed; index += 1) {
    const key = (index * 7919 + seed * 104729) % 1_000_001;
    const selector = (index + seed) % 4;
    operations.push(`${selector < 2 ? 'add' : selector === 2 ? 'remove' : 'contains'} ${key}`);
  }
  operations.push('contains 0', 'contains 1000000');
  hashSetInputs.push(operations.join('\n'));
}

hashSetInputs.push(Array.from({ length: 1600 }, (_, index) => `${index % 5 < 2 ? 'add' : index % 5 === 2 ? 'remove' : 'contains'} ${(index * 65537) % 1_000_001}`).join('\n'));

const longestSubstringInputs = [
  '', 'a', 'aa', 'ab', 'abba', 'dvdf', 'anviaj', 'tmmzuxt', 'abcadef', 'abcdef',
  'a b c a', '123451678', '!@#$!%^&', 'AaBbCcAa', 'repeat-and-repeat', 'abcabcbbxyz',
  'zzabcdefghijklmnopqrstuvwxy', 'ohvhjdml', 'ckilbkd', 'nfpdmpi',
  ...Array.from({ length: 10 }, (_, seed) => Array.from({ length: 120 + seed * 7 }, (_, index) =>
    String.fromCharCode(33 + ((index * 17 + seed * 11 + Math.floor(index / 9)) % 80))).join(''))
];

const maximumSubarrayInputs = [
  [-1], [0], [1], [-5, -2, -9], [1, 2, 3], [5, -10, 6], [2, -1, 2, 3, 4, -5],
  [-2, -1], [-2, 1], [8, -19, 5, -4, 20], [100000, -1, -2, 100000],
  [-100000, 99999], [3, -2, 5, -1], [-1, 3, -2, 3, -10, 8], [4, -1, -2, 1],
  ...Array.from({ length: 15 }, (_, seed) => Array.from({ length: 80 + seed * 13 }, (_, index) =>
    ((index * 97 + seed * 41) % 101) - 50))
];

const mergeIntervalInputs = [
  [[1, 2]], [[1, 4], [2, 3]], [[1, 4], [0, 4]], [[1, 4], [5, 6]],
  [[1, 4], [4, 4]], [[-10, -1], [-5, 3]], [[1, 10], [2, 3], [4, 8]],
  [[5, 7], [1, 2], [3, 4]], [[0, 0], [0, 1]], [[1, 2], [2, 3], [3, 4]],
  ...Array.from({ length: 20 }, (_, seed) => Array.from({ length: 20 + seed }, (_, index) => {
    const start = ((index * 37 + seed * 13) % 90) - 30;
    return [start, start + ((index * 11 + seed) % 12)];
  }))
];

const hiddenCases = {
  'two-sum': twoSumCases.map(([input, output]) => ({ input, output, hidden: true })),
  'valid-parentheses': parenthesesInputs.map((input) => ({ input, output: String(validParentheses(input)), hidden: true })),
  'best-time-to-buy-and-sell-stock': stockInputs.map((prices) => ({ input: prices.join(' '), output: String(bestStockProfit(prices)), hidden: true })),
  'lru-cache': lruInputs.map((input) => ({ input, output: runLruProgram(input), hidden: true })),
  'design-hashset': hashSetInputs.map((input) => ({ input, output: runHashSetProgram(input), hidden: true })),
  'longest-substring-without-repeating-characters': longestSubstringInputs.map((input) => ({ input, output: String(longestUniqueSubstring(input)), hidden: true })),
  'maximum-subarray': maximumSubarrayInputs.map((values) => ({ input: values.join(' '), output: String(maximumSubarray(values)), hidden: true })),
  'merge-intervals': mergeIntervalInputs.map((values) => ({
    input: values.map((item) => item.join(' ')).join('\n'),
    output: mergeIntervals(values).map((item) => item.join(' ')).join('\n'),
    hidden: true
  }))
};

function getHiddenTests(slug) {
  return (hiddenCases[slug] || []).map((test) => ({ ...test }));
}

function getHiddenTestCount(slug) {
  return hiddenCases[slug]?.length || 0;
}

module.exports = { getHiddenTests, getHiddenTestCount };
