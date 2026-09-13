const PROVIDERS = {
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant",
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    model: "meta/llama-3.1-8b-instruct",
  },
};

const MAX_MESSAGE_CHARS = 8000;
const MAX_HISTORY_MESSAGES = 16;
const REQUEST_TIMEOUT_MS = 45000;
const MIN_REQUEST_INTERVAL_MS = 1500;
const MAX_REQUESTS_PER_MINUTE = 12;

function providerName() {
  const value = (process.env.AI_PROVIDER || "openai").trim().toLowerCase();
  if (value === "groq") return "groq";
  if (value === "nvidia") return "nvidia";
  return "openai";
}

function apiKey() {
  const named = process.env.AI_API_KEY?.trim();
  if (named) {
    return named;
  }
  const provider = providerName();
  if (provider === "groq") {
    return process.env.GROQ_API_KEY?.trim() || "";
  }
  if (provider === "nvidia") {
    return process.env.NVIDIA_API_KEY?.trim() || "";
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
