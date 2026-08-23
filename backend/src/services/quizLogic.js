const {
  FREE_COUNTS,
  PRO_COUNTS,
  TIMERS,
  FREE_DIFFICULTIES,
  PRO_DIFFICULTIES,
  resolveTopic,
  resolveSubtopic,
} = require("../data/quizCatalog");
const { isPro, normalizePlan } = require("./accessControl");
const { HttpError } = require("../utils/httpError");

const GRACE_MS = 15000;

function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeDifficulty(value) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  if (key === "easy" || key === "medium" || key === "hard" || key === "mixed") {
    return key;
  }
  return null;
}

function parseQuestionCount(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) {
    return null;
  }
  return n;
}

function parseTimerMinutes(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) {
    return null;
  }
  return n;
}

function recommendTimerMinutes(questionCount) {
  const raw = questionCount <= 5 ? 5 : questionCount <= 10 ? 10 : questionCount <= 15 ? 15 : questionCount <= 20 ? 20 : 30;
  return TIMERS.includes(raw) ? raw : 10;
}

function allowedCounts(plan) {
  return isPro(plan) ? PRO_COUNTS : FREE_COUNTS;
}

function allowedDifficulties(plan) {
  return isPro(plan) ? PRO_DIFFICULTIES : FREE_DIFFICULTIES;
}

function validateCreateInput(plan, body) {
  const currentPlan = normalizePlan(plan);
  const topic = resolveTopic(body?.topic);
  if (!topic) {
    throw new HttpError(400, "Choose a valid topic.");
  }
  const subtopic = resolveSubtopic(topic, body?.subtopic);
  if (!subtopic) {
    throw new HttpError(400, "Choose a valid subtopic.");
  }
  const difficulty = normalizeDifficulty(body?.difficulty);
  if (!difficulty) {
    throw new HttpError(400, "Choose Easy, Medium, Hard, or Mixed.");
  }
  if (!allowedDifficulties(currentPlan).includes(difficulty)) {
    throw new HttpError(
      403,
      "Medium and Hard quizzes are included with Pro.",
      "PRO_REQUIRED",
    );
  }
  const questionCount = parseQuestionCount(body?.questionCount);
  if (questionCount == null) {
    throw new HttpError(400, "Choose a valid number of questions.");
  }
  if (!allowedCounts(currentPlan).includes(questionCount)) {
    if (!isPro(currentPlan) && PRO_COUNTS.includes(questionCount)) {
      throw new HttpError(
        403,
        "Larger quizzes are included with Pro.",
        "PRO_REQUIRED",
      );
    }
    throw new HttpError(400, "That question count is not available.");
  }
  const timeLimit = parseTimerMinutes(body?.timeLimit);
  if (timeLimit == null || !TIMERS.includes(timeLimit)) {
    throw new HttpError(400, "Choose a valid timer.");
  }
  return {
    plan: currentPlan,
    topicId: topic.id,
    topicLabel: topic.label,
    subtopicId: subtopic.id,
    subtopicLabel: subtopic.label,
    difficulty,
    questionCount,
    timeLimitMinutes: timeLimit,
    recommendedTimeLimit: recommendTimerMinutes(questionCount),
  };
}

