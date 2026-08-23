import { notFound, redirect } from "next/navigation";
import { TopicDetailView } from "@/components/roadmaps/TopicDetailView";
import { isLearningPathId } from "@/data/paths";
import { getCareer, getStageByParam, getTopic } from "@/data/roadmaps";

type TopicPageProps = {
  params: Promise<{ slug: string; stageId: string; topicId: string }>;
};

export const dynamic = "force-dynamic";

export default async function RoadmapTopicPage({ params }: TopicPageProps) {
  const { slug, stageId, topicId } = await params;
  if (isLearningPathId(slug)) {
    redirect(`/roadmaps/${slug}#${topicId}`);
  }
  const career = getCareer(slug);
  const stage = career ? getStageByParam(career, stageId) : undefined;
  const found = career ? getTopic(career, topicId) : undefined;
  if (!career || !stage || !found || found.stage.id !== stage.id) {
    notFound();
  }

  return (
    <TopicDetailView career={career} stage={stage} topic={found.topic} />
  );
}
