"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldAlert, Maximize2, Minimize2, Play, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CodeEditor } from "@/components/coding/CodeEditor";
import { type CodingLanguage } from "@/data/coding/types";
import {
  fetchQuiz,
  formatClock,
  logQuizIntegrity,
  QuizApiError,
  runQuizCode,
  saveQuizProgress,
  submitQuiz,
  type QuizAnswerValue,
  type QuizReviewItem,
  type QuizSessionPayload,
} from "@/lib/quizApi";

function storageKey(id: string) {
  return `aro-quiz-answers:${id}`;
}

function readLocalAnswers(id: string): Record<string, QuizAnswerValue> {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, QuizAnswerValue>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function QuizSession({ quizId }: { quizId: string }) {
  const [payload, setPayload] = useState<QuizSessionPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Coding execution state for sample runs
  const [runningCode, setRunningCode] = useState(false);
  const [runOutput, setRunOutput] = useState<{
    status: string;
    stdout: string;
    stderr: string;
    compileOutput: string;
  } | null>(null);

  // Integrity telemetry event queue
  const integrityQueueRef = useRef<{ type: string; count: number; timestamp: string }[]>([]);
  const autoSubmitRef = useRef(false);
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  });

  const queueIntegrityEvent = useCallback((type: string) => {
    const existing = integrityQueueRef.current.find((e) => e.type === type);
    if (existing) {
      existing.count += 1;
      existing.timestamp = new Date().toISOString();
    } else {
      integrityQueueRef.current.push({
        type,
        count: 1,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const flushIntegrityEvents = useCallback(async () => {
    if (integrityQueueRef.current.length === 0) return;
    const batch = [...integrityQueueRef.current];
    integrityQueueRef.current = [];
    try {
      await logQuizIntegrity(quizId, batch);
    } catch {
      // Background telemetry sync fail ignored
    }
  }, [quizId]);

  const load = useCallback(async () => {
    const data = await fetchQuiz(quizId);
    setPayload(data);
    if (data.status === "in_progress") {
      const local = readLocalAnswers(quizId);
      const initialAnswers: Record<string, QuizAnswerValue> = {
        ...(data.draftAnswers ?? {}),
        ...local,
      };

      // Set starter code for coding questions if not answered yet
      data.questions?.forEach((q) => {
        if (q.type === "coding" && initialAnswers[q.id] == null) {
          initialAnswers[q.id] = {
            code: q.starterCode ?? "# Write your solution here\n",
            language: q.language ?? "python",
          };
        }
      });

      setAnswers(initialAnswers);
      setRemaining(data.remainingSeconds ?? 0);
    }
  }, [quizId]);

  useEffect(() => {
    const stored = sessionStorage.getItem("aro-quiz-note");
    if (stored) {
      setNote(stored); // eslint-disable-line react-hooks/set-state-in-effect
      sessionStorage.removeItem("aro-quiz-note");
    }
    load().catch((err) => {
      setError(err instanceof QuizApiError ? err.message : "Could not load this quiz.");
    });
  }, [load]);

  // Tab visibility & Fullscreen exit listeners
  useEffect(() => {
    if (payload?.status !== "in_progress") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        queueIntegrityEvent("tab_hidden");
      } else if (document.visibilityState === "visible") {
        queueIntegrityEvent("tab_visible");
      }
    };

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) {
        queueIntegrityEvent("fullscreen_exit");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const flushInterval = setInterval(() => {
      void flushIntegrityEvents();
    }, 5000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearInterval(flushInterval);
    };
  }, [flushIntegrityEvents, queueIntegrityEvent, payload?.status]);

  async function finish(nextAnswers: Record<string, QuizAnswerValue>) {
    setSubmitting(true);
    setConfirmOpen(false);
    await flushIntegrityEvents();
    try {
      const result = await submitQuiz(quizId, nextAnswers);
      localStorage.removeItem(storageKey(quizId));
      setPayload(result);
    } catch (err) {
      setError(err instanceof QuizApiError ? err.message : "Could not submit the quiz.");
      autoSubmitRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (payload?.status !== "in_progress" || !payload.expiresAt) {
      return;
    }
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((new Date(payload.expiresAt).getTime() - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left <= 0 && !autoSubmitRef.current) {
        autoSubmitRef.current = true;
        void finish(answersRef.current);
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [payload?.status, payload?.expiresAt]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (payload?.status !== "in_progress") {
      return;
    }
    const handle = () => {
      localStorage.setItem(storageKey(quizId), JSON.stringify(answersRef.current));
    };
    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, [payload?.status, quizId]);

  useEffect(() => {
    if (payload?.status !== "in_progress") {
      return;
    }
    const timer = window.setTimeout(() => {
      localStorage.setItem(storageKey(quizId), JSON.stringify(answers));
      void saveQuizProgress(quizId, answers).catch(() => undefined);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [answers, payload?.status, quizId]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen().catch(() => undefined);
    }
  }

  async function handleRunCode(questionId: string, code: string, language: string, stdin = "") {
    setRunningCode(true);
    setRunOutput(null);
    try {
      const result = await runQuizCode(quizId, questionId, code, language, stdin);
      setRunOutput({
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
      });
    } catch (err) {
      setRunOutput({
        status: "error",
        stdout: "",
        stderr: err instanceof QuizApiError ? err.message : "Code run failed.",
        compileOutput: "",
      });
    } finally {
      setRunningCode(false);
    }
  }

  if (error && !payload) {
    return (
      <Card>
        <p className="text-sm text-danger">{error}</p>
        <Button href="/quiz" variant="secondary" className="mt-4">
          Back to Quiz
        </Button>
      </Card>
    );
  }

  if (!payload) {
    return <p className="font-mono text-sm text-muted">Loading exam environment…</p>;
  }

  if (payload.status !== "in_progress") {
    return <QuizResultView payload={payload} />;
  }

  const questions = payload.questions ?? [];
  const current = questions[index];
  const unanswered = questions.filter((item) => {
    const val = answers[item.id];
    if (val == null) return true;
    if (item.type === "coding") {
      const codeVal = typeof val === "object" ? val.code : String(val);
      return !codeVal || codeVal.trim().length === 0;
    }
    return false;
  }).length;

  if (!current) {
    return (
      <Card>
        <p className="text-sm text-muted">This quiz has no questions.</p>
      </Card>
    );
  }

  const currentAnsVal = answers[current.id];
  const currentCode =
    typeof currentAnsVal === "object"
      ? currentAnsVal.code
      : typeof currentAnsVal === "string"
        ? currentAnsVal
        : current.starterCode ?? "";
  const currentLang =
    (typeof currentAnsVal === "object" ? currentAnsVal.language : current.language) ?? "python";

  return (
    <div className="pb-8">
      {note ? (
        <p className="mb-4 rounded-[2px] border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
          {note}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-[2px] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {/* Controlled Exam Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[2px] border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-mono text-gold">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 shrink-0 text-gold" />
          <span>🔒 CONTROLLED CODING EXAM MODE — Copy / Paste & AI Tutor Disabled</span>
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 rounded border border-gold/30 bg-void/50 px-2 py-1 hover:bg-gold/20"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="size-3.5" /> Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="size-3.5" /> Enter Fullscreen Exam
            </>
          )}
        </button>
      </div>

      {/* Header with Timer */}
      <div className="sticky top-[72px] z-20 mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line bg-void/90 py-3 backdrop-blur-sm">
        <div>
          <p className="font-mono text-[11px] tracking-wide text-gold uppercase">Exam Mode</p>
          <h1 className="display text-2xl sm:text-3xl">{payload.topicLabel}</h1>
          <p className="mt-1 text-sm capitalize text-muted">{payload.difficulty}</p>
        </div>
        <p
          className={`font-mono text-2xl tabular-nums sm:text-3xl ${
            remaining <= 30 ? "text-danger animate-pulse" : "text-gold"
          }`}
          aria-live="polite"
        >
          {formatClock(remaining)}
        </p>
      </div>

      <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
        Coding problem {index + 1} of {questions.length}
      </p>

      {/* Problem View */}
      <div className="mt-4 grid gap-6 lg:grid-cols-12">
          {/* Problem Statement */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card>
              <h2 className="text-xl font-medium text-ink">{current.title ?? current.question}</h2>
              <div className="mt-3 text-sm leading-6 text-muted whitespace-pre-wrap">
                {current.problemStatement ?? current.question}
              </div>

              {current.sampleCases && current.sampleCases.length > 0 ? (
                <div className="mt-6 border-t border-line pt-4">
                  <p className="font-mono text-xs text-gold uppercase">Sample Cases</p>
                  <div className="mt-3 space-y-3 font-mono text-xs">
                    {current.sampleCases.map((sc, scIdx) => (
                      <div key={scIdx} className="rounded bg-surface p-2.5 border border-line">
                        <p className="text-muted">Input:</p>
                        <pre className="mt-1 text-ink">{sc.input}</pre>
                        <p className="mt-2 text-muted">Expected Output:</p>
                        <pre className="mt-1 text-sage">{sc.output}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>

            {/* Run Output Display */}
            {runOutput ? (
              <Card padding="sm" className="border-gold/30">
                <p className="font-mono text-xs text-gold uppercase flex items-center gap-2">
                  <Play className="size-3.5" /> Sample Run Result ({runOutput.status})
                </p>

                {runOutput.compileOutput ? (
                  <div className="mt-2">
                    <p className="font-mono text-[11px] text-danger">Compilation Output:</p>
                    <pre className="mt-1 rounded bg-[#1e1e1e] p-2 font-mono text-xs text-danger overflow-x-auto">
                      {runOutput.compileOutput}
                    </pre>
                  </div>
                ) : null}

                {runOutput.stdout ? (
                  <div className="mt-2">
                    <p className="font-mono text-[11px] text-muted">Output (stdout):</p>
                    <pre className="mt-1 rounded bg-[#1e1e1e] p-2 font-mono text-xs text-ink overflow-x-auto">
                      {runOutput.stdout}
                    </pre>
                  </div>
                ) : null}

                {runOutput.stderr ? (
                  <div className="mt-2">
                    <p className="font-mono text-[11px] text-danger">Error (stderr):</p>
                    <pre className="mt-1 rounded bg-[#1e1e1e] p-2 font-mono text-xs text-danger overflow-x-auto">
                      {runOutput.stderr}
                    </pre>
                  </div>
                ) : null}
              </Card>
            ) : null}
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-7 flex flex-col min-h-[460px]">
            <CodeEditor
              language={currentLang as CodingLanguage}
              code={currentCode}
              busy={submitting || runningCode}
              running={runningCode}
              submitting={submitting}
              examMode={true}
              onLanguageChange={(lang) =>
                setAnswers((prev) => ({
                  ...prev,
                  [current.id]: { code: currentCode, language: lang },
                }))
              }
              onCodeChange={(code) =>
                setAnswers((prev) => ({
                  ...prev,
                  [current.id]: { code, language: currentLang },
                }))
              }
              onRun={() =>
                void handleRunCode(
                  current.id,
                  currentCode,
                  currentLang,
                  current.sampleCases?.[0]?.input ?? "",
                )
              }
              onSubmit={() => setConfirmOpen(true)}
              onIntegrityEvent={queueIntegrityEvent}
            />
          </div>
        </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          disabled={index === 0}
          onClick={() => {
            setRunOutput(null);
            setIndex((value) => Math.max(0, value - 1));
          }}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={index >= questions.length - 1}
          onClick={() => {
            setRunOutput(null);
            setIndex((value) => Math.min(questions.length - 1, value + 1));
          }}
        >
          Next
        </Button>
        <Button onClick={() => setConfirmOpen(true)} disabled={submitting}>
          Submit Exam
        </Button>
      </div>

      {/* Question Selector Pills */}
      <div className="mt-6 -mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max gap-2 pb-2">
          {questions.map((item, itemIndex) => {
            const val = answers[item.id];
            const answered =
              val != null &&
              typeof val === "object" && val.code.trim().length > 0;
            const currentItem = itemIndex === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setRunOutput(null);
                  setIndex(itemIndex);
                }}
                className={`size-10 shrink-0 rounded-[2px] border font-mono text-xs ${
                  currentItem
                    ? "border-gold bg-gold text-[var(--void)]"
                    : answered
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-line text-muted"
                }`}
                aria-label={`Question ${itemIndex + 1}${answered ? ", answered" : ", unanswered"}`}
              >
                {itemIndex + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <Card className="w-full max-w-md">
            <h3 className="display text-xl">Submit your exam?</h3>
            <p className="mt-2 text-sm text-muted">
              Unanswered questions: {unanswered}
            </p>
            {unanswered > 0 ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                <AlertTriangle className="size-4 shrink-0" /> Some questions are incomplete.
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Continue Exam
              </Button>
              <Button disabled={submitting} onClick={() => void finish(answers)}>
                {submitting ? "Submitting..." : "Submit Exam"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function QuizResultView({ payload }: { payload: QuizSessionPayload }) {
  const review = payload.review ?? [];
  const graded = payload.gradingStatus !== "ungraded";
  const percentage = payload.percentage ?? 0;
  const ring = Math.max(0, Math.min(100, percentage));

  return (
    <div>
      <p className="font-mono text-[11px] tracking-wide text-gold uppercase">
        {payload.status === "expired" ? "Time expired" : "Exam complete"}
      </p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">
        {graded ? "Your Exam Score" : "Exam Submitted"}
      </h1>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        {graded ? (
          <div
            className="grid size-36 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--gold) ${ring}%, rgb(243 236 228 / 0.12) 0)`,
            }}
          >
            <div className="grid size-[7.5rem] place-items-center rounded-full bg-void">
              <span className="font-mono text-2xl text-gold">{Math.round(percentage)}%</span>
            </div>
          </div>
        ) : null}
        <div>
          {graded ? <p className="text-3xl font-medium">{payload.score} / {payload.total}</p> : null}
          <p className="mt-1 text-lg text-muted">{payload.feedback}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="Score" value={graded ? String(payload.score ?? 0) : "Ungraded"} />
        <Fact label="Wrong" value={graded ? String(payload.wrong ?? 0) : "—"} />
        <Fact
          label="Time used"
          value={formatClock(payload.timeUsedSeconds ?? 0)}
        />
        <Fact label="Topic" value={payload.topicLabel} />
        <Fact label="Difficulty" value={payload.difficulty} />
        <Fact label="Questions" value={String(payload.questionCount)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/quiz">Back to Quiz</Button>
        <Button href="/quiz/new" variant="secondary">
          Create another exam
        </Button>
      </div>

      <h2 className="display mt-12 text-2xl">Question Review</h2>
      <div className="mt-4 space-y-4">
        {review.map((item, index) => (
          <ReviewCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm">
      <p className="font-mono text-[11px] tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 capitalize">{value}</p>
    </Card>
  );
}

function ReviewCard({ item, index }: { item: QuizReviewItem; index: number }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">Q{index + 1}</span>
        <Badge tone={item.isCorrect ? "success" : "danger"}>
          {item.isCorrect ? "Passed" : "Failed"}
        </Badge>
        <span className="font-mono text-xs text-muted">(Coding)</span>
      </div>
      <p className="mt-3 text-sm leading-6 sm:text-base font-medium">{item.question}</p>

      <div className="mt-3">
        <p className="font-mono text-xs text-muted">Submitted Code:</p>
        {item.yourCode ? (
          <pre className="mt-1.5 overflow-x-auto rounded border border-[#2d2d2d] bg-[#1e1e1e] p-3 font-mono text-xs text-[#d4d4d4]">
            {item.yourCode}
          </pre>
        ) : (
          <p className="mt-1 text-sm text-muted">No code submitted for this question.</p>
        )}
        {item.totalTests != null ? (
          <p className="mt-2 font-mono text-xs text-muted">
            Test cases passed: {item.passedTests ?? "—"} / {item.totalTests}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
