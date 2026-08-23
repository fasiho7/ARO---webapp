const { HttpError } = require("../utils/httpError");

function requireAuth(req, _res, next) {
  if (!req.userId) {
    next(new HttpError(401, "Sign in to continue.", "AUTH_REQUIRED"));
    return;
  }
  next();
}

module.exports = requireAuth;
