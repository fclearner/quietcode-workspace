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

function containerMaxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  while (left < right) {
    best = Math.max(best, Math.min(height[left], height[right]) * (right - left));
    if (height[left] <= height[right]) left += 1;
    else right -= 1;
  }
  return best;
}

function trappedWater(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    if (height[left] <= height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left];
      left += 1;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right];
      right -= 1;
    }
  }
  return water;
}

function warmerDayWaits(temperatures) {
  const answer = Array(temperatures.length).fill(0);
  const stack = [];
  for (let day = 0; day < temperatures.length; day += 1) {
    while (stack.length && temperatures[day] > temperatures[stack.at(-1)]) {
      const previous = stack.pop();
      answer[previous] = day - previous;
    }
    stack.push(day);
  }
  return answer;
}

function largestHistogramRectangle(heights) {
  const stack = [];
  let best = 0;
  for (let right = 0; right <= heights.length; right += 1) {
    const current = right === heights.length ? 0 : heights[right];
    while (stack.length && heights[stack.at(-1)] > current) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack.at(-1) + 1 : 0;
      best = Math.max(best, height * (right - left));
    }
    stack.push(right);
  }
  return best;
}

function slidingWindowMaximum(values, size) {
  const deque = [];
  const answer = [];
  let head = 0;
  for (let right = 0; right < values.length; right += 1) {
    while (head < deque.length && deque[head] <= right - size) head += 1;
    while (deque.length > head && values[deque.at(-1)] <= values[right]) deque.pop();
    deque.push(right);
    if (right >= size - 1) answer.push(values[deque[head]]);
  }
  return answer;
}

function minimumWindow(source, target) {
  if (!target.length) return '';
  const need = new Map();
  for (const char of target) need.set(char, (need.get(char) || 0) + 1);
  let missing = target.length;
  let left = 0;
  let bestStart = 0;
  let bestLength = Infinity;
  for (let right = 0; right < source.length; right += 1) {
    const char = source[right];
    if ((need.get(char) || 0) > 0) missing -= 1;
    need.set(char, (need.get(char) || 0) - 1);
    while (missing === 0) {
      if (right - left + 1 < bestLength) {
        bestStart = left;
        bestLength = right - left + 1;
      }
      const removed = source[left++];
      need.set(removed, (need.get(removed) || 0) + 1);
      if (need.get(removed) > 0) missing += 1;
    }
  }
  return bestLength === Infinity ? '' : source.slice(bestStart, bestStart + bestLength);
}

function removeDigits(number, count) {
  const stack = [];
  for (const digit of number) {
    while (count > 0 && stack.length && stack.at(-1) > digit) {
      stack.pop();
      count -= 1;
    }
    stack.push(digit);
  }
  while (count-- > 0) stack.pop();
  return stack.join('').replace(/^0+/, '') || '0';
}

function circularNextGreater(values) {
  const answer = Array(values.length).fill(-1);
  const stack = [];
  for (let index = 0; index < values.length * 2; index += 1) {
    const current = index % values.length;
    while (stack.length && values[stack.at(-1)] < values[current]) answer[stack.pop()] = values[current];
    if (index < values.length) stack.push(current);
  }
  return answer;
}

function subarrayMinimumSum(values) {
  const mod = 1_000_000_007;
  const stack = [];
  let answer = 0;
  for (let right = 0; right <= values.length; right += 1) {
    const current = right === values.length ? -1 : values[right];
    while (stack.length && values[stack.at(-1)] >= current) {
      const middle = stack.pop();
      const left = stack.length ? stack.at(-1) : -1;
      answer = (answer + values[middle] * (middle - left) * (right - middle)) % mod;
    }
    stack.push(right);
  }
  return answer;
}

function asteroidSurvivors(asteroids) {
  const stack = [];
  for (const asteroid of asteroids) {
    let alive = true;
    while (alive && asteroid < 0 && stack.length && stack.at(-1) > 0) {
      if (stack.at(-1) < -asteroid) stack.pop();
      else {
        if (stack.at(-1) === -asteroid) stack.pop();
        alive = false;
      }
    }
    if (alive) stack.push(asteroid);
  }
  return stack;
}

