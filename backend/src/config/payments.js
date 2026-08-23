function isProductionPayments() {
  const env = (process.env.PAYMENT_ENV || "").trim().toLowerCase();
  if (env === "production" || env === "live") {
    return true;
  }
  if (env === "sandbox" || env === "test") {
    return false;
  }
  return (process.env.NODE_ENV || "development") === "production";
}

function paymentEnv() {
  return isProductionPayments() ? "production" : "sandbox";
}

function clientOrigin() {
  return (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
}

function apiOrigin() {
  const explicit = (process.env.PUBLIC_API_URL || "").trim().replace(/\/$/, "");
  if (explicit) {
    return explicit;
  }
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

function isPlaceholder(value) {
  if (typeof value !== "string") {
    return true;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  if (/^your_/i.test(trimmed)) {
    return true;
  }
  if (/^YOUR_[A-Z0-9_]+$/i.test(trimmed)) {
    return true;
  }
  return false;
}

function configured(value) {
  return Boolean(value) && !isPlaceholder(value);
}

function readEnv(name) {
  const raw = process.env[name];
  if (typeof raw !== "string") {
    return "";
  }
  let value = raw.trim();
  const malformed = /^YOUR_[A-Z0-9_]+=(.+)$/i.exec(value);
  if (malformed) {
    value = malformed[1].trim();
  }
  return value;
}

module.exports = {
  isProductionPayments,
  paymentEnv,
  clientOrigin,
  apiOrigin,
  configured,
  readEnv,
};
