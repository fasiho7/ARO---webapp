const { Router } = require("express");
const attachPlan = require("../middleware/attachPlan");
const requireAuth = require("../middleware/requireAuth");
const { createQuizService } = require("../services/quizService");

const quizRouter = Router();
const quizService = createQuizService();
const withAuth = [attachPlan, requireAuth];

quizRouter.get("/me", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.getOverview(req.userId, req.plan);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

quizRouter.get("/catalog", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.getOverview(req.userId, req.plan);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

quizRouter.get("/history", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.getHistory(req.userId, req.plan);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

quizRouter.get("/analytics", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.getAnalytics(req.userId, req.plan);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

quizRouter.post("/create", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.createQuiz(req.userId, req.plan, req.body ?? {});
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

quizRouter.get("/:id", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.getQuiz(req.userId, req.params.id);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

quizRouter.post("/:id/progress", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.saveProgress(
      req.userId,
      req.params.id,
      req.body?.answers,
    );
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

quizRouter.post("/:id/run-code", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.runQuizCode(
      req.userId,
      req.params.id,
      req.body?.questionId,
      req.body?.sourceCode,
      req.body?.language,
      req.body?.stdin ?? "",
    );
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

quizRouter.post("/:id/integrity", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.recordIntegrityEvents(
      req.userId,
      req.params.id,
      req.body?.events ?? [],
    );
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

quizRouter.post("/:id/submit", ...withAuth, async (req, res, next) => {
  try {
    const payload = await quizService.submitQuiz(
      req.userId,
      req.params.id,
      req.body?.answers,
    );
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

module.exports = quizRouter;
