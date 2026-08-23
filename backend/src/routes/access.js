const { Router } = require("express");
const attachPlan = require("../middleware/attachPlan");
const { HttpError } = require("../utils/httpError");
const { checkAccess, entitlements } = require("../services/accessControl");

const accessRouter = Router();

accessRouter.get("/me", attachPlan, (req, res) => {
  res.json({
    success: true,
    ...entitlements(req.plan),
  });
});

accessRouter.post("/check", attachPlan, (req, res, next) => {
  try {
    const feature = req.body?.feature;
    if (typeof feature !== "string" || feature.trim().length === 0) {
      throw new HttpError(400, "Feature is required.");
    }
    const result = checkAccess({
      plan: req.plan,
      feature: feature.trim(),
      problemId: req.body?.problemId,
      difficulty: req.body?.difficulty,
    });
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = accessRouter;
