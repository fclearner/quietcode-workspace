const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value = '') => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
const difficultyName = { easy: '简单', medium: '中等', hard: '困难', unknown: '未知' };
const languageName = { javascript: 'JavaScript', python: 'Python 3', cpp: 'C++17' };
const STORAGE_KEY = 'workspace-state-v1';
const PAGE_SIZE = 25;
const hiddenCaseCounts = { 'two-sum': 27, 'valid-parentheses': 35, 'best-time-to-buy-and-sell-stock': 30, 'lru-cache': 25, 'design-hashset': 25 };
const JUDGE_VERSION = 4;
const hiddenJudgeSlugs = Object.keys(hiddenCaseCounts);

function migrateJudgeState(target, savedVersion) {
  const version = Number(savedVersion) || 0;
  target.verifiedSolved ||= {};
  // Any completion recorded after a hidden suite was introduced was genuinely verified.
  const previouslyVerified = [
    ...(version >= 1 ? ['two-sum', 'valid-parentheses', 'best-time-to-buy-and-sell-stock'] : []),
    ...(version >= 2 ? ['lru-cache'] : []),
    ...(version >= 4 ? ['design-hashset'] : [])
  ];
  previouslyVerified.forEach((slug) => {
    if (target.solved[slug]) target.verifiedSolved[slug] = target.solved[slug];
  });
  // Earlier migrations removed learning progress. Rebuild it from retained pass history,
  // but keep reference solutions locked until the new hidden suite is passed.
  for (const submission of [...(target.submissions || [])].reverse()) {
    if (!submission.passed || submission.kind !== 'submit' || !hiddenJudgeSlugs.includes(submission.slug)) continue;
    if (!target.solved[submission.slug]) target.solved[submission.slug] = String(submission.createdAt || '').slice(0, 10) || dateKey();
  }
  target.judgeVersion = JUDGE_VERSION;
}

const defaultState = {
  solved: {}, verifiedSolved: {}, attempted: {}, favorites: [], submissions: [], drafts: {}, notes: {}, customCases: {}, coachChats: {},
  settings: { theme: 'light', defaultLanguage: 'javascript', dailyGoal: 1, fontSize: 13 }, templateVersion: 2, judgeVersion: JUDGE_VERSION
};

