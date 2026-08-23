"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, difficultyTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import type { Problem } from "@/data/mock/types";

type RunState = "idle" | "running" | "done";

export function ProblemWorkspace({ problem }: { problem: Problem }) {
  const languages = Object.keys(problem.starterCode);
  const defaultLanguage = languages.includes("C++")
    ? "C++"
    : (languages[0] ?? "C++");
  const [language, setLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(problem.starterCode[defaultLanguage] ?? "");
  const [runState, setRunState] = useState<RunState>("idle");
  const [submitted, setSubmitted] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const tests = useMemo(() => {
    if (runState !== "done") {
      return [];
    }
    if (submitted) {
      return [
        { name: "Example 1", passed: true },
        { name: "Example 2", passed: true },
        { name: "Hidden 1", passed: true },
      ];
    }
    return [
      { name: "Example 1", passed: true },
      { name: "Example 2", passed: true },
      { name: "Hidden 1", passed: false },
    ];
  }, [runState, submitted]);

  function changeLanguage(next: string) {
    setLanguage(next);
    setCode(problem.starterCode[next] ?? "");
    setRunState("idle");
    setSubmitted(false);
  }

  function run() {
    setSubmitted(false);
    setRunState("running");
    window.setTimeout(() => setRunState("done"), 700);
  }

  function submit() {
    setRunState("running");
    window.setTimeout(() => {
      setSubmitted(true);
      setRunState("done");
    }, 800);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="display text-xl font-semibold">{problem.title}</h1>
          <Badge tone={difficultyTone(problem.difficulty)}>
            {problem.difficulty}
          </Badge>
          <Badge>{problem.topic}</Badge>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted">{problem.description}</p>

        <h2 className="display mt-6 text-sm font-semibold">Examples</h2>
        <div className="mt-3 space-y-3">
          {problem.examples.map((example) => (
            <div
              key={example.input}
              className="rounded-xl border border-line bg-void p-3 font-mono text-[13px]"
            >
              <p>
                <span className="text-muted">Input: </span>
                {example.input}
              </p>
              <p className="mt-1">
                <span className="text-muted">Output: </span>
                {example.output}
              </p>
              <p className="mt-1 text-muted">{example.explanation}</p>
            </div>
          ))}
        </div>

        <h2 className="display mt-6 text-sm font-semibold">Constraints</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {problem.constraints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-5 text-sm font-medium text-teal"
          onClick={() => setShowHints((value) => !value)}
        >
          {showHints ? "Hide hints" : "Show hints"}
        </button>
        {showHints ? (
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {problem.hints.map((hint) => (
              <li key={hint} className="rounded-lg border border-line px-3 py-2">
                {hint}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        <Card className="flex min-h-[420px] flex-col" padding="none">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <label className="flex items-center gap-2 text-sm text-muted">
              Language
              <select
                value={language}
                onChange={(event) => changeLanguage(event.target.value)}
                className="rounded-lg border border-line bg-surface-2 px-2 py-1 text-ink"
              >
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={run} disabled={runState === "running"}>
                Run
              </Button>
              <Button size="sm" onClick={submit} disabled={runState === "running"}>
                Submit
              </Button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            className="min-h-[320px] flex-1 resize-y bg-void p-4 font-mono text-[13px] leading-7 text-[#c9cce0] outline-none [data-theme=light]:text-ink"
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="display text-sm font-semibold">Test Results</h2>
            <Button variant="ghost" size="sm" onClick={() => setFeedbackOpen(true)}>
              Get AI Feedback
            </Button>
          </div>
          {runState === "idle" ? (
            <p className="mt-3 text-sm text-muted">
              Run or submit to see mock results. Code is not executed.
            </p>
          ) : null}
          {runState === "running" ? (
            <p className="mt-3 text-sm text-muted">Running tests…</p>
          ) : null}
          {runState === "done" ? (
            <div className="mt-4 space-y-3">
              {submitted ? (
                <p className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-teal">
                  All tests passed. Solution submitted (preview only).
                </p>
              ) : null}
              <ul className="space-y-2 text-sm">
                {tests.map((test) => (
                  <li
                    key={test.name}
                    className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
                  >
                    <span>{test.name}</span>
                    <span className={test.passed ? "text-teal" : "text-danger"}>
                      {test.passed ? "Passed" : "Failed"}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-6 text-xs text-muted">
                <span>Runtime 8ms</span>
                <span>Memory 9.2 MB</span>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Modal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="AI Feedback"
      >
        <p className="text-sm leading-6 text-muted">
          This is a mock response. Aro would normally walk through your
          approach, complexity, and a cleaner alternative — without executing
          your code in this preview.
        </p>
        <p className="mt-3 rounded-xl border border-line bg-surface-2 p-3 text-sm leading-6">
          Your hash-map approach is the right idea for {problem.title}. Watch
          for off-by-one indices, and add a comment for the complement lookup
          so future-you can read it quickly.
        </p>
        <Button className="mt-4 w-full" href="/ai-tutor">
          Continue in AI Tutor
        </Button>
      </Modal>
    </div>
  );
}
