const { createQuizService } = require("../services/quizService");
const { HttpError } = require("../utils/httpError");

const quizService = createQuizService();

async function blockActiveQuizTutor(req, _res, next) {
  try {
    if (req.userId && (await quizService.hasActiveQuiz(req.userId))) {
      next(
        new HttpError(
          409,
          "AI Tutor is unavailable while a coding quiz is in progress. Submit or let the quiz expire before continuing.",
          "QUIZ_IN_PROGRESS",
        ),
      );
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = blockActiveQuizTutor;
