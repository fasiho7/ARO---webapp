import { bearerAuthHeaders } from "@/lib/apiAuth";
import { publicEnv } from "@/lib/env";
import { PRO_REQUIRED_CODE } from "@/lib/access";

const UNAVAILABLE =
  "Code execution service is temporarily unavailable. Please try again.";

export type ExecutionStatus =
  | "accepted"
  | "wrong_answer"
  | "compilation_error"
  | "runtime_error"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "system_error";

export type RunResult = {
  success: true;
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  compileOutput: string;
  time: string | number | null;
  memory: number | null;
};

export type SubmitCaseStatus = ExecutionStatus | "not_run";

export type SubmitCaseResult = {
  index: number;
  passed: boolean;
  sample: boolean;
  status: SubmitCaseStatus;
};

export type SubmitResult = {
  success: true;
  status: ExecutionStatus;
  passedTests: number;
  totalTests: number;
  time: string | number | null;
  memory: number | null;
  compileOutput?: string;
  cases?: SubmitCaseResult[];
};

export class CodingApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "CodingApiError";
    this.status = status;
    this.code = code;
  }
}

function apiBase(): string {
  return publicEnv.apiUrl.replace(/\/$/, "");
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(await bearerAuthHeaders()),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CodingApiError(UNAVAILABLE, 0);
  }

  let payload: { success?: boolean; message?: string; code?: string } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new CodingApiError(UNAVAILABLE, response.status);
  }

  if (!response.ok || payload.success === false) {
    throw new CodingApiError(
      typeof payload.message === "string" && payload.message.length > 0
        ? payload.message
        : UNAVAILABLE,
      response.status,
      typeof payload.code === "string" ? payload.code : undefined,
    );
  }

  return payload as T;
}

export function runCode(input: {
  language: string;
  sourceCode: string;
  stdin: string;
  problemId?: string;
}): Promise<RunResult> {
  return postJson<RunResult>("/api/coding/run", input);
}

export function submitCode(input: {
  problemId: string;
  language: string;
  sourceCode: string;
}): Promise<SubmitResult> {
  return postJson<SubmitResult>("/api/coding/submit", input);
}

export type DryRunEvent = "line" | "call" | "return";

export type DryRunStep = {
  line: number;
  event: DryRunEvent;
  locals: Record<string, string>;
  function?: string;
  returnValue?: string;
};

export type DryRunResult = {
  success: true;
  language: "Python";
  steps: DryRunStep[];
  output: string;
  truncated: boolean;
  syntaxError: { message: string; line: number | null } | null;
  runtimeError: string | null;
};

export function dryRunCode(input: {
  language: string;
  sourceCode: string;
  stdin: string;
}): Promise<DryRunResult> {
  return postJson<DryRunResult>("/api/coding/dry-run", input);
}

export type SampleCase = {
  input: string;
  output: string;
};

export function isProRequiredError(error: unknown): boolean {
  return error instanceof CodingApiError && error.code === PRO_REQUIRED_CODE;
}

export async function fetchProblemSamples(
  problemId: string,
): Promise<SampleCase[]> {
  let response: Response;
  try {
    response = await fetch(
      `${apiBase()}/api/coding/samples?problemId=${encodeURIComponent(problemId)}`,
      {
        cache: "no-store",
        credentials: "include",
        headers: await bearerAuthHeaders(),
      },
    );
  } catch {
    return [];
  }

  try {
    const payload = (await response.json()) as {
      success?: boolean;
      samples?: SampleCase[];
    };
    if (!response.ok || payload.success === false || !Array.isArray(payload.samples)) {
      return [];
    }
    return payload.samples.filter(
      (item) =>
        typeof item?.input === "string" && typeof item?.output === "string",
    );
  } catch {
    return [];
  }
}
