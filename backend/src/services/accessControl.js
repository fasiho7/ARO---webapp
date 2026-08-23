const { HttpError } = require("../utils/httpError");
const { isKnownProblem } = require("../data/codingTestCases");
const { getProblemDifficulty } = require("../data/codingProblemDifficulty");

const PRO_REQUIRED = "PRO_REQUIRED";

const MESSAGES = {
  dryRun: "Dry Run is included with Pro.",
  aiTutor: "AI Tutor is included with Pro.",
  codingProblem: "Medium and Advanced problems are included with Pro.",
  roadmap: "This roadmap content is included with Pro.",
  quizLimit: "Your free quiz has been used. Upgrade to Pro for unlimited quizzes.",
  quizDifficulty: "Medium and Hard quizzes are included with Pro.",
};

function normalizePlan(value) {
  return value === "pro" ? "pro" : "free";
}

function isPro(plan) {
  return normalizePlan(plan) === "pro";
}

function isFreeProblemDifficulty(difficulty) {
  return difficulty === "Easy" || difficulty === "Beginner";
}

function isFreeRoadmapDifficulty(difficulty) {
  return String(difficulty ?? "").toLowerCase() === "beginner";
}

function entitlements(plan) {
  const pro = isPro(plan);
  return {
    plan: normalizePlan(plan),
    beginnerProblems: true,
    mediumProblems: pro,
    advancedProblems: pro,
    dryRun: pro,
    aiTutor: pro,
    fullRoadmaps: pro,
    unlimitedQuizzes: pro,
    quizHistory: pro,
    quizAnalytics: pro,
  };
}

function assertPro(plan, message) {
  if (isPro(plan)) {
    return;
  }
  throw new HttpError(403, message, PRO_REQUIRED);
}

function assertDryRunAccess(plan) {
  assertPro(plan, MESSAGES.dryRun);
}

function assertAiTutorAccess(plan) {
  assertPro(plan, MESSAGES.aiTutor);
}

function assertProblemAccess(plan, problemId) {
  if (typeof problemId !== "string" || !isKnownProblem(problemId)) {
    throw new HttpError(404, "Problem not found.");
  }
  const difficulty = getProblemDifficulty(problemId);
  if (isFreeProblemDifficulty(difficulty) || isPro(plan)) {
    return;
  }
  throw new HttpError(403, MESSAGES.codingProblem, PRO_REQUIRED);
}

function assertRoadmapAccess(plan, difficulty) {
  if (isFreeRoadmapDifficulty(difficulty) || isPro(plan)) {
    return;
  }
  throw new HttpError(403, MESSAGES.roadmap, PRO_REQUIRED);
}

function checkAccess({ plan, feature, problemId, difficulty }) {
  const current = normalizePlan(plan);
  if (feature === "dryRun") {
    assertDryRunAccess(current);
    return { allowed: true, plan: current };
  }
  if (feature === "aiTutor") {
    assertAiTutorAccess(current);
    return { allowed: true, plan: current };
  }
  if (feature === "codingProblem") {
    assertProblemAccess(current, problemId);
    return { allowed: true, plan: current };
  }
  if (feature === "roadmapTopic" || feature === "roadmapProject") {
    assertRoadmapAccess(current, difficulty);
    return { allowed: true, plan: current };
  }
  throw new HttpError(400, "Unknown access feature.");
}

module.exports = {
  PRO_REQUIRED,
  MESSAGES,
  normalizePlan,
  isPro,
  entitlements,
  assertPro,
  assertDryRunAccess,
  assertAiTutorAccess,
  assertProblemAccess,
  assertRoadmapAccess,
  checkAccess,
};
