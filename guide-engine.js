function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dayDiff(from, to) {
  const a = new Date(`${from}T00:00:00Z`);
  const b = new Date(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

function calculateStreak(dates, today) {
  const set = new Set(dates);
  const cursor = new Date(`${today}T00:00:00Z`);
  if (!set.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function hasCompleteContent(problem) {
  return Boolean(problem.summary && problem.input && problem.output && problem.examples?.length
    && ['javascript', 'python', 'cpp'].every((language) => problem.templates?.[language]));
}

function compactProblem(problem, reason, mode, score) {
  return {
    slug: problem.slug,
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    topics: problem.topics.slice(0, 5),
    acceptance: problem.acceptance,
    companies: problem.companies.slice().sort((a, b) => b.frequency - a.frequency).slice(0, 3).map((item) => item.name),
    hasLocalTests: hasCompleteContent(problem),
    reason,
    mode,
    score: Math.round(score)
  };
}

function generateGuide(problemData, rawProfile = {}) {
  const problems = Array.isArray(problemData?.problems) ? problemData.problems : [];
  const today = /^\d{4}-\d{2}-\d{2}$/.test(rawProfile.today || '') ? rawProfile.today : new Date().toISOString().slice(0, 10);
  const solved = rawProfile.solved && typeof rawProfile.solved === 'object' ? rawProfile.solved : {};
  const attempted = rawProfile.attempted && typeof rawProfile.attempted === 'object' ? rawProfile.attempted : {};
  const submissions = Array.isArray(rawProfile.submissions) ? rawProfile.submissions.slice(0, 300) : [];
  const dailyGoal = clamp(Number(rawProfile.dailyGoal) || 1, 1, 20);
  const problemBySlug = new Map(problems.map((problem) => [problem.slug, problem]));
  const solvedSet = new Set(Object.keys(solved).filter((slug) => problemBySlug.has(slug)));
  const attemptedSet = new Set(Object.keys(attempted).filter((slug) => problemBySlug.has(slug)));
  const relevantSubmissions = submissions.filter((item) => problemBySlug.has(item.slug));
  const judged = relevantSubmissions.filter((item) => item.kind === 'submit');
  const passedSubmissions = judged.filter((item) => item.passed).length;
  const passRate = judged.length ? passedSubmissions / judged.length : 0;
  const todaySolved = Object.values(solved).filter((date) => date === today).length;
  const streak = calculateStreak(Object.values(solved), today);

  const perProblem = new Map();
  for (const submission of relevantSubmissions) {
    const stats = perProblem.get(submission.slug) || { runs: 0, submits: 0, failures: 0, passes: 0, lastAt: '' };
    stats.runs += 1;
    if (submission.kind === 'submit') {
      stats.submits += 1;
      if (submission.passed) stats.passes += 1;
      else stats.failures += 1;
    }
    if (!stats.lastAt || submission.createdAt > stats.lastAt) stats.lastAt = submission.createdAt;
    perProblem.set(submission.slug, stats);
  }

  const topicMap = new Map();
  for (const problem of problems) {
    const isSolved = solvedSet.has(problem.slug);
    const isAttempted = attemptedSet.has(problem.slug);
    if (!isSolved && !isAttempted) continue;
    const problemStats = perProblem.get(problem.slug) || { failures: 0, passes: 0 };
    for (const topic of problem.topics) {
      const stats = topicMap.get(topic) || { topic, exposed: 0, solved: 0, struggling: 0, failures: 0, passes: 0 };
      stats.exposed += 1;
      if (isSolved) stats.solved += 1;
      if (isAttempted && !isSolved) stats.struggling += 1;
      stats.failures += problemStats.failures;
      stats.passes += problemStats.passes;
      topicMap.set(topic, stats);
    }
  }

  const topics = [...topicMap.values()].map((stats) => {
    const mastery = Math.round((stats.solved * 2 + stats.passes) / Math.max(1, stats.exposed * 2 + stats.passes + stats.failures) * 100);
    const weakness = stats.struggling * 3 + stats.failures * 1.4 + stats.exposed * .15 - stats.solved * .35;
    return { ...stats, mastery, weakness: Math.round(weakness * 10) / 10 };
  });
  const weakTopics = topics.filter((item) => item.weakness > 0).sort((a, b) => b.weakness - a.weakness || a.mastery - b.mastery).slice(0, 6);
  const strongTopics = topics.filter((item) => item.solved > 0).sort((a, b) => b.mastery - a.mastery || b.solved - a.solved).slice(0, 4);

  let targetDifficulty = 'easy';
  if (solvedSet.size >= 15 && passRate >= .72) targetDifficulty = 'hard';
  else if (solvedSet.size >= 3 && (judged.length < 3 || passRate >= .42)) targetDifficulty = 'medium';
  if (judged.length >= 4 && passRate < .35) targetDifficulty = 'easy';
  const weakNames = new Set(weakTopics.slice(0, 3).map((item) => item.topic));
  const recentSlugs = new Set(relevantSubmissions.slice(0, 5).map((item) => item.slug));
  const candidates = [];
  const completeProblems = problems.filter(hasCompleteContent);
  const practiceProblems = completeProblems.length ? completeProblems : problems;

  for (const problem of practiceProblems) {
    if (solvedSet.has(problem.slug)) continue;
    const pStats = perProblem.get(problem.slug) || { failures: 0, passes: 0 };
    const frequency = Math.max(0, ...problem.companies.map((item) => item.frequency || 0));
    let score = frequency * .28 + Math.log2(problem.companies.length + 1) * 3;
    if (problem.difficulty === targetDifficulty) score += 28;
    else if (targetDifficulty === 'medium' && problem.difficulty === 'easy') score += 9;
    else if (targetDifficulty === 'hard' && problem.difficulty === 'medium') score += 12;
    else if (problem.difficulty === 'hard') score -= 18;
    if (problem.examples?.length) score += solvedSet.size < 4 ? 24 : 10;
    if (attemptedSet.has(problem.slug)) score += 62 + Math.min(24, pStats.failures * 8);
    const weakMatches = problem.topics.filter((topic) => weakNames.has(topic));
    score += weakMatches.length * 17;
    if (recentSlugs.has(problem.slug) && !attemptedSet.has(problem.slug)) score -= 8;
    if (!solvedSet.size && problem.difficulty === 'easy') score += 25;
    if (!solvedSet.size && ['Array', 'Hash Table', 'String'].some((topic) => problem.topics.includes(topic))) score += 8;

    let mode = 'core';
    let reason = `匹配当前的${targetDifficulty === 'easy' ? '基础' : targetDifficulty === 'medium' ? '进阶' : '挑战'}难度，且在资料库中出现频率较高。`;
    if (attemptedSet.has(problem.slug)) {
      mode = 'retry';
      reason = `你已经接触过这项内容但尚未完成，优先回看能形成更牢固的记忆。`;
    } else if (weakMatches.length) {
      mode = 'weakness';
      reason = `重点补强 ${weakMatches.slice(0, 2).join('、')}，这是当前画像中最值得投入的方向。`;
    } else if (problem.difficulty === 'easy') {
      mode = 'warmup';
      reason = '适合作为热身，先建立解题节奏，再进入核心训练。';
    } else if (problem.difficulty === 'hard') {
      mode = 'stretch';
      reason = '作为拉伸挑战，用来检验方法迁移和复杂问题拆解能力。';
    }
    candidates.push({ problem, score, reason, mode });
  }
  candidates.sort((a, b) => b.score - a.score || a.problem.title.localeCompare(b.problem.title));

  const selected = [];
  const selectedPrimaryTopics = new Set();
  for (const candidate of candidates) {
    const primary = candidate.problem.topics[0] || 'General';
    if (selected.length >= 5) break;
    if (selected.length >= 2 && selectedPrimaryTopics.has(primary) && candidates.length > 10) continue;
    selected.push(compactProblem(candidate.problem, candidate.reason, candidate.mode, candidate.score));
    selectedPrimaryTopics.add(primary);
  }
  for (const candidate of candidates) {
    if (selected.length >= 5) break;
    if (!selected.some((item) => item.slug === candidate.problem.slug)) selected.push(compactProblem(candidate.problem, candidate.reason, candidate.mode, candidate.score));
  }

  const overdueReviews = [...solvedSet].map((slug) => ({ problem: problemBySlug.get(slug), days: dayDiff(solved[slug], today) }))
    .filter((item) => item.days >= 7).sort((a, b) => b.days - a.days).slice(0, 3)
    .map((item) => compactProblem(item.problem, `距上次完成已有 ${item.days} 天，建议快速复盘思路和复杂度。`, 'review', 0));

  const last = relevantSubmissions[0];
  let message;
  if (!attemptedSet.size && !solvedSet.size) {
    message = '我还没有足够的练习记录。先从一项高频基础内容开始，我会在每次运行后重新判断你的节奏和薄弱点。';
  } else if (last && !last.passed && last.kind === 'submit') {
    const title = problemBySlug.get(last.slug)?.title || '刚才的内容';
    message = `我注意到你刚刚在「${title}」上遇到了阻力。先别急着换难题，建议复盘失败用例，再完成一项同类训练。`;
  } else if (weakTopics.length) {
    message = `目前最需要加强的是 ${weakTopics.slice(0, 2).map((item) => item.topic).join(' 和 ')}。今天的队列会优先围绕这些方向，同时保留一项不同类型的训练。`;
  } else if (passRate >= .75 && judged.length >= 4) {
    message = '你最近的提交质量很稳定，可以适当提高难度。我会减少重复热身，增加方法迁移和综合训练。';
  } else {
    message = '当前节奏正常。我会优先安排高频核心内容，并根据接下来的通过情况动态调整难度。';
  }

  const readiness = clamp(Math.round(35 + Math.min(30, solvedSet.size * 2) + passRate * 25 + Math.min(10, streak * 2) - Math.min(15, weakTopics.reduce((sum, item) => sum + item.struggling, 0) * 2)), 20, 96);
  return {
    generatedAt: new Date().toISOString(),
    message,
    profile: {
      solvedCount: solvedSet.size,
      attemptedCount: [...attemptedSet].filter((slug) => !solvedSet.has(slug)).length,
      submissionCount: judged.length,
      passRate: Math.round(passRate * 100),
      todaySolved,
      dailyGoal,
      streak,
      readiness,
      targetDifficulty
    },
    weakTopics,
    strongTopics,
    recommendations: selected,
    reviews: overdueReviews
  };
}

module.exports = { generateGuide, calculateStreak, hasCompleteContent };
