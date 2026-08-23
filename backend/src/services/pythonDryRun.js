const { HttpError } = require("../utils/httpError");

const BEGIN = "__ARO_DRYRUN_BEGIN__";
const END = "__ARO_DRYRUN_END__";
const MAX_STEPS = 250;

function wrapPythonSource(studentSource) {
  const encoded = JSON.stringify(studentSource);
  return `# Aro dry-run tracer (not student code)
import json, sys

STUDENT_SOURCE = ${encoded}
MAX_STEPS = ${MAX_STEPS}
MAX_VAR = 180
SKIP = {"__builtins__", "__name__", "__doc__", "__package__", "__loader__", "__spec__", "__annotations__", "__cached__"}
STUDENT_FILE = "<student>"

steps = []
captured = []
truncated = False
runtime_error = None

class _Capture:
    def write(self, data):
        if data:
            captured.append(str(data))
    def flush(self):
        pass
    def isatty(self):
        return False

def _safe_repr(value):
    try:
        text = repr(value)
    except Exception:
        return "<unrepr>"
    if len(text) > MAX_VAR:
        return text[:MAX_VAR] + "..."
    return text

def _snapshot(frame):
    locals_map = {}
    try:
        items = list(frame.f_locals.items())
    except Exception:
        return locals_map
    for name, value in items:
        if not isinstance(name, str) or name in SKIP or name.startswith("__"):
            continue
        locals_map[name] = _safe_repr(value)
        if len(locals_map) >= 24:
            break
    return locals_map

def _finish_previous(frame):
    if not steps:
        return
    prev = steps[-1]
    if prev.get("_fid") == id(frame) and prev["event"] == "line":
        prev["locals"] = _snapshot(frame)

def _public_steps():
    out = []
    for item in steps:
        row = {
            "line": item["line"],
            "event": item["event"],
            "locals": item["locals"],
        }
        if "function" in item:
            row["function"] = item["function"]
        if "returnValue" in item:
            row["returnValue"] = item["returnValue"]
        out.append(row)
    return out

def _tracer(frame, event, arg):
    global truncated
    if frame.f_code.co_filename != STUDENT_FILE:
        return _tracer
    if event not in ("line", "call", "return"):
        return _tracer
    is_module = frame.f_code.co_name == "<module>"
    if event == "line" or event == "return":
        _finish_previous(frame)
    if is_module and event in ("call", "return"):
        return _tracer
    if len(steps) >= MAX_STEPS:
        truncated = True
        sys.settrace(None)
        return None
    record = {
        "line": int(frame.f_lineno),
        "event": event,
        "locals": _snapshot(frame),
        "_fid": id(frame),
    }
    if event in ("call", "return"):
        record["function"] = frame.f_code.co_name
    if event == "return":
        record["returnValue"] = _safe_repr(arg)
    steps.append(record)
    return _tracer

def _emit(payload):
    sys.__stdout__.write(${JSON.stringify(BEGIN)} + "\\n")
    sys.__stdout__.write(json.dumps(payload) + "\\n")
    sys.__stdout__.write(${JSON.stringify(END)} + "\\n")

try:
    code_obj = compile(STUDENT_SOURCE, STUDENT_FILE, "exec")
except SyntaxError as err:
    _emit({
        "ok": False,
        "syntaxError": {
            "message": (err.msg or "Syntax error").strip(),
            "line": int(err.lineno or 0) or None,
        },
        "steps": [],
        "output": "",
        "truncated": False,
        "runtimeError": None,
    })
    raise SystemExit(0)

old_stdout = sys.stdout
sys.stdout = _Capture()
sys.settrace(_tracer)
try:
    exec(code_obj, {"__name__": "__main__"})
except Exception as err:
    runtime_error = type(err).__name__
    if str(err).strip():
        runtime_error = runtime_error + ": " + str(err).strip().splitlines()[0][:240]
except SystemExit as err:
    code = err.code
    if code not in (0, None):
        runtime_error = "SystemExit: " + str(code)
finally:
    sys.settrace(None)
    sys.stdout = old_stdout

_emit({
    "ok": True,
    "syntaxError": None,
    "steps": _public_steps(),
    "output": "".join(captured),
    "truncated": truncated,
    "runtimeError": runtime_error,
})
`;
}

function parseTraceStdout(stdout) {
  const text = String(stdout ?? "");
  const start = text.indexOf(BEGIN);
  const end = text.indexOf(END);
  if (start < 0 || end < 0 || end <= start) {
    return null;
  }
  const raw = text.slice(start + BEGIN.length, end).trim();
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeSteps(rawSteps) {
  if (!Array.isArray(rawSteps)) {
    return [];
  }
  const steps = [];
  for (const item of rawSteps.slice(0, MAX_STEPS)) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const line = Number(item.line);
    const event = item.event;
    if (!Number.isInteger(line) || line < 1) {
      continue;
    }
    if (event !== "line" && event !== "call" && event !== "return") {
      continue;
    }
    const locals = {};
    if (item.locals && typeof item.locals === "object") {
      for (const [key, value] of Object.entries(item.locals)) {
        if (typeof key === "string" && typeof value === "string") {
          locals[key] = value;
        }
      }
    }
    const step = { line, event, locals };
    if (typeof item.function === "string") {
      step.function = item.function;
    }
    if (typeof item.returnValue === "string") {
      step.returnValue = item.returnValue;
    }
    steps.push(step);
  }
  return steps;
}

function buildDryRunResult(payload) {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(
      422,
      "Dry run could not be generated for this code.",
    );
  }
  if (payload.syntaxError && typeof payload.syntaxError === "object") {
    return {
      success: true,
      language: "Python",
      steps: [],
      output: "",
      truncated: false,
      syntaxError: {
        message:
          typeof payload.syntaxError.message === "string"
            ? payload.syntaxError.message
            : "Syntax error",
        line:
          Number.isInteger(payload.syntaxError.line) && payload.syntaxError.line > 0
            ? payload.syntaxError.line
            : null,
      },
      runtimeError: null,
    };
  }

  const runtimeError =
    typeof payload.runtimeError === "string" && payload.runtimeError.trim()
      ? payload.runtimeError.trim()
      : null;
  const steps = normalizeSteps(payload.steps);

  if (!runtimeError && steps.length === 0) {
    throw new HttpError(
      422,
      "Dry run could not be generated for this code.",
    );
  }

  return {
    success: true,
    language: "Python",
    steps,
    output: typeof payload.output === "string" ? payload.output : "",
    truncated: Boolean(payload.truncated),
    syntaxError: null,
    runtimeError,
  };
}

function extractDryRun(result) {
  if (result.status === "compilation_error") {
    throw new HttpError(
      400,
      result.compileOutput?.trim() ||
        "Dry run could not be generated for this code.",
    );
  }
  if (
    result.status === "time_limit_exceeded" ||
    result.status === "memory_limit_exceeded"
  ) {
    throw new HttpError(
      422,
      "Dry run could not be generated for this code.",
    );
  }

  const parsed =
    parseTraceStdout(result.stdout) || parseTraceStdout(result.stderr);
  if (!parsed) {
    if (result.status === "runtime_error") {
      throw new HttpError(
        400,
        "This code has an error, so a dry run could not be generated.",
      );
    }
    throw new HttpError(
      422,
      "Dry run could not be generated for this code.",
    );
  }
  return buildDryRunResult(parsed);
}

module.exports = {
  MAX_STEPS,
  extractDryRun,
  wrapPythonSource,
};