function questionPool(bank, topicId, subtopicId, difficulty) {
  let filtered = bank.filter((item) => {
    if (topicId && topicId !== "all" && item.topic !== topicId) {
      return false;
    }
    if (subtopicId && subtopicId !== "all" && item.subtopic !== subtopicId) {
      return false;
    }
    if (difficulty && difficulty !== "mixed" && item.difficulty !== difficulty) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    filtered = bank.filter((item) => {
      if (topicId && topicId !== "all" && item.topic !== topicId) {
        return false;
      }
      if (difficulty && difficulty !== "mixed" && item.difficulty !== difficulty) {
        return false;
      }
      return true;
    });
  }

  if (filtered.length === 0) {
    filtered = bank.filter((item) => {
      if (topicId && topicId !== "all" && item.topic !== topicId) {
        return false;
      }
      return true;
    });
  }

  if (filtered.length === 0) {
    filtered = [...bank];
  }

  return filtered;
}

function selectQuestions(bank, options, random = Math.random) {
  const pool = questionPool(
    bank,
    options.topicId,
    options.subtopicId,
    options.difficulty,
  );
  if (pool.length === 0) {
    throw new HttpError(
      400,
      "Not enough questions are available for this selection yet.",
      "INSUFFICIENT_QUESTIONS",
    );
  }
  const requested = options.questionCount;
  const available = pool.length;
  const take = Math.min(requested, available);
  const picked = shuffle(pool, random).slice(0, take);
  return {
    questions: picked,
    requested,
    available,
    reduced: take < requested,
  };
}

function publicQuestion(item) {
  if (item.type === "coding") {
    return {
      id: item.id,
      type: "coding",
      topic: item.topic,
      subtopic: item.subtopic,
      difficulty: item.difficulty,
      question: item.question,
      title: item.title ?? item.question,
      problemStatement: item.problemStatement ?? item.question,
      starterCode: item.starterCode ?? "# Write your solution here\n",
      sampleCases: item.sampleCases ?? [],
      language: item.language ?? "python",
    };
  }
  return {
    id: item.id,
    type: "mcq",
    topic: item.topic,
    subtopic: item.subtopic,
    difficulty: item.difficulty,
    question: item.question,
    options: item.options,
  };
}

function assertNoAnswerLeak(payload) {
  const text = JSON.stringify(payload);
  if (
    text.includes("correctAnswer") ||
    text.includes("\"hiddenTests\"") ||
    text.includes("\"explanation\"")
  ) {
    throw new Error("Quiz payload leaked answer fields.");
  }
}

function normalizeAnswers(raw, questionIds) {
  const allowed = new Set(questionIds);
  const answers = {};
  if (raw == null) {
    return answers;
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new HttpError(400, "Answers must be an object of question id to answer.");
  }
  for (const [questionId, value] of Object.entries(raw)) {
    if (!allowed.has(questionId)) {
      continue;
    }
    if (typeof value === "number") {
      const index = Number(value);
      if (Number.isInteger(index) && index >= 0 && index <= 3) {
        answers[questionId] = index;
      }
    } else if (typeof value === "string") {
      answers[questionId] = { code: value, language: "python" };
    } else if (value && typeof value === "object") {
      if (typeof value.code === "string") {
        answers[questionId] = {
          code: value.code,
          language: typeof value.language === "string" ? value.language : "python",
        };
      } else if (Number.isInteger(value.optionIndex)) {
        answers[questionId] = value.optionIndex;
      }
    }
  }
  return answers;
}

const { outputsMatch } = require("../utils/output");

async function scoreQuizAsync(questions, answers, executor) {
  let correct = 0;
  const review = [];

  for (const item of questions) {
    if (item.type === "coding") {
      const ansObj =
        Object.prototype.hasOwnProperty.call(answers, item.id) && answers[item.id]
          ? typeof answers[item.id] === "string"
            ? { code: answers[item.id], language: item.language ?? "python" }
            : answers[item.id]
          : null;

      const code = ansObj?.code ?? null;
      const lang = ansObj?.language ?? item.language ?? "python";
      const hiddenTests = item.hiddenTests ?? [];
      let passedTests = 0;

      if (code && code.trim().length > 0 && hiddenTests.length > 0) {
        for (const test of hiddenTests) {
          if (typeof executor === "function") {
            try {
              const res = await executor({ language: lang, sourceCode: code, stdin: test.input });
              if (res.status === "accepted" && outputsMatch(res.stdout, test.expectedOutput)) {
                passedTests += 1;
              }
            } catch {
              // Test execution failed
            }
          } else {
            // Fallback basic evaluation
            if (code.includes(test.expectedOutput.trim())) {
              passedTests += 1;
            }
          }
        }
      }

      const isCorrect = hiddenTests.length > 0 && passedTests === hiddenTests.length;
      if (isCorrect) {
        correct += 1;
      }

      review.push({
        id: item.id,
        type: "coding",
        topic: item.topic,
        subtopic: item.subtopic,
        difficulty: item.difficulty,
        question: item.question,
        title: item.title ?? item.question,
        yourCode: code,
        passedTests,
        totalTests: hiddenTests.length,
        isCorrect,
      });
    } else {
      const selected =
        Object.prototype.hasOwnProperty.call(answers, item.id) &&
        Number.isInteger(answers[item.id])
          ? answers[item.id]
          : null;
      const isCorrect = selected === item.correctAnswer;
      if (isCorrect) {
        correct += 1;
      }
      review.push({
        id: item.id,
        type: "mcq",
        topic: item.topic,
        subtopic: item.subtopic,
        difficulty: item.difficulty,
        question: item.question,
        options: item.options,
        yourAnswer: selected,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        isCorrect,
      });
    }
  }

  const total = questions.length;
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 10000) / 100;
  return {
    score: correct,
    total,
    wrong: total - correct,
    percentage,
    review,
  };
}