function contains132Pattern(values) {
  const stack = [];
  let middle = -Infinity;
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (values[index] < middle) return true;
    while (stack.length && values[index] > stack.at(-1)) middle = stack.pop();
    stack.push(values[index]);
  }
  return false;
}

function maximalBinaryRectangle(matrix) {
  const heights = Array(matrix[0].length).fill(0);
  let best = 0;
  for (const row of matrix) {
    for (let column = 0; column < row.length; column += 1) heights[column] = row[column] === '1' ? heights[column] + 1 : 0;
    const stack = [];
    for (let right = 0; right <= heights.length; right += 1) {
      const current = right === heights.length ? 0 : heights[right];
      while (stack.length && heights[stack.at(-1)] > current) {
        const height = heights[stack.pop()];
        const left = stack.length ? stack.at(-1) + 1 : 0;
        best = Math.max(best, height * (right - left));
      }
      stack.push(right);
    }
  }
  return best;
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

const containerInputs = [
  [1, 1], [0, 0], [1, 2], [2, 1], [1, 2, 1], [4, 3, 2, 1, 4],
  [1, 2, 4, 3], [2, 3, 10, 5, 7, 8, 9], [100000, 1, 100000],
  [0, 2, 0, 4, 0, 3], [5, 5, 5, 5], [1, 3, 2, 5, 25, 24, 5],
  ...Array.from({ length: 18 }, (_, seed) => Array.from({ length: 20 + seed * 7 }, (_, index) =>
    (index * 43 + seed * 29 + Math.floor(index / 3)) % 101))
];

const rainWaterInputs = [
  [0], [0, 0], [1, 0], [0, 1], [1, 0, 1], [3, 0, 0, 2, 0, 4],
  [3, 3, 3], [5, 4, 3, 2, 1], [1, 2, 3, 4, 5], [5, 0, 5],
  [5, 2, 1, 2, 1, 5], [0, 7, 1, 4, 6], [100000, 0, 0, 100000],
  [2, 1, 0, 2], [4, 2, 3],
  ...Array.from({ length: 15 }, (_, seed) => Array.from({ length: 35 + seed * 11 }, (_, index) =>
    (index * 31 + seed * 17 + Math.floor(index / 5) * 7) % 30))
];

const temperatureInputs = [
  [30], [30, 30], [30, 31], [31, 30], [30, 31, 30], [90, 80, 70, 60],
  [60, 70, 80, 90], [70, 70, 71, 70, 72], [100, 30, 40, 50, 60],
  [30, 100, 90, 80, 110], [73, 74, 75, 71, 69, 72, 76, 73],
  ...Array.from({ length: 19 }, (_, seed) => Array.from({ length: 30 + seed * 9 }, (_, index) =>
    30 + ((index * 19 + seed * 23 + Math.floor(index / 4)) % 71)))
];

const histogramInputs = [
  [0], [1], [0, 0], [2, 1, 2], [2, 4], [4, 2], [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1], [3, 3, 3], [6, 2, 5, 4, 5, 1, 6], [0, 2, 0],
  [100000], [100000, 100000], [1, 0, 1, 0, 1], [5, 1, 5, 1, 5],
  ...Array.from({ length: 15 }, (_, seed) => Array.from({ length: 40 + seed * 13 }, (_, index) =>
    (index * 47 + seed * 31 + Math.floor(index / 7)) % 80))
];

const slidingWindowInputs = [
  { values: [1], size: 1 },
  { values: [1, 2], size: 1 },
  { values: [1, 2], size: 2 },
  { values: [2, 1], size: 2 },
  { values: [4, 4, 4], size: 2 },
  { values: [9, 8, 7, 6], size: 3 },
  { values: [1, 2, 3, 4], size: 4 },
  { values: [-1, -3, -2, -5], size: 2 },
  { values: [7, 2, 4], size: 2 },
  { values: [1, 3, 1, 2, 0, 5], size: 3 },
  { values: [100000, -100000, 100000], size: 2 },
  { values: [5, 1, 5, 1, 5], size: 1 },
  { values: [5, 1, 5, 1, 5], size: 5 },
  { values: [2, 2, 1, 2, 2], size: 3 },
  { values: [10, 9, 8, 20, 7, 6], size: 4 },
  ...Array.from({ length: 15 }, (_, seed) => {
    const values = Array.from({ length: 50 + seed * 11 }, (_, index) => ((index * 83 + seed * 37) % 401) - 200);
    return { values, size: 1 + ((seed * 7 + 3) % values.length) };
  })
];

const minimumWindowInputs = [
  ['a', 'a'], ['a', 'b'], ['aa', 'aa'], ['ab', 'b'], ['bba', 'ab'],
  ['ADOBECODEBANC', 'ABC'], ['aaabdabcefaecbef', 'abc'], ['abc', 'ac'],
  ['ab', 'A'], ['aAaBbBc', 'ABC'], ['this is a test string', 'tist'],
  ['cabefgecdaecf', 'cae'], ['xyyzyzyx', 'xyz'], ['abcdef', 'fed'], ['abc', 'dddd'],
  ...Array.from({ length: 15 }, (_, seed) => {
    const alphabet = 'ABCDEFGH';
    const source = Array.from({ length: 70 + seed * 9 }, (_, index) => alphabet[(index * 5 + seed * 3 + Math.floor(index / 6)) % alphabet.length]).join('');
    const target = seed % 4 === 0 ? 'ZZ' : `${alphabet[seed % alphabet.length]}${alphabet[(seed * 3 + 1) % alphabet.length]}${alphabet[(seed * 5 + 2) % alphabet.length]}`;
    return [source, target];
  })
];

const removeDigitsInputs = [
  ['10', 1], ['10', 2], ['9', 0], ['9', 1], ['1000', 1], ['1000', 3],
  ['112', 1], ['123456', 3], ['654321', 3], ['10200', 1], ['100200', 1],
  ['111111', 4], ['9876543210', 9], ['765028321', 5], ['10001', 1],
  ...Array.from({ length: 15 }, (_, seed) => {
    const number = Array.from({ length: 60 + seed * 7 }, (_, index) => String((index * 7 + seed * 3 + Math.floor(index / 5)) % 10)).join('');
    return [number, (seed * 11 + 3) % (number.length + 1)];
  })
];

const nextGreaterInputs = [
  [1], [1, 2], [2, 1], [1, 1], [1, 2, 1], [5, 4, 3, 2, 1],
  [1, 2, 3, 4, 5], [3, 3, 3], [-1, 0, -2], [2, 5, 3, 7, 1],
  [100000, -100000, 0], [4, 1, 2, 3], [2, 1, 2, 4, 3], [1, 5, 3, 6, 8],
  [9, 8, 7, 3, 2, 1, 10],
  ...Array.from({ length: 15 }, (_, seed) => Array.from({ length: 45 + seed * 9 }, (_, index) =>
    ((index * 61 + seed * 29 + Math.floor(index / 4)) % 151) - 75))
];

const subarrayMinimumInputs = [
  [1], [1, 1], [1, 2], [2, 1], [3, 1, 2, 4], [5, 4, 3, 2, 1],
  [1, 2, 3, 4, 5], [2, 2, 2], [5, 1, 5], [10, 3, 4, 2, 8],
  [30000, 30000], [7, 3, 8, 1, 6], [9, 8, 2, 8, 9], [1, 100, 1],
  [11, 81, 94, 43, 3],
  ...Array.from({ length: 15 }, (_, seed) => Array.from({ length: 70 + seed * 13 }, (_, index) =>
    1 + ((index * 73 + seed * 31 + Math.floor(index / 8)) % 30000)))
];

const asteroidInputs = [
  [1], [-1], [1, 2], [-1, -2], [1, -1], [2, -1], [1, -2],
  [5, 10, -5], [8, -8], [10, 2, -5], [-2, -1, 1, 2], [1, -2, -2, -2],
  [3, 4, -9, 8], [1, 5, -3, -5, 10], [1000, -999, -1000],
  ...Array.from({ length: 15 }, (_, seed) => Array.from({ length: 55 + seed * 9 }, (_, index) => {
    const size = 1 + ((index * 67 + seed * 31) % 1000);
    return (index * 7 + seed * 5 + Math.floor(index / 3)) % 2 ? size : -size;
  }))
];

const pattern132Inputs = [
  [1], [1, 2], [1, 2, 3], [3, 1, 4, 2], [-1, 3, 2, 0], [3, 5, 0, 3, 4],
  [1, 0, 1, -4, -3], [1, 4, 0, -1, -2, -3, -1, -2], [9, 11, 8, 9, 10, 7, 9],
  [1, 2, 2, 1], [3, 3, 3], [100000, -100000, 0], [6, 12, 3, 4, 6, 11, 20],
  [5, 4, 3, 2, 1], [1, 2, 3, 4, 5],
  ...Array.from({ length: 15 }, (_, seed) => Array.from({ length: 60 + seed * 11 }, (_, index) =>
    ((index * 79 + seed * 43 + Math.floor(index / 5) * 17) % 301) - 150))
];

const maximalRectangleInputs = [
  ['0'], ['1'], ['00'], ['11'], ['10', '10'], ['01', '10'], ['11', '11'],
  ['10100', '10111', '11111', '10010'], ['000', '000'], ['111', '111', '111'],
  ['101', '111', '111'], ['1', '1', '0', '1'], ['01010', '11111', '01110'],
  ['1001', '1111', '1111', '1001'], ['010', '111', '010'],
  ...Array.from({ length: 15 }, (_, seed) => {
    const rows = 12 + seed;
    const columns = 14 + seed * 2;
    return Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) =>
      ((row * 31 + column * 47 + seed * 13 + Math.floor(column / 4)) % 7) < 4 ? '1' : '0').join(''));
  })
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
  })),
  'container-with-most-water': containerInputs.map((values) => ({ input: values.join(' '), output: String(containerMaxArea(values)), hidden: true })),
  'trapping-rain-water': rainWaterInputs.map((values) => ({ input: values.join(' '), output: String(trappedWater(values)), hidden: true })),
  'daily-temperatures': temperatureInputs.map((values) => ({ input: values.join(' '), output: warmerDayWaits(values).join(' '), hidden: true })),
  'largest-rectangle-in-histogram': histogramInputs.map((values) => ({ input: values.join(' '), output: String(largestHistogramRectangle(values)), hidden: true })),
  'sliding-window-maximum': slidingWindowInputs.map(({ values, size }) => ({ input: `${values.join(' ')}\n${size}`, output: slidingWindowMaximum(values, size).join(' '), hidden: true })),
  'minimum-window-substring': minimumWindowInputs.map(([source, target]) => ({ input: `${source}\n${target}`, output: minimumWindow(source, target), hidden: true })),
  'remove-k-digits': removeDigitsInputs.map(([number, count]) => ({ input: `${number}\n${count}`, output: removeDigits(number, count), hidden: true })),
  'next-greater-element-ii': nextGreaterInputs.map((values) => ({ input: values.join(' '), output: circularNextGreater(values).join(' '), hidden: true })),
  'sum-of-subarray-minimums': subarrayMinimumInputs.map((values) => ({ input: values.join(' '), output: String(subarrayMinimumSum(values)), hidden: true })),
  'asteroid-collision': asteroidInputs.map((values) => ({ input: values.join(' '), output: asteroidSurvivors(values).join(' '), hidden: true })),
  '132-pattern': pattern132Inputs.map((values) => ({ input: values.join(' '), output: String(contains132Pattern(values)), hidden: true })),
  'maximal-rectangle': maximalRectangleInputs.map((matrix) => ({ input: matrix.join('\n'), output: String(maximalBinaryRectangle(matrix)), hidden: true }))
};

function getHiddenTests(slug) {
  return (hiddenCases[slug] || []).map((test) => ({ ...test }));
}

function getHiddenTestCount(slug) {
  return hiddenCases[slug]?.length || 0;
}

module.exports = { getHiddenTests, getHiddenTestCount };
