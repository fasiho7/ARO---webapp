"use client";

import { Button } from "@/components/ui/Button";
import type { DryRunResult, DryRunStep } from "@/lib/codingApi";
import { cn } from "@/lib/cn";

function eventLabel(step: DryRunStep): string {
  if (step.event === "call") {
    return `Call ${step.function ?? "function"}`;
  }
  if (step.event === "return") {
    return `Return ${step.function ?? "function"}`;
  }
  return "Line";
}

export function DryRunPanel({
  source,
  result,
  index,
  preparing,
  status,
  onStart,
  onNext,
  onPrevious,
  onRestart,
  onStop,
}: {
  source: string;
  result: DryRunResult | null;
  index: number;
  preparing: boolean;
  status: string;
  onStart: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onRestart: () => void;
  onStop: () => void;
}) {
  const lines = source.split("\n");
  const steps = result?.steps ?? [];
  const step = steps[index];
  const total = steps.length;
  const locals = step ? Object.entries(step.locals) : [];
  const complete = Boolean(result && !result.syntaxError && total > 0 && index === total - 1);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
            Dry run
          </p>
          <p className="mt-1 text-sm text-ink">{status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" disabled={preparing} onClick={onStart}>
            Start
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={preparing || !step || index <= 0}
            onClick={onPrevious}
          >
            Previous Step
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={preparing || !step || index >= total - 1}
            onClick={onNext}
          >
            Next Step
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={preparing || !result || total === 0}
            onClick={onRestart}
          >
            Restart
          </Button>
          <Button size="sm" variant="ghost" disabled={preparing} onClick={onStop}>
            Stop
          </Button>
        </div>
      </div>

      {result?.syntaxError ? (
        <p className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          Syntax error
          {result.syntaxError.line ? ` on line ${result.syntaxError.line}` : ""}:{" "}
          {result.syntaxError.message}
        </p>
      ) : null}

      {result?.runtimeError ? (
        <p className="mt-3 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold">
          {result.runtimeError}
        </p>
      ) : null}

      <p className="mt-3 font-mono text-xs text-teal">
        {preparing
          ? "Preparing dry run..."
          : total > 0
            ? `Step ${index + 1} / ${total}${complete ? " · Dry run complete." : ""}`
            : result
              ? "Dry run complete."
              : "Press Start to trace this Python program."}
      </p>
      {step ? (
        <p className="mt-2 rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-sm text-ink">
          Line {step.line}: {lines[step.line - 1]?.trim() || "(empty)"}
        </p>
      ) : null}
      {result?.truncated ? (
        <p className="mt-1 text-xs text-muted">
          Stopped after {total} steps to keep the trace small.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="overflow-hidden rounded-xl border border-line bg-[#1e1e1e]">
          <p className="border-b border-[#2d2d2d] px-3 py-2 font-mono text-[11px] text-muted">
            Current line
            {step ? ` · ${eventLabel(step)} ${step.line}` : ""}
          </p>
          <pre className="max-h-64 overflow-auto p-2 font-mono text-[12px] leading-6">
            {lines.map((line, lineIndex) => {
              const lineNumber = lineIndex + 1;
              const active = step?.line === lineNumber;
              return (
                <div
                  key={lineNumber}
                  className={cn(
                    "flex gap-3 rounded px-2",
                    active && "bg-teal/20 text-ink",
                    !active && "text-[#c9cce0]",
                  )}
                >
                  <span className="w-6 shrink-0 text-right text-[#858585]">
                    {lineNumber}
                  </span>
                  <span className="min-w-0 whitespace-pre-wrap">{line || " "}</span>
                </div>
              );
            })}
          </pre>
        </div>

        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <p className="font-mono text-[11px] text-muted">Variables</p>
          {locals.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No locals at this step.</p>
          ) : (
            <table className="mt-2 w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted">
                  <th className="pb-1 font-medium">Name</th>
                  <th className="pb-1 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {locals.map(([name, value]) => (
                  <tr key={name} className="border-t border-line align-top">
                    <td className="py-1.5 font-mono text-teal">{name}</td>
                    <td className="py-1.5 font-mono text-ink break-all">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {step?.event === "return" && step.returnValue ? (
            <p className="mt-2 text-xs text-muted">
              Returned {step.returnValue}
            </p>
          ) : null}
          <p className="mt-4 font-mono text-[11px] text-muted">Output</p>
          <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap font-mono text-[12px] text-ink">
            {result?.output ? result.output : "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}
