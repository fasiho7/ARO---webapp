const assert = require("node:assert/strict");
const { QUIZ_QUESTIONS } = require("../data/quizQuestions");
const {
  validateCreateInput,
  selectQuestions,
  publicQuestion,
  scoreQuiz,
  normalizeAnswers,
  assertCanCreate,
  isPastExpiry,
  computeAnalytics,
  feedbackForPercentage,
  recommendTimerMinutes,
} = require("../services/quizLogic");
const { createMemoryStore, createQuizService } = require("../services/quizService");

function unique(items) {
  return new Set(items).size === items.length;
}

async function run() {
  assert.equal(unique(QUIZ_QUESTIONS.map((item) => item.id)), true, "question ids");
  assert.ok(QUIZ_QUESTIONS.length >= 10, "question bank size");
  for (const item of QUIZ_QUESTIONS) {
    if (item.type !== "coding") {
      assert.equal(item.options.length, 4);
      assert.ok(item.correctAnswer >= 0 && item.correctAnswer <= 3);
      assert.ok(item.explanation.length > 8);
    } else {
      assert.ok(item.starterCode.length > 0);
      assert.ok(item.hiddenTests.length > 0);
    }
  }

  const ids = new Set();
  const sanitized = QUIZ_QUESTIONS.slice(0, 3).map(publicQuestion);
  const encoded = JSON.stringify(sanitized);
  assert.equal(encoded.includes("correctAnswer"), false);
  assert.equal(encoded.includes("explanation"), false);

  const freeEasy = validateCreateInput("free", {
    topic: "PF",
    difficulty: "easy",
    questionCount: 5,
    timeLimit: 5,
  });
  assert.equal(freeEasy.topicId, "pf");
  assert.equal(recommendTimerMinutes(5), 5);
  assert.equal(recommendTimerMinutes(10), 10);
  assert.equal(recommendTimerMinutes(20), 20);

  assert.throws(
    () =>
      validateCreateInput("free", {
        topic: "PF",
        difficulty: "hard",
        questionCount: 5,
        timeLimit: 5,
      }),
    /Pro/,
  );
  assert.throws(
    () =>
      validateCreateInput("free", {
        topic: "DSA",
        difficulty: "mixed",
        questionCount: 20,
        timeLimit: 20,
      }),
    /Pro/,
  );

  const picked = selectQuestions(QUIZ_QUESTIONS, {
    topicId: "dsa",
    subtopicId: "stacks",
    difficulty: "easy",
    questionCount: 10,
  });
  assert.equal(picked.reduced, true);
  assert.ok(picked.questions.length <= picked.available);

  const sample = QUIZ_QUESTIONS[0];
  const scored = scoreQuiz(
    [sample],
    { [sample.id]: { code: "print('hello')" }, ignored: 99 },
  );
  assert.equal(scored.score, 1);
  assert.equal(scored.percentage, 100);
  const wrong = scoreQuiz([sample], { [sample.id]: "" });
  assert.equal(wrong.score, 0);
  assert.equal(feedbackForPercentage(92), "Excellent");
  assert.equal(feedbackForPercentage(80), "Great work");
  assert.equal(feedbackForPercentage(60), "Keep practicing");
  assert.equal(feedbackForPercentage(40), "Review the fundamentals");

  assert.throws(() => normalizeAnswers("nope", ["a"]), /object/);
  const cleaned = normalizeAnswers({ a: 1, extra: 0 }, ["a"]);
  assert.deepEqual(cleaned, { a: 1 });

  assert.equal(isPastExpiry(new Date(0).toISOString(), 20_000, 15_000), true);
  assert.equal(isPastExpiry(Date.now() + 60_000, Date.now(), 15_000), false);

  const freeUser = "user-free";
  const other = "user-other";
  const store = createMemoryStore();
  const quiz = createQuizService(store);

  const first = await quiz.createQuiz(freeUser, "free", {
    topic: "PF",
    difficulty: "easy",
    questionCount: 5,
    timeLimit: 5,
    plan: "pro",
  });
  assert.equal(first.success, true);
  assert.equal(first.questions.length, 5);
  assert.equal(JSON.stringify(first).includes("correctAnswer"), false);
  ids.add(first.quizId);

  await assert.rejects(
    () =>
      quiz.createQuiz(freeUser, "free", {
        topic: "OOP",
        difficulty: "easy",
        questionCount: 5,
        timeLimit: 5,
      }),
    /in progress/i,
  );

  const restored = await quiz.getQuiz(freeUser, first.quizId);
  assert.equal(restored.quizId, first.quizId);
  assert.equal(restored.status, "in_progress");
  assert.equal(JSON.stringify(restored).includes("correctAnswer"), false);

  await assert.rejects(() => quiz.getQuiz(other, first.quizId), /not found/i);
  await assert.rejects(
    () => quiz.submitQuiz(other, first.quizId, {}),
    /not found/i,
  );

  const answers = {};
  for (const question of first.questions) {
    answers[question.id] = { code: "print('hello')" };
  }

  const result = await quiz.submitQuiz(freeUser, first.quizId, {
    ...answers,
    score: 999,
    percentage: 100,
  });
  assert.equal(result.status, "completed");
  assert.equal(result.total, 5);
  assert.ok(Array.isArray(result.review));
  assert.equal(result.review[0].type, "coding");

  await assert.rejects(
    () =>
      quiz.createQuiz(freeUser, "free", {
        topic: "DSA",
        difficulty: "mixed",
        questionCount: 5,
        timeLimit: 5,
      }),
    /free quiz has been used/i,
  );

  const overview = await quiz.getOverview(freeUser, "free");
  assert.equal(overview.canCreate, false);
  assert.equal(overview.canCreateQuiz, false);
  assert.equal(overview.quizUsed, true);
  assert.equal(overview.quizCount, 1);
  assert.equal(overview.freeQuizUsed, true);

  const freeHistory = await quiz.getHistory(freeUser, "free");
  assert.equal(freeHistory.limited, true);
  assert.equal(freeHistory.items.length, 1);

  await assert.rejects(() => quiz.getAnalytics(freeUser, "free"), /Pro/);

  const proUser = "user-pro";
  const proStore = createMemoryStore();
  const proQuiz = createQuizService(proStore);
  const hard = await proQuiz.createQuiz(proUser, "pro", {
    topic: "DSA",
    difficulty: "hard",
    questionCount: 10,
    timeLimit: 10,
  });
  assert.equal(hard.difficulty, "hard");
  const hardAnswers = {};
  for (const question of hard.questions) {
    hardAnswers[question.id] = { code: "print('hello')" };
  }
  await proQuiz.submitQuiz(proUser, hard.quizId, hardAnswers);

  const second = await proQuiz.createQuiz(proUser, "pro", {
    topic: "ALL",
    difficulty: "mixed",
    questionCount: 15,
    timeLimit: 15,
  });
  assert.equal(second.questions.length, 15);
  await proQuiz.submitQuiz(proUser, second.quizId, {});

  const history = await proQuiz.getHistory(proUser, "pro");
  assert.equal(history.limited, false);
  assert.equal(history.items.length, 2);

  const analytics = await proQuiz.getAnalytics(proUser, "pro");
  assert.equal(analytics.quizzesCompleted, 2);
  assert.ok(analytics.bestScore >= analytics.averageScore);
  assert.ok(Array.isArray(analytics.topicPerformance));

  const timed = createQuizService(createMemoryStore());
  const t0 = 1_700_000_000_000;
  const timedQuiz = await timed.createQuiz(
    "timer-user",
    "pro",
    { topic: "ALL", difficulty: "mixed", questionCount: 5, timeLimit: 5 },
    t0,
  );
  const late = await timed.submitQuiz(
    "timer-user",
    timedQuiz.quizId,
    { [timedQuiz.questions[0].id]: 0 },
    t0 + 5 * 60 * 1000 + 16_000,
  );
  assert.equal(late.status, "expired");
  assert.ok(typeof late.score === "number");

  const resumed = createQuizService(createMemoryStore());
  const open = await resumed.createQuiz("resume", "pro", {
    topic: "PF",
    subtopic: "loops",
    difficulty: "mixed",
    questionCount: 5,
    timeLimit: 10,
  });
  await resumed.saveProgress("resume", open.quizId, { [open.questions[0].id]: 2 });
  const again = await resumed.getQuiz("resume", open.quizId);
  assert.equal(again.draftAnswers[open.questions[0].id], 2);

  const analyticsEmpty = computeAnalytics([]);
  assert.equal(analyticsEmpty.quizzesCompleted, 0);

  const http = require("node:http");
  const app = require("../app");
  await new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      http.get({ hostname: "127.0.0.1", port, path: "/api/quiz/me" }, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          server.close(() => {
            try {
              assert.notEqual(res.statusCode, 404, body);
              assert.equal(res.statusCode, 401);
              const payload = JSON.parse(body);
              assert.equal(payload.success, false);
              assert.match(payload.message, /sign in/i);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        });
      }).on("error", (error) => {
        server.close(() => reject(error));
      });
    });
  });

  console.log("quiz tests: PASS");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