function scoreQuiz(questions, answers) {
  // Sync fallback helper
  let correct = 0;
  const review = questions.map((item) => {
    if (item.type === "coding") {
      const ansObj =
        Object.prototype.hasOwnProperty.call(answers, item.id) && answers[item.id]
          ? typeof answers[item.id] === "string"
            ? { code: answers[item.id], language: item.language ?? "python" }
            : answers[item.id]
          : null;
      const code = ansObj?.code ?? "";
      const isCorrect = code.trim().length > 0;
      if (isCorrect) correct += 1;
      return {
        id: item.id,
        type: "coding",
        topic: item.topic,
        subtopic: item.subtopic,
        difficulty: item.difficulty,
        question: item.question,
        yourCode: code,
        isCorrect,
      };
    }
    const selected =
      Object.prototype.hasOwnProperty.call(answers, item.id) &&
      Number.isInteger(answers[item.id])
        ? answers[item.id]
        : null;
    const isCorrect = selected === item.correctAnswer;
    if (isCorrect) {
      correct += 1;
    }
    return {
      id: item.id,
      type: "mcq",
      topic: item.topic,
      subtopic: item.subtopic,
      difficulty: item.difficulty,
      question: item.question,
      options: item.options,
      yourAnswer: selected,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      isCorrect,
    };
  });
  const total = questions.length;
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 10000) / 100;
  return {
    score: correct,
    total,
    wrong: total - correct,
    percentage,
    review,
  };
}

function feedbackForPercentage(percentage) {
  if (percentage >= 90) {
    return "Excellent";
  }
  if (percentage >= 75) {
    return "Great work";
  }
  if (percentage >= 50) {
    return "Keep practicing";
  }
  return "Review the fundamentals";
}

function isPastExpiry(expiresAt, now = Date.now(), graceMs = GRACE_MS) {
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires)) {
    return true;
  }
  return now > expires + graceMs;
}

function remainingSeconds(expiresAt, now = Date.now()) {
  const expires = new Date(expiresAt).getTime();
  return Math.max(0, Math.ceil((expires - now) / 1000));
}

function assertCanCreate({ plan, existingCount, activeSession }) {
  if (activeSession) {
    throw new HttpError(
      409,
      "You already have a quiz in progress.",
      "QUIZ_IN_PROGRESS",
    );
  }
  if (isPro(plan)) {
    return;
  }
  if (existingCount >= 1) {
    throw new HttpError(
      403,
      "Your free quiz has been used. Upgrade to Pro for unlimited quizzes.",
      "QUIZ_LIMIT",
    );
  }
}

function canViewHistory(plan) {
  return isPro(plan);
}

function canViewAnalytics(plan) {
  return isPro(plan);
}

function computeAnalytics(sessions) {
  const finished = sessions.filter(
    (row) =>
      (row.status === "completed" || row.status === "expired") &&
      typeof row.percentage === "number",
  );
  if (finished.length === 0) {
    return {
      quizzesCompleted: 0,
      averageScore: 0,
      bestScore: 0,
      strongestTopic: null,
      weakestTopic: null,
      topicPerformance: [],
    };
  }
  const averageScore =
    Math.round(
      (finished.reduce((sum, row) => sum + Number(row.percentage), 0) /
        finished.length) *
        100,
    ) / 100;
  const bestScore = Math.max(...finished.map((row) => Number(row.percentage)));
  const byTopic = new Map();
  for (const row of finished) {
    const key = row.topic;
    const current = byTopic.get(key) ?? { topic: key, total: 0, count: 0 };
    current.total += Number(row.percentage);
    current.count += 1;
    byTopic.set(key, current);
  }
  const topicPerformance = [...byTopic.values()]
    .map((item) => ({
      topic: item.topic,
      average: Math.round((item.total / item.count) * 100) / 100,
      count: item.count,
    }))
    .sort((a, b) => b.average - a.average);
  return {
    quizzesCompleted: finished.length,
    averageScore,
    bestScore,
    strongestTopic: topicPerformance[0] ?? null,
    weakestTopic: topicPerformance[topicPerformance.length - 1] ?? null,
    topicPerformance,
  };
}

module.exports = {
  GRACE_MS,
  shuffle,
  recommendTimerMinutes,
  allowedCounts,
  allowedDifficulties,
  validateCreateInput,
  questionPool,
  selectQuestions,
  publicQuestion,
  assertNoAnswerLeak,
  normalizeAnswers,
  scoreQuiz,
  scoreQuizAsync,
  feedbackForPercentage,
  isPastExpiry,
  remainingSeconds,
  assertCanCreate,
  canViewHistory,
  canViewAnalytics,
  computeAnalytics,
};
