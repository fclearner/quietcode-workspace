const data = require('../data/problems.json');
const { getHiddenTestCount } = require('../hidden-tests');

const languages = ['javascript', 'python', 'cpp'];
const complete = [];
const metadataOnly = [];
const errors = [];

for (const problem of data.problems) {
  const hasAnyContent = Boolean(problem.summary || problem.input || problem.output || problem.examples?.length
    || Object.keys(problem.templates || {}).length || Object.keys(problem.solutions || {}).length);
  if (!hasAnyContent) {
    metadataOnly.push(problem.slug);
    continue;
  }

  const missing = [];
  if (!problem.summary) missing.push('summary');
  if (!problem.input) missing.push('input');
  if (!problem.output) missing.push('output');
  if (!problem.examples?.length) missing.push('examples');
  for (const language of languages) {
    if (!problem.templates?.[language]) missing.push(`templates.${language}`);
    if (!problem.solutions?.[language]) missing.push(`solutions.${language}`);
  }
  if (missing.length) {
    errors.push(`${problem.slug}: 缺少 ${missing.join(', ')}`);
    continue;
  }
  if (!languages.every((language) => /TODO/.test(problem.templates[language]))) errors.push(`${problem.slug}: 初始模板必须保留 TODO`);
  if (!getHiddenTestCount(problem.slug)) errors.push(`${problem.slug}: 缺少服务端隐藏用例`);
  complete.push(problem.slug);
}

console.log(`内容审计：${complete.length} 道本地完整题，${metadataOnly.length} 条外部题目索引，${errors.length} 个异常。`);
console.log(`本地完整题：${complete.join(', ') || '无'}`);
if (errors.length) {
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
}
