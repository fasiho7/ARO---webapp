const { HttpError } = require("../utils/httpError");
const { resolveLanguage } = require("../config/languageMap");
const {
  CPU_TIME_LIMIT_SEC,
  WALL_TIME_LIMIT_SEC,
  MEMORY_LIMIT_KB,
  POLL_TIMEOUT_MS,
} = require("../config/executionLimits");

const UNAVAILABLE =
  "Code execution service is temporarily unavailable. Please try again.";

function isConfigured() {
  const url = process.env.JUDGE0_API_URL;
  return typeof url === "string" && url.trim().length > 0;
}

function judge0BaseUrl() {
  return process.env.JUDGE0_API_URL.trim().replace(/\/$/, "");
}

function judge0Headers() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const key = process.env.JUDGE0_API_KEY?.trim();
  const host = process.env.JUDGE0_API_HOST?.trim();
  if (key) {
    headers["X-Auth-Token"] = key;
    headers["X-RapidAPI-Key"] = key;
    if (host) {
      headers["X-RapidAPI-Host"] = host;
    } else {
      try {
        const hostname = new URL(judge0BaseUrl()).hostname;
        if (hostname.includes("rapidapi.com")) {
          headers["X-RapidAPI-Host"] = hostname;
        }
      } catch {
        // URL already validated by isConfigured callers.
      }
    }
  }
  return headers;
}

function toBase64(value) {
  return Buffer.from(String(value ?? ""), "utf8").toString("base64");
}

function fromBase64(value) {
  if (value == null || value === "") {
    return "";
  }
  return Buffer.from(String(value), "base64").toString("utf8");
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function mapJudge0Status(status) {
  const id = status?.id;
  const description = String(status?.description ?? "").toLowerCase();

  if (id === 3) return "accepted";
  if (id === 4) return "wrong_answer";
  if (id === 5) return "time_limit_exceeded";
  if (id === 6) return "compilation_error";
  if (id >= 7 && id <= 12) {
    if (description.includes("memory")) {
      return "memory_limit_exceeded";
    }
    return "runtime_error";
  }
  return "system_error";
}

function normalizeResult(payload) {
  return {
    status: mapJudge0Status(payload.status),
    stdout: fromBase64(payload.stdout),
    stderr: fromBase64(payload.stderr),
    compileOutput: fromBase64(payload.compile_output),
    time: payload.time ?? null,
    memory: payload.memory ?? null,
  };
}

async function judge0Fetch(pathWithQuery, options = {}) {
  if (!isConfigured()) {
    throw new HttpError(503, UNAVAILABLE);
  }

  const url = `${judge0BaseUrl()}${pathWithQuery}`;
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...judge0Headers(),
        ...(options.headers ?? {}),
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new HttpError(503, UNAVAILABLE);
  }

  if (response.status === 401 || response.status === 403) {
    throw new HttpError(503, UNAVAILABLE);
  }
  if (response.status === 429) {
    throw new HttpError(
      503,
      "Code execution service is busy. Please try again.",
    );
  }
  if (!response.ok) {
    throw new HttpError(503, UNAVAILABLE);
  }

  try {
    return await response.json();
  } catch {
    throw new HttpError(503, UNAVAILABLE);
  }
}

async function createSubmission({ sourceCode, languageId, stdin }) {
  return judge0Fetch("/submissions?base64_encoded=true&wait=false", {
    method: "POST",
    body: JSON.stringify({
      source_code: toBase64(sourceCode),
      language_id: languageId,
      stdin: toBase64(stdin ?? ""),
      cpu_time_limit: CPU_TIME_LIMIT_SEC,
      wall_time_limit: WALL_TIME_LIMIT_SEC,
      memory_limit: MEMORY_LIMIT_KB,
    }),
  });
}

async function getSubmission(token) {
  const encoded = encodeURIComponent(token);
  return judge0Fetch(
    `/submissions/${encoded}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`,
  );
}

async function pollSubmission(token) {
  const started = Date.now();
  let delay = 350;

  while (Date.now() - started < POLL_TIMEOUT_MS) {
    const payload = await getSubmission(token);
    const statusId = payload?.status?.id;
    if (typeof statusId === "number" && statusId > 2) {
      return normalizeResult(payload);
    }
    await sleep(delay);
    delay = Math.min(Math.round(delay * 1.25), 1200);
  }

  throw new HttpError(504, "Code execution timed out. Please try again.");
}

async function execute({ language, sourceCode, stdin = "" }) {
  const resolved = resolveLanguage(language);
  if (!resolved) {
    throw new HttpError(
      400,
      "Unsupported language. Use C++, C, Python, or Java.",
    );
  }

  const created = await createSubmission({
    sourceCode,
    languageId: resolved.id,
    stdin,
  });

  const token = created?.token;
  if (!token || typeof token !== "string") {
    throw new HttpError(503, UNAVAILABLE);
  }

  return pollSubmission(token);
}

module.exports = {
  isConfigured,
  execute,
};
