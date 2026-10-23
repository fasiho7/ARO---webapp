const SYSTEM_PROMPT = `You are ARO AI Tutor. Help CS students learn Programming Fundamentals, OOP, Data Structures, Algorithms, and coding problem solving. Teach step-by-step using simple English and Roman Urdu when helpful. For coding problems, explain concepts first, give hints before complete solutions, explain errors, and provide dry runs when useful. Do not simply dump the final answer unless the student asks.`;

const {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  REQUEST_TIMEOUT_MS,
} = require("../config/ai");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim() || "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL?.trim() || "";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

function isConfigured() {
  return OPENROUTER_API_KEY.length > 0 && OPENROUTER_MODEL.length > 0;
}
const { HttpError } = require("../utils/httpError");

const USER_ERROR =
  "Sorry, I couldn't generate a response right now. Please try again.";

function clip(text) {
  if (text.length <= MAX_MESSAGE_CHARS) {
    return text;
  }
  return text.slice(0, MAX_MESSAGE_CHARS);
}

function normalizeConversation(conversation) {
  if (!Array.isArray(conversation)) {
    return [];
  }
  const allowed = [];
  for (const item of conversation) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
    const content = typeof item.content === "string" ? item.content.trim() : "";
    if (!role || !content) {
      continue;
    }
    allowed.push({ role, content: clip(content) });
  }
  return allowed.slice(-MAX_HISTORY_MESSAGES);
}

function mapProviderStatus(status) {
  if (status === 401 || status === 403) {
    return new HttpError(503, USER_ERROR);
  }
  if (status === 429) {
    return new HttpError(429, USER_ERROR);
  }
  return new HttpError(503, USER_ERROR);
}

async function completeChat({ message, conversation }) {
  if (!isConfigured()) {
    throw new HttpError(503, USER_ERROR);
  }

  const history = normalizeConversation(conversation);
  const current = clip(message.trim());
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: current },
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aro.app",
        "X-Title": "ARO AI Tutor",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 900,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new HttpError(504, USER_ERROR);
    }
    console.error("AI provider network error");
    throw new HttpError(503, USER_ERROR);
  } finally {
    clearTimeout(timer);
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    console.error("AI provider returned non-JSON");
    throw new HttpError(503, USER_ERROR);
  }

  if (!response.ok) {
    console.error("AI provider HTTP", response.status);
    throw mapProviderStatus(response.status);
  }

  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new HttpError(503, USER_ERROR);
  }

  return text.trim();
}

module.exports = {
  USER_ERROR,
  completeChat,
};
