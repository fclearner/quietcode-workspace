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

const hiddenCases = {
  'two-sum': twoSumCases.map(([input, output]) => ({ input, output, hidden: true })),
  'valid-parentheses': parenthesesInputs.map((input) => ({ input, output: String(validParentheses(input)), hidden: true })),
  'best-time-to-buy-and-sell-stock': stockInputs.map((prices) => ({ input: prices.join(' '), output: String(bestStockProfit(prices)), hidden: true }))
};

function getHiddenTests(slug) {
  return (hiddenCases[slug] || []).map((test) => ({ ...test }));
}

function getHiddenTestCount(slug) {
  return hiddenCases[slug]?.length || 0;
}

module.exports = { getHiddenTests, getHiddenTestCount };
