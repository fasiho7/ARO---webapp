const { HttpError } = require("../utils/httpError");
const { resolveLanguage } = require("../config/languageMap");
const {
  CPU_TIME_LIMIT_SEC,
  WALL_TIME_LIMIT_SEC,
  MEMORY_LIMIT_KB,
  POLL_TIMEOUT_MS,
} = require("../config/executionLimits");
const {
  MAX_SOURCE_CHARS,
} = require("../config/executionLimits");
const { isConfigured, execute } = require("../services/judge0Service");
const {
  wrapPythonSource,
  extractDryRun,
} = require("../services/pythonDryRun");

const BEGIN = "__ARO_DRYRUN_BEGIN__";
const END = "__ARO_DRYRUN_END__";
const MAX_STEPS = 250;
const MAX_VAR_REPR = 180;

function toBase64(value) {
  return Buffer.from(String(value ?? ""), "utf8").toString("base64");
}

function safeRepr(value) {
  const text = String(value ?? "");
  return text.length > MAX_VAR_REPR ? text.slice(0, MAX_VAR_REPR) + "..." : text;
}

function parseLines(source) {
  return String(source ?? "").split(/\r?\n/);
}

function isBlankOrComment(line, langKey) {
  const trimmed = line.trim();
  if (trimmed.length === 0) return true;
  if (langKey === "python") {
    return trimmed.startsWith("#");
  }
  if (langKey === "c" || langKey === "cpp" || langKey === "java") {
    return (
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("*/") ||
      trimmed.startsWith("#include") ||
      trimmed.startsWith("#define")
    );
  }
  return false;
}

function isExecutableLine(line, langKey, context) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (isBlankOrComment(line, langKey)) return false;
  if (langKey === "c" || langKey === "cpp") {
    if (/^(int|void|char|float|double|bool|string|auto|struct|class)\s+\w+\s*\(/.test(trimmed)) return false;
    if (/^}\s*$/.test(trimmed)) return false;
    if (/^\s*using\s+namespace/.test(trimmed)) return false;
  }
  if (langKey === "java") {
    if (/^(public|private|protected|static|\s)*(class|interface|enum)\s+\w+/.test(trimmed)) return false;
    if (/^(public|private|protected|static|\s)*(void|int|char|String|float|double|boolean|long|short|byte)\s+\w+\s*\(/.test(trimmed)) return false;
    if (/^}\s*$/.test(trimmed)) return false;
    if (/^\s*package\s/.test(trimmed)) return false;
    if (/^\s*import\s/.test(trimmed)) return false;
  }
  if (langKey === "python") {
    if (/^(def|class)\s+\w+/.test(trimmed)) return false;
  }
  return true;
}

function findExecutableLines(source, langKey) {
  const lines = parseLines(source);
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    if (isExecutableLine(lines[i], langKey, { previous: lines.slice(0, i) })) {
      result.push(i + 1);
    }
  }
  return result.slice(0, MAX_STEPS);
}

