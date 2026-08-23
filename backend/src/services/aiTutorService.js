const SYSTEM_PROMPT = `You are Aro AI Tutor, a programming and computer science tutor for students and beginners.

Purpose: teach Computer Science and programming clearly.

Behavior:
- Explain concepts in simple language first.
- Prefer short, useful answers over long lectures.
- Give a small example when it helps.
- Explain code when the student pastes code.
- Help debug by asking what they expected vs what happened, then pointing at the likely cause.
- Give hints before full solutions when the student is solving a problem.
- Encourage learning. Do not dump complete assignment answers when a hint would teach more.
- Adapt to the student's question. Avoid unnecessary jargon.

Focus areas: C, C++, Python, Java, OOP, DSA, algorithms, data structures, web development, and core computer science.

When you show code, use a markdown fenced code block with a language tag (cpp, c, python, java, js). Keep code examples short.`;

const {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  REQUEST_TIMEOUT_MS,
  apiKey,
  endpoint,
  isConfigured,
  model,
} = require("../config/ai");
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
    response = await fetch(endpoint(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model(),
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
