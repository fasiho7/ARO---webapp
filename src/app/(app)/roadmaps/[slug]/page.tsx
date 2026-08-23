import { notFound } from "next/navigation";
import { PathExperience } from "@/components/paths/PathExperience";
import { CareerRoadmapView } from "@/components/roadmaps/CareerRoadmapView";
import { getLearningPath } from "@/data/paths";
import { getCareer } from "@/data/roadmaps";

type CareerPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CareerPageProps) {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (path) {
    return {
      title: `${path.title} roadmap`,
      description: path.shortDescription,
    };
  }
  const career = getCareer(slug);
  if (!career) {
    return { title: "Roadmap" };
  }
  return {
    title: `${career.title} roadmap`,
    description: career.shortDescription,
  };
}

export default async function RoadmapDetailPage({ params }: CareerPageProps) {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (path) {
    return <PathExperience path={path} />;
  }

  const career = getCareer(slug);
  if (!career) {
    notFound();
  }

  return <CareerRoadmapView career={career} />;
}
