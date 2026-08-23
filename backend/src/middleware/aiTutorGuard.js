const {
  MAX_REQUESTS_PER_MINUTE,
  MIN_REQUEST_INTERVAL_MS,
} = require("../config/ai");

const inflight = new Set();
const lastRequestAt = new Map();
const windowHits = new Map();

function clientKey(req) {
  return req.userId || req.ip || req.socket?.remoteAddress || "unknown";
}

function prune(now, hits) {
  return hits.filter((time) => now - time < 60_000);
}

function aiTutorGuard(req, res, next) {
  const key = clientKey(req);
  const now = Date.now();

  if (inflight.has(key)) {
    res.status(429).json({
      success: false,
      message: "Sorry, I couldn't generate a response right now. Please try again.",
    });
    return;
  }

  const previous = lastRequestAt.get(key) ?? 0;
  if (now - previous < MIN_REQUEST_INTERVAL_MS) {
    res.status(429).json({
      success: false,
      message: "Sorry, I couldn't generate a response right now. Please try again.",
    });
    return;
  }

  const hits = prune(now, windowHits.get(key) ?? []);
  if (hits.length >= MAX_REQUESTS_PER_MINUTE) {
    res.status(429).json({
      success: false,
      message: "Sorry, I couldn't generate a response right now. Please try again.",
    });
    return;
  }

  hits.push(now);
  windowHits.set(key, hits);
  lastRequestAt.set(key, now);
  inflight.add(key);

  const release = () => {
    inflight.delete(key);
  };
  res.on("finish", release);
  res.on("close", release);

  next();
}

module.exports = aiTutorGuard;
