module.exports = {
  'longest-substring-without-repeating-characters': {
    id: 3,
    summary: '给定一个字符串 s，请求出其中不含重复字符的最长连续子串长度。子串必须由原字符串中的连续字符组成。',
    input: '一行字符串 s，由可见 ASCII 字符组成。',
    output: '一个整数，表示最长无重复字符子串的长度。',
    examples: [
      { input: 'abcabcbb', output: '3' },
      { input: 'bbbbb', output: '1' },
      { input: 'pwwkew', output: '3' }
    ],
    templates: {
      javascript: "const s = require('fs').readFileSync(0, 'utf8').replace(/\\r?\\n$/, '');\n\nfunction lengthOfLongestSubstring(s) {\n  // TODO: 在这里写你的解法\n  return 0;\n}\n\nconsole.log(lengthOfLongestSubstring(s));\n",
      python: "import sys\ns = sys.stdin.read().rstrip('\\r\\n')\n\ndef length_of_longest_substring(s):\n    # TODO: 在这里写你的解法\n    return 0\n\nprint(length_of_longest_substring(s))\n",
      cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint lengthOfLongestSubstring(const string& s) {\n    // TODO: 在这里写你的解法\n    return 0;\n}\n\nint main() { string s; getline(cin, s); cout << lengthOfLongestSubstring(s) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function lengthOfLongestSubstring(s) {\n  const last = new Map();\n  let left = 0, best = 0;\n  for (let right = 0; right < s.length; right++) {\n    if (last.has(s[right])) left = Math.max(left, last.get(s[right]) + 1);\n    last.set(s[right], right);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}\n",
      python: "def length_of_longest_substring(s):\n    last = {}\n    left = best = 0\n    for right, char in enumerate(s):\n        if char in last:\n            left = max(left, last[char] + 1)\n        last[char] = right\n        best = max(best, right - left + 1)\n    return best\n",
      cpp: "int lengthOfLongestSubstring(const string& s) {\n    vector<int> last(256, -1);\n    int left = 0, best = 0;\n    for (int right = 0; right < (int)s.size(); right++) {\n        unsigned char c = s[right];\n        left = max(left, last[c] + 1);\n        last[c] = right;\n        best = max(best, right - left + 1);\n    }\n    return best;\n}\n"
    }
  },
  'maximum-subarray': {
    id: 53,
    summary: '给定一个非空整数数组 nums，请找出和最大的连续子数组，并输出这个最大和。连续子数组至少包含一个元素。',
    input: '一行空格分隔的整数，表示数组 nums。',
    output: '一个整数，表示连续子数组能够取得的最大和。',
    examples: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6' },
      { input: '1', output: '1' },
      { input: '5 4 -1 7 8', output: '23' }
    ],
    templates: {
      javascript: "const nums = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction maxSubArray(nums) {\n  // TODO: 在这里写你的解法\n  return 0;\n}\n\nconsole.log(maxSubArray(nums));\n",
      python: "nums = list(map(int, input().split()))\n\ndef max_sub_array(nums):\n    # TODO: 在这里写你的解法\n    return 0\n\nprint(max_sub_array(nums))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nlong long maxSubArray(const vector<long long>& nums) {\n    // TODO: 在这里写你的解法\n    return 0;\n}\n\nint main() { vector<long long> nums; long long value; while (cin >> value) nums.push_back(value); cout << maxSubArray(nums) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function maxSubArray(nums) {\n  let current = nums[0], best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    current = Math.max(nums[i], current + nums[i]);\n    best = Math.max(best, current);\n  }\n  return best;\n}\n",
      python: "def max_sub_array(nums):\n    current = best = nums[0]\n    for value in nums[1:]:\n        current = max(value, current + value)\n        best = max(best, current)\n    return best\n",
      cpp: "long long maxSubArray(const vector<long long>& nums) {\n    long long current = nums[0], best = nums[0];\n    for (int i = 1; i < (int)nums.size(); i++) {\n        current = max(nums[i], current + nums[i]);\n        best = max(best, current);\n    }\n    return best;\n}\n"
    }
  },
  'merge-intervals': {
    id: 56,
    summary: '给定若干闭区间，请合并所有相互重叠或端点相接的区间，并按起点升序输出合并结果。',
    input: '每行两个空格分隔的整数 start end，表示一个闭区间；至少包含一个区间。',
    output: '每个合并后的区间输出一行，格式为 start end，并按起点升序排列。',
    examples: [
      { input: '1 3\n2 6\n8 10\n15 18', output: '1 6\n8 10\n15 18' },
      { input: '1 4\n4 5', output: '1 5' },
      { input: '1 4\n0 2\n3 5', output: '0 5' }
    ],
    templates: {
      javascript: "const intervals = require('fs').readFileSync(0, 'utf8').trim().split(/\\n/).map(line => line.trim().split(/\\s+/).map(Number));\n\nfunction merge(intervals) {\n  // TODO: 在这里写你的解法\n  return [];\n}\n\nconsole.log(merge(intervals).map(item => item.join(' ')).join('\\n'));\n",
      python: "import sys\nintervals = [list(map(int, line.split())) for line in sys.stdin.read().strip().splitlines()]\n\ndef merge(intervals):\n    # TODO: 在这里写你的解法\n    return []\n\nprint('\\n'.join(f'{start} {end}' for start, end in merge(intervals)))\n",
      cpp: "#include <algorithm>\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<vector<int>> mergeIntervals(vector<vector<int>> intervals) {\n    // TODO: 在这里写你的解法\n    return {};\n}\n\nint main() {\n    vector<vector<int>> intervals; int start, end;\n    while (cin >> start >> end) intervals.push_back({start, end});\n    for (const auto& item : mergeIntervals(intervals)) cout << item[0] << ' ' << item[1] << '\\n';\n}\n"
    },
    solutions: {
      javascript: "function merge(intervals) {\n  intervals.sort((a, b) => a[0] - b[0] || a[1] - b[1]);\n  const result = [];\n  for (const interval of intervals) {\n    const last = result[result.length - 1];\n    if (!last || interval[0] > last[1]) result.push(interval.slice());\n    else last[1] = Math.max(last[1], interval[1]);\n  }\n  return result;\n}\n",
      python: "def merge(intervals):\n    result = []\n    for start, end in sorted(intervals):\n        if not result or start > result[-1][1]:\n            result.append([start, end])\n        else:\n            result[-1][1] = max(result[-1][1], end)\n    return result\n",
      cpp: "vector<vector<int>> mergeIntervals(vector<vector<int>> intervals) {\n    sort(intervals.begin(), intervals.end());\n    vector<vector<int>> result;\n    for (const auto& interval : intervals) {\n        if (result.empty() || interval[0] > result.back()[1]) result.push_back(interval);\n        else result.back()[1] = max(result.back()[1], interval[1]);\n    }\n    return result;\n}\n"
    }
  }
};
