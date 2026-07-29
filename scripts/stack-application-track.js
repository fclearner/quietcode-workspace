module.exports = {
  'maximal-rectangle': {
    id: 85,
    summary: '给定一个只包含 0 和 1 的二维矩阵，请找出只包含 1 的最大轴对齐矩形，并输出它的面积。',
    input: '每行是一个等长的 01 字符串，表示矩阵的一行；矩阵至少包含一行一列。',
    output: '一个整数，表示矩阵中全为 1 的最大矩形面积。',
    examples: [
      { input: '10100\n10111\n11111\n10010', output: '6' },
      { input: '0', output: '0' },
      { input: '1', output: '1' }
    ],
    templates: {
      javascript: "const matrix = require('fs').readFileSync(0, 'utf8').trim().split(/\\n/).map(line => [...line.trim()]);\n\nfunction maximalRectangle(matrix) {\n  // TODO: 在这里写你的解法\n  return 0;\n}\n\nconsole.log(maximalRectangle(matrix));\n",
      python: "import sys\nmatrix = [list(line.strip()) for line in sys.stdin.read().strip().splitlines()]\n\ndef maximal_rectangle(matrix):\n    # TODO: 在这里写你的解法\n    return 0\n\nprint(maximal_rectangle(matrix))\n",
      cpp: "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nlong long maximalRectangle(const vector<string>& matrix) {\n    // TODO: 在这里写你的解法\n    return 0;\n}\n\nint main() { vector<string> matrix; string row; while (cin >> row) matrix.push_back(row); cout << maximalRectangle(matrix) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function maximalRectangle(matrix) {\n  const heights = Array(matrix[0].length).fill(0);\n  let best = 0;\n  for (const row of matrix) {\n    row.forEach((cell, column) => { heights[column] = cell === '1' ? heights[column] + 1 : 0; });\n    const stack = [];\n    for (let right = 0; right <= heights.length; right++) {\n      const current = right === heights.length ? 0 : heights[right];\n      while (stack.length && heights[stack.at(-1)] > current) {\n        const height = heights[stack.pop()];\n        const left = stack.length ? stack.at(-1) + 1 : 0;\n        best = Math.max(best, height * (right - left));\n      }\n      stack.push(right);\n    }\n  }\n  return best;\n}\n",
      python: "def maximal_rectangle(matrix):\n    heights = [0] * len(matrix[0])\n    best = 0\n    for row in matrix:\n        for column, cell in enumerate(row):\n            heights[column] = heights[column] + 1 if cell == '1' else 0\n        stack = []\n        for right in range(len(heights) + 1):\n            current = 0 if right == len(heights) else heights[right]\n            while stack and heights[stack[-1]] > current:\n                height = heights[stack.pop()]\n                left = stack[-1] + 1 if stack else 0\n                best = max(best, height * (right - left))\n            stack.append(right)\n    return best\n",
      cpp: "long long maximalRectangle(const vector<string>& matrix) {\n    vector<long long> heights(matrix[0].size());\n    long long best = 0;\n    for (const string& row : matrix) {\n        for (int column = 0; column < (int)row.size(); column++) heights[column] = row[column] == '1' ? heights[column] + 1 : 0;\n        vector<int> stack;\n        for (int right = 0; right <= (int)heights.size(); right++) {\n            long long current = right == (int)heights.size() ? 0 : heights[right];\n            while (!stack.empty() && heights[stack.back()] > current) {\n                long long height = heights[stack.back()]; stack.pop_back();\n                int left = stack.empty() ? 0 : stack.back() + 1;\n                best = max(best, height * (right - left));\n            }\n            stack.push_back(right);\n        }\n    }\n    return best;\n}\n"
    }
  },
  '132-pattern': {
    id: 456,
    summary: '给定整数数组 nums，判断是否存在下标 i < j < k，使 nums[i] < nums[k] < nums[j]。这种相对大小关系称为 132 模式。',
    input: '一行空格分隔的整数数组 nums；至少包含一个整数。',
    output: '存在 132 模式输出 true，否则输出 false。',
    examples: [
      { input: '3 1 4 2', output: 'true' },
      { input: '-1 3 2 0', output: 'true' },
      { input: '1 2 3 4', output: 'false' }
    ],
    templates: {
      javascript: "const nums = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction find132pattern(nums) {\n  // TODO: 在这里写你的解法\n  return false;\n}\n\nconsole.log(find132pattern(nums) ? 'true' : 'false');\n",
      python: "nums = list(map(int, input().split()))\n\ndef find_132_pattern(nums):\n    # TODO: 在这里写你的解法\n    return False\n\nprint('true' if find_132_pattern(nums) else 'false')\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nbool find132pattern(const vector<long long>& nums) {\n    // TODO: 在这里写你的解法\n    return false;\n}\n\nint main() { vector<long long> nums; long long value; while (cin >> value) nums.push_back(value); cout << (find132pattern(nums) ? \"true\" : \"false\") << '\\n'; }\n"
    },
    solutions: {
      javascript: "function find132pattern(nums) {\n  const stack = [];\n  let middle = -Infinity;\n  for (let index = nums.length - 1; index >= 0; index--) {\n    if (nums[index] < middle) return true;\n    while (stack.length && nums[index] > stack.at(-1)) middle = stack.pop();\n    stack.push(nums[index]);\n  }\n  return false;\n}\n",
      python: "def find_132_pattern(nums):\n    stack = []\n    middle = float('-inf')\n    for value in reversed(nums):\n        if value < middle:\n            return True\n        while stack and value > stack[-1]:\n            middle = stack.pop()\n        stack.append(value)\n    return False\n",
      cpp: "bool find132pattern(const vector<long long>& nums) {\n    vector<long long> stack;\n    long long middle = LLONG_MIN;\n    for (int index = nums.size() - 1; index >= 0; index--) {\n        if (nums[index] < middle) return true;\n        while (!stack.empty() && nums[index] > stack.back()) { middle = stack.back(); stack.pop_back(); }\n        stack.push_back(nums[index]);\n    }\n    return false;\n}\n"
    }
  },
  'asteroid-collision': {
    id: 735,
    summary: '给定一行整数表示同一直线上的小行星，绝对值是大小，正负号表示向右或向左运动。相向的小行星会碰撞，较小者消失，大小相同则同时消失；同向不会碰撞。输出最终剩余序列。',
    input: '一行空格分隔的非零整数，按从左到右顺序表示小行星。',
    output: '一行空格分隔的整数，表示所有碰撞结束后剩余的小行星；全部消失时输出空行。',
    examples: [
      { input: '5 10 -5', output: '5 10' },
      { input: '8 -8', output: '' },
      { input: '10 2 -5', output: '10' }
    ],
    templates: {
      javascript: "const asteroids = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction asteroidCollision(asteroids) {\n  // TODO: 在这里写你的解法\n  return [];\n}\n\nconsole.log(asteroidCollision(asteroids).join(' '));\n",
      python: "asteroids = list(map(int, input().split()))\n\ndef asteroid_collision(asteroids):\n    # TODO: 在这里写你的解法\n    return []\n\nprint(*asteroid_collision(asteroids))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> asteroidCollision(const vector<int>& asteroids) {\n    // TODO: 在这里写你的解法\n    return {};\n}\n\nint main() { vector<int> values; int value; while (cin >> value) values.push_back(value); auto answer = asteroidCollision(values); for (int i = 0; i < (int)answer.size(); i++) cout << (i ? \" \" : \"\") << answer[i]; cout << '\\n'; }\n"
    },
    solutions: {
      javascript: "function asteroidCollision(asteroids) {\n  const stack = [];\n  for (const asteroid of asteroids) {\n    let alive = true;\n    while (alive && asteroid < 0 && stack.length && stack.at(-1) > 0) {\n      if (stack.at(-1) < -asteroid) stack.pop();\n      else { if (stack.at(-1) === -asteroid) stack.pop(); alive = false; }\n    }\n    if (alive) stack.push(asteroid);\n  }\n  return stack;\n}\n",
      python: "def asteroid_collision(asteroids):\n    stack = []\n    for asteroid in asteroids:\n        alive = True\n        while alive and asteroid < 0 and stack and stack[-1] > 0:\n            if stack[-1] < -asteroid:\n                stack.pop()\n            else:\n                if stack[-1] == -asteroid:\n                    stack.pop()\n                alive = False\n        if alive:\n            stack.append(asteroid)\n    return stack\n",
      cpp: "vector<int> asteroidCollision(const vector<int>& asteroids) {\n    vector<int> stack;\n    for (int asteroid : asteroids) {\n        bool alive = true;\n        while (alive && asteroid < 0 && !stack.empty() && stack.back() > 0) {\n            if (stack.back() < -asteroid) stack.pop_back();\n            else { if (stack.back() == -asteroid) stack.pop_back(); alive = false; }\n        }\n        if (alive) stack.push_back(asteroid);\n    }\n    return stack;\n}\n"
    }
  }
};
