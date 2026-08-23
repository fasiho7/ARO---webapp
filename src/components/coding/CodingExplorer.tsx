"use client";

import { useMemo, useState } from "react";
import { ProblemCard } from "@/components/coding/ProblemCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs } from "@/components/ui/Tabs";
import { userStats } from "@/data/mock";
import type { Problem, ProblemDifficulty, ProblemTopic } from "@/data/mock/types";

const difficulties = [
  { id: "All", label: "All" },
  { id: "Easy", label: "Easy" },
  { id: "Medium", label: "Medium" },
  { id: "Hard", label: "Hard" },
] as const;

const topics: Array<"All" | ProblemTopic> = [
  "All",
  "Arrays",
  "Strings",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Recursion",
  "Sorting",
  "Searching",
  "OOP",
];

type DiffId = (typeof difficulties)[number]["id"];

export function CodingExplorer({ problems }: { problems: Problem[] }) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DiffId>("All");
  const [topic, setTopic] = useState<"All" | ProblemTopic>("All");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchesDiff =
        difficulty === "All" ||
        problem.difficulty === (difficulty as ProblemDifficulty);
      const matchesTopic = topic === "All" || problem.topic === topic;
      const matchesQuery =
        q.length === 0 || problem.title.toLowerCase().includes(q);
      return matchesDiff && matchesTopic && matchesQuery;
    });
  }, [difficulty, problems, query, topic]);

  return (
    <div>
      <PageHeader
        title="Practice Coding"
        description="Solve problems the way you would in an interview — this preview does not run code."
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Solved" value={userStats.problemsSolved} />
        <StatCard label="Attempted" value={userStats.problemsAttempted} />
        <StatCard label="Accuracy" value={`${userStats.accuracy}%`} />
        <StatCard label="Current Streak" value={`${userStats.currentStreak} days`} />
      </div>
      <div className="mb-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search problems"
        />
      </div>
      <Tabs
        tabs={difficulties}
        value={difficulty}
        onChange={setDifficulty}
        className="mb-3"
      />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {topics.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTopic(item)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
              topic === item
                ? "border-transparent grad-bg text-white"
                : "border-line text-muted"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="No problems found"
          description="Clear filters or try a different topic."
        />
      ) : (
        <div className="space-y-2">
          {visible.map((problem) => (
            <ProblemCard key={problem.slug} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
}
