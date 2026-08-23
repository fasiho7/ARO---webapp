const PROVIDERS = {
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant",
  },
};

const MAX_MESSAGE_CHARS = 8000;
const MAX_HISTORY_MESSAGES = 16;
const REQUEST_TIMEOUT_MS = 45000;
const MIN_REQUEST_INTERVAL_MS = 1500;
const MAX_REQUESTS_PER_MINUTE = 12;

function providerName() {
  const value = (process.env.AI_PROVIDER || "openai").trim().toLowerCase();
  return value === "groq" ? "groq" : "openai";
}

function apiKey() {
  const named = process.env.AI_API_KEY?.trim();
  if (named) {
    return named;
  }
  if (providerName() === "groq") {
    return process.env.GROQ_API_KEY?.trim() || "";
  }
  return process.env.OPENAI_API_KEY?.trim() || "";
}

function isConfigured() {
  return apiKey().length > 0;
}

function endpoint() {
  const override = process.env.AI_API_URL?.trim();
  if (override) {
    return override;
  }
  return PROVIDERS[providerName()].url;
}

function model() {
  const override = process.env.AI_MODEL?.trim();
  if (override) {
    return override;
  }
  return PROVIDERS[providerName()].model;
}

module.exports = {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  MAX_REQUESTS_PER_MINUTE,
  MIN_REQUEST_INTERVAL_MS,
  REQUEST_TIMEOUT_MS,
  apiKey,
  endpoint,
  isConfigured,
  model,
  providerName,
};
