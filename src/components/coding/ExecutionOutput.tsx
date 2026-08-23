"use client";

import { Card } from "@/components/ui/Card";
import type {
  ExecutionStatus,
  RunResult,
  SubmitCaseResult,
  SubmitCaseStatus,
  SubmitResult,
} from "@/lib/codingApi";
import { cn } from "@/lib/cn";

const STATUS_LABEL: Record<ExecutionStatus, string> = {
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  compilation_error: "Compilation Error",
  runtime_error: "Runtime Error",
  time_limit_exceeded: "Time Limit Exceeded",
  memory_limit_exceeded: "Memory Limit Exceeded",
  system_error: "System Error",
};

const CASE_STATUS_LABEL: Record<SubmitCaseStatus, string> = {
  ...STATUS_LABEL,
  accepted: "Passed",
  not_run: "Not run",
};

const STATUS_CLASS: Record<ExecutionStatus, string> = {
  accepted: "border-teal/40 bg-teal/10 text-teal",
  wrong_answer: "border-danger/40 bg-danger/10 text-danger",
  compilation_error: "border-gold/40 bg-gold/10 text-gold",
  runtime_error: "border-danger/40 bg-danger/10 text-danger",
  time_limit_exceeded: "border-gold/40 bg-gold/10 text-gold",
  memory_limit_exceeded: "border-gold/40 bg-gold/10 text-gold",
  system_error: "border-danger/40 bg-danger/10 text-danger",
};

export type ExecutionView =
  | { kind: "idle" }
  | { kind: "running"; mode: "run" | "submit" }
  | { kind: "run"; result: RunResult }
  | { kind: "submit"; result: SubmitResult }
  | { kind: "error"; message: string };

function formatMemory(memory: number | null | undefined): string | null {
  if (memory == null || Number.isNaN(Number(memory))) {
    return null;
  }
  return `${memory} KB`;
}

function formatTime(time: string | number | null | undefined): string | null {
  if (time == null || time === "") {
    return null;
  }
  return `${time}s`;
}

function SubmitCaseList({ cases }: { cases?: SubmitCaseResult[] }) {
  if (!cases || cases.length === 0) {
    return null;
  }

  return (
    <ul className="mt-3 space-y-1.5">
      {cases.map((item) => (
        <li
          key={item.index}
          className="flex items-center justify-between gap-3 rounded-lg border border-[#2d2d2d] px-2.5 py-1.5 text-xs"
        >
          <span className="text-[#d4d4d4]">
            {item.sample ? "Sample" : "Test Case"} {item.index}
          </span>
          <span
            className={cn(
              "font-medium",
              item.passed ? "text-teal" : "text-danger",
              item.status === "not_run" && "text-muted",
            )}
          >
            {CASE_STATUS_LABEL[item.status] ?? (item.passed ? "Passed" : "Failed")}
          </span>
        </li>
      ))}
    </ul>
  );
}

function OutputBlock({
  label,
  value,
  showEmpty = false,
}: {
  label: string;
  value: string;
  showEmpty?: boolean;
}) {
  if (!value && !showEmpty) {
    return null;
  }
  return (
    <div className="mt-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[13px] leading-6 text-[#d4d4d4]">
        {value || "(no output)"}
      </pre>
    </div>
  );
}

export function ExecutionOutput({
  view,
  embedded = false,
}: {
  view: ExecutionView;
  embedded?: boolean;
}) {
  const body = (() => {
    if (view.kind === "idle") {
      return (
        <p className="text-sm text-muted">Run your code to see the output...</p>
      );
    }

    if (view.kind === "running") {
      return (
        <p className="text-sm text-gold">
          {view.mode === "submit" ? "Submitting..." : "Running..."}
        </p>
      );
    }

    if (view.kind === "error") {
      return <p className="text-sm text-danger">{view.message}</p>;
    }

    const status = view.result.status;
    const time = formatTime(view.result.time);
    const memory = formatMemory(view.result.memory);

    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold",
              STATUS_CLASS[status] ?? STATUS_CLASS.system_error,
            )}
          >
            {view.kind === "run" && status === "accepted"
              ? "Ran successfully"
              : (STATUS_LABEL[status] ?? "System Error")}
          </span>
          <p className="text-xs text-muted">
            {[time ? `Time ${time}` : null, memory ? `Memory ${memory}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {view.kind === "submit" ? (
          <div className="mt-3">
            <p className="text-sm">
              {view.result.passedTests}/{view.result.totalTests} test cases passed
            </p>
            <SubmitCaseList cases={view.result.cases} />
          </div>
        ) : null}

        {view.kind === "run" ? (
          <>
            <OutputBlock
              label="Output"
              value={view.result.stdout}
              showEmpty={status === "accepted"}
            />
            <OutputBlock label="Stderr" value={view.result.stderr} />
            <OutputBlock label="Compilation" value={view.result.compileOutput} />
          </>
        ) : (
          <OutputBlock
            label="Compilation"
            value={view.result.compileOutput ?? ""}
          />
        )}
      </div>
    );
  })();

  if (embedded) {
    return <div className="h-full overflow-auto p-3">{body}</div>;
  }

  return <Card>{body}</Card>;
}