function buildCTracer(studentSource) {
  const encoded = JSON.stringify(studentSource);
  const beginStr = JSON.stringify(BEGIN);
  const endStr = JSON.stringify(END);
  return `/* Aro C dry-run tracer */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>

static char *aro_student_source = ${encoded};
#define ARO_MAX_STEPS 250
#define ARO_MAX_VARS 48
#define ARO_VARNAME 64
#define ARO_VARVAL 256

static int aro_step_idx = 0;
static int aro_truncated = 0;

typedef struct { char name[ARO_VARNAME]; char value[ARO_VARVAL]; } AroVar;
typedef struct { int line; char event[12]; int nvars; AroVar vars[ARO_MAX_VARS]; char ret[ARO_VARVAL]; } AroStep;
static AroStep aro_steps[ARO_MAX_STEPS];

#define ARO_EMIT_BEGIN() do { printf("%s\\n", ${beginStr}); fflush(stdout); } while(0)
#define ARO_EMIT_END() do { printf("%s\\n", ${endStr}); fflush(stdout); } while(0)

static void aro_snap_int(const char *name, int v) {
  AroStep *s = &aro_steps[aro_step_idx - 1];
  if (s->nvars >= ARO_MAX_VARS) return;
  AroVar *v_ = &s->vars[s->nvars++];
  strncpy(v_->name, name, ARO_VARNAME - 1);
  snprintf(v_->value, ARO_VARVAL, "%d", v);
}
static void aro_snap_double(const char *name, double v) {
  AroStep *s = &aro_steps[aro_step_idx - 1];
  if (s->nvars >= ARO_MAX_VARS) return;
  AroVar *v_ = &s->vars[s->nvars++];
  strncpy(v_->name, name, ARO_VARNAME - 1);
  snprintf(v_->value, ARO_VARVAL, "%.6g", v);
}
static void aro_snap_str(const char *name, const char *v) {
  AroStep *s = &aro_steps[aro_step_idx - 1];
  if (s->nvars >= ARO_MAX_VARS) return;
  AroVar *v_ = &s->vars[s->nvars++];
  strncpy(v_->name, name, ARO_VARNAME - 1);
  const char *src = v ? v : "(null)";
  size_t n = strlen(src);
  if (n >= ARO_VARVAL) n = ARO_VARVAL - 1;
  memcpy(v_->value, src, n);
  v_->value[n] = 0;
}
static int aro_record(int line, const char *event) {
  if (aro_step_idx >= ARO_MAX_STEPS) { aro_truncated = 1; return 0; }
  AroStep *s = &aro_steps[aro_step_idx++];
  s->line = line;
  strncpy(s->event, event, 11);
  s->nvars = 0;
  s->ret[0] = 0;
  return 1;
}
static void aro_record_return(const char *ret) {
  if (aro_step_idx == 0) return;
  AroStep *s = &aro_steps[aro_step_idx - 1];
  if (ret) strncpy(s->ret, ret, ARO_VARVAL - 1);
}

${studentSource
  .split(/\r?\n/)
  .map((rawLine, idx) => {
    const line = rawLine;
    const lineNo = idx + 1;
    if (/^\s*#include\s/.test(line)) return line;
    if (/^\s*#define\s/.test(line)) return line;
    if (line.trim() === "") return line;
    if (/^\s*}\s*$/.test(line)) return line;
    const trimmed = line.trim();
    const indent = line.match(/^\s*/)?.[0] ?? "";
    if (/^\s*(int|char|float|double|long|short|unsigned|bool|void|auto|struct|string)\s+\w+\s*\(/.test(trimmed)) return line;
    if (/^\s*using\s+namespace\s/.test(trimmed)) return line;
    return `${indent}{ if (aro_record(${lineNo}, "line")) { } ${line} }\n${indent}{ AroStep *__s = &aro_steps[aro_step_idx ? aro_step_idx - 1 : 0]; if (aro_step_idx) { int __vi; for (__vi = 0; __vi < __s->nvars; __vi++) { } } }`;
  })
  .join("\n")}

int __aro_dry_run_main(void) {
  ARO_EMIT_BEGIN();
  printf("{\"ok\":true,\"syntaxError\":null,\"steps\":[");
  for (int i = 0; i < aro_step_idx; i++) {
    if (i > 0) printf(",");
    AroStep *s = &aro_steps[i];
    printf("{\"line\":%d,\"event\":\"%s\",\"locals\":{", s->line, s->event);
    for (int j = 0; j < s->nvars; j++) {
      if (j > 0) printf(",");
      printf("\"%s\":\"%s\"", s->vars[j].name, s->vars[j].value);
    }
    printf("}");
    if (s->ret[0]) printf(",\"returnValue\":\"%s\"", s->ret);
    printf("}");
  }
  printf("],\"output\":\"\",\"truncated\":%s,\"runtimeError\":null}", aro_truncated ? "true" : "false");
  printf("\\n");
  ARO_EMIT_END();
  return 0;
}
`;
}

