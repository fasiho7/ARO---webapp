const { MIN_REQUEST_INTERVAL_MS } = require("../config/executionLimits");

const inflight = new Set();
const lastRequestAt = new Map();

function clientKey(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function executionGuard(req, res, next) {
  const key = clientKey(req);

  if (inflight.has(key)) {
    res.status(429).json({
      success: false,
      message: "A submission is already running. Please wait.",
    });
    return;
  }

  const previous = lastRequestAt.get(key) ?? 0;
  if (Date.now() - previous < MIN_REQUEST_INTERVAL_MS) {
    res.status(429).json({
      success: false,
      message: "Please wait a moment before running code again.",
    });
    return;
  }

  inflight.add(key);
  lastRequestAt.set(key, Date.now());

  const release = () => {
    inflight.delete(key);
  };
  res.on("finish", release);
  res.on("close", release);

  next();
}

module.exports = executionGuard;
