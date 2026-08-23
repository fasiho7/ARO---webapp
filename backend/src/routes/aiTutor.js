const { Router } = require("express");
const optionalAiUser = require("../middleware/optionalAiUser");
const attachPlan = require("../middleware/attachPlan");
const aiTutorGuard = require("../middleware/aiTutorGuard");
const { MAX_MESSAGE_CHARS } = require("../config/ai");
const { completeChat, USER_ERROR } = require("../services/aiTutorService");
const { HttpError } = require("../utils/httpError");
const { assertAiTutorAccess } = require("../services/accessControl");

const aiTutorRouter = Router();

aiTutorRouter.post("/", attachPlan, optionalAiUser, aiTutorGuard, async (req, res, next) => {
  try {
    assertAiTutorAccess(req.plan);
    const message = req.body?.message;
    if (typeof message !== "string" || message.trim().length === 0) {
      throw new HttpError(400, "Message cannot be empty.");
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      throw new HttpError(400, "Message is too long.");
    }

    const reply = await completeChat({
      message: message.trim(),
      conversation: req.body?.conversation,
    });

    res.json({
      success: true,
      message: reply,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    console.error("AI tutor route error");
    next(new HttpError(503, USER_ERROR));
  }
});

module.exports = aiTutorRouter;