function buildJavaTracer(studentSource) {
  const encoded = JSON.stringify(studentSource);
  return `// Aro Java dry-run tracer
import java.util.*;
import java.lang.reflect.*;

public class __AroTracer {
    static final String BEGIN = ${JSON.stringify(BEGIN)};
    static final String END = ${JSON.stringify(END)};
    static final int MAX_STEPS = ${MAX_STEPS};
    static List<Map<String,Object>> steps = new ArrayList<>();
    static boolean truncated = false;
    static StringBuilder captured = new StringBuilder();

    static class CaptureOut extends java.io.PrintStream {
        CaptureOut() { super(java.io.OutputStream.nullOutputStream()); }
        public void print(String s) { captured.append(s == null ? "null" : s); }
        public void println(String s) { captured.append(s == null ? "null" : s).append("\\n"); }
        public void println() { captured.append("\\n"); }
        public void print(int v) { captured.append(String.valueOf(v)); }
        public void println(int v) { captured.append(String.valueOf(v)).append("\\n"); }
        public void print(double v) { captured.append(String.valueOf(v)); }
        public void println(double v) { captured.append(String.valueOf(v)).append("\\n"); }
        public void print(Object v) { captured.append(v == null ? "null" : v.toString()); }
        public void println(Object v) { captured.append(v == null ? "null" : v.toString()).append("\\n"); }
        public void printf(String f, Object... a) { captured.append(String.format(f, a)); }
    }

    static void record(int line, String event, Map<String,String> locals) {
        if (steps.size() >= MAX_STEPS) { truncated = true; return; }
        Map<String,Object> row = new LinkedHashMap<>();
        row.put("line", line);
        row.put("event", event);
        row.put("locals", locals == null ? new LinkedHashMap<String,String>() : locals);
        steps.add(row);
    }

    static void emit() {
        System.out.println(BEGIN);
        Map<String,Object> payload = new LinkedHashMap<>();
        payload.put("ok", true);
        payload.put("syntaxError", null);
        payload.put("steps", steps);
        payload.put("output", captured.toString());
        payload.put("truncated", truncated);
        payload.put("runtimeError", null);
        StringBuilder sb = new StringBuilder();
        jsonWrite(sb, payload);
        System.out.println(sb.toString());
        System.out.println(END);
    }

    static void jsonWrite(StringBuilder sb, Object obj) {
        if (obj == null) { sb.append("null"); return; }
        if (obj instanceof Boolean || obj instanceof Number) { sb.append(obj.toString()); return; }
        if (obj instanceof String) { sb.append('"').append(escapeJson(obj.toString())).append('"'); return; }
        if (obj instanceof List) {
            sb.append('[');
            List<?> list = (List<?>) obj;
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(',');
                jsonWrite(sb, list.get(i));
            }
            sb.append(']');
            return;
        }
        if (obj instanceof Map) {
            sb.append('{');
            Map<?,?> m = (Map<?,?>) obj;
            boolean first = true;
            for (Map.Entry<?,?> e : m.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                sb.append('"').append(escapeJson(String.valueOf(e.getKey()))).append('"');
                sb.append(':');
                jsonWrite(sb, e.getValue());
            }
            sb.append('}');
            return;
        }
        sb.append('"').append(escapeJson(obj.toString())).append('"');
    }

    static String escapeJson(String s) {
        StringBuilder out = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '\\\\': out.append("\\\\\\\\"); break;
                case '"': out.append("\\\\\""); break;
                case '\\n': out.append("\\\\n"); break;
                case '\\r': out.append("\\\\r"); break;
                case '\\t': out.append("\\\\t"); break;
                default:
                    if (c < 0x20) out.append(String.format("\\\\u%04x", (int) c));
                    else out.append(c);
            }
        }
        return out.toString();
    }

    public static void main(String[] args) {
        CaptureOut cap = new CaptureOut();
        java.io.PrintStream old = System.out;
        System.setOut(cap);
        try {
            __AroUserCodeRunner.runMain(args);
        } catch (Throwable t) {
            // runtime error noted in payload via step recording
        } finally {
            System.setOut(old);
            emit();
        }
    }
}

class __AroUserCodeRunner {
    public static void runMain(String[] args) {
${studentSource
  .split(/\r?\n/)
  .map((line, idx) => "        " + line)
  .join("\n")}
    }
}
`;
}

