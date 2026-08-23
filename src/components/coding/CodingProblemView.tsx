"use client";

import { useEffect, useState } from "react";
import { AccountProgressNote } from "@/components/auth/AccountProgressNote";
import { UpgradePrompt } from "@/components/access/UpgradePrompt";
import { usePlan } from "@/components/access/usePlan";
import { CodeEditor } from "@/components/coding/CodeEditor";
import { DryRunPanel } from "@/components/coding/DryRunPanel";
import { EditorConsole } from "@/components/coding/EditorConsole";
import type { ExecutionView } from "@/components/coding/ExecutionOutput";
import { ProblemStatement } from "@/components/coding/ProblemStatement";
import { useCodingProgress } from "@/components/coding/useCodingProgress";
import { Button } from "@/components/ui/Button";
import type {
  CodingLanguage,
  CodingProblem,
  CodingTopic,
  CodingTrack,
} from "@/data/coding/types";
import {
  CodingApiError,
  dryRunCode,
  fetchProblemSamples,
  isProRequiredError,
  runCode,
  submitCode,
  type DryRunResult,
  type SampleCase,
} from "@/lib/codingApi";
import {
  ACCESS_COPY,
  canAccessDryRun,
  canAccessProblem,
} from "@/lib/access";
import {
  isProblemComplete,
  problemProgressId,
} from "@/lib/codingProgress";

