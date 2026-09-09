/**
 * requireAdminBearerSecret — validates Authorization: Bearer against BILLING_ADMIN_SECRET.
 * Used by the Express admin router when called from the Next.js server proxy.
 * Never trust client-side cookies here; the Next.js layer validates the httpOnly cookie first.
 */

const { timingSafeEqual } = require("node:crypto");
const { HttpError } = require("../utils/httpError");

function readBearerToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return "";
}

function secureEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

function configuredSecret() {
  const secret = (process.env.BILLING_ADMIN_SECRET || "").trim();
  if (!secret) return "";
  return secret;
}

function requireAdminBearerSecret(req, _res, next) {
  const token = readBearerToken(req);
  const secret = configuredSecret();

  if (!secret) {
    return next(new HttpError(503, "Admin access is not configured.", "ADMIN_NOT_CONFIGURED"));
  }

  if (!token || !secureEqual(token, secret)) {
    return next(new HttpError(403, "Forbidden. Admin credentials required.", "ADMIN_FORBIDDEN"));
  }

  next();
}

module.exports = requireAdminBearerSecret;
