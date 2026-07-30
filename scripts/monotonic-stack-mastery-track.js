module.exports = {
  'maximum-width-ramp': {
    id: 962,
    summary: '给定整数数组 nums，坡由一对下标 i < j 构成，并且 nums[i] <= nums[j]。坡的宽度是 j - i，请输出数组中的最大坡宽；不存在时输出 0。',
    input: '一行空格分隔的整数数组 nums；至少包含一个整数。',
    output: '一个整数，表示满足条件的最大下标距离。',
    examples: [
      { input: '6 0 8 2 1 5', output: '4' },
      { input: '9 8 1 0 1 9 4 0 4 1', output: '7' },
      { input: '5 4 3 2 1', output: '0' }
    ],
    templates: {
      javascript: "const nums = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction maxWidthRamp(nums) {\n  // TODO: 在这里写你的解法\n  return 0;\n}\n\nconsole.log(maxWidthRamp(nums));\n",
      python: "nums = list(map(int, input().split()))\n\ndef max_width_ramp(nums):\n    # TODO: 在这里写你的解法\n    return 0\n\nprint(max_width_ramp(nums))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint maxWidthRamp(const vector<long long>& nums) {\n    // TODO: 在这里写你的解法\n    return 0;\n}\n\nint main() { vector<long long> nums; long long value; while (cin >> value) nums.push_back(value); cout << maxWidthRamp(nums) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function maxWidthRamp(nums) {\n  const stack = [];\n  for (let index = 0; index < nums.length; index++) {\n    if (!stack.length || nums[index] < nums[stack.at(-1)]) stack.push(index);\n  }\n  let best = 0;\n  for (let right = nums.length - 1; right >= 0 && stack.length; right--) {\n    while (stack.length && nums[stack.at(-1)] <= nums[right]) {\n      best = Math.max(best, right - stack.pop());\n    }\n  }\n  return best;\n}\n",
      python: "def max_width_ramp(nums):\n    stack = []\n    for index, value in enumerate(nums):\n        if not stack or value < nums[stack[-1]]:\n            stack.append(index)\n    best = 0\n    for right in range(len(nums) - 1, -1, -1):\n        while stack and nums[stack[-1]] <= nums[right]:\n            best = max(best, right - stack.pop())\n    return best\n",
      cpp: "int maxWidthRamp(const vector<long long>& nums) {\n    vector<int> stack;\n    for (int index = 0; index < (int)nums.size(); index++) {\n        if (stack.empty() || nums[index] < nums[stack.back()]) stack.push_back(index);\n    }\n    int best = 0;\n    for (int right = (int)nums.size() - 1; right >= 0 && !stack.empty(); right--) {\n        while (!stack.empty() && nums[stack.back()] <= nums[right]) {\n            best = max(best, right - stack.back());\n            stack.pop_back();\n        }\n    }\n    return best;\n}\n"
    }
  },
  'number-of-visible-people-in-a-queue': {
    id: 1944,
    summary: '队列中每个人的身高互不相同。若 i < j，且两人之间所有人的身高都小于 heights[i] 与 heights[j] 中的较小值，则 i 能看到 j。请输出每个人向右能看到的人数。',
    input: '一行空格分隔的正整数 heights，按从左到右表示队列中的身高；所有身高互不相同。',
    output: '一行空格分隔的整数，第 i 个数表示第 i 个人向右能看到的人数。',
    examples: [
      { input: '10 6 8 5 11 9', output: '3 1 2 1 1 0' },
      { input: '5 1 2 3 10', output: '4 1 1 1 0' },
      { input: '3 2 1', output: '1 1 0' }
    ],
    templates: {
      javascript: "const heights = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction canSeePersonsCount(heights) {\n  // TODO: 在这里写你的解法\n  return Array(heights.length).fill(0);\n}\n\nconsole.log(canSeePersonsCount(heights).join(' '));\n",
      python: "heights = list(map(int, input().split()))\n\ndef can_see_persons_count(heights):\n    # TODO: 在这里写你的解法\n    return [0] * len(heights)\n\nprint(*can_see_persons_count(heights))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> canSeePersonsCount(const vector<int>& heights) {\n    // TODO: 在这里写你的解法\n    return vector<int>(heights.size());\n}\n\nint main() { vector<int> heights; int value; while (cin >> value) heights.push_back(value); auto answer = canSeePersonsCount(heights); for (int i = 0; i < (int)answer.size(); i++) cout << (i ? \" \" : \"\") << answer[i]; cout << '\\n'; }\n"
    },
    solutions: {
      javascript: "function canSeePersonsCount(heights) {\n  const answer = Array(heights.length).fill(0);\n  const stack = [];\n  for (let index = heights.length - 1; index >= 0; index--) {\n    while (stack.length && heights[index] > stack.at(-1)) {\n      stack.pop();\n      answer[index]++;\n    }\n    if (stack.length) answer[index]++;\n    stack.push(heights[index]);\n  }\n  return answer;\n}\n",
      python: "def can_see_persons_count(heights):\n    answer = [0] * len(heights)\n    stack = []\n    for index in range(len(heights) - 1, -1, -1):\n        while stack and heights[index] > stack[-1]:\n            stack.pop()\n            answer[index] += 1\n        if stack:\n            answer[index] += 1\n        stack.append(heights[index])\n    return answer\n",
      cpp: "vector<int> canSeePersonsCount(const vector<int>& heights) {\n    vector<int> answer(heights.size());\n    vector<int> stack;\n    for (int index = (int)heights.size() - 1; index >= 0; index--) {\n        while (!stack.empty() && heights[index] > stack.back()) {\n            stack.pop_back();\n            answer[index]++;\n        }\n        if (!stack.empty()) answer[index]++;\n        stack.push_back(heights[index]);\n    }\n    return answer;\n}\n"
    }
  },
  'remove-duplicate-letters': {
    id: 316,
    summary: '给定一个只包含小写英文字母的字符串 s，请删除重复字母，使每个不同字母恰好出现一次；在所有可行结果中输出字典序最小的那个。',
    input: '一行只包含小写英文字母的非空字符串 s。',
    output: '一个字符串，包含 s 中每个不同字母恰好一次，并且字典序最小。',
    examples: [
      { input: 'bcabc', output: 'abc' },
      { input: 'cbacdcbc', output: 'acdb' },
      { input: 'bbcaac', output: 'bac' }
    ],
    templates: {
      javascript: "const s = require('fs').readFileSync(0, 'utf8').trim();\n\nfunction removeDuplicateLetters(s) {\n  // TODO: 在这里写你的解法\n  return '';\n}\n\nconsole.log(removeDuplicateLetters(s));\n",
      python: "s = input().strip()\n\ndef remove_duplicate_letters(s):\n    # TODO: 在这里写你的解法\n    return ''\n\nprint(remove_duplicate_letters(s))\n",
      cpp: "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nstring removeDuplicateLetters(const string& s) {\n    // TODO: 在这里写你的解法\n    return \"\";\n}\n\nint main() { string s; cin >> s; cout << removeDuplicateLetters(s) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function removeDuplicateLetters(s) {\n  const last = new Map([...s].map((char, index) => [char, index]));\n  const used = new Set();\n  const stack = [];\n  for (let index = 0; index < s.length; index++) {\n    const char = s[index];\n    if (used.has(char)) continue;\n    while (stack.length && stack.at(-1) > char && last.get(stack.at(-1)) > index) used.delete(stack.pop());\n    stack.push(char);\n    used.add(char);\n  }\n  return stack.join('');\n}\n",
      python: "def remove_duplicate_letters(s):\n    last = {char: index for index, char in enumerate(s)}\n    used = set()\n    stack = []\n    for index, char in enumerate(s):\n        if char in used:\n            continue\n        while stack and stack[-1] > char and last[stack[-1]] > index:\n            used.remove(stack.pop())\n        stack.append(char)\n        used.add(char)\n    return ''.join(stack)\n",
      cpp: "string removeDuplicateLetters(const string& s) {\n    vector<int> last(26), used(26);\n    for (int index = 0; index < (int)s.size(); index++) last[s[index] - 'a'] = index;\n    string stack;\n    for (int index = 0; index < (int)s.size(); index++) {\n        char current = s[index];\n        if (used[current - 'a']) continue;\n        while (!stack.empty() && stack.back() > current && last[stack.back() - 'a'] > index) {\n            used[stack.back() - 'a'] = false;\n            stack.pop_back();\n        }\n        stack.push_back(current);\n        used[current - 'a'] = true;\n    }\n    return stack;\n}\n"
    }
  }
};
