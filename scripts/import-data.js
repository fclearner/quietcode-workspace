const fs = require('node:fs');
const path = require('node:path');

const appRoot = path.resolve(__dirname, '..');
const sourceRoot = path.resolve(appRoot, '..', 'leetcode-company-wise-problems');
const outputDir = path.join(appRoot, 'data');
const outputFile = path.join(outputDir, 'problems.json');
const supplementalFile = path.join(outputDir, 'supplemental-company-lists.json');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}

function slugFromLink(link) {
  const match = String(link || '').match(/\/problems\/([^/?#]+)/);
  return match?.[1] || '';
}

function normalizeAcceptance(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round((number <= 1 ? number * 100 : number) * 10) / 10;
}

const curated = {
  'two-sum': {
    id: 1,
    summary: '给定一个整数数组 nums 和一个整数 target，请输出两个数之和等于 target 的下标。',
    input: '第一行：空格分隔的整数数组\n第二行：目标整数 target',
    output: '升序输出两个下标，以空格分隔。',
    examples: [
      { input: '2 7 11 15\n9', output: '0 1' },
      { input: '3 2 4\n6', output: '1 2' },
      { input: '3 3\n6', output: '0 1' }
    ],
    templates: {
      javascript: "const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf8').trim().split(/\\n/);\nconst nums = lines[0].trim().split(/\\s+/).map(Number);\nconst target = Number(lines[1]);\n\nfunction twoSum(nums, target) {\n  // TODO: 在这里写你的解法\n  return [];\n}\n\nconsole.log(twoSum(nums, target).join(' '));\n",
      python: "import sys\nlines = sys.stdin.read().strip().splitlines()\nnums = list(map(int, lines[0].split()))\ntarget = int(lines[1])\n\ndef two_sum(nums, target):\n    # TODO: 在这里写你的解法\n    return []\n\nprint(*two_sum(nums, target))\n",
      cpp: "#include <iostream>\n#include <sstream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(const vector<int>& nums, int target) {\n    // TODO: 在这里写你的解法\n    return {};\n}\n\nint main() {\n    string line; getline(cin, line);\n    stringstream ss(line); vector<int> nums; int value, target;\n    while (ss >> value) nums.push_back(value);\n    cin >> target;\n    vector<int> answer = twoSum(nums, target);\n    for (int i = 0; i < (int)answer.size(); i++) cout << (i ? \" \" : \"\") << answer[i];\n    cout << '\\n';\n}\n"
    },
    solutions: {
      javascript: "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const j = seen.get(target - nums[i]);\n    if (j !== undefined) return [j, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n",
      python: "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []\n",
      cpp: "vector<int> twoSum(const vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < (int)nums.size(); i++) {\n        if (seen.count(target - nums[i])) return {seen[target - nums[i]], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}\n"
    }
  },
  'valid-parentheses': {
    id: 20,
    summary: '给定一个只包括括号字符的字符串，判断字符串是否有效。括号必须以正确顺序闭合。',
    input: '一行字符串，仅包含 ()[]{}。',
    output: '有效输出 true，否则输出 false。',
    examples: [
      { input: '()', output: 'true' },
      { input: '()[]{}', output: 'true' },
      { input: '(]', output: 'false' }
    ],
    templates: {
      javascript: "const s = require('fs').readFileSync(0, 'utf8').trim();\n\nfunction isValid(s) {\n  // TODO: 在这里写你的解法\n  return false;\n}\n\nconsole.log(isValid(s) ? 'true' : 'false');\n",
      python: "s = input().strip()\n\ndef is_valid(s):\n    # TODO: 在这里写你的解法\n    return False\n\nprint('true' if is_valid(s) else 'false')\n",
      cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nbool isValid(const string& s) {\n    // TODO: 在这里写你的解法\n    return false;\n}\n\nint main() { string s; cin >> s; cout << (isValid(s) ? \"true\" : \"false\") << '\\n'; }\n"
    },
    solutions: {
      javascript: "function isValid(s) {\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const char of s) {\n    if ('([{'.includes(char)) stack.push(char);\n    else if (stack.pop() !== pairs[char]) return false;\n  }\n  return stack.length === 0;\n}\n",
      python: "def is_valid(s):\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for char in s:\n        if char in '([{':\n            stack.append(char)\n        elif not stack or stack.pop() != pairs[char]:\n            return False\n    return not stack\n",
      cpp: "bool isValid(const string& s) {\n    stack<char> opened;\n    unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};\n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') opened.push(c);\n        else if (opened.empty() || opened.top() != pairs[c]) return false;\n        else opened.pop();\n    }\n    return opened.empty();\n}\n"
    }
  },
  'best-time-to-buy-and-sell-stock': {
    id: 121,
    summary: '给定每天的股票价格，只允许完成一次买入和一次卖出，输出可以获得的最大利润。',
    input: '一行空格分隔的整数，表示每日价格。',
    output: '一个整数，表示最大利润；无法获利时输出 0。',
    examples: [
      { input: '7 1 5 3 6 4', output: '5' },
      { input: '7 6 4 3 1', output: '0' },
      { input: '2 4 1', output: '2' }
    ],
    templates: {
      javascript: "const prices = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n\nfunction maxProfit(prices) {\n  // TODO: 在这里写你的解法\n  return 0;\n}\n\nconsole.log(maxProfit(prices));\n",
      python: "prices = list(map(int, input().split()))\n\ndef max_profit(prices):\n    # TODO: 在这里写你的解法\n    return 0\n\nprint(max_profit(prices))\n",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint maxProfit(const vector<int>& prices) {\n    // TODO: 在这里写你的解法\n    return 0;\n}\n\nint main() { vector<int> prices; int value; while (cin >> value) prices.push_back(value); cout << maxProfit(prices) << '\\n'; }\n"
    },
    solutions: {
      javascript: "function maxProfit(prices) {\n  let lowest = Infinity;\n  let best = 0;\n  for (const price of prices) {\n    lowest = Math.min(lowest, price);\n    best = Math.max(best, price - lowest);\n  }\n  return best;\n}\n",
      python: "def max_profit(prices):\n    lowest = float('inf')\n    best = 0\n    for price in prices:\n        lowest = min(lowest, price)\n        best = max(best, price - lowest)\n    return best\n",
      cpp: "int maxProfit(const vector<int>& prices) {\n    int lowest = INT_MAX, best = 0;\n    for (int price : prices) {\n        lowest = min(lowest, price);\n        best = max(best, price - lowest);\n    }\n    return best;\n}\n"
    }
  },
  'lru-cache': {
    id: 146,
    summary: '设计并实现一个满足最近最少使用（LRU）淘汰策略的缓存。get(key) 在键存在时返回值并将该键标记为最近使用，否则返回 -1；put(key, value) 更新或插入键值，当容量已满时淘汰最久未使用的键。get 和 put 都应达到 O(1) 平均时间复杂度。',
    input: '第一行：正整数 capacity，表示缓存容量。\n后续每行是一条操作：get key 或 put key value。\n键和值均为整数，至少包含一条操作。',
    output: '每个 get 操作输出一行：键存在时输出对应值，否则输出 -1。put 操作不输出。',
    examples: [
      { input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4', output: '1\n-1\n-1\n3\n4' },
      { input: '1\nput 2 1\nget 2\nput 3 2\nget 2\nget 3', output: '1\n-1\n2' },
      { input: '2\nput 1 1\nput 2 2\nput 1 10\nget 1\nput 3 3\nget 2\nget 3', output: '10\n-1\n3' }
    ],
    templates: {
      javascript: "const lines = require('fs').readFileSync(0, 'utf8').trim().split(/\\n/);\n\nclass LRUCache {\n  constructor(capacity) {\n    // TODO: 初始化你的数据结构\n  }\n\n  get(key) {\n    // TODO: 返回值并更新最近使用顺序\n    return -1;\n  }\n\n  put(key, value) {\n    // TODO: 插入或更新，并在需要时淘汰旧键\n  }\n}\n\nconst cache = new LRUCache(Number(lines[0]));\nconst output = [];\nfor (const line of lines.slice(1)) {\n  const [op, key, value] = line.trim().split(/\\s+/);\n  if (op === 'get') output.push(cache.get(Number(key)));\n  else cache.put(Number(key), Number(value));\n}\nconsole.log(output.join('\\n'));\n",
      python: "import sys\nlines = sys.stdin.read().strip().splitlines()\n\nclass LRUCache:\n    def __init__(self, capacity):\n        # TODO: 初始化你的数据结构\n        pass\n\n    def get(self, key):\n        # TODO: 返回值并更新最近使用顺序\n        return -1\n\n    def put(self, key, value):\n        # TODO: 插入或更新，并在需要时淘汰旧键\n        pass\n\ncache = LRUCache(int(lines[0]))\noutput = []\nfor line in lines[1:]:\n    parts = line.split()\n    if parts[0] == 'get':\n        output.append(str(cache.get(int(parts[1]))))\n    else:\n        cache.put(int(parts[1]), int(parts[2]))\nprint('\\n'.join(output))\n",
      cpp: "#include <iostream>\n#include <list>\n#include <sstream>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // TODO: 初始化你的数据结构\n        (void)capacity;\n    }\n\n    int get(int key) {\n        // TODO: 返回值并更新最近使用顺序\n        (void)key;\n        return -1;\n    }\n\n    void put(int key, int value) {\n        // TODO: 插入或更新，并在需要时淘汰旧键\n        (void)key; (void)value;\n    }\n};\n\nint main() {\n    int capacity; cin >> capacity;\n    LRUCache cache(capacity);\n    string line; getline(cin, line);\n    while (getline(cin, line)) {\n        string op; int key, value; stringstream ss(line); ss >> op >> key;\n        if (op == \"get\") cout << cache.get(key) << '\\n';\n        else { ss >> value; cache.put(key, value); }\n    }\n}\n"
    },
    solutions: {
      javascript: "class Node {\n  constructor(key = 0, value = 0) {\n    this.key = key; this.value = value; this.prev = null; this.next = null;\n  }\n}\n\nclass LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.nodes = new Map();\n    this.head = new Node(); this.tail = new Node();\n    this.head.next = this.tail; this.tail.prev = this.head;\n  }\n  remove(node) { node.prev.next = node.next; node.next.prev = node.prev; }\n  addRecent(node) {\n    node.prev = this.tail.prev; node.next = this.tail;\n    this.tail.prev.next = node; this.tail.prev = node;\n  }\n  get(key) {\n    if (!this.nodes.has(key)) return -1;\n    const node = this.nodes.get(key);\n    this.remove(node); this.addRecent(node);\n    return node.value;\n  }\n  put(key, value) {\n    if (this.nodes.has(key)) {\n      const node = this.nodes.get(key); node.value = value;\n      this.remove(node); this.addRecent(node); return;\n    }\n    const node = new Node(key, value);\n    this.nodes.set(key, node); this.addRecent(node);\n    if (this.nodes.size > this.capacity) {\n      const oldest = this.head.next; this.remove(oldest); this.nodes.delete(oldest.key);\n    }\n  }\n}\n",
      python: "class Node:\n    def __init__(self, key=0, value=0):\n        self.key, self.value = key, value\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.nodes = {}\n        self.head, self.tail = Node(), Node()\n        self.head.next, self.tail.prev = self.tail, self.head\n\n    def _remove(self, node):\n        node.prev.next, node.next.prev = node.next, node.prev\n\n    def _add_recent(self, node):\n        node.prev, node.next = self.tail.prev, self.tail\n        self.tail.prev.next = node\n        self.tail.prev = node\n\n    def get(self, key):\n        if key not in self.nodes:\n            return -1\n        node = self.nodes[key]\n        self._remove(node)\n        self._add_recent(node)\n        return node.value\n\n    def put(self, key, value):\n        if key in self.nodes:\n            node = self.nodes[key]\n            node.value = value\n            self._remove(node)\n            self._add_recent(node)\n            return\n        node = Node(key, value)\n        self.nodes[key] = node\n        self._add_recent(node)\n        if len(self.nodes) > self.capacity:\n            oldest = self.head.next\n            self._remove(oldest)\n            del self.nodes[oldest.key]\n",
      cpp: "class LRUCache {\n    int capacity;\n    list<pair<int, int>> recent;\n    unordered_map<int, list<pair<int, int>>::iterator> nodes;\npublic:\n    LRUCache(int capacity) : capacity(capacity) {}\n    int get(int key) {\n        auto it = nodes.find(key);\n        if (it == nodes.end()) return -1;\n        recent.splice(recent.begin(), recent, it->second);\n        return it->second->second;\n    }\n    void put(int key, int value) {\n        auto it = nodes.find(key);\n        if (it != nodes.end()) {\n            it->second->second = value;\n            recent.splice(recent.begin(), recent, it->second);\n            return;\n        }\n        recent.emplace_front(key, value);\n        nodes[key] = recent.begin();\n        if ((int)nodes.size() > capacity) {\n            nodes.erase(recent.back().first);\n            recent.pop_back();\n        }\n    }\n};\n"
    }
  }
};

if (!fs.existsSync(sourceRoot)) {
  console.error(`Source repository not found: ${sourceRoot}`);
  process.exit(1);
}

const companyDirs = fs.readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== '.git')
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const problemMap = new Map();
const periodNames = {
  '1. Thirty Days.csv': '30d',
  '2. Three Months.csv': '3m',
  '3. Six Months.csv': '6m',
  '4. More Than Six Months.csv': '6m+',
  '5. All.csv': 'all'
};

for (const company of companyDirs) {
  const dir = path.join(sourceRoot, company);
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.csv'))) {
    const rows = parseCsv(fs.readFileSync(path.join(dir, file), 'utf8'));
    const header = rows.shift()?.map((cell) => cell.trim()) || [];
    const indexes = Object.fromEntries(header.map((name, index) => [name, index]));
    for (const row of rows) {
      const link = row[indexes.Link]?.trim();
      const slug = slugFromLink(link);
      if (!slug) continue;
      let problem = problemMap.get(slug);
      if (!problem) {
        const extra = curated[slug] || {};
        problem = {
          slug,
          id: extra.id || null,
          title: row[indexes.Title]?.trim() || slug,
          difficulty: (row[indexes.Difficulty]?.trim() || 'UNKNOWN').toLowerCase(),
          acceptance: normalizeAcceptance(row[indexes['Acceptance Rate']]),
          link,
          topics: (row[indexes.Topics] || '').split(',').map((item) => item.trim()).filter(Boolean),
          companies: [],
          summary: extra.summary || '',
          input: extra.input || '',
          output: extra.output || '',
          examples: extra.examples || [],
          templates: extra.templates || {},
          solutions: extra.solutions || {}
        };
        problemMap.set(slug, problem);
      }
      const rowAcceptance = normalizeAcceptance(row[indexes['Acceptance Rate']]);
      if (rowAcceptance !== null && (problem.acceptance === null || rowAcceptance > problem.acceptance)) {
        problem.acceptance = rowAcceptance;
      }
      const existing = problem.companies.find((item) => item.name === company);
      const frequency = Math.round((Number(row[indexes.Frequency]) || 0) * 10) / 10;
      if (existing) {
        existing.frequency = Math.max(existing.frequency, frequency);
        if (!existing.periods.includes(periodNames[file] || file)) existing.periods.push(periodNames[file] || file);
      } else {
        problem.companies.push({ name: company, frequency, periods: [periodNames[file] || file] });
      }
    }
  }
}

const supplementalSources = fs.existsSync(supplementalFile)
  ? JSON.parse(fs.readFileSync(supplementalFile, 'utf8')).sources || []
  : [];

for (const source of supplementalSources) {
  for (const entry of source.entries || []) {
    let problem = problemMap.get(entry.slug);
    if (!problem) {
      problem = {
        slug: entry.slug,
        id: entry.id || null,
        title: entry.title || entry.slug,
        difficulty: entry.difficulty || 'unknown',
        acceptance: entry.acceptance ?? null,
        link: `https://leetcode.com/problems/${entry.slug}`,
        topics: entry.topics || [],
        companies: [],
        summary: '', input: '', output: '', examples: [], templates: {}, solutions: {}
      };
      problemMap.set(entry.slug, problem);
    }
    if (!problem.id && entry.id) problem.id = entry.id;
    if (entry.acceptance != null && (problem.acceptance == null || entry.acceptance > problem.acceptance)) problem.acceptance = entry.acceptance;
    problem.supplementalSources ||= [];
    if (!problem.supplementalSources.some((item) => item.id === source.id)) {
      problem.supplementalSources.push({ id: source.id, label: source.label, url: source.url, snapshotDate: source.snapshotDate });
    }
    for (const company of entry.companies || []) {
      const existing = problem.companies.find((item) => item.name === company.name);
      const period = `supplement:${source.snapshotDate}`;
      if (existing) {
        existing.frequency = Math.max(existing.frequency, company.frequency || 0);
        if (!existing.periods.includes(period)) existing.periods.push(period);
      } else {
        problem.companies.push({ name: company.name, frequency: company.frequency || 0, periods: [period] });
      }
    }
  }
}

const problems = [...problemMap.values()].sort((a, b) => {
  if (a.id && b.id) return a.id - b.id;
  if (a.id) return -1;
  if (b.id) return 1;
  return a.title.localeCompare(b.title);
});

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: 'https://github.com/liquidslr/leetcode-company-wise-problems',
  supplementalSources: supplementalSources.map(({ entries, ...source }) => ({ ...source, entryCount: entries.length })),
  companies: companyDirs,
  problems
}));

console.log(`Imported ${problems.length} unique problems from ${companyDirs.length} companies, including ${supplementalSources.reduce((sum, source) => sum + source.entries.length, 0)} supplemental company tags.`);
