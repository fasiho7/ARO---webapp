import { listCareers, roadmapStats } from "./index";
import { validateRoadmaps } from "./validate";

const result = validateRoadmaps(listCareers());
for (const row of roadmapStats) {
  console.log(
    `${row.title}: ${row.stages} stages, ${row.topics} topics, ${row.projects} projects, ${row.milestones} milestones`,
  );
}
if (!result.ok) {
  for (const issue of result.issues) {
    console.error(`[${issue.careerId ?? "global"}] ${issue.message}`);
  }
  process.exit(1);
}
console.log(`OK — ${result.stats.length} careers`);
