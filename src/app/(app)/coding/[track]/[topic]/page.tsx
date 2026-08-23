import { notFound } from "next/navigation";
import { CodingBreadcrumbs } from "@/components/coding/CodingBreadcrumbs";
import { ProblemList } from "@/components/coding/ProblemList";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTopic } from "@/data/coding";

type TopicPageProps = {
  params: Promise<{ track: string; topic: string }>;
};

export default async function CodingTopicPage({ params }: TopicPageProps) {
  const { track: trackId, topic: topicSlug } = await params;
  const found = getTopic(trackId, topicSlug);
  if (!found) {
    notFound();
  }

  return (
    <div>
      <CodingBreadcrumbs
        items={[
          { label: "Coding", href: "/coding" },
          { label: found.track.shortName, href: `/coding/${found.track.slug}` },
          { label: found.topic.title },
        ]}
      />
      <PageHeader
        title={`${found.topic.title} Problems`}
        description={found.topic.description}
        actions={
          <Button href={`/coding/${found.track.slug}`} variant="secondary" size="sm">
            Back to {found.track.shortName}
          </Button>
        }
      />
      <ProblemList track={found.track} topic={found.topic} />
    </div>
  );
}
