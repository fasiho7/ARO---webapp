import { notFound } from "next/navigation";
import { CodingBreadcrumbs } from "@/components/coding/CodingBreadcrumbs";
import { CodingProblemView } from "@/components/coding/CodingProblemView";
import { Button } from "@/components/ui/Button";
import { getCodingProblem } from "@/data/coding";
import { catalogPublicSamples } from "@/lib/codingCatalogSamples";
import { problemProgressId } from "@/lib/codingProgress";
import { realExamples } from "@/lib/codingUi";

export const dynamic = "force-dynamic";

type ProblemPageProps = {
  params: Promise<{ track: string; topic: string; problem: string }>;
};

export default async function CodingProblemPage({ params }: ProblemPageProps) {
  const { track: trackId, topic: topicSlug, problem: problemSlug } = await params;
  const found = getCodingProblem(trackId, topicSlug, problemSlug);
  if (!found) {
    notFound();
  }

  const problemId = problemProgressId(
    found.track.id,
    found.topic.slug,
    found.problem.slug,
  );
  const localSamples = realExamples(found.problem.examples);
  const freeProblem = found.problem.difficulty === "Easy";
  const sampleCases =
    localSamples.length > 0
      ? localSamples
      : freeProblem
        ? catalogPublicSamples(problemId)
        : [];

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <CodingBreadcrumbs
          items={[
            { label: "Coding", href: "/coding" },
            { label: found.track.shortName, href: `/coding/${found.track.slug}` },
            {
              label: found.topic.title,
              href: `/coding/${found.track.slug}/${found.topic.slug}`,
            },
            { label: found.problem.title },
          ]}
        />
        <Button
          href={`/coding/${found.track.slug}/${found.topic.slug}`}
          variant="secondary"
          size="sm"
          className="mb-6"
        >
          Back to problems
        </Button>
      </div>
      <CodingProblemView
        key={problemId}
        track={found.track}
        topic={found.topic}
        problem={found.problem}
        sampleCases={sampleCases}
      />
    </div>
  );
}