export function CodingProblemView({
  track,
  topic,
  problem,
  sampleCases,
}: {
  track: CodingTrack;
  topic: CodingTopic;
  problem: CodingProblem;
  sampleCases: SampleCase[];
}) {
  const { store, markComplete } = useCodingProgress();
  const { plan } = usePlan();
  const problemAllowed = canAccessProblem(plan, problem.difficulty);
  const dryRunAllowed = canAccessDryRun(plan);
  const id = problemProgressId(track.id, topic.slug, problem.slug);
  const completed = isProblemComplete(store, id);
  const [language, setLanguage] = useState<CodingLanguage>("C++");
  const [codeByLang, setCodeByLang] = useState<
    Record<CodingLanguage, string>
  >(() => ({ ...problem.starterCode }));
  const [samples, setSamples] = useState<SampleCase[]>(sampleCases);
  const [stdin, setStdin] = useState(
    problem.sampleStdin ?? sampleCases[0]?.input ?? "",
  );
  const [view, setView] = useState<ExecutionView>({ kind: "idle" });
  const [consoleTab, setConsoleTab] = useState<"input" | "output">("input");
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dryRunning, setDryRunning] = useState(false);
  const [dryRunOpen, setDryRunOpen] = useState(false);
  const [dryRunSource, setDryRunSource] = useState("");
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [dryRunIndex, setDryRunIndex] = useState(0);
  const [dryRunStatus, setDryRunStatus] = useState(
    "Press Start to trace this Python program.",
  );
  const [showDryRunUpgrade, setShowDryRunUpgrade] = useState(false);

  const code = codeByLang[language];

  useEffect(() => {
    setSamples(sampleCases);
  }, [sampleCases]);

  useEffect(() => {
    if (samples.length > 0) {
      return;
    }
    let cancelled = false;
    void fetchProblemSamples(id).then((fetched) => {
      if (cancelled || fetched.length === 0) {
        return;
      }
      setSamples(fetched);
      setStdin((current) => current || fetched[0]?.input || "");
    });
    return () => {
      cancelled = true;
    };
  }, [id, samples.length]);

  function onCodeChange(next: string) {
    setCodeByLang((previous) => ({ ...previous, [language]: next }));
  }

  async function handleRun() {
    if (busy) {
      return;
    }
    if (!code.trim()) {
      setConsoleTab("output");
      setView({ kind: "error", message: "Write some code before running." });
      return;
    }

    setBusy(true);
    setRunning(true);
    setConsoleTab("output");
    setView({ kind: "running", mode: "run" });
    try {
      const result = await runCode({
        language,
        sourceCode: code,
        stdin,
        problemId: id,
      });
      setView({ kind: "run", result });
    } catch (error) {
      if (isProRequiredError(error)) {
        setView({
          kind: "error",
          message: error instanceof Error ? error.message : ACCESS_COPY.codingProblem,
        });
        return;
      }
      const message =
        error instanceof CodingApiError && error.status !== 0
          ? error.message
          : "Unable to execute code. Please try again.";
      setView({ kind: "error", message });
    } finally {
      setRunning(false);
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (busy) {
      return;
    }
    if (!code.trim()) {
      setConsoleTab("output");
      setView({
        kind: "error",
        message: "Write some code before submitting.",
      });
      return;
    }

    setBusy(true);
    setSubmitting(true);
    setConsoleTab("output");
    setView({ kind: "running", mode: "submit" });
    try {
      const result = await submitCode({
        problemId: id,
        language,
        sourceCode: code,
      });
      setView({ kind: "submit", result });
      if (result.status === "accepted") {
        markComplete(id, true);
      }
    } catch (error) {
      if (isProRequiredError(error)) {
        setView({
          kind: "error",
          message: error instanceof Error ? error.message : ACCESS_COPY.codingProblem,
        });
        return;
      }
      const message =
        error instanceof CodingApiError && error.status !== 0
          ? error.message
          : "Submission failed. Please try again.";
      setView({ kind: "error", message });
    } finally {
      setSubmitting(false);
      setBusy(false);
    }
  }

  function dryRunStatusFor(result: DryRunResult, index: number): string {
    if (result.syntaxError) {
      return result.syntaxError.line
        ? `Syntax error on line ${result.syntaxError.line}.`
        : "This code has a syntax error.";
    }
    const total = result.steps.length;
    if (total === 0) {
      return result.runtimeError || "Dry run could not be generated for this code.";
    }
    if (index >= total - 1) {
      return "Dry run complete.";
    }
    return `Step ${index + 1} / ${total}`;
  }

  async function handleDryRun() {
    if (busy) {
      return;
    }

    if (!dryRunAllowed) {
      setShowDryRunUpgrade(true);
      return;
    }

    setDryRunOpen(true);
    setDryRunSource(code);
    setDryRunResult(null);
    setDryRunIndex(0);

    if (!code.trim()) {
      setDryRunStatus("Write some code before starting a dry run.");
      return;
    }

    if (language !== "Python") {
      setDryRunStatus(
        "Dry Run currently supports Python only. Switch the language to Python to trace lines and variables. Use Run for C, C++, and Java.",
      );
      return;
    }

    setBusy(true);
    setDryRunning(true);
    setDryRunStatus("Preparing dry run...");
    try {
      const result = await dryRunCode({
        language,
        sourceCode: code,
        stdin,
      });
      setDryRunResult(result);
      setDryRunIndex(0);
      setDryRunStatus(dryRunStatusFor(result, 0));
    } catch (error) {
      if (isProRequiredError(error)) {
        setDryRunOpen(false);
        setShowDryRunUpgrade(true);
        setDryRunResult(null);
        return;
      }
      const message =
        error instanceof CodingApiError && error.status !== 0
          ? error.message
          : "Dry run could not be generated for this code.";
      setDryRunStatus(message);
      setDryRunResult(null);
    } finally {
      setDryRunning(false);
      setBusy(false);
    }
  }

  if (!problemAllowed) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h1 className="display text-2xl font-semibold tracking-tight">
            {problem.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {problem.difficulty} · {topic.title}
          </p>
        </div>
        <UpgradePrompt
          title="This problem is on Pro"
          description={ACCESS_COPY.codingProblem}
        />
      </div>
    );
  }

  return (
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(280px,42%)_minmax(0,58%)]">
      <ProblemStatement
        problem={problem}
        topicTitle={topic.title}
        sampleCases={samples}
        solved={completed}
      />

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#2d2d2d] shadow-[0_12px_40px_-24px_rgb(0_0_0/0.8)] max-xl:min-h-0">
          <CodeEditor
            language={language}
            code={code}
            busy={busy}
            running={running}
            submitting={submitting}
            dryRunning={dryRunning}
            onLanguageChange={setLanguage}
            onCodeChange={onCodeChange}
            onRun={() => {
              void handleRun();
            }}
            onSubmit={() => {
              void handleSubmit();
            }}
            onDryRun={() => {
              void handleDryRun();
            }}
          />
          <EditorConsole
            tab={consoleTab}
            onTabChange={setConsoleTab}
            stdin={stdin}
            onStdinChange={setStdin}
            busy={busy}
            view={view}
          />
        </div>
        {showDryRunUpgrade ? (
          <UpgradePrompt
            title="Dry Run"
            description={ACCESS_COPY.dryRun}
          />
        ) : null}
        {dryRunOpen ? (
          <DryRunPanel
            source={dryRunSource || code}
            result={dryRunResult}
            index={dryRunIndex}
            preparing={dryRunning}
            status={dryRunStatus}
            onStart={() => {
              void handleDryRun();
            }}
            onNext={() => {
              if (!dryRunResult) {
                return;
              }
              const next = Math.min(
                dryRunIndex + 1,
                Math.max(dryRunResult.steps.length - 1, 0),
              );
              setDryRunIndex(next);
              setDryRunStatus(dryRunStatusFor(dryRunResult, next));
            }}
            onPrevious={() => {
              if (!dryRunResult) {
                return;
              }
              const next = Math.max(dryRunIndex - 1, 0);
              setDryRunIndex(next);
              setDryRunStatus(dryRunStatusFor(dryRunResult, next));
            }}
            onRestart={() => {
              if (!dryRunResult) {
                return;
              }
              setDryRunIndex(0);
              setDryRunStatus(dryRunStatusFor(dryRunResult, 0));
            }}
            onStop={() => {
              setDryRunOpen(false);
              setDryRunResult(null);
              setDryRunIndex(0);
              setDryRunStatus("Press Start to trace this Python program.");
            }}
          />
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="text-sm text-muted">
            <AccountProgressNote completed={completed} />
          </p>
          {completed ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markComplete(id, false)}
            >
              Mark incomplete
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
