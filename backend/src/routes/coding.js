const { Router } = require("express");
const executionGuard = require("../middleware/executionGuard");
const attachPlan = require("../middleware/attachPlan");
const { HttpError } = require("../utils/httpError");
const { outputsMatch } = require("../utils/output");
const { resolveLanguage } = require("../config/languageMap");
const {
  MAX_SOURCE_CHARS,
  MAX_STDIN_CHARS,
} = require("../config/executionLimits");
const { execute, isConfigured } = require("../services/judge0Service");
const {
  extractDryRun,
  wrapPythonSource,
} = require("../services/pythonDryRun");
const {
  PUBLIC_SAMPLE_COUNT,
  getProblemTests,
  getPublicSamples,
  isKnownProblem,
} = require("../data/codingTestCases");
const {
  assertDryRunAccess,
  assertProblemAccess,
} = require("../services/accessControl");

const codingRouter = Router();

function readSource(body) {
  const sourceCode = body?.sourceCode;
  if (typeof sourceCode !== "string" || sourceCode.trim().length === 0) {
    throw new HttpError(400, "Source code cannot be empty.");
  }
  if (sourceCode.length > MAX_SOURCE_CHARS) {
    throw new HttpError(400, "Source code is too large.");
  }
  return sourceCode;
}

function readLanguage(body) {
  const resolved = resolveLanguage(body?.language);
  if (!resolved) {
    throw new HttpError(
      400,
      "Unsupported language. Use C++, C, Python, or Java.",
    );
  }
  return body.language;
}

function readStdin(body) {
  const stdin = body?.stdin ?? "";
  if (typeof stdin !== "string") {
    throw new HttpError(400, "Input must be a string.");
  }
  if (stdin.length > MAX_STDIN_CHARS) {
    throw new HttpError(400, "Custom input is too large.");
  }
  return stdin;
}

function requireJudge0() {
  if (!isConfigured()) {
    throw new HttpError(
      503,
      "Code execution service is temporarily unavailable. Please try again.",
    );
  }
}

function publicRunResult(result) {
  return {
    success: true,
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    compileOutput: result.compileOutput ?? "",
    time: result.time,
    memory: result.memory,
  };
}

function isSampleIndex(index) {
  return index < PUBLIC_SAMPLE_COUNT;
}

function publicSubmitResult({
  status,
  passedTests,
  totalTests,
  time,
  memory,
  compileOutput,
  cases,
}) {
  const payload = {
    success: true,
    status,
    passedTests,
    totalTests,
    time,
    memory,
    cases: Array.isArray(cases) ? cases : [],
  };
  if (status === "compilation_error" && compileOutput) {
    payload.compileOutput = compileOutput;
  }
  return payload;
}

codingRouter.get("/samples", attachPlan, (req, res, next) => {
  try {
    const problemId =
      typeof req.query.problemId === "string" ? req.query.problemId.trim() : "";
    if (!problemId) {
      throw new HttpError(400, "Problem ID is required.");
    }
    if (!isKnownProblem(problemId)) {
      throw new HttpError(404, "Problem not found.");
    }
    assertProblemAccess(req.plan, problemId);
    res.json({
      success: true,
      samples: getPublicSamples(problemId),
    });
  } catch (error) {
    next(error);
  }
});

function gateBodyProblem(required) {
  return (req, _res, next) => {
    try {
      const problemId =
        typeof req.body?.problemId === "string" ? req.body.problemId.trim() : "";
      if (!problemId) {
        if (required) {
          throw new HttpError(400, "Problem ID is required.");
        }
        next();
        return;
      }
      assertProblemAccess(req.plan, problemId);
      next();
    } catch (error) {
      next(error);
    }
  };
}

function gateDryRun(req, _res, next) {
  try {
    assertDryRunAccess(req.plan);
    next();
  } catch (error) {
    next(error);
  }
}

