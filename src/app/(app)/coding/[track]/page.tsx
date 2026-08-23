import { notFound } from "next/navigation";
import { CodingBreadcrumbs } from "@/components/coding/CodingBreadcrumbs";
import { TopicGrid } from "@/components/coding/TopicGrid";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTrack, isTrackId } from "@/data/coding";

type TrackPageProps = {
  params: Promise<{ track: string }>;
};

export default async function CodingTrackPage({ params }: TrackPageProps) {
  const { track: trackId } = await params;
  if (!isTrackId(trackId)) {
    notFound();
  }
  const track = getTrack(trackId);
  if (!track) {
    notFound();
  }

  return (
    <div>
      <CodingBreadcrumbs
        items={[
          { label: "Coding", href: "/coding" },
          { label: track.shortName },
        ]}
      />
      <PageHeader
        title={track.title}
        description={track.description}
        actions={
          <Button href="/coding" variant="secondary" size="sm">
            Back to Coding
          </Button>
        }
      />
      <TopicGrid track={track} />
    </div>
  );
}
