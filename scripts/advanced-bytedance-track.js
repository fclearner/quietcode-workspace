module.exports = {
  'minimum-window-substring': {
    id: 76,
    summary: '给定字符串 s 和 t，请在 s 中找出包含 t 中全部字符及其出现次数的最短连续子串。如果不存在这样的子串，输出空字符串。',
    input: '第一行：字符串 s。\n第二行：字符串 t。\n字符串由可见 ASCII 字符组成，区分大小写。',
    output: '满足条件的最短连续子串；不存在时输出空行。若有多个长度相同的答案，输出最靠左的一个。',
    examples: [
      { input: 'ADOBECODEBANC\nABC', output: 'BANC' },
      { input: 'a\na', output: 'a' },
      { input: 'a\naa', output: '' }
    ],
    templates: {
      javascript: "const lines = require('fs').readFileSync(0, 'utf8').split(/\\r?\\n/);\nconst s = lines[0] || '';\nconst t = lines[1] || '';\n\nfunction minWindow(s, t) {\n  // TODO: 在这里写你的解法\n  return '';\n}\n\nconsole.log(minWindow(s, t));\n",
      python: "import sys\nlines = sys.stdin.read().splitlines()\ns = lines[0] if lines else ''\nt = lines[1] if len(lines) > 1 else ''\n\ndef min_window(s, t):\n    # TODO: 在这里写你的解法\n    return ''\n\nprint(min_window(s, t))\n",
      cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nstring minWindow(const string& s, const string& t) {\n    // TODO: 在这里写你的解法\n    return \"\";\n}\n\nint main() { string s, t; getline(cin, s); getline(cin, t); cout << minWindow(s, t) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function minWindow(s, t) {\n  if (!t.length) return '';\n  const need = new Map();\n  for (const char of t) need.set(char, (need.get(char) || 0) + 1);\n  let missing = t.length, left = 0, bestStart = 0, bestLength = Infinity;\n  for (let right = 0; right < s.length; right++) {\n    const char = s[right];\n    if ((need.get(char) || 0) > 0) missing -= 1;\n    need.set(char, (need.get(char) || 0) - 1);\n    while (missing === 0) {\n      if (right - left + 1 < bestLength) [bestStart, bestLength] = [left, right - left + 1];\n      const removed = s[left++];\n      need.set(removed, (need.get(removed) || 0) + 1);\n      if (need.get(removed) > 0) missing += 1;\n    }\n  }\n  return bestLength === Infinity ? '' : s.slice(bestStart, bestStart + bestLength);\n}\n",
      python: "def min_window(s, t):\n    if not t:\n        return ''\n    need = {}\n    for char in t:\n        need[char] = need.get(char, 0) + 1\n    missing = len(t)\n    left = best_start = 0\n    best_length = float('inf')\n    for right, char in enumerate(s):\n        if need.get(char, 0) > 0:\n            missing -= 1\n        need[char] = need.get(char, 0) - 1\n        while missing == 0:\n            if right - left + 1 < best_length:\n                best_start, best_length = left, right - left + 1\n            removed = s[left]\n            left += 1\n            need[removed] = need.get(removed, 0) + 1\n            if need[removed] > 0:\n                missing += 1\n    return '' if best_length == float('inf') else s[best_start:best_start + best_length]\n",
      cpp: "string minWindow(const string& s, const string& t) {\n    if (t.empty()) return \"\";\n    vector<int> need(256);\n    for (unsigned char c : t) need[c]++;\n    int missing = t.size(), left = 0, bestStart = 0, bestLength = INT_MAX;\n    for (int right = 0; right < (int)s.size(); right++) {\n        unsigned char c = s[right];\n        if (need[c]-- > 0) missing--;\n        while (missing == 0) {\n            if (right - left + 1 < bestLength) { bestStart = left; bestLength = right - left + 1; }\n            unsigned char removed = s[left++];\n            if (++need[removed] > 0) missing++;\n        }\n    }\n    return bestLength == INT_MAX ? \"\" : s.substr(bestStart, bestLength);\n}\n"
    }
  },
  'largest-rectangle-in-histogram': {
    id: 84,
    summary: '给定一组非负整数 heights，表示宽度均为 1 的相邻柱子高度。请选择一个连续区间，以区间内最低柱高作为矩形高度，求能够形成的最大矩形面积。',
    input: '一行空格分隔的非负整数，表示柱状图高度；至少包含一个整数。',
    output: '一个整数，表示柱状图中最大矩形面积。',
    examples: [
      { input: '2 1 5 6 2 3', output: '10' },
      { input: '2 4', output: '4' },
      { input: '1 1 1 1', output: '4' }
    ],
    templates: {
      javascript: "const heights = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction largestRectangleArea(heights) {\n  // TODO: 在这里写你的解法\n  return 0;\n}\n\nconsole.log(largestRectangleArea(heights));\n",
      python: "heights = list(map(int, input().split()))\n\ndef largest_rectangle_area(heights):\n    # TODO: 在这里写你的解法\n    return 0\n\nprint(largest_rectangle_area(heights))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nlong long largestRectangleArea(const vector<long long>& heights) {\n    // TODO: 在这里写你的解法\n    return 0;\n}\n\nint main() { vector<long long> heights; long long value; while (cin >> value) heights.push_back(value); cout << largestRectangleArea(heights) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function largestRectangleArea(heights) {\n  const stack = [];\n  let best = 0;\n  for (let right = 0; right <= heights.length; right++) {\n    const current = right === heights.length ? 0 : heights[right];\n    while (stack.length && heights[stack.at(-1)] > current) {\n      const height = heights[stack.pop()];\n      const left = stack.length ? stack.at(-1) + 1 : 0;\n      best = Math.max(best, height * (right - left));\n    }\n    stack.push(right);\n  }\n  return best;\n}\n",
      python: "def largest_rectangle_area(heights):\n    stack = []\n    best = 0\n    for right in range(len(heights) + 1):\n        current = 0 if right == len(heights) else heights[right]\n        while stack and heights[stack[-1]] > current:\n            height = heights[stack.pop()]\n            left = stack[-1] + 1 if stack else 0\n            best = max(best, height * (right - left))\n        stack.append(right)\n    return best\n",
      cpp: "long long largestRectangleArea(const vector<long long>& heights) {\n    vector<int> stack;\n    long long best = 0;\n    for (int right = 0; right <= (int)heights.size(); right++) {\n        long long current = right == (int)heights.size() ? 0 : heights[right];\n        while (!stack.empty() && heights[stack.back()] > current) {\n            long long height = heights[stack.back()]; stack.pop_back();\n            int left = stack.empty() ? 0 : stack.back() + 1;\n            best = max(best, height * (right - left));\n        }\n        stack.push_back(right);\n    }\n    return best;\n}\n"
    }
  },
  'sliding-window-maximum': {
    id: 239,
    summary: '给定整数数组 nums 和窗口大小 k，窗口从数组最左侧开始，每次向右移动一位。请输出每个窗口中的最大值。',
    input: '第一行：空格分隔的整数数组 nums。\n第二行：整数 k，满足 1 ≤ k ≤ nums.length。',
    output: '一行空格分隔的整数，依次表示每个滑动窗口的最大值。',
    examples: [
      { input: '1 3 -1 -3 5 3 6 7\n3', output: '3 3 5 5 6 7' },
      { input: '1\n1', output: '1' },
      { input: '9 11\n2', output: '11' }
    ],
    templates: {
      javascript: "const lines = require('fs').readFileSync(0, 'utf8').trim().split(/\\n/);\nconst nums = lines[0].trim().split(/\\s+/).map(Number);\nconst k = Number(lines[1]);\n\nfunction maxSlidingWindow(nums, k) {\n  // TODO: 在这里写你的解法\n  return [];\n}\n\nconsole.log(maxSlidingWindow(nums, k).join(' '));\n",
      python: "import sys\nlines = sys.stdin.read().strip().splitlines()\nnums = list(map(int, lines[0].split()))\nk = int(lines[1])\n\ndef max_sliding_window(nums, k):\n    # TODO: 在这里写你的解法\n    return []\n\nprint(*max_sliding_window(nums, k))\n",
      cpp: "#include <iostream>\n#include <sstream>\n#include <vector>\nusing namespace std;\n\nvector<int> maxSlidingWindow(const vector<int>& nums, int k) {\n    // TODO: 在这里写你的解法\n    return {};\n}\n\nint main() { string line; getline(cin, line); stringstream ss(line); vector<int> nums; int value, k; while (ss >> value) nums.push_back(value); cin >> k; auto answer = maxSlidingWindow(nums, k); for (int i = 0; i < (int)answer.size(); i++) cout << (i ? \" \" : \"\") << answer[i]; cout << '\\n'; }\n"
    },
    solutions: {
      javascript: "function maxSlidingWindow(nums, k) {\n  const deque = [], answer = [];\n  let head = 0;\n  for (let right = 0; right < nums.length; right++) {\n    while (head < deque.length && deque[head] <= right - k) head += 1;\n    while (deque.length > head && nums[deque.at(-1)] <= nums[right]) deque.pop();\n    deque.push(right);\n    if (right >= k - 1) answer.push(nums[deque[head]]);\n  }\n  return answer;\n}\n",
      python: "from collections import deque\n\ndef max_sliding_window(nums, k):\n    window = deque()\n    answer = []\n    for right, value in enumerate(nums):\n        while window and window[0] <= right - k:\n            window.popleft()\n        while window and nums[window[-1]] <= value:\n            window.pop()\n        window.append(right)\n        if right >= k - 1:\n            answer.append(nums[window[0]])\n    return answer\n",
      cpp: "vector<int> maxSlidingWindow(const vector<int>& nums, int k) {\n    deque<int> window;\n    vector<int> answer;\n    for (int right = 0; right < (int)nums.size(); right++) {\n        while (!window.empty() && window.front() <= right - k) window.pop_front();\n        while (!window.empty() && nums[window.back()] <= nums[right]) window.pop_back();\n        window.push_back(right);\n        if (right >= k - 1) answer.push_back(nums[window.front()]);\n    }\n    return answer;\n}\n"
    }
  }
};