let data = { problems: [], companies: [] };
let state = loadState();
let filters = { query: '', difficulty: '', company: '', status: '', topic: '', favorite: false, sort: 'frequency', page: 1 };
let currentProblem = null;
let currentCase = 0;
let activeLanguage = '';
let dailyProblem = null;
let guide = null;
let toastTimer;
let coachPending = false;
let coachProvider = 'local';
const lastExecutionByProblem = new Map();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem('algolab-state-v1'));
    const merged = { ...structuredClone(defaultState), ...saved, settings: { ...defaultState.settings, ...(saved?.settings || {}) } };
    if (saved && saved.templateVersion !== 2) {
      const markers = {
        'two-sum': ['const seen = new Map()', 'seen = {}', 'unordered_map<int,int> seen'],
        'valid-parentheses': ['const pairs =', "pairs = {')':", 'unordered_map<char,char>'],
        'best-time-to-buy-and-sell-stock': ['let low = Infinity, profit = 0', 'low, profit =', 'int x,low=INT_MAX,profit=0']
      };
      for (const [slug, signatures] of Object.entries(markers)) {
        let seededAnswerFound = false;
        const codes = merged.drafts?.[slug]?.codes;
        if (codes) {
          for (const [language, code] of Object.entries(codes)) {
            if (signatures.some((signature) => code.includes(signature))) {
              delete codes[language];
              seededAnswerFound = true;
            }
          }
        }
        merged.submissions = merged.submissions.filter((submission) => {
          const seeded = submission.slug === slug && signatures.some((signature) => String(submission.code || '').includes(signature));
          if (seeded) seededAnswerFound = true;
          return !seeded;
        });
        if (seededAnswerFound) {
          delete merged.solved[slug];
          delete merged.attempted[slug];
        }
      }
      merged.templateVersion = 2;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    if (saved && saved.judgeVersion !== JUDGE_VERSION) {
      migrateJudgeState(merged, saved.judgeVersion);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch { return structuredClone(defaultState); }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateStats();
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getStatus(slug) {
  if (state.solved[slug]) return 'solved';
  if (state.attempted[slug]) return 'attempted';
  return '';
}

function maxFrequency(problem) {
  return Math.max(0, ...problem.companies.map((company) => company.frequency || 0));
}

function hasLocalContent(problem) {
  return Boolean(problem.summary && problem.input && problem.output && problem.examples?.length
    && ['javascript', 'python', 'cpp'].every((language) => problem.templates?.[language]));
}

function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  $('#themeBtn').textContent = state.settings.theme === 'dark' ? '☀' : '☾';
  $('#darkToggle').checked = state.settings.theme === 'dark';
}

async function init() {
  applyTheme();
  bindEvents();
  refreshCoachProvider();
  try {
    const response = await fetch('/api/problems');
    if (!response.ok) throw new Error((await response.json()).error || '题库加载失败');
    data = await response.json();
    hydrateFilters();
    chooseDaily();
    renderProblems();
    updateStats();
    await refreshGuide();
    route();
  } catch (error) {
    $('#problemRows').innerHTML = `<div class="empty-state"><strong>无法加载题库</strong><span>${escapeHtml(error.message)}</span></div>`;
  }
}

function setCoachProvider(provider) {
  coachProvider = provider === 'codex' ? 'codex' : 'local';
  $('#coachProvider').textContent = coachProvider === 'codex' ? 'Codex 增强可用' : '本地引导可用';
  $('#coachPrivacy').textContent = coachProvider === 'codex'
    ? '提问会发送当前代码与测试结果到 Codex · 可自动降级本地模式'
    : '本地模式不上传代码 · 未通过前不直接给答案';
}

async function refreshCoachProvider() {
  try {
    const response = await fetch('/api/coach/status');
    if (response.ok) setCoachProvider((await response.json()).mode);
  } catch { setCoachProvider('local'); }
}

function hydrateFilters() {
  $('#heroProblemCount').textContent = data.problems.length.toLocaleString();
  const counts = { easy: 0, medium: 0, hard: 0 };
  const topics = new Map();
  for (const problem of data.problems) {
    if (counts[problem.difficulty] !== undefined) counts[problem.difficulty] += 1;
    for (const topic of problem.topics) topics.set(topic, (topics.get(topic) || 0) + 1);
  }
  for (const key of Object.keys(counts)) $(`#${key}Count`).textContent = counts[key].toLocaleString();
  $('#companyFilter').innerHTML += data.companies.map((company) => `<option value="${escapeHtml(company)}">${escapeHtml(company)}</option>`).join('');
  $('#topicCloud').innerHTML = [...topics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22)
    .map(([topic]) => `<button data-topic="${escapeHtml(topic)}">${escapeHtml(topic)}</button>`).join('');
}

function chooseDaily() {
  const seed = Number(dateKey().replaceAll('-', ''));
  const pool = data.problems.filter((problem) => problem.examples.length);
  dailyProblem = pool[seed % pool.length] || data.problems[seed % data.problems.length];
  if (!dailyProblem) return;
  $('#dailyTitle').textContent = dailyProblem.title;
  $('#dailyDifficulty').innerHTML = `<span class="difficulty-badge ${dailyProblem.difficulty}">${difficultyName[dailyProblem.difficulty]}</span>`;
  $('#dailyTopic').textContent = dailyProblem.topics[0] || 'Algorithm';
}

function filteredProblems() {
  const query = filters.query.trim().toLowerCase();
  const favoriteSet = new Set(state.favorites);
  const rows = data.problems.filter((problem) => {
    if (filters.difficulty && problem.difficulty !== filters.difficulty) return false;
    if (filters.company && !problem.companies.some((company) => company.name === filters.company)) return false;
    if (filters.topic && !problem.topics.includes(filters.topic)) return false;
    if ((filters.favorite || filters.status === 'favorite') && !favoriteSet.has(problem.slug)) return false;
    if (filters.status === 'solved' && !state.solved[problem.slug]) return false;
    if (filters.status === 'attempted' && (!state.attempted[problem.slug] || state.solved[problem.slug])) return false;
    if (query) {
      const haystack = `${problem.id || ''} ${problem.title} ${problem.slug} ${problem.topics.join(' ')} ${problem.companies.slice(0, 10).map((item) => item.name).join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
  const difficultyOrder = { easy: 1, medium: 2, hard: 3, unknown: 4 };
  rows.sort((a, b) => {
    if (filters.sort === 'title') return a.title.localeCompare(b.title);
    if (filters.sort === 'acceptance') return (b.acceptance || 0) - (a.acceptance || 0);
    if (filters.sort === 'difficulty') return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty] || a.title.localeCompare(b.title);
    return maxFrequency(b) - maxFrequency(a) || b.companies.length - a.companies.length;
  });
  return rows;
}

function renderProblems() {
  const rows = filteredProblems();
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  filters.page = Math.min(filters.page, pages);
  const pageRows = rows.slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE);
  $('#problemRows').innerHTML = pageRows.length ? pageRows.map(problemRow).join('') : '<div class="empty-state"><strong>没有匹配的题目</strong><span>试试重置筛选条件</span></div>';
  $('#resultSummary').textContent = `共 ${rows.length.toLocaleString()} 道题`;
  $('#pageLabel').textContent = `${filters.page} / ${pages}`;
  $('#prevPage').disabled = filters.page <= 1;
  $('#nextPage').disabled = filters.page >= pages;
}

function problemRow(problem) {
  const status = getStatus(problem.slug);
  const statusIcon = status === 'solved' ? '✓' : status === 'attempted' ? '◔' : '○';
  const labels = problem.companies.slice().sort((a, b) => b.frequency - a.frequency).slice(0, 3);
  const prefix = problem.id ? `${problem.id}. ` : '';
  const contentLabel = hasLocalContent(problem) ? '本地可练' : '外部题目索引';
  return `<div class="problem-table problem-row" data-slug="${problem.slug}">
    <span class="problem-status ${status}" title="${status || '未开始'}">${statusIcon}</span>
    <span class="problem-name"><strong>${escapeHtml(prefix + problem.title)}</strong><small>${contentLabel} · ${escapeHtml(problem.topics.slice(0, 4).join(' · ') || '暂无标签')}</small></span>
    <span class="difficulty-badge ${problem.difficulty}">${difficultyName[problem.difficulty] || '未知'}</span>
    <span class="acceptance">${problem.acceptance === null ? '—' : `${problem.acceptance.toFixed(1)}%`}</span>
    <span class="company-tags">${labels.map((item) => `<span>${escapeHtml(item.name)}</span>`).join('')}${problem.companies.length > 3 ? `<span>+${problem.companies.length - 3}</span>` : ''}</span>
    <button class="row-favorite ${state.favorites.includes(problem.slug) ? 'active' : ''}" data-favorite="${problem.slug}" title="收藏">${state.favorites.includes(problem.slug) ? '★' : '☆'}</button>
  </div>`;
}

function updateStats() {
  const solvedEntries = Object.entries(state.solved);
  const solved = solvedEntries.length;
  const total = data.problems.length;
  $('#solvedTotal').textContent = solved;
  $('#solvedRatio').textContent = `${solved} / ${total.toLocaleString()}`;
  $('#progressRing').style.setProperty('--p', total ? Math.min(100, solved / total * 100) : 0);
  const today = solvedEntries.filter(([, date]) => date === dateKey()).length;
  $('#todaySolved').textContent = today;
  const left = Math.max(0, state.settings.dailyGoal - today);
  $('#todayHint').textContent = left ? `再完成 ${left} 题达成目标` : '今日目标已达成';
  $('#favoriteCount').textContent = state.favorites.length;
  const submissions = state.submissions.filter((item) => item.kind === 'submit');
  const passed = submissions.filter((item) => item.passed).length;
  $('#acceptRate').textContent = submissions.length ? `${Math.round(passed / submissions.length * 100)}%` : '—';
  $('#submissionCount').textContent = submissions.length ? `${passed} / ${submissions.length} 次通过` : '暂无提交';
  $('#streakDays').textContent = calculateStreak();
}

function calculateStreak() {
  const dates = new Set(Object.values(state.solved));
  let streak = 0;
  const cursor = new Date();
  if (!dates.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(dateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

function showView(name) {
  ['listView', 'guideView', 'companyView', 'progressView', 'submissionsView', 'workspaceView'].forEach((id) => $(`#${id}`).classList.add('hidden'));
  const id = { problems: 'listView', guide: 'guideView', companies: 'companyView', progress: 'progressView', submissions: 'submissionsView', workspace: 'workspaceView' }[name];
  $(`#${id}`).classList.remove('hidden');
  $$('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.view === name));
  if (name === 'companies') renderCompanies();
  if (name === 'guide') renderGuide();
  if (name === 'progress') renderProgress();
  if (name === 'submissions') renderSubmissions();
}

function route() {
  const match = location.hash.match(/^#\/problem\/(.+)$/);
  if (match && data.problems.length) return openProblem(decodeURIComponent(match[1]), false);
  const view = location.hash.replace('#/', '') || 'problems';
  if (['problems', 'guide', 'companies', 'progress', 'submissions'].includes(view)) showView(view);
  else showView('problems');
}

async function refreshGuide(showNotice = false) {
  if (!data.problems.length) return;
  $('#refreshGuide').disabled = true;
  try {
    const response = await fetch('/api/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        today: dateKey(),
        solved: state.solved,
        attempted: state.attempted,
        dailyGoal: state.settings.dailyGoal,
        submissions: state.submissions.slice(0, 300).map(({ slug, kind, passed, createdAt }) => ({ slug, kind, passed, createdAt }))
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '学习计划生成失败');
    guide = result;
    renderGuide();
    if (currentProblem) renderDescription();
    if (showNotice) showToast('学习计划已根据本次记录更新');
  } catch (error) {
    if (showNotice) showToast(error.message);
    $('#guideMessage').textContent = `暂时无法生成计划：${error.message}`;
  } finally {
    $('#refreshGuide').disabled = false;
  }
}

function renderGuide() {
  if (!guide) return;
  const profile = guide.profile;
  const difficultyText = { easy: '基础巩固', medium: '稳定进阶', hard: '综合挑战' };
  const modeText = { retry: '优先回看', weakness: '弱项训练', warmup: '热身', core: '核心', stretch: '挑战', review: '复盘' };
  $('#guideMessage').textContent = guide.message;
  $('#readinessScore').textContent = profile.readiness;
  $('#readinessRing').style.setProperty('--score', profile.readiness);
  $('#targetDifficulty').textContent = difficultyText[profile.targetDifficulty] || '基础巩固';
  $('#guideToday').textContent = `${profile.todaySolved} / ${profile.dailyGoal}`;
  $('#guidePassRate').textContent = profile.submissionCount ? `${profile.passRate}%` : '待积累';
  $('#guideAttempted').textContent = profile.attemptedCount;
  $('#guideStreak').textContent = `${profile.streak} 天`;
  $('#guideUpdatedAt').textContent = `更新于 ${new Date(guide.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  $('#startRecommendation').disabled = !guide.recommendations.length;
  $('#recommendationList').innerHTML = guide.recommendations.length ? guide.recommendations.map((item, index) => `
    <article class="recommendation-item" data-guide-slug="${item.slug}">
      <span class="queue-number">${index + 1}</span>
      <div class="recommendation-main"><header><strong>${escapeHtml(`${item.id ? `${item.id}. ` : ''}${item.title}`)}</strong><span class="mode-pill ${item.mode}">${modeText[item.mode] || '训练'}</span></header><p>${escapeHtml(item.reason)}</p><div class="recommendation-tags"><span>${difficultyName[item.difficulty]}</span>${item.topics.slice(0, 3).map((topic) => `<span>${escapeHtml(topic)}</span>`).join('')}${item.hasLocalTests ? '<span>本地测试</span>' : ''}</div></div>
      <span>→</span>
    </article>`).join('') : '<div class="empty-state"><strong>当前目录已全部完成</strong><span>可以从间隔复盘开始</span></div>';
  $('#weakTopicList').innerHTML = guide.weakTopics.length ? guide.weakTopics.map((item) => `
    <div class="weak-topic"><header><strong>${escapeHtml(item.topic)}</strong><span>掌握度 ${item.mastery}%</span></header><div class="mastery-track"><i style="width:${item.mastery}%"></i></div><small>${item.struggling} 项待完成 · ${item.failures} 次未通过</small></div>`).join('') : '<div class="empty-state"><strong>还没有明确薄弱项</strong><span>完成几次提交后，我会开始识别</span></div>';
  $('#reviewSection').classList.toggle('hidden', !guide.reviews.length);
  $('#reviewList').innerHTML = guide.reviews.map((item) => `<article class="review-item" data-guide-slug="${item.slug}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.reason)}</span></article>`).join('');
}

function adviceForProblem(problem) {
  if (!guide) return '';
  const recommendation = guide.recommendations.find((item) => item.slug === problem.slug);
  if (recommendation) return recommendation.reason;
  const weak = guide.weakTopics.filter((item) => problem.topics.includes(item.topic)).slice(0, 2);
  if (weak.length) return `这项内容涉及当前待加强的 ${weak.map((item) => item.topic).join('、')}，建议重点记录失败边界和复杂度。`;
  if (state.solved[problem.slug]) return '你已经完成过这项内容。这次可以尝试不看旧代码复现，并比较时间与空间复杂度。';
  return `这项内容不在当前训练队列前列；如果现在开始，我仍会在提交后把结果纳入下一轮评估。`;
}

function renderCompanies() {
  const query = $('#companySearch').value.trim().toLowerCase();
  const counts = new Map(data.companies.map((company) => [company, { count: 0, hot: 0 }]));
  for (const problem of data.problems) for (const company of problem.companies) {
    const item = counts.get(company.name);
    item.count += 1;
    item.hot = Math.max(item.hot, company.frequency);
  }
  const colors = ['#566273', '#64748b', '#4f5d6e', '#6b7280', '#53677a', '#475569'];
  $('#companyGrid').innerHTML = [...counts.entries()].filter(([name]) => name.toLowerCase().includes(query)).sort((a, b) => b[1].count - a[1].count)
    .map(([name, info], index) => `<article class="company-card" data-company="${escapeHtml(name)}" style="--logo:${colors[index % colors.length]}"><div class="company-logo">${escapeHtml(name.slice(0, 1).toUpperCase())}</div><h3>${escapeHtml(name)}</h3><p>${info.count.toLocaleString()} 道收录题目</p><footer><span>最高频率 ${info.hot.toFixed(1)}</span><span>查看题库 →</span></footer></article>`).join('');
}

function renderProgress() {
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const slug of Object.keys(state.solved)) {
    const problem = data.problems.find((item) => item.slug === slug);
    if (problem && counts[problem.difficulty] !== undefined) counts[problem.difficulty] += 1;
  }
  const totals = Object.fromEntries(['easy', 'medium', 'hard'].map((level) => [level, data.problems.filter((item) => item.difficulty === level).length]));
  const days = [];
  for (let i = 181; i >= 0; i -= 1) { const d = new Date(); d.setDate(d.getDate() - i); const count = Object.values(state.solved).filter((value) => value === dateKey(d)).length; days.push({ date: dateKey(d), count }); }
  const submissions = state.submissions.filter((item) => item.kind === 'submit');
  $('#progressDashboard').innerHTML = `
    <article class="progress-card"><h3>难度分布</h3>${['easy', 'medium', 'hard'].map((level) => `<div class="metric-row"><span>${difficultyName[level]}</span><div class="metric-bar"><i class="${level}" style="width:${totals[level] ? counts[level] / totals[level] * 100 : 0}%"></i></div><strong>${counts[level]}</strong></div>`).join('')}</article>
    <article class="progress-card"><h3>练习概览</h3><div class="metric-row"><span>已解决</span><div></div><strong>${Object.keys(state.solved).length}</strong></div><div class="metric-row"><span>尝试过</span><div></div><strong>${Object.keys(state.attempted).length}</strong></div><div class="metric-row"><span>总提交</span><div></div><strong>${submissions.length}</strong></div><div class="metric-row"><span>连续天数</span><div></div><strong>${calculateStreak()}</strong></div></article>
    <article class="progress-card wide"><h3>近 26 周活动</h3><div class="activity-grid">${days.map((item) => `<i data-level="${Math.min(3, item.count)}" title="${item.date}: ${item.count} 题"></i>`).join('')}</div></article>`;
}

function renderSubmissions(container = $('#submissionList'), slug = '') {
  const rows = state.submissions.filter((item) => !slug || item.slug === slug);
  container.innerHTML = rows.length ? rows.slice(0, 150).map((item) => `<article class="submission-item"><strong class="submission-status ${item.passed ? 'passed' : ''}">${item.passed ? '已通过' : item.kind === 'run' ? '已运行' : '未通过'}</strong><div><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.slug)}</small></div><span>${languageName[item.language]}</span><span>${item.timeMs || 0} ms</span><small>${new Date(item.createdAt).toLocaleString()}</small></article>`).join('') : '<div class="empty-state"><strong>还没有提交记录</strong><span>打开一道题开始练习吧</span></div>';
}

function openProblem(slug, updateHash = true) {
  currentProblem = data.problems.find((problem) => problem.slug === slug);
  if (!currentProblem) return showToast('没有找到这道题');
  if (updateHash) location.hash = `#/problem/${currentProblem.slug}`;
  showView('workspace');
  currentCase = 0;
  $('#workspaceTitle').textContent = `${currentProblem.id ? `${currentProblem.id}. ` : ''}${currentProblem.title}`;
  $('#workspaceFavorite').textContent = state.favorites.includes(slug) ? '★' : '☆';
  $('#workspaceFavorite').classList.toggle('active', state.favorites.includes(slug));
  renderDescription();
  $('#notesEditor').value = state.notes[slug] || '';
  const language = state.drafts[slug]?.language || state.settings.defaultLanguage;
  $('#languageSelect').value = language;
  loadDraft(language);
  renderCases();
  renderSubmissions($('#problemSubmissions'), slug);
  renderReference();
  if (!$('#coachDrawer').classList.contains('hidden')) renderCoachChat();
  switchDescTab('description');
  switchConsoleTab('cases');
}

function renderDescription() {
  const p = currentProblem;
  const hasDetails = Boolean(p.summary);
  const companies = p.companies.slice().sort((a, b) => b.frequency - a.frequency).slice(0, 18);
  const supplemental = (p.supplementalSources || []).map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} · ${escapeHtml(source.snapshotDate)} ↗</a>`).join('');
  $('#descriptionContent').innerHTML = `<div class="problem-heading"><h1>${escapeHtml(`${p.id ? `${p.id}. ` : ''}${p.title}`)}</h1><a href="${escapeHtml(p.link)}" target="_blank" rel="noreferrer" title="查看来源页面">↗</a></div>
    <div class="description-meta"><span class="difficulty-badge ${p.difficulty}">${difficultyName[p.difficulty]}</span>${p.topics.map((topic) => `<span>${escapeHtml(topic)}</span>`).join('')}</div>
    ${supplemental ? `<div class="source-notice"><small>补充题单来源</small>${supplemental}</div>` : ''}
    <div class="problem-guidance"><small>学习建议</small><p>${escapeHtml(adviceForProblem(p))}</p></div>
    ${hasDetails ? `<p>${escapeHtml(p.summary)}</p><h3>输入格式</h3><p>${escapeHtml(p.input).replaceAll('\n', '<br>')}</p><h3>输出格式</h3><p>${escapeHtml(p.output)}</p><h3>示例</h3>${p.examples.map((example, i) => `<div class="example-box"><strong>示例 ${i + 1}</strong><pre>输入：${escapeHtml(example.input)}\n输出：${escapeHtml(example.output)}</pre></div> `).join('')}` : `<div class="external-notice"><strong>详细内容未包含在本地资料中</strong><p>当前页面已导入条目元数据。可在 <a href="${escapeHtml(p.link)}" target="_blank" rel="noreferrer">来源页面 ↗</a> 查看详细内容，然后在右侧使用自定义输入运行代码。</p></div>`}
    <section class="company-frequency"><h3>出现过的公司 · ${p.companies.length}</h3><div>${companies.map((item) => `<span>${escapeHtml(item.name)} · ${item.frequency.toFixed(1)}</span>`).join('')}</div></section>`;
}

function defaultTemplate(language) {
  if (currentProblem.templates?.[language]) return currentProblem.templates[language];
  if (language === 'python') return "import sys\n\ndef solve(data: str):\n    # TODO: 在这里写你的解法\n    return ''\n\nprint(solve(sys.stdin.read()))\n";
  if (language === 'cpp') return "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string input;\n    // TODO: 读取输入并写出你的解法\n    return 0;\n}\n";
  return "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\n\nfunction solve(input) {\n  // TODO: 在这里写你的解法\n  return '';\n}\n\nconsole.log(solve(input));\n";
}

function isSolutionVerified(problem) {
  if (!problem) return false;
  return hiddenCaseCounts[problem.slug]
    ? Boolean(state.verifiedSolved?.[problem.slug])
    : Boolean(state.solved[problem.slug]);
}

function renderReference() {
  if (!currentProblem) return;
  const unlocked = Boolean(isSolutionVerified(currentProblem) && Object.keys(currentProblem.solutions || {}).length);
  $('#referenceTab').classList.toggle('hidden', !unlocked);
  if (!unlocked) {
    $('#referenceContent').innerHTML = '';
    return;
  }
  const language = $('#languageSelect').value;
  const solution = currentProblem.solutions[language];
  $('#referenceContent').innerHTML = solution
    ? `<h3>${languageName[language]} 参考实现</h3><p>这是通过后解锁的一种写法。先比较思路和复杂度，不必逐行照抄。</p><pre>${escapeHtml(solution)}</pre>`
    : '<div class="empty-state"><strong>当前语言暂无参考实现</strong><span>可以切换语言查看</span></div>';
}

function loadDraft(language) {
  const saved = state.drafts[currentProblem.slug];
  $('#codeEditor').value = saved?.codes?.[language] ?? defaultTemplate(language);
  activeLanguage = language;
  updateLineNumbers();
  $('#codeEditor').style.fontSize = `${state.settings.fontSize}px`;
}

function saveDraft(language = activeLanguage || $('#languageSelect').value) {
  if (!currentProblem) return;
  const draft = state.drafts[currentProblem.slug] || { language, codes: {} };
  draft.language = $('#languageSelect').value;
  draft.codes ||= {};
  draft.codes[language] = $('#codeEditor').value;
  state.drafts[currentProblem.slug] = draft;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  $('#saveState').textContent = '已保存';
}

function allCases() {
  const custom = state.customCases[currentProblem.slug] || [];
  if (!currentProblem.examples?.length) return custom.length ? custom : [{ input: '', output: '' }];
  return [...currentProblem.examples, ...custom];
}

function renderCases() {
  const cases = allCases();
  currentCase = Math.min(currentCase, cases.length - 1);
  const baseLength = currentProblem.examples?.length || 0;
  const hiddenCount = hiddenCaseCounts[currentProblem.slug] || 0;
  $('#caseTabs').innerHTML = cases.map((_, index) => `<button class="${index === currentCase ? 'active' : ''} ${index >= baseLength ? 'custom' : ''}" data-case="${index}">用例 ${index + 1}</button>`).join('')
    + (hiddenCount ? `<span class="hidden-case-note">提交另测 ${hiddenCount} 个隐藏用例</span>` : '');
  $('#caseInput').value = cases[currentCase]?.input || '';
  $('#caseExpected').value = cases[currentCase]?.output || '';
}

function persistCaseFields() {
  if (!currentProblem) return;
  const baseLength = currentProblem.examples?.length || 0;
  if (currentCase < baseLength && currentProblem.examples?.length) return;
  state.customCases[currentProblem.slug] ||= currentProblem.examples?.length ? [] : [{ input: '', output: '' }];
  const customIndex = currentCase - (currentProblem.examples?.length || 0);
  state.customCases[currentProblem.slug][customIndex] = { input: $('#caseInput').value, output: $('#caseExpected').value };
  saveState();
}

async function executeCode(kind) {
  if (!currentProblem) return;
  saveDraft();
  persistCaseFields();
  const button = kind === 'submit' ? $('#submitBtn') : $('#runBtn');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = kind === 'submit' ? '判题中…' : '运行中…';
  switchConsoleTab('result');
  $('#resultHeadline').innerHTML = '<span class="result-title">正在执行代码…</span>';
  $('#resultOutput').textContent = '';
  $('#coachFeedback').classList.add('hidden');
  $('#solutionReveal').classList.add('hidden');
  try {
    const language = $('#languageSelect').value;
    const code = $('#codeEditor').value;
    let response;
    const judgeTests = allCases().filter((test) => String(test.output || '').trim());
    if (kind === 'submit') {
      if (!judgeTests.length) throw new Error('请至少填写一个测试用例的预期输出，再进行提交');
      response = await fetch('/api/judge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: currentProblem.slug, language, code, tests: judgeTests }) });
    } else {
      const test = allCases()[currentCase];
      response = await fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language, code, input: test.input }) });
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '执行失败');
    const passed = kind === 'submit' ? result.passed : result.exitCode === 0 && !result.timedOut;
    const execution = result.results?.at(-1) || result;
    lastExecutionByProblem.set(currentProblem.slug, { kind, passed, text: formatExecution(execution) });
    if (kind === 'submit') {
      $('#resultHeadline').innerHTML = `<span class="result-title ${passed ? 'success' : 'error'}">${passed ? '通过全部测试' : `未通过 · ${result.passedCount}/${result.total}`}</span>`;
      const coverage = result.hiddenCount ? `，其中 ${result.hiddenCount} 个为隐藏用例` : '；当前题目暂无服务端隐藏用例';
      $('#resultOutput').textContent = passed ? `恭喜！全部 ${result.total} 个测试用例均已通过${coverage}。` : formatExecution(execution);
    } else {
      $('#resultHeadline').innerHTML = `<span class="result-title ${passed ? 'success' : 'error'}">${passed ? '运行完成' : '运行失败'}</span>`;
      $('#resultOutput').textContent = formatExecution(execution);
    }
    $('#runtimeInfo').textContent = `${execution.timeMs || 0} ms`;
    $('#resultDot').className = passed ? 'success' : 'error';
    state.attempted[currentProblem.slug] = dateKey();
    if (kind === 'submit' && passed) {
      state.solved[currentProblem.slug] = dateKey();
      if (result.verified) state.verifiedSolved[currentProblem.slug] = dateKey();
    }
    state.submissions.unshift({ id: crypto.randomUUID(), slug: currentProblem.slug, title: currentProblem.title, language, kind, passed, verified: Boolean(result.verified), timeMs: execution.timeMs || 0, createdAt: new Date().toISOString(), code });
    state.submissions = state.submissions.slice(0, 300);
    saveState();
    await refreshGuide();
    const next = guide?.recommendations?.[0];
    const feedback = kind === 'submit'
      ? passed
        ? `这次通过已计入学习画像。${next ? `下一项建议是「${next.title}」，原因：${next.reason}` : '今天可以转入复盘。'}`
        : `先定位第一个失败用例：比较预期与实际输出，再检查边界条件。计划已经提高了相关主题和本题重试的优先级。`
      : '运行成功只说明程序能够执行；完成正式提交后，我会结合测试结果调整掌握度和下一项内容。';
    $('#coachFeedback').innerHTML = `<strong>基于本次结果的建议</strong>${escapeHtml(feedback)}`;
    $('#coachFeedback').classList.remove('hidden');
    if (kind === 'submit' && passed && isSolutionVerified(currentProblem) && currentProblem.solutions?.[language]) {
      $('#solutionReveal').innerHTML = `<header><strong>参考实现 · ${languageName[language]}</strong><span>通过后解锁</span></header><pre>${escapeHtml(currentProblem.solutions[language])}</pre>`;
      $('#solutionReveal').classList.remove('hidden');
      renderReference();
    }
    if (!$('#coachDrawer').classList.contains('hidden')) renderCoachChat();
    showToast(kind === 'submit' ? (passed ? '已通过，学习计划同步更新' : '未通过，已调整巩固优先级') : '运行完成');
  } catch (error) {
    $('#resultHeadline').innerHTML = '<span class="result-title error">执行服务出错</span>';
    $('#resultOutput').textContent = error.message;
    $('#resultDot').className = 'error';
    lastExecutionByProblem.set(currentProblem.slug, { kind, passed: false, text: error.message });
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

function formatExecution(result) {
  if (!result) return '没有运行结果';
  const parts = [];
  if (result.hidden) parts.push(result.passed ? '隐藏用例通过。' : '隐藏用例未通过。具体输入、预期输出和实际输出不公开；可打开“问教练”结合当前代码排查边界条件。');
  if (result.timedOut) parts.push('执行超时（5 秒）');
  if (!result.hidden && result.expected !== undefined) parts.push(`输入：\n${result.input}\n\n预期输出：\n${result.expected}\n\n实际输出：\n${result.actual || '(空)'}`);
  else if (!result.hidden) parts.push(`标准输出：\n${result.stdout || '(空)'}`);
  if (result.stderr) parts.push(`错误输出：\n${result.stderr}`);
  if (result.truncated) parts.push('输出过长，已截断。');
  return parts.join('\n\n');
}

function switchDescTab(name) {
  $$('[data-desc-tab]').forEach((button) => button.classList.toggle('active', button.dataset.descTab === name));
  $('#descriptionContent').classList.toggle('hidden', name !== 'description');
  $('#notesContent').classList.toggle('hidden', name !== 'solutions');
  $('#problemSubmissions').classList.toggle('hidden', name !== 'submissions');
  $('#referenceContent').classList.toggle('hidden', name !== 'reference');
}

function switchConsoleTab(name) {
  $$('[data-console-tab]').forEach((button) => button.classList.toggle('active', button.dataset.consoleTab === name));
  $('#casesPanel').classList.toggle('hidden', name !== 'cases');
  $('#resultPanel').classList.toggle('hidden', name !== 'result');
}

function toggleFavorite(slug) {
  const index = state.favorites.indexOf(slug);
  if (index >= 0) state.favorites.splice(index, 1);
  else state.favorites.push(slug);
  saveState();
  renderProblems();
  if (currentProblem?.slug === slug) {
    $('#workspaceFavorite').textContent = state.favorites.includes(slug) ? '★' : '☆';
    $('#workspaceFavorite').classList.toggle('active', state.favorites.includes(slug));
  }
}

function resetFilters() {
  filters = { query: '', difficulty: '', company: '', status: '', topic: '', favorite: false, sort: 'frequency', page: 1 };
  $('#searchInput').value = '';
  $('#companyFilter').value = '';
  $('#sortSelect').value = 'frequency';
  $$('.difficulty-filter button, .status-filter button, .topic-cloud button, #favoritesOnly').forEach((button) => button.classList.remove('active'));
  renderProblems();
}

function exportState() {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `workspace-backup-${dateKey()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function updateLineNumbers() {
  const count = $('#codeEditor').value.split('\n').length;
  $('#lineNumbers').textContent = Array.from({ length: count }, (_, index) => index + 1).join('\n');
}

function currentCoachHistory() {
  if (!currentProblem) return [];
  state.coachChats ||= {};
  state.coachChats[currentProblem.slug] ||= [];
  return state.coachChats[currentProblem.slug];
}

function renderCoachChat() {
  if (!currentProblem) return;
  const language = $('#languageSelect').value;
  const status = isSolutionVerified(currentProblem)
    ? '已验证，可讨论完整实现'
    : state.solved[currentProblem.slug] ? '已计入进度，需通过隐藏用例后解锁答案' : '练习中，只提供分层提示';
  $('#coachContext').innerHTML = `<strong>${escapeHtml(currentProblem.title)}</strong> · ${languageName[language]} · ${status}`;
  const history = currentCoachHistory();
  const greeting = history.length ? '' : `<div class="coach-message"><span class="mini-avatar">✦</span><div class="bubble">我已经看到了当前题目、代码和测试用例。你可以直接说卡在哪里；我会先给最小提示，不会一上来把答案贴出来。</div></div>`;
  const messages = history.map((item) => item.role === 'user'
    ? `<div class="coach-message user"><div class="bubble">${escapeHtml(item.content)}</div></div>`
    : `<div class="coach-message"><span class="mini-avatar">✦</span><div class="bubble">${escapeHtml(item.content)}</div></div>`).join('');
  const loading = coachPending ? '<div class="coach-message loading"><span class="mini-avatar">✦</span><div class="bubble">正在看你的代码 <i></i><i></i><i></i></div></div>' : '';
  $('#coachMessages').innerHTML = greeting + messages + loading;
  $('#sendCoach').disabled = coachPending;
  requestAnimationFrame(() => { $('#coachMessages').scrollTop = $('#coachMessages').scrollHeight; });
}

function openCoach() {
  if (!currentProblem) return showToast('请先打开一项内容');
  $('#coachDrawer').classList.remove('hidden');
  renderCoachChat();
  setTimeout(() => $('#coachInput').focus(), 100);
}

function closeCoach() {
  $('#coachDrawer').classList.add('hidden');
}

async function sendCoachMessage(prefilled = '') {
  if (!currentProblem || coachPending) return;
  const problem = currentProblem;
  const problemSlug = problem.slug;
  const message = (prefilled || $('#coachInput').value).trim();
  if (!message) return;
  const history = currentCoachHistory();
  const previous = history.slice(-10);
  history.push({ role: 'user', content: message, createdAt: new Date().toISOString() });
  state.coachChats[problemSlug] = history.slice(-30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  $('#coachInput').value = '';
  $('#coachInput').style.height = '';
  coachPending = true;
  renderCoachChat();
  const test = allCases()[currentCase] || {};
  const lastExecution = lastExecutionByProblem.get(problemSlug);
  try {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: previous,
        context: {
          title: problem.title,
          difficulty: problem.difficulty,
          topics: problem.topics,
          summary: problem.summary,
          inputFormat: problem.input,
          outputFormat: problem.output,
          language: $('#languageSelect').value,
          code: $('#codeEditor').value,
          testInput: test.input || '',
          expectedOutput: test.output || '',
          lastResult: lastExecution?.text || '',
          solved: isSolutionVerified(problem),
          learningAdvice: adviceForProblem(problem),
          weakTopics: guide?.weakTopics?.map((item) => item.topic) || []
        }
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '教练暂时无法回复');
    setCoachProvider(result.provider);
    state.coachChats[problemSlug].push({ role: 'assistant', content: result.answer, createdAt: new Date().toISOString() });
  } catch (error) {
    state.coachChats[problemSlug].push({ role: 'assistant', content: `暂时没能连接到教练：${error.message}`, createdAt: new Date().toISOString() });
  } finally {
    state.coachChats[problemSlug] = state.coachChats[problemSlug].slice(-30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    coachPending = false;
    if (currentProblem?.slug === problemSlug) renderCoachChat();
  }
}

function bindEvents() {
  window.addEventListener('hashchange', route);
  $$('.nav-item').forEach((button) => button.addEventListener('click', () => { location.hash = `#/${button.dataset.view}`; }));
  $('#dailyStart').addEventListener('click', () => dailyProblem && openProblem(dailyProblem.slug));
  $('#randomBtn').addEventListener('click', () => data.problems.length && openProblem(data.problems[Math.floor(Math.random() * data.problems.length)].slug));
  $('#themeBtn').addEventListener('click', () => { state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark'; applyTheme(); saveState(); });
  $('#settingsBtn').addEventListener('click', () => { $('#defaultLanguage').value = state.settings.defaultLanguage; $('#dailyGoal').value = state.settings.dailyGoal; $('#settingsDialog').showModal(); });
  $('#darkToggle').addEventListener('change', (event) => { state.settings.theme = event.target.checked ? 'dark' : 'light'; applyTheme(); saveState(); });
  $('#defaultLanguage').addEventListener('change', (event) => { state.settings.defaultLanguage = event.target.value; saveState(); });
  $('#dailyGoal').addEventListener('change', (event) => { state.settings.dailyGoal = Math.max(1, Number(event.target.value) || 1); saveState(); });
  $('#searchInput').addEventListener('input', (event) => { filters.query = event.target.value; filters.page = 1; renderProblems(); });
  $('#sortSelect').addEventListener('change', (event) => { filters.sort = event.target.value; renderProblems(); });
  $('#companyFilter').addEventListener('change', (event) => { filters.company = event.target.value; filters.page = 1; renderProblems(); });
  $$('.difficulty-filter button').forEach((button) => button.addEventListener('click', () => { filters.difficulty = filters.difficulty === button.dataset.difficulty ? '' : button.dataset.difficulty; $$('.difficulty-filter button').forEach((item) => item.classList.toggle('active', item.dataset.difficulty === filters.difficulty)); filters.page = 1; renderProblems(); }));
  $$('.status-filter button').forEach((button) => button.addEventListener('click', () => { filters.status = filters.status === button.dataset.status ? '' : button.dataset.status; $$('.status-filter button').forEach((item) => item.classList.toggle('active', item.dataset.status === filters.status)); filters.page = 1; renderProblems(); }));
  $('#topicCloud').addEventListener('click', (event) => { const button = event.target.closest('[data-topic]'); if (!button) return; filters.topic = filters.topic === button.dataset.topic ? '' : button.dataset.topic; $$('#topicCloud button').forEach((item) => item.classList.toggle('active', item.dataset.topic === filters.topic)); filters.page = 1; renderProblems(); });
  $('#favoritesOnly').addEventListener('click', () => { filters.favorite = !filters.favorite; $('#favoritesOnly').classList.toggle('active', filters.favorite); filters.page = 1; renderProblems(); });
  $('#resetFilters').addEventListener('click', resetFilters);
  $('#problemRows').addEventListener('click', (event) => { const favorite = event.target.closest('[data-favorite]'); if (favorite) { event.stopPropagation(); toggleFavorite(favorite.dataset.favorite); return; } const row = event.target.closest('[data-slug]'); if (row) openProblem(row.dataset.slug); });
  $('#prevPage').addEventListener('click', () => { filters.page -= 1; renderProblems(); window.scrollTo({ top: 440, behavior: 'smooth' }); });
  $('#nextPage').addEventListener('click', () => { filters.page += 1; renderProblems(); window.scrollTo({ top: 440, behavior: 'smooth' }); });
  document.addEventListener('keydown', (event) => { if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#searchInput').focus(); } if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && currentProblem) executeCode(event.shiftKey ? 'submit' : 'run'); });
  $('#companySearch').addEventListener('input', renderCompanies);
  $('#companyGrid').addEventListener('click', (event) => { const card = event.target.closest('[data-company]'); if (!card) return; filters.company = card.dataset.company; $('#companyFilter').value = filters.company; filters.page = 1; location.hash = '#/problems'; setTimeout(renderProblems); });
  $('#backToList').addEventListener('click', () => { location.hash = '#/problems'; renderProblems(); });
  $('#workspaceFavorite').addEventListener('click', () => currentProblem && toggleFavorite(currentProblem.slug));
  $('#workspaceGuide').addEventListener('click', openCoach);
  $('#runBtn').addEventListener('click', () => executeCode('run'));
  $('#submitBtn').addEventListener('click', () => executeCode('submit'));
  $('#resetCode').addEventListener('click', () => { if (confirm('确定恢复当前语言的初始代码吗？')) { $('#codeEditor').value = defaultTemplate($('#languageSelect').value); saveDraft(); updateLineNumbers(); } });
  $('#languageSelect').addEventListener('change', (event) => { saveDraft(activeLanguage); loadDraft(event.target.value); renderReference(); if (!$('#coachDrawer').classList.contains('hidden')) renderCoachChat(); });
  $('#codeEditor').addEventListener('input', () => { $('#saveState').textContent = '保存中…'; updateLineNumbers(); clearTimeout($('#codeEditor').saveTimer); $('#codeEditor').saveTimer = setTimeout(saveDraft, 450); });
  $('#codeEditor').addEventListener('scroll', () => { $('#lineNumbers').scrollTop = $('#codeEditor').scrollTop; });
  $('#codeEditor').addEventListener('keydown', (event) => { if (event.key === 'Tab') { event.preventDefault(); const editor = event.target; editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end'); editor.dispatchEvent(new Event('input')); } });
  $('#fontDown').addEventListener('click', () => { state.settings.fontSize = Math.max(10, state.settings.fontSize - 1); $('#codeEditor').style.fontSize = `${state.settings.fontSize}px`; saveState(); });
  $('#fontUp').addEventListener('click', () => { state.settings.fontSize = Math.min(22, state.settings.fontSize + 1); $('#codeEditor').style.fontSize = `${state.settings.fontSize}px`; saveState(); });
  $$('[data-desc-tab]').forEach((button) => button.addEventListener('click', () => switchDescTab(button.dataset.descTab)));
  $$('[data-console-tab]').forEach((button) => button.addEventListener('click', () => switchConsoleTab(button.dataset.consoleTab)));
  $('#notesEditor').addEventListener('input', () => { state.notes[currentProblem.slug] = $('#notesEditor').value; clearTimeout($('#notesEditor').saveTimer); $('#notesEditor').saveTimer = setTimeout(saveState, 400); });
  $('#caseTabs').addEventListener('click', (event) => { const button = event.target.closest('[data-case]'); if (!button) return; const index = Number(button.dataset.case); const baseLength = currentProblem.examples?.length || 1; if (button.classList.contains('custom') && event.offsetX > button.clientWidth - 18) { state.customCases[currentProblem.slug].splice(index - baseLength, 1); saveState(); currentCase = Math.max(0, index - 1); renderCases(); return; } persistCaseFields(); currentCase = index; renderCases(); });
  $('#caseInput').addEventListener('change', persistCaseFields); $('#caseExpected').addEventListener('change', persistCaseFields);
  $('#addCase').addEventListener('click', () => { state.customCases[currentProblem.slug] ||= []; state.customCases[currentProblem.slug].push({ input: '', output: '' }); currentCase = (currentProblem.examples?.length || 0) + state.customCases[currentProblem.slug].length - 1; saveState(); renderCases(); });
  $('#exportData').addEventListener('click', exportState);
  $('#startRecommendation').addEventListener('click', () => guide?.recommendations?.[0] && openProblem(guide.recommendations[0].slug));
  $('#refreshGuide').addEventListener('click', () => refreshGuide(true));
  $('#recommendationList').addEventListener('click', (event) => { const item = event.target.closest('[data-guide-slug]'); if (item) openProblem(item.dataset.guideSlug); });
  $('#reviewList').addEventListener('click', (event) => { const item = event.target.closest('[data-guide-slug]'); if (item) openProblem(item.dataset.guideSlug); });
  $('#clearSubmissions').addEventListener('click', () => { if (confirm('确定清空全部提交记录吗？')) { state.submissions = []; saveState(); renderSubmissions(); } });
  $('#importDataBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', async (event) => { try { const parsed = JSON.parse(await event.target.files[0].text()); if (!parsed.state) throw new Error('备份格式无效'); state = { ...structuredClone(defaultState), ...parsed.state, settings: { ...defaultState.settings, ...parsed.state.settings } }; if (parsed.state.judgeVersion !== JUDGE_VERSION) migrateJudgeState(state, parsed.state.judgeVersion); saveState(); applyTheme(); await refreshGuide(); showToast('进度导入成功'); } catch (error) { showToast(error.message); } });
  $('#closeCoach').addEventListener('click', closeCoach);
  $('#clearCoachChat').addEventListener('click', () => { if (!currentProblem || !confirm('清空当前题目的教练对话吗？')) return; state.coachChats[currentProblem.slug] = []; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); renderCoachChat(); });
  $('#sendCoach').addEventListener('click', () => sendCoachMessage());
  $('#coachQuickPrompts').addEventListener('click', (event) => { const button = event.target.closest('[data-coach-prompt]'); if (button) sendCoachMessage(button.dataset.coachPrompt); });
  $('#coachInput').addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendCoachMessage(); } });
  $('#coachInput').addEventListener('input', (event) => { event.target.style.height = ''; event.target.style.height = `${Math.min(120, event.target.scrollHeight)}px`; });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#coachDrawer').classList.contains('hidden')) closeCoach(); });
}

init();
