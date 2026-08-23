"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ACCESS_COPY } from "@/lib/access";
import {
  createQuiz,
  fetchQuizOverview,
  isQuizProError,
  QuizApiError,
  type QuizOverview,
} from "@/lib/quizApi";

function recommendedTimer(count: number): number {
  if (count <= 5) return 5;
  if (count <= 10) return 10;
  if (count <= 15) return 15;
  if (count <= 20) return 20;
  return 30;
}

export function QuizCreateForm() {
  const router = useRouter();
  const [overview, setOverview] = useState<QuizOverview | null>(null);
  const [topic, setTopic] = useState("all");
  const [subtopic, setSubtopic] = useState("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("easy");
  const [timeLimit, setTimeLimit] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchQuizOverview()
      .then((me) => {
        if (cancelled) return;
        setOverview(me);
        if (me.activeQuiz) {
          router.replace(`/quiz/${me.activeQuiz.id}`);
          return;
        }
        if (!me.canCreate) {
          return;
        }
        const count = me.allowedCounts.includes(10) ? 10 : me.allowedCounts[0] ?? 5;
        setQuestionCount(count);
        setTimeLimit(recommendedTimer(count));
        setDifficulty(me.allowedDifficulties.includes("mixed") ? "mixed" : "easy");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof QuizApiError ? err.message : "Could not load quiz options.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const selectedTopic = overview?.catalog.topics.find((item) => item.id === topic);
  const subtopics = selectedTopic?.subtopics ?? [];

  const lockedCounts = useMemo(
    () => [5, 10, 15, 20, 30].filter((n) => !overview?.allowedCounts.includes(n)),
    [overview],
  );
  const lockedDiffs = useMemo(
    () =>
      ["easy", "medium", "hard", "mixed"].filter(
        (item) => !overview?.allowedDifficulties.includes(item),
      ),
    [overview],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!overview?.canCreate) {
      router.push("/upgrade");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createQuiz({
        topic,
        subtopic: subtopic === "all" ? "all" : subtopic,
        difficulty,
        questionCount,
        timeLimit,
      });
      if (created.reduced) {
        sessionStorage.setItem(
          "aro-quiz-note",
          `Only ${created.questionCount} questions were available for this selection, so the quiz was shortened.`,
        );
      }
      router.push(`/quiz/${created.quizId}`);
    } catch (err) {
      if (isQuizProError(err)) {
        setError(
          err instanceof QuizApiError ? err.message : ACCESS_COPY.quizLimit,
        );
      } else {
        setError(err instanceof QuizApiError ? err.message : "Could not create the quiz.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="font-mono text-sm text-muted">Loading…</p>;
  }

  if (overview && !overview.canCreate && !overview.activeQuiz) {
    return (
      <Card>
        <p className="font-mono text-[11px] tracking-wide text-gold uppercase">
          Aro Pro
        </p>
        <h1 className="display mt-2 text-2xl">Your free quiz has been used.</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{ACCESS_COPY.quizPro}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href="/upgrade">Unlock more quizzes</Button>
          {overview.latestCompletedId ? (
            <Button href={`/quiz/${overview.latestCompletedId}`} variant="secondary">
              View result
            </Button>
          ) : null}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Coding Assessment"
        title="Configure your coding exam."
        description="Select a topic, problem count, and time limit. Solve real programming challenges directly inside Aro's code editor."
      />
      <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
        {error ? (
          <p className="rounded-[2px] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <fieldset>
          <legend className="mb-2 font-mono text-[11px] tracking-wide text-muted uppercase">
            Coding Topic
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {overview?.catalog.topics.map((item) => (
              <Choice
                key={item.id}
                name="topic"
                checked={topic === item.id}
                onChange={() => {
                  setTopic(item.id);
                  setSubtopic("all");
                }}
                label={item.label}
              />
            ))}
          </div>
        </fieldset>

        {subtopics.length > 0 ? (
          <label className="block">
            <span className="mb-2 block font-mono text-[11px] tracking-wide text-muted uppercase">
              Subtopic
            </span>
            <select
              value={subtopic}
              onChange={(event) => setSubtopic(event.target.value)}
              className="w-full rounded-[2px] border border-line bg-surface px-3 py-2.5 text-sm"
            >
              <option value="all">All subtopics</option>
              {subtopics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <fieldset>
          <legend className="mb-2 font-mono text-[11px] tracking-wide text-muted uppercase">
            Number of coding problems
          </legend>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20, 30].map((n) => {
              const locked = lockedCounts.includes(n);
              return (
                <Choice
                  key={n}
                  name="count"
                  checked={questionCount === n}
                  disabled={locked}
                  onChange={() => {
                    setQuestionCount(n);
                    setTimeLimit(recommendedTimer(n));
                  }}
                  label={`${n} problems`}
                  badge={locked ? "PRO" : undefined}
                />
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-mono text-[11px] tracking-wide text-muted uppercase">
            Difficulty
          </legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["easy", "Easy"],
                ["medium", "Medium"],
                ["hard", "Hard"],
                ["mixed", "Mixed"],
              ] as const
            ).map(([id, label]) => {
              const locked = lockedDiffs.includes(id);
              return (
                <Choice
                  key={id}
                  name="difficulty"
                  checked={difficulty === id}
                  disabled={locked}
                  onChange={() => setDifficulty(id)}
                  label={label}
                  badge={locked ? "PRO" : undefined}
                />
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-mono text-[11px] tracking-wide text-muted uppercase">
            Time Limit
          </legend>
          <p className="mb-2 text-sm text-muted">
            Suggested for {questionCount} problems: {recommendedTimer(questionCount)} minutes.
          </p>
          <div className="flex flex-wrap gap-2">
            {(overview?.allowedTimers ?? [5, 10, 15, 20, 30]).map((n) => (
              <Choice
                key={n}
                name="timer"
                checked={timeLimit === n}
                onChange={() => setTimeLimit(n)}
                label={`${n} min`}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Starting Coding Quiz…" : "Start Coding Quiz"}
          </Button>
          <Button href="/quiz" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function Choice({
  name,
  checked,
  onChange,
  label,
  disabled,
  badge,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <label
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[2px] border px-3 py-2 text-sm ${
        disabled
          ? "cursor-not-allowed opacity-45"
          : checked
            ? "border-gold bg-gold/10 text-ink"
            : "border-line bg-surface text-muted hover:border-gold/40"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      {label}
      {badge ? <Badge tone="gold">{badge}</Badge> : null}
    </label>
  );
}
