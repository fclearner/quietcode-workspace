module.exports = {
  'remove-k-digits': {
    id: 402,
    summary: '给定一个只包含数字的非负整数字符串 num 和整数 k，请恰好删除 k 位数字，使剩余数字组成的数最小。结果不能包含多余的前导零。',
    input: '第一行：数字字符串 num。\n第二行：整数 k，满足 0 ≤ k ≤ num.length。',
    output: '删除 k 位后能够得到的最小数字字符串；若所有数字都被删除或结果全为零，输出 0。',
    examples: [
      { input: '1432219\n3', output: '1219' },
      { input: '10200\n1', output: '200' },
      { input: '10\n2', output: '0' }
    ],
    templates: {
      javascript: "const lines = require('fs').readFileSync(0, 'utf8').trim().split(/\\n/);\nconst num = lines[0].trim();\nconst k = Number(lines[1]);\n\nfunction removeKdigits(num, k) {\n  // TODO: 在这里写你的解法\n  return '';\n}\n\nconsole.log(removeKdigits(num, k));\n",
      python: "import sys\nlines = sys.stdin.read().strip().splitlines()\nnum = lines[0].strip()\nk = int(lines[1])\n\ndef remove_k_digits(num, k):\n    # TODO: 在这里写你的解法\n    return ''\n\nprint(remove_k_digits(num, k))\n",
      cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nstring removeKdigits(const string& num, int k) {\n    // TODO: 在这里写你的解法\n    return \"\";\n}\n\nint main() { string num; int k; cin >> num >> k; cout << removeKdigits(num, k) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function removeKdigits(num, k) {\n  const stack = [];\n  for (const digit of num) {\n    while (k > 0 && stack.length && stack.at(-1) > digit) { stack.pop(); k -= 1; }\n    stack.push(digit);\n  }\n  while (k-- > 0) stack.pop();\n  const answer = stack.join('').replace(/^0+/, '');\n  return answer || '0';\n}\n",
      python: "def remove_k_digits(num, k):\n    stack = []\n    for digit in num:\n        while k and stack and stack[-1] > digit:\n            stack.pop()\n            k -= 1\n        stack.append(digit)\n    if k:\n        stack = stack[:-k]\n    answer = ''.join(stack).lstrip('0')\n    return answer or '0'\n",
      cpp: "string removeKdigits(const string& num, int k) {\n    string stack;\n    for (char digit : num) {\n        while (k > 0 && !stack.empty() && stack.back() > digit) { stack.pop_back(); k--; }\n        stack.push_back(digit);\n    }\n    while (k-- > 0) stack.pop_back();\n    int first = 0;\n    while (first < (int)stack.size() && stack[first] == '0') first++;\n    string answer = stack.substr(first);\n    return answer.empty() ? \"0\" : answer;\n}\n"
    }
  },
  'next-greater-element-ii': {
    id: 503,
    summary: '给定一个循环整数数组 nums，请为每个位置找出按循环顺序向右遇到的第一个更大元素；如果不存在，输出 -1。',
    input: '一行空格分隔的整数数组 nums；至少包含一个整数。',
    output: '一行空格分隔的整数，第 i 个数是 nums[i] 的下一个更大元素或 -1。',
    examples: [
      { input: '1 2 1', output: '2 -1 2' },
      { input: '1 2 3 4 3', output: '2 3 4 -1 4' },
      { input: '5 4 3 2 1', output: '-1 5 5 5 5' }
    ],
    templates: {
      javascript: "const nums = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction nextGreaterElements(nums) {\n  // TODO: 在这里写你的解法\n  return [];\n}\n\nconsole.log(nextGreaterElements(nums).join(' '));\n",
      python: "nums = list(map(int, input().split()))\n\ndef next_greater_elements(nums):\n    # TODO: 在这里写你的解法\n    return []\n\nprint(*next_greater_elements(nums))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> nextGreaterElements(const vector<int>& nums) {\n    // TODO: 在这里写你的解法\n    return {};\n}\n\nint main() { vector<int> nums; int value; while (cin >> value) nums.push_back(value); auto answer = nextGreaterElements(nums); for (int i = 0; i < (int)answer.size(); i++) cout << (i ? \" \" : \"\") << answer[i]; cout << '\\n'; }\n"
    },
    solutions: {
      javascript: "function nextGreaterElements(nums) {\n  const answer = Array(nums.length).fill(-1), stack = [];\n  for (let index = 0; index < nums.length * 2; index++) {\n    const current = index % nums.length;\n    while (stack.length && nums[stack.at(-1)] < nums[current]) answer[stack.pop()] = nums[current];\n    if (index < nums.length) stack.push(current);\n  }\n  return answer;\n}\n",
      python: "def next_greater_elements(nums):\n    answer = [-1] * len(nums)\n    stack = []\n    for index in range(len(nums) * 2):\n        current = index % len(nums)\n        while stack and nums[stack[-1]] < nums[current]:\n            answer[stack.pop()] = nums[current]\n        if index < len(nums):\n            stack.append(current)\n    return answer\n",
      cpp: "vector<int> nextGreaterElements(const vector<int>& nums) {\n    vector<int> answer(nums.size(), -1), stack;\n    for (int index = 0; index < (int)nums.size() * 2; index++) {\n        int current = index % nums.size();\n        while (!stack.empty() && nums[stack.back()] < nums[current]) {\n            answer[stack.back()] = nums[current]; stack.pop_back();\n        }\n        if (index < (int)nums.size()) stack.push_back(current);\n    }\n    return answer;\n}\n"
    }
  },
  'sum-of-subarray-minimums': {
    id: 907,
    summary: '给定正整数数组 arr，求所有连续子数组的最小值之和。结果可能很大，请对 1,000,000,007 取模。',
    input: '一行空格分隔的正整数数组 arr；至少包含一个整数。',
    output: '一个整数，表示所有连续子数组最小值之和模 1,000,000,007。',
    examples: [
      { input: '3 1 2 4', output: '17' },
      { input: '11 81 94 43 3', output: '444' },
      { input: '1 1', output: '3' }
    ],
    templates: {
      javascript: "const arr = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction sumSubarrayMins(arr) {\n  // TODO: 在这里写你的解法\n  return 0;\n}\n\nconsole.log(sumSubarrayMins(arr));\n",
      python: "arr = list(map(int, input().split()))\n\ndef sum_subarray_mins(arr):\n    # TODO: 在这里写你的解法\n    return 0\n\nprint(sum_subarray_mins(arr))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nlong long sumSubarrayMins(const vector<long long>& arr) {\n    // TODO: 在这里写你的解法\n    return 0;\n}\n\nint main() { vector<long long> arr; long long value; while (cin >> value) arr.push_back(value); cout << sumSubarrayMins(arr) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function sumSubarrayMins(arr) {\n  const mod = 1_000_000_007, stack = [];\n  let answer = 0;\n  for (let right = 0; right <= arr.length; right++) {\n    const current = right === arr.length ? -1 : arr[right];\n    while (stack.length && arr[stack.at(-1)] >= current) {\n      const middle = stack.pop();\n      const left = stack.length ? stack.at(-1) : -1;\n      answer = (answer + arr[middle] * (middle - left) * (right - middle)) % mod;\n    }\n    stack.push(right);\n  }\n  return answer;\n}\n",
      python: "def sum_subarray_mins(arr):\n    mod = 1_000_000_007\n    stack = []\n    answer = 0\n    for right in range(len(arr) + 1):\n        current = -1 if right == len(arr) else arr[right]\n        while stack and arr[stack[-1]] >= current:\n            middle = stack.pop()\n            left = stack[-1] if stack else -1\n            answer = (answer + arr[middle] * (middle - left) * (right - middle)) % mod\n        stack.append(right)\n    return answer\n",
      cpp: "long long sumSubarrayMins(const vector<long long>& arr) {\n    const long long mod = 1000000007;\n    vector<int> stack; long long answer = 0;\n    for (int right = 0; right <= (int)arr.size(); right++) {\n        long long current = right == (int)arr.size() ? -1 : arr[right];\n        while (!stack.empty() && arr[stack.back()] >= current) {\n            int middle = stack.back(); stack.pop_back();\n            int left = stack.empty() ? -1 : stack.back();\n            answer = (answer + arr[middle] * (middle - left) % mod * (right - middle)) % mod;\n        }\n        stack.push_back(right);\n    }\n    return answer;\n}\n"
    }
  }
};