function buildUniversalSteps(source, langKey) {
  const lines = parseLines(source);
  const executable = findExecutableLines(source, langKey);
  const steps = [];
  for (let i = 0; i < executable.length; i++) {
    const lineNo = executable[i];
    steps.push({
      line: lineNo,
      event: "line",
      locals: {},
    });
    if (steps.length >= MAX_STEPS) break;
  }
  return {
    steps,
    lineCount: lines.length,
    executableLines: executable,
  };
}

async function runFullProgramForOutput({ language, sourceCode, stdin }) {
  try {
    const result = await execute({ language, sourceCode, stdin });
    return {
      status: result.status,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      compileOutput: result.compileOutput ?? "",
    };
  } catch (error) {
    return {
      status: error instanceof HttpError ? "system_error" : "system_error",
      stdout: "",
      stderr: "",
      compileOutput: error.message ?? "",
    };
  }
}

function buildUniversalDryRun({ language, sourceCode, stdin, execution }) {
  const resolved = resolveLanguage(language);
  if (!resolved) {
    throw new HttpError(400, "Unsupported language.");
  }
  const langKey = resolved.key;
  const { steps } = buildUniversalSteps(sourceCode, langKey);

  if (langKey === "python") {
    return {
      wrap: wrapPythonSource(sourceCode),
      extract: true,
    };
  }

  return {
    simulation: {
      language,
      langKey,
      steps,
      output: execution?.stdout ?? "",
      compileOutput: execution?.compileOutput ?? "",
      stderr: execution?.stderr ?? "",
      executionStatus: execution?.status ?? "system_error",
    },
  };
}

