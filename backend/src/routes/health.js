const { Router } = require("express");
const { supabase } = require("../config/supabase");

const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Aro backend is running",
    environment: process.env.NODE_ENV || "development",
  });
});

healthRouter.get("/supabase", async (req, res, next) => {
  try {
    if (!supabase) {
      res.status(503).json({
        success: false,
        message:
          "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env",
      });
      return;
    }

    const { error } = await supabase.auth.getSession();

    if (error) {
      res.status(503).json({
        success: false,
        message: "Supabase connection failed",
      });
      return;
    }

    res.json({
      success: true,
      message: "Supabase connection is working",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = healthRouter;
