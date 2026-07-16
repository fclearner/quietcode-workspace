const fs = require('node:fs');
const path = require('node:path');

const appRoot = path.resolve(__dirname, '..');
const sourceRoot = path.resolve(appRoot, '..', 'leetcode-company-wise-problems');
const outputDir = path.join(appRoot, 'data');
const outputFile = path.join(outputDir, 'problems.json');

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
      javascript: "const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf8').trim().split(/\\n/);\nconst nums = lines[0].trim().split(/\\s+/).map(Number);\nconst target = Number(lines[1]);\n\n// 在这里写你的解法\nconst seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const j = seen.get(target - nums[i]);\n  if (j !== undefined) {\n    console.log(j, i);\n    break;\n  }\n  seen.set(nums[i], i);\n}\n",
      python: "import sys\nlines = sys.stdin.read().strip().splitlines()\nnums = list(map(int, lines[0].split()))\ntarget = int(lines[1])\n\n# 在这里写你的解法\nseen = {}\nfor i, num in enumerate(nums):\n    if target - num in seen:\n        print(seen[target - num], i)\n        break\n    seen[num] = i\n",
      cpp: "#include <iostream>\n#include <unordered_map>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> nums; int x, target;\n    string line; getline(cin, line);\n    // 在这里写你的解法\n    size_t pos = 0;\n    while (pos < line.size()) { nums.push_back(stoi(line, &pos)); while (pos < line.size() && line[pos] == ' ') pos++; line = line.substr(pos); pos = 0; }\n    cin >> target; unordered_map<int,int> seen;\n    for (int i=0;i<(int)nums.size();i++) {\n        if (seen.count(target-nums[i])) { cout << seen[target-nums[i]] << ' ' << i << '\\n'; return 0; }\n        seen[nums[i]]=i;\n    }\n}\n"
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
      javascript: "const s = require('fs').readFileSync(0, 'utf8').trim();\n// 在这里写你的解法\nconst pairs = {')':'(', ']':'[', '}':'{'};\nconst stack = [];\nfor (const char of s) {\n  if ('([{'.includes(char)) stack.push(char);\n  else if (stack.pop() !== pairs[char]) { console.log('false'); process.exit(); }\n}\nconsole.log(stack.length === 0 ? 'true' : 'false');\n",
      python: "s = input().strip()\n# 在这里写你的解法\npairs = {')': '(', ']': '[', '}': '{'}\nstack = []\nfor char in s:\n    if char in '([{': stack.append(char)\n    elif not stack or stack.pop() != pairs[char]:\n        print('false')\n        break\nelse:\n    print('true' if not stack else 'false')\n",
      cpp: "#include <iostream>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\nint main(){ string s; cin>>s; stack<char> st; unordered_map<char,char> p={{')','('},{']','['},{'}','{'}}; for(char c:s){ if(c=='('||c=='['||c=='{') st.push(c); else if(st.empty()||st.top()!=p[c]){cout<<\"false\\n\";return 0;} else st.pop(); } cout<<(st.empty()?\"true\":\"false\")<<'\\n'; }\n"
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
      javascript: "const prices = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\n// 在这里写你的解法\nlet low = Infinity, profit = 0;\nfor (const price of prices) { low = Math.min(low, price); profit = Math.max(profit, price - low); }\nconsole.log(profit);\n",
      python: "prices = list(map(int, input().split()))\n# 在这里写你的解法\nlow, profit = float('inf'), 0\nfor price in prices:\n    low = min(low, price)\n    profit = max(profit, price - low)\nprint(profit)\n",
      cpp: "#include <iostream>\n#include <climits>\n#include <algorithm>\nusing namespace std;\nint main(){ int x,low=INT_MAX,profit=0; while(cin>>x){low=min(low,x);profit=max(profit,x-low);} cout<<profit<<'\\n'; }\n"
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
          templates: extra.templates || {}
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
  companies: companyDirs,
  problems
}));

console.log(`Imported ${problems.length} unique problems from ${companyDirs.length} companies.`);