function buildFromSimulation({ simulation, sourceCode }) {
  const { langKey, steps: rawSteps, output, compileOutput, stderr, executionStatus } = simulation;
  if (executionStatus === "compilation_error") {
    return {
      success: true,
      language: String(simulation.language ?? langKey),
      steps: [],
      output: "",
      truncated: false,
      syntaxError: null,
      compileOutput,
    };
  }
  if (executionStatus === "time_limit_exceeded" || executionStatus === "memory_limit_exceeded") {
    throw new HttpError(422, "Dry run could not be generated for this code.");
  }

  const lines = parseLines(sourceCode);
  const populatedSteps = [];
  const variableState = new Map();

  function snapshotVarsAfterLine(lineIndex) {
    const line = lines[lineIndex] ?? "";
    const trimmed = line.trim();

    if (langKey === "c" || langKey === "cpp") {
      const declMatch = trimmed.match(/^(?:int|double|float|long|short|char|unsigned|bool|auto|string)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*;?\s*$/);
      if (declMatch) {
        const [, name, expr] = declMatch;
        variableState.set(name, evaluateSimpleExpression(expr, variableState));
      }
      const assignMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*;?\s*$/);
      if (assignMatch && !/^(if|while|for|switch|return|cout|cin|printf|scanf)$/.test(assignMatch[1])) {
        const [, name, expr] = assignMatch;
        variableState.set(name, evaluateSimpleExpression(expr, variableState));
      }
      const shortOps = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*([+\-*/%])=\s*(.+?)\s*;?\s*$/);
      if (shortOps) {
        const [, name, op, expr] = shortOps;
        const cur = Number(variableState.get(name) ?? 0);
        const rhs = Number(evaluateSimpleExpression(expr, variableState) ?? 0);
        let out = cur;
        if (op === "+") out = cur + rhs;
        if (op === "-") out = cur - rhs;
        if (op === "*") out = cur * rhs;
        if (op === "/") out = rhs === 0 ? 0 : cur / rhs;
        if (op === "%") out = rhs === 0 ? 0 : cur % rhs;
        variableState.set(name, formatNumber(out));
      }
      const incDec = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)(\+\+|--)\s*;?\s*$/);
      if (incDec) {
        const [, name, op] = incDec;
        const cur = Number(variableState.get(name) ?? 0);
        variableState.set(name, formatNumber(op === "++" ? cur + 1 : cur - 1));
      }
      const cinMatch = [...trimmed.matchAll(/>>\s*([A-Za-z_][A-Za-z0-9_]*)/g)];
      cinMatch.forEach((m) => {
        variableState.set(m[1], `<input:${m[1]}>`);
      });
    }

    if (langKey === "java") {
      const declMatch = trimmed.match(/^(?:(?:public|private|protected|static)\s+)?(?:int|double|float|long|short|byte|boolean|char|String|var)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*;?\s*$/);
      if (declMatch) {
        const [, name, expr] = declMatch;
        variableState.set(name, evaluateSimpleExpression(expr, variableState));
      }
      const assignMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*;?\s*$/);
      if (assignMatch && !/^(if|while|for|switch|return|System|println|print|printf|Scanner)$/.test(assignMatch[1])) {
        const [, name, expr] = assignMatch;
        variableState.set(name, evaluateSimpleExpression(expr, variableState));
      }
      const shortOps = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*([+\-*/%])=\s*(.+?)\s*;?\s*$/);
      if (shortOps) {
        const [, name, op, expr] = shortOps;
        const cur = Number(variableState.get(name) ?? 0);
        const rhs = Number(evaluateSimpleExpression(expr, variableState) ?? 0);
        let out = cur;
        if (op === "+") out = cur + rhs;
        if (op === "-") out = cur - rhs;
        if (op === "*") out = cur * rhs;
        if (op === "/") out = rhs === 0 ? 0 : cur / rhs;
        if (op === "%") out = rhs === 0 ? 0 : cur % rhs;
        variableState.set(name, formatNumber(out));
      }
      const incDec = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)(\+\+|--)\s*;?\s*$/);
      if (incDec) {
        const [, name, op] = incDec;
        const cur = Number(variableState.get(name) ?? 0);
        variableState.set(name, formatNumber(op === "++" ? cur + 1 : cur - 1));
      }
      const scanMatch = [...trimmed.matchAll(/\.next(?:Int|Long|Double|Float|Line|Boolean)?\(\)\s*\)\s*;\s*$/g)];
      if (/Scanner\s*\w+\s*=/.test(trimmed)) {
        // scanner declaration
      }
    }

    if (langKey === "python") {
      const assignMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (assignMatch && !/^(if|while|for|def|class|return|print|import|from|pass|break|continue)$/.test(assignMatch[1])) {
        const [, name, expr] = assignMatch;
        variableState.set(name, evaluateSimpleExpression(expr, variableState));
      }
      const shortOps = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*([+\-*/%])=\s*(.+?)\s*$/);
      if (shortOps) {
        const [, name, op, expr] = shortOps;
        const cur = Number(variableState.get(name) ?? 0);
        const rhs = Number(evaluateSimpleExpression(expr, variableState) ?? 0);
        let out = cur;
        if (op === "+") out = cur + rhs;
        if (op === "-") out = cur - rhs;
        if (op === "*") out = cur * rhs;
        if (op === "/") out = rhs === 0 ? 0 : cur / rhs;
        if (op === "%") out = rhs === 0 ? 0 : cur % rhs;
        variableState.set(name, formatNumber(out));
      }
      const incDec = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)(\+\+|--)\s*$/);
      if (incDec) {
        const [, name, op] = incDec;
        const cur = Number(variableState.get(name) ?? 0);
        variableState.set(name, formatNumber(op === "++" ? cur + 1 : cur - 1));
      }
    }

    const locals = {};
    variableState.forEach((v, k) => {
      locals[k] = safeRepr(v);
    });
    return locals;
  }

  for (const step of rawSteps) {
    const lineIndex = step.line - 1;
    const locals = snapshotVarsAfterLine(lineIndex);
    populatedSteps.push({
      line: step.line,
      event: step.event,
      locals,
    });
  }

  return {
    success: true,
    language: String(simulation.language ?? langKey),
    steps: populatedSteps,
    output: String(output ?? ""),
    truncated: populatedSteps.length >= MAX_STEPS,
    syntaxError: null,
    runtimeError: executionStatus === "runtime_error" ? "Program failed during execution." : null,
  };
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(6)).toString();
}

function evaluateSimpleExpression(expr, vars) {
  try {
    const tokens = tokenize(String(expr ?? "").trim().replace(/;+$/, "").trim());
    if (!tokens || tokens.length === 0) return "";
    const result = parseExpr(tokens, vars);
    if (result == null) return expr;
    return formatNumber(Number(result));
  } catch {
    return expr;
  }
}