codingRouter.post(
  "/run",
  attachPlan,
  gateBodyProblem(false),
  executionGuard,
  async (req, res, next) => {
  try {
    requireJudge0();
    const problemId =
      typeof req.body?.problemId === "string" ? req.body.problemId.trim() : "";
    if (problemId) {
      assertProblemAccess(req.plan, problemId);
    }
    const language = readLanguage(req.body);
    const sourceCode = readSource(req.body);
    const stdin = readStdin(req.body);
    const result = await execute({ language, sourceCode, stdin });
    res.json(publicRunResult(result));
  } catch (error) {
    next(error);
  }
});

codingRouter.post(
  "/submit",
  attachPlan,
  gateBodyProblem(true),
  executionGuard,
  async (req, res, next) => {
  try {
    requireJudge0();
    const language = readLanguage(req.body);
    const sourceCode = readSource(req.body);
    const problemId = req.body?.problemId;

    if (typeof problemId !== "string" || problemId.trim().length === 0) {
      throw new HttpError(400, "Problem ID is required.");
    }

    const id = problemId.trim();
    assertProblemAccess(req.plan, id);

    const tests = getProblemTests(id);
    if (!tests || tests.length === 0) {
      throw new HttpError(404, "Problem not found.");
    }

    let passedTests = 0;
    let firstFailure = "accepted";
    let maxTime = 0;
    let maxMemory = 0;
    const cases = [];

    for (let index = 0; index < tests.length; index += 1) {
      const test = tests[index];
      const result = await execute({
        language,
        sourceCode,
        stdin: test.input,
      });

      const timeValue = Number.parseFloat(String(result.time ?? "0"));
      const memoryValue = Number(result.memory ?? 0);
      if (Number.isFinite(timeValue)) {
        maxTime = Math.max(maxTime, timeValue);
      }
      if (Number.isFinite(memoryValue)) {
        maxMemory = Math.max(maxMemory, memoryValue);
      }

      if (result.status === "compilation_error") {
        for (let rest = index; rest < tests.length; rest += 1) {
          cases.push({
            index: rest + 1,
            passed: false,
            sample: isSampleIndex(rest),
            status: rest === index ? "compilation_error" : "not_run",
          });
        }
        res.json(
          publicSubmitResult({
            status: "compilation_error",
            passedTests: 0,
            totalTests: tests.length,
            time: result.time,
            memory: result.memory,
            compileOutput: result.compileOutput,
            cases,
          }),
        );
        return;
      }

      const passed =
        result.status === "accepted" &&
        outputsMatch(result.stdout, test.expectedOutput);
      const caseStatus = passed
        ? "accepted"
        : result.status === "accepted"
          ? "wrong_answer"
          : result.status;

      cases.push({
        index: index + 1,
        passed,
        sample: isSampleIndex(index),
        status: caseStatus,
      });

      if (passed) {
        passedTests += 1;
      } else if (firstFailure === "accepted") {
        firstFailure = caseStatus;
      }
    }

    const status =
      passedTests === tests.length ? "accepted" : firstFailure;

    res.json(
      publicSubmitResult({
        status,
        passedTests,
        totalTests: tests.length,
        time: maxTime ? String(maxTime) : null,
        memory: maxMemory || null,
        cases,
      }),
    );
  } catch (error) {
    next(error);
  }
});

codingRouter.post(
  "/dry-run",
  attachPlan,
  gateDryRun,
  executionGuard,
  async (req, res, next) => {
  try {
    requireJudge0();
    const language = readLanguage(req.body);
    const resolved = resolveLanguage(language);
    if (!resolved || resolved.key !== "python") {
      throw new HttpError(
        400,
        "Dry Run currently supports Python only. Switch the language to Python to trace lines and variables. Use Run for C, C++, and Java.",
      );
    }
    const sourceCode = readSource(req.body);
    const stdin = readStdin(req.body);
    const wrapped = wrapPythonSource(sourceCode);
    const result = await execute({
      language: "Python",
      sourceCode: wrapped,
      stdin,
    });
    res.json(extractDryRun(result));
  } catch (error) {
    next(error);
  }
});

module.exports = codingRouter;
