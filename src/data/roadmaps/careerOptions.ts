export const careerOptions = [
  { slug: "frontend-developer", title: "Frontend Developer" },
  { slug: "backend-developer", title: "Backend Developer" },
  { slug: "fullstack-developer", title: "Full-Stack Developer" },
  { slug: "mobile-app-developer", title: "Mobile App Developer" },
  { slug: "ai-ml-engineer", title: "AI / ML Engineer" },
  { slug: "data-scientist", title: "Data Scientist" },
  { slug: "data-analyst", title: "Data Analyst" },
  { slug: "cybersecurity-engineer", title: "Cybersecurity Engineer" },
  { slug: "devops-cloud-engineer", title: "DevOps & Cloud Engineer" },
  { slug: "data-engineer", title: "Data Engineer" },
  { slug: "software-engineer", title: "Software Engineer" },
  { slug: "qa-engineer", title: "QA Engineer" },
] as const;

export function careerTitleForSlug(slug: string | null | undefined): string | null {
  if (!slug) {
    return null;
  }
  return careerOptions.find((item) => item.slug === slug)?.title ?? slug;
}
