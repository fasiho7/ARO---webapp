"use client";

import { useMemo, useState } from "react";
import { RoadmapCard } from "@/components/roadmaps/RoadmapCard";
import { useRoadmapProgress } from "@/components/roadmaps/useRoadmapProgress";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Tabs } from "@/components/ui/Tabs";
import type { CareerSummary } from "@/data/roadmaps";
import type { RoadmapCategory } from "@/data/roadmaps/types";
import { countCompletedForCareer } from "@/lib/roadmapProgress";

const filters = [
  { id: "All", label: "All" },
  { id: "Development", label: "Development" },
  { id: "AI", label: "AI" },
  { id: "Security", label: "Security" },
  { id: "Data", label: "Data" },
  { id: "Cloud", label: "Cloud" },
] as const;

type FilterId = (typeof filters)[number]["id"];

export function RoadmapsExplorer({ careers }: { careers: CareerSummary[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("All");
  const { store } = useRoadmapProgress();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return careers.filter((career) => {
      const matchesFilter =
        filter === "All" || career.category === (filter as RoadmapCategory);
      const haystack = [
        career.title,
        career.shortDescription,
        ...career.coreSkills,
        ...career.tools,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = q.length === 0 || haystack.includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [careers, filter, query]);

  return (
    <div>
      <PageHeader
        title="Choose your career path"
        description="A structured path from fundamentals to internships and junior roles — what to learn, in what order, what to practice, and when you are ready."
      />
      <div className="mb-6 flex flex-col gap-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search careers, skills, or tools"
        />
        <Tabs
          tabs={filters}
          value={filter}
          onChange={(val: string) => setFilter(val as FilterId)}
        />
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="No careers match"
          description="Try another category or a shorter search."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((career) => (
            <RoadmapCard
              key={career.slug}
              career={career}
              completed={countCompletedForCareer(store, career.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}