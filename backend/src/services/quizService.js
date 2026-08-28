const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { serviceSupabase } = require("../config/supabase");
const { HttpError } = require("../utils/httpError");
const { isPro, normalizePlan } = require("./accessControl");
const { QUIZ_QUESTIONS, getQuestionsByIds } = require("../data/quizQuestions");
const { publicCatalog } = require("../data/quizCatalog");
const { execute, isConfigured: isJudge0Configured } = require("./judge0Service");
const {
  allowedCounts,
  allowedDifficulties,
  validateCreateInput,
  selectQuestions,
  publicQuestion,
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
  recommendTimerMinutes,
} = require("./quizLogic");

const TOPIC_LABELS = {
  pf: "Programming Fundamentals",
  oop: "Object-Oriented Programming",
  dsa: "Data Structures & Algorithms",
  all: "All Topics",
};

const LOCAL_STORE_FILE = path.join(__dirname, "../../.data/quiz-sessions.json");

function isMissingTableError(error) {
  const code = String(error?.code ?? "");
  const message = String(error?.message ?? "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    message.includes("public.quiz_sessions") ||
    message.includes("could not find the table")
  );
}

function createMemoryStore(seed = [], onChange) {
  const rows = seed.map((row) => ({
    ...row,
    answers: { ...(row.answers ?? {}) },
    draft_answers: { ...(row.draft_answers ?? {}) },
  }));
  function notify() {
    if (typeof onChange === "function") {
      onChange(rows);
    }
  }
  return {
    async insert(row) {
      rows.push(row);
      notify();
      return row;
    },
    async findById(id) {
      return rows.find((item) => item.id === id) ?? null;
    },
    async listByUser(userId) {
      return rows
        .filter((item) => item.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    async update(id, patch) {
      const index = rows.findIndex((item) => item.id === id);
      if (index < 0) {
        return null;
      }
      rows[index] = { ...rows[index], ...patch };
      notify();
      return rows[index];
    },
  };
}

function readLocalRows() {
  try {
    const parsed = JSON.parse(fs.readFileSync(LOCAL_STORE_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createFileStore() {
  return createMemoryStore(readLocalRows(), (rows) => {
    fs.mkdirSync(path.dirname(LOCAL_STORE_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(rows));
  });
}

function createAdaptiveStore() {
  let resolved = null;
  let pending = null;

  async function ready() {
    if (resolved) {
      return resolved;
    }
    if (pending) {
      return pending;
    }
    pending = (async () => {
      if (!serviceSupabase) {
        resolved = createFileStore();
        return resolved;
      }
      const { error } = await serviceSupabase.from("quiz_sessions").select("id").limit(1);
      if (!error) {
        resolved = supabaseStore();
        return resolved;
      }
      if (isMissingTableError(error)) {
        console.warn(
          "quiz_sessions table is missing. Using a local quiz store until supabase/migrations/20260820_quiz_sessions.sql is applied.",
        );
        resolved = createFileStore();
        return resolved;
      }
      throw new HttpError(503, "Could not load quizzes.");
    })();
    try {
      return await pending;
    } finally {
      pending = null;
    }
  }

  return {
    async insert(row) {
      return (await ready()).insert(row);
    },
    async findById(id) {
      return (await ready()).findById(id);
    },
    async listByUser(userId) {
      return (await ready()).listByUser(userId);
    },
    async update(id, patch) {
      return (await ready()).update(id, patch);
    },
  };
}

const defaultQuizStore = createAdaptiveStore();

function supabaseStore() {
  const db = serviceSupabase;
  if (!db) {
    throw new HttpError(503, "Quiz service is temporarily unavailable.");
  }
  return {
    async insert(row) {
      const { data, error } = await db.from("quiz_sessions").insert(row).select("*").single();
      if (error || !data) {
        throw new HttpError(503, "Could not create the quiz.");
      }
      return data;
    },
    async findById(id) {
      const { data, error } = await db.from("quiz_sessions").select("*").eq("id", id).maybeSingle();
      if (error) {
        throw new HttpError(503, "Could not load the quiz.");
      }
      return data;
    },
    async listByUser(userId) {
      const { data, error } = await db
        .from("quiz_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        throw new HttpError(503, "Could not load quizzes.");
      }
      return data ?? [];
    },
    async update(id, patch) {
      const { data, error } = await db.from("quiz_sessions").update(patch).eq("id", id).select("*").single();
      if (error || !data) {
        throw new HttpError(503, "Could not update the quiz.");
      }
      return data;
    },
  };
}

function topicLabel(id) {
  return TOPIC_LABELS[id] ?? id;
}

function parseAnswers(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

function loadSessionQuestions(row) {
  const questions = getQuestionsByIds(row.question_ids ?? []);
  if (questions.length !== (row.question_ids ?? []).length) {
    throw new HttpError(500, "Quiz data is incomplete.");
  }
  return questions;
}

async function finalizeIfExpired(store, row, now) {
  if (row.status !== "in_progress") {
    return row;
  }
  if (!isPastExpiry(row.expires_at, now)) {
    return row;
  }
  const questions = loadSessionQuestions(row);
  const answers = parseAnswers(row.draft_answers);
  const result = await scoreQuizAsync(
    questions,
    answers,
    isJudge0Configured() ? execute : null,
  );
  return store.update(row.id, {
    status: "expired",
    submitted_at: new Date(now).toISOString(),
    answers,
    score: result.score,
    percentage: result.percentage,
    grading_status: result.gradingStatus,
    result_review: result.review,
  });
}

function assertOwner(row, userId) {
  if (!row || row.user_id !== userId) {
    throw new HttpError(404, "Quiz not found.", "QUIZ_NOT_FOUND");
  }
}

function publicInProgress(row, questions, now) {
  return {
    success: true,
    quizId: row.id,
    topic: row.topic,
    topicLabel: topicLabel(row.topic),
    subtopic: row.subtopic,
    difficulty: row.difficulty,
    questionCount: row.question_count,
    timeLimit: row.time_limit_seconds,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    remainingSeconds: remainingSeconds(row.expires_at, now),
    status: row.status,
    draftAnswers: parseAnswers(row.draft_answers),
    questions: questions.map(publicQuestion),
  };
}

function publicResult(row, questions) {
  const fallback = scoreQuiz(questions, parseAnswers(row.answers));
  const graded = row.grading_status === "graded";
  const review = Array.isArray(row.result_review) ? row.result_review : fallback.review;
  const total = questions.length;
  const score = graded && Number.isFinite(Number(row.score)) ? Number(row.score) : null;
  const percentage = graded && row.percentage != null ? Number(row.percentage) : null;
  const started = new Date(row.started_at).getTime();
  const ended = new Date(row.submitted_at ?? row.expires_at).getTime();
  const usedSeconds = Math.max(0, Math.round((ended - started) / 1000));
  return {
    success: true,
    quizId: row.id,
    topic: row.topic,
    topicLabel: topicLabel(row.topic),
    subtopic: row.subtopic,
    difficulty: row.difficulty,
    questionCount: row.question_count,
    timeLimit: row.time_limit_seconds,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    expiresAt: row.expires_at,
    status: row.status,
    score,
    total,
    wrong: score == null ? null : total - score,
    percentage,
    gradingStatus: graded ? "graded" : "ungraded",
    timeUsedSeconds: usedSeconds,
    feedback: graded ? feedbackForPercentage(percentage) : "Submission could not be graded because code execution was unavailable.",
    review,
  };
}

function historyItem(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    submittedAt: row.submitted_at,
    topic: row.topic,
    topicLabel: topicLabel(row.topic),
    subtopic: row.subtopic,
    difficulty: row.difficulty,
    questionCount: row.question_count,
    status: row.status,
    score: row.score,
    percentage: row.percentage == null ? null : Number(row.percentage),
  };
}

function createQuizService(storeFactory = defaultQuizStore) {
  function store() {
    return typeof storeFactory === "function" ? storeFactory() : storeFactory;
  }

  async function getOverview(userId, plan, now = Date.now()) {
    const currentPlan = normalizePlan(plan);
    const db = store();
    const list = await db.listByUser(userId);
    const normalized = [];
    for (const row of list) {
      normalized.push(await finalizeIfExpired(db, row, now));
    }
    const active = normalized.find((row) => row.status === "in_progress") ?? null;
    const finished = normalized.filter((row) => row.status !== "in_progress");
    const used = normalized.length;
    const pro = isPro(currentPlan);
    const freeQuizUsed = !pro && used >= 1 && !active;
    const canCreate = pro ? true : used === 0;
    return {
      success: true,
      plan: currentPlan,
      quizzesUsed: used,
      quizCount: used,
      quizUsed: freeQuizUsed || (!pro && used >= 1),
      quizLimit: pro ? null : 1,
      canCreate,
      canCreateQuiz: canCreate,
      freeQuizUsed,
      allowedCounts: allowedCounts(currentPlan),
      allowedDifficulties: allowedDifficulties(currentPlan),
      allowedTimers: [5, 10, 15, 20, 30],
      recommendTimerMinutes,
      catalog: publicCatalog(),
      activeQuiz: active
        ? {
            id: active.id,
            topic: active.topic,
            topicLabel: topicLabel(active.topic),
            difficulty: active.difficulty,
            questionCount: active.question_count,
            expiresAt: active.expires_at,
            remainingSeconds: remainingSeconds(active.expires_at, now),
          }
        : null,
      latestCompletedId: finished[0]?.id ?? null,
    };
  }

  async function createQuiz(userId, plan, body, now = Date.now()) {
    const currentPlan = normalizePlan(plan);
    const input = validateCreateInput(currentPlan, body);
    const db = store();
    const list = await db.listByUser(userId);
    const live = [];
    for (const row of list) {
      live.push(await finalizeIfExpired(db, row, now));
    }
    const active = live.find((row) => row.status === "in_progress") ?? null;
    assertCanCreate({
      plan: currentPlan,
      existingCount: live.length,
      activeSession: active,
    });
    const picked = selectQuestions(QUIZ_QUESTIONS, input);
    const startedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + input.timeLimitMinutes * 60 * 1000).toISOString();
    const row = await db.insert({
      id: crypto.randomUUID(),
      user_id: userId,
      topic: input.topicId,
      subtopic: input.subtopicId,
      difficulty: input.difficulty,
      question_ids: picked.questions.map((item) => item.id),
      question_count: picked.questions.length,
      time_limit_seconds: input.timeLimitMinutes * 60,
      started_at: startedAt,
      expires_at: expiresAt,
      submitted_at: null,
      status: "in_progress",
      score: null,
      percentage: null,
      answers: {},
      draft_answers: {},
      created_at: startedAt,
    });
    return {
      ...publicInProgress(row, picked.questions, now),
      requestedCount: input.questionCount,
      reduced: picked.reduced,
      available: picked.available,
      recommendedTimeLimit: input.recommendedTimeLimit,
    };
  }

  async function getQuiz(userId, quizId, now = Date.now()) {
    const db = store();
    let row = await db.findById(quizId);
    assertOwner(row, userId);
    row = await finalizeIfExpired(db, row, now);
    const questions = loadSessionQuestions(row);
    if (row.status === "in_progress") {
      return publicInProgress(row, questions, now);
    }
    return publicResult(row, questions);
  }

  async function hasActiveQuiz(userId, now = Date.now()) {
    const db = store();
    for (const row of await db.listByUser(userId)) {
      const current = await finalizeIfExpired(db, row, now);
      if (current.status === "in_progress") return true;
    }
    return false;
  }

  async function saveProgress(userId, quizId, rawAnswers, now = Date.now()) {
    const db = store();
    let row = await db.findById(quizId);
    assertOwner(row, userId);
    row = await finalizeIfExpired(db, row, now);
    if (row.status !== "in_progress") {
      throw new HttpError(409, "This quiz is no longer in progress.", "QUIZ_SUBMITTED");
    }
    const answers = normalizeAnswers(rawAnswers, row.question_ids);
    const merged = { ...parseAnswers(row.draft_answers), ...answers };
    await db.update(row.id, { draft_answers: merged });
    return { success: true };
  }

  async function recordIntegrityEvents(userId, quizId, events, now = Date.now()) {
    const db = store();
    let row = await db.findById(quizId);
    assertOwner(row, userId);
    if (row.status !== "in_progress") {
      return { success: true };
    }
    const currentEvents = Array.isArray(row.integrity_events) ? row.integrity_events : [];
    const incoming = Array.isArray(events) ? events : [events];
    const sanitized = incoming.map((ev) => ({
      type: String(ev.type || "unknown"),
      count: Number(ev.count || 1),
      timestamp: ev.timestamp ? new Date(ev.timestamp).toISOString() : new Date(now).toISOString(),
    }));
    const updated = [...currentEvents, ...sanitized];
    await db.update(row.id, { integrity_events: updated });
    return { success: true, recorded: sanitized.length };
  }

  async function runQuizCode(userId, quizId, questionId, sourceCode, language, stdin = "", now = Date.now()) {
    const db = store();
    let row = await db.findById(quizId);
    assertOwner(row, userId);
    row = await finalizeIfExpired(db, row, now);
    if (row.status !== "in_progress") {
      throw new HttpError(409, "This quiz is no longer in progress.", "QUIZ_EXPIRED");
    }
    if (!row.question_ids.includes(questionId)) {
      throw new HttpError(400, "Question does not belong to this quiz attempt.");
    }
    if (!isJudge0Configured()) {
      throw new HttpError(503, "Code execution service is temporarily unavailable.");
    }

    const lang = typeof language === "string" ? language : "python";
    const code = typeof sourceCode === "string" ? sourceCode : "";
    if (!code.trim()) {
      throw new HttpError(400, "Source code cannot be empty.");
    }

    const result = await execute({ language: lang, sourceCode: code, stdin });
    return {
      success: true,
      status: result.status,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      compileOutput: result.compileOutput ?? "",
      time: result.time,
      memory: result.memory,
    };
  }

  async function submitQuiz(userId, quizId, rawAnswers, now = Date.now()) {
    const db = store();
    let row = await db.findById(quizId);
    assertOwner(row, userId);
    if (row.status !== "in_progress") {
      const questions = loadSessionQuestions(row);
      return publicResult(row, questions);
    }
    const expired = isPastExpiry(row.expires_at, now);
    const questions = loadSessionQuestions(row);
    const incoming = normalizeAnswers(rawAnswers, row.question_ids);
    const answers = { ...parseAnswers(row.draft_answers), ...incoming };
    const result = await scoreQuizAsync(questions, answers, isJudge0Configured() ? execute : null);
    row = await db.update(row.id, {
      status: expired ? "expired" : "completed",
      submitted_at: new Date(now).toISOString(),
      answers,
      draft_answers: answers,
      score: result.score,
      percentage: result.percentage,
      grading_status: result.gradingStatus,
      result_review: result.review,
    });
    return publicResult(row, questions);
  }

  async function getHistory(userId, plan, now = Date.now()) {
    const currentPlan = normalizePlan(plan);
    const db = store();
    const list = [];
    for (const row of await db.listByUser(userId)) {
      list.push(await finalizeIfExpired(db, row, now));
    }
    const finished = list.filter((row) => row.status !== "in_progress");
    if (!canViewHistory(currentPlan)) {
      return {
        success: true,
        plan: currentPlan,
        items: finished.slice(0, 1).map(historyItem),
        limited: true,
      };
    }
    return {
      success: true,
      plan: currentPlan,
      items: finished.map(historyItem),
      limited: false,
    };
  }

  async function getAnalytics(userId, plan, now = Date.now()) {
    const currentPlan = normalizePlan(plan);
    if (!canViewAnalytics(currentPlan)) {
      throw new HttpError(
        403,
        "Performance analytics are included with Pro.",
        "PRO_REQUIRED",
      );
    }
    const db = store();
    const list = [];
    for (const row of await db.listByUser(userId)) {
      list.push(await finalizeIfExpired(db, row, now));
    }
    const mapped = list.map((row) => ({
      status: row.status,
      percentage: row.percentage == null ? null : Number(row.percentage),
      topic: row.topic,
    }));
    return {
      success: true,
      plan: currentPlan,
      ...computeAnalytics(mapped),
      topicLabels: TOPIC_LABELS,
    };
  }

  return {
    getOverview,
    createQuiz,
    getQuiz,
    hasActiveQuiz,
    saveProgress,
    runQuizCode,
    recordIntegrityEvents,
    submitQuiz,
    getHistory,
    getAnalytics,
  };
}

module.exports = {
  createQuizService,
  createMemoryStore,
  createFileStore,
  createAdaptiveStore,
  supabaseStore,
};
