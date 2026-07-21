module.exports = {
  'container-with-most-water': {
    id: 11,
    summary: '给定一组非负整数 height，每个整数表示位于对应下标处的竖线高度。任选两条竖线与横轴组成容器，请输出能够容纳水的最大面积。',
    input: '一行空格分隔的非负整数，表示各竖线高度；至少包含两个整数。',
    output: '一个整数，表示两条竖线能够围成的最大面积。',
    examples: [
      { input: '1 8 6 2 5 4 8 3 7', output: '49' },
      { input: '1 1', output: '1' },
      { input: '1 2 1', output: '2' }
    ],
    templates: {
      javascript: "const height = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction maxArea(height) {\n  // TODO: 在这里写你的解法\n  return 0;\n}\n\nconsole.log(maxArea(height));\n",
      python: "height = list(map(int, input().split()))\n\ndef max_area(height):\n    # TODO: 在这里写你的解法\n    return 0\n\nprint(max_area(height))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nlong long maxArea(const vector<long long>& height) {\n    // TODO: 在这里写你的解法\n    return 0;\n}\n\nint main() { vector<long long> height; long long value; while (cin >> value) height.push_back(value); cout << maxArea(height) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function maxArea(height) {\n  let left = 0, right = height.length - 1, best = 0;\n  while (left < right) {\n    best = Math.max(best, Math.min(height[left], height[right]) * (right - left));\n    if (height[left] <= height[right]) left += 1;\n    else right -= 1;\n  }\n  return best;\n}\n",
      python: "def max_area(height):\n    left, right, best = 0, len(height) - 1, 0\n    while left < right:\n        best = max(best, min(height[left], height[right]) * (right - left))\n        if height[left] <= height[right]:\n            left += 1\n        else:\n            right -= 1\n    return best\n",
      cpp: "long long maxArea(const vector<long long>& height) {\n    int left = 0, right = (int)height.size() - 1;\n    long long best = 0;\n    while (left < right) {\n        best = max(best, min(height[left], height[right]) * (right - left));\n        if (height[left] <= height[right]) left++;\n        else right--;\n    }\n    return best;\n}\n"
    }
  },
  'trapping-rain-water': {
    id: 42,
    summary: '给定一组非负整数 height，表示宽度均为 1 的柱子高度。下雨后柱子之间会形成积水，请计算总共能够接住多少单位的水。',
    input: '一行空格分隔的非负整数，表示从左到右的柱子高度。',
    output: '一个整数，表示所有位置能够接住的雨水总量。',
    examples: [
      { input: '0 1 0 2 1 0 1 3 2 1 2 1', output: '6' },
      { input: '4 2 0 3 2 5', output: '9' },
      { input: '2 0 2', output: '2' }
    ],
    templates: {
      javascript: "const height = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction trap(height) {\n  // TODO: 在这里写你的解法\n  return 0;\n}\n\nconsole.log(trap(height));\n",
      python: "height = list(map(int, input().split()))\n\ndef trap(height):\n    # TODO: 在这里写你的解法\n    return 0\n\nprint(trap(height))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nlong long trap(const vector<long long>& height) {\n    // TODO: 在这里写你的解法\n    return 0;\n}\n\nint main() { vector<long long> height; long long value; while (cin >> value) height.push_back(value); cout << trap(height) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function trap(height) {\n  let left = 0, right = height.length - 1, leftMax = 0, rightMax = 0, water = 0;\n  while (left < right) {\n    if (height[left] <= height[right]) {\n      leftMax = Math.max(leftMax, height[left]);\n      water += leftMax - height[left++];\n    } else {\n      rightMax = Math.max(rightMax, height[right]);\n      water += rightMax - height[right--];\n    }\n  }\n  return water;\n}\n",
      python: "def trap(height):\n    left, right = 0, len(height) - 1\n    left_max = right_max = water = 0\n    while left < right:\n        if height[left] <= height[right]:\n            left_max = max(left_max, height[left])\n            water += left_max - height[left]\n            left += 1\n        else:\n            right_max = max(right_max, height[right])\n            water += right_max - height[right]\n            right -= 1\n    return water\n",
      cpp: "long long trap(const vector<long long>& height) {\n    int left = 0, right = (int)height.size() - 1;\n    long long leftMax = 0, rightMax = 0, water = 0;\n    while (left < right) {\n        if (height[left] <= height[right]) {\n            leftMax = max(leftMax, height[left]);\n            water += leftMax - height[left++];\n        } else {\n            rightMax = max(rightMax, height[right]);\n            water += rightMax - height[right--];\n        }\n    }\n    return water;\n}\n"
    }
  },
  'daily-temperatures': {
    id: 739,
    summary: '给定每日温度数组 temperatures，请为每一天计算还要等待多少天才会出现更高温度；如果之后不会升温，则该位置输出 0。',
    input: '一行空格分隔的整数，表示每日温度。',
    output: '一行空格分隔的整数，第 i 个数表示第 i 天需要等待的天数。',
    examples: [
      { input: '73 74 75 71 69 72 76 73', output: '1 1 4 2 1 1 0 0' },
      { input: '30 40 50 60', output: '1 1 1 0' },
      { input: '30 60 90', output: '1 1 0' }
    ],
    templates: {
      javascript: "const temperatures = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction dailyTemperatures(temperatures) {\n  // TODO: 在这里写你的解法\n  return [];\n}\n\nconsole.log(dailyTemperatures(temperatures).join(' '));\n",
      python: "temperatures = list(map(int, input().split()))\n\ndef daily_temperatures(temperatures):\n    # TODO: 在这里写你的解法\n    return []\n\nprint(*daily_temperatures(temperatures))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> dailyTemperatures(const vector<int>& temperatures) {\n    // TODO: 在这里写你的解法\n    return {};\n}\n\nint main() { vector<int> values; int value; while (cin >> value) values.push_back(value); auto answer = dailyTemperatures(values); for (int i = 0; i < (int)answer.size(); i++) cout << (i ? \" \" : \"\") << answer[i]; cout << '\\n'; }\n"
    },
    solutions: {
      javascript: "function dailyTemperatures(temperatures) {\n  const answer = Array(temperatures.length).fill(0), stack = [];\n  for (let day = 0; day < temperatures.length; day++) {\n    while (stack.length && temperatures[day] > temperatures[stack.at(-1)]) {\n      const previous = stack.pop();\n      answer[previous] = day - previous;\n    }\n    stack.push(day);\n  }\n  return answer;\n}\n",
      python: "def daily_temperatures(temperatures):\n    answer = [0] * len(temperatures)\n    stack = []\n    for day, temperature in enumerate(temperatures):\n        while stack and temperature > temperatures[stack[-1]]:\n            previous = stack.pop()\n            answer[previous] = day - previous\n        stack.append(day)\n    return answer\n",
      cpp: "vector<int> dailyTemperatures(const vector<int>& temperatures) {\n    vector<int> answer(temperatures.size()), stack;\n    for (int day = 0; day < (int)temperatures.size(); day++) {\n        while (!stack.empty() && temperatures[day] > temperatures[stack.back()]) {\n            int previous = stack.back(); stack.pop_back();\n            answer[previous] = day - previous;\n        }\n        stack.push_back(day);\n    }\n    return answer;\n}\n"
    }
  }
};