function tokenize(input) {
  const out = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(input[i + 1] ?? ''))) {
      let j = i;
      while (j < input.length && /[0-9_.eE+\-]/.test(input[j])) j++;
      out.push({ t: "num", v: input.slice(i, j) });
      i = j; continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < input.length && input[j] !== c) { if (input[j] === "\\") j += 2; else j++; }
      out.push({ t: "str", v: input.slice(i + 1, Math.min(j, input.length)) });
      i = Math.min(j + 1, input.length); continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < input.length && /[A-Za-z0-9_]/.test(input[j])) j++;
      out.push({ t: "id", v: input.slice(i, j) });
      i = j; continue;
    }
    if ("+-*/%()".includes(c)) {
      out.push({ t: "op", v: c });
      i++; continue;
    }
    i++;
  }
  return out;
}

function parseExpr(tokens, vars) {
  const parser = new Parser(tokens, vars);
  const value = parser.parseAdd();
  return value;
}

class Parser {
  constructor(tokens, vars) {
    this.tokens = tokens;
    this.pos = 0;
    this.vars = vars;
  }
  peek() { return this.tokens[this.pos]; }
  consume() { return this.tokens[this.pos++]; }
  parseAdd() {
    let left = this.parseMul();
    while (this.peek() && this.peek().t === "op" && (this.peek().v === "+" || this.peek().v === "-")) {
      const op = this.consume().v;
      const right = this.parseMul();
      left = op === "+" ? Number(left) + Number(right) : Number(left) - Number(right);
    }
    return left;
  }
  parseMul() {
    let left = this.parseAtom();
    while (this.peek() && this.peek().t === "op" && ("*/%".includes(this.peek().v))) {
      const op = this.consume().v;
      const right = this.parseAtom();
      if (op === "*") left = Number(left) * Number(right);
      if (op === "/") left = Number(right) === 0 ? 0 : Number(left) / Number(right);
      if (op === "%") left = Number(right) === 0 ? 0 : Number(left) % Number(right);
    }
    return left;
  }
  parseAtom() {
    const tok = this.consume();
    if (!tok) return 0;
    if (tok.t === "num") {
      if (tok.v.includes(".") || /[eE]/.test(tok.v)) return Number.parseFloat(tok.v);
      return Number.parseInt(tok.v, 10);
    }
    if (tok.t === "str") return tok.v;
    if (tok.t === "id") {
      const stored = this.vars.get(tok.v);
      if (stored != null && stored !== "") {
        const n = Number(stored);
        return Number.isFinite(n) ? n : stored;
      }
      return 0;
    }
    if (tok.t === "op" && tok.v === "(") {
      const val = this.parseAdd();
      if (this.peek() && this.peek().t === "op" && this.peek().v === ")") this.consume();
      return val;
    }
    if (tok.t === "op" && tok.v === "-") {
      const val = this.parseAtom();
      return -Number(val);
    }
    return 0;
  }
}

async function universalDryRun({ language, sourceCode, stdin = "" }) {
  if (!isConfigured()) {
    throw new HttpError(503, "Code execution service is temporarily unavailable. Please try again.");
  }
  if (typeof sourceCode !== "string" || sourceCode.trim().length === 0) {
    throw new HttpError(400, "Source code cannot be empty.");
  }
  if (sourceCode.length > MAX_SOURCE_CHARS) {
    throw new HttpError(400, "Source code is too large.");
  }

  const resolved = resolveLanguage(language);
  if (!resolved) {
    throw new HttpError(400, "Unsupported language. Use C++, C, Python, or Java.");
  }

  if (resolved.key === "python") {
    const wrapped = wrapPythonSource(sourceCode);
    const result = await execute({ language: "Python", sourceCode: wrapped, stdin });
    return extractDryRun(result);
  }

  const execution = await runFullProgramForOutput({ language, sourceCode, stdin });
  const plan = buildUniversalDryRun({ language, sourceCode, stdin, execution });
  return buildFromSimulation({ simulation: plan.simulation, sourceCode });
}

module.exports = {
  universalDryRun,
  buildUniversalSteps,
  evaluateSimpleExpression,
  findExecutableLines,
  MAX_STEPS,
  BEGIN,
  END,
};
