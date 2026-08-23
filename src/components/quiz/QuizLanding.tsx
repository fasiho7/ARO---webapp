"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ACCESS_COPY } from "@/lib/access";
import {
  fetchQuizAnalytics,
  fetchQuizHistory,
  fetchQuizOverview,
  QuizApiError,
  type QuizAnalytics,
  type QuizHistoryItem,
  type QuizOverview,
} from "@/lib/quizApi";

export function QuizLanding() {
  const [overview, setOverview] = useState<QuizOverview | null>(null);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await fetchQuizOverview();
        if (cancelled) {
          return;
        }
        setOverview(me);
        try {
          const hist = await fetchQuizHistory();
          if (!cancelled) {
            setHistory(hist.items);
          }
        } catch {
          if (!cancelled) {
            setHistory([]);
          }
        }
        if (me.plan === "pro") {
          try {
            const stats = await fetchQuizAnalytics();
            if (!cancelled) {
              setAnalytics(stats);
            }
          } catch {
            if (!cancelled) {
              setAnalytics(null);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof QuizApiError
              ? err.message
              : "Could not load quizzes.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="font-mono text-sm text-muted">Loading quizzes…</p>
    );
  }

  if (error || !overview) {
    return (
      <Card>
        <p className="text-sm text-danger">{error ?? "Could not load quizzes."}</p>
      </Card>
    );
  }

  const isPro = overview.plan === "pro";
  const primary =
    overview.activeQuiz ? (
      <Button href={`/quiz/${overview.activeQuiz.id}`}>Continue Coding Exam</Button>
    ) : overview.canCreate ? (
      <Button href="/quiz/new">Start Coding Quiz</Button>
    ) : (
      <Button href="/upgrade">Unlock More Coding Quizzes</Button>
    );

  return (
    <div>
      <PageHeader
        eyebrow="Coding Assessment"
        title="Timed Coding Quizzes & Exams"
        description={
          isPro
            ? "Unlimited coding assessments with detailed history, performance analytics, and test execution."
            : "Free includes 1 timed coding assessment. Upgrade to Pro for unlimited coding exams."
        }
        actions={primary}
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Badge tone={isPro ? "gold" : "muted"}>{isPro ? "PRO" : "FREE"}</Badge>
        <p className="text-sm text-muted">
          {isPro
            ? "Unlimited coding assessments"
            : overview.freeQuizUsed
              ? "Your free coding assessment has been used."
              : overview.activeQuiz
                ? "1 coding exam in progress"
                : "1 coding assessment available"}
        </p>
      </div>

      {overview.activeQuiz ? (
        <Card className="mb-6">
          <p className="font-mono text-[11px] tracking-wide text-gold uppercase">
            In Progress
          </p>
          <p className="mt-2 text-lg font-medium">
            {overview.activeQuiz.topicLabel} · {overview.activeQuiz.difficulty}
          </p>
          <p className="mt-1 text-sm text-muted">
            {overview.activeQuiz.questionCount} coding problems remaining on the clock
          </p>
        </Card>
      ) : null}

      {!isPro && overview.freeQuizUsed ? (
        <Card className="mb-6">
          <p className="font-mono text-[11px] tracking-wide text-gold uppercase">
            Want unlimited quizzes?
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">{ACCESS_COPY.quizPro}</p>
          <Button href="/upgrade" variant="secondary" className="mt-4">
            Upgrade to Pro
          </Button>
        </Card>
      ) : null}

      {isPro && analytics ? (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="display text-2xl">Performance</h2>
            <Badge tone="gold">PRO</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Average score" value={`${Math.round(analytics.averageScore)}%`} />
            <Stat label="Quizzes completed" value={String(analytics.quizzesCompleted)} />
            <Stat label="Best score" value={`${Math.round(analytics.bestScore)}%`} />
            <Stat
              label="Strongest topic"
              value={
                analytics.strongestTopic
                  ? analytics.topicLabels[analytics.strongestTopic.topic] ??
                    analytics.strongestTopic.topic
                  : "—"
              }
            />
          </div>
          {analytics.topicPerformance.length > 0 ? (
            <Card className="mt-4">
              <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
                Topic performance
              </p>
              <ul className="mt-3 space-y-2">
                {analytics.topicPerformance.map((row) => (
                  <li
                    key={row.topic}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span>
                      {analytics.topicLabels[row.topic] ?? row.topic}
                    </span>
                    <span className="font-mono text-gold">
                      {Math.round(row.average)}%
                    </span>
                  </li>
                ))}
              </ul>
              {analytics.weakestTopic ? (
                <p className="mt-3 text-sm text-muted">
                  Weakest topic:{" "}
                  {analytics.topicLabels[analytics.weakestTopic.topic] ??
                    analytics.weakestTopic.topic}
                </p>
              ) : null}
            </Card>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Complete a quiz to see topic performance.
            </p>
          )}
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="display text-2xl">
            {isPro ? "Quiz history" : "Your quiz"}
          </h2>
          {isPro ? <Badge tone="gold">PRO</Badge> : null}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted">No completed quizzes yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/quiz/${item.id}`}
                  className="flex flex-col gap-1 rounded-[2px] border border-line bg-surface px-4 py-3 transition hover:border-gold/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm">
                    {item.topicLabel} · {item.difficulty} · {item.questionCount}{" "}
                    questions
                  </span>
                  <span className="font-mono text-sm text-gold">
                    {item.percentage != null ? `${Math.round(item.percentage)}%` : item.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm">
      <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className="mt-2 text-xl font-medium">{value}</p>
    </Card>
  );
}
