import { notFound, redirect } from "next/navigation";
import { StageDetailView } from "@/components/roadmaps/StageDetailView";
import { isLearningPathId } from "@/data/paths";
import { getCareer, getStageByParam } from "@/data/roadmaps";

type StagePageProps = {
  params: Promise<{ slug: string; stageId: string }>;
};

export const dynamic = "force-dynamic";

export default async function RoadmapStagePage({ params }: StagePageProps) {
  const { slug, stageId } = await params;
  if (isLearningPathId(slug)) {
    redirect(`/roadmaps/${slug}`);
  }
  const career = getCareer(slug);
  const stage = career ? getStageByParam(career, stageId) : undefined;
  if (!career || !stage) {
    notFound();
  }

  return <StageDetailView career={career} stage={stage} />;
}
