const { HttpError } = require("../utils/httpError");
const { resolveLanguage } = require("../config/languageMap");

const UNAVAILABLE =
  "Code execution service is temporarily unavailable. Please try again.";

function isConfigured() {
  const key = process.env.ONLINECOMPILER_API_KEY;
  return typeof key === "string" && key.trim().length > 0;
}

function getOnlineCompilerCompiler(languageKey) {
  const compilerMap = {
    cpp: "g++-15",
    c: "gcc-15",
    python: "python3",
    java: "javac",
  };
  return compilerMap[languageKey] || null;
}

function mapOnlineCompilerStatus(exitCode, output, error) {
  if (exitCode === 0) {
    return "accepted";
  }
  const errorMsg = String(error || "");
  if (errorMsg.includes("error:") || errorMsg.includes("Error:") || output.includes("error:")) {
    return "compilation_error";
  }
  return "runtime_error";
}

async function execute({ language, sourceCode, stdin = "" }) {
  const resolved = resolveLanguage(language);
  if (!resolved) {
    throw new HttpError(
      400,
      "Unsupported language. Use C++, C, Python, or Java.",
    );
  }

  const compiler = getOnlineCompilerCompiler(resolved.key);
  if (!compiler) {
    throw new HttpError(
      400,
      "Unsupported compiler for this language.",
    );
  }

  if (!isConfigured()) {
    throw new HttpError(503, UNAVAILABLE);
  }

  const apiKey = process.env.ONLINECOMPILER_API_KEY;
  const url = "https://api.onlinecompiler.io/api/run-code-sync/";
  
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compiler,
        code: sourceCode,
        input: stdin,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new HttpError(503, UNAVAILABLE);
  }

  if (response.status === 401 || response.status === 403) {
    throw new HttpError(503, "Code execution service error. Please try again.");
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

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new HttpError(503, UNAVAILABLE);
  }

  const exitCode = payload.exit_code ?? -1;
  const status = mapOnlineCompilerStatus(exitCode, payload.output || "", payload.error || "");
  
  return {
    status,
    stdout: payload.output || "",
    stderr: status === "runtime_error" ? (payload.error || "") : "",
    compileOutput: status === "compilation_error" ? (payload.error || "") : "",
    time: payload.time ?? null,
    memory: payload.memory ?? null,
  };
}

module.exports = {
  isConfigured,
  execute,
};